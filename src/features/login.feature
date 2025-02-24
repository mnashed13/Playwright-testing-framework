Feature: User Authentication

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I login with valid credentials
    Then I should be logged in successfully

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I login with invalid credentials
    Then I should see an error message 