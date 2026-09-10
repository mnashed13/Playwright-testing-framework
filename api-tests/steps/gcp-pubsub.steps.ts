import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import axios, { AxiosResponse } from 'axios';
import { CustomWorld } from '../support/world';

interface PubSubConfig {
	projectId: string;
	topicName: string;
	subscriptionName: string;
	accessToken: string;
}

let pubSubConfig: PubSubConfig;
let gcpResponse: AxiosResponse | null;

Before(function (this: CustomWorld) {
	pubSubConfig = {
		projectId: process.env.GCP_PROJECT_ID || '',
		topicName: process.env.PUBSUB_TOPIC_NAME || 'test-topic',
		subscriptionName: process.env.PUBSUB_SUBSCRIPTION_NAME || 'test-subscription',
		accessToken: process.env.GCP_ACCESS_TOKEN || '',
	};
	gcpResponse = null;
});

Given('I am authenticated with GCP using service account credentials', async function (this: CustomWorld) {
	// In a real scenario, this would authenticate with GCP
	// For testing, we assume the access token is available
	if (!process.env.GCP_ACCESS_TOKEN) {
		throw new Error('GCP_ACCESS_TOKEN environment variable is required');
	}
	this.attach('Authenticated with GCP service account', 'text/plain');
});

Given('I have a valid GCP project ID', function (this: CustomWorld) {
	if (!pubSubConfig.projectId) {
		throw new Error('GCP_PROJECT_ID environment variable is required');
	}
	this.attach(`Project ID: ${pubSubConfig.projectId}`, 'text/plain');
});

Given('I have a valid topic name', function (this: CustomWorld) {
	this.attach(`Topic name: ${pubSubConfig.topicName}`, 'text/plain');
});

Given('I have a valid subscription name', function (this: CustomWorld) {
	this.attach(`Subscription name: ${pubSubConfig.subscriptionName}`, 'text/plain');
});

Given('I have a valid message payload', function (this: CustomWorld) {
	this.requestData = {
		messages: [
			{
				data: Buffer.from(JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })).toString('base64'),
				attributes: {
					source: 'test',
					environment: 'staging'
				}
			}
		]
	};
	this.attach(`Message payload prepared: ${JSON.stringify(this.requestData)}`, 'text/plain');
});

When('I send a GET request to list Pub/Sub topics', async function (this: CustomWorld) {
	try {
		const url = `https://pubsub.googleapis.com/v1/projects/${pubSubConfig.projectId}/topics`;
		gcpResponse = await axios.get(url, {
			headers: {
				'Authorization': `Bearer ${pubSubConfig.accessToken}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error: any) {
		gcpResponse = error.response || null;
	}
});

When('I send a POST request to create a Pub/Sub topic', async function (this: CustomWorld) {
	try {
		const url = `https://pubsub.googleapis.com/v1/projects/${pubSubConfig.projectId}/topics`;
		gcpResponse = await axios.post(url, {
			name: pubSubConfig.topicName
		}, {
			headers: {
				'Authorization': `Bearer ${pubSubConfig.accessToken}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error: any) {
		gcpResponse = error.response || null;
	}
});

When('I send a POST request to publish a message to the topic', async function (this: CustomWorld) {
	try {
		const url = `https://pubsub.googleapis.com/v1/projects/${pubSubConfig.projectId}/topics/${pubSubConfig.topicName}:publish`;
		gcpResponse = await axios.post(url, this.requestData, {
			headers: {
				'Authorization': `Bearer ${pubSubConfig.accessToken}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error: any) {
		gcpResponse = error.response || null;
	}
});

When('I send a POST request to pull messages from the subscription', async function (this: CustomWorld) {
	try {
		const url = `https://pubsub.googleapis.com/v1/projects/${pubSubConfig.projectId}/subscriptions/${pubSubConfig.subscriptionName}:pull`;
		gcpResponse = await axios.post(url, {
			returnImmediately: true,
			maxMessages: 10
		}, {
			headers: {
				'Authorization': `Bearer ${pubSubConfig.accessToken}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error: any) {
		gcpResponse = error.response || null;
	}
});

When('I send a DELETE request to delete the Pub/Sub topic', async function (this: CustomWorld) {
	try {
		const url = `https://pubsub.googleapis.com/v1/projects/${pubSubConfig.projectId}/topics/${pubSubConfig.topicName}`;
		gcpResponse = await axios.delete(url, {
			headers: {
				'Authorization': `Bearer ${pubSubConfig.accessToken}`,
				'Content-Type': 'application/json'
			}
		});
	} catch (error: any) {
		gcpResponse = error.response || null;
	}
});

Then('the response status code should be {int}', function (this: CustomWorld, statusCode: number) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.status).to.equal(statusCode);
	this.attach(`Response status: ${gcpResponse?.status}`, 'text/plain');
});

Then('the response should contain a list of topics', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.data).to.have.property('topics');
	expect(Array.isArray(gcpResponse?.data.topics)).to.be.true;
	this.attach(`Topics found: ${gcpResponse?.data.topics.length}`, 'text/plain');
});

Then('the response should contain the created topic details', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.data).to.have.property('name');
	expect(gcpResponse?.data.name).to.include(pubSubConfig.topicName);
	this.attach(`Created topic: ${JSON.stringify(gcpResponse?.data)}`, 'text/plain');
});

Then('the topic name should be correct', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	const expectedName = `projects/${pubSubConfig.projectId}/topics/${pubSubConfig.topicName}`;
	expect(gcpResponse?.data.name).to.equal(expectedName);
});

Then('the response should contain message IDs', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.data).to.have.property('messageIds');
	expect(Array.isArray(gcpResponse?.data.messageIds)).to.be.true;
	expect(gcpResponse?.data.messageIds.length).to.be.greaterThan(0);
	this.attach(`Message IDs: ${JSON.stringify(gcpResponse?.data.messageIds)}`, 'text/plain');
});

Then('the message should be successfully published', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.status).to.equal(200);
	this.attach('Message published successfully', 'text/plain');
});

Then('the response should contain messages or be empty', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.data).to.have.property('receivedMessages');
	this.attach(`Received messages: ${gcpResponse?.data.receivedMessages?.length || 0}`, 'text/plain');
});

Then('the topic should be successfully deleted', function (this: CustomWorld) {
	expect(gcpResponse).to.not.be.null;
	expect(gcpResponse?.status).to.equal(200);
	this.attach('Topic deleted successfully', 'text/plain');
});