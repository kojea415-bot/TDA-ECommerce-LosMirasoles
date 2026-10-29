-- Reference schema for Dietética Los Mirasoles.
-- Exported from the hosted project on 2026-10-29.
-- It does not create auth.users, the storage bucket, or product images.
-- Secrets (anon key, service role, Gmail app password) are not in this file.
-- The 32 catalog products live in the hosted database. Categories and zones are seeded below.

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias (id),
  nombre text not null,
  descripcion text not null default '',
  precio numeric not null check (precio >= 0),
  unidad_venta text not null default 'unidad',
  stock integer not null default 0 check (stock >= 0),
  publicado boolean not null default false,
  sin_tacc boolean not null default false,
  vegano boolean not null default false,
  sin_lactosa boolean not null default false,
  info_nutricional text,
  imagen_path text
);

create table public.zonas_cobertura (
  codigo_postal text primary key,
  costo_envio numeric not null check (costo_envio >= 0)
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'cliente' check (rol in ('cliente', 'administrador'))
);

create table public.pedidos (
  id bigint generated always as identity primary key,
  perfil_id uuid not null references public.perfiles (id),
  estado text not null check (estado in (
    'pendiente_confirmacion', 'recibido', 'en_preparacion',
    'listo_retiro', 'despachado', 'entregado', 'cancelado'
  )),
  resultado_cobro text not null check (resultado_cobro in ('aprobado', 'pendiente')),
  modalidad text not null check (modalidad in ('retiro', 'envio')),
  costo_envio numeric not null default 0 check (costo_envio >= 0),
  total numeric not null check (total >= 0),
  codigo_postal text,
  domicilio text,
  nombre text not null,
  telefono text not null,
  correo text not null,
  mail_ok boolean not null default false,
  creado_en timestamptz not null default now(),
  stock_descontado boolean not null default false
);

create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  producto_id uuid not null references public.productos (id),
  nombre text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0)
);

create table public.pedido_cambios (
  id uuid primary key default gen_random_uuid(),
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  estado text not null,
  en timestamptz not null default now()
);

alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.zonas_cobertura enable row level security;
alter table public.perfiles enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.pedido_cambios enable row level security;

create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path to public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'administrador'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    'cliente'
  );
  return new;
end;
$$;

create or replace function public.bloquear_cambio_de_rol()
returns trigger
language plpgsql
set search_path to public
as $$
begin
  if new.rol is distinct from old.rol and auth.uid() is not null then
    raise exception 'el rol no se puede cambiar desde la aplicacion';
  end if;
  return new;
end;
$$;

create or replace function public.marcar_stock_al_crear_pedido()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
begin
  -- Checkout already moved the units. This only records that fact.
  new.stock_descontado := new.estado in (
    'en_preparacion', 'listo_retiro', 'despachado', 'entregado'
  );
  return new;
end;
$$;

create or replace function public.anotar_estado_inicial()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
begin
  insert into public.pedido_cambios (pedido_id, estado, en)
  values (new.id, new.estado, coalesce(new.creado_en, now()));
  return new;
end;
$$;

create or replace function public.aplicar_cambio_estado_pedido()
returns trigger
language plpgsql
security definer
set search_path to public
as $$
declare
  v_faltante text;
  v_debe_tener boolean;
begin
  -- Ignore a flag sent by the browser. The rule below owns this column.
  new.stock_descontado := old.stock_descontado;

  if new.estado is not distinct from old.estado then
    return new;
  end if;

  if new.estado not in (
    'pendiente_confirmacion', 'recibido', 'en_preparacion',
    'listo_retiro', 'despachado', 'entregado', 'cancelado'
  ) then
    raise exception 'Ese estado no está permitido';
  end if;

  if new.estado = 'listo_retiro' and new.modalidad is distinct from 'retiro' then
    raise exception 'Este pedido es un envío: marcá despachado';
  end if;

  if new.estado = 'despachado' and new.modalidad is distinct from 'envio' then
    raise exception 'Este pedido es un retiro: marcá listo para retiro';
  end if;

  v_debe_tener := new.estado in (
    'en_preparacion', 'listo_retiro', 'despachado', 'entregado'
  );

  if v_debe_tener and not old.stock_descontado then
    perform 1
    from public.productos p
    where p.id in (
      select i.producto_id from public.pedido_items i where i.pedido_id = new.id
    )
    order by p.id
    for update;

    select p.nombre into v_faltante
    from (
      select producto_id, sum(cantidad)::integer as cantidad
      from public.pedido_items
      where pedido_id = new.id
      group by producto_id
    ) i
    join public.productos p on p.id = i.producto_id
    where p.stock < i.cantidad
    order by p.nombre
    limit 1;

    if v_faltante is not null then
      raise exception 'No alcanza el stock de %', v_faltante;
    end if;

    update public.productos p
    set stock = p.stock - i.cantidad
    from (
      select producto_id, sum(cantidad)::integer as cantidad
      from public.pedido_items
      where pedido_id = new.id
      group by producto_id
    ) i
    where p.id = i.producto_id;

    new.stock_descontado := true;
  elsif not v_debe_tener and old.stock_descontado then
    perform 1
    from public.productos p
    where p.id in (
      select i.producto_id from public.pedido_items i where i.pedido_id = new.id
    )
    order by p.id
    for update;

    update public.productos p
    set stock = p.stock + i.cantidad
    from (
      select producto_id, sum(cantidad)::integer as cantidad
      from public.pedido_items
      where pedido_id = new.id
      group by producto_id
    ) i
    where p.id = i.producto_id;

    new.stock_descontado := false;
  end if;

  insert into public.pedido_cambios (pedido_id, estado)
  values (new.id, new.estado);

  return new;
end;
$$;

-- confirmar_pedido is the checkout transaction. The browser does not call it.
-- supabase/functions/confirmar-pedido/index.ts calls it with the service role.
-- An unknown postal code leaves the shipping cost at 0 and still creates the order.
-- A rejected payment returns status 200 and inserts nothing.

create or replace function public.confirmar_pedido(
  p_perfil_id uuid,
  p_items jsonb,
  p_modalidad text,
  p_domicilio text,
  p_codigo_postal text,
  p_nombre text,
  p_telefono text,
  p_correo text,
  p_resultado text
)
returns jsonb
language plpgsql
set search_path to public
as $$
declare
  v_item jsonb;
  v_producto_id uuid;
  v_cantidad integer;
  v_pos integer;
  v_ids uuid[] := '{}';
  v_qtys integer[] := '{}';
  v_nombre text;
  v_costo numeric := 0;
  v_subtotal numeric := 0;
  v_total numeric;
  v_pedido_id bigint;
  v_estado text;
  v_items jsonb;
begin
  if p_perfil_id is null
     or not exists (select 1 from public.perfiles where id = p_perfil_id) then
    return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
  end if;

  if p_modalidad not in ('retiro', 'envio')
     or p_resultado not in ('aprobado', 'rechazado', 'pendiente')
     or nullif(btrim(coalesce(p_nombre, '')), '') is null
     or nullif(btrim(coalesce(p_telefono, '')), '') is null
     or nullif(btrim(coalesce(p_correo, '')), '') is null
     or btrim(p_correo) !~ '^[^[:space:]@]+@[^[:space:]@]+$'
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
  end if;

  if p_modalidad = 'envio'
     and (
       nullif(btrim(coalesce(p_domicilio, '')), '') is null
       or nullif(btrim(coalesce(p_codigo_postal, '')), '') is null
     ) then
    return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) is distinct from 'object'
       or jsonb_typeof(v_item->'productoId') is distinct from 'string'
       or jsonb_typeof(v_item->'cantidad') is distinct from 'number' then
      return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
    end if;

    begin
      v_producto_id := (v_item->>'productoId')::uuid;
      v_cantidad := (v_item->>'cantidad')::integer;
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
    end;

    if v_producto_id is null or v_cantidad is null or v_cantidad <= 0 then
      return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
    end if;

    v_pos := array_position(v_ids, v_producto_id);
    if v_pos is null then
      v_ids := array_append(v_ids, v_producto_id);
      v_qtys := array_append(v_qtys, v_cantidad);
    else
      v_qtys[v_pos] := v_qtys[v_pos] + v_cantidad;
    end if;
  end loop;

  -- Lock in a stable order so two checkouts cannot both take the last unit.
  perform 1
  from public.productos
  where id = any (v_ids)
  order by id
  for update;

  if (
    select count(*)
    from public.productos
    where id = any (v_ids)
      and publicado
  ) <> coalesce(array_length(v_ids, 1), 0) then
    return jsonb_build_object('status', 422, 'error', 'Falta un dato obligatorio');
  end if;

  select p.nombre into v_nombre
  from unnest(v_ids, v_qtys) as t(producto_id, cantidad)
  join public.productos p on p.id = t.producto_id
  where p.stock < t.cantidad
  order by p.nombre
  limit 1;

  if found then
    return jsonb_build_object('status', 409, 'producto', v_nombre);
  end if;

  -- Rejected payment creates no row and sends no mail.
  if p_resultado = 'rechazado' then
    return jsonb_build_object('status', 200);
  end if;

  if p_modalidad = 'envio' then
    select z.costo_envio into v_costo
    from public.zonas_cobertura z
    where z.codigo_postal = btrim(p_codigo_postal);
    if not found then
      v_costo := 0;
    end if;
  end if;

  select coalesce(sum(p.precio * t.cantidad), 0) into v_subtotal
  from unnest(v_ids, v_qtys) as t(producto_id, cantidad)
  join public.productos p on p.id = t.producto_id;

  v_total := v_subtotal + v_costo;
  v_estado := case
    when p_resultado = 'aprobado' then 'en_preparacion'
    else 'pendiente_confirmacion'
  end;

  insert into public.pedidos (
    perfil_id, estado, resultado_cobro, modalidad, costo_envio, total,
    codigo_postal, domicilio, nombre, telefono, correo
  ) values (
    p_perfil_id, v_estado, p_resultado, p_modalidad, v_costo, v_total,
    case when p_modalidad = 'envio' then btrim(p_codigo_postal) else null end,
    case when p_modalidad = 'envio' then btrim(p_domicilio) else null end,
    btrim(p_nombre), btrim(p_telefono), btrim(p_correo)
  )
  returning id into v_pedido_id;

  insert into public.pedido_items (pedido_id, producto_id, nombre, cantidad, precio_unitario)
  select v_pedido_id, p.id, p.nombre, t.cantidad, p.precio
  from unnest(v_ids, v_qtys) as t(producto_id, cantidad)
  join public.productos p on p.id = t.producto_id;

  if p_resultado = 'aprobado' then
    update public.productos p
    set stock = p.stock - t.cantidad
    from unnest(v_ids, v_qtys) as t(producto_id, cantidad)
    where p.id = t.producto_id;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'productoId', pi.producto_id,
      'nombre', pi.nombre,
      'cantidad', pi.cantidad,
      'precioUnitario', pi.precio_unitario
    )
    order by pi.nombre
  ), '[]'::jsonb)
  into v_items
  from public.pedido_items pi
  where pi.pedido_id = v_pedido_id;

  return jsonb_strip_nulls(jsonb_build_object(
    'status', 201,
    'pedido', jsonb_build_object(
      'id', v_pedido_id,
      'estado', v_estado,
      'items', v_items,
      'total', v_total,
      'modalidad', p_modalidad,
      'costoEnvio', v_costo,
      'direccionLocal', case
        when p_modalidad = 'retiro'
          then 'Dietética Los Mirasoles, San Justo, La Matanza'
        else null
      end
    )
  ));
end;
$$;

-- Requires permission on auth.users. Already present in the hosted project.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger perfiles_bloquear_rol
  before update on public.perfiles
  for each row execute function public.bloquear_cambio_de_rol();

create trigger pedidos_marcar_stock_al_crear
  before insert on public.pedidos
  for each row execute function public.marcar_stock_al_crear_pedido();

create trigger pedidos_anotar_estado_inicial
  after insert on public.pedidos
  for each row execute function public.anotar_estado_inicial();

create trigger pedidos_aplicar_cambio_estado
  before update on public.pedidos
  for each row execute function public.aplicar_cambio_estado_pedido();

create policy categorias_lectura on public.categorias
  for select to anon, authenticated using (true);
create policy categorias_admin on public.categorias
  for all to authenticated using (es_administrador()) with check (es_administrador());

create policy productos_lectura on public.productos
  for select to anon, authenticated using (publicado or es_administrador());
create policy productos_admin on public.productos
  for all to authenticated using (es_administrador()) with check (es_administrador());

create policy zonas_lectura on public.zonas_cobertura
  for select to anon, authenticated using (true);

create policy perfiles_lectura on public.perfiles
  for select to authenticated using ((id = auth.uid()) or es_administrador());
create policy perfiles_actualizar on public.perfiles
  for update to authenticated
  using ((id = auth.uid()) or es_administrador())
  with check ((id = auth.uid()) or es_administrador());

create policy pedidos_lectura on public.pedidos
  for select to authenticated using ((perfil_id = auth.uid()) or es_administrador());
create policy pedidos_admin_actualizar on public.pedidos
  for update to authenticated using (es_administrador()) with check (es_administrador());

create policy pedido_items_lectura on public.pedido_items
  for select to authenticated using (
    exists (
      select 1 from public.pedidos
      where pedidos.id = pedido_items.pedido_id
        and (pedidos.perfil_id = auth.uid() or es_administrador())
    )
  );

create policy pedido_cambios_lectura on public.pedido_cambios
  for select to authenticated using (es_administrador());

-- Bucket "productos": public read. Write is limited to es_administrador().
-- Images are files in Storage, not rows in this script.

insert into public.categorias (nombre) values
  ('Endulzantes'),
  ('Frutas deshidratadas'),
  ('Granos y legumbres'),
  ('Harinas sin TACC'),
  ('Hierbas e infusiones'),
  ('Semillas y frutos secos'),
  ('Snacks');

insert into public.zonas_cobertura (codigo_postal, costo_envio) values
  ('1706', 3200),
  ('1754', 2500);
