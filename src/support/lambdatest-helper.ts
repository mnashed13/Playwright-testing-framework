import {
	Browser,
	BrowserContext,
	Page,
	chromium,
	firefox,
	webkit,
} from '@playwright/test';
import {
	lambdaTestCapabilities,
	getLambdaTestConnectOptions,
	isLambdaTest,
} from '../../lambdatest.config';

export interface LambdaTestOptions {
	browserName?: 'chrome' | 'firefox' | 'edge' | 'safari';
	browserVersion?: string;
	platform?: string;
	build?: string;
	name?: string;
	projectName?: string;
	tags?: string[];
	resolution?: string;
	tunnel?: boolean;
	network?: boolean;
	console?: boolean;
	video?: boolean;
}

export class LambdaTestHelper {
	private static instance: LambdaTestHelper;

	private constructor() {}

	public static getInstance(): LambdaTestHelper {
		if (!LambdaTestHelper.instance) {
			LambdaTestHelper.instance = new LambdaTestHelper();
		}
		return LambdaTestHelper.instance;
	}

	/**
	 * Create browser instance for LambdaTest or local execution
	 */
	public async createBrowser(options?: LambdaTestOptions): Promise<Browser> {
		if (isLambdaTest()) {
			return this.createLambdaTestBrowser(options);
		} else {
			return this.createLocalBrowser(options?.browserName || 'chrome');
		}
	}

	/**
	 * Create LambdaTest browser instance
	 */
	private async createLambdaTestBrowser(
		options?: LambdaTestOptions
	): Promise<Browser> {
		const capabilities = this.buildCapabilities(options);

		// Build the WebSocket endpoint URL
		const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		console.log(
			'Connecting to LambdaTest with capabilities:',
			JSON.stringify(capabilities, null, 2)
		);

		try {
			// Connect to LambdaTest using the WebSocket endpoint
			const browser = await chromium.connect(wsEndpoint);
			console.log('✅ Successfully connected to LambdaTest');
			return browser;
		} catch (error) {
			console.error('❌ Failed to connect to LambdaTest:', error);
			throw error;
		}
	}

	/**
	 * Create local browser instance
	 */
	private async createLocalBrowser(browserName: string): Promise<Browser> {
		const launchOptions = {
			headless: process.env.HEADLESS !== 'false',
			slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
		};

		switch (browserName) {
			case 'firefox':
				return await firefox.launch(launchOptions);
			case 'safari':
			case 'webkit':
				return await webkit.launch(launchOptions);
			case 'chrome':
			case 'edge':
			default:
				return await chromium.launch(launchOptions);
		}
	}

	/**
	 * Build capabilities for LambdaTest
	 */
	private buildCapabilities(options?: LambdaTestOptions) {
		// Base LambdaTest capabilities
		const capabilities = {
			browserName: this.mapBrowserName(options?.browserName || 'chrome'),
			browserVersion: options?.browserVersion || 'latest',
			'LT:Options': {
				platform: options?.platform || 'Windows 10',
				build:
					options?.build ||
					process.env.LT_BUILD_NAME ||
					`Playwright Test Build - ${new Date().toISOString()}`,
				name: options?.name || process.env.LT_TEST_NAME || 'Playwright Test',
				user: process.env.LT_USERNAME,
				accessKey: process.env.LT_ACCESS_KEY,
				network: options?.network !== undefined ? options.network : true,
				video: options?.video !== undefined ? options.video : true,
				console: options?.console !== undefined ? options.console : true,
				tunnel: options?.tunnel !== undefined ? options.tunnel : false,
				tunnelName: process.env.LT_TUNNEL_NAME || '',
				geoLocation: '',
				...(options?.projectName && { projectName: options.projectName }),
				...(options?.tags && { tags: options.tags }),
				...(options?.resolution && { resolution: options.resolution }),
			},
		};

		return capabilities;
	}

	/**
	 * Map browser names to LambdaTest format
	 */
	private mapBrowserName(browserName: string): string {
		const browserMap: { [key: string]: string } = {
			chrome: 'Chrome',
			firefox: 'Firefox',
			edge: 'MicrosoftEdge',
			safari: 'Safari',
		};

		return browserMap[browserName] || 'Chrome';
	}

	/**
	 * Mark test as passed in LambdaTest
	 */
	public async markTestStatus(
		page: Page,
		status: 'passed' | 'failed',
		reason?: string
	): Promise<void> {
		if (isLambdaTest()) {
			try {
				await page.evaluate(
					(data) => {
						// @ts-ignore
						window.lambdatest_executor = window.lambdatest_executor || {};
						// @ts-ignore
						window.lambdatest_executor.action = 'setTestStatus';
						// @ts-ignore
						window.lambdatest_executor.arguments = data;
					},
					{ status, remark: reason || '' }
				);
			} catch (error) {
				console.warn('Failed to update LambdaTest status:', error);
			}
		}
	}

	/**
	 * Get LambdaTest session details
	 */
	public async getSessionDetails(page: Page): Promise<any> {
		if (isLambdaTest()) {
			try {
				return await page.evaluate(() => {
					// @ts-ignore
					return window.lambdatest_executor?.session || {};
				});
			} catch (error) {
				console.warn('Failed to get LambdaTest session details:', error);
				return {};
			}
		}
		return {};
	}

	/**
	 * Take screenshot and upload to LambdaTest
	 */
	public async takeScreenshot(page: Page, name?: string): Promise<void> {
		if (isLambdaTest()) {
			try {
				await page.evaluate((screenshotName) => {
					// @ts-ignore
					window.lambdatest_executor = window.lambdatest_executor || {};
					// @ts-ignore
					window.lambdatest_executor.action = 'smartScreenshot';
					// @ts-ignore
					window.lambdatest_executor.arguments = { name: screenshotName };
				}, name || `Screenshot_${Date.now()}`);
			} catch (error) {
				console.warn('Failed to take LambdaTest screenshot:', error);
			}
		} else {
			// Take local screenshot
			await page.screenshot({
				path: `screenshots/${name || 'screenshot'}_${Date.now()}.png`,
				fullPage: true,
			});
		}
	}
}
