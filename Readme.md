<div align="center">
  <img width="170" src="https://playwright.dev/img/playwright-logo.svg" alt="Playwright Logo">
</div>

# Running and Using Playwright with Cucumber Base Repo

This guide explains how to run and use Playwright with Cucumber for automated testing of web applications.

**Prerequisites**

- Node.js installed on your system
- A project set up with Playwright and Cucumber

**Step 1: Install Playwright and Cucumber**

To install Playwright and Cucumber, run the following commands in your project directory:

```bash
npm install playwright
npm install @cucumber/cucumber
```

**Step 2: Set up Playwright**

Create a new file `playwright.config.js` with the following content:

```javascript
module.exports = {
	// Your Playwright configuration
};
```

**Step 3: Write Cucumber Tests**

Create a new file `features/login.feature` with the following content:

```gherkin
Feature: User Authentication

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I login with valid credentials
    Then I should be logged in successfully

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I login with invalid credentials
    Then I should see an error message
```

**Step 4: Implement Step Definitions**

Create a new file `steps/login.steps.ts` with the following content:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { World } from '../support/world';

Given('I am on the login page', async function (this: World) {
	const loginPage = new LoginPage(this.page);
	await loginPage.navigate('/login');
});

When('I login with valid credentials', async function (this: World) {
	const loginPage = new LoginPage(this.page);
	await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
});

Then('I should be logged in successfully', async function (this: World) {
	await expect(this.page.getByText('Welcome')).toBeVisible();
});
```

**Step 5: Run the Tests**

To run the tests, execute the following command in your project directory:

```bash
npx cucumber-js
```

## Project Structure

```mermaid
graph TD
    A[Project Root] --> B[src/]
    A --> C[api-tests/]
    A --> D[cucumber.cjs]
    A --> E[package.json]

    B --> F[features/*.feature]
    B --> G[steps/*.ts]
    B --> H[support/]
    B --> I[pages/]

    C --> J[features/*.feature]
    C --> K[steps/*.ts]
    C --> L[support/]

    K --> K1[users-api.steps.ts]
    K --> K2[echo-api.steps.ts]

    L --> L1[api-client.ts]
    L --> L2[world.ts]
    L --> L3[curl-formatter.ts]

    H --> H1[world.ts]
    H --> H2[hooks.ts]
```

## Code Locations

### Configuration

- [package.json](./package.json) - Contains test scripts and dependencies
- [cucumber.cjs](./cucumber.cjs) - Cucumber configuration with profiles

### API Tests

- [api-tests/features/](./api-tests/features/) - API test feature files
- [api-tests/steps/echo-api.steps.ts](./api-tests/steps/echo-api.steps.ts) - Echo API test steps
- [api-tests/steps/users-api.steps.ts](./api-tests/steps/users-api.steps.ts) - User API test steps
- [api-tests/support/api-client.ts](./api-tests/support/api-client.ts) - API client for making requests
- [api-tests/support/world.ts](./api-tests/support/world.ts) - Custom world for API tests
- [api-tests/support/curl-formatter.ts](./api-tests/support/curl-formatter.ts) - Formats requests as curl commands

### UI Tests

- [src/features/](./src/features/) - UI test feature files
- [src/steps/](./src/steps/) - UI test step definitions
- [src/pages/](./src/pages/) - Page object models
- [src/support/world.ts](./src/support/world.ts) - Custom world for UI tests
- [src/support/hooks.ts](./src/support/hooks.ts) - Setup and teardown hooks

## Running Tests

- `npm test` - Run UI tests
- `npm run test:api` - Run API tests
- `npm run test:all` - Run all tests
- `npm run test:api:smoke` - Run API smoke tests
- `npm run test:echo` - Run Echo API tests specifically

**Documentation Links**

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)

By following these steps, you can successfully integrate Playwright with Cucumber for automated testing of web applications.
