# Database Testing Framework

A comprehensive, database-agnostic testing framework built with Cucumber BDD, TypeScript, and PostgreSQL. This framework enables thorough testing of database operations including CRUD, validation, complex queries, schema validation, and performance testing.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Utilities](#utilities)
- [Extending the Framework](#extending-the-framework)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This database testing framework provides a structured approach to testing database operations using Behavior-Driven Development (BDD) principles. It supports multiple test types and is designed to be database-agnostic, currently supporting PostgreSQL with easy extensibility for other databases.

## Features

### ✅ Comprehensive Test Coverage
- **Connection Testing**: Verify database connectivity and configuration
- **Schema Validation**: Validate tables, columns, indexes, and constraints
- **CRUD Operations**: Test Create, Read, Update, and Delete operations
- **Data Validation**: Ensure constraints and business rules are enforced
- **Complex Queries**: Test joins, aggregations, and advanced SQL
- **Performance Testing**: Measure query execution time and optimize performance

### 🔧 Technical Features
- **Database Agnostic**: Interface-based design supports multiple databases
- **Type Safety**: Full TypeScript implementation
- **BDD Approach**: Gherkin scenarios for readable, maintainable tests
- **Transaction Support**: Automatic rollback for isolated tests
- **Connection Pooling**: Efficient connection management
- **Test Data Generation**: Built-in utilities for generating test data
- **Query Builder**: Fluent API for building SQL queries

## Architecture

```
db-tests/
├── features/              # Gherkin feature files
│   ├── db-connection.feature
│   ├── db-schema-validation.feature
│   ├── users-crud.feature
│   ├── users-validation.feature
│   ├── users-queries.feature
│   └── db-performance.feature
├── steps/                 # Step definitions
│   ├── db-connection.steps.ts
│   ├── db-schema.steps.ts
│   ├── users-crud.steps.ts
│   ├── users-validation.steps.ts
│   ├── users-queries.steps.ts
│   └── db-performance.steps.ts
├── support/              # Framework support files
│   ├── db-client-interface.ts    # Core DB interface
│   ├── postgres-client.ts        # PostgreSQL implementation
│   ├── db-factory.ts             # Database client factory
│   ├── db-world.ts               # Cucumber World extension
│   ├── hooks.ts                  # Before/After hooks
│   ├── query-builder.ts          # SQL query builder
│   ├── test-data-generator.ts   # Test data utilities
│   └── setup-db.ts               # Database setup script
└── schema/               # Database schema files
    ├── login-schema.sql          # Schema definition
    └── seed-data.sql             # Sample test data
```

## Prerequisites

- Node.js (v18 or higher)
- TypeScript (v5.3 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install Dependencies**

```bash
npm install
```

This will install all required packages including:
- `pg`: PostgreSQL client
- `@cucumber/cucumber`: BDD testing framework
- `chai`: Assertion library
- `dotenv`: Environment variable management

2. **Create Environment File**

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

## Configuration

### Environment Variables

Configure your database connection in the `.env` file:

```env
# Database Type
DB_TYPE=postgres

# Connection Details
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testdb
DB_USER=postgres
DB_PASSWORD=yourpassword

# Optional Settings
DB_SSL=false
DB_CONNECTION_TIMEOUT=30000
DB_MAX_POOL_SIZE=10

# Test Configuration
DB_SETUP_SCHEMA=false
DB_SEED_DATA=false
DB_CLEANUP_DATA=true
DB_LOG_QUERIES=false
```

### Environment Variable Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_TYPE` | Database type (postgres, mysql, etc.) | `postgres` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `testdb` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | *(required)* |
| `DB_SSL` | Enable SSL connection | `false` |
| `DB_CONNECTION_TIMEOUT` | Connection timeout (ms) | `30000` |
| `DB_MAX_POOL_SIZE` | Maximum connections in pool | `10` |
| `DB_SETUP_SCHEMA` | Auto-create schema before tests | `false` |
| `DB_SEED_DATA` | Auto-load seed data | `false` |
| `DB_CLEANUP_DATA` | Clean up test data after each test | `true` |
| `DB_TEARDOWN` | Drop all tables after tests | `false` |
| `DB_LOG_QUERIES` | Log all SQL queries | `false` |

## Database Schema

### Setup Database

To create the database schema and load seed data:

```bash
npm run db:setup
```

This will:
1. Connect to your database
2. Create all required tables (users, user_roles, login_attempts)
3. Add indexes and constraints
4. Load sample test data (if `DB_SEED_DATA=true`)

### Schema Overview

#### Users Table
- `id`: Primary key
- `username`: Unique username (min 3 characters)
- `email`: Unique email with format validation
- `password_hash`: Hashed password (min 8 characters)
- `first_name`, `last_name`: Optional names
- `is_active`: Account status (default: true)
- `created_at`, `updated_at`: Timestamps

#### User Roles Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `role_name`: Role (admin, user, moderator, guest)
- `granted_at`: Timestamp

#### Login Attempts Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `attempted_at`: Timestamp
- `success`: Boolean
- `ip_address`: IP address
- `user_agent`: Browser/client info
- `failure_reason`: Reason for failed attempts

## Running Tests

### Run All Database Tests

```bash
npm run test:db
```

### Run Specific Test Suites

```bash
# Smoke tests (quick connectivity checks)
npm run test:db:smoke

# CRUD operations
npm run test:db:crud

# Data validation
npm run test:db:validation

# Complex queries
npm run test:db:queries

# Performance tests
npm run test:db:performance

# Schema validation
npm run test:db:schema
```

### Test Reports

After running tests, reports are generated in:
- **HTML Report**: `reports/db-cucumber-report.html`
- **JSON Report**: `reports/db-cucumber-report.json`

## Writing Tests

### Feature File Example

Create a new feature file in `db-tests/features/`:

```gherkin
@mytag
Feature: My Database Feature
  As a QA engineer
  I want to test something
  So that I can ensure quality

  Background:
    Given I am connected to the database

  @transaction
  Scenario: Test something
    When I perform an action
    Then I should see the expected result
```

### Step Definition Example

Create corresponding step definitions in `db-tests/steps/`:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { DBWorld } from '../support/db-world';

When('I perform an action', async function (this: DBWorld) {
  const query = 'SELECT * FROM users WHERE id = $1';
  await this.executeQuery(query, [1]);
});

Then('I should see the expected result', function (this: DBWorld) {
  expect(this.queryResult.length).to.be.greaterThan(0);
});
```

### Using Tags

- `@smoke`: Quick connectivity and sanity checks
- `@regression`: Full regression test suite
- `@transaction`: Runs in a transaction (auto-rollback)
- `@performance`: Performance-related tests
- `@negative`: Tests expected failures
- `@crud`, `@validation`, `@queries`, `@schema`: Test categories

## Utilities

### Query Builder

Build SQL queries programmatically:

```typescript
import { QueryBuilder, selectFrom } from '../support/query-builder';

// Fluent API
const { sql, params } = selectFrom('users')
  .select('id', 'username', 'email')
  .where('is_active', '=', true)
  .where('created_at', '>', new Date('2024-01-01'))
  .orderBy('created_at', 'DESC')
  .limit(10)
  .buildSelect();

// Execute query
await this.executeQuery(sql, params);
```

### Test Data Generator

Generate random test data:

```typescript
import TestDataGenerator from '../support/test-data-generator';

// Generate a single user
const user = TestDataGenerator.generateUser();

// Generate multiple users
const users = TestDataGenerator.generateUsers(10);

// Generate with overrides
const adminUser = TestDataGenerator.generateUser({
  username: 'admin',
  is_active: true
});

// Generate other data
const email = TestDataGenerator.generateEmail();
const ipAddress = TestDataGenerator.generateIPAddress();
const loginAttempt = TestDataGenerator.generateLoginAttempt(userId, true);
```

## Extending the Framework

### Adding Support for a New Database

1. **Create a new client implementation**

Create `db-tests/support/mysql-client.ts`:

```typescript
import { IDBClient, DBConfig, QueryResult } from './db-client-interface';

export class MySQLClient implements IDBClient {
  // Implement all interface methods
  async connect(): Promise<void> { /* ... */ }
  async disconnect(): Promise<void> { /* ... */ }
  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> { /* ... */ }
  // ... implement other methods
}
```

2. **Update the factory**

Edit `db-tests/support/db-factory.ts`:

```typescript
case 'mysql':
  return new MySQLClient(config);
```

3. **No changes needed** to feature files or step definitions!

### Adding New Test Scenarios

1. Create a new feature file in `db-tests/features/`
2. Write Gherkin scenarios
3. Implement step definitions in `db-tests/steps/`
4. Use existing DBWorld methods or add new ones

## Best Practices

### 1. Use Transactions for Data Isolation

Tag scenarios with `@transaction` to ensure automatic rollback:

```gherkin
@transaction
Scenario: Insert a new user
  When I insert a new user
  Then the user should exist
  # Automatic rollback - no cleanup needed
```

### 2. Clean Up Test Data

For scenarios without transactions, track created IDs:

```typescript
await this.executeCommand(insertQuery, params);
// ID is automatically tracked in this.createdUserIds
// Cleanup happens in After hook
```

### 3. Use Parameterized Queries

Always use parameterized queries to prevent SQL injection:

```typescript
// Good
await this.executeQuery('SELECT * FROM users WHERE id = $1', [userId]);

// Bad - Never do this!
await this.executeQuery(`SELECT * FROM users WHERE id = ${userId}`);
```

### 4. Test Both Success and Failure Cases

Include `@negative` scenarios to test error handling:

```gherkin
@negative
Scenario: Reject duplicate email
  Given a user exists with email "test@example.com"
  When I attempt to insert another user with the same email
  Then the insert should fail with a constraint violation error
```

### 5. Performance Testing

Set realistic thresholds for performance tests:

```gherkin
Scenario: Query performance
  When I query for a user by email
  Then the query should complete in less than 50 milliseconds
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
- Verify database is running: `pg_ctl status`
- Check credentials in `.env`
- Verify network access: `psql -h localhost -U postgres -d testdb`
- Check firewall settings

### Schema Setup Fails

**Problem**: Schema creation fails

**Solutions**:
- Ensure database exists: `createdb testdb`
- Check user permissions: `GRANT ALL PRIVILEGES ON DATABASE testdb TO postgres;`
- Review error messages in console
- Try manual execution: `psql -U postgres -d testdb -f db-tests/schema/login-schema.sql`

### Tests Failing

**Problem**: Tests fail unexpectedly

**Solutions**:
- Check if schema is set up: `npm run db:setup`
- Verify seed data is loaded
- Enable query logging: `DB_LOG_QUERIES=true`
- Check test isolation (use `@transaction` tags)
- Review recent database changes

### Performance Issues

**Problem**: Tests run slowly

**Solutions**:
- Increase connection pool size: `DB_MAX_POOL_SIZE=20`
- Use `@transaction` to avoid cleanup overhead
- Set `DB_CLEANUP_DATA=false` (manual cleanup required)
- Add indexes to frequently queried columns
- Analyze slow queries with `EXPLAIN ANALYZE`

### Port Conflicts

**Problem**: Port 5432 already in use

**Solutions**:
- Change port in `.env`: `DB_PORT=5433`
- Stop other PostgreSQL instances
- Use Docker with mapped ports

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

When adding new features or tests:
1. Follow existing code structure and patterns
2. Add appropriate Gherkin tags
3. Include both positive and negative test cases
4. Update this README if adding new functionality
5. Ensure all tests pass before committing

## License

MIT License - See LICENSE file for details

---

**Need Help?** Check the [Troubleshooting](#troubleshooting) section or review existing feature files for examples.

