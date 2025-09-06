import {
	setWorldConstructor,
	World as CucumberWorld,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';

export class World extends CucumberWorld {
	private browser!: Browser;
	private context!: BrowserContext;
	public page!: Page;

	constructor(options: any) {
		super(options);
	}

	async init() {
		// Check if we're running on BrowserStack
		if (this.parameters?.browserstack || process.env.BROWSERSTACK_USERNAME) {
			// BrowserStack SDK will handle browser initialization
			// We don't need to launch a browser here as the SDK does it
			console.log(
				'Running on BrowserStack - SDK will handle browser initialization'
			);
			return;
		}

		// Run locally
		this.browser = await chromium.launch({
			headless: this.parameters?.headless !== false, // Use parameter or default to headless
			slowMo: 100, // Add a small delay between actions to make it more visible
		});
		this.context = await this.browser.newContext();
		this.page = await this.context.newPage();
	}

	async destroy() {
		await this.page?.close();
		await this.context?.close();
		await this.browser?.close();
	}
}

setWorldConstructor(World);
