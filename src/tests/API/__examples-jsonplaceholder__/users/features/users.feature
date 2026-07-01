@api @working
Feature: Users API - JSONPlaceholder
  As an API consumer
  I want to create users through the API
  So that I can validate CRUD create flow

  Background:
    Given the JSONPlaceholder API is available

  @smoke @crud
  Scenario: Create a new user
    Given I have user data:
      | name      | Test User        |
      | username  | testuser         |
      | email     | test@example.com |
    When I send a POST request to "/users" with the user data
    Then the response status code should be 201
    And the response should contain the created user
    And the user should have an assigned id
