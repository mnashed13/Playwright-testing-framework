import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

When('I query the database schema for table {string}', async function (this: DBWorld, tableName: string) {
	const query = `
		SELECT 
			column_name, 
			data_type, 
			is_nullable,
			column_default
		FROM information_schema.columns
		WHERE table_schema = 'public' 
		AND table_name = $1
		ORDER BY ordinal_position
	`;
	await this.executeQuery(query, [tableName]);
});

When('I query for primary keys in the database', async function (this: DBWorld) {
	const query = `
		SELECT 
			tc.table_name,
			kcu.column_name
		FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu 
			ON tc.constraint_name = kcu.constraint_name
		WHERE tc.constraint_type = 'PRIMARY KEY'
		AND tc.table_schema = 'public'
	`;
	await this.executeQuery(query);
});

When('I query for foreign key constraints in the database', async function (this: DBWorld) {
	const query = `
		SELECT
			tc.table_name,
			kcu.column_name,
			ccu.table_name AS foreign_table_name,
			ccu.column_name AS foreign_column_name
		FROM information_schema.table_constraints AS tc
		JOIN information_schema.key_column_usage AS kcu
			ON tc.constraint_name = kcu.constraint_name
		JOIN information_schema.constraint_column_usage AS ccu
			ON ccu.constraint_name = tc.constraint_name
		WHERE tc.constraint_type = 'FOREIGN KEY'
		AND tc.table_schema = 'public'
	`;
	await this.executeQuery(query);
});

When('I query for unique constraints on table {string}', async function (this: DBWorld, tableName: string) {
	const query = `
		SELECT
			kcu.column_name,
			tc.constraint_name
		FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu 
			ON tc.constraint_name = kcu.constraint_name
		WHERE tc.constraint_type = 'UNIQUE'
		AND tc.table_schema = 'public'
		AND tc.table_name = $1
	`;
	await this.executeQuery(query, [tableName]);
});

When('I query for indexes in the database', async function (this: DBWorld) {
	const query = `
		SELECT
			schemaname,
			tablename,
			indexname,
			indexdef
		FROM pg_indexes
		WHERE schemaname = 'public'
		ORDER BY tablename, indexname
	`;
	await this.executeQuery(query);
});

Then('the table {string} should exist', function (this: DBWorld, tableName: string) {
	expect(this.queryResult.length).to.be.greaterThan(0, `Table ${tableName} should exist`);
});

Then('the table {string} should have the following columns:', function (this: DBWorld, tableName: string, dataTable: DataTable) {
	const expectedColumns = dataTable.hashes();
	
	for (const expectedCol of expectedColumns) {
		const actualCol = this.queryResult.find(
			(col) => col.column_name === expectedCol.column_name
		);
		
		expect(actualCol).to.not.be.undefined, 
			`Column ${expectedCol.column_name} should exist in table ${tableName}`;
		
		expect(actualCol.data_type).to.include(expectedCol.data_type.toLowerCase());
		expect(actualCol.is_nullable).to.equal(expectedCol.is_nullable);
	}
});

Then('the table {string} should have a primary key on column {string}', function (this: DBWorld, tableName: string, columnName: string) {
	const pk = this.queryResult.find(
		(row) => row.table_name === tableName && row.column_name === columnName
	);
	expect(pk).to.not.be.undefined, 
		`Primary key should exist on ${tableName}.${columnName}`;
});

Then('the table {string} should have a foreign key on {string} referencing {string}', function (
	this: DBWorld, 
	tableName: string, 
	columnName: string, 
	reference: string
) {
	const [refTable, refColumn] = reference.replace(/[()]/g, '').split('.');
	
	const fk = this.queryResult.find(
		(row) =>
			row.table_name === tableName &&
			row.column_name === columnName &&
			row.foreign_table_name === refTable &&
			row.foreign_column_name === refColumn
	);
	
	expect(fk).to.not.be.undefined,
		`Foreign key should exist: ${tableName}.${columnName} -> ${reference}`;
});

Then('the table {string} should have a unique constraint on column {string}', function (
	this: DBWorld,
	tableName: string,
	columnName: string
) {
	const uniqueConstraint = this.queryResult.find(
		(row) => row.column_name === columnName
	);
	
	expect(uniqueConstraint).to.not.be.undefined,
		`Unique constraint should exist on ${tableName}.${columnName}`;
});

Then('an index should exist on {string}', function (this: DBWorld, indexSpec: string) {
	// indexSpec format: "table_name(column_name)" or similar
	const match = indexSpec.match(/(\w+)\((\w+)\)/);
	
	if (match) {
		const [, tableName, columnName] = match;
		const index = this.queryResult.find(
			(row) =>
				row.tablename === tableName &&
				row.indexdef.toLowerCase().includes(columnName.toLowerCase())
		);
		
		expect(index).to.not.be.undefined,
			`Index should exist on ${tableName}.${columnName}`;
	} else {
		// Just check if the index definition contains the spec
		const index = this.queryResult.find((row) =>
			row.indexdef.toLowerCase().includes(indexSpec.toLowerCase())
		);
		expect(index).to.not.be.undefined, `Index should exist: ${indexSpec}`);
	}
});


