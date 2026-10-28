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
- En la app: una pantalla que lee `categorias` y muestra si la conexión responde.

## Supabase

Proyecto `Los Mirasoles (TDA)`. Las columnas están en el [diseño](<docs/U3 - TDA - Diseno.md>).

| Pieza | Qué guarda |
| --- | --- |
| `categorias` | Las siete líneas del catálogo, ya cargadas |
| `productos` | Precio, stock, publicado y aptitud (sin TACC, vegano, sin lactosa) |
| `zonas_cobertura` | Código postal y costo de envío. Vacía: si el código no está, el envío sigue y el costo queda en cero |
| `perfiles` | Una fila por usuario de Auth. El alta crea rol `cliente`. Hay una cuenta precargada con rol `administrador` |
| `pedidos` | Número visible, estado, cobro, entrega, contacto y `mail_ok` |
| `pedido_items` | Nombre, cantidad y precio copiados al confirmar |
| depósito `productos` | Imágenes. Lectura pública. Escribe el administrador |
| `confirmar-pedido` | Única escritura de pedidos y stock. Después manda el comprobante |

El navegador lee el catálogo. No inserta pedidos. La confirmación de correo de Auth está apagada, así que el registro deja la sesión abierta. El comprobante no sale por Auth. Faltan los secretos `GMAIL_USER` y `GMAIL_APP_PASSWORD` de la función: sin ellos el pedido se graba y `mail_ok` queda en falso.

## Tablero

[Tablero de TDA-LosMirasoles](https://alumnos-team-dx2olafw.atlassian.net/jira/software/projects/TSK/boards/2), sprint activo.

En el backlog quedó el checkout:

| Ticket | Qué es |
| --- | --- |
| TSK-10 | HU-06 Revalidar el stock al confirmar |
| TSK-11 | HU-07 Elegir retiro o envío |
| TSK-12 | HU-08 Completar el checkout con cobro simulado |
| TSK-13 | HU-13 Enviar el comprobante por SMTP |
| TSK-18 | Cargar los secretos de Gmail en `confirmar-pedido` |

La prioridad media y baja del análisis no tiene ticket. Si el corte se amplía, el orden es compra como invitado, carrito que sobrevive al cierre, venta por gramaje y zonas editables.

## Qué falta en la app

Las pantallas del sprint activo y, después, el checkout del backlog. El contrato de la compra está en el diseño. La función ya responde. Faltan los secretos `GMAIL_USER` y `GMAIL_APP_PASSWORD`.

## Documentación

- [Requerimientos](<docs/U1 - TDA - Requerimientos iniciales.md>)
- [Análisis](<docs/U2 - TDA - Analisis.md>)
- [Diseño](<docs/U3 - TDA - Diseno.md>)
