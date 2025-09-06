#!/usr/bin/env node

/**
 * BrowserStack Setup Helper
 *
 * This script helps you set up BrowserStack credentials and test the connection
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt) {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

async function setupBrowserStack() {
	console.log('🎯 BrowserStack Setup Helper');
	console.log('============================\n');

	console.log('This script will help you set up BrowserStack credentials.\n');

	// Check if .env already exists
	const envPath = '.env';
	let envContent = '';

	if (fs.existsSync(envPath)) {
		console.log('📁 Found existing .env file');
		envContent = fs.readFileSync(envPath, 'utf8');
	} else {
		console.log('📁 No .env file found, will create one');
	}

	// Get BrowserStack credentials
	console.log('\n🔑 BrowserStack Credentials');
	console.log('You can find these in your BrowserStack account dashboard:');
	console.log('https://automate.browserstack.com/dashboard/v2\n');

	const username = await question('Enter your BrowserStack username: ');
	const accessKey = await question('Enter your BrowserStack access key: ');

	if (!username || !accessKey) {
		console.log('\n❌ Username and access key are required!');
		rl.close();
		return;
	}

	// Get optional configuration
	console.log('\n⚙️  Optional Configuration');
	const projectName =
		(await question(
			'Project name (default: Playwright Testing Framework): '
		)) || 'Playwright Testing Framework';
	const baseUrl =
		(await question(
			'Base URL for your application (default: https://www.google.com): '
		)) || 'https://www.google.com';

	// Create .env content
	const newEnvContent = `# BrowserStack Configuration
BROWSERSTACK_USERNAME=${username}
BROWSERSTACK_ACCESS_KEY=${accessKey}
BROWSERSTACK_PROJECT_NAME=${projectName}
BROWSERSTACK_BUILD_NAME=build_\${BUILD_NUMBER:-local}
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
BASE_URL=${baseUrl}
USERNAME=your_test_username
PASSWORD=your_test_password
`;

	// Write .env file
	try {
		fs.writeFileSync(envPath, newEnvContent);
		console.log('\n✅ .env file created successfully!');
	} catch (error) {
		console.log('\n❌ Failed to create .env file:', error.message);
		rl.close();
		return;
	}

	// Test connection
	console.log('\n🧪 Testing BrowserStack connection...');

	try {
		// Set environment variables for testing
		process.env.BROWSERSTACK_USERNAME = username;
		process.env.BROWSERSTACK_ACCESS_KEY = accessKey;

		// Import and run the connection test
		const { chromium } = require('@playwright/test');

		const capabilities = {
			browser: 'chrome',
			browserVersion: 'latest',
			os: 'Windows',
			osVersion: '11',
			name: 'BrowserStack Setup Test',
			build: `setup-test-${Date.now()}`,
			project: projectName,
			'browserstack.debug': true,
			'browserstack.console': 'info',
		};

		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		const browser = await chromium.connectOverCDP(wsEndpoint);
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto('https://www.google.com');
		const title = await page.title();

		await page.close();
		await context.close();
		await browser.close();

		console.log('✅ BrowserStack connection test successful!');
		console.log(`   Page title: "${title}"`);
	} catch (error) {
		console.log('❌ BrowserStack connection test failed:');
		console.log(`   Error: ${error.message}`);

		if (error.message.includes('401')) {
			console.log('\n💡 This usually means invalid credentials.');
			console.log('   Please double-check your username and access key.');
		} else {
			console.log('\n💡 Please check your internet connection and try again.');
		}
	}

	// Show next steps
	console.log('\n🎉 Setup Complete!');
	console.log('==================');
	console.log('\n📋 Next steps:');
	console.log('   1. Test connection: npm run test-browserstack-connection');
	console.log('   2. Run tests: npm run run-browserstack');
	console.log('   3. Run smoke tests: npm run run-browserstack:smoke');
	console.log('   4. Run mobile tests: npm run run-browserstack:mobile');
	console.log(
		'   5. View results: https://automate.browserstack.com/dashboard/v2'
	);

	console.log('\n📚 Available commands:');
	console.log('   • npm run run-browserstack - Run UI tests');
	console.log('   • npm run run-browserstack:smoke - Run smoke tests');
	console.log('   • npm run run-browserstack:mobile - Run mobile tests');
	console.log('   • npm run run-browserstack:parallel - Run all browsers');
	console.log('   • npm run run-browserstack:debug - Run with debug mode');
	console.log('   • npm run run-browserstack:chrome - Run Chrome only');
	console.log('   • npm run run-browserstack:firefox - Run Firefox only');
	console.log('   • npm run run-browserstack:safari - Run Safari only');
	console.log('   • npm run run-browserstack:edge - Run Edge only');

	rl.close();
}

// Run the setup
setupBrowserStack().catch(console.error);
