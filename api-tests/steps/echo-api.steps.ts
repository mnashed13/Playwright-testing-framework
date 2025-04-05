import {
	Given,
	When,
	Then,
	Before,
	After,
	ITestCaseHookParameter,
} from '@cucumber/cucumber';
import { expect } from 'chai';
import { APIClient } from '../support/api-client';
import { CustomWorld } from '../support/world';
import { AxiosError } from 'axios';
import { CurlFormatter } from '../support/curl-formatter';

// Initialize API client and response object before each scenario
Before(function (this: CustomWorld) {
	this.apiClient = new APIClient();
	this.response = null; // Initialize response
	this.requestData = null;
	this.headers = {};
});

When(
	'I send a GET request to the echo endpoint',
	async function (this: CustomWorld) {
		try {
			this.response = await this.apiClient.get('/get');
		} catch (error) {
			console.error('API request failed:', error);
			throw error;
		}
	}
);

Then(
	'the echo response status code should be {int}',
	async function (this: CustomWorld, statusCode: number) {
		console.log(this.response);
		expect(this.response).to.not.be.null;
		expect(this.response?.status).to.equal(statusCode);
	}
);

Then(
	'the response should contain the request details',
	async function (this: CustomWorld) {
		expect(this.response).to.not.be.null;
		expect(this.response!.data).to.have.property('url');
		expect(this.response!.data).to.have.property('headers');
		expect(this.response!.data).to.have.property('args');
		console.log(this.response!.data);
	}
);

Given('I have valid POST request data', function (this: CustomWorld) {
	this.requestData = {
		method: 'POST',
	};
});

Given('I have empty POST request data', function (this: CustomWorld) {
	this.requestData = {};
});

Given(
	'I set the Content-Type header to {string}',
	function (this: CustomWorld, contentType: string) {
		this.headers = {
			'Content-Type': contentType,
		};
	}
);

When(
	'I send a POST request to the echo endpoint',
	async function (this: CustomWorld) {
		try {
			this.response = await this.apiClient.post('/post', {
				data: this.requestData,
				headers: this.headers,
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				this.response = error.response || null;
			} else {
				throw error;
			}
		}
	}
);

Then(
	'the POST response should contain the sent data',
	async function (this: CustomWorld) {
		expect(this.response).to.not.be.null;
		expect(this.response!.data).to.have.property('json');
		expect(this.response!.data.json).to.deep.equal(this.requestData);
	}
);

Then(
	'the POST response should show different Content-Type',
	async function (this: CustomWorld) {
		expect(this.response).to.not.be.null;
		expect(this.response!.data).to.have.property('headers');
		expect(this.response!.data.headers['content-type']).to.equal('text/plain');
	}
);

Then(
	'the POST response should contain empty data',
	async function (this: CustomWorld) {
		expect(this.response).to.not.be.null;
		expect(this.response!.data).to.have.property('json');
		expect(this.response!.data.json).to.deep.equal({});
	}
);

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
	if (this.response) {
		const curlCommand = CurlFormatter.generateCurlCommand(this.response);

		// Use attach method from the World context
		await this.attach(curlCommand, 'text/plain');

		// Store for report generation
		if (!this.curlCommands) {
			this.curlCommands = [];
		}
		this.curlCommands.push({
			scenarioName: scenario.pickle.name,
			curl: curlCommand,
		});
	}
});
