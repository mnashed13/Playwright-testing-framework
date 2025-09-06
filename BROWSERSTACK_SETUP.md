# BrowserStack Integration Setup

This document provides instructions for setting up and using BrowserStack with your Playwright testing framework.

## Prerequisites

1. **BrowserStack Account**: Sign up for a BrowserStack account at [browserstack.com](https://www.browserstack.com)
2. **Access Credentials**: Get your username and access key from your BrowserStack account dashboard

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# BrowserStack Configuration
BROWSERSTACK_USERNAME=your_browserstack_username
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key
BROWSERSTACK_PROJECT_NAME=Playwright Testing Framework
BROWSERSTACK_BUILD_NAME=build_${BUILD_NUMBER:-local}
BROWSERSTACK_SESSION_NAME=playwright_test_session

# BrowserStack Local Testing (set to true if testing localhost)
BROWSERSTACK_LOCAL=false

# BrowserStack Debug (set to true for debugging)
BROWSERSTACK_DEBUG=false

# BrowserStack Console Logs (set to true to enable console logs)
BROWSERSTACK_CONSOLE_LOGS=true

# BrowserStack Network Logs (set to true to enable network logs)
BROWSERSTACK_NETWORK_LOGS=true

# Your application configuration
BASE_URL=https://your-app-url.com
USERNAME=your_test_username
PASSWORD=your_test_password
```

## GitHub Secrets Setup

Add the following secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `BROWSERSTACK_USERNAME`: Your BrowserStack username
   - `BROWSERSTACK_ACCESS_KEY`: Your BrowserStack access key
   - `BASE_URL`: Your application URL (optional, defaults to Google)
   - `TEST_USERNAME`: Test user credentials (if needed)
   - `TEST_PASSWORD`: Test user password (if needed)

## Available Test Commands

### Local Testing

```bash
# Run tests locally
npm test

# Run tests in headed mode
npm run test:headed
```

### BrowserStack Testing

```bash
# Run all BrowserStack tests
npm run test:browserstack

# Run BrowserStack smoke tests only
npm run test:browserstack:smoke

# Run specific browser on BrowserStack
npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome
npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-firefox
npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-safari
npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-edge
```

### Cucumber with BrowserStack

```bash
# Run Cucumber tests on BrowserStack
npm run test:browserstack
```

## Supported Browsers and Devices

### Desktop Browsers

- Chrome (Windows 11)
- Firefox (Windows 11)
- Safari (macOS Monterey)
- Edge (Windows 11)

### Mobile Devices

- Samsung Galaxy S21 (Android 11.0) - Chrome
- iPhone 12 (iOS 14) - Safari

## Configuration Files

### BrowserStack Configuration (`browserstack.config.ts`)

Contains BrowserStack-specific settings, capabilities, and browser configurations.

### Playwright BrowserStack Config (`playwright.browserstack.config.ts`)

Dedicated Playwright configuration for BrowserStack testing with optimized settings.

### Cucumber Configuration (`cucumber.cjs`)

Updated to include BrowserStack profile for Cucumber-based testing.

## GitHub Actions Workflows

### BrowserStack UI Tests (`browserstack-ui-tests.yml`)

- Runs tests on multiple browsers in parallel
- Includes mobile device testing
- Uploads test results and artifacts
- Supports both Playwright and Cucumber tests

## BrowserStack Helper (`src/support/browserstack.ts`)

Utility class for:

- Managing BrowserStack connections
- Setting test status
- Adding test comments
- Handling browser capabilities

## Usage Examples

### In Your Test Steps

```typescript
import { browserStackHelper } from '../support/browserstack';

// Connect to BrowserStack
const { browser, context, page } =
	await browserStackHelper.connectToBrowserStack('chrome');

// Mark test as passed
await browserStackHelper.markTestStatus(
	'passed',
	'Test completed successfully'
);

// Add test comment
await browserStackHelper.addTestComment('Testing login functionality');

// Disconnect when done
await browserStackHelper.disconnect();
```

### In Your Page Objects

```typescript
import { browserStackHelper } from '../support/browserstack';

export class LoginPage {
	async login(username: string, password: string) {
		// Your login logic here

		// Mark test status based on result
		if (loginSuccessful) {
			await browserStackHelper.markTestStatus('passed', 'Login successful');
		} else {
			await browserStackHelper.markTestStatus('failed', 'Login failed');
		}
	}
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify your BrowserStack credentials are correct
   - Check that your account has sufficient credits

2. **Connection Timeouts**

   - Increase timeout values in your configuration
   - Check your network connectivity

3. **Test Failures**
   - Review BrowserStack logs in your dashboard
   - Check screenshot and video recordings
   - Verify your application is accessible from BrowserStack

### Debug Mode

Enable debug mode by setting `BROWSERSTACK_DEBUG=true` in your environment variables.

### Local Testing

If testing against localhost, set `BROWSERSTACK_LOCAL=true` and ensure BrowserStack Local is running.

## BrowserStack Dashboard

Access your test results and session recordings at:

- [BrowserStack Automate Dashboard](https://automate.browserstack.com/dashboard/v2)

## Support

For BrowserStack-specific issues:

- [BrowserStack Documentation](https://www.browserstack.com/docs)
- [BrowserStack Support](https://www.browserstack.com/support)

For this framework:

- Check the main README.md file
- Review the test examples in `src/features/`
