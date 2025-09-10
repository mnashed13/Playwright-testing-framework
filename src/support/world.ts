import {
	setWorldConstructor,
	World as CucumberWorld,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LambdaTestHelper, LambdaTestOptions } from './lambdatest-helper';
import { isLambdaTest } from '../../lambdatest.config';

export class World extends CucumberWorld {
	private browser!: Browser;
	private context!: BrowserContext;
	public page!: Page;
	private lambdaTestHelper: LambdaTestHelper;
	public testName: string = '';
	public scenarioName: string = '';

	constructor(options: any) {
		super(options);
		this.lambdaTestHelper = LambdaTestHelper.getInstance();
	}

	async init(
		options?: LambdaTestOptions & { scenarioName?: string; tags?: string[] }
	) {
		// Set test context information from options or defaults
		this.scenarioName = options?.scenarioName || 'Unknown Scenario';
		this.testName = `${this.scenarioName} - ${new Date().toISOString()}`;

		// Create browser instance (LambdaTest or local)
		const browserOptions: LambdaTestOptions = {
			name: this.testName,
			build:
				process.env.LT_BUILD_NAME ||
				`Cucumber Build - ${new Date().toISOString()}`,
			projectName: 'Playwright Cucumber Tests',
			tags: options?.tags || [],
			...options,
		};

		this.browser = await this.lambdaTestHelper.createBrowser(browserOptions);
		this.context = await this.browser.newContext({
			// Add viewport and other context options
			viewport: { width: 1920, height: 1080 },
			// Enable video recording for LambdaTest
			...(isLambdaTest() && { recordVideo: { dir: 'test-results/videos' } }),
		});
		this.page = await this.context.newPage();

		// Set up page event listeners
		this.setupPageListeners();
	}

	private setupPageListeners() {
		// Log console messages
		this.page.on('console', (msg) => {
			console.log(`Console [${msg.type()}]:`, msg.text());
		});

		// Log page errors
		this.page.on('pageerror', (error) => {
			console.error('Page Error:', error.message);
		});

		// Log network failures
		this.page.on('requestfailed', (request) => {
			console.warn(
				`Request failed: ${request.url()} - ${request.failure()?.errorText}`
			);
		});
	}

	async markTestPassed(reason?: string) {
		await this.lambdaTestHelper.markTestStatus(this.page, 'passed', reason);
	}

	async markTestFailed(reason?: string) {
		await this.lambdaTestHelper.markTestStatus(this.page, 'failed', reason);
	}

	async takeScreenshot(name?: string) {
		await this.lambdaTestHelper.takeScreenshot(
			this.page,
			name || this.scenarioName
		);
	}

	async getSessionDetails() {
		return await this.lambdaTestHelper.getSessionDetails(this.page);
	}

	async destroy() {
		// Screenshot will be handled in hooks based on scenario result
		await this.page?.close();
		await this.context?.close();
		await this.browser?.close();
	}
}

setWorldConstructor(World);
