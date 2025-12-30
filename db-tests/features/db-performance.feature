@performance @regression
Feature: Database Performance Testing
  As a QA engineer
  I want to test database query performance
  So that I can ensure the database meets performance requirements

  Background:
    Given I am connected to the database

  Scenario: Single record query performance
    When I query for a single user by ID
    Then the query should complete in less than 100 milliseconds
    And I should receive exactly 1 user record

  Scenario: Query with index usage verification
    When I query for a user by email "admin@example.com"
    Then the query should complete in less than 50 milliseconds
    And the query should use the email index

  Scenario: Multiple record query performance
    When I query for all active users
    Then the query should complete in less than 200 milliseconds
    And I should receive multiple user records

  Scenario: Join query performance
    When I execute a join query between users and user_roles
    Then the query should complete in less than 300 milliseconds
    And I should receive multiple records with joined data

  Scenario: Aggregation query performance
    When I execute a count aggregation on the users table
    Then the query should complete in less than 100 milliseconds
    And I should receive a valid count result

  @transaction
  Scenario: Bulk insert performance
    When I insert 100 users in a single transaction
    Then the bulk insert should complete in less than 5000 milliseconds
    And all 100 users should be inserted successfully

  @transaction
  Scenario: Individual insert performance
    When I insert a single user into the database
    Then the insert should complete in less than 50 milliseconds
    And the user should be created successfully

  @transaction
  Scenario: Update performance
    Given a user exists with username "test_user"
    When I update the user's information
    Then the update should complete in less than 50 milliseconds
    And the update should affect exactly 1 row

  @transaction
  Scenario: Delete performance
    Given I insert a test user for deletion
    When I delete the test user
    Then the delete should complete in less than 50 milliseconds
    And the delete should affect exactly 1 row

  Scenario: Connection pool handling under load
    When I execute 20 concurrent queries
    Then all queries should complete successfully
    And the average query time should be less than 200 milliseconds
    And no connection pool errors should occur

  Scenario: Complex query with multiple joins performance
    When I execute a complex query with 3 table joins
    Then the query should complete in less than 500 milliseconds
    And I should receive the expected result set

  Scenario: Query with ORDER BY performance
    When I query for users ordered by created_at descending
    Then the query should complete in less than 150 milliseconds
    And the results should be properly sorted

  Scenario: Query with LIMIT performance
    When I query for the first 10 users
    Then the query should complete in less than 100 milliseconds
    And I should receive exactly 10 user records

  Scenario: Search query performance
    When I search for users with username containing "user"
    Then the query should complete in less than 200 milliseconds
    And I should receive matching user records

  Scenario: Date range query performance
    When I query for users created in the last 30 days
    Then the query should complete in less than 200 milliseconds
    And I should receive users within the date range


