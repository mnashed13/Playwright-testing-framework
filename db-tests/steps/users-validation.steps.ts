import { When, Then, Given } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

// When steps for validation scenarios

When('I attempt to insert a user without a username', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
	`;
	try {
		await this.dbClient.execute(query, ['test@example.com', 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a user without an email', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, password_hash)
		VALUES ($1, $2)
	`;
	try {
		await this.dbClient.execute(query, ['testuser', 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a user without a password_hash', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, email)
		VALUES ($1, $2)
	`;
	try {
		await this.dbClient.execute(query, ['testuser', 'test@example.com']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert another user with email {string}', async function (this: DBWorld, email: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, ['another_user_' + Date.now(), email, 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert another user with username {string}', async function (this: DBWorld, username: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, [username, 'newemail_' + Date.now() + '@example.com', 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a user with invalid email {string}', async function (this: DBWorld, invalidEmail: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, ['testuser_' + Date.now(), invalidEmail, 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a user with username {string}', async function (this: DBWorld, username: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, [username, 'test_' + Date.now() + '@example.com', 'hashedpass123']);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I attempt to insert a user with password_hash {string}', async function (this: DBWorld, passwordHash: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
	`;
	try {
		await this.dbClient.execute(query, ['testuser_' + Date.now(), 'test_' + Date.now() + '@example.com', passwordHash]);
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

When('I insert a user with username {string} and valid other fields', async function (this: DBWorld, username: string) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING *
	`;
	await this.executeCommand(query, [username, 'test_' + Date.now() + '@example.com', 'hashedpass123']);
});

When('I insert a user with only required fields', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING *
	`;
	const timestamp = Date.now();
	await this.executeCommand(query, ['user_' + timestamp, 'user_' + timestamp + '@example.com', 'hashedpass123']);
});

When('I insert a new user', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, email, password_hash, first_name, last_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
	`;
	const timestamp = Date.now();
	await this.executeCommand(query, [
		'newuser_' + timestamp,
		'newuser_' + timestamp + '@example.com',
		'hashedpass123',
		'New',
		'User',
	]);
});

Given('I note the current updated_at timestamp', async function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'SELECT updated_at FROM users WHERE id = $1';
	await this.executeQuery(query, [userId]);
	this.lastInsertedRecord.original_updated_at = this.queryResult[0].updated_at;
});

When('I update the user\'s first name after a {int} second delay', async function (this: DBWorld, seconds: number) {
	expect(this.lastInsertedRecord).to.not.be.null;
	
	// Wait for the specified seconds
	await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
	
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET first_name = $1 WHERE id = $2 RETURNING updated_at';
	await this.executeCommand(query, ['UpdatedName', userId]);
});

// Then steps

Then('the insert should fail with a constraint violation error', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.true;
	expect(this.lastError).to.not.be.null;
});

Then('the error should indicate a NOT NULL constraint violation', function (this: DBWorld) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.match(/not null|null value|violates not-null/);
});

Then('the error should indicate an email format check violation', function (this: DBWorld) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.match(/check|constraint|email_format/);
});

Then('the error should indicate a username length check violation', function (this: DBWorld) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.match(/check|constraint|username_length/);
});

Then('the error should indicate a password length check violation', function (this: DBWorld) {
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message.toLowerCase()).to.match(/check|constraint|password_length/);
});

Then('the insert should be successful', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.false;
	expect(this.queryRowCount).to.be.greaterThan(0);
});

Then('the user should have is_active set to true by default', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	expect(this.lastInsertedRecord.is_active).to.be.true;
});

Then('the user should have created_at timestamp set', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	expect(this.lastInsertedRecord.created_at).to.not.be.null;
	expect(this.lastInsertedRecord.created_at).to.not.be.undefined;
});

Then('the user should have updated_at timestamp set', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	expect(this.lastInsertedRecord.updated_at).to.not.be.null;
	expect(this.lastInsertedRecord.updated_at).to.not.be.undefined;
});

Then('the created_at field should be set to current timestamp', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const createdAt = new Date(this.lastInsertedRecord.created_at);
	const now = new Date();
	const diffInSeconds = Math.abs(now.getTime() - createdAt.getTime()) / 1000;
	
	// Created_at should be within 60 seconds of current time
	expect(diffInSeconds).to.be.lessThan(60);
});

Then('the updated_at field should be set to current timestamp', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const updatedAt = new Date(this.lastInsertedRecord.updated_at);
	const now = new Date();
	const diffInSeconds = Math.abs(now.getTime() - updatedAt.getTime()) / 1000;
	
	// Updated_at should be within 60 seconds of current time
	expect(diffInSeconds).to.be.lessThan(60);
});

Then('the updated_at timestamp should be newer than the original', function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	expect(this.lastInsertedRecord.original_updated_at).to.not.be.undefined;
	
	const originalUpdatedAt = new Date(this.lastInsertedRecord.original_updated_at);
	const newUpdatedAt = new Date(this.queryResult[0].updated_at);
	
	expect(newUpdatedAt.getTime()).to.be.greaterThan(originalUpdatedAt.getTime());
});

