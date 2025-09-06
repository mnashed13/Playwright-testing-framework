import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { browserstackConfig } from './browserstack.config';

// Read from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
	testDir: './src/features',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['line'],
		['html', { outputFolder: 'browserstack-report' }],
		['json', { outputFile: 'browserstack-results.json' }],
	],

	use: {
		baseURL: process.env.BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},

	projects: [
		// BrowserStack Desktop Browsers
		{
			name: 'browserstack-chrome',
			use: {
				...devices['Desktop Chrome'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Chrome',
							browserVersion: 'latest',
							os: 'Windows',
							osVersion: '11',
							name: `${browserstackConfig.sessionName}_chrome`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
		{
			name: 'browserstack-firefox',
			use: {
				...devices['Desktop Firefox'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Firefox',
							browserVersion: 'latest',
							os: 'Windows',
							osVersion: '11',
							name: `${browserstackConfig.sessionName}_firefox`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
		{
			name: 'browserstack-safari',
			use: {
				...devices['Desktop Safari'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Safari',
							browserVersion: 'latest',
							os: 'OS X',
							osVersion: 'Monterey',
							name: `${browserstackConfig.sessionName}_safari`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
		{
			name: 'browserstack-edge',
			use: {
				...devices['Desktop Edge'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Edge',
							browserVersion: 'latest',
							os: 'Windows',
							osVersion: '11',
							name: `${browserstackConfig.sessionName}_edge`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
		// BrowserStack Mobile Browsers
		{
			name: 'browserstack-chrome-mobile',
			use: {
				...devices['iPhone 12'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Chrome',
							device: 'Samsung Galaxy S21',
							os: 'android',
							osVersion: '11.0',
							name: `${browserstackConfig.sessionName}_chrome_mobile`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
		{
			name: 'browserstack-safari-mobile',
			use: {
				...devices['iPhone 12'],
				connectOptions: {
					wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
						JSON.stringify({
							browserName: 'Safari',
							device: 'iPhone 12',
							os: 'ios',
							osVersion: '14',
							name: `${browserstackConfig.sessionName}_safari_mobile`,
							build: browserstackConfig.build,
							project: browserstackConfig.project,
							...browserstackConfig.capabilities,
						})
					)}`,
				},
			},
		},
	],
});
