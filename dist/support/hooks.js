"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
(0, cucumber_1.Before)(async function () {
    await this.init();
});
(0, cucumber_1.After)(async function () {
    await this.destroy();
});
//# sourceMappingURL=hooks.js.map