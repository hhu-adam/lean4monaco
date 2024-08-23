import { defineConfig } from "cypress";

export default defineConfig({
  // defaultCommandTimeout: 100000,
  experimentalWebKitSupport: true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
