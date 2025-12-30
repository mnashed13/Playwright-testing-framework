import { IDBClient, DBConfig } from './db-client-interface';
import { PostgresClient } from './postgres-client';

/**
 * Database Factory
 * Creates the appropriate database client based on the DB_TYPE environment variable
 * This enables database-agnostic testing - simply change the DB_TYPE to test against different databases
 */
export class DBFactory {
	/**
	 * Create a database client instance based on configuration
	 * @param dbType - Type of database (postgres, mysql, mssql, mongodb, etc.)
	 * @param config - Optional database configuration (if not provided, reads from environment variables)
	 * @returns Appropriate database client implementation
	 */
	static createClient(dbType?: string, config?: DBConfig): IDBClient {
		const type = (dbType || process.env.DB_TYPE || 'postgres').toLowerCase();

		switch (type) {
			case 'postgres':
			case 'postgresql':
				return new PostgresClient(config);

			// Future database support can be added here:
			// case 'mysql':
			//     return new MySQLClient(config);
			// case 'mssql':
			//     return new MSSQLClient(config);
			// case 'mongodb':
			//     return new MongoDBClient(config);

			default:
				throw new Error(
					`Unsupported database type: ${type}. Supported types: postgres, postgresql`
				);
		}
	}

	/**
	 * Create a client using environment variables
	 * Reads DB_TYPE from environment and creates appropriate client
	 */
	static createFromEnv(): IDBClient {
		return this.createClient();
	}

	/**
	 * Get supported database types
	 * @returns Array of supported database type identifiers
	 */
	static getSupportedTypes(): string[] {
		return ['postgres', 'postgresql'];
		// Future: Add more types as they're implemented
		// return ['postgres', 'postgresql', 'mysql', 'mssql', 'mongodb'];
	}

	/**
	 * Check if a database type is supported
	 * @param dbType - Database type to check
	 * @returns true if the database type is supported
	 */
	static isSupported(dbType: string): boolean {
		return this.getSupportedTypes().includes(dbType.toLowerCase());
	}
}




