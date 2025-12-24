/**
 * Database Configuration Interface
 * Contains all necessary parameters for database connection
 */
export interface DBConfig {
	host: string;
	port: number;
	database: string;
	user: string;
	password: string;
	ssl?: boolean;
	connectionTimeout?: number;
	maxPoolSize?: number;
}

/**
 * Query Result Interface
 * Standardized result format across different database implementations
 */
export interface QueryResult<T = any> {
	rows: T[];
	rowCount: number;
	fields?: any[];
}

/**
 * Transaction Interface
 * Represents an active database transaction
 */
export interface ITransaction {
	query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
}

/**
 * Database Client Interface
 * Abstract interface that all database adapters must implement
 * This ensures database-agnostic testing capabilities
 */
export interface IDBClient {
	/**
	 * Establish connection to the database
	 */
	connect(): Promise<void>;

	/**
	 * Close the database connection
	 */
	disconnect(): Promise<void>;

	/**
	 * Execute a SELECT query and return results
	 * @param sql - SQL query string
	 * @param params - Query parameters (prevents SQL injection)
	 * @returns Query results with rows and metadata
	 */
	query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;

	/**
	 * Execute a non-SELECT query (INSERT, UPDATE, DELETE)
	 * @param sql - SQL command string
	 * @param params - Command parameters
	 * @returns Execution result with affected rows count
	 */
	execute(sql: string, params?: any[]): Promise<QueryResult>;

	/**
	 * Begin a new transaction
	 * @returns Transaction object for executing queries within the transaction
	 */
	beginTransaction(): Promise<ITransaction>;

	/**
	 * Check if the database connection is healthy
	 * @returns true if connection is active and responsive
	 */
	isConnected(): Promise<boolean>;

	/**
	 * Get the database type (postgres, mysql, mssql, etc.)
	 * @returns Database type identifier
	 */
	getType(): string;

	/**
	 * Execute a raw SQL script (useful for schema setup/teardown)
	 * @param scriptPath - Path to SQL script file
	 */
	executeScript(scriptPath: string): Promise<void>;

	/**
	 * Get connection configuration (without sensitive data)
	 */
	getConfig(): Partial<DBConfig>;
}

/**
 * Database Error Types
 * Standardized error types for better error handling
 */
export enum DBErrorType {
	CONNECTION_ERROR = 'CONNECTION_ERROR',
	QUERY_ERROR = 'QUERY_ERROR',
	CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
	TIMEOUT_ERROR = 'TIMEOUT_ERROR',
	TRANSACTION_ERROR = 'TRANSACTION_ERROR',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom Database Error
 * Provides structured error information
 */
export class DBError extends Error {
	constructor(
		public type: DBErrorType,
		public message: string,
		public originalError?: Error,
		public query?: string
	) {
		super(message);
		this.name = 'DBError';
	}
}



