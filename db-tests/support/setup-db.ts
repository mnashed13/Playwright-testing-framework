/**
 * Database Setup Script
 * Run this script to initialize the database schema and seed data
 * Usage: npm run db:setup
 */

import { DBFactory } from './db-factory';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
	console.log('\n========================================');
	console.log('🚀 Database Setup Script');
	console.log('========================================\n');

	const dbClient = DBFactory.createFromEnv();

	try {
		// Connect to database
		console.log('📡 Connecting to database...');
		await dbClient.connect();
		console.log('✓ Connected successfully\n');

		// Execute schema
		console.log('📋 Creating database schema...');
		const schemaPath = path.resolve(__dirname, '../schema/login-schema.sql');
		await dbClient.executeScript(schemaPath);
		console.log('✓ Schema created successfully\n');

		// Execute seed data if enabled
		if (process.env.DB_SEED_DATA === 'true') {
			console.log('🌱 Seeding test data...');
			const seedPath = path.resolve(__dirname, '../schema/seed-data.sql');
			await dbClient.executeScript(seedPath);
			console.log('✓ Seed data loaded successfully\n');
		}

		// Verify setup
		console.log('🔍 Verifying setup...');
		const result = await dbClient.query('SELECT COUNT(*) as count FROM users');
		const userCount = result.rows[0].count;
		console.log(`✓ Found ${userCount} users in database\n`);

		console.log('========================================');
		console.log('✅ Database setup completed successfully!');
		console.log('========================================\n');
	} catch (error) {
		console.error('\n❌ Database setup failed:');
		console.error(error);
		process.exit(1);
	} finally {
		await dbClient.disconnect();
	}
}

// Run setup
setupDatabase();

