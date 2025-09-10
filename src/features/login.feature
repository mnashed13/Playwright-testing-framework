Feature: Google Search

  Scenario: Search for Wikipedia on Google
    Given I am on Google homepage
    When I search for "wikipedia"
    Then I should see search results

  Scenario: Verify Google search functionality
    Given I am on Google homepage
    When I search for "playwright testing"
    Then I should see search results containing "playwright" 