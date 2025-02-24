import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	// Locators
	private signInButton = () => this.page.getByRole('link', { name: 'Sign in' });
	private searchBox = () => this.page.getByRole('combobox', { name: 'Search' });
	private searchButton = () =>
		this.page.getByRole('button', { name: 'Google Search' });
	private imagesLink = () => this.page.getByRole('link', { name: 'Images' });
	private gmailLink = () => this.page.getByRole('link', { name: 'Gmail' });
	private advancedSearchLink = () =>
		this.page.getByRole('link', { name: 'Advanced search' });

	// Actions
	async navigateToGoogle() {
		await this.navigate('/');
	}

	async clickSignIn() {
		await this.signInButton().click();
		await this.waitForPageLoad();
	}

	async performSearch(searchTerm: string) {
		await this.searchBox().fill(searchTerm);
		await this.searchButton().click();
		await this.waitForPageLoad();
	}

	async navigateToImages() {
		await this.imagesLink().click();
		await this.waitForPageLoad();
	}

	async navigateToGmail() {
		await this.gmailLink().click();
		await this.waitForPageLoad();
	}

	async navigateToAdvancedSearch() {
		await this.advancedSearchLink().click();
		await this.waitForPageLoad();
	}
}
