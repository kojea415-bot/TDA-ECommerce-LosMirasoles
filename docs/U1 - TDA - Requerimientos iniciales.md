# Requerimientos iniciales - Tienda web 'Dietética Los Mirasoles'

Documento de referencia. Versión simplificada de la fase de requerimientos: descripción general, objetivos y metas, requisitos funcionales y requisitos no funcionales. 

---

## 1. Descripción general del proyecto

### 1.1 Contexto

Dietética Los Mirasoles es un comercio de barrio ubicado en San Justo, partido de La Matanza (GBA Oeste). Opera desde hace más de doce años y lo llevan adelante sus dos dueños, sin personal adicional. El foco del negocio está en alimentación saludable: productos sin TACC, opciones veganas y sin lactosa, con asesoramiento directo sobre restricciones alimentarias.

El catálogo ronda los cien productos, repartidos en cuatro líneas fuertes (harinas sin TACC, granos y legumbres, frutas deshidratadas, hierbas e infusiones) más categorías transversales como endulzantes naturales, semillas, frutos secos y snacks. Buena parte se vende fraccionada por gramaje.

La operación es hoy íntegramente presencial. Las ventas a distancia se resuelven de manera informal por WhatsApp, con reparto acotado a pocas cuadras del local. Los medios de cobro son QR de billetera virtual, efectivo y transferencia bancaria.

### 1.2 Problema

1. **Sin canal de venta digital.** No existe sitio web ni catálogo publicado. Un cliente que no conoce el local no tiene forma de ver qué productos hay, a qué precio ni si están disponibles.
2. **Pedidos informales y manuales.** El circuito por WhatsApp obliga a los dueños a responder consultas de precio y disponibilidad una por una, armar el pedido a mano y coordinar la entrega por mensajes. No queda registro estructurado de la venta.
3. **Cobertura de entrega mínima.** El reparto actual llega a unas pocas cuadras. El comercio tiene stock y variedad para abastecer un radio mucho mayor, pero no tiene cómo tomar ni organizar esos pedidos.
4. **Búsqueda de aptitud difícil de resolver en mostrador.** El cliente celíaco, vegano o intolerante a la lactosa necesita filtrar el catálogo por aptitud. Presencialmente eso depende de que el dueño esté disponible para asesorar.
5. **Sin control digital de stock ni precios.** Los precios cambian seguido y el control es manual, lo que dificulta sostener información consistente frente al cliente.

### 1.3 Solución propuesta

Desarrollar a medida una **tienda web propia** para Dietética Los Mirasoles, con dos frentes sobre el mismo sistema:

- **Frente público (cliente).** Catálogo navegable por categorías con filtros por aptitud alimentaria, fichas de producto con información nutricional, carrito, y checkout que permite elegir entre retiro en el local y envío a domicilio dentro de GBA Oeste.
- **Frente de administración (dueños).** Panel para gestionar productos, precios, stock, zonas de cobertura y el seguimiento de pedidos a lo largo de su ciclo de vida.

El local físico se mantiene como ancla de la operación: es el depósito, el punto de retiro y el origen de los envíos.

### 1.4 Alcance

Queda dentro del alcance de este desarrollo:

- Catálogo público con categorías, búsqueda y filtros por aptitud alimentaria.
- Venta por unidad y venta fraccionada por gramaje.
- Carrito y proceso de compra completo hasta la confirmación del pedido.
- Elección de modalidad de entrega, con validación de cobertura por código postal y cálculo del costo de envío.
- **Cobro simulado.** El sistema registra la intención de pago y su resultado (aprobado, rechazado o pendiente) contra un módulo interno de simulación. No hay integración con pasarelas de pago reales, ni procesamiento, ni almacenamiento de datos de tarjeta.
- **Correo real por SMTP.** Al confirmar un pedido, el sistema envía el comprobante al correo del cliente usando una cuenta de Gmail creada para la prueba. Es la única integración externa del entregable.
- Cuentas de cliente con historial de pedidos, más compra como invitado.
- Panel de administración con gestión de catálogo, stock, precios, cobertura y estados de pedido.

### 1.5 Fuera de alcance

- Integración real con pasarelas de pago o con billeteras virtuales.
- Publicación en marketplaces y sincronización de catálogo con canales externos.
- Aplicación móvil nativa. El acceso es por navegador web.
- Integración con operadores logísticos para generar etiquetas o rastrear envíos. La coordinación del reparto es manual.
- Facturación electrónica e integración contable o fiscal.
- Módulo de compras a proveedores y gestión de vencimientos de mercadería.
- Sistema de punto de venta para el mostrador del local.

### 1.6 Roles de usuario

| Rol | Descripción |
| --- | --- |
| Visitante | Navega el catálogo y arma un carrito sin estar registrado. Puede comprar como invitado. |
| Cliente registrado | Tiene cuenta, datos de entrega guardados e historial de pedidos. |
| Administrador | Los dos dueños del comercio. Gestionan catálogo, stock, precios, cobertura y pedidos. |

### 1.7 Supuestos

- Los dueños son los únicos operadores del sistema y no tienen perfil técnico.
- El stock es único y físico: lo que se vende online sale del mismo depósito que atiende el mostrador.
- La preparación y el reparto de pedidos son procesos manuales, apoyados por el sistema pero no automatizados.
- La zona de cobertura de envío se define por códigos postales y es configurable por el administrador.
- El envío de correo usa `smtp.gmail.com` en el puerto 587 con cifrado STARTTLS. La clave no es la contraseña de la cuenta: Gmail exige una contraseña de aplicación. Esa clave vive fuera del código, en la configuración del entorno, y no se versiona.

---

## 2. Objetivos y metas

### 2.1 Objetivo principal

Desarrollar una tienda web propia que permita a Dietética Los Mirasoles vender su catálogo completo de forma no presencial dentro de GBA Oeste, reemplazando el circuito informal de pedidos por WhatsApp por un flujo de compra autogestionado por el cliente y trazable para los dueños.

### 2.2 Metas específicas

Cada meta se plantea en formato SMART: específica, medible, alcanzable, relevante y acotada en el tiempo.

1. **Catálogo completo publicado.** Cargar y publicar la totalidad del catálogo, unos cien productos con precio, aptitud alimentaria e información nutricional, antes de la puesta en producción del sitio.
2. **Compra autogestionada de punta a punta.** Lograr que un cliente complete el circuito desde el ingreso al catálogo hasta la confirmación del pedido sin intervención de los dueños, en no más de cinco pasos y sin abandonar el sitio.
3. **Búsqueda por aptitud resuelta en el catálogo.** Permitir que un cliente con restricción alimentaria aísle los productos aptos aplicando un único filtro, sin necesidad de abrir cada ficha ni consultar por otro canal.
4. **Cobertura de entrega ampliada y validada.** Extender la zona de venta a domicilio del radio actual de pocas cuadras a la cobertura de GBA Oeste definida por códigos postales, validando la zona automáticamente durante el checkout para no comprometer entregas fuera del área servida.
5. **Experiencia mobile-first.** Garantizar que todo el circuito de compra sea operable desde un teléfono, dado que se espera que la mayoría del tráfico llegue por ese medio, con catálogo, filtros, carrito y checkout usables en pantallas de 360 píxeles de ancho.
6. **Gestión de pedidos trazable.** Registrar cada pedido con número identificatorio y estado, de modo que los dueños puedan ver en una sola pantalla qué pedidos están pendientes de preparación, listos para retiro o despachados.
7. **Autonomía de los dueños sobre el catálogo.** Habilitar la actualización de precio y stock de un producto por parte de los dueños, sin asistencia técnica, en menos de dos minutos por producto.

---

## 3. Requisitos funcionales

Cada requisito lleva identificador y prioridad (alta, media, baja). La prioridad ordena la construcción: los de prioridad alta constituyen el mínimo necesario para poner el sitio en producción.

### 3.1 Catálogo y navegación

- **RF-01 · Catálogo público por categorías** — *Prioridad alta*
  El sistema debe mostrar el catálogo organizado en categorías y subcategorías (harinas sin TACC, granos y legumbres, frutas deshidratadas, hierbas e infusiones, endulzantes, semillas y frutos secos, snacks), navegable sin necesidad de estar autenticado.

- **RF-02 · Ficha de producto** — *Prioridad alta*
  Cada producto debe exponer nombre, descripción, imagen, precio, unidad de venta, etiquetas de aptitud, información nutricional cuando esté disponible y estado de disponibilidad.

- **RF-03 · Etiquetas de aptitud alimentaria** — *Prioridad alta*
  El sistema debe permitir etiquetar productos como sin TACC, apto vegano y sin lactosa, y mostrar esas etiquetas de forma visible tanto en el listado como en la ficha.

- **RF-04 · Filtros de catálogo** — *Prioridad alta*
  El cliente debe poder filtrar el catálogo por categoría y por etiqueta de aptitud, con filtros combinables entre sí y con el resultado actualizado sin recargar la página.

- **RF-05 · Búsqueda de productos** — *Prioridad media*
  El sistema debe ofrecer búsqueda por nombre y palabras clave, insensible a mayúsculas y acentos, con resultados ordenados por relevancia.

- **RF-06 · Estado de disponibilidad** — *Prioridad alta*
  Un producto sin stock debe permanecer visible en el catálogo, marcado como no disponible y sin posibilidad de agregarse al carrito.

- **RF-07 · Ordenamiento del listado** — *Prioridad baja*
  El cliente debe poder ordenar los resultados por precio ascendente, precio descendente y novedades.

### 3.2 Carrito y compra

- **RF-08 · Gestión del carrito** — *Prioridad alta*
  El cliente debe poder agregar productos al carrito, modificar cantidades, quitar ítems y ver el subtotal actualizado en cada operación.

- **RF-09 · Venta fraccionada por gramaje** — *Prioridad media*
  Para los productos que se venden a granel, el sistema debe permitir seleccionar la cantidad en incrementos predefinidos (por ejemplo 250 g, 500 g y 1 kg) y calcular el precio proporcional al gramaje elegido.

- **RF-10 · Persistencia del carrito** — *Prioridad media*
  El carrito debe conservarse ante el cierre del navegador: asociado a la sesión para el visitante y a la cuenta para el cliente registrado.

- **RF-11 · Validación de stock al confirmar** — *Prioridad alta*
  Antes de confirmar el pedido, el sistema debe revalidar la disponibilidad de cada ítem y avisar al cliente si alguno dejó de estar disponible mientras armaba la compra.

### 3.3 Entrega

- **RF-12 · Elección de modalidad de entrega** — *Prioridad alta*
  Durante el checkout el cliente debe elegir entre retiro en el local y envío a domicilio.

- **RF-13 · Validación de cobertura por código postal** — *Prioridad alta*
  Al seleccionar envío a domicilio, el sistema debe validar el código postal ingresado contra las zonas de cobertura configuradas y usarlo para determinar el costo de envío.

- **RF-14 · Cálculo del costo de envío** — *Prioridad alta*
  El sistema debe calcular y mostrar el costo de envío según la zona de cobertura correspondiente al código postal, antes de la confirmación del pedido. El retiro en el local no tiene costo.

- **RF-15 · Monto mínimo para envío** — *Prioridad baja*
  El sistema debe permitir configurar un monto mínimo de compra para habilitar el envío a domicilio, e informarlo al cliente cuando el carrito no lo alcance.

- **RF-16 · Preferencia de horario** — *Prioridad baja*
  El cliente debe poder indicar una franja horaria preferida para el retiro o la entrega, a modo de referencia para la coordinación manual.

### 3.4 Checkout y cobro simulado

- **RF-17 · Datos de contacto y entrega** — *Prioridad alta*
  El checkout debe solicitar nombre, teléfono, correo electrónico y, cuando corresponda envío, el domicilio completo con código postal. Los campos obligatorios deben validarse antes de avanzar.

- **RF-18 · Módulo de cobro simulado** — *Prioridad alta*
  El sistema debe presentar la selección de un medio de pago y resolver la operación mediante un módulo interno de simulación, que devuelve un resultado de aprobado, rechazado o pendiente. No debe integrarse con pasarelas reales ni solicitar ni almacenar datos reales de tarjeta.

- **RF-19 · Resolución del pedido según el resultado del cobro** — *Prioridad alta*
  Un cobro aprobado debe generar el pedido en estado inicial de preparación. Un cobro rechazado debe conservar el carrito intacto y permitir reintentar. Un cobro pendiente debe registrar el pedido a la espera de confirmación manual del administrador.

- **RF-20 · Confirmación de pedido** — *Prioridad alta*
  Al cerrar la compra, el sistema debe mostrar una confirmación con número de pedido, detalle de ítems, total, modalidad de entrega y, si corresponde, la dirección del local para el retiro.

- **RF-21 · Comprobante por correo electrónico** — *Prioridad alta*
  Al confirmar un pedido, el sistema debe enviar un correo real al cliente con el número de pedido, los ítems, el total y la modalidad de entrega. El envío sale por SMTP desde la cuenta de Gmail de prueba. Si el correo no se puede entregar, el pedido igual queda confirmado y el fallo queda registrado.

### 3.5 Cuenta de cliente

- **RF-22 · Registro de cliente** — *Prioridad alta*
  El sistema debe permitir crear una cuenta con nombre, correo electrónico y contraseña, validando que el correo no esté ya registrado.

- **RF-23 · Inicio y cierre de sesión** — *Prioridad alta*
  El cliente registrado debe poder autenticarse con correo y contraseña, y cerrar sesión desde cualquier pantalla.

- **RF-24 · Compra como invitado** — *Prioridad media*
  El sistema debe permitir completar una compra sin crear cuenta, solicitando únicamente los datos necesarios para la entrega y el contacto.

- **RF-25 · Historial de pedidos** — *Prioridad media*
  El cliente registrado debe poder consultar sus pedidos anteriores con fecha, detalle, total y estado actual.

- **RF-26 · Gestión de datos personales y direcciones** — *Prioridad media*
  El cliente debe poder editar sus datos de contacto y guardar una o más direcciones de entrega para reutilizarlas.

- **RF-27 · Recuperación de contraseña** — *Prioridad baja*
  El sistema debe permitir restablecer la contraseña mediante un enlace de un solo uso enviado al correo registrado.

### 3.6 Administración

- **RF-28 · Acceso diferenciado de administrador** — *Prioridad alta*
  El panel de administración debe requerir autenticación con rol de administrador y ser inaccesible para cuentas de cliente.

- **RF-29 · Gestión de productos** — *Prioridad alta*
  El administrador debe poder crear, editar, despublicar y eliminar productos, incluyendo imagen, descripción, precio, unidad de venta, etiquetas de aptitud e información nutricional.

- **RF-30 · Gestión de categorías** — *Prioridad media*
  El administrador debe poder crear, renombrar y reordenar categorías y subcategorías, y asignar productos a ellas.

- **RF-31 · Actualización de precios y stock** — *Prioridad alta*
  El administrador debe poder actualizar precio y stock de un producto desde una vista de edición rápida, sin recorrer el formulario completo.

- **RF-32 · Actualización masiva de precios** — *Prioridad baja*
  El sistema debe permitir aplicar un ajuste porcentual de precios sobre una categoría completa o sobre una selección de productos.

- **RF-33 · Listado y búsqueda de pedidos** — *Prioridad alta*
  El administrador debe ver los pedidos en una sola pantalla, con filtros por estado, modalidad de entrega y rango de fechas, y búsqueda por número de pedido o nombre de cliente.

- **RF-34 · Gestión del ciclo de vida del pedido** — *Prioridad alta*
  El administrador debe poder avanzar el estado de un pedido entre recibido, en preparación, listo para retiro o despachado, entregado y cancelado, quedando registrada la fecha de cada cambio.

- **RF-35 · Configuración de zonas de cobertura** — *Prioridad media*
  El administrador debe poder definir las zonas de cobertura por código postal y asignar a cada una su costo de envío.

- **RF-36 · Notificación de cambio de estado** — *Prioridad baja*
  El sistema debe notificar al cliente por correo electrónico cuando su pedido pase a estado listo para retiro, despachado o cancelado.

- **RF-37 · Reportes básicos de venta** — *Prioridad baja*
  El administrador debe poder consultar total vendido por período, cantidad de pedidos y ranking de productos más vendidos.

- **RF-38 · Alerta de stock bajo** — *Prioridad baja*
  El sistema debe señalar en el panel los productos cuyo stock quedó por debajo de un umbral configurable.

---

## 4. Requisitos no funcionales

- **RNF-01 · Diseño mobile-first y responsive** — *Prioridad alta*
  La interfaz debe diseñarse primero para teléfono y adaptarse a tablet y escritorio. Todo el circuito de compra debe ser operable en pantallas desde 360 píxeles de ancho, sin desplazamiento horizontal.

- **RNF-02 · Rendimiento de navegación** — *Prioridad alta*
  El listado de catálogo debe renderizar en menos de tres segundos sobre una conexión móvil 4G promedio. La aplicación de filtros y la búsqueda deben responder en menos de un segundo.

- **RNF-03 · Usabilidad del panel de administración** — *Prioridad alta*
  El panel debe ser operable por los dueños sin conocimientos técnicos: terminología del rubro, formularios con validación en línea y mensajes de error explicativos. El alta completa de un producto no debe requerir más de un formulario.

- **RNF-04 · Seguridad de acceso** — *Prioridad alta*
  Todo el tráfico debe servirse por HTTPS. Las contraseñas deben almacenarse con función de hash y salt, nunca en texto plano. El control de acceso debe verificarse en el servidor para cada operación, no solo ocultando opciones en la interfaz.

- **RNF-05 · Ausencia de datos sensibles de pago** — *Prioridad alta*
  Al tratarse de cobro simulado, el sistema no debe solicitar, transmitir ni persistir números de tarjeta ni credenciales de medios de pago reales en ningún punto del flujo.

- **RNF-06 · Protección de datos personales** — *Prioridad media*
  El tratamiento de los datos de clientes debe ajustarse a la Ley 25.326 de Protección de Datos Personales: finalidad declarada, consentimiento en el registro y posibilidad de solicitar la baja de la cuenta.

- **RNF-07 · Disponibilidad** — *Prioridad media*
  El sitio debe estar disponible las 24 horas, con las ventanas de mantenimiento programadas fuera del horario comercial del local.

- **RNF-08 · Compatibilidad de navegadores** — *Prioridad media*
  La aplicación debe funcionar correctamente en las dos últimas versiones estables de Chrome, Firefox, Safari y Edge, tanto en escritorio como en móvil.

- **RNF-09 · Escalabilidad del catálogo y del tráfico** — *Prioridad media*
  La arquitectura debe sostener el crecimiento del catálogo más allá de los cien productos iniciales y absorber picos de tráfico por promociones sin degradación perceptible.

- **RNF-10 · Integridad del stock** — *Prioridad alta*
  El descuento de stock debe ser consistente ante compras simultáneas del mismo producto, evitando vender más unidades de las disponibles.

- **RNF-11 · Respaldo de datos** — *Prioridad media*
  La base de datos debe respaldarse de forma automática al menos una vez por día, con procedimiento de restauración probado.

- **RNF-12 · Mantenibilidad** — *Prioridad media*
  El código debe organizarse en módulos con responsabilidades separadas, versionarse en un repositorio Git y contar con documentación mínima de instalación y despliegue.

- **RNF-13 · Trazabilidad de operaciones** — *Prioridad baja*
  Las acciones sensibles del administrador, como cambios de precio, de stock y de estado de pedido, deben registrarse con usuario, fecha y valor anterior.

- **RNF-14 · Accesibilidad básica** — *Prioridad baja*
  La interfaz debe cumplir pautas básicas de accesibilidad: contraste suficiente, texto alternativo en imágenes de producto, navegación por teclado y tamaño de tipografía legible.

- **RNF-15 · Localización** — *Prioridad media*
  Toda la interfaz debe estar en español, con precios en pesos argentinos, separador decimal de coma y fechas en formato dd/mm/aaaa.
