import {
  USUARIO,
  agregarDesdeCatalogo,
  ingresarPorUI,
  irAlCarrito,
  pesos,
  verCarrito,
  prepararTienda,
  producto,
  responder,
  simularZonas,
  verificarSinNoPrevistos,
} from './ayudas'

const harina = producto({ nombre: 'Harina de arroz', precio: 1200, stock: 5 })

// Pedido que devolvería la función cuando todo sale bien
const pedidoOk = (cantidad) => ({
  id: 4821,
  estado: 'en_preparacion',
  items: [{ productoId: harina.id, nombre: harina.nombre, cantidad, precioUnitario: harina.precio }],
  total: harina.precio * cantidad,
  modalidad: 'retiro',
  mail_ok: true,
})

// Entra, agrega la harina `cantidad` veces y llega a /pago con clics (el carrito vive en memoria)
function llegarAPago(cantidad = 2) {
  cy.visit('/')
  ingresarPorUI()
  for (let i = 0; i < cantidad; i++) agregarDesdeCatalogo(harina.nombre)
  irAlCarrito()
  cy.contains('button', 'Ir a pagar').click()
  cy.location('pathname').should('eq', '/pago')
}

// Paso 1 con retiro en el local y datos de contacto.
// Nombre y correo vienen precargados y la pantalla vuelve a llenarlos si quedan vacíos,
// por eso se pisan con {selectall} en vez de usar clear() (que deja el correo duplicado).
function completarPaso1Retiro() {
  cy.contains('label', 'Retiro en el local').find('input').check()
  cy.get('#nombre-pedido').type('{selectall}Ana Prueba')
  cy.get('#telefono').type('1100000000')
  cy.get('#correo-pedido').type(`{selectall}${USUARIO.email}`)
  cy.contains('button', 'Continuar').click()
  cy.contains('Cobro simulado').should('be.visible')
}

function elegirResultado(texto) {
  cy.contains('label', texto).find('input').check()
  cy.contains('button', 'Confirmar pedido').click()
}

describe('Checkout', () => {
  beforeEach(() => {
    prepararTienda({ productos: [harina] })
    simularZonas({ 1754: 1500 })
  })

  afterEach(verificarSinNoPrevistos)

  it('HU-08: pago aprobado confirma el pedido y vacía el carrito', () => {
    cy.intercept({ method: 'POST', pathname: '/functions/v1/confirmar-pedido' }, (req) =>
      responder(req, pedidoOk(2), 201)
    ).as('confirmar')

    llegarAPago(2)
    completarPaso1Retiro()
    elegirResultado('Aprobado')

    // El body trae solo ids y cantidades: sin precios ni datos de tarjeta
    cy.wait('@confirmar').then(({ request }) => {
      const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
      expect(body.resultadoCobro).to.eq('aprobado')
      expect(body.items).to.deep.eq([{ productoId: harina.id, cantidad: 2 }])
      expect(JSON.stringify(body)).not.to.match(/precio|tarjeta|card|cvv|vencimiento/i)
    })

    // Pantalla de confirmación
    cy.location('pathname').should('eq', '/confirmacion')
    cy.contains('Pedido #4821 confirmado').should('be.visible')
    cy.contains('En preparación').should('be.visible')
    cy.contains(`${harina.nombre} × 2`).should('be.visible')
    cy.get('.resumen-total').should('contain', pesos(harina.precio * 2))
    verCarrito(0)
  })

  it('HU-08: pago rechazado no registra el pedido y permite reintentar', () => {
    // Rechazado: 200 sin id. Cualquier otro resultado: pedido confirmado.
    cy.intercept({ method: 'POST', pathname: '/functions/v1/confirmar-pedido' }, (req) => {
      const rechazado = req.body.resultadoCobro === 'rechazado'
      responder(req, rechazado ? { estado: 'rechazado' } : pedidoOk(2), rechazado ? 200 : 201)
    }).as('confirmar')

    llegarAPago(2)
    completarPaso1Retiro()
    elegirResultado('Rechazado')
    cy.wait('@confirmar')

    // Sigue en /pago con el aviso y el carrito intacto
    cy.location('pathname').should('eq', '/pago')
    cy.get('[role="alert"]').should('contain', 'El cobro fue rechazado')
    verCarrito(2)
    cy.get('.resumen').should('contain', `${harina.nombre} × 2`)
    cy.get('.resumen-total').should('contain', pesos(harina.precio * 2))

    // Reintento con otro resultado
    elegirResultado('Aprobado')
    cy.wait('@confirmar').its('request.body.resultadoCobro').should('eq', 'aprobado')
    cy.location('pathname').should('eq', '/confirmacion')
    cy.contains('Pedido #4821 confirmado').should('be.visible')
  })

  it('HU-06: sin stock suficiente muestra el producto y deja el carrito intacto', () => {
    // La función responde 409 con el nombre del producto
    cy.intercept({ method: 'POST', pathname: '/functions/v1/confirmar-pedido' }, (req) =>
      responder(req, { error: 'Stock insuficiente', producto: harina.nombre }, 409)
    ).as('confirmar')

    llegarAPago(2)
    completarPaso1Retiro()
    elegirResultado('Aprobado')
    cy.wait('@confirmar')

    cy.get('[role="alert"]').should('have.text', `No alcanza el stock de ${harina.nombre}.`)
    cy.location('pathname').should('eq', '/pago')
    verCarrito(2)
    cy.get('.resumen').should('contain', `${harina.nombre} × 2`)
    cy.get('.resumen-total').should('contain', pesos(harina.precio * 2))
  })

  it('HU-07: retiro vs envío, costo por zona y zona sin cobertura', () => {
    const subtotal = harina.precio * 2
    llegarAPago(2)

    // Retiro: envío $ 0 y sin domicilio ni código postal
    cy.contains('label', 'Retiro en el local').find('input').check()
    cy.contains('label', `envío ${pesos(0)}`).should('be.visible')
    cy.get('#domicilio').should('not.exist')
    cy.get('#cp').should('not.exist')
    cy.get('.resumen-linea').should('contain', pesos(0))
    cy.get('.resumen-total').should('contain', pesos(subtotal))

    // Envío: aparecen los campos; CP 1754 cuesta 1500 y se suma al total
    cy.contains('label', 'Envío a domicilio').find('input').check()
    cy.get('#domicilio').should('be.visible')
    cy.get('#cp').type('1754')
    cy.contains('button', 'Verificar zona').click()
    cy.contains(`Costo de envío ${pesos(1500)}`).should('be.visible')
    cy.get('.resumen-linea').should('contain', pesos(1500))
    cy.get('.resumen-total').should('contain', pesos(subtotal + 1500))

    // Volver a retiro: el total vuelve al subtotal
    cy.contains('label', 'Retiro en el local').find('input').check()
    cy.get('.resumen-linea').should('contain', pesos(0))
    cy.get('.resumen-total').should('contain', pesos(subtotal))

    // CP sin zona: costo $ 0 y se puede avanzar al paso 2
    cy.contains('label', 'Envío a domicilio').find('input').check()
    cy.get('#cp').clear().type('9999')
    cy.contains('button', 'Verificar zona').click()
    cy.contains(`Costo de envío ${pesos(0)}`).should('be.visible')
    cy.get('#domicilio').type('Calle Falsa 123')
    cy.get('#nombre-pedido').type('{selectall}Ana Prueba')
    cy.get('#telefono').type('1100000000')
    cy.get('#correo-pedido').type(`{selectall}${USUARIO.email}`)
    cy.contains('button', 'Continuar').click()
    cy.contains('Cobro simulado').should('be.visible')
    cy.get('.resumen-total').should('contain', pesos(subtotal))
  })
})
