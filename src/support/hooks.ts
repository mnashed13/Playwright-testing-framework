import { Before, After, Status } from '@cucumber/cucumber';
import { World } from './world';

Before(async function (this: World, scenario) {
	// Initialize the world with scenario context
	await this.init({
		scenarioName: scenario.pickle.name,
		tags: scenario.pickle.tags?.map((tag) => tag.name) || [],
		name: scenario.pickle.name,
	});
});

After(async function (this: World, scenario) {
	// Mark test status in LambdaTest based on scenario result
	if (scenario.result?.status === Status.PASSED) {
		await this.markTestPassed(
			`Scenario "${scenario.pickle.name}" passed successfully`
		);
	} else if (scenario.result?.status === Status.FAILED) {
		await this.markTestFailed(
			`Scenario "${scenario.pickle.name}" failed: ${
				scenario.result?.message || 'Unknown error'
			}`
		);
		// Take screenshot on failure
		await this.takeScreenshot(`failed_${scenario.pickle.name}`);
	}

	// Clean up resources
	await this.destroy();
});
