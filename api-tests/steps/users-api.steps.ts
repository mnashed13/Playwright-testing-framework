const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { APIClient } = require('../support/api-client');

const apiClient = new APIClient();
let response: any;
let userId: string;
let userPayload: any;

Given('I have a valid user ID', function () {
	userId = '123'; // This could come from test data or environment
});

Given('I have valid user creation payload', function () {
	userPayload = {
		name: 'John Doe',
		email: 'john.doe@example.com',
		role: 'user',
	};
});

Given('I have valid user update payload', function () {
	userPayload = {
		name: 'John Updated',
		email: 'john.updated@example.com',
	};
});

When('I send a GET request to fetch user details', async function () {
	response = await apiClient.get(`/users/${userId}`);
});

When('I send a POST request to create user', async function () {
	response = await apiClient.post('/users', userPayload);
});

When('I send a PUT request to update user', async function () {
	response = await apiClient.put(`/users/${userId}`, userPayload);
});

Then('the response status code should be {int}', function (statusCode: number) {
	expect(response.status).to.equal(statusCode);
});

Then('the response should contain user information', function () {
	expect(response.data).to.have.property('id');
	expect(response.data).to.have.property('name');
	expect(response.data).to.have.property('email');
});

Then('the response should contain the created user details', function () {
	expect(response.data).to.have.property('id');
	expect(response.data.name).to.equal(userPayload.name);
	expect(response.data.email).to.equal(userPayload.email);
});

Then('the response should contain updated information', function () {
	expect(response.data.name).to.equal(userPayload.name);
	expect(response.data.email).to.equal(userPayload.email);
});
