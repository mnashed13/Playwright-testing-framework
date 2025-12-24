@validation @regression
Feature: User Data Validation
  As a QA engineer
  I want to validate data constraints and business rules
  So that I can ensure data integrity is maintained

  Background:
    Given I am connected to the database

  @transaction @negative
  Scenario: Reject user with missing username
    When I attempt to insert a user without a username
    Then the insert should fail with a constraint violation error
    And the error should indicate a NOT NULL constraint violation

  @transaction @negative
  Scenario: Reject user with missing email
    When I attempt to insert a user without an email
    Then the insert should fail with a constraint violation error
    And the error should indicate a NOT NULL constraint violation

  @transaction @negative
  Scenario: Reject user with missing password
    When I attempt to insert a user without a password_hash
    Then the insert should fail with a constraint violation error
    And the error should indicate a NOT NULL constraint violation

  @transaction @negative
  Scenario: Reject duplicate email addresses
    Given a user exists with email "john.doe@example.com"
    When I attempt to insert another user with email "john.doe@example.com"
    Then the insert should fail with a constraint violation error
    And the error message should contain "duplicate key"

  @transaction @negative
  Scenario: Reject duplicate usernames
    Given a user exists with username "jane_smith"
    When I attempt to insert another user with username "jane_smith"
    Then the insert should fail with a constraint violation error
    And the error message should contain "duplicate key"

  @transaction @negative
  Scenario: Validate email format constraint
    When I attempt to insert a user with invalid email "notanemail"
    Then the insert should fail with a constraint violation error
    And the error should indicate an email format check violation

  @transaction @negative
  Scenario: Enforce minimum username length
    When I attempt to insert a user with username "ab"
    Then the insert should fail with a constraint violation error
    And the error should indicate a username length check violation

  @transaction @negative
  Scenario: Enforce minimum password length
    When I attempt to insert a user with password_hash "short"
    Then the insert should fail with a constraint violation error
    And the error should indicate a password length check violation

  @transaction
  Scenario: Allow user with minimum valid username length
    When I insert a user with username "abc" and valid other fields
    Then the insert should be successful
    And the user "abc" should exist in the database

  @transaction
  Scenario: Validate default values are applied
    When I insert a user with only required fields
    Then the insert should be successful
    And the user should have is_active set to true by default
    And the user should have created_at timestamp set
    And the user should have updated_at timestamp set

  @transaction
  Scenario: Verify timestamp fields are automatically set
    When I insert a new user
    Then the created_at field should be set to current timestamp
    And the updated_at field should be set to current timestamp

  @transaction
  Scenario: Verify updated_at is updated on user modification
    Given a user exists with username "test_user"
    And I note the current updated_at timestamp
    When I update the user's first name after a 2 second delay
    Then the updated_at timestamp should be newer than the original

