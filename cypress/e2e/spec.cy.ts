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
    cy.get('.squiggly-info')
    cy.iframe().contains('Nat : Type')
  })
  it('changes themes', () => {

    cy.visit('http://localhost:5173/')
    cy.get('[data-cy="theme-light"]').click()
    cy.contains('#check Nat')
      .should(($p) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#ffffff")
      })
    cy.wait(4000)
    cy.get('[data-cy="theme-dark"]').click()
    cy.wait(4000)
    cy.contains('#check Nat')
      .should(($p) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#1e1e1e")
      })
  })
  it('inputs unicode', () => {

    cy.visit('http://localhost:5173/')
    cy.get('[data-cy="leader-backslash"]').click()
    cy.contains('#check Nat').click("left")
    cy.get('body').type('\\alpha')
    cy.contains('α')
    cy.wait(4000)
    cy.get('[data-cy="leader-comma"]').click()
    cy.wait(4000)
    cy.contains('#check Nat').click("left")
    cy.get('body').type(',beta')
    cy.contains('β')
  })
})