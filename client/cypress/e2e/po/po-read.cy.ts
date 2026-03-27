describe('PO - View Purchase Order', () => {
  it('Visits the /viewer page and finds an order', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'Viewer').click();
    cy.wait(1000);
    cy.get('mat-select[formControlName=vendor]').click().get('mat-option').contains('Roed Lenon').click();
    cy.get('mat-select[formControlName=purchaseorder]').click().get('mat-option').last().click();
    cy.contains('P-01');
  });
});
