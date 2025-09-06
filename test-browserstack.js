// Simple test script to verify BrowserStack integration
const { chromium } = require('@playwright/test');
require('dotenv').config();

async function testBrowserStackConnection() {
	console.log('Testing BrowserStack connection...');

	// Check if credentials are available
	if (
		!process.env.BROWSERSTACK_USERNAME ||
		!process.env.BROWSERSTACK_ACCESS_KEY
	) {
		console.log(
			'❌ BrowserStack credentials not found in environment variables'
		);
		console.log('Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
		return;
	}

	console.log('✅ BrowserStack credentials found');

	try {
		// Test connection with a simple capability
		const capabilities = {
			browserName: 'Chrome',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
			name: 'BrowserStack Connection Test',
			build: 'test-build',
			project: 'Playwright Testing Framework',
			'browserstack.debug': true,
			'browserstack.console': true,
			'browserstack.networkLogs': true,
		};

		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		console.log('Connecting to BrowserStack...');
		const browser = await chromium.connectOverCDP(wsEndpoint);

		console.log('✅ Successfully connected to BrowserStack');

		const context = await browser.newContext();
		const page = await context.newPage();

		console.log('✅ Successfully created browser context and page');

		// Navigate to a simple page
		await page.goto('https://www.google.com');
		const title = await page.title();

		console.log(`✅ Successfully navigated to Google. Page title: ${title}`);

		// Clean up
		await page.close();
		await context.close();
		await browser.close();

		console.log('✅ BrowserStack test completed successfully!');
	} catch (error) {
		console.log('❌ BrowserStack connection failed:');
		console.log(error.message);

		if (error.message.includes('401')) {
			console.log(
				'This usually means invalid credentials. Please check your BrowserStack username and access key.'
			);
		} else if (error.message.includes('timeout')) {
			console.log(
				'This usually means a network connectivity issue or BrowserStack service is unavailable.'
			);
		}
	}
}

testBrowserStackConnection();
