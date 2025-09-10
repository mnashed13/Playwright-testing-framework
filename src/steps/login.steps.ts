import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../support/world';

Given('I am on Google homepage', async function (this: World) {
	await this.page.goto('https://www.google.com');

	// Wait for the Google logo to be visible
	await expect(this.page.locator('img[alt="Google"]')).toBeVisible();
	console.log('✅ Successfully navigated to Google homepage');
});

When('I search for {string}', async function (this: World, searchTerm: string) {
	// Find the search input (Google uses different selectors)
	const searchInput = this.page.locator('input[name="q"], textarea[name="q"]');

	// Wait for search input to be visible and type the search term
	await searchInput.waitFor({ state: 'visible' });
	await searchInput.fill(searchTerm);

	console.log(`✅ Typed "${searchTerm}" into search box`);

	// Press Enter or click the search button
	await searchInput.press('Enter');

	// Wait for search results to load
	await this.page.waitForURL('**/search?**');
	console.log('✅ Search results page loaded');
});

Then('I should see search results', async function (this: World) {
	// Wait for search results to be visible
	await expect(this.page.locator('#search')).toBeVisible();

	// Check that we have search result links
	const searchResults = this.page.locator('#search a h3');
	await expect(searchResults.first()).toBeVisible();

	const resultCount = await searchResults.count();
	console.log(`✅ Found ${resultCount} search results`);

	expect(resultCount).toBeGreaterThan(0);
});

Then(
	'I should see search results containing {string}',
	async function (this: World, expectedText: string) {
		// Wait for search results to be visible
		await expect(this.page.locator('#search')).toBeVisible();

		// Check that search results contain the expected text
		const searchResults = this.page.locator('#search');
		await expect(searchResults).toContainText(expectedText, {
			ignoreCase: true,
		});

		console.log(`✅ Search results contain "${expectedText}"`);
	}
);
