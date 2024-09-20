describe('Editor Test', () => {
  it('displays the editor', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('#check 0')
      .should(($p: any) => {
        // ...
        expect(getComputedStyle($p.get(0)).fontFamily).to.match(/^"?JuliaMono"?/)
      })
  })

  it('displays the infoview', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Note: this is because the server throws sometimes random errors about
      // the Lean server being stopped/restarted etc. which don't prevent the site from working
      return false
    })
    cy.visit('http://localhost:5173/')
    cy.get('.squiggly-info')
    cy.iframe().contains('0 : Nat')
  })

  it('changes themes', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Note: see note about console errors above
      return false
    })
    cy.visit('http://localhost:5173/')
    cy.get('[data-cy="theme-light"]').click()
    cy.contains('#check 0')
      .should(($p: any) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#ffffff")
      })
    cy.get('[data-cy="theme-dark"]').click()
    cy.contains('#check 0')
      .should(($p: any) => {
        expect(getComputedStyle($p.get(0)).getPropertyValue('--vscode-editor-background')).to.equal("#1e1e1e")
      })

    cy.get('iframe').should('have.length', 1)
  })

  it('inputs unicode', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Note: see note about console errors above
      return false
    })
    cy.visit('http://localhost:5173/')
    cy.get('[data-cy="leader-backslash"]').click()
    cy.contains('#check 0').click("left")
    cy.get('body').type('\\alpha')
    cy.contains('α')
    cy.get('[data-cy="leader-comma"]').click()
    cy.contains('α#check 0').click("left")
    cy.get('body').type(',bet ')
    cy.contains('β α#check 0')// cursor should behind the space!
    cy.get('body').type(',gamma')
    cy.contains('β γα#check 0')
  })

  it('allows for multiple editors', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Note: see note about console errors above
      return false
    })
    cy.visit('http://localhost:5173/')
    cy.contains('#check 0')
    cy.get('[data-cy="number-editors"]').type('{selectall}').type('2')
    cy.contains('#check 1')
    cy.contains('#check 0')
    cy.get('.squiggly-info')
    cy.contains('#check 1').click()
    cy.iframe().contains('1 : Nat')
    cy.contains('#check 0').click()
    cy.iframe().contains('0 : Nat')
  })

  it('check leanOptions', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Note: see note about console errors above
      return false
    })
    cy.visit('http://localhost:5173/')
    cy.contains('#print f')
    cy.contains('#print f').click()
    cy.iframe().contains('def f : Nat → Nat := fun x ↦ x + 1')
  })
})