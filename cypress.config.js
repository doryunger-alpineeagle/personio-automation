const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.personio.de',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Ensure proper headless execution
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: false,
    env: {
      PERSONIO_USERNAME: process.env.PERSONIO_USERNAME || '',
      PERSONIO_PASSWORD: process.env.PERSONIO_PASSWORD || '',
      PERSONIO_EMPLOYEE_ID: process.env.PERSONIO_EMPLOYEE_ID || '',
      PERSONIO_COMPANY_DOMAIN: process.env.PERSONIO_COMPANY_DOMAIN || '',
      PREVIOUS_MONTH: process.env.PREVIOUS_MONTH || 'false'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
}) 