@crud @regression
Feature: User CRUD Operations
  As a QA engineer
  I want to test Create, Read, Update, and Delete operations on users
  So that I can ensure basic database operations work correctly

  Background:
    Given I am connected to the database

  @transaction
  Scenario: Create a new user in the database
    When I insert a new user with the following details:
      | username      | email                  | password_hash | first_name | last_name |
      | test_user_new | testuser@example.com   | hashedpass123 | Test       | User      |
    Then the user should be created successfully
    And the last insert should return an ID
    And the user "test_user_new" should exist in the database

  @transaction
  Scenario: Read user by ID
    Given a user exists with username "john_doe"
    When I query for the user by their ID
    Then I should receive 1 user record
    And the user record should contain:
      | field      | value              |
      | username   | john_doe           |
      | email      | john.doe@example.com |
      | first_name | John               |
      | last_name  | Doe                |
      | is_active  | true               |

  @transaction
  Scenario: Read user by username
    When I query for user with username "jane_smith"
    Then I should receive 1 user record
    And the user should have email "jane.smith@example.com"

  @transaction
  Scenario: Read user by email
    When I query for user with email "bob.wilson@example.com"
    Then I should receive 1 user record
    And the user should have username "bob_wilson"

  @transaction
  Scenario: Update user information
    Given a user exists with username "alice_johnson"
    When I update the user's first name to "Alicia"
    And I update the user's last name to "Johnston"
    Then the update should be successful
    And the user "alice_johnson" should have first name "Alicia"
    And the user "alice_johnson" should have last name "Johnston"

  @transaction
  Scenario: Update user email address
    Given a user exists with username "test_user"
    When I update the user's email to "newemail@example.com"
    Then the update should be successful
    And the user "test_user" should have email "newemail@example.com"

  @transaction
  Scenario: Deactivate a user account
    Given a user exists with username "test_user"
    And the user is currently active
    When I set the user's is_active status to false
    Then the update should be successful
    And the user "test_user" should be inactive

  @transaction
  Scenario: Delete a user from the database
    Given I insert a user with username "user_to_delete" and email "delete@example.com"
    When I delete the user "user_to_delete"
    Then the delete should be successful
    And the user "user_to_delete" should not exist in the database

  @transaction @negative
  Scenario: Verify unique constraint on email
    Given a user exists with email "admin@example.com"
    When I attempt to insert a new user with the same email "admin@example.com"
    Then the insert should fail with a constraint violation error
    And the error message should mention "unique constraint"

  @transaction @negative
  Scenario: Verify unique constraint on username
    Given a user exists with username "admin_user"
    When I attempt to insert a new user with the same username "admin_user"
    Then the insert should fail with a constraint violation error

  @transaction
  Scenario: Read all active users
    When I query for all active users
    Then I should receive multiple user records
    And all returned users should have is_active set to true

  @transaction
  Scenario: Count total users in database
    When I execute a count query on the users table
    Then the count should be greater than 0

