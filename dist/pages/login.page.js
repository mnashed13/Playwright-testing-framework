"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
const base_page_1 = require("./base.page");
class LoginPage extends base_page_1.BasePage {
    constructor(page) {
        super(page);
    }
    // Locators
    usernameInput = () => this.page.getByLabel('Username');
    passwordInput = () => this.page.getByLabel('Password');
    loginButton = () => this.page.getByRole('button', { name: 'Login' });
    // Actions
    async login(username, password) {
        await this.usernameInput().fill(username);
        await this.passwordInput().fill(password);
        await this.loginButton().click();
        await this.waitForPageLoad();
    }
}
exports.LoginPage = LoginPage;
//# sourceMappingURL=login.page.js.map