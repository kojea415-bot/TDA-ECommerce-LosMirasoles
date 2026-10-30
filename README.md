# Dietética Los Mirasoles

Proyecto final de Taller de Desarrollo de Aplicaciones.

Tienda web para un comercio de San Justo, Buenos Aires. Catálogo con filtros de aptitud, carrito, checkout con cobro simulado, retiro en el local y envío en GBA Oeste.

La tienda publicada está en https://tda-ecommerce-losmirasoles.onrender.com.

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

La tienda recorre el circuito de compra y el panel.

- El catálogo es público: búsqueda, filtros de aptitud y ficha. Si el producto ya está en el carrito, el catálogo y la ficha muestran el mismo − / cantidad / +.
- El carrito vive en memoria. Sin sesión, "Seguir comprando" lleva al ingreso y después vuelve al catálogo. "Ir a pagar" aparece con sesión y con ítems.
- El checkout tiene dos pasos: retiro o envío, y cobro simulado (aprobado, rechazado o pendiente). Un código postal que no está en la tabla no frena el envío; el costo queda en cero.
- Confirmar llama a `confirmar-pedido`. Aprobado o pendiente graba el pedido y manda el comprobante al correo del checkout. Rechazado no graba nada, no manda correo y deja el carrito. Si el SMTP falla, el pedido queda igual y `mail_ok` queda en falso. La confirmación muestra ese pedido; recargar la pantalla no inventa un número.
- El panel está en `/admin/pedidos` y `/admin/productos`. Entra por el mismo ingreso. Guarda alta, edición, publicación, precio y stock, y cambia el estado del pedido. Al entrar en preparación, listo para retiro, despachado o entregado descuenta el stock una sola vez; al salir, lo devuelve. Sin sesión, esa ruta vuelve al ingreso. Un cliente autenticado ve el aviso y no entra.
- Las pantallas se acomodan en una columna. El circuito de compra entra en 360 px de ancho.

## Cuentas

Las dos usan `/ingreso`.

| Cuenta | Correo | Contraseña |
| --- | --- | --- |
| Cliente de prueba | `cliente.prueba@mail.com` | `Mirasoles.prueba` |
| Administrador | `administrador_losmirasoles@mail.com` | `Mirasoles.admin` |

El cliente ve la tienda. El administrador entra al panel y no ve el catálogo, el carrito ni el checkout.

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

[Tablero de TDA-LosMirasoles](https://alumnos-team-dx2olafw.atlassian.net/jira/software/projects/TSK/boards/2).

Los tickets de prioridad alta están en Listo: catálogo, carrito, checkout con comprobante, panel y el circuito en 360 px.

## Entrega

Los dos archivos que pide la guía de la cátedra están en la raíz del repositorio: `Equipo06_Informe.pdf` y `Equipo06_Codigo.txt`. El equipo es Kevin Ojea y Juan Garcia, grupo 6 de la comisión A.

## Documentación

- [Requerimientos](<docs/U1 - TDA - Requerimientos iniciales.md>)
- [Análisis](<docs/U2 - TDA - Analisis.md>)
- [Diseño](<docs/U3 - TDA - Diseno.md>)
