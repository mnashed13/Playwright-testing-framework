/**
 * Query Builder Utility
 * Provides helper functions for building common SQL queries
 * Makes database tests more maintainable and readable
 */

export interface WhereCondition {
	column: string;
	operator: string;
	value: any;
}

export interface OrderBy {
	column: string;
	direction?: 'ASC' | 'DESC';
}

/**
 * Query Builder Class
 * Fluent API for building SQL queries
 */
export class QueryBuilder {
	private tableName: string = '';
	private selectColumns: string[] = ['*'];
	private whereConditions: WhereCondition[] = [];
	private orderByColumns: OrderBy[] = [];
	private limitValue: number | null = null;
	private offsetValue: number | null = null;
	private joinClauses: string[] = [];

	constructor(table?: string) {
		if (table) {
			this.tableName = table;
		}
	}

	/**
	 * Set the table name
	 */
	table(tableName: string): this {
		this.tableName = tableName;
		return this;
	}

	/**
	 * Set columns to select
	 */
	select(...columns: string[]): this {
		this.selectColumns = columns;
		return this;
	}

	/**
	 * Add a WHERE condition
	 */
	where(column: string, operator: string, value: any): this {
		this.whereConditions.push({ column, operator, value });
		return this;
	}

	/**
	 * Add a JOIN clause
	 */
	join(joinClause: string): this {
		this.joinClauses.push(joinClause);
		return this;
	}

	/**
	 * Add an ORDER BY clause
	 */
	orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
		this.orderByColumns.push({ column, direction });
		return this;
	}

	/**
	 * Set LIMIT
	 */
	limit(limit: number): this {
		this.limitValue = limit;
		return this;
	}

	/**
	 * Set OFFSET
	 */
	offset(offset: number): this {
		this.offsetValue = offset;
		return this;
	}

	/**
	 * Build the SELECT query
	 */
	buildSelect(): { sql: string; params: any[] } {
		const params: any[] = [];
		let paramIndex = 1;

		let sql = `SELECT ${this.selectColumns.join(', ')} FROM ${this.tableName}`;

		// Add JOINs
		if (this.joinClauses.length > 0) {
			sql += ' ' + this.joinClauses.join(' ');
		}

		// Add WHERE conditions
		if (this.whereConditions.length > 0) {
			const whereClause = this.whereConditions
				.map((condition) => {
					params.push(condition.value);
					return `${condition.column} ${condition.operator} $${paramIndex++}`;
				})
				.join(' AND ');
			sql += ` WHERE ${whereClause}`;
		}

		// Add ORDER BY
		if (this.orderByColumns.length > 0) {
			const orderByClause = this.orderByColumns
				.map((order) => `${order.column} ${order.direction}`)
				.join(', ');
			sql += ` ORDER BY ${orderByClause}`;
		}

		// Add LIMIT
		if (this.limitValue !== null) {
			sql += ` LIMIT ${this.limitValue}`;
		}

		// Add OFFSET
		if (this.offsetValue !== null) {
			sql += ` OFFSET ${this.offsetValue}`;
		}

		return { sql, params };
	}

	/**
	 * Build an INSERT query
	 */
	static buildInsert(
		tableName: string,
		data: Record<string, any>,
		returning: string[] = ['*']
	): { sql: string; params: any[] } {
		const columns = Object.keys(data);
		const values = Object.values(data);
		const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

		const sql = `
			INSERT INTO ${tableName} (${columns.join(', ')})
			VALUES (${placeholders})
			RETURNING ${returning.join(', ')}
		`;

		return { sql: sql.trim(), params: values };
	}

	/**
	 * Build an UPDATE query
	 */
	static buildUpdate(
		tableName: string,
		data: Record<string, any>,
		whereConditions: WhereCondition[]
	): { sql: string; params: any[] } {
		const params: any[] = [];
		let paramIndex = 1;

		// Build SET clause
		const setClause = Object.keys(data)
			.map((column) => {
				params.push(data[column]);
				return `${column} = $${paramIndex++}`;
			})
			.join(', ');

		let sql = `UPDATE ${tableName} SET ${setClause}`;

		// Add WHERE conditions
		if (whereConditions.length > 0) {
			const whereClause = whereConditions
				.map((condition) => {
					params.push(condition.value);
					return `${condition.column} ${condition.operator} $${paramIndex++}`;
				})
				.join(' AND ');
			sql += ` WHERE ${whereClause}`;
		}

		return { sql, params };
	}

	/**
	 * Build a DELETE query
	 */
	static buildDelete(
		tableName: string,
		whereConditions: WhereCondition[]
	): { sql: string; params: any[] } {
		const params: any[] = [];
		let paramIndex = 1;

		let sql = `DELETE FROM ${tableName}`;

		// Add WHERE conditions
		if (whereConditions.length > 0) {
			const whereClause = whereConditions
				.map((condition) => {
					params.push(condition.value);
					return `${condition.column} ${condition.operator} $${paramIndex++}`;
				})
				.join(' AND ');
			sql += ` WHERE ${whereClause}`;
		}

		return { sql, params };
	}

	/**
	 * Build a COUNT query
	 */
	static buildCount(
		tableName: string,
		whereConditions: WhereCondition[] = []
	): { sql: string; params: any[] } {
		const params: any[] = [];
		let paramIndex = 1;

		let sql = `SELECT COUNT(*) as count FROM ${tableName}`;

		// Add WHERE conditions
		if (whereConditions.length > 0) {
			const whereClause = whereConditions
				.map((condition) => {
					params.push(condition.value);
					return `${condition.column} ${condition.operator} $${paramIndex++}`;
				})
				.join(' AND ');
			sql += ` WHERE ${whereClause}`;
		}

		return { sql, params };
	}
}

/**
 * Helper function to build a simple SELECT query
 */
export function selectFrom(tableName: string): QueryBuilder {
	return new QueryBuilder(tableName);
}

/**
 * Helper function to build a simple INSERT query
 */
export function insertInto(
	tableName: string,
	data: Record<string, any>,
	returning: string[] = ['*']
) {
	return QueryBuilder.buildInsert(tableName, data, returning);
}

/**
 * Helper function to build a simple UPDATE query
 */
export function updateTable(
	tableName: string,
	data: Record<string, any>,
	where: WhereCondition[]
) {
	return QueryBuilder.buildUpdate(tableName, data, where);
}

/**
 * Helper function to build a simple DELETE query
 */
export function deleteFrom(tableName: string, where: WhereCondition[]) {
	return QueryBuilder.buildDelete(tableName, where);
}

/**
 * Helper function to build a simple COUNT query
 */
export function countFrom(tableName: string, where: WhereCondition[] = []) {
	return QueryBuilder.buildCount(tableName, where);
}
