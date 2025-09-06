#!/usr/bin/env node

/**
 * BrowserStack Connection Test
 *
 * This script tests the BrowserStack connection without running full tests
 */

const { chromium } = require('@playwright/test');
require('dotenv').config();

async function testBrowserStackConnection() {
	console.log('🔍 Testing BrowserStack connection...\n');

	// Check if credentials are available
	if (
		!process.env.BROWSERSTACK_USERNAME ||
		!process.env.BROWSERSTACK_ACCESS_KEY
	) {
		console.log(
			'❌ BrowserStack credentials not found in environment variables'
		);
		console.log('Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY');
		console.log('\nYou can create a .env file with:');
		console.log('BROWSERSTACK_USERNAME=your_username');
		console.log('BROWSERSTACK_ACCESS_KEY=your_access_key');
		return;
	}

	console.log('✅ BrowserStack credentials found');
	console.log(`   Username: ${process.env.BROWSERSTACK_USERNAME}`);
	console.log(
		`   Access Key: ${process.env.BROWSERSTACK_ACCESS_KEY.substring(0, 8)}...`
	);

	try {
		// Test connection with a simple capability
		const capabilities = {
			browserName: 'Chrome',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
			name: 'BrowserStack Connection Test',
			build: `test-build-${Date.now()}`,
			project: 'Playwright Testing Framework',
			'browserstack.debug': true,
			'browserstack.console': true,
			'browserstack.networkLogs': true,
		};

		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		console.log('\n🔗 Connecting to BrowserStack...');
		console.log(`   Endpoint: ${wsEndpoint.substring(0, 100)}...`);

		const browser = await chromium.connectOverCDP(wsEndpoint);

		console.log('✅ Successfully connected to BrowserStack');

		const context = await browser.newContext();
		const page = await context.newPage();

		console.log('✅ Successfully created browser context and page');

		// Navigate to a simple page
		console.log('\n🌐 Testing navigation...');
		await page.goto('https://www.google.com');
		const title = await page.title();

		console.log(`✅ Successfully navigated to Google. Page title: "${title}"`);

		// Test a simple interaction
		console.log('\n🖱️  Testing interaction...');
		const searchBox = page.getByRole('combobox', { name: 'Search' });
		await searchBox.fill('BrowserStack Test');
		console.log('✅ Successfully filled search box');

		// Clean up
		console.log('\n🧹 Cleaning up...');
		await page.close();
		await context.close();
		await browser.close();

		console.log('✅ BrowserStack test completed successfully!');
		console.log('\n🎉 Your BrowserStack integration is working correctly!');
		console.log('\n📋 Next steps:');
		console.log('   • Run: npm run run-browserstack');
		console.log(
			'   • Check BrowserStack dashboard: https://automate.browserstack.com/dashboard/v2'
		);
	} catch (error) {
		console.log('\n❌ BrowserStack connection failed:');
		console.log(`   Error: ${error.message}`);

		if (error.message.includes('401')) {
			console.log('\n💡 This usually means invalid credentials.');
			console.log('   Please check your BrowserStack username and access key.');
		} else if (error.message.includes('timeout')) {
			console.log('\n💡 This usually means a network connectivity issue.');
			console.log(
				'   Please check your internet connection and firewall settings.'
			);
		} else if (error.message.includes('ENOTFOUND')) {
			console.log('\n💡 This usually means DNS resolution failed.');
			console.log('   Please check your internet connection.');
		} else {
			console.log('\n💡 For more help, check:');
			console.log(
				'   • BrowserStack documentation: https://www.browserstack.com/docs'
			);
			console.log(
				'   • BrowserStack support: https://www.browserstack.com/support'
			);
		}
	}
}

// Run the test
testBrowserStackConnection().catch(console.error);
