#!/usr/bin/env node

/**
 * Direct BrowserStack Test Runner
 *
 * This script runs Playwright tests directly on BrowserStack without using the BrowserStack SDK
 * Usage: node run-browserstack-direct.js [options]
 */

const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Configuration
const config = {
	browsers: [
		{ name: 'chrome', browserName: 'Chrome', os: 'Windows', osVersion: '11' },
		{ name: 'firefox', browserName: 'Firefox', os: 'Windows', osVersion: '11' },
		{
			name: 'safari',
			browserName: 'Safari',
			os: 'OS X',
			osVersion: 'Monterey',
		},
		{ name: 'edge', browserName: 'Edge', os: 'Windows', osVersion: '11' },
	],
	mobileBrowsers: [
		{
			name: 'chrome-mobile',
			browserName: 'Chrome',
			device: 'Samsung Galaxy S21',
			os: 'android',
			osVersion: '11.0',
		},
		{
			name: 'safari-mobile',
			browserName: 'Safari',
			device: 'iPhone 12',
			os: 'ios',
			osVersion: '14',
		},
	],
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
	browser: null,
	mobile: false,
	parallel: false,
	debug: false,
	smoke: false,
};

for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
		case '--browser':
			options.browser = args[++i];
			break;
		case '--mobile':
			options.mobile = true;
			break;
		case '--parallel':
			options.parallel = true;
			break;
		case '--debug':
			options.debug = true;
			break;
		case '--smoke':
			options.smoke = true;
			break;
		case '--help':
			showHelp();
			process.exit(0);
	}
}

function showHelp() {
	console.log(`
Direct BrowserStack Test Runner

Usage: node run-browserstack-direct.js [options]

Options:
  --browser <browser>   Browser: chrome, firefox, safari, edge
  --mobile             Run mobile tests
  --parallel           Run all browsers in parallel
  --debug              Enable debug mode
  --smoke              Run smoke tests only
  --help               Show this help message

Examples:
  node run-browserstack-direct.js
  node run-browserstack-direct.js --browser chrome
  node run-browserstack-direct.js --mobile --debug
  node run-browserstack-direct.js --parallel
`);
}

function validateEnvironment() {
	console.log('🔍 Validating environment...');

	if (
		!process.env.BROWSERSTACK_USERNAME ||
		!process.env.BROWSERSTACK_ACCESS_KEY
	) {
		console.error('❌ BrowserStack credentials not found!');
		console.error(
			'Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables'
		);
		process.exit(1);
	}

	console.log('✅ BrowserStack credentials found');

	// Check if playwright.browserstack.config.ts exists
	if (!fs.existsSync('playwright.browserstack.config.ts')) {
		console.error('❌ playwright.browserstack.config.ts not found!');
		console.error(
			'Please ensure the BrowserStack Playwright configuration exists'
		);
		process.exit(1);
	}

	console.log('✅ BrowserStack Playwright configuration found\n');
}

function setEnvironmentVariables() {
	console.log('🔧 Setting up environment variables...');

	// Set BrowserStack environment variables
	process.env.BROWSERSTACK_PROJECT_NAME =
		process.env.BROWSERSTACK_PROJECT_NAME || 'Playwright Testing Framework';
	process.env.BROWSERSTACK_BUILD_NAME =
		process.env.BROWSERSTACK_BUILD_NAME || `build_${Date.now()}`;
	process.env.BROWSERSTACK_SESSION_NAME =
		process.env.BROWSERSTACK_SESSION_NAME || 'playwright_test_session';

	// Set debugging options
	if (options.debug) {
		process.env.BROWSERSTACK_DEBUG = 'true';
		process.env.BROWSERSTACK_CONSOLE_LOGS = 'true';
		process.env.BROWSERSTACK_NETWORK_LOGS = 'true';
	}

	// Set base URL if not already set
	if (!process.env.BASE_URL) {
		process.env.BASE_URL = 'https://www.google.com';
	}

	console.log(`📋 Configuration:`);
	console.log(`   Project: ${process.env.BROWSERSTACK_PROJECT_NAME}`);
	console.log(`   Build: ${process.env.BROWSERSTACK_BUILD_NAME}`);
	console.log(`   Session: ${process.env.BROWSERSTACK_SESSION_NAME}`);
	console.log(`   Debug: ${options.debug ? 'Enabled' : 'Disabled'}`);
	console.log(`   Base URL: ${process.env.BASE_URL}\n`);
}

function getTestCommand() {
	let command;

	if (options.browser) {
		// Run specific browser test
		const browserProject = options.mobile
			? `browserstack-${options.browser}-mobile`
			: `browserstack-${options.browser}`;
		command = `npx playwright test --config=playwright.browserstack.config.ts --project=${browserProject}`;
	} else if (options.mobile) {
		// Run mobile tests
		command = `npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome-mobile --project=browserstack-safari-mobile`;
	} else if (options.parallel) {
		// Run all browsers in parallel
		command = `npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome --project=browserstack-firefox --project=browserstack-safari --project=browserstack-edge`;
	} else {
		// Run default browser (Chrome)
		command = `npx playwright test --config=playwright.browserstack.config.ts --project=browserstack-chrome`;
	}

	// Add smoke tag if requested
	if (options.smoke) {
		command += ' --grep @smoke';
	}

	return command;
}

function runTests() {
	console.log('🚀 Starting BrowserStack tests...\n');

	const command = getTestCommand();
	console.log(`📝 Executing: ${command}\n`);

	try {
		const startTime = Date.now();

		// Run the test command
		execSync(command, {
			stdio: 'inherit',
			env: { ...process.env },
		});

		const endTime = Date.now();
		const duration = Math.round((endTime - startTime) / 1000);

		console.log(`\n✅ Tests completed successfully in ${duration} seconds!`);

		// Show results summary
		showResultsSummary();
	} catch (error) {
		console.error('\n❌ Tests failed!');
		console.error('Error:', error.message);

		// Show failure summary
		showFailureSummary();

		process.exit(1);
	}
}

function showResultsSummary() {
	console.log('\n📊 Test Results Summary:');
	console.log('========================');

	// Check for test result files
	const resultFiles = [
		'browserstack-results.json',
		'browserstack-report/index.html',
		'test-results/',
	];

	resultFiles.forEach((file) => {
		if (fs.existsSync(file)) {
			console.log(`✅ ${file} - Generated`);
		}
	});

	console.log('\n🌐 View your results:');
	console.log(
		'   • BrowserStack Dashboard: https://automate.browserstack.com/dashboard/v2'
	);
	console.log(
		'   • Local Reports: Check the browserstack-report/ and test-results/ folders'
	);

	if (fs.existsSync('browserstack-report/index.html')) {
		console.log(
			`   • HTML Report: file://${process.cwd()}/browserstack-report/index.html`
		);
	}
}

function showFailureSummary() {
	console.log('\n🔍 Failure Analysis:');
	console.log('===================');

	// Check for screenshots and videos
	const artifacts = ['test-results/', 'browserstack-report/'];

	artifacts.forEach((dir) => {
		if (fs.existsSync(dir)) {
			console.log(`📁 Check ${dir} for screenshots, videos, and logs`);
		}
	});

	console.log('\n💡 Troubleshooting Tips:');
	console.log('   • Check BrowserStack dashboard for detailed session logs');
	console.log('   • Verify your application is accessible from BrowserStack');
	console.log('   • Check network connectivity and firewall settings');
	console.log('   • Review test logs for specific error messages');
}

// Main execution
async function main() {
	console.log('🎯 Direct BrowserStack Test Runner');
	console.log('==================================\n');

	try {
		validateEnvironment();
		setEnvironmentVariables();
		runTests();

		console.log(
			'\n🎉 All done! Check your BrowserStack dashboard for detailed results.'
		);
	} catch (error) {
		console.error('\n💥 Fatal error:', error.message);
		process.exit(1);
	}
}

// Handle process termination
process.on('SIGINT', () => {
	console.log('\n\n⏹️  Test execution interrupted by user');
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('\n\n⏹️  Test execution terminated');
	process.exit(0);
});

// Run the main function
main();
