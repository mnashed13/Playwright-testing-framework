Feature: Google search navigation
  Scenario: Search for Wikipedia and open the result page
    Given I am on the Google home page
    When I search for "wikipedia"
    And I click the Wikipedia result
    Then I should see a Wikipedia page title containing "Wikipedia"
