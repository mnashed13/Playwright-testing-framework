import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

// Given steps

Given('a user exists with username {string}', async function (this: DBWorld, username: string) {
	const query = 'SELECT * FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult.length).to.be.greaterThan(0, `User with username ${username} should exist`);
	this.lastInsertedRecord = this.queryResult[0];
});

Given('a user exists with email {string}', async function (this: DBWorld, email: string) {
	const query = 'SELECT * FROM users WHERE email = $1';
	await this.executeQuery(query, [email]);
	expect(this.queryResult.length).to.be.greaterThan(0, `User with email ${email} should exist`);
});

Given('the user is currently active', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	expect(this.lastInsertedRecord.is_active).to.be.true;
});

Given('I insert a user with username {string} and email {string}', async function (
	this: DBWorld,
	username: string,
	email: string
) {
	const query = `
		INSERT INTO users (username, email, password_hash, first_name, last_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
	`;
	await this.executeCommand(query, [username, email, 'hashedpass123', 'Test', 'User']);
});

// When steps

When('I insert a new user with the following details:', async function (this: DBWorld, dataTable: DataTable) {
	const user = dataTable.hashes()[0];
	const query = `
		INSERT INTO users (username, email, password_hash, first_name, last_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
	`;
	await this.executeCommand(query, [
		user.username,
		user.email,
		user.password_hash,
		user.first_name,
		user.last_name,
	]);
});

When('I query for the user by their ID', async function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'SELECT * FROM users WHERE id = $1';
	await this.executeQuery(query, [userId]);
});

When('I query for user with username {string}', async function (this: DBWorld, username: string) {
	const query = 'SELECT * FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
});

When('I query for user with email {string}', async function (this: DBWorld, email: string) {
	const query = 'SELECT * FROM users WHERE email = $1';
	await this.executeQuery(query, [email]);
});

When('I update the user\'s first name to {string}', async function (this: DBWorld, firstName: string) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET first_name = $1 WHERE id = $2';
	await this.executeCommand(query, [firstName, userId]);
});

When('I update the user\'s last name to {string}', async function (this: DBWorld, lastName: string) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET last_name = $1 WHERE id = $2';
	await this.executeCommand(query, [lastName, userId]);
});

When('I update the user\'s email to {string}', async function (this: DBWorld, email: string) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET email = $1 WHERE id = $2';
	await this.executeCommand(query, [email, userId]);
});

When('I set the user\'s is_active status to false', async function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET is_active = $1 WHERE id = $2';
	await this.executeCommand(query, [false, userId]);
});

When('I delete the user {string}', async function (this: DBWorld, username: string) {
	const query = 'DELETE FROM users WHERE username = $1';
	await this.executeCommand(query, [username]);
});

When('I attempt to insert a new user with the same email {string}', async function (this: DBWorld, email: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, ['duplicate_user', email, 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a new user with the same username {string}', async function (this: DBWorld, username: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, [username, 'newemail@example.com', 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I query for all active users', async function (this: DBWorld) {
	const query = 'SELECT * FROM users WHERE is_active = true';
	await this.executeQuery(query);
});

When('I execute a count query on the users table', async function (this: DBWorld) {
	const query = 'SELECT COUNT(*) as count FROM users';
	await this.executeQuery(query);
});

// Then steps

Then('the user should be created successfully', function (this: DBWorld) {
	expect(this.queryRowCount).to.be.greaterThan(0);
	expect(this.errorOccurred).to.be.false;
});

Then('the last insert should return an ID', function (this: DBWorld) {
	expect(this.lastInsertId).to.not.be.null;
	expect(this.lastInsertId).to.be.a('number');
});

Then('the user {string} should exist in the database', async function (this: DBWorld, username: string) {
	const query = 'SELECT * FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult.length).to.equal(1, `User ${username} should exist`);
});

Then('I should receive {int} user record(s)', function (this: DBWorld, expectedCount: number) {
	expect(this.queryResult.length).to.equal(expectedCount);
});

Then('I should receive multiple user records', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(1);
});

Then('the user record should contain:', function (this: DBWorld, dataTable: DataTable) {
	const expectedFields = dataTable.hashes()[0];
	const user = this.queryResult[0];
	
	for (const [field, value] of Object.entries(expectedFields)) {
		if (value === 'true' || value === 'false') {
			expect(user[field]).to.equal(value === 'true');
		} else {
			expect(user[field]).to.equal(value);
		}
	}
});

Then('the user should have email {string}', function (this: DBWorld, email: string) {
	expect(this.queryResult[0].email).to.equal(email);
});

Then('the user should have username {string}', function (this: DBWorld, username: string) {
	expect(this.queryResult[0].username).to.equal(username);
});

Then('the update should be successful', function (this: DBWorld) {
	expect(this.queryRowCount).to.be.greaterThan(0);
	expect(this.errorOccurred).to.be.false;
});

Then('the user {string} should have first name {string}', async function (
	this: DBWorld,
	username: string,
	firstName: string
) {
	const query = 'SELECT first_name FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult[0].first_name).to.equal(firstName);
});

Then('the user {string} should have last name {string}', async function (
	this: DBWorld,
	username: string,
	lastName: string
) {
	const query = 'SELECT last_name FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult[0].last_name).to.equal(lastName);
});

Then('the user {string} should have email {string}', async function (
	this: DBWorld,
	username: string,
	email: string
) {
	const query = 'SELECT email FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult[0].email).to.equal(email);
});

Then('the user {string} should be inactive', async function (this: DBWorld, username: string) {
	const query = 'SELECT is_active FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult[0].is_active).to.be.false;
});

Then('the delete should be successful', function (this: DBWorld) {
	expect(this.queryRowCount).to.be.greaterThan(0);
	expect(this.errorOccurred).to.be.false;
});

Then('the user {string} should not exist in the database', async function (this: DBWorld, username: string) {
	const query = 'SELECT * FROM users WHERE username = $1';
	await this.executeQuery(query, [username]);
	expect(this.queryResult.length).to.equal(0, `User ${username} should not exist`);
});

Then('the insert should fail with a constraint violation error', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.true;
	expect(this.lastError).to.not.be.null;
});

Then('the error message should mention {string}', function (this: DBWorld, errorText: string) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.include(errorText.toLowerCase());
});

Then('the error message should contain {string}', function (this: DBWorld, errorText: string) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.include(errorText.toLowerCase());
});

Then('all returned users should have is_active set to true', function (this: DBWorld) {
	for (const user of this.queryResult) {
		expect(user.is_active).to.be.true;
	}
});

Then('the count should be greater than {int}', function (this: DBWorld, minCount: number) {
	expect(this.queryResult[0].count).to.be.greaterThan(minCount);
});

