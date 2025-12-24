@queries @regression
Feature: Complex User Queries
  As a QA engineer
  I want to test complex database queries
  So that I can ensure joins, filters, and aggregations work correctly

  Background:
    Given I am connected to the database

  Scenario: Find all users with a specific role
    When I query for users with role "admin"
    Then I should receive at least 1 user record
    And all returned users should have the role "admin"

  Scenario: Find all users with user role
    When I query for users with role "user"
    Then I should receive multiple user records
    And all returned users should have the role "user"

  Scenario: Get only active users
    When I query for all active users
    Then I should receive multiple user records
    And all returned users should have is_active set to true
    And no inactive users should be in the results

  Scenario: Get only inactive users
    When I query for all inactive users
    Then I should receive at least 1 user record
    And all returned users should have is_active set to false

  Scenario: Join users with their roles
    When I execute a query joining users and user_roles tables
    Then I should receive multiple records
    And each record should contain user information and role information
    And the results should include username, email, and role_name

  Scenario: Count total users by role
    When I execute a query to count users grouped by role
    Then I should receive role counts
    And the "user" role should have the highest count
    And the "admin" role should have at least 1 user

  Scenario: Find users with multiple roles
    When I query for users who have more than one role
    Then I should receive at least 1 user record
    And each user should be associated with multiple roles

  Scenario: Count login attempts by user
    Given a user exists with username "john_doe"
    When I count the total login attempts for user "john_doe"
    Then the count should be greater than 0

  Scenario: Get successful login attempts for a user
    Given a user exists with username "admin_user"
    When I query for successful login attempts for user "admin_user"
    Then I should receive at least 1 login attempt record
    And all returned attempts should have success set to true

  Scenario: Get failed login attempts for a user
    When I query for failed login attempts
    Then I should receive multiple login attempt records
    And all returned attempts should have success set to false
    And each attempt should have a failure_reason

  Scenario: Find users created within a date range
    Given today's date
    When I query for users created in the last 30 days
    Then I should receive multiple user records
    And all users should have created_at within the last 30 days

  Scenario: Find users created in the last 7 days
    When I query for users created in the last 7 days
    Then I should receive at least 1 user record
    And all users should be recently created

  Scenario: Get users with their login attempt counts
    When I execute a query joining users with their login attempt counts
    Then I should receive multiple records
    And each record should contain username and login_attempt_count
    And users with no login attempts should show 0 count

  Scenario: Find users who never logged in
    When I query for users with no login attempts
    Then I should receive at least 1 user record
    And these users should have zero login attempts

  Scenario: Get most recent login attempt per user
    When I query for the most recent login attempt for each user
    Then I should receive multiple records
    And each user should appear only once
    And the attempts should be ordered by most recent first

  Scenario: Find login attempts from a specific IP address
    When I query for login attempts from IP address "192.168.1.100"
    Then I should receive at least 1 login attempt record
    And all attempts should have the IP address "192.168.1.100"

  Scenario: Identify suspicious login patterns
    When I query for IP addresses with more than 3 failed login attempts
    Then I should receive at least 1 IP address
    And each IP should have multiple failed attempts

  Scenario: Search users by email domain
    When I query for users with email domain "example.com"
    Then I should receive multiple user records
    And all email addresses should end with "@example.com"

  Scenario: Get user statistics summary
    When I execute a query to get user statistics
    Then I should receive summary information including:
      | statistic      |
      | total_users    |
      | active_users   |
      | inactive_users |
    And the numbers should be consistent with individual queries

