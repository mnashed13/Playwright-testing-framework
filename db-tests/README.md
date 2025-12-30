# Database Testing Framework - Complete Guide

> A beginner-friendly, comprehensive guide to testing your database with automated tests

## What is This?

This is a **Database Testing Framework** that lets you write automated tests for your database in plain English (using Cucumber). Think of it like having a robot that can:
- Check if your database is set up correctly
- Test adding, reading, updating, and deleting data
- Make sure your data rules are working (like "emails must be unique")
- Test complex database queries
- Check how fast your database responds

**No database expertise required to get started!** This guide explains everything step-by-step.

---

## Table of Contents

- [What is This?](#what-is-this)
- [Why Do I Need This?](#why-do-i-need-this)
- [What You'll Learn](#what-youll-learn)
- [Prerequisites (What You Need First)](#prerequisites-what-you-need-first)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Understanding the Framework](#understanding-the-framework)
- [Complete Installation Guide](#complete-installation-guide)
- [Configuration Explained](#configuration-explained)
- [Understanding the Database Schema](#understanding-the-database-schema)
- [Running Tests - All the Ways](#running-tests---all-the-ways)
- [Writing Your First Test](#writing-your-first-test)
- [Understanding Test Results](#understanding-test-results)
- [Using the Built-in Utilities](#using-the-built-in-utilities)
- [Advanced Features](#advanced-features)
- [How to Extend This Framework](#how-to-extend-this-framework)
- [Best Practices for Database Testing](#best-practices-for-database-testing)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
- [Glossary of Terms](#glossary-of-terms)

---

## Why Do I Need This?

### Without This Framework:
- ❌ Manual database testing is slow and error-prone
- ❌ Hard to test all scenarios consistently
- ❌ No way to automatically verify database changes
- ❌ Difficult to catch database bugs early

### With This Framework:
- ✅ Automated tests run in seconds
- ✅ Tests are written in plain English (Gherkin)
- ✅ Catches database issues before they reach production
- ✅ Easy to add new tests
- ✅ Works with any database (currently supports PostgreSQL, easy to add others)

---

## What You'll Learn

By the end of this guide, you'll be able to:
1. Set up and run database tests
2. Write new tests in plain English
3. Test database CRUD operations (Create, Read, Update, Delete)
4. Validate data constraints and rules
5. Test complex database queries
6. Measure database performance
7. Extend the framework for your own needs

---

## Prerequisites (What You Need First)

### Required Software

1. **Node.js** (version 18 or higher)
   - What it is: JavaScript runtime that runs your tests
   - Check if installed: `node --version`
   - Download: https://nodejs.org/

2. **PostgreSQL** (version 12 or higher)
   - What it is: The database system we're testing
   - Check if installed: `psql --version`
   - Download: https://www.postgresql.org/download/

3. **A Code Editor** (recommended: VS Code)
   - Download: https://code.visualstudio.com/

### Required Knowledge

- ✅ Basic command line usage (cd, ls, mkdir)
- ✅ Basic understanding of what a database is
- ❌ No need to know SQL (we'll explain as we go)
- ❌ No need to know TypeScript (code is already written)

---

## Quick Start (5 Minutes)

Want to see it work right away? Follow these steps:

### Step 1: Install Dependencies
```bash
npm install
```
**What this does:** Installs all the required packages (like tools in a toolbox)

### Step 2: Create Your Environment File
```bash
# Copy the example file
cp .env.example .env
```

Then open `.env` and update these lines:
```env
DB_HOST=localhost          # Where is your database?
DB_PORT=5432              # What port? (5432 is PostgreSQL default)
DB_NAME=testdb            # What's your database name?
DB_USER=postgres          # Your database username
DB_PASSWORD=yourpassword  # Your database password (CHANGE THIS!)
```

### Step 3: Setup the Database
```bash
npm run db:setup
```
**What this does:** Creates all the tables and adds sample data

### Step 4: Run Your First Test
```bash
npm run test:db:smoke
```
**What this does:** Runs quick "smoke tests" to make sure everything works

### Step 5: View the Results
```bash
open reports/db-cucumber-report.html
```

🎉 **Congratulations!** You just ran your first automated database tests!

---

## Understanding the Framework

### What Makes Up This Framework?

Think of this framework like a house with different rooms:

```
🏠 Database Testing Framework
├── 📁 features/          - Test scenarios written in plain English
├── 📁 steps/            - Code that makes the tests work
├── 📁 support/          - Helper tools and database connections
├── 📁 schema/           - Database table definitions
└── 📄 README.md         - You are here!
```

### How It Works (Simple Explanation)

1. **You write a test in plain English** (called a "Feature File")
   ```gherkin
   When I add a user named "John"
   Then I should see "John" in the database
   ```

2. **The framework translates it to database commands**
   ```sql
   INSERT INTO users (name) VALUES ('John');
   SELECT * FROM users WHERE name = 'John';
   ```

3. **It checks if the result is what you expected**
   ```
   ✅ Test Passed: John was found in the database
   ```

### Architecture Diagram

```
Your Test (English) 
      ↓
Step Definitions (Translation)
      ↓
Database Client (Connection)
      ↓
PostgreSQL Database
      ↓
Results (Pass/Fail)
```

---

## Complete Installation Guide

### Part 1: Install Node.js Packages

Open your terminal and run:

```bash
npm install
```

**What gets installed:**
- `pg` - PostgreSQL database driver (lets us talk to the database)
- `@cucumber/cucumber` - BDD testing framework (runs our tests)
- `chai` - Assertion library (checks if tests pass/fail)
- `dotenv` - Environment variable manager (handles configuration)
- `@types/*` - TypeScript type definitions (helps with code)

**Expected output:**
```
added 250 packages in 15s
```

**Troubleshooting:**
- If you see "permission denied", try: `sudo npm install`
- If you see "package-lock.json conflict", delete it and try again
- If it takes forever, check your internet connection

### Part 2: Setup PostgreSQL Database

#### Option A: PostgreSQL is Already Installed

Check if it's running:
```bash
# On Mac/Linux
pg_ctl status

# On Windows
pg_ctl status -D "C:\Program Files\PostgreSQL\15\data"
```

If it's not running, start it:
```bash
# On Mac
brew services start postgresql

# On Linux
sudo service postgresql start

# On Windows
net start postgresql-x64-15
```

#### Option B: Install PostgreSQL

**On Mac (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the "postgres" user!

**On Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

#### Create Your Test Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create the test database
CREATE DATABASE testdb;

# Exit PostgreSQL
\q
```

**Common Issues:**
- "psql: command not found" - PostgreSQL is not installed
- "password authentication failed" - Wrong password
- "connection refused" - PostgreSQL is not running

### Part 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
touch .env
```

Open `.env` in your text editor and add:

```env
# ========================================
# DATABASE CONNECTION
# ========================================
# Database type (currently only postgres, but more coming!)
DB_TYPE=postgres

# Where is your database located?
DB_HOST=localhost          # Usually localhost for local testing
DB_PORT=5432              # PostgreSQL default port

# What database are you testing?
DB_NAME=testdb            # The database you created earlier

# What are your login credentials?
DB_USER=postgres          # Your PostgreSQL username
DB_PASSWORD=yourpassword  # CHANGE THIS to your actual password!

# ========================================
# DATABASE CONNECTION OPTIONS
# ========================================
# Use SSL? (false for local, true for production)
DB_SSL=false

# How long to wait before connection times out (in milliseconds)
DB_CONNECTION_TIMEOUT=30000

# Maximum number of database connections in the pool
DB_MAX_POOL_SIZE=10

# ========================================
# TEST BEHAVIOR SETTINGS
# ========================================
# Should we create tables automatically? (true/false)
DB_SETUP_SCHEMA=true

# Should we load sample data automatically? (true/false)
DB_SEED_DATA=true

# Should we clean up test data after each test? (true/false)
DB_CLEANUP_DATA=true

# Should we drop all tables after testing? (true/false)
# WARNING: Set to false unless you want to start fresh
DB_TEARDOWN=false

# Should we print all SQL queries to console? (true/false)
# Helpful for debugging, but makes tests slower
DB_LOG_QUERIES=false
```

**Important Security Note:** 
- ⚠️ NEVER commit the `.env` file to git with real passwords!
- ✅ The `.env` file is already in `.gitignore`

### Part 4: Setup the Database Schema

Run the setup script:

```bash
npm run db:setup
```

**What this command does:**
1. Connects to your database
2. Creates 3 tables: `users`, `user_roles`, `login_attempts`
3. Adds indexes for faster queries
4. Loads 10 sample users with test data

**Expected output:**
```
========================================
🚀 Database Setup Script
========================================

📡 Connecting to database...
✓ Connected successfully

📋 Creating database schema...
✓ Schema created successfully

🌱 Seeding test data...
✓ Seed data loaded successfully

🔍 Verifying setup...
✓ Found 10 users in database

========================================
✅ Database setup completed successfully!
========================================
```

**If something goes wrong:**
- Check your `.env` file credentials
- Make sure PostgreSQL is running
- Make sure the database `testdb` exists
- Check the error message for clues

---

## Configuration Explained

### Environment Variables - What Each One Does

| Variable | What It Does | Example | When to Change |
|----------|-------------|---------|----------------|
| `DB_TYPE` | Which database system you're using | `postgres` | When adding MySQL support |
| `DB_HOST` | Where the database is located | `localhost` or `db.example.com` | Testing remote databases |
| `DB_PORT` | Which port the database uses | `5432` | If using non-standard port |
| `DB_NAME` | The name of your test database | `testdb` | Using different database |
| `DB_USER` | Database username | `postgres` | Different user account |
| `DB_PASSWORD` | Database password | `secretpassword` | Your actual password |
| `DB_SSL` | Use encrypted connection? | `false` | Production databases |
| `DB_CONNECTION_TIMEOUT` | How long to wait (milliseconds) | `30000` (30 seconds) | Slow networks |
| `DB_MAX_POOL_SIZE` | Max simultaneous connections | `10` | Many concurrent tests |
| `DB_SETUP_SCHEMA` | Auto-create tables? | `true` | First run only |
| `DB_SEED_DATA` | Auto-load sample data? | `true` | Want clean slate |
| `DB_CLEANUP_DATA` | Delete test data after tests? | `true` | Debugging tests |
| `DB_TEARDOWN` | Drop all tables after tests? | `false` | Complete cleanup |
| `DB_LOG_QUERIES` | Show all SQL in console? | `false` | Debugging |

### Configuration Examples for Different Scenarios

#### Example 1: Local Development (Default)
```env
DB_HOST=localhost
DB_SETUP_SCHEMA=true
DB_SEED_DATA=true
DB_CLEANUP_DATA=true
DB_LOG_QUERIES=false
```
**Use case:** Day-to-day testing on your laptop

#### Example 2: CI/CD Pipeline
```env
DB_HOST=localhost
DB_SETUP_SCHEMA=true
DB_SEED_DATA=true
DB_CLEANUP_DATA=true
DB_TEARDOWN=true
DB_LOG_QUERIES=false
```
**Use case:** Automated testing in GitHub Actions, Jenkins, etc.

#### Example 3: Debugging Failed Tests
```env
DB_HOST=localhost
DB_SETUP_SCHEMA=false
DB_SEED_DATA=false
DB_CLEANUP_DATA=false
DB_LOG_QUERIES=true
```
**Use case:** You want to see exactly what's happening

#### Example 4: Testing Against Remote Database
```env
DB_HOST=test-db.mycompany.com
DB_SSL=true
DB_SETUP_SCHEMA=false
DB_SEED_DATA=false
DB_CLEANUP_DATA=true
```
**Use case:** Testing against a staging/QA database

---

## Understanding the Database Schema

### What Tables Are Created?

The framework creates a sample "login system" database with 3 tables:

#### Table 1: `users` (The Main Table)

**Purpose:** Stores user account information

| Column | Type | What It Stores | Example |
|--------|------|----------------|---------|
| `id` | Integer | Unique user ID | 1, 2, 3... |
| `username` | Text | Login username | "john_doe" |
| `email` | Text | Email address | "john@example.com" |
| `password_hash` | Text | Encrypted password | "$2b$10$..." |
| `first_name` | Text | First name | "John" |
| `last_name` | Text | Last name | "Doe" |
| `is_active` | Boolean | Account active? | true/false |
| `created_at` | Timestamp | When created | "2024-01-15 10:30:00" |
| `updated_at` | Timestamp | Last update | "2024-01-20 14:45:00" |

**Important Rules (Constraints):**
- ✅ Username must be unique (no duplicates)
- ✅ Email must be unique (no duplicates)
- ✅ Email must be valid format (has @ sign)
- ✅ Username must be at least 3 characters
- ✅ Password must be at least 8 characters

#### Table 2: `user_roles` (What Users Can Do)

**Purpose:** Assigns roles to users (like "admin" or "regular user")

| Column | Type | What It Stores | Example |
|--------|------|----------------|---------|
| `id` | Integer | Unique role ID | 1, 2, 3... |
| `user_id` | Integer | Which user | 1 (links to users table) |
| `role_name` | Text | Role type | "admin", "user", "moderator", "guest" |
| `granted_at` | Timestamp | When assigned | "2024-01-15 10:30:00" |

**Important Rules:**
- ✅ Must be a valid role: admin, user, moderator, or guest
- ✅ One user can't have the same role twice
- ✅ If user is deleted, their roles are deleted too

#### Table 3: `login_attempts` (Security Tracking)

**Purpose:** Tracks who tried to login and if they succeeded

| Column | Type | What It Stores | Example |
|--------|------|----------------|---------|
| `id` | Integer | Unique attempt ID | 1, 2, 3... |
| `user_id` | Integer | Which user | 1 (links to users table) |
| `attempted_at` | Timestamp | When they tried | "2024-01-20 09:15:30" |
| `success` | Boolean | Did it work? | true/false |
| `ip_address` | Text | Their IP address | "192.168.1.100" |
| `user_agent` | Text | Their browser | "Chrome/91.0" |
| `failure_reason` | Text | Why it failed | "Invalid password" |

**Important Rules:**
- ✅ If user is deleted, their login attempts are deleted too
- ✅ Success must be true or false (never empty)

### Visual Representation of Relationships

```
┌─────────────────┐
│     USERS       │
│  (Main Table)   │
├─────────────────┤
│ id              │◄──┐
│ username        │   │
│ email           │   │
│ password_hash   │   │  Links via
│ first_name      │   │  user_id
│ last_name       │   │
│ is_active       │   │
│ created_at      │   │
│ updated_at      │   │
└─────────────────┘   │
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             │
┌─────────────┐ ┌──────────────────┐
│ USER_ROLES  │ │ LOGIN_ATTEMPTS   │
├─────────────┤ ├──────────────────┤
│ id          │ │ id               │
│ user_id     │─┘ user_id          │
│ role_name   │   │ attempted_at    │
│ granted_at  │   │ success         │
└─────────────┘   │ ip_address      │
                  │ user_agent      │
                  │ failure_reason  │
                  └──────────────────┘
```

### Sample Data Included

When you run `npm run db:setup` with `DB_SEED_DATA=true`, you get:

**10 Sample Users:**
- `admin_user` - An administrator
- `john_doe`, `jane_smith`, `bob_wilson` - Regular active users
- `inactive_user`, `suspended_user` - Inactive accounts (for testing)
- `new_user_1`, `new_user_2` - Recently created users
- `test_user` - A test account

**User Roles:**
- Admin user has "admin" role
- Most users have "user" role
- One user has both "moderator" and "user" roles
- Inactive users have "guest" role

**Login Attempts:**
- Successful logins for active users
- Failed login attempts (wrong passwords)
- Failed logins for inactive accounts
- Suspicious activity from same IP

This realistic data lets you test different scenarios right away!

---

## Running Tests - All the Ways

### Understanding Test Tags

Tests are organized with "tags" (like labels). Tags let you run specific groups of tests:

| Tag | What It Tests | When to Use |
|-----|---------------|-------------|
| `@smoke` | Quick connectivity checks | Before starting work, in CI/CD |
| `@crud` | Create, Read, Update, Delete | Testing basic operations |
| `@validation` | Data rules and constraints | Testing data integrity |
| `@queries` | Complex database queries | Testing joins, aggregations |
| `@performance` | Speed and efficiency | Finding slow queries |
| `@schema` | Table structure | After schema changes |
| `@regression` | Comprehensive tests | Before releases |
| `@transaction` | Uses auto-rollback | When you don't want to clean up manually |
| `@negative` | Tests that should fail | Testing error handling |

### Basic Test Commands

#### 1. Run ALL Database Tests
```bash
npm run test:db
```
**What it does:** Runs every database test (50+ scenarios)
**How long:** 2-5 minutes
**When to use:** Before committing code, in CI/CD

#### 2. Run Smoke Tests (Fastest)
```bash
npm run test:db:smoke
```
**What it does:** Quick sanity checks (connection, basic queries)
**How long:** 10-30 seconds
**When to use:** Quick verification, before starting work

#### 3. Run CRUD Tests
```bash
npm run test:db:crud
```
**What it does:** Tests creating, reading, updating, deleting data
**How long:** 30-60 seconds
**When to use:** After changing data operations

#### 4. Run Validation Tests
```bash
npm run test:db:validation
```
**What it does:** Tests data rules (unique emails, required fields, etc.)
**How long:** 30-60 seconds
**When to use:** After changing database constraints

#### 5. Run Query Tests
```bash
npm run test:db:queries
```
**What it does:** Tests complex queries (joins, filters, aggregations)
**How long:** 1-2 minutes
**When to use:** After writing new queries

#### 6. Run Performance Tests
```bash
npm run test:db:performance
```
**What it does:** Tests query speed and efficiency
**How long:** 1-2 minutes
**When to use:** Optimizing database performance

#### 7. Run Schema Validation
```bash
npm run test:db:schema
```
**What it does:** Verifies table structure, indexes, constraints
**How long:** 30-60 seconds
**When to use:** After schema migrations

### Advanced Test Commands

#### Run Tests with Specific Tags
```bash
# Run only transaction-safe tests
npm run test:db -- --tags "@transaction"

# Run only negative tests (expected failures)
npm run test:db -- --tags "@negative"

# Run smoke AND crud tests
npm run test:db -- --tags "@smoke or @crud"

# Run everything EXCEPT performance tests
npm run test:db -- --tags "not @performance"
```

#### Run a Single Feature File
```bash
# Run only connection tests
npm run test:db db-tests/features/db-connection.feature

# Run only user CRUD tests
npm run test:db db-tests/features/users-crud.feature
```

#### Run Tests in Parallel (Faster!)
```bash
# Run with 4 parallel workers
npm run test:db -- --parallel 4
```
**Note:** Be careful with parallel tests - they might interfere with each other!

### Understanding Test Output

When you run tests, you'll see output like this:

```
========================================
🚀 Initializing Database Test Suite
========================================

📋 Setting up database schema...
✓ Schema created successfully
✓ Seed data loaded successfully
✓ Database test suite initialized

Feature: Database Connection Testing

  Scenario: Verify successful database connection
    ✓ Given the database configuration is loaded from environment variables
    ✓ When I attempt to connect to the database
    ✓ Then the connection should be successful
    ✓ And I should be able to query the database

  Scenario: Verify database health check
    ✓ Given I am connected to the database
    ✓ When I perform a health check query
    ✓ Then the health check should return successfully
    ✓ And the response time should be less than 1000 milliseconds

2 scenarios (2 passed)
8 steps (8 passed)
0m01.234s

========================================
🏁 Database Test Suite Completed
========================================
```

**What the symbols mean:**
- ✓ = Test passed
- ✗ = Test failed
- - = Test skipped
- ? = Test undefined (no code written yet)

---

## Writing Your First Test

### Understanding Gherkin (The Language of Tests)

Gherkin is a way to write tests in plain English. It follows this pattern:

```gherkin
Feature: What you're testing
  Why it matters
  
  Scenario: What this specific test does
    Given [starting condition]
    When [action happens]
    Then [expected result]
```

**Key Words:**
- `Feature:` - What you're testing (like a chapter in a book)
- `Scenario:` - One specific test (like a paragraph)
- `Given` - Set up the starting state
- `When` - Do something
- `Then` - Check the result
- `And` - Continue the previous step
- `But` - Negative continuation

### Example 1: A Simple Test

Let's write a test to verify a user exists:

**File:** `db-tests/features/my-first-test.feature`

```gherkin
Feature: My First Database Test
  As a beginner
  I want to verify I can query the database
  So that I know the framework is working

  Background:
    Given I am connected to the database

  Scenario: Check if admin user exists
    When I query for user with username "admin_user"
    Then I should receive 1 user record
    And the user should have email "admin@example.com"
```

**What each line does:**
1. `Feature:` - Names this test file
2. `As a... I want... So that...` - Explains why (optional but helpful)
3. `Background:` - Runs before every scenario (like setup)
4. `Scenario:` - Names this specific test
5. `When...` - Executes a database query
6. `Then...` - Checks we got exactly 1 result
7. `And...` - Checks the email matches

### Example 2: Testing Data Creation

```gherkin
@transaction
Scenario: Create a new user
  When I insert a new user with the following details:
    | username  | email           | password_hash | first_name | last_name |
    | new_user  | new@example.com | hashedpass123 | New        | User      |
  Then the user should be created successfully
  And the last insert should return an ID
  And the user "new_user" should exist in the database
```

**New concepts:**
- `@transaction` - Tag that auto-rolls back changes (no cleanup needed!)
- `| table |` - Way to pass structured data to tests

### Example 3: Testing Validation Rules

```gherkin
@transaction @negative
Scenario: Reject duplicate emails
  Given a user exists with email "john.doe@example.com"
  When I attempt to insert another user with email "john.doe@example.com"
  Then the insert should fail with a constraint violation error
  And the error message should contain "duplicate key"
```

**New concepts:**
- `@negative` - Tag for tests that should fail
- Multiple tags can be combined

### Example 4: Testing with Variables

```gherkin
Scenario Outline: Test multiple user roles
  When I query for users with role "<role>"
  Then I should receive at least <count> user records
  
  Examples:
    | role      | count |
    | admin     | 1     |
    | user      | 3     |
    | moderator | 1     |
```

**What this does:**
- Runs the same test 3 times with different values
- Once for admin, once for user, once for moderator

### Where to Put Your Tests

```
db-tests/
└── features/
    ├── db-connection.feature      (already exists)
    ├── db-schema-validation.feature (already exists)
    ├── users-crud.feature         (already exists)
    ├── users-validation.feature   (already exists)
    ├── users-queries.feature      (already exists)
    ├── db-performance.feature     (already exists)
    └── my-custom-test.feature     ← Add new tests here!
```

### Running Your New Test

```bash
# Run just your new test
npm run test:db db-tests/features/my-custom-test.feature

# Or run all tests (includes your new one)
npm run test:db
```

---

## Understanding Test Results

### HTML Report (The Pretty One)

After running tests, open the HTML report:

```bash
open reports/db-cucumber-report.html
```

**What you'll see:**
- 📊 Summary: How many passed/failed
- 📝 Each scenario with expandable details
- ⏱️ Execution time for each step
- ❌ Error messages for failures (with stack traces)
- 📷 Screenshots (if configured)

### Console Output (The Quick One)

While tests run, you see real-time output:

```
Feature: User CRUD Operations

  ✓ Scenario: Create a new user (245ms)
  ✗ Scenario: Update user email (156ms)
    Step "Then the user should have email" failed:
    Expected: "updated@example.com"
    Actual: "old@example.com"
  
  ✓ Scenario: Delete user (89ms)

3 scenarios (2 passed, 1 failed)
12 steps (10 passed, 1 failed, 1 skipped)
```

### JSON Report (For Tools)

For CI/CD integration, there's also a JSON report:

**Location:** `reports/db-cucumber-report.json`

**Use it with:**
- Jenkins
- GitHub Actions
- GitLab CI
- Custom reporting tools

### Understanding Failures

When a test fails, you'll see:

```
✗ Scenario: Insert duplicate email should fail
  ✓ Given a user exists with email "test@example.com"
  ✓ When I attempt to insert another user with email "test@example.com"
  ✗ Then the insert should fail with a constraint violation error
    
  Error Message:
    Expected query to fail, but it succeeded
    
  Last Query Executed:
    INSERT INTO users (username, email, password_hash)
    VALUES ('test_user', 'test@example.com', 'hash123')
    
  Suggestion:
    Check if unique constraint on email column exists
```

**How to debug:**
1. Read the error message carefully
2. Check the last query executed
3. Enable query logging: `DB_LOG_QUERIES=true`
4. Run just that one test
5. Check your database directly with `psql`

---

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

