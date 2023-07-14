import { faker } from "@faker-js/faker/locale/en";

describe("Scenarios where authentication is a pre-condition", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/notes").as("getNotes");
    cy.sessionLogin();
  });

  it.only("CRUDs a note", () => {
    const noteDescription = faker.lorem.words(4);

    cy.createNote(noteDescription);
    cy.wait("@getNotes", { timeout: 50000 });

    const updatedNoteDescription = faker.lorem.words(4);
    const attachFile = true;

    cy.editNote(noteDescription, updatedNoteDescription, attachFile);
    cy.wait("@getNotes", { timeout: 50000 });

    cy.deleteNote(updatedNoteDescription);
    cy.wait("@getNotes", { timeout: 50000 });
  });

  it.only("successfully submits the settings form", () => {
    cy.intercept("POST", "**/prod/billing").as("paymentRequest");

    cy.fillSettingsFormAndSubmit();

    cy.wait("@getNotes", { timeout: 50000 });
    cy.wait("@paymentRequest").its("state").should("be.equal", "Complete");
  });

  it.only("logs out", () => {
    cy.visit("/");
    cy.wait("@getNotes", { timeout: 50000 });

    if (
      Cypress.config("viewportWidth") < Cypress.env("viewportWidthBreakpoint")
    ) {
      cy.get(".navbar-toggle.collapsed").should("be.visible").click();
    }

    cy.contains(".nav a", "Logout").click();

    cy.get("#email").should("be.visible");
  });
});
