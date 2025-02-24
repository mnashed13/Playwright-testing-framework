import { Before, After } from '@cucumber/cucumber';
import { World } from './world';

Before(async function (this: World) {
	await this.init();
});

After(async function (this: World) {
	await this.destroy();
});
