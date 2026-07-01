@example @authentication @ui
Feature: OrangeHRM Authentication
  As a user of OrangeHRM
  I want to login to the application
  So that I can access the dashboard

  Background:
    Given I am on the OrangeHRM login page

  @ui_smoke @happy-path
  Scenario: Verify login page elements and successful login
    Then I should see the OrangeHRM logo
    And I should see the "Login" heading
    And I should see the Username and Password input fields
    And I should see the Login button
    And I should see the "Forgot your password?" link
    And I should see credential hints showing "Username : Admin" and "Password : admin123"
    And I should see social media links
    And I should see the footer with "OrangeHRM OS" and copyright text
    When I enter username "Admin" and password "admin123"
    And I click the Login button
    Then I should be redirected to the dashboard page
    And I should see the Dashboard heading
    And I should see 12 sidebar menu items
    And I should see user profile name in the top-right corner
