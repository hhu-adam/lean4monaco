import { defineConfig } from "cypress";

// default timeout was 4000.
// Infoview loading is slow on Windows…

export default defineConfig({
  defaultCommandTimeout: 40000,
  experimentalWebKitSupport: true,
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chromium' && process.env.CYPRESS_USER_AGENT) {
          launchOptions.args.push(`--user-agent=${process.env.CYPRESS_USER_AGENT}`)
          return launchOptions
        }
      })
    },
  },
});
