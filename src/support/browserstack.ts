import {
	chromium,
	firefox,
	webkit,
	Browser,
	BrowserContext,
	Page,
} from '@playwright/test';
import { browserstackConfig } from '../../browserstack.config';

export class BrowserStackHelper {
	private static instance: BrowserStackHelper;
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private page: Page | null = null;

	private constructor() {}

	public static getInstance(): BrowserStackHelper {
		if (!BrowserStackHelper.instance) {
			BrowserStackHelper.instance = new BrowserStackHelper();
		}
		return BrowserStackHelper.instance;
	}

	public async connectToBrowserStack(
		browserName: string = 'chrome'
	): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
		if (
			!process.env.BROWSERSTACK_USERNAME ||
			!process.env.BROWSERSTACK_ACCESS_KEY
		) {
			throw new Error(
				'BrowserStack credentials not found. Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.'
			);
		}

		const capabilities = this.getCapabilities(browserName);
		const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
			JSON.stringify(capabilities)
		)}`;

		let browserType;
		switch (browserName.toLowerCase()) {
			case 'firefox':
				browserType = firefox;
				break;
			case 'safari':
				browserType = webkit;
				break;
			default:
				browserType = chromium;
		}

		this.browser = await browserType.connectOverCDP(wsEndpoint);
		this.context = await this.browser.newContext();
		this.page = await this.context.newPage();

		return {
			browser: this.browser,
			context: this.context,
			page: this.page,
		};
	}

	private getCapabilities(browserName: string): any {
		const baseCapabilities = {
			name: `${browserstackConfig.sessionName}_${browserName}`,
			build: browserstackConfig.build,
			project: browserstackConfig.project,
			...browserstackConfig.capabilities,
		};

		switch (browserName.toLowerCase()) {
			case 'chrome':
				return {
					...baseCapabilities,
					browserName: 'Chrome',
					browserVersion: 'latest',
					os: 'Windows',
					osVersion: '11',
				};
			case 'firefox':
				return {
					...baseCapabilities,
					browserName: 'Firefox',
					browserVersion: 'latest',
					os: 'Windows',
					osVersion: '11',
				};
			case 'safari':
				return {
					...baseCapabilities,
					browserName: 'Safari',
					browserVersion: 'latest',
					os: 'OS X',
					osVersion: 'Monterey',
				};
			case 'edge':
				return {
					...baseCapabilities,
					browserName: 'Edge',
					browserVersion: 'latest',
					os: 'Windows',
					osVersion: '11',
				};
			case 'chrome-mobile':
				return {
					...baseCapabilities,
					browserName: 'Chrome',
					device: 'Samsung Galaxy S21',
					os: 'android',
					osVersion: '11.0',
				};
			case 'safari-mobile':
				return {
					...baseCapabilities,
					browserName: 'Safari',
					device: 'iPhone 12',
					os: 'ios',
					osVersion: '14',
				};
			default:
				return {
					...baseCapabilities,
					browserName: 'Chrome',
					browserVersion: 'latest',
					os: 'Windows',
					osVersion: '11',
				};
		}
	}

	public async disconnect(): Promise<void> {
		if (this.page) {
			await this.page.close();
			this.page = null;
		}
		if (this.context) {
			await this.context.close();
			this.context = null;
		}
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}

	public async markTestStatus(
		status: 'passed' | 'failed',
		reason?: string
	): Promise<void> {
		if (!this.page) {
			throw new Error('No active page found');
		}

		try {
			await this.page.evaluate(
				(data) => {
					// @ts-ignore
					if (window.BrowserStack) {
						// @ts-ignore
						window.BrowserStack.executor.execute(
							`browserstack_executor: ${JSON.stringify(data)}`
						);
					}
				},
				{
					action: 'setSessionStatus',
					status: status,
					reason: reason || '',
				}
			);
		} catch (error) {
			console.warn('Failed to mark test status:', error);
		}
	}

	public async addTestComment(comment: string): Promise<void> {
		if (!this.page) {
			throw new Error('No active page found');
		}

		try {
			await this.page.evaluate(
				(data) => {
					// @ts-ignore
					if (window.BrowserStack) {
						// @ts-ignore
						window.BrowserStack.executor.execute(
							`browserstack_executor: ${JSON.stringify(data)}`
						);
					}
				},
				{
					action: 'setSessionStatus',
					status: 'info',
					reason: comment,
				}
			);
		} catch (error) {
			console.warn('Failed to add test comment:', error);
		}
	}
}

export const browserStackHelper = BrowserStackHelper.getInstance();
