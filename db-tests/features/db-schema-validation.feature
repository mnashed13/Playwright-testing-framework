@schema @regression
Feature: Database Schema Validation
  As a QA engineer
  I want to validate the database schema structure
  So that I can ensure the database matches expected specifications

  Background:
    Given I am connected to the database

  Scenario: Verify users table exists with correct structure
    When I query the database schema for table "users"
    Then the table "users" should exist
    And the table "users" should have the following columns:
      | column_name   | data_type         | is_nullable |
      | id            | integer           | NO          |
      | username      | character varying | NO          |
      | email         | character varying | NO          |
      | password_hash | character varying | NO          |
      | first_name    | character varying | YES         |
      | last_name     | character varying | YES         |
      | is_active     | boolean           | YES         |
      | created_at    | timestamp         | YES         |
      | updated_at    | timestamp         | YES         |

  Scenario: Verify user_roles table exists with correct structure
    When I query the database schema for table "user_roles"
    Then the table "user_roles" should exist
    And the table "user_roles" should have the following columns:
      | column_name | data_type         | is_nullable |
      | id          | integer           | NO          |
      | user_id     | integer           | NO          |
      | role_name   | character varying | NO          |
      | granted_at  | timestamp         | YES         |

  Scenario: Verify login_attempts table exists with correct structure
    When I query the database schema for table "login_attempts"
    Then the table "login_attempts" should exist
    And the table "login_attempts" should have the following columns:
      | column_name    | data_type         | is_nullable |
      | id             | integer           | NO          |
      | user_id        | integer           | YES         |
      | attempted_at   | timestamp         | YES         |
      | success        | boolean           | NO          |
      | ip_address     | character varying | YES         |
      | user_agent     | text              | YES         |
      | failure_reason | character varying | YES         |

  Scenario: Verify primary key constraints exist
    When I query for primary keys in the database
    Then the table "users" should have a primary key on column "id"
    And the table "user_roles" should have a primary key on column "id"
    And the table "login_attempts" should have a primary key on column "id"

  Scenario: Verify foreign key constraints exist
    When I query for foreign key constraints in the database
    Then the table "user_roles" should have a foreign key on "user_id" referencing "users(id)"
    And the table "login_attempts" should have a foreign key on "user_id" referencing "users(id)"

  Scenario: Verify unique constraints on users table
    When I query for unique constraints on table "users"
    Then the table "users" should have a unique constraint on column "username"
    And the table "users" should have a unique constraint on column "email"

  Scenario: Verify indexes exist for performance
    When I query for indexes in the database
    Then an index should exist on "users(email)"
    And an index should exist on "users(username)"
    And an index should exist on "users(is_active)"
    And an index should exist on "user_roles(user_id)"
    And an index should exist on "login_attempts(user_id)"

