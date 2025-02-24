import { Page } from '@playwright/test';

export class BasePage {
	protected page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async navigate(path: string = '') {
		const baseUrl = process.env.BASE_URL?.trim() || 'https://www.google.com';
		// Ensure there's no double slash when concatenating
		const cleanPath = path.startsWith('/') ? path : `/${path}`;
		const url = baseUrl.endsWith('/')
			? baseUrl.slice(0, -1) + cleanPath
			: baseUrl + cleanPath;

		console.log(`Navigating to: ${url}`); // Debug log
		await this.page.goto(url);
	}

	async waitForPageLoad() {
		await this.page.waitForLoadState('networkidle');
	}
}
