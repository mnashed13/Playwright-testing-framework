"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const login_page_1 = require("../pages/login.page");
(0, cucumber_1.Given)('I am on the login page', async function () {
    const loginPage = new login_page_1.LoginPage(this.page);
    // await loginPage.navigate(process.env.BASE_URL);
    await loginPage.navigate('https://www.google.com/');
});
(0, cucumber_1.When)('I login with valid credentials', async function () {
    const loginPage = new login_page_1.LoginPage(this.page);
    await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
});
(0, cucumber_1.When)('I login with invalid credentials', async function () {
    const loginPage = new login_page_1.LoginPage(this.page);
    await loginPage.login('invalid_user', 'invalid_password');
});
(0, cucumber_1.Then)('I should be logged in successfully', async function () {
    await (0, test_1.expect)(this.page.getByText('Welcome')).toBeVisible();
});
(0, cucumber_1.Then)('I should see an error message', async function () {
    await (0, test_1.expect)(this.page.getByText('Invalid credentials')).toBeVisible();
});
//# sourceMappingURL=login.steps.js.map