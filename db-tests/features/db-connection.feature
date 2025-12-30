@smoke @connection
Feature: Database Connection Testing
  As a QA engineer
  I want to verify database connectivity
  So that I can ensure the test environment is properly configured

  Background:
    Given the database configuration is loaded from environment variables

  Scenario: Verify successful database connection
    When I attempt to connect to the database
    Then the connection should be successful
    And I should be able to query the database

  Scenario: Verify database connection details
    Given I am connected to the database
    When I retrieve the database configuration
    Then the database type should be "postgres"
    And the database name should match the configured value

  Scenario: Verify database health check
    Given I am connected to the database
    When I perform a health check query
    Then the health check should return successfully
    And the response time should be less than 1000 milliseconds

  Scenario: Handle connection after disconnect
    Given I am connected to the database
    When I disconnect from the database
    And I attempt to reconnect to the database
    Then the connection should be re-established successfully

  @negative
  Scenario: Handle invalid database credentials
    Given I have invalid database credentials
    When I attempt to connect with invalid credentials
    Then the connection should fail with an authentication error

  @negative
  Scenario: Handle connection timeout
    Given I have a very short connection timeout configured
    When I attempt to connect to an unreachable database host
    Then the connection should fail with a timeout error


