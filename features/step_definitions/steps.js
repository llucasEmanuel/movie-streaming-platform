const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

Given("que eu estou autenticado como {string}", function (string) {
  // Write code here that turns the phrase above into concrete actions

  if (string === "administrador") {
    console.log("Oii");
  }
});

Given("eu estou na página {string}", function (string) {
  // Write code here that turns the phrase above into concrete actions

  if (string === "Adicionar novo filme") {
    console.log("Oii de novo");
  }
});
