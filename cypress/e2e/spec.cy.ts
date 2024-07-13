describe('Editor Test', () => {
  it('displays the editor', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('#check Nat')
    cy.get('.squiggly-info') // blue underline under #check
    cy.iframe().contains('Nat : Type')
  })
})