# Dietética Los Mirasoles

Proyecto final de Taller de Desarrollo de Aplicaciones.

Tienda web para un comercio de San Justo, Buenos Aires. Catálogo con filtros de aptitud, carrito, checkout con cobro simulado, retiro en el local y envío en GBA Oeste.

Las tres fases están en [`docs/`](docs/). Este archivo se va completando con lo que ya funciona.

## Stack

- React con Vite para las pantallas y el carrito en memoria.
- Supabase para Postgres, Auth, las imágenes y los datos de la tienda.
- La función `confirmar-pedido` graba el pedido, descuenta stock y manda el comprobante.
- El comprobante sale por SMTP de Gmail. La contraseña de aplicación no va en este repositorio.

## Cómo correrla

```bash
npm install
npm run dev
```

Hacen falta `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. En este repo ya están en `.env`.

## Qué hay hoy

- La documentación de requerimientos, análisis y diseño, en `docs/`.
- El esquema de Supabase de abajo, más la cuenta de administrador y la función `confirmar-pedido`.
- En la app: catálogo, ficha, carrito, ingreso, checkout y panel de administrador. Las pantallas siguen los wireframes y se acomodan en una columna cuando el ancho es chico.
- Confirmar el pedido llama a `confirmar-pedido`. Un cobro aprobado o pendiente graba el pedido y manda el comprobante al correo del checkout. Uno rechazado no graba nada, no manda correo y deja el carrito. Si el SMTP falla, el pedido queda igual y `mail_ok` queda en falso.
- El panel guarda el alta, la edición, la publicación, el precio y el stock. También cambia el estado del pedido: al entrar en preparación, listo, despachado o entregado descuenta el stock una sola vez, y al salir lo devuelve. Sin sesión, esa ruta vuelve al ingreso. Un cliente autenticado ve el aviso y no entra.

## Supabase

Proyecto `Los Mirasoles (TDA)`. Las columnas están en el [diseño](<docs/U3 - TDA - Diseno.md>).

| Pieza | Qué guarda |
| --- | --- |
| `categorias` | Las siete líneas del catálogo, ya cargadas |
| `productos` | Precio, stock, publicado, aptitud (sin TACC, vegano, sin lactosa) e imagen |
| `zonas_cobertura` | Código postal y costo de envío. Hoy están 1706 y 1754. Si el código no está, el envío sigue y el costo queda en cero |
| `perfiles` | Una fila por usuario de Auth. El alta crea rol `cliente`. Hay una cuenta precargada con rol `administrador` |
| `pedidos` | Número visible, estado, cobro, entrega, contacto, `mail_ok` y si el stock ya fue descontado |
| `pedido_items` | Nombre, cantidad y precio copiados al confirmar |
| `pedido_cambios` | Fecha de cada estado. La escribe la base cuando el pedido se crea o cambia de estado |
| depósito `productos` | Una imagen de catálogo por producto. Lectura pública. Escribe el administrador |
| `confirmar-pedido` | Única escritura del alta de un pedido y del stock del checkout. Después manda el comprobante |

El navegador lee el catálogo. No inserta pedidos. La confirmación de correo de Auth está apagada, así que el registro deja la sesión abierta. El comprobante no sale por Auth: lo manda `confirmar-pedido` con `GMAIL_USER` y `GMAIL_APP_PASSWORD`, que viven en los secretos de la función y no en este repositorio.

## Tablero

[Tablero de TDA-LosMirasoles](https://alumnos-team-dx2olafw.atlassian.net/jira/software/projects/TSK/boards/2), sprint activo.

El corte de prioridad alta está cubierto en la app: catálogo, carrito, checkout con comprobante y panel.

La prioridad media y baja del análisis no tiene ticket. Si el corte se amplía, el orden es compra como invitado, carrito que sobrevive al cierre, venta por gramaje y zonas editables.

## Qué falta en la app

Nada del corte de prioridad alta. Lo que sigue está en la prioridad media y baja del análisis.

## Documentación

- [Requerimientos](<docs/U1 - TDA - Requerimientos iniciales.md>)
- [Análisis](<docs/U2 - TDA - Analisis.md>)
- [Diseño](<docs/U3 - TDA - Diseno.md>)
