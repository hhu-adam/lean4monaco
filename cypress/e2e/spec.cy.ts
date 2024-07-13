describe('Editor Test', () => {
  it('displays the editor', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('#check Nat')
    cy.wait(5000);
    cy.iframe().contains('Nat : Type')
  })
})