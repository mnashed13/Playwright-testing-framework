#!/usr/bin/env node

/**
 * Simple BrowserStack Test
 *
 * This script runs a very simple test on BrowserStack
 */

const { chromium } = require('@playwright/test');
require('dotenv').config();

async function testBrowserStackSimple() {
	console.log('🔍 Running Simple BrowserStack Test...\n');

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
	console.log(`   Username: ${process.env.BROWSERSTACK_USERNAME}`);
	console.log(
		`   Access Key: ${process.env.BROWSERSTACK_ACCESS_KEY.substring(0, 8)}...`
	);

	try {
		// Simple capabilities
		const capabilities = {
			browser: 'chrome',
			os: 'Windows',
			osVersion: '11',
			name: 'Simple BrowserStack Test',
			build: `simple-test-${Date.now()}`,
			project: 'Playwright Testing Framework',
		};

		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		console.log('\n🔗 Connecting to BrowserStack...');

		const browser = await chromium.connectOverCDP(wsEndpoint);
		console.log('✅ Connected to BrowserStack');

		const context = await browser.newContext();
		console.log('✅ Created browser context');

		const page = await context.newPage();
		console.log('✅ Created new page');

		// Navigate to a simple page
		console.log('\n🌐 Navigating to Google...');
		await page.goto('https://www.google.com');
		console.log('✅ Successfully navigated to Google');

		// Get page title
		const title = await page.title();
		console.log(`✅ Page title: "${title}"`);

		// Take a screenshot
		console.log('\n📸 Taking screenshot...');
		await page.screenshot({ path: 'browserstack-simple-test.png' });
		console.log('✅ Screenshot saved as browserstack-simple-test.png');

		// Clean up
		console.log('\n🧹 Cleaning up...');
		await page.close();
		await context.close();
		await browser.close();

		console.log('\n🎉 Simple BrowserStack test completed successfully!');
		console.log('\n📋 Your BrowserStack integration is working!');
		console.log('\n🚀 Next steps:');
		console.log('   • Run: npm run run-browserstack');
		console.log('   • Run: npm run run-browserstack:chrome');
		console.log(
			'   • Check BrowserStack dashboard: https://automate.browserstack.com/dashboard/v2'
		);
	} catch (error) {
		console.log('\n❌ Simple BrowserStack test failed:');
		console.log(`   Error: ${error.message}`);

		if (
			error.message.includes('401') ||
			error.message.includes('Access denied')
		) {
			console.log('\n💡 Authentication problem.');
			console.log('   Please verify your BrowserStack credentials.');
		} else if (error.message.includes('timeout')) {
			console.log('\n💡 Network timeout.');
			console.log('   Please check your internet connection.');
		} else if (error.message.includes('Protocol error')) {
			console.log(
				'\n💡 Protocol error - this might be a BrowserStack service issue.'
			);
			console.log('   Try again in a few minutes.');
		} else {
			console.log('\n💡 For more help:');
			console.log('   • BrowserStack docs: https://www.browserstack.com/docs');
			console.log(
				'   • BrowserStack support: https://www.browserstack.com/support'
			);
		}
	}
}

// Run the test
testBrowserStackSimple().catch(console.error);
