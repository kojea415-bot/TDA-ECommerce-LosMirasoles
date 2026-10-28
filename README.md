# Dietética Los Mirasoles

Proyecto final de Taller de Desarrollo de Aplicaciones.

Tienda web para un comercio de San Justo, Buenos Aires. Catálogo con filtros de aptitud, carrito, checkout con cobro simulado, retiro en el local y envío en GBA Oeste.

Las tres fases están en [`docs/`](docs/). Este archivo se va completando con lo que ya funciona.

## Stack

- React con Vite para las pantallas y el carrito en memoria.
- Supabase para Postgres, Auth y la lectura del catálogo.
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
- En la app: catálogo, ficha, carrito, ingreso y checkout. Las pantallas siguen los wireframes y se acomodan en una columna cuando el ancho es chico.
- Confirmar el pedido llama a `confirmar-pedido`. Un cobro aprobado o pendiente graba el pedido. Uno rechazado no lo graba y deja el carrito.

## Supabase

Proyecto `Los Mirasoles (TDA)`. Las columnas están en el [diseño](<docs/U3 - TDA - Diseno.md>).

| Pieza | Qué guarda |
| --- | --- |
| `categorias` | Las siete líneas del catálogo, ya cargadas |
| `productos` | Precio, stock, publicado, aptitud (sin TACC, vegano, sin lactosa) e imagen |
| `zonas_cobertura` | Código postal y costo de envío. Hoy están 1706 y 1754. Si el código no está, el envío sigue y el costo queda en cero |
| `perfiles` | Una fila por usuario de Auth. El alta crea rol `cliente`. Hay una cuenta precargada con rol `administrador` |
| `pedidos` | Número visible, estado, cobro, entrega, contacto y `mail_ok` |
| `pedido_items` | Nombre, cantidad y precio copiados al confirmar |
| depósito `productos` | Una imagen de catálogo por producto publicado. Lectura pública. Escribe el administrador |
| `confirmar-pedido` | Única escritura de pedidos y stock. Después manda el comprobante |

El navegador lee el catálogo. No inserta pedidos. La confirmación de correo de Auth está apagada, así que el registro deja la sesión abierta. El comprobante no sale por Auth. Faltan los secretos `GMAIL_USER` y `GMAIL_APP_PASSWORD` de la función: sin ellos el pedido se graba y `mail_ok` queda en falso.

## Tablero

[Tablero de TDA-LosMirasoles](https://alumnos-team-dx2olafw.atlassian.net/jira/software/projects/TSK/boards/2), sprint activo.

Del checkout falta el comprobante. La administración sigue sin guardar.

| Ticket | Qué es |
| --- | --- |
| TSK-13 | HU-13 Enviar el comprobante por SMTP |
| TSK-18 | Cargar los secretos de Gmail en `confirmar-pedido` |
| TSK-14 a TSK-17 | Panel de administrador: el acceso está a medias y las altas, precios y estados no se guardan |

La prioridad media y baja del análisis no tiene ticket. Si el corte se amplía, el orden es compra como invitado, carrito que sobrevive al cierre, venta por gramaje y zonas editables.

## Qué falta en la app

El comprobante por correo y la escritura del panel. Faltan los secretos `GMAIL_USER` y `GMAIL_APP_PASSWORD`: sin ellos el pedido se graba y `mail_ok` queda en falso. En el panel, guardar un producto, publicarlo o cambiar el estado de un pedido todavía no persiste. Sin sesión, esa ruta avisa que es del administrador y no redirige al ingreso.

## Documentación

- [Requerimientos](<docs/U1 - TDA - Requerimientos iniciales.md>)
- [Análisis](<docs/U2 - TDA - Analisis.md>)
- [Diseño](<docs/U3 - TDA - Diseno.md>)
