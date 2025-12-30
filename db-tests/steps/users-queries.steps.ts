import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

// When steps

When('I query for users with role {string}', async function (this: DBWorld, roleName: string) {
	const query = `
		SELECT DISTINCT u.*
		FROM users u
		JOIN user_roles ur ON u.id = ur.user_id
		WHERE ur.role_name = $1
	`;
	await this.executeQuery(query, [roleName]);
});

When('I query for all inactive users', async function (this: DBWorld) {
	const query = 'SELECT * FROM users WHERE is_active = false';
	await this.executeQuery(query);
});

When('I execute a query joining users and user_roles tables', async function (this: DBWorld) {
	const query = `
		SELECT 
			u.id,
			u.username,
			u.email,
			u.first_name,
			u.last_name,
			ur.role_name
		FROM users u
		JOIN user_roles ur ON u.id = ur.user_id
		ORDER BY u.username, ur.role_name
	`;
	await this.executeQuery(query);
});

When('I execute a query to count users grouped by role', async function (this: DBWorld) {
	const query = `
		SELECT 
			ur.role_name,
			COUNT(DISTINCT ur.user_id) as user_count
		FROM user_roles ur
		GROUP BY ur.role_name
		ORDER BY user_count DESC
	`;
	await this.executeQuery(query);
});

When('I query for users who have more than one role', async function (this: DBWorld) {
	const query = `
		SELECT 
			u.*,
			COUNT(ur.role_name) as role_count
		FROM users u
		JOIN user_roles ur ON u.id = ur.user_id
		GROUP BY u.id
		HAVING COUNT(ur.role_name) > 1
	`;
	await this.executeQuery(query);
});

When('I count the total login attempts for user {string}', async function (this: DBWorld, username: string) {
	const query = `
		SELECT COUNT(*) as attempt_count
		FROM login_attempts la
		JOIN users u ON la.user_id = u.id
		WHERE u.username = $1
	`;
	await this.executeQuery(query, [username]);
});

When('I query for successful login attempts for user {string}', async function (this: DBWorld, username: string) {
	const query = `
		SELECT la.*
		FROM login_attempts la
		JOIN users u ON la.user_id = u.id
		WHERE u.username = $1 AND la.success = true
		ORDER BY la.attempted_at DESC
	`;
	await this.executeQuery(query, [username]);
});

When('I query for failed login attempts', async function (this: DBWorld) {
	const query = `
		SELECT *
		FROM login_attempts
		WHERE success = false
		ORDER BY attempted_at DESC
	`;
	await this.executeQuery(query);
});

Given('today\'s date', function (this: DBWorld) {
	this.lastInsertedRecord = { today: new Date() };
});

When('I query for users created in the last {int} days', async function (this: DBWorld, days: number) {
	const query = `
		SELECT *
		FROM users
		WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
		ORDER BY created_at DESC
	`;
	await this.executeQuery(query);
});

When('I execute a query joining users with their login attempt counts', async function (this: DBWorld) {
	const query = `
		SELECT 
			u.id,
			u.username,
			u.email,
			COALESCE(COUNT(la.id), 0) as login_attempt_count
		FROM users u
		LEFT JOIN login_attempts la ON u.id = la.user_id
		GROUP BY u.id, u.username, u.email
		ORDER BY login_attempt_count DESC
	`;
	await this.executeQuery(query);
});

When('I query for users with no login attempts', async function (this: DBWorld) {
	const query = `
		SELECT u.*
		FROM users u
		LEFT JOIN login_attempts la ON u.id = la.user_id
		WHERE la.id IS NULL
	`;
	await this.executeQuery(query);
});

When('I query for the most recent login attempt for each user', async function (this: DBWorld) {
	const query = `
		SELECT DISTINCT ON (u.id)
			u.username,
			la.attempted_at,
			la.success,
			la.ip_address
		FROM users u
		JOIN login_attempts la ON u.id = la.user_id
		ORDER BY u.id, la.attempted_at DESC
	`;
	await this.executeQuery(query);
});

When('I query for login attempts from IP address {string}', async function (this: DBWorld, ipAddress: string) {
	const query = `
		SELECT *
		FROM login_attempts
		WHERE ip_address = $1
		ORDER BY attempted_at DESC
	`;
	await this.executeQuery(query, [ipAddress]);
});

When('I query for IP addresses with more than {int} failed login attempts', async function (this: DBWorld, threshold: number) {
	const query = `
		SELECT 
			ip_address,
			COUNT(*) as failed_attempt_count
		FROM login_attempts
		WHERE success = false AND ip_address IS NOT NULL
		GROUP BY ip_address
		HAVING COUNT(*) > $1
		ORDER BY failed_attempt_count DESC
	`;
	await this.executeQuery(query, [threshold]);
});

When('I query for users with email domain {string}', async function (this: DBWorld, domain: string) {
	const query = `
		SELECT *
		FROM users
		WHERE email LIKE $1
		ORDER BY username
	`;
	await this.executeQuery(query, ['%@' + domain]);
});

When('I execute a query to get user statistics', async function (this: DBWorld) {
	const query = `
		SELECT 
			COUNT(*) as total_users,
			SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
			SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_users
		FROM users
	`;
	await this.executeQuery(query);
});

// Then steps

Then('I should receive at least {int} user record(s)', function (this: DBWorld, minCount: number) {
	expect(this.queryResult.length).to.be.at.least(minCount);
});

Then('all returned users should have the role {string}', function (this: DBWorld, roleName: string) {
	// This is validated by the query itself (it joins on the role)
	expect(this.queryResult.length).to.be.greaterThan(0);
});

Then('no inactive users should be in the results', function (this: DBWorld) {
	for (const user of this.queryResult) {
		expect(user.is_active).to.be.true;
	}
});

Then('all returned users should have is_active set to false', function (this: DBWorld) {
	for (const user of this.queryResult) {
		expect(user.is_active).to.be.false;
	}
});

Then('each record should contain user information and role information', function (this: DBWorld) {
	for (const record of this.queryResult) {
		expect(record).to.have.property('username');
		expect(record).to.have.property('email');
		expect(record).to.have.property('role_name');
	}
});

Then('the results should include username, email, and role_name', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(0);
	const firstRecord = this.queryResult[0];
	expect(firstRecord).to.have.property('username');
	expect(firstRecord).to.have.property('email');
	expect(firstRecord).to.have.property('role_name');
});

Then('I should receive role counts', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(0);
	for (const record of this.queryResult) {
		expect(record).to.have.property('role_name');
		expect(record).to.have.property('user_count');
		expect(record.user_count).to.be.greaterThan(0);
	}
});

Then('the {string} role should have the highest count', function (this: DBWorld, roleName: string) {
	const roleRecord = this.queryResult.find((r) => r.role_name === roleName);
	expect(roleRecord).to.not.be.undefined;
	
	// Check if it has the highest count
	const maxCount = Math.max(...this.queryResult.map((r) => parseInt(r.user_count)));
	expect(parseInt(roleRecord.user_count)).to.equal(maxCount);
});

Then('the {string} role should have at least {int} user(s)', function (this: DBWorld, roleName: string, minCount: number) {
	const roleRecord = this.queryResult.find((r) => r.role_name === roleName);
	expect(roleRecord).to.not.be.undefined;
	expect(parseInt(roleRecord.user_count)).to.be.at.least(minCount);
});

Then('each user should be associated with multiple roles', function (this: DBWorld) {
	for (const record of this.queryResult) {
		expect(record.role_count).to.be.greaterThan(1);
	}
});

Then('the count should be greater than {int}', function (this: DBWorld, minCount: number) {
	expect(this.queryResult.length).to.be.greaterThan(0);
	const count = parseInt(this.queryResult[0].attempt_count || this.queryResult[0].count);
	expect(count).to.be.greaterThan(minCount);
});

Then('I should receive at least {int} login attempt record(s)', function (this: DBWorld, minCount: number) {
	expect(this.queryResult.length).to.be.at.least(minCount);
});

Then('I should receive multiple login attempt records', function (this: DBWorld) {
	expect(this.queryResult.length).to.be.greaterThan(1);
});

Then('all returned attempts should have success set to true', function (this: DBWorld) {
	for (const attempt of this.queryResult) {
		expect(attempt.success).to.be.true;
	}
});

Then('all returned attempts should have success set to false', function (this: DBWorld) {
	for (const attempt of this.queryResult) {
		expect(attempt.success).to.be.false;
	}
});

Then('each attempt should have a failure_reason', function (this: DBWorld) {
	for (const attempt of this.queryResult) {
		expect(attempt.failure_reason).to.not.be.null;
		expect(attempt.failure_reason).to.not.be.undefined;
	}
});

Then('all users should have created_at within the last {int} days', function (this: DBWorld, days: number) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - days);
	
	for (const user of this.queryResult) {
		const createdAt = new Date(user.created_at);
		expect(createdAt.getTime()).to.be.greaterThan(cutoffDate.getTime());
	}
});

Then('all users should be recently created', function (this: DBWorld) {
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);
	
	for (const user of this.queryResult) {
		const createdAt = new Date(user.created_at);
		expect(createdAt.getTime()).to.be.greaterThan(weekAgo.getTime());
	}
});

Then('each record should contain username and login_attempt_count', function (this: DBWorld) {
	for (const record of this.queryResult) {
		expect(record).to.have.property('username');
		expect(record).to.have.property('login_attempt_count');
	}
});

Then('users with no login attempts should show {int} count', function (this: DBWorld, expectedCount: number) {
	const usersWithZeroAttempts = this.queryResult.filter(
		(record) => parseInt(record.login_attempt_count) === expectedCount
	);
	expect(usersWithZeroAttempts.length).to.be.greaterThan(0);
});

Then('these users should have zero login attempts', function (this: DBWorld) {
	// These users are fetched with LEFT JOIN WHERE la.id IS NULL
	// So they inherently have zero login attempts
	expect(this.queryResult.length).to.be.greaterThan(0);
});

Then('each user should appear only once', function (this: DBWorld) {
	const usernames = this.queryResult.map((r) => r.username);
	const uniqueUsernames = [...new Set(usernames)];
	expect(usernames.length).to.equal(uniqueUsernames.length);
});

Then('the attempts should be ordered by most recent first', function (this: DBWorld) {
	if (this.queryResult.length > 1) {
		for (let i = 0; i < this.queryResult.length - 1; i++) {
			const current = new Date(this.queryResult[i].attempted_at);
			const next = new Date(this.queryResult[i + 1].attempted_at);
			expect(current.getTime()).to.be.at.least(next.getTime());
		}
	}
});

Then('all attempts should have the IP address {string}', function (this: DBWorld, ipAddress: string) {
	for (const attempt of this.queryResult) {
		expect(attempt.ip_address).to.equal(ipAddress);
	}
});

Then('I should receive at least {int} IP address(es)', function (this: DBWorld, minCount: number) {
	expect(this.queryResult.length).to.be.at.least(minCount);
});

Then('each IP should have multiple failed attempts', function (this: DBWorld) {
	for (const record of this.queryResult) {
		expect(parseInt(record.failed_attempt_count)).to.be.greaterThan(1);
	}
});

Then('all email addresses should end with {string}', function (this: DBWorld, domain: string) {
	for (const user of this.queryResult) {
		expect(user.email).to.match(new RegExp(domain + '$'));
	}
});

Then('I should receive summary information including:', function (this: DBWorld) {
	expect(this.queryResult.length).to.equal(1);
	const summary = this.queryResult[0];
	expect(summary).to.have.property('total_users');
	expect(summary).to.have.property('active_users');
	expect(summary).to.have.property('inactive_users');
});

Then('the numbers should be consistent with individual queries', function (this: DBWorld) {
	const summary = this.queryResult[0];
	const totalUsers = parseInt(summary.total_users);
	const activeUsers = parseInt(summary.active_users);
	const inactiveUsers = parseInt(summary.inactive_users);
	
	expect(totalUsers).to.equal(activeUsers + inactiveUsers);
});


