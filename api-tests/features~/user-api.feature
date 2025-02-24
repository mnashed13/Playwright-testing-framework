@api @users
Feature: Users API Testing

  @smoke @get
  Scenario: Get user details successfully
    Given I have a valid user ID
    When I send a GET request to fetch user details
    Then the response status code should be 200
    And the response should contain user information

  @smoke @post @create
  Scenario: Create a new user
    Given I have valid user creation payload
    When I send a POST request to create user
    Then the response status code should be 201
    And the response should contain the created user details

  @regression @put @update
  Scenario: Update user details
    Given I have a valid user ID
    And I have valid user update payload
    When I send a PUT request to update user
    Then the response status code should be 200
    And the response should contain updated information