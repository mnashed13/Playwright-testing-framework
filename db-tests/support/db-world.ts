import { World, IWorldOptions } from '@cucumber/cucumber';
import { IDBClient } from './db-client-interface';
import { DBFactory } from './db-factory';

/**
 * Custom World for Database Testing
 * Extends Cucumber World with database-specific properties and methods
 */
export interface DBWorldInterface extends World {
	// Database client instance
	dbClient: IDBClient;

	// Query results storage
	queryResult: any[];
	queryRowCount: number;

	// Performance tracking
	executionTime: number;
	startTime: number;

	// Last inserted record tracking
	lastInsertId: any;
	lastInsertedRecord: any;

	// Transaction management
	transactionActive: boolean;
	currentTransaction: any;

	// Error tracking
	lastError: Error | null;
	errorOccurred: boolean;

	// Test data tracking
	testDataIds: number[];
	createdUserIds: number[];

	// Query tracking for debugging
	lastQuery: string;
	queryHistory: string[];
}

/**
 * Custom Database World Implementation
 */
export class DBWorld extends World implements DBWorldInterface {
	dbClient: IDBClient;
	queryResult: any[] = [];
	queryRowCount: number = 0;
	executionTime: number = 0;
	startTime: number = 0;
	lastInsertId: any = null;
	lastInsertedRecord: any = null;
	transactionActive: boolean = false;
	currentTransaction: any = null;
	lastError: Error | null = null;
	errorOccurred: boolean = false;
	testDataIds: number[] = [];
	createdUserIds: number[] = [];
	lastQuery: string = '';
	queryHistory: string[] = [];

	constructor(options: IWorldOptions) {
		super(options);

		// Initialize database client using factory
		this.dbClient = DBFactory.createFromEnv();

		// Initialize arrays
		this.queryResult = [];
		this.testDataIds = [];
		this.createdUserIds = [];
		this.queryHistory = [];
	}

	/**
	 * Execute a query and track execution time
	 */
	async executeQuery<T = any>(sql: string, params?: any[]): Promise<void> {
		this.lastQuery = sql;
		this.queryHistory.push(sql);
		this.startTime = Date.now();

		try {
			const result = await this.dbClient.query<T>(sql, params);
			this.queryResult = result.rows;
			this.queryRowCount = result.rowCount;
			this.executionTime = Date.now() - this.startTime;
			this.errorOccurred = false;
			this.lastError = null;
		} catch (error) {
			this.errorOccurred = true;
			this.lastError = error as Error;
			this.executionTime = Date.now() - this.startTime;
			throw error;
		}
	}

	/**
	 * Execute a command (INSERT, UPDATE, DELETE) and track the result
	 */
	async executeCommand(sql: string, params?: any[]): Promise<void> {
		this.lastQuery = sql;
		this.queryHistory.push(sql);
		this.startTime = Date.now();

		try {
			const result = await this.dbClient.execute(sql, params);
			this.queryResult = result.rows;
			this.queryRowCount = result.rowCount;
			this.executionTime = Date.now() - this.startTime;

			// Try to extract last insert ID from result (for INSERT queries)
			if (result.rows.length > 0 && result.rows[0].id) {
				this.lastInsertId = result.rows[0].id;
				this.lastInsertedRecord = result.rows[0];

				// Track user IDs for cleanup
				if (sql.toLowerCase().includes('insert into users')) {
					this.createdUserIds.push(result.rows[0].id);
				}
			}

			this.errorOccurred = false;
			this.lastError = null;
		} catch (error) {
			this.errorOccurred = true;
			this.lastError = error as Error;
			this.executionTime = Date.now() - this.startTime;
			throw error;
		}
	}

	/**
	 * Execute a query and expect it to fail
	 */
	async executeQueryExpectingError(sql: string, params?: any[]): Promise<void> {
		this.lastQuery = sql;
		this.queryHistory.push(sql);
		this.startTime = Date.now();

		try {
			await this.dbClient.query(sql, params);
			this.errorOccurred = false;
			this.executionTime = Date.now() - this.startTime;
			// If we get here, the query succeeded when we expected it to fail
			throw new Error('Expected query to fail, but it succeeded');
		} catch (error) {
			this.errorOccurred = true;
			this.lastError = error as Error;
			this.executionTime = Date.now() - this.startTime;
			// This is expected, so we don't rethrow
		}
	}

	/**
	 * Begin a transaction
	 */
	async beginTransaction(): Promise<void> {
		if (this.transactionActive) {
			throw new Error('Transaction already active');
		}
		this.currentTransaction = await this.dbClient.beginTransaction();
		this.transactionActive = true;
	}

	/**
	 * Commit the current transaction
	 */
	async commitTransaction(): Promise<void> {
		if (!this.transactionActive || !this.currentTransaction) {
			throw new Error('No active transaction to commit');
		}
		await this.currentTransaction.commit();
		this.transactionActive = false;
		this.currentTransaction = null;
	}

	/**
	 * Rollback the current transaction
	 */
	async rollbackTransaction(): Promise<void> {
		if (!this.transactionActive || !this.currentTransaction) {
			throw new Error('No active transaction to rollback');
		}
		await this.currentTransaction.rollback();
		this.transactionActive = false;
		this.currentTransaction = null;
	}

	/**
	 * Clean up test data created during the scenario
	 */
	async cleanupTestData(): Promise<void> {
		// Clean up in reverse order to handle foreign key constraints
		if (this.createdUserIds.length > 0) {
			const ids = this.createdUserIds.join(',');
			try {
				// Delete related records first (due to CASCADE, this might not be needed)
				await this.dbClient.execute(
					`DELETE FROM login_attempts WHERE user_id IN (${ids})`
				);
				await this.dbClient.execute(
					`DELETE FROM user_roles WHERE user_id IN (${ids})`
				);
				await this.dbClient.execute(`DELETE FROM users WHERE id IN (${ids})`);
			} catch (error) {
				console.warn('Failed to clean up test data:', error);
			}
		}

		// Reset tracking arrays
		this.testDataIds = [];
		this.createdUserIds = [];
	}

	/**
	 * Reset world state between scenarios
	 */
	reset(): void {
		this.queryResult = [];
		this.queryRowCount = 0;
		this.executionTime = 0;
		this.startTime = 0;
		this.lastInsertId = null;
		this.lastInsertedRecord = null;
		this.lastError = null;
		this.errorOccurred = false;
		this.lastQuery = '';
		this.queryHistory = [];
	}
}


