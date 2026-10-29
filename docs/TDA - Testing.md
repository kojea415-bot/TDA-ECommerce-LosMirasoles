# Testing de la tienda

Pruebas de extremo a extremo con Cypress sobre las pantallas del cliente. El panel no entra en estos specs: se recorrió a mano y el resultado está en el informe de entrega.

## Cómo correrlas

Con la tienda levantada en otra terminal:

```bash
npm run dev          # terminal 1
npm run cy:open      # terminal 2: ventana interactiva
npm run cy:run       # terminal 2: todos los specs sin ventana
```

Los tests usan un viewport de 360 x 740 (RNF-01, celular).

## Cómo están hechas

- **Supabase se simula con `cy.intercept`.** Los tests no leen ni escriben la base real, no crean pedidos y no usan credenciales. El correo y el token de sesión son inventados y la contraseña se genera al azar en cada corrida.
- **Todo pedido a Supabase queda bloqueado por defecto.** Cada test falla si salió un pedido que no estaba simulado (`verificarSinNoPrevistos`). Así un error en un test no puede tocar la base compartida.
- **El carrito vive en memoria de React** (decisión de diseño, RF-10 fuera de alcance). Un `cy.visit` nuevo lo vacía, por eso los tests que usan carrito entran por `/` una sola vez y navegan con clics.
- Las ayudas compartidas (intercepts, fábrica de productos, login por pantalla) están en `cypress/e2e/ayudas.js`. No es un spec.

## Qué se prueba 

| Archivo | Test | Historia |
| --- | --- | --- |
| `catalogo.cy.js` | Los filtros de aptitud y la categoría se combinan sin volver a pedir los productos | HU-03 |
| `catalogo.cy.js` | Un producto sin stock no se puede agregar y uno con stock sí | HU-02 |
| `carrito.cy.js` | Agregar, sumar con tope de stock, restar, quitar, vaciar y subtotal | HU-04 |
| `carrito.cy.js` | "Ir a pagar" solo aparece con sesión y con productos | HU-04, HU-05 |
| `checkout.cy.js` | Pago aprobado: confirma el pedido, no envía precios ni tarjeta y vacía el carrito | HU-08 |
| `checkout.cy.js` | Pago rechazado: no registra el pedido, conserva el carrito y permite reintentar | HU-08 |
| `checkout.cy.js` | Stock insuficiente (409): nombra el producto y deja el carrito intacto | HU-06 |
| `checkout.cy.js` | Retiro y envío, costo por código postal y zona sin cobertura (costo 0) | HU-07 |
| `ingreso.cy.js` | Registro con correo ya registrado: avisa y no navega | HU-05 |
| `ingreso.cy.js` | Alta exitosa: navega al inicio | HU-05 |
| `app.cy.js` | La app abre y muestra el título (prueba de humo) | — |

Resultado de la corrida del 29/10/2026: los 11 tests pasan, incluida la prueba de humo (Node 24.13.1, Cypress 16.2.0). Esa corrida no cubre el panel ni el correo. Esos recorridos están como prueba manual en el informe de entrega.

## Qué no se prueba y por qué

| Criterio | Motivo |
| --- | --- |
| Atomicidad del stock con dos confirmaciones simultáneas (HU-06, RG-03) | Vive en la función `confirmar-pedido` y en la transacción de Postgres. Con `cy.intercept` solo se probaría un mock. |
| Cálculo real del envío y total guardado (HU-07, RG-04) | El valor que vale lo calcula el servidor. En el navegador se prueba solo la vista previa. |
| Stock descontado y estado del pedido en la base (HU-08) | Son efectos en Postgres, no se ven desde el navegador. |
| Comprobante por SMTP (HU-13) | Es una integración entre el servidor y Gmail. |
| Contraseñas, hash y reglas de acceso por fila (RNF-04) | Las garantizan Supabase Auth y las políticas RLS. |
| Tiempos de respuesta en 4G (RNF-02) | Cypress en local no mide una red real. Corresponde Lighthouse sobre el sitio desplegado. |
| Búsqueda por nombre (RF-05) | No hay spec. En la tienda filtra el nombre ya cargado y no ordena por relevancia. |
| Panel de administrador (HU-09 a HU-12) | Cypress no lo recorre. La prueba manual está en el informe de entrega. |

## Cómo se armó

El plan salió de dos agentes de Claude Code definidos en `.claude/agents/`:

1. `testeo-planificador` leyó los documentos y el código y propuso qué probar y qué no, sin escribir tests.
2. Se revisó la propuesta y se aprobaron nueve filas de prioridad alta.
3. `testeo-escritor` escribió solo esas filas.
4. Se corrieron los tests en Cypress y se corrigieron las fallas.

## Hallazgos durante las pruebas

- **Prueba que fallaba por el test, no por la tienda.** El pago pide nombre y correo precargados y los vuelve a llenar si quedan vacíos. El test borraba el campo y escribía encima, y el correo quedaba duplicado: el navegador bloqueaba el envío. Se resolvió escribiendo sobre la selección en lugar de vaciar el campo.
- **React ejecuta cada efecto dos veces en desarrollo** (modo estricto), así que el catálogo pide los productos dos veces con `npm run dev`. El test compara los pedidos antes y después de filtrar, no contra un número fijo.
- **Diferencia entre el análisis y el código.** U2 dice que sin sesión "Ir a pagar" lleva a ingresar. En el código, el botón directamente no aparece. El test sigue el criterio de HU-05 (el botón se oculta sin sesión).
- **El contador del carrito está en la insignia del encabezado.** El enlace dice "Carrito" y el número va en `.cuenta`.
- **Sin sesión, "Seguir comprando" lleva a ingresar.** Después de entrar, vuelve al catálogo. En la tarjeta, un producto sin stock dice "Sin stock"; "No disponible" queda en la ficha.
- **El rechazo muestra un texto fijo.** U2 habla del motivo del rechazo, pero la función no lo devuelve y la pantalla no lo muestra.
- **El navegador consulta `zonas_cobertura`** para mostrar el costo de envío. Es solo una vista previa: el costo definitivo lo decide la función.
- La prueba de humo `app.cy.js` todavía lee la base real (solo lectura). Conviene simular esas dos consultas.
