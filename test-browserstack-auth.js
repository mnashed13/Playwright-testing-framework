#!/usr/bin/env node

/**
 * BrowserStack Authentication Test
 *
 * This script tests BrowserStack authentication and connection more thoroughly
 */

const { chromium } = require('@playwright/test');
require('dotenv').config();

async function testBrowserStackAuth() {
	console.log('🔍 Testing BrowserStack Authentication...\n');

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
		// Test with more detailed capabilities
		const capabilities = {
			browser: 'chrome',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
			name: 'BrowserStack Auth Test',
			build: `auth-test-${Date.now()}`,
			project: 'Playwright Testing Framework',
			'browserstack.debug': true,
			'browserstack.console': 'info',
			'browserstack.networkLogs': true,
			'browserstack.user': process.env.BROWSERSTACK_USERNAME,
			'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
		};

		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		console.log('\n🔗 Connecting to BrowserStack...');
		console.log(`   Endpoint: ${wsEndpoint.substring(0, 100)}...`);

		// Add timeout and retry logic
		const browser = await chromium.connectOverCDP(wsEndpoint, {
			timeout: 30000, // 30 second timeout
		});

		console.log('✅ Successfully connected to BrowserStack');

		const context = await browser.newContext({
			viewport: { width: 1280, height: 720 },
			userAgent:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		});

		const page = await context.newPage();

		console.log('✅ Successfully created browser context and page');

		// Navigate to a simple page with retry logic
		console.log('\n🌐 Testing navigation...');
		let retries = 3;
		let success = false;

		while (retries > 0 && !success) {
			try {
				await page.goto('https://www.google.com', {
					waitUntil: 'networkidle',
					timeout: 15000,
				});
				success = true;
			} catch (error) {
				retries--;
				console.log(`   Retry ${3 - retries}/3: ${error.message}`);
				if (retries > 0) {
					await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			}
		}

		if (!success) {
			throw new Error('Failed to navigate after 3 retries');
		}

		const title = await page.title();
		console.log(`✅ Successfully navigated to Google. Page title: "${title}"`);

		// Test a simple interaction
		console.log('\n🖱️  Testing interaction...');
		const searchBox = page.getByRole('combobox', { name: 'Search' });
		await searchBox.fill('BrowserStack Test');
		console.log('✅ Successfully filled search box');

		// Take a screenshot
		console.log('\n📸 Taking screenshot...');
		await page.screenshot({ path: 'browserstack-test-screenshot.png' });
		console.log('✅ Screenshot saved as browserstack-test-screenshot.png');

		// Clean up
		console.log('\n🧹 Cleaning up...');
		await page.close();
		await context.close();
		await browser.close();

		console.log('✅ BrowserStack authentication test completed successfully!');
		console.log('\n🎉 Your BrowserStack integration is working correctly!');
		console.log('\n📋 Next steps:');
		console.log('   • Run: npm run run-browserstack');
		console.log(
			'   • Check BrowserStack dashboard: https://automate.browserstack.com/dashboard/v2'
		);
	} catch (error) {
		console.log('\n❌ BrowserStack authentication test failed:');
		console.log(`   Error: ${error.message}`);

		if (
			error.message.includes('401') ||
			error.message.includes('Access denied')
		) {
			console.log('\n💡 This indicates an authentication problem.');
			console.log(
				'   Please verify your BrowserStack username and access key.'
			);
			console.log(
				'   You can find them at: https://automate.browserstack.com/dashboard/v2'
			);
		} else if (error.message.includes('timeout')) {
			console.log('\n💡 This usually means a network connectivity issue.');
			console.log(
				'   Please check your internet connection and firewall settings.'
			);
		} else if (error.message.includes('ENOTFOUND')) {
			console.log('\n💡 This usually means DNS resolution failed.');
			console.log('   Please check your internet connection.');
		} else if (error.message.includes('1006')) {
			console.log('\n💡 WebSocket connection closed unexpectedly.');
			console.log('   This could be due to:');
			console.log('   • Invalid credentials');
			console.log('   • Network firewall blocking WebSocket connections');
			console.log('   • BrowserStack service temporarily unavailable');
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
testBrowserStackAuth().catch(console.error);
