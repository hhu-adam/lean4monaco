describe('Editor Test', () => {
  it('displays the editor', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('#check Nat')
      .should(($p) => {
        // ...
        expect(getComputedStyle($p.get(0)).fontFamily).to.match(/^JuliaMono/)
      })
  })
  it('displays the infoview', () => {
    cy.visit('http://localhost:5173/')
    cy.get('.squiggly-info') // blue underline under #check (This is important to wait for before checking the infoview.)
    cy.iframe().contains('Nat : Type')
  })
  it('changes themes', () => {
    cy.visit('http://localhost:5173/')
    cy.get('[data-cy="theme-light"]').click()
    cy.contains('#check Nat')
      .should(($p) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#ffffff")
      })
    cy.get('[data-cy="theme-dark"]').click()
    cy.contains('#check Nat')
      .should(($p) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#1e1e1e")
      })
  })
})