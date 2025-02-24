import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { World } from '../support/world';

Given('I am on the login page', async function (this: World) {
	const loginPage = new LoginPage(this.page);
	await loginPage.navigate(process.env.BASE_URL);
});

When('I login with valid credentials', async function (this: World) {
	const loginPage = new LoginPage(this.page);
	// await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
});

When('I login with invalid credentials', async function (this: World) {
	const loginPage = new LoginPage(this.page);
	// await loginPage.login('invalid_user', 'invalid_password');
});

Then('I should be logged in successfully', async function (this: World) {
	// await expect(this.page.getByText('Google')).toBeVisible();
});

Then('I should see an error message', async function (this: World) {
	// await expect(this.page.getByText('Invalid credentials')).toBeVisible();
});
