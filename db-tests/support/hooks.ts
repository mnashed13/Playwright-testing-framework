import { Before, After, BeforeAll, AfterAll, Status, setWorldConstructor } from '@cucumber/cucumber';
import { DBWorld } from './db-world';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the custom World constructor
setWorldConstructor(DBWorld);

/**
 * Before All Hook - Runs once before all scenarios
 * Sets up the test database schema and seed data
 */
BeforeAll({ timeout: 60000 }, async function () {
	console.log('\n========================================');
	console.log('🚀 Initializing Database Test Suite');
	console.log('========================================\n');

	// Only run schema setup if DB_SETUP_SCHEMA is true
	if (process.env.DB_SETUP_SCHEMA === 'true') {
		console.log('📋 Setting up database schema...');
		try {
			const dbWorld = new DBWorld({ parameters: {}, log: console.log });
			await dbWorld.dbClient.connect();

			// Execute schema
			const schemaPath = path.resolve(__dirname, '../schema/login-schema.sql');
			await dbWorld.dbClient.executeScript(schemaPath);
			console.log('✓ Schema created successfully');

			// Execute seed data if enabled
			if (process.env.DB_SEED_DATA === 'true') {
				const seedPath = path.resolve(__dirname, '../schema/seed-data.sql');
				await dbWorld.dbClient.executeScript(seedPath);
				console.log('✓ Seed data loaded successfully');
			}

			await dbWorld.dbClient.disconnect();
		} catch (error) {
			console.error('✗ Failed to setup database:', error);
			throw error;
		}
	}

	console.log('✓ Database test suite initialized\n');
});

/**
 * Before Hook - Runs before each scenario
 * Establishes database connection and prepares the test environment
 */
Before({ timeout: 30000 }, async function (this: DBWorld) {
	// Connect to database
	try {
		await this.dbClient.connect();

		// Verify connection
		const isConnected = await this.dbClient.isConnected();
		if (!isConnected) {
			throw new Error('Database connection verification failed');
		}
	} catch (error) {
		console.error('Failed to connect to database:', error);
		throw error;
	}

	// Reset world state
	this.reset();
});

/**
 * Before Hook for @transaction tagged scenarios
 * Starts a transaction that will be rolled back after the scenario
 */
Before({ tags: '@transaction', timeout: 10000 }, async function (this: DBWorld) {
	await this.beginTransaction();
	console.log('🔄 Transaction started for scenario');
});

/**
 * Before Hook for @performance tagged scenarios
 * Sets up performance tracking
 */
Before({ tags: '@performance' }, async function (this: DBWorld) {
	console.log('⏱️  Performance tracking enabled for scenario');
	this.startTime = Date.now();
});

/**
 * After Hook - Runs after each scenario
 * Cleans up test data and closes database connection
 */
After({ timeout: 30000 }, async function (this: DBWorld, { result, pickle }) {
	const scenarioName = pickle.name;
	const status = result?.status || Status.UNKNOWN;

	// Log scenario result
	if (status === Status.PASSED) {
		console.log(`✓ Scenario passed: ${scenarioName}`);
	} else if (status === Status.FAILED) {
		console.log(`✗ Scenario failed: ${scenarioName}`);
		if (this.lastError) {
			console.log(`  Error: ${this.lastError.message}`);
		}
		if (this.lastQuery) {
			console.log(`  Last query: ${this.lastQuery.substring(0, 200)}`);
		}
	}

	// Rollback transaction if active
	if (this.transactionActive) {
		try {
			await this.rollbackTransaction();
			console.log('🔄 Transaction rolled back');
		} catch (error) {
			console.warn('Failed to rollback transaction:', error);
		}
	}

	// Clean up test data unless using transactions
	if (!this.transactionActive && process.env.DB_CLEANUP_DATA !== 'false') {
		try {
			await this.cleanupTestData();
		} catch (error) {
			console.warn('Failed to cleanup test data:', error);
		}
	}

	// Disconnect from database
	try {
		await this.dbClient.disconnect();
	} catch (error) {
		console.warn('Failed to disconnect from database:', error);
	}
});

/**
 * After Hook for @performance tagged scenarios
 * Logs performance metrics
 */
After({ tags: '@performance' }, async function (this: DBWorld, { pickle }) {
	const totalTime = Date.now() - this.startTime;
	console.log(`⏱️  Total scenario time: ${totalTime}ms`);
	if (this.executionTime > 0) {
		console.log(`⏱️  Last query execution time: ${this.executionTime}ms`);
	}
});

/**
 * After All Hook - Runs once after all scenarios
 * Final cleanup and summary
 */
AfterAll({ timeout: 30000 }, async function () {
	console.log('\n========================================');
	console.log('🏁 Database Test Suite Completed');
	console.log('========================================\n');

	// Optional: Clean up entire test database
	if (process.env.DB_TEARDOWN === 'true') {
		console.log('🧹 Tearing down test database...');
		try {
			const dbWorld = new DBWorld({ parameters: {}, log: console.log });
			await dbWorld.dbClient.connect();

			// Drop all tables
			await dbWorld.dbClient.execute('DROP TABLE IF EXISTS login_attempts CASCADE');
			await dbWorld.dbClient.execute('DROP TABLE IF EXISTS user_roles CASCADE');
			await dbWorld.dbClient.execute('DROP TABLE IF EXISTS users CASCADE');

			await dbWorld.dbClient.disconnect();
			console.log('✓ Database teardown completed');
		} catch (error) {
			console.error('✗ Failed to teardown database:', error);
		}
	}
});


