@api @gcp @pubsub
Feature: GCP Pub/Sub API Testing

  Scenario: Successfully list Pub/Sub topics in a project
    Given I am authenticated with GCP using service account credentials
    And I have a valid GCP project ID
    When I send a GET request to list Pub/Sub topics
    Then the response status code should be 200
    And the response should contain a list of topics

  Scenario: Successfully create a Pub/Sub topic
    Given I am authenticated with GCP using service account credentials
    And I have a valid GCP project ID
    And I have a valid topic name
    When I send a POST request to create a Pub/Sub topic
    Then the response status code should be 200
    And the response should contain the created topic details
    And the topic name should be correct

  Scenario: Successfully publish a message to a Pub/Sub topic
    Given I am authenticated with GCP using service account credentials
    And I have a valid GCP project ID
    And I have a valid topic name
    And I have a valid message payload
    When I send a POST request to publish a message to the topic
    Then the response status code should be 200
    And the response should contain message IDs
    And the message should be successfully published

  Scenario: Successfully pull messages from a Pub/Sub subscription
    Given I am authenticated with GCP using service account credentials
    And I have a valid GCP project ID
    And I have a valid subscription name
    When I send a POST request to pull messages from the subscription
    Then the response status code should be 200
    And the response should contain messages or be empty

  Scenario: Successfully delete a Pub/Sub topic
    Given I am authenticated with GCP using service account credentials
    And I have a valid GCP project ID
    And I have a valid topic name
    When I send a DELETE request to delete the Pub/Sub topic
    Then the response status code should be 200
    And the topic should be successfully deleted