// Prueba de ejemplo: confirma que la app abre
describe('App', () => {
  it('muestra el título de la tienda', () => {
    cy.visit('/')
    cy.contains('Taller de Aplicaciones')
  })
})
