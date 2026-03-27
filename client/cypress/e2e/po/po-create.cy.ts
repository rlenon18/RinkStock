describe('PO - Create', () => {
  it('Visits the /generator page and creates a purchase order', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'Generator').click();
    cy.wait(1000);
    cy.get('mat-select[formControlName=vendorId]').click().get('mat-option').contains('Roed Lenon').click();
    cy.get('mat-select[formControlName=productId]').click().get('mat-option').contains('Hockey Stick - Pro Carbon').click();
    cy.get('button').contains('Add').click();
    cy.get('button').contains('Save').click();
    cy.wait(1000);
    cy.contains('created');
  });
});
