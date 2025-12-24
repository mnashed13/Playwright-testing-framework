import { Pool, PoolClient, PoolConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
	IDBClient,
	DBConfig,
	QueryResult,
	ITransaction,
	DBError,
	DBErrorType,
} from './db-client-interface';

/**
 * PostgreSQL Transaction Implementation
 */
class PostgresTransaction implements ITransaction {
	constructor(private client: PoolClient) {}

	async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
		try {
			const result = await this.client.query(sql, params);
			return {
				rows: result.rows,
				rowCount: result.rowCount || 0,
				fields: result.fields,
			};
		} catch (error) {
			throw new DBError(
				DBErrorType.QUERY_ERROR,
				`Transaction query failed: ${(error as Error).message}`,
				error as Error,
				sql
			);
		}
	}

	async commit(): Promise<void> {
		try {
			await this.client.query('COMMIT');
			this.client.release();
		} catch (error) {
			throw new DBError(
				DBErrorType.TRANSACTION_ERROR,
				`Failed to commit transaction: ${(error as Error).message}`,
				error as Error
			);
		}
	}

	async rollback(): Promise<void> {
		try {
			await this.client.query('ROLLBACK');
			this.client.release();
		} catch (error) {
			throw new DBError(
				DBErrorType.TRANSACTION_ERROR,
				`Failed to rollback transaction: ${(error as Error).message}`,
				error as Error
			);
		}
	}
}

/**
 * PostgreSQL Client Implementation
 * Implements the IDBClient interface for PostgreSQL databases
 */
export class PostgresClient implements IDBClient {
	private pool: Pool | null = null;
	private config: DBConfig;

	constructor(config?: DBConfig) {
		// Read from environment variables if config not provided
		this.config = config || this.loadConfigFromEnv();
	}

	/**
	 * Load database configuration from environment variables
	 */
	private loadConfigFromEnv(): DBConfig {
		return {
			host: process.env.DB_HOST || 'localhost',
			port: parseInt(process.env.DB_PORT || '5432'),
			database: process.env.DB_NAME || process.env.DB_DATABASE || 'testdb',
			user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
			password: process.env.DB_PASSWORD || '',
			ssl: process.env.DB_SSL === 'true',
			connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
			maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
		};
	}

	/**
	 * Convert DBConfig to pg PoolConfig
	 */
	private getPoolConfig(): PoolConfig {
		return {
			host: this.config.host,
			port: this.config.port,
			database: this.config.database,
			user: this.config.user,
			password: this.config.password,
			ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
			connectionTimeoutMillis: this.config.connectionTimeout,
			max: this.config.maxPoolSize,
			idleTimeoutMillis: 30000,
			allowExitOnIdle: false,
		};
	}

	async connect(): Promise<void> {
		try {
			this.pool = new Pool(this.getPoolConfig());

			// Test the connection
			const client = await this.pool.connect();
			await client.query('SELECT 1');
			client.release();

			console.log(
				`✓ Connected to PostgreSQL database: ${this.config.database} at ${this.config.host}:${this.config.port}`
			);
		} catch (error) {
			throw new DBError(
				DBErrorType.CONNECTION_ERROR,
				`Failed to connect to PostgreSQL: ${(error as Error).message}`,
				error as Error
			);
		}
	}

	async disconnect(): Promise<void> {
		if (this.pool) {
			try {
				await this.pool.end();
				this.pool = null;
				console.log('✓ Disconnected from PostgreSQL database');
			} catch (error) {
				throw new DBError(
					DBErrorType.CONNECTION_ERROR,
					`Failed to disconnect from PostgreSQL: ${(error as Error).message}`,
					error as Error
				);
			}
		}
	}

	async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
		if (!this.pool) {
			throw new DBError(
				DBErrorType.CONNECTION_ERROR,
				'Database not connected. Call connect() first.'
			);
		}

		try {
			const startTime = Date.now();
			const result = await this.pool.query(sql, params);
			const duration = Date.now() - startTime;

			// Log query for debugging (can be controlled by env variable)
			if (process.env.DB_LOG_QUERIES === 'true') {
				console.log(`Query executed in ${duration}ms: ${sql.substring(0, 100)}...`);
			}

			return {
				rows: result.rows,
				rowCount: result.rowCount || 0,
				fields: result.fields,
			};
		} catch (error: any) {
			const errorType = this.categorizeError(error);
			throw new DBError(
				errorType,
				`Query execution failed: ${error.message}`,
				error,
				sql
			);
		}
	}

	async execute(sql: string, params?: any[]): Promise<QueryResult> {
		// In PostgreSQL, execute is the same as query for non-SELECT statements
		return this.query(sql, params);
	}

	async beginTransaction(): Promise<ITransaction> {
		if (!this.pool) {
			throw new DBError(
				DBErrorType.CONNECTION_ERROR,
				'Database not connected. Call connect() first.'
			);
		}

		try {
			const client = await this.pool.connect();
			await client.query('BEGIN');
			return new PostgresTransaction(client);
		} catch (error) {
			throw new DBError(
				DBErrorType.TRANSACTION_ERROR,
				`Failed to begin transaction: ${(error as Error).message}`,
				error as Error
			);
		}
	}

	async isConnected(): Promise<boolean> {
		if (!this.pool) {
			return false;
		}

		try {
			const client = await this.pool.connect();
			await client.query('SELECT 1');
			client.release();
			return true;
		} catch (error) {
			return false;
		}
	}

	getType(): string {
		return 'postgres';
	}

	async executeScript(scriptPath: string): Promise<void> {
		if (!this.pool) {
			throw new DBError(
				DBErrorType.CONNECTION_ERROR,
				'Database not connected. Call connect() first.'
			);
		}

		try {
			const absolutePath = path.isAbsolute(scriptPath)
				? scriptPath
				: path.resolve(process.cwd(), scriptPath);

			if (!fs.existsSync(absolutePath)) {
				throw new Error(`SQL script not found: ${absolutePath}`);
			}

			const sql = fs.readFileSync(absolutePath, 'utf-8');

			// Split by semicolon and execute each statement
			const statements = sql
				.split(';')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);

			for (const statement of statements) {
				await this.pool.query(statement);
			}

			console.log(`✓ Executed SQL script: ${scriptPath}`);
		} catch (error) {
			throw new DBError(
				DBErrorType.QUERY_ERROR,
				`Failed to execute script: ${(error as Error).message}`,
				error as Error
			);
		}
	}

	getConfig(): Partial<DBConfig> {
		// Return config without sensitive information
		return {
			host: this.config.host,
			port: this.config.port,
			database: this.config.database,
			user: this.config.user,
			ssl: this.config.ssl,
			connectionTimeout: this.config.connectionTimeout,
			maxPoolSize: this.config.maxPoolSize,
		};
	}

	/**
	 * Categorize PostgreSQL errors into DBErrorType
	 */
	private categorizeError(error: any): DBErrorType {
		const code = error.code;

		// PostgreSQL error codes
		if (code === '23505' || code === '23503' || code === '23502') {
			return DBErrorType.CONSTRAINT_VIOLATION;
		}

		if (code === '57014' || code === '57P01') {
			return DBErrorType.TIMEOUT_ERROR;
		}

		if (code === '08000' || code === '08003' || code === '08006') {
			return DBErrorType.CONNECTION_ERROR;
		}

		return DBErrorType.QUERY_ERROR;
	}
}



