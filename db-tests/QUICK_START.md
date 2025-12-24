# Database Testing Framework - Quick Start Guide

## 🎉 Setup Complete!

Your database testing framework has been successfully implemented. Here's how to get started.

## 📋 What Was Created

### 1. Core Framework Files
- ✅ Database client interface (`db-tests/support/db-client-interface.ts`)
- ✅ PostgreSQL client implementation (`db-tests/support/postgres-client.ts`)
- ✅ Database factory pattern (`db-tests/support/db-factory.ts`)
- ✅ Cucumber World extension (`db-tests/support/db-world.ts`)
- ✅ Hooks for test lifecycle (`db-tests/support/hooks.ts`)

### 2. Database Schema
- ✅ Login schema with 3 tables (`db-tests/schema/login-schema.sql`)
- ✅ Sample seed data (`db-tests/schema/seed-data.sql`)
- ✅ Database setup script (`db-tests/support/setup-db.ts`)

### 3. Feature Files (6 comprehensive test suites)
- ✅ Connection testing (`db-tests/features/db-connection.feature`)
- ✅ Schema validation (`db-tests/features/db-schema-validation.feature`)
- ✅ CRUD operations (`db-tests/features/users-crud.feature`)
- ✅ Data validation (`db-tests/features/users-validation.feature`)
- ✅ Complex queries (`db-tests/features/users-queries.feature`)
- ✅ Performance testing (`db-tests/features/db-performance.feature`)

### 4. Step Definitions
- ✅ Connection steps (`db-tests/steps/db-connection.steps.ts`)
- ✅ Schema validation steps (`db-tests/steps/db-schema.steps.ts`)
- ✅ CRUD steps (`db-tests/steps/users-crud.steps.ts`)
- ✅ Validation steps (`db-tests/steps/users-validation.steps.ts`)
- ✅ Query steps (`db-tests/steps/users-queries.steps.ts`)
- ✅ Performance steps (`db-tests/steps/db-performance.steps.ts`)

### 5. Utilities
- ✅ Query builder (`db-tests/support/query-builder.ts`)
- ✅ Test data generator (`db-tests/support/test-data-generator.ts`)

### 6. Configuration
- ✅ Updated `package.json` with new dependencies and scripts
- ✅ Updated `cucumber.cjs` with DB test profile
- ✅ Created comprehensive documentation (`db-tests/README.md`)

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

This will install the new dependency: `pg` (PostgreSQL client) and `@types/pg`.

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add these variables to your `.env` file:

```env
# Database Connection
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testdb
DB_USER=postgres
DB_PASSWORD=your_password_here

# Optional Settings
DB_SSL=false
DB_CONNECTION_TIMEOUT=30000
DB_MAX_POOL_SIZE=10

# Test Configuration
DB_SETUP_SCHEMA=true
DB_SEED_DATA=true
DB_CLEANUP_DATA=true
DB_LOG_QUERIES=false
```

**Important**: Replace `your_password_here` with your actual PostgreSQL password.

### Step 3: Setup Database

Run the setup script to create tables and load seed data:

```bash
npm run db:setup
```

This will:
- Create the `users`, `user_roles`, and `login_attempts` tables
- Add indexes and constraints
- Load sample test data

## 🧪 Running Tests

### Run All Database Tests

```bash
npm run test:db
```

### Run Specific Test Suites

```bash
# Quick smoke tests
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

## 📊 View Test Reports

After running tests, open the HTML report:

```bash
open reports/db-cucumber-report.html
```

## 🏗️ Framework Architecture

```
Database Agnostic Design:
┌─────────────────────┐
│ Feature Files (.feature) │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ Step Definitions (.ts) │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   DB World (Custom)  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  IDBClient Interface │
└──────────┬──────────┘
           │
      ┌────┴────┐
      ▼         ▼
┌──────────┐ ┌──────────┐
│ Postgres │ │  MySQL   │ (Future)
│  Client  │ │  Client  │
└─────┬────┘ └────┬─────┘
      │           │
      ▼           ▼
  PostgreSQL    MySQL DB
```

## 🔧 Key Features

### 1. Database Agnostic
The framework uses an interface-based design, making it easy to support multiple databases. To add MySQL support:
1. Create `mysql-client.ts` implementing `IDBClient`
2. Update `db-factory.ts` to include MySQL
3. No changes needed to feature files or step definitions!

### 2. Transaction Support
Use the `@transaction` tag for automatic rollback:

```gherkin
@transaction
Scenario: Insert a new user
  When I insert a user with username "testuser"
  Then the user should exist
  # Automatically rolled back after scenario
```

### 3. Test Data Generation
Generate random test data easily:

```typescript
import TestDataGenerator from '../support/test-data-generator';

const user = TestDataGenerator.generateUser();
const email = TestDataGenerator.generateEmail();
```

### 4. Query Builder
Build SQL queries programmatically:

```typescript
import { selectFrom } from '../support/query-builder';

const { sql, params } = selectFrom('users')
  .where('is_active', '=', true)
  .orderBy('created_at', 'DESC')
  .limit(10)
  .buildSelect();
```

## 📚 Documentation

For detailed documentation, see:
- **Main README**: `db-tests/README.md` - Comprehensive framework documentation
- **Schema Files**: `db-tests/schema/` - Database schema and seed data
- **Examples**: Review existing feature files for test patterns

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with database credentials
- [ ] PostgreSQL is running and accessible
- [ ] Database setup completed (`npm run db:setup`)
- [ ] Smoke tests pass (`npm run test:db:smoke`)

## 🎯 Next Steps

1. **Customize the Schema**: Edit `db-tests/schema/login-schema.sql` for your database structure
2. **Add Your Tests**: Create new feature files in `db-tests/features/`
3. **Extend for Other Databases**: Add MySQL, MSSQL, or MongoDB support
4. **Integrate with CI/CD**: Add database tests to your pipeline

## 💡 Tips

- Enable query logging for debugging: `DB_LOG_QUERIES=true`
- Use transactions for faster tests: Add `@transaction` tag
- Check the README for troubleshooting tips
- Review existing feature files for examples

## 🐛 Troubleshooting

**Can't connect to database?**
- Verify PostgreSQL is running: `pg_ctl status`
- Check credentials in `.env`
- Test connection: `psql -U postgres -d testdb`

**Schema setup fails?**
- Ensure database exists: `createdb testdb`
- Check user permissions
- Review error messages

**Tests failing?**
- Run `npm run db:setup` to reset schema
- Enable logging: `DB_LOG_QUERIES=true`
- Check if seed data is loaded

## 📞 Need Help?

- Review the main README: `db-tests/README.md`
- Check existing feature files for examples
- Look at step definitions for implementation patterns

---

**Happy Testing! 🚀**

Your database testing framework is ready to use. Start by running the smoke tests to verify everything is working correctly.

