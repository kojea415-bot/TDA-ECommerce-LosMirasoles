import { prepararTienda, producto, verCarrito, verificarSinNoPrevistos } from './ayudas'

describe('Catálogo', () => {
  afterEach(verificarSinNoPrevistos)

  it('HU-03: los filtros se combinan sin recargar', () => {
    const almacen = { id: 'cat-almacen', nombre: 'Almacén' }
    const bebidas = { id: 'cat-bebidas', nombre: 'Bebidas' }
    const harina = producto({ nombre: 'Harina de arroz', sin_tacc: true, vegano: true, categoria_id: almacen.id })
    const galletas = producto({ nombre: 'Galletas de avena', sin_tacc: true, vegano: true, sin_lactosa: true, categoria_id: bebidas.id })
    const leche = producto({ nombre: 'Leche de almendras', vegano: true, sin_lactosa: true, categoria_id: almacen.id })
    const pan = producto({ nombre: 'Pan de molde', sin_tacc: true, categoria_id: bebidas.id })
    const sal = producto({ nombre: 'Sal marina', categoria_id: almacen.id }) // sin etiquetas

    prepararTienda({ productos: [harina, galletas, leche, pan, sal], categorias: [almacen, bebidas] })
    cy.visit('/')
    cy.get('.tarjeta').should('have.length', 5)

    // En desarrollo React ejecuta el efecto dos veces (StrictMode), así que no se
    // compara contra 1: se anota cuántos GET hubo al cargar y se compara al final
    let pedidosAlCargar
    cy.get('@productos.all').then((pedidos) => {
      pedidosAlCargar = pedidos.length
    })

    const filtro = (texto) => cy.contains('label', texto).find('input')

    // Sin TACC + Vegano: solo los que tienen ambas etiquetas
    filtro('Sin TACC').check()
    filtro('Vegano').check()
    cy.get('.tarjeta').should('have.length', 2)
    cy.contains('.tarjeta', 'Harina de arroz').should('exist')
    cy.contains('.tarjeta', 'Galletas de avena').should('exist')
    // El producto sin etiquetas desaparece con filtros activos
    cy.contains('.tarjeta', 'Sal marina').should('not.exist')

    // Sumar una categoría restringe más
    cy.contains('button.chip', 'Almacén').click()
    cy.get('.tarjeta').should('have.length', 1)
    cy.contains('.tarjeta', 'Harina de arroz').should('exist')

    // Volver a "Todas" devuelve productos
    cy.contains('button.chip', 'Todas').click()
    cy.get('.tarjeta').should('have.length', 2)

    // Desactivar un filtro también devuelve productos
    filtro('Vegano').uncheck()
    cy.get('.tarjeta').should('have.length', 3)
    cy.contains('.tarjeta', 'Pan de molde').should('exist')
    cy.contains('.tarjeta', 'Sal marina').should('not.exist')

    // Sin filtros vuelve el producto sin etiquetas
    filtro('Sin TACC').uncheck()
    cy.get('.tarjeta').should('have.length', 5)

    // Todo se filtró en el navegador: los filtros no volvieron a pedir productos
    cy.get('@productos.all').then((pedidos) => {
      expect(pedidos.length).to.equal(pedidosAlCargar)
    })
  })

  it('HU-02: un producto sin stock no se puede agregar y uno con stock sí', () => {
    const agotado = producto({ nombre: 'Avena agotada', stock: 0 })
    const disponible = producto({ nombre: 'Miel de campo', stock: 4 })

    prepararTienda({ productos: [agotado, disponible] })
    cy.visit('/')

    // Catálogo: se ve, dice sin stock y no tiene botón Agregar
    cy.contains('.tarjeta', 'Avena agotada').within(() => {
      cy.contains('Sin stock').should('be.visible')
      cy.contains('button', 'Agregar').should('not.exist')
    })

    // Ficha: "No disponible" y sin "Agregar al carrito"
    cy.contains('h2 a', 'Avena agotada').click()
    cy.contains('.disponible', 'No disponible').should('be.visible')
    cy.contains('button', 'Agregar al carrito').should('not.exist')
    cy.contains('a', 'Volver al catálogo').click()

    // Con stock: se agrega y el Header lo refleja
    verCarrito(0)
    cy.contains('.tarjeta', 'Miel de campo').contains('button', 'Agregar').click()
    verCarrito(1)
  })
})
