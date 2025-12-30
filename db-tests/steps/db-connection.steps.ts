import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';
import { DBFactory } from '../support/db-factory';
import { DBConfig } from '../support/db-client-interface';

Given('the database configuration is loaded from environment variables', async function (this: DBWorld) {
	// Configuration is already loaded in the World constructor
	const config = this.dbClient.getConfig();
	expect(config).to.not.be.null;
	expect(config.host).to.not.be.undefined;
});

Given('I am connected to the database', async function (this: DBWorld) {
	// Connection is established in the Before hook
	const isConnected = await this.dbClient.isConnected();
	expect(isConnected).to.be.true;
});

When('I attempt to connect to the database', async function (this: DBWorld) {
	await this.dbClient.connect();
});

When('I attempt to reconnect to the database', async function (this: DBWorld) {
	await this.dbClient.connect();
});

When('I disconnect from the database', async function (this: DBWorld) {
	await this.dbClient.disconnect();
});

When('I retrieve the database configuration', function (this: DBWorld) {
	const config = this.dbClient.getConfig();
	this.queryResult = [config];
});

When('I perform a health check query', async function (this: DBWorld) {
	await this.executeQuery('SELECT 1 as health_check');
});

Given('I have invalid database credentials', function (this: DBWorld) {
	// Create a new client with invalid credentials
	const invalidConfig: DBConfig = {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5432'),
		database: 'invalid_database',
		user: 'invalid_user',
		password: 'invalid_password',
		ssl: false,
	};
	this.dbClient = DBFactory.createClient('postgres', invalidConfig);
});

When('I attempt to connect with invalid credentials', async function (this: DBWorld) {
	try {
		await this.dbClient.connect();
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

Given('I have a very short connection timeout configured', function (this: DBWorld) {
	const timeoutConfig: DBConfig = {
		host: '192.0.2.1', // Non-routable IP address
		port: 5432,
		database: 'testdb',
		user: 'test',
		password: 'test',
		connectionTimeout: 100, // Very short timeout
	};
	this.dbClient = DBFactory.createClient('postgres', timeoutConfig);
});

When('I attempt to connect to an unreachable database host', async function (this: DBWorld) {
	try {
		await this.dbClient.connect();
		this.errorOccurred = false;
	} catch (error) {
		this.errorOccurred = true;
		this.lastError = error as Error;
	}
});

Then('the connection should be successful', async function (this: DBWorld) {
	const isConnected = await this.dbClient.isConnected();
	expect(isConnected).to.be.true;
});

Then('the connection should be re-established successfully', async function (this: DBWorld) {
	const isConnected = await this.dbClient.isConnected();
	expect(isConnected).to.be.true;
});

Then('I should be able to query the database', async function (this: DBWorld) {
	await this.executeQuery('SELECT 1 as test');
	expect(this.queryResult).to.have.lengthOf(1);
});

Then('the database type should be {string}', function (this: DBWorld, expectedType: string) {
	const dbType = this.dbClient.getType();
	expect(dbType).to.equal(expectedType);
});

Then('the database name should match the configured value', function (this: DBWorld) {
	const config = this.dbClient.getConfig();
	expect(config.database).to.equal(process.env.DB_NAME || process.env.DB_DATABASE || 'testdb');
});

Then('the health check should return successfully', function (this: DBWorld) {
	expect(this.queryResult).to.have.lengthOf(1);
	expect(this.queryResult[0]).to.have.property('health_check', 1);
});

Then('the response time should be less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime);
});

Then('the connection should fail with an authentication error', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.true;
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message).to.match(/authentication|password|credentials|role/i);
});

Then('the connection should fail with a timeout error', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.true;
	expect(this.lastError).to.not.be.null;
	expect(this.lastError!.message).to.match(/timeout|timed out|ETIMEDOUT|ECONNREFUSED/i);
});


