"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
class World extends cucumber_1.World {
    browser;
    context;
    page;
    constructor(options) {
        super(options);
    }
    async init() {
        this.browser = await test_1.chromium.launch({
            headless: !this.parameters.headless,
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
exports.World = World;
(0, cucumber_1.setWorldConstructor)(World);
//# sourceMappingURL=world.js.map