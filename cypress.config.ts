import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 40000, // default timeout was 4000. Infoview loading is slow on Windows...
  experimentalWebKitSupport: true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
