import { defineConfig } from '@playwright/test';
import * as os from 'os';

// LambdaTest capabilities configuration
export const lambdaTestCapabilities = {
	'LT:Options': {
		platform: 'Windows 10',
		build:
			process.env.LT_BUILD_NAME ||
			`Playwright Test Build - ${new Date().toISOString()}`,
		name: process.env.LT_TEST_NAME || 'Playwright Test',
		user: process.env.LT_USERNAME,
		accessKey: process.env.LT_ACCESS_KEY,
		network: true,
		video: true,
		console: true,
		tunnel: false,
		tunnelName: '',
		geoLocation: '',
	},
};

// Browser configurations for LambdaTest
export const lambdaTestBrowsers = [
	{
		name: 'chrome-latest-windows',
		use: {
			...lambdaTestCapabilities,
			'LT:Options': {
				...lambdaTestCapabilities['LT:Options'],
				browserName: 'Chrome',
				browserVersion: 'latest',
			},
		},
	},
	{
		name: 'firefox-latest-windows',
		use: {
			...lambdaTestCapabilities,
			'LT:Options': {
				...lambdaTestCapabilities['LT:Options'],
				browserName: 'Firefox',
				browserVersion: 'latest',
			},
		},
	},
	{
		name: 'edge-latest-windows',
		use: {
			...lambdaTestCapabilities,
			'LT:Options': {
				...lambdaTestCapabilities['LT:Options'],
				browserName: 'MicrosoftEdge',
				browserVersion: 'latest',
			},
		},
	},
	{
		name: 'chrome-latest-macos',
		use: {
			...lambdaTestCapabilities,
			'LT:Options': {
				...lambdaTestCapabilities['LT:Options'],
				platform: 'macOS Monterey',
				browserName: 'Chrome',
				browserVersion: 'latest',
			},
		},
	},
];

// LambdaTest WebSocket endpoint
export const lambdaTestEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
	JSON.stringify(lambdaTestCapabilities)
)}`;

// Helper function to check if running on LambdaTest
export const isLambdaTest = (): boolean => {
	return process.env.LT_USERNAME && process.env.LT_ACCESS_KEY ? true : false;
};

// Helper function to get connect options for LambdaTest
export const getLambdaTestConnectOptions = (capabilities: any) => {
	return {
		wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`,
	};
};
