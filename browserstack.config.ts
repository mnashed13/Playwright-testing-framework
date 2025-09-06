import { defineConfig } from '@playwright/test';

export const browserstackConfig = {
	// BrowserStack credentials - these should be set as environment variables
	username: process.env.BROWSERSTACK_USERNAME,
	accessKey: process.env.BROWSERSTACK_ACCESS_KEY,

	// BrowserStack configuration
	project:
		process.env.BROWSERSTACK_PROJECT_NAME || 'Playwright Testing Framework',
	build: process.env.BROWSERSTACK_BUILD_NAME || `build_${Date.now()}`,
	sessionName:
		process.env.BROWSERSTACK_SESSION_NAME || 'playwright_test_session',

	// BrowserStack capabilities
	capabilities: {
		'browserstack.debug': process.env.BROWSERSTACK_DEBUG === 'true',
		'browserstack.console':
			process.env.BROWSERSTACK_CONSOLE_LOGS === 'true' ? 'info' : 'errors',
		'browserstack.networkLogs':
			process.env.BROWSERSTACK_NETWORK_LOGS === 'true',
		'browserstack.local': process.env.BROWSERSTACK_LOCAL === 'true',
		'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
	},

	// Browser configurations for BrowserStack
	browsers: [
		{
			name: 'chrome',
			browser: 'chrome',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
		},
		{
			name: 'firefox',
			browser: 'playwright-firefox',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
		},
		{
			name: 'safari',
			browser: 'playwright-webkit',
			browserVersion: 'latest',
			os: 'OS X',
			osVersion: 'Monterey',
		},
		{
			name: 'edge',
			browser: 'edge',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
		},
	],

	// Mobile browsers
	mobileBrowsers: [
		{
			name: 'chrome-mobile',
			browser: 'chrome',
			device: 'Samsung Galaxy S21',
			os: 'android',
			osVersion: '11.0',
		},
		{
			name: 'safari-mobile',
			browser: 'playwright-webkit',
			device: 'iPhone 12',
			os: 'ios',
			osVersion: '14',
		},
	],
};

export default browserstackConfig;
