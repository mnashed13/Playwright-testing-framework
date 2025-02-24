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
		// Explicitly set headless: false for headed mode
		this.browser = await chromium.launch({
			headless: false, // Force headed mode
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
