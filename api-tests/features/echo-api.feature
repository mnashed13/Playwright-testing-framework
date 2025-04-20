@api @users 
Feature: Postman Echo API Testing

  Scenario: Successfully retrieve data from echo GET endpoint
    When I send a GET request to the echo endpoint
    Then the echo response status code should be 200
    And the response should contain the request details

  Scenario: Successfully send data to echo POST endpoint
    Given I have valid POST request data
    When I send a POST request to the echo endpoint
    Then the echo response status code should be 200
    And the POST response should contain the sent data
    And the response should contain the request details

  Scenario: Send POST request with invalid Content-Type
    Given I have valid POST request data
    And I set the Content-Type header to "text/plain"
    When I send a POST request to the echo endpoint
    Then the echo response status code should be 200
    And the POST response should show different Content-Type

  Scenario: Send POST request with empty body
    Given I have empty POST request data
    When I send a POST request to the echo endpoint
    Then the echo response status code should be 200