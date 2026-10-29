import { bloquearSupabase, responder, usuarioAuth, verificarSinNoPrevistos } from './ayudas'

// Rellena el panel "Crear cuenta" con datos inventados (contraseña aleatoria)
function completarAlta() {
  cy.get('#nombre').type('Ana Prueba')
  cy.get('#correo-alta').type('nueva@prueba.test')
  cy.get('#contrasenia-alta').type(`x${Cypress._.random(1e9)}`, { log: false })
  cy.contains('button', 'Registrarme').click()
}

describe('Ingreso', () => {
  beforeEach(() => {
    bloquearSupabase()
    cy.intercept({ method: 'GET', pathname: '/rest/v1/productos' }, (req) => responder(req, []))
    cy.intercept({ method: 'GET', pathname: '/rest/v1/categorias' }, (req) => responder(req, []))
  })

  afterEach(verificarSinNoPrevistos)

  it('HU-05: registro con correo ya registrado muestra el aviso y no navega', () => {
    // Supabase devuelve el usuario con identities vacío cuando el correo ya existe
    cy.intercept({ method: 'POST', pathname: '/auth/v1/signup' }, (req) =>
      responder(req, usuarioAuth({ identities: [] }))
    ).as('alta')

    cy.visit('/ingreso')
    completarAlta()
    cy.wait('@alta')

    cy.get('[role="alert"]').should('have.text', 'Ese correo ya está registrado.')
    cy.location('pathname').should('eq', '/ingreso')
  })

  it('HU-05: alta exitosa navega al inicio', () => {
    // Usuario nuevo: identities con un elemento
    cy.intercept({ method: 'POST', pathname: '/auth/v1/signup' }, (req) =>
      responder(req, usuarioAuth())
    ).as('alta')

    cy.visit('/ingreso')
    completarAlta()
    cy.wait('@alta')

    cy.location('pathname').should('eq', '/')
    cy.get('[role="alert"]').should('not.exist')
  })
})
