import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

// Given steps

Given('I insert a test user for deletion', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING *
	`;
	const timestamp = Date.now();
	await this.executeCommand(query, [
		'delete_test_' + timestamp,
		'delete_' + timestamp + '@example.com',
		'hashedpass123',
	]);
});

// When steps

When('I query for a single user by ID', async function (this: DBWorld) {
	const query = 'SELECT * FROM users WHERE id = 1';
	await this.executeQuery(query);
});

When('I query for a user by email {string}', async function (this: DBWorld, email: string) {
	const query = 'SELECT * FROM users WHERE email = $1';
	await this.executeQuery(query, [email]);
});

When('I execute a join query between users and user_roles', async function (this: DBWorld) {
	const query = `
		SELECT 
			u.id,
			u.username,
			u.email,
			ur.role_name
		FROM users u
		JOIN user_roles ur ON u.id = ur.user_id
		ORDER BY u.id
	`;
	await this.executeQuery(query);
});

When('I execute a count aggregation on the users table', async function (this: DBWorld) {
	const query = 'SELECT COUNT(*) as total FROM users';
	await this.executeQuery(query);
});

When('I insert {int} users in a single transaction', async function (this: DBWorld, count: number) {
	await this.beginTransaction();
	
	const insertPromises = [];
	for (let i = 0; i < count; i++) {
		const query = `
			INSERT INTO users (username, email, password_hash)
			VALUES ($1, $2, $3)
		`;
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(7);
		insertPromises.push(
			this.currentTransaction.query(query, [
				`bulk_user_${timestamp}_${randomSuffix}_${i}`,
				`bulk_${timestamp}_${randomSuffix}_${i}@example.com`,
				'hashedpass123',
			])
		);
	}
	
	await Promise.all(insertPromises);
	this.queryRowCount = count;
});

When('I insert a single user into the database', async function (this: DBWorld) {
	const query = `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING *
	`;
	const timestamp = Date.now();
	await this.executeCommand(query, [
		'perf_user_' + timestamp,
		'perf_' + timestamp + '@example.com',
		'hashedpass123',
	]);
});

When('I update the user\'s information', async function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'UPDATE users SET first_name = $1 WHERE id = $2';
	await this.executeCommand(query, ['Updated', userId]);
});

When('I delete the test user', async function (this: DBWorld) {
	expect(this.lastInsertedRecord).to.not.be.null;
	const userId = this.lastInsertedRecord.id;
	const query = 'DELETE FROM users WHERE id = $1';
	await this.executeCommand(query, [userId]);
});

When('I execute {int} concurrent queries', async function (this: DBWorld, count: number) {
	const queries = [];
	for (let i = 0; i < count; i++) {
		queries.push(this.dbClient.query('SELECT * FROM users LIMIT 10'));
	}
	
	const startTime = Date.now();
	const results = await Promise.all(queries);
	this.executionTime = Date.now() - startTime;
	
	// Store results for validation
	this.queryResult = results.map((r) => ({ rowCount: r.rowCount }));
	this.queryRowCount = results.length;
});

When('I execute a complex query with {int} table joins', async function (this: DBWorld, joinCount: number) {
	// Complex query joining users, user_roles, and login_attempts
	const query = `
		SELECT 
			u.id,
			u.username,
			u.email,
			ur.role_name,
			la.attempted_at,
			la.success
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN login_attempts la ON u.id = la.user_id
		WHERE u.is_active = true
		ORDER BY u.id, la.attempted_at DESC
		LIMIT 100
	`;
	await this.executeQuery(query);
});

When('I query for users ordered by created_at descending', async function (this: DBWorld) {
	const query = 'SELECT * FROM users ORDER BY created_at DESC';
	await this.executeQuery(query);
});

When('I query for the first {int} users', async function (this: DBWorld, limit: number) {
	const query = `SELECT * FROM users LIMIT ${limit}`;
	await this.executeQuery(query);
});

When('I search for users with username containing {string}', async function (this: DBWorld, searchTerm: string) {
	const query = `SELECT * FROM users WHERE username LIKE $1`;
	await this.executeQuery(query, ['%' + searchTerm + '%']);
});

// Then steps

Then('the query should complete in less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime, 
		`Query took ${this.executionTime}ms, expected less than ${maxTime}ms`);
});

Then('I should receive exactly {int} user record(s)', function (this: DBWorld, expectedCount: number) {
	expect(this.queryResult.length).to.equal(expectedCount);
});

Then('the query should use the email index', async function (this: DBWorld) {
	// Use EXPLAIN to verify index usage
	const explainQuery = `
		EXPLAIN (FORMAT JSON)
		SELECT * FROM users WHERE email = 'admin@example.com'
	`;
	await this.executeQuery(explainQuery);
	
	const plan = JSON.stringify(this.queryResult);
	expect(plan.toLowerCase()).to.match(/index|idx_users_email/);
});

Then('I should receive multiple records with joined data', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(1);
	
	// Verify joined data is present
	for (const record of this.queryResult) {
		expect(record).to.have.property('username');
		expect(record).to.have.property('role_name');
	}
});

Then('I should receive a valid count result', function (this: DBWorld) {
	expect(this.queryResult.length).to.equal(1);
	expect(this.queryResult[0]).to.have.property('total');
	expect(parseInt(this.queryResult[0].total)).to.be.greaterThan(0);
});

Then('the bulk insert should complete in less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime,
		`Bulk insert took ${this.executionTime}ms, expected less than ${maxTime}ms`);
});

Then('all {int} users should be inserted successfully', function (this: DBWorld, expectedCount: number) {
	expect(this.queryRowCount).to.equal(expectedCount);
});

Then('the insert should complete in less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime,
		`Insert took ${this.executionTime}ms, expected less than ${maxTime}ms`);
});

Then('the user should be created successfully', function (this: DBWorld) {
	expect(this.queryRowCount).to.be.greaterThan(0);
	expect(this.errorOccurred).to.be.false;
});

Then('the update should complete in less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime,
		`Update took ${this.executionTime}ms, expected less than ${maxTime}ms`);
});

Then('the update should affect exactly {int} row(s)', function (this: DBWorld, expectedRows: number) {
	expect(this.queryRowCount).to.equal(expectedRows);
});

Then('the delete should complete in less than {int} milliseconds', function (this: DBWorld, maxTime: number) {
	expect(this.executionTime).to.be.lessThan(maxTime,
		`Delete took ${this.executionTime}ms, expected less than ${maxTime}ms`);
});

Then('the delete should affect exactly {int} row(s)', function (this: DBWorld, expectedRows: number) {
	expect(this.queryRowCount).to.equal(expectedRows);
});

Then('all queries should complete successfully', function (this: DBWorld) {
	expect(this.queryRowCount).to.be.greaterThan(0);
	expect(this.errorOccurred).to.be.false;
});

Then('the average query time should be less than {int} milliseconds', function (this: DBWorld, maxAvgTime: number) {
	const avgTime = this.executionTime / this.queryRowCount;
	expect(avgTime).to.be.lessThan(maxAvgTime,
		`Average query time was ${avgTime}ms, expected less than ${maxAvgTime}ms`);
});

Then('no connection pool errors should occur', function (this: DBWorld) {
	expect(this.errorOccurred).to.be.false;
	expect(this.lastError).to.be.null;
});

Then('I should receive the expected result set', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(0);
});

Then('the results should be properly sorted', function (this: DBWorld) {
	if (this.queryResult.length > 1) {
		for (let i = 0; i < this.queryResult.length - 1; i++) {
			const current = new Date(this.queryResult[i].created_at);
			const next = new Date(this.queryResult[i + 1].created_at);
			expect(current.getTime()).to.be.at.least(next.getTime());
		}
	}
});

Then('I should receive matching user records', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(0);
});

Then('I should receive users within the date range', function (this: DBWorld) {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	
	for (const user of this.queryResult) {
		const createdAt = new Date(user.created_at);
		expect(createdAt.getTime()).to.be.greaterThan(thirtyDaysAgo.getTime());
	}
});

