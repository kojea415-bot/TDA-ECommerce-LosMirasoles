# Análisis - Tienda web Dietética Los Mirasoles

Documento de referencia de la fase de análisis. Toma como fuente los requerimientos iniciales y baja a diseño, tareas y criterios solo lo marcado como prioridad alta: 21 requisitos funcionales y 7 no funcionales.

Quedan fuera de este corte los requisitos de prioridad media y baja. Se listan al final para no perder la trazabilidad. No hay prototipo de alta fidelidad, ni validación con usuarios, ni backlog estimado.

Decisiones de este corte, para no contradecir prioridades:

- La compra se confirma con sesión iniciada. La compra como invitado es RF-24, prioridad media.
- El carrito vende por unidad. La venta fraccionada por gramaje es RF-09, prioridad media.
- El cobro es simulado. Ninguna pantalla pide ni guarda datos de tarjeta.

---

## 1. Prototipos de baja fidelidad

### 1.1 Catálogo

![Catálogo](<U2 - wireframes/01-catalogo.svg>)

Sin sesión el catálogo se ve igual. "Cuenta" lleva a ingresar o registrarse. "Agregar" suma una unidad y actualiza el contador del carrito. Si no hay stock, la tarjeta sigue visible y el botón no está.

### 1.2 Ficha de producto

![Ficha de producto](<U2 - wireframes/02-ficha.svg>)

### 1.3 Carrito

![Carrito](<U2 - wireframes/03-carrito.svg>)

"Ir a pagar" exige sesión. Si no hay sesión, lleva a ingresar y vuelve al carrito.

### 1.4 Checkout

![Checkout](<U2 - wireframes/04-checkout.svg>)

### 1.5 Confirmación

![Confirmación](<U2 - wireframes/05-confirmacion.svg>)

Si el cobro fue rechazado, esta pantalla no aparece. Se vuelve al paso 2 con el carrito intacto y el motivo del rechazo.

### 1.6 Ingreso y registro

![Ingreso y registro](<U2 - wireframes/06-ingreso.svg>)

Un correo ya registrado no crea la cuenta y lo dice en el formulario.

### 1.7 Pedidos (administrador)

![Pedidos](<U2 - wireframes/07-pedidos.svg>)

"Listo para retiro" se muestra si la modalidad es retiro. "Despachado" se muestra si es envío. Es el mismo paso del ciclo, con rótulo según la modalidad. Cada cambio guarda la fecha.

Una cuenta de cliente que abre esta ruta ve acceso denegado, no el listado vacío.

### 1.8 Productos (administrador)

![Productos](<U2 - wireframes/08-productos.svg>)

La columna de precio y stock se edita en la fila. No hace falta abrir el formulario completo. El alta y la edición completa usan un único formulario.

---

## 2. Historias de usuario, tareas y criterios de aceptación

Cada historia cubre uno o más requisitos de prioridad alta. Las tareas son el trabajo para implementarla. Los criterios dicen cuándo se considera terminada.

Restricciones que cruzan varias historias, y que los criterios ya incorporan donde corresponden:

- **RNF-01.** El circuito de compra se opera desde 360 px de ancho, sin desplazamiento horizontal.
- **RNF-02.** El listado del catálogo aparece en menos de tres segundos en una conexión 4G promedio. Aplicar o sacar un filtro responde en menos de un segundo.
- **RNF-04.** HTTPS, contraseñas con hash y salt, y autorización verificada en el servidor.

### HU-01 · Recorrer el catálogo sin cuenta

Como visitante, quiero ver los productos por categoría sin registrarme, para saber qué hay antes de comprar.

Cubre RF-01.

Tareas:

- Definir el árbol de categorías inicial: harinas sin TACC, granos y legumbres, frutas deshidratadas, hierbas e infusiones, endulzantes, semillas y frutos secos, snacks.
- Armar el listado público por categoría, sin autenticación.
- Enlazar cada ítem a su ficha y mostrar precio, etiquetas y disponibilidad en la tarjeta.

Criterios de aceptación:

- Sin sesión se ve el catálogo completo publicado.
- Elegir una categoría muestra solo sus productos.
- Un producto despublicado no aparece.
- El listado se muestra en menos de tres segundos en una conexión 4G promedio (RNF-02).

### HU-02 · Ver la ficha y respetar el sin stock

Como visitante, quiero abrir la ficha de un producto y ver si puedo comprarlo, para no agregar algo que el local no tiene.

Cubre RF-02 y RF-06.

Tareas:

- Mostrar nombre, descripción, imagen, precio, unidad de venta, etiquetas, información nutricional si existe, y disponibilidad.
- Impedir agregar al carrito cuando el stock es cero, manteniendo el producto visible.

Criterios de aceptación:

- La ficha muestra todos los datos cargados. Si no hay información nutricional, esa zona no aparece y el resto sigue visible.
- Con stock cero el producto se ve en el listado y en la ficha, marcado como no disponible, y no hay acción de agregar.
- Con stock mayor a cero, agregar suma una unidad al carrito.

### HU-03 · Filtrar por aptitud alimentaria

Como cliente con una restricción alimentaria, quiero filtrar por sin TACC, vegano o sin lactosa, para no revisar producto por producto.

Cubre RF-03 y RF-04.

Tareas:

- Guardar en el producto las etiquetas sin TACC, apto vegano y sin lactosa.
- Mostrar las etiquetas en la tarjeta y en la ficha.
- Aplicar filtros de categoría y de etiqueta combinables, actualizando el listado sin recargar la página.

Criterios de aceptación:

- Activar "Sin TACC" y "Vegano" a la vez muestra solo productos con ambas etiquetas, en menos de un segundo y sin recargar (RNF-02).
- Combinar esos filtros con una categoría restringe también por categoría.
- Sacar un filtro devuelve los productos que habían quedado ocultos, sin recargar.
- Un producto sin etiquetas no aparece cuando hay algún filtro de aptitud activo.

### HU-04 · Armar el carrito

Como cliente, quiero cambiar cantidades y quitar ítems viendo el subtotal, para decidir la compra antes de pagar.

Cubre RF-08.

Tareas:

- Agregar, incrementar, decrementar y quitar ítems.
- Recalcular el subtotal de cada ítem y el del carrito en cada operación.
- Mostrar la cantidad de ítems en el acceso al carrito desde el catálogo y la ficha.

Criterios de aceptación:

- Agregar el mismo producto dos veces incrementa la cantidad, no duplica la fila.
- Bajar la cantidad a cero quita el ítem.
- El subtotal mostrado coincide con precio por cantidad después de cada cambio.
- Con el carrito vacío, "Ir a pagar" no avanza.

### HU-05 · Entrar y registrarse

Como cliente, quiero crear una cuenta e iniciar sesión, para poder confirmar la compra.

Cubre RF-22 y RF-23. RNF-04 aplica al almacenamiento de la contraseña y a la sesión.

Tareas:

- Formulario de registro con nombre, correo y contraseña.
- Rechazar un correo ya registrado.
- Inicio y cierre de sesión visibles desde el catálogo, la ficha y el carrito.
- Guardar la contraseña con hash y salt.

Criterios de aceptación:

- Registrar un correo nuevo crea la cuenta e inicia sesión.
- Registrar un correo existente no crea otra cuenta y explica el motivo.
- Cerrar sesión oculta el acceso a "Ir a pagar" hasta un nuevo ingreso.
- La contraseña no se puede leer de vuelta desde la base ni desde ninguna pantalla.

### HU-06 · Revalidar el stock al confirmar

Como cliente, quiero que el sistema me avise si algo se agotó mientras armaba el carrito, para no confirmar un pedido imposible.

Cubre RF-11 y RNF-10.

Tareas:

- Volver a leer el stock de cada ítem en el momento de confirmar, no usar solo el valor que vio el cliente al agregar.
- Si falta stock, señalar el ítem, no crear el pedido y dejar el resto del carrito.
- Descontar stock de forma atómica para que dos confirmaciones simultáneas no vendan de más.

Criterios de aceptación:

- Si entre el agregado y la confirmación el stock baja a cero, la confirmación se detiene, nombra el producto y no genera pedido.
- Si el stock alcanza solo para una parte de la cantidad pedida, no se confirma esa línea por la cantidad original.
- Dos confirmaciones simultáneas del último unidad dejan un solo pedido aprobado y el otro recibe el aviso de sin stock.

### HU-07 · Elegir retiro o envío dentro de zona

Como cliente, quiero elegir retiro en el local o envío a domicilio y conocer el costo antes de pagar, para no confirmar una entrega que el comercio no cubre.

Cubre RF-12, RF-13 y RF-14.

Tareas:

- Ofrecer retiro en el local y envío a domicilio en el checkout.
- Pedir domicilio y código postal solo si elige envío.
- Comparar el código postal con las zonas cargadas para mostrar el costo de esa zona.
- Mostrar el costo antes de confirmar. Retiro con costo cero.
- Sumar el costo de envío al total.

Criterios de aceptación:

- Retiro en el local no pide domicilio y muestra envío $ 0.
- Un código postal de una zona configurada muestra el costo de esa zona y permite seguir.
- El total de la confirmación incluye el costo de envío cuando corresponde, y no lo incluye en el retiro.

### HU-08 · Completar el checkout con cobro simulado

Como cliente, quiero dejar mis datos y un resultado de cobro simulado, para cerrar el pedido sin usar un medio de pago real.

Cubre RF-17, RF-18, RF-19, RF-20 y RNF-05.

Tareas:

- Pedir nombre, teléfono y correo, más domicilio completo si hay envío. Validar obligatorios antes de avanzar.
- Precargar nombre y correo cuando hay sesión, editables.
- Ofrecer resultado aprobado, rechazado o pendiente, resuelto por un módulo interno.
- Si es aprobado, crear el pedido en estado "en preparación" y mostrar número, ítems, total, modalidad y, si es retiro, la dirección del local.
- Si es rechazado, no crear pedido, conservar el carrito y permitir reintentar.
- Si es pendiente, registrar el pedido a la espera de confirmación del administrador y no descontar el stock hasta esa confirmación.
- No existir campo de número de tarjeta ni persistencia de datos de pago.

Criterios de aceptación:

- Falta un dato obligatorio: no se avanza y se marca el campo.
- Aprobado: hay número de pedido, el estado es "en preparación", el carrito queda vacío y el stock se descuenta.
- Rechazado: no hay pedido nuevo y el carrito sigue igual.
- Pendiente: el pedido existe, el cliente ve que espera confirmación, y el stock no cambia.
- En ninguno de los tres resultados se pidió ni se guardó un dato de tarjeta.

### HU-13 · Enviar el comprobante por SMTP

Como cliente, quiero recibir un correo con el pedido confirmado, para tener el detalle sin volver a entrar al sitio.

Cubre RF-21.

Tareas:

- Enviar el correo solo cuando el pedido queda confirmado, usando SMTP de Gmail (`smtp.gmail.com`, puerto 587, STARTTLS) con la cuenta de prueba.
- Incluir número de pedido, ítems, total y modalidad de entrega.
- Leer la contraseña de aplicación desde la configuración del entorno. No guardarla en el repositorio.
- Si el envío falla, dejar el pedido confirmado y registrar el fallo.

Criterios de aceptación:

- Un pedido aprobado o pendiente llega al correo indicado en el checkout, enviado desde la cuenta de Gmail de prueba.
- El mensaje trae número, ítems, total y si es retiro o envío.
- Un cobro rechazado no envía comprobante, porque no hay pedido.
- Con el SMTP caído o la clave inválida, el pedido sigue existiendo y el fallo queda registrado.

### HU-09 · Entrar al panel como administrador

Como dueño, quiero entrar a un panel que un cliente no pueda abrir, para gestionar productos y pedidos aparte de la tienda.

Cubre RF-28 y RNF-04.

Tareas:

- Separar el acceso de administrador del de cliente.
- Verificar el rol en el servidor en cada operación del panel.
- Responder con acceso denegado a una sesión de cliente, aunque conozca la ruta.

Criterios de aceptación:

- Un administrador autenticado ve productos y pedidos.
- Un cliente autenticado no ve esas pantallas ni puede ejecutar sus acciones por URL directa.
- Sin sesión, el panel redirige al ingreso.

### HU-10 · Cargar y publicar un producto

Como administrador, quiero dar de alta un producto en un solo formulario, para publicarlo sin ayuda técnica.

Cubre RF-29 y RNF-03.

Tareas:

- Un formulario con imagen, descripción, precio, unidad de venta, stock, etiquetas de aptitud e información nutricional.
- Acciones de editar, despublicar y eliminar.
- Validación en línea y mensajes en lenguaje del mostrador, no de base de datos.

Criterios de aceptación:

- El alta completa no pide una segunda pantalla.
- Un producto despublicado desaparece del catálogo público y sigue en el panel.
- Guardar sin precio o sin nombre no publica y explica qué falta.
- Las etiquetas cargadas acá son las que el filtro de HU-03 usa en la tienda.

### HU-11 · Actualizar precio y stock en la lista

Como administrador, quiero cambiar precio y stock desde la lista de productos, para no abrir el formulario completo en cada reposición.

Cubre RF-31 y RNF-03.

Tareas:

- Edición de precio y de stock en la fila del listado.
- Guardar cada cambio sin navegar a la ficha completa.
- Reflejar de inmediato el precio en el catálogo y el sin stock de HU-02.

Criterios de aceptación:

- Cambiar el precio en la fila actualiza el valor que ve el cliente, sin abrir el formulario de HU-10.
- Poner stock en cero marca el producto como no disponible en la tienda y bloquea agregarlo.
- El cambio queda hecho en menos de un formulario: la fila alcanza.

### HU-12 · Seguir y avanzar los pedidos

Como administrador, quiero ver los pedidos en una sola pantalla y avanzar su estado, para saber qué preparar, qué está listo para retirar y qué ya salió.

Cubre RF-33 y RF-34.

Tareas:

- Listado con filtros por estado, modalidad de entrega y rango de fechas.
- Búsqueda por número de pedido o nombre de cliente.
- Cambio de estado entre recibido, en preparación, listo para retiro o despachado, entregado y cancelado.
- Usar el rótulo "listo para retiro" o "despachado" según la modalidad, como un único paso del ciclo.
- Guardar la fecha de cada cambio.
- Confirmar un cobro pendiente desde esta pantalla: al pasarlo a "en preparación" se descuenta el stock con la misma regla de HU-06.

Criterios de aceptación:

- Filtrar por "en preparación" y por "retiro" muestra solo esos pedidos.
- Buscar por número o por nombre encuentra el pedido aunque los filtros estén en "todos".
- Cada cambio de estado registra la fecha y no permite saltear dejando el pedido sin estado.
- Cancelar un pedido en preparación devuelve el stock descontado.
- Confirmar un pedido que estaba pendiente de cobro descuenta el stock una sola vez.

---

## 3. Riesgos y mitigación

| ID | Riesgo | Efecto si ocurre | Mitigación en este corte |
| --- | --- | --- | --- |
| RG-01 | Los dos dueños cargan el catálogo, preparan pedidos y atienden el local. | El alta de los cien productos se atrasa y el sitio sale con catálogo incompleto. | HU-10 exige un solo formulario y HU-11 evita reabrirlo para precio y stock. El catálogo inicial puede cargarse publicado por tandas, no como condición para abrir el resto. |
| RG-02 | El cobro simulado se implementa o se lee como una pasarela real. | Se piden datos de tarjeta que el alcance prohíbe, o el pedido queda cobrado de verdad. | HU-08 no tiene campo de tarjeta ni integración. RNF-05 es criterio de aceptación. |
| RG-09 | Gmail rechaza el SMTP o la clave queda en el repositorio. | No sale el comprobante, o la cuenta de prueba queda expuesta. | HU-13 usa contraseña de aplicación, leída del entorno. Si el envío falla, el pedido no se deshace. |
| RG-03 | Dos clientes confirman la última unidad a la vez. | Se vende stock que no existe y el local no puede preparar el pedido. | HU-06 descuenta de forma atómica. El segundo recibe sin stock y no se crea su pedido. |
| RG-04 | El checkout promete envío antes de validar el código postal. | El total no coincide con la zona del domicilio. | HU-07 muestra el costo de la zona del código postal antes de confirmar. |
| RG-05 | La venta por gramaje entra al corte por costumbre del mostrador. | Precio y stock dejan de ser por unidad y se rompe el carrito de HU-04. | RF-09 queda fuera. En este corte la unidad de venta es la unidad cargada en HU-10, no un gramaje calculado. |
| RG-06 | Las pantallas se diseñan primero para escritorio. | El circuito no se puede terminar en un teléfono, que es la meta de uso. | Los bocetos están ordenados en una columna. RNF-01 es criterio de las historias de compra: 360 px y sin scroll horizontal. |
| RG-07 | "Recibido" y "en preparación" se interpretan como dos pasos obligatorios distintos. | El pedido aprobado no coincide con RF-19, que lo deja en preparación, o el administrador no encuentra el estado de RF-34. | HU-08 crea el pedido aprobado directamente en "en preparación". "Recibido" queda disponible en el ciclo de HU-12 para un alta manual, no como paso extra del checkout. |
| RG-08 | Un pedido con cobro pendiente descuenta stock antes de que el dueño lo confirme. | Se reserva mercadería que quizá no se pague, y el catálogo la muestra sin stock. | HU-08 no descuenta en pendiente. HU-12 descuenta recién al confirmarlo, y cancela devolviendo unidades si el pedido ya había descontado. |

---

## 4. Fuera de este corte

Prioridad media, sin historia ni boceto en este documento: RF-05, RF-09, RF-10, RF-24, RF-25, RF-26, RF-30, RF-35, RNF-06, RNF-07, RNF-08, RNF-09, RNF-11, RNF-12, RNF-15.

Prioridad baja: RF-07, RF-15, RF-16, RF-27, RF-32, RF-36, RF-37, RF-38, RNF-13, RNF-14.

El siguiente trabajo de análisis, si se amplía el corte, entra por la prioridad media en este orden: compra como invitado (RF-24), carrito que sobrevive al cierre del navegador (RF-10), venta por gramaje (RF-09) y zonas de cobertura editables por el administrador (RF-35). Hoy las zonas se asumen cargadas para que HU-07 pueda validar.
