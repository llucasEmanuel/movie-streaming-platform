const { defineConfig } = require("cypress");
const cucumber = require("cypress-cucumber-preprocessor").default;

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.feature",
    supportFile: "cypress/support/index.js",
    setupNodeEvents(on, config) {
      on("file:preprocessor", cucumber());
      return config;
    },
  },
  env: {
    cucumber: {
      features: "./cypress/e2e",
      stepDefinitions: "./cypress/support/step_definitions",
    },
  },
  video: false,
});
