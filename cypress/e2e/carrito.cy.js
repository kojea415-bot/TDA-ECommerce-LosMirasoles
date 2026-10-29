import {
  agregarDesdeCatalogo,
  ingresarPorUI,
  irAlCarrito,
  pesos,
  prepararTienda,
  producto,
  verificarSinNoPrevistos,
} from './ayudas'

describe('Carrito', () => {
  afterEach(verificarSinNoPrevistos)

  it('HU-04: agregar, sumar con tope de stock, restar, quitar y vaciar', () => {
    const harina = producto({ nombre: 'Harina de arroz', precio: 1200, stock: 3 })
    const miel = producto({ nombre: 'Miel de campo', precio: 2500, stock: 5 })
    prepararTienda({ productos: [harina, miel] })

    const subtotal = (total) => cy.get('.carrito-cierre strong').should('have.text', pesos(total))
    const fila = (nombre) => cy.contains('.carrito-fila', nombre)

    cy.visit('/')

    // El mismo producto dos veces: una fila con cantidad 2 y Header (2)
    agregarDesdeCatalogo('Harina de arroz')
    agregarDesdeCatalogo('Harina de arroz')
    cy.contains('a', 'Carrito (2)').should('exist')
    agregarDesdeCatalogo('Miel de campo')
    irAlCarrito()
    cy.get('.carrito-fila').should('have.length', 2)
    fila('Harina de arroz').find('.cantidad span').should('have.text', '2')
    subtotal(1200 * 2 + 2500)

    // El + llega al tope de stock (3) y se deshabilita
    fila('Harina de arroz').find('.cantidad button').last().click()
    fila('Harina de arroz').find('.cantidad span').should('have.text', '3')
    fila('Harina de arroz').find('.cantidad button').last().should('be.disabled')
    subtotal(1200 * 3 + 2500)

    // El − hasta 0 quita la fila
    for (let i = 0; i < 3; i++) {
      fila('Harina de arroz').find('.cantidad button').first().click()
    }
    cy.contains('.carrito-fila', 'Harina de arroz').should('not.exist')
    subtotal(2500)

    // "Quitar" elimina la fila
    cy.contains('a', 'Seguir comprando').click()
    agregarDesdeCatalogo('Harina de arroz')
    irAlCarrito()
    subtotal(1200 + 2500)
    fila('Harina de arroz').contains('button', 'Quitar').click()
    cy.contains('.carrito-fila', 'Harina de arroz').should('not.exist')
    subtotal(2500)

    // "Vaciar carrito" deja el carrito vacío
    cy.contains('button', 'Vaciar carrito').click()
    cy.contains('Tu carrito está vacío').should('be.visible')
    cy.contains('a', 'Carrito (0)').should('exist')
  })

  it('HU-04/HU-05: "Ir a pagar" solo con sesión y con productos', () => {
    const harina = producto({ nombre: 'Harina de arroz', precio: 1200, stock: 3 })
    prepararTienda({ productos: [harina] })

    cy.visit('/')

    // Sin sesión y con producto: no hay botón
    agregarDesdeCatalogo('Harina de arroz')
    irAlCarrito()
    cy.contains('.carrito-fila', 'Harina de arroz').should('exist')
    cy.contains('button', 'Ir a pagar').should('not.exist')

    // Con sesión y producto: aparece (el carrito se conserva al ingresar)
    ingresarPorUI()
    irAlCarrito()
    cy.contains('button', 'Ir a pagar').should('be.visible')

    // Con sesión y carrito vacío: no hay botón
    cy.contains('button', 'Vaciar carrito').click()
    cy.contains('Tu carrito está vacío').should('be.visible')
    cy.contains('button', 'Ir a pagar').should('not.exist')

    // Con sesión y un producto: el botón lleva a /pago
    cy.contains('a', 'Ver productos').click()
    agregarDesdeCatalogo('Harina de arroz')
    irAlCarrito()
    cy.contains('button', 'Ir a pagar').click()
    cy.location('pathname').should('eq', '/pago')
  })
})
