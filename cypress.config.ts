import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 10000, // for firefox on linux
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
