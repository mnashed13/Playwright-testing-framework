#!/usr/bin/env node

/**
 * BrowserStack API Test
 *
 * This script tests BrowserStack REST API access to verify credentials
 */

const https = require('https');
require('dotenv').config();

function makeRequest(url, username, password) {
	return new Promise((resolve, reject) => {
		const auth = Buffer.from(`${username}:${password}`).toString('base64');

		const options = {
			headers: {
				Authorization: `Basic ${auth}`,
				'Content-Type': 'application/json',
			},
		};

		https
			.get(url, options, (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					try {
						const jsonData = JSON.parse(data);
						resolve({ status: res.statusCode, data: jsonData });
					} catch (error) {
						resolve({ status: res.statusCode, data: data });
					}
				});
			})
			.on('error', (error) => {
				reject(error);
			});
	});
}

async function testBrowserStackAPI() {
	console.log('🔍 Testing BrowserStack REST API...\n');

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
		// Test 1: Check account plan
		console.log('\n📊 Testing account plan...');
		const planResponse = await makeRequest(
			'https://api.browserstack.com/automate/plan.json',
			process.env.BROWSERSTACK_USERNAME,
			process.env.BROWSERSTACK_ACCESS_KEY
		);

		if (planResponse.status === 200) {
			console.log('✅ Account plan retrieved successfully');
			console.log(`   Plan: ${planResponse.data.automate_plan}`);
			console.log(
				`   Parallel sessions: ${planResponse.data.parallel_sessions_running}/${planResponse.data.parallel_sessions_max_allowed}`
			);
		} else {
			throw new Error(`Failed to get account plan: ${planResponse.status}`);
		}

		// Test 2: Check available browsers
		console.log('\n🌐 Testing browser list...');
		const browsersResponse = await makeRequest(
			'https://api.browserstack.com/automate/browsers.json',
			process.env.BROWSERSTACK_USERNAME,
			process.env.BROWSERSTACK_ACCESS_KEY
		);

		if (browsersResponse.status === 200) {
			console.log('✅ Browser list retrieved successfully');
			const browsers = browsersResponse.data;
			const chromeBrowsers = browsers
				.filter((b) => b.browser === 'chrome')
				.slice(0, 3);
			console.log(`   Available Chrome browsers: ${chromeBrowsers.length}`);
			chromeBrowsers.forEach((browser) => {
				console.log(
					`     - ${browser.browser} ${browser.browser_version} on ${browser.os} ${browser.os_version}`
				);
			});
		} else {
			throw new Error(`Failed to get browser list: ${browsersResponse.status}`);
		}

		// Test 3: Check recent builds
		console.log('\n📋 Testing recent builds...');
		const buildsResponse = await makeRequest(
			'https://api.browserstack.com/automate/builds.json',
			process.env.BROWSERSTACK_USERNAME,
			process.env.BROWSERSTACK_ACCESS_KEY
		);

		if (buildsResponse.status === 200) {
			console.log('✅ Recent builds retrieved successfully');
			const builds = buildsResponse.data;
			console.log(`   Recent builds: ${builds.length}`);
			if (builds.length > 0) {
				console.log(`   Latest build: ${builds[0].name} (${builds[0].status})`);
			}
		} else {
			throw new Error(`Failed to get recent builds: ${buildsResponse.status}`);
		}

		console.log('\n🎉 All API tests passed!');
		console.log('✅ Your BrowserStack credentials are working correctly');
		console.log('\n📋 Next steps:');
		console.log('   • Run: npm run test-browserstack-auth');
		console.log('   • Run: npm run run-browserstack');
		console.log(
			'   • Check BrowserStack dashboard: https://automate.browserstack.com/dashboard/v2'
		);
	} catch (error) {
		console.log('\n❌ BrowserStack API test failed:');
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
testBrowserStackAPI().catch(console.error);
