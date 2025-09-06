#!/usr/bin/env node

/**
 * Working BrowserStack Test Runner
 *
 * This script runs tests on BrowserStack using the traditional approach
 * that works with Free accounts
 */

const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
	browser: 'chrome',
	mobile: false,
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
Working BrowserStack Test Runner

Usage: node run-browserstack-working.js [options]

Options:
  --browser <browser>   Browser: chrome, firefox, safari, edge (default: chrome)
  --mobile             Run mobile tests
  --debug              Enable debug mode
  --smoke              Run smoke tests only
  --help               Show this help message

Examples:
  node run-browserstack-working.js
  node run-browserstack-working.js --browser firefox
  node run-browserstack-working.js --mobile --debug
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

	// Check if browserstack.yml exists
	if (!fs.existsSync('browserstack.yml')) {
		console.error('❌ browserstack.yml not found!');
		console.error('Please ensure the BrowserStack configuration exists');
		process.exit(1);
	}

	console.log('✅ BrowserStack configuration found\n');
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
	console.log(`   Browser: ${options.browser}`);
	console.log(`   Mobile: ${options.mobile ? 'Yes' : 'No'}`);
	console.log(`   Debug: ${options.debug ? 'Enabled' : 'Disabled'}`);
	console.log(`   Base URL: ${process.env.BASE_URL}\n`);
}

function getTestCommand() {
	let command;

	if (options.mobile) {
		// Run mobile tests using BrowserStack SDK
		command = `npm run test:browserstack:smoke-browserstack`;
	} else if (options.smoke) {
		// Run smoke tests
		command = `npm run test:browserstack:smoke-browserstack`;
	} else {
		// Run regular tests
		command = `npm run test:browserstack-browserstack`;
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
		'reports/cucumber-report.html',
		'reports/cucumber-report.json',
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
		'   • Local Reports: Check the reports/ and test-results/ folders'
	);

	if (fs.existsSync('reports/cucumber-report.html')) {
		console.log(
			`   • HTML Report: file://${process.cwd()}/reports/cucumber-report.html`
		);
	}
}

function showFailureSummary() {
	console.log('\n🔍 Failure Analysis:');
	console.log('===================');

	// Check for screenshots and videos
	const artifacts = ['test-results/', 'reports/'];

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
	console.log('🎯 Working BrowserStack Test Runner');
	console.log('====================================\n');

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
