/**
 * @fileoverview Login page object model for OrangeHRM application.
 * Provides methods and locators for interacting with the login page.
 * @module tests/UI/authentication/pages/login.page
 */

import { Page, Locator } from '@playwright/test';
import { OrangeHRMBasePage } from '@tests/UI/common/pages/orangehrm-base.page';

/**
 * OrangeHRM Login Page Object
 * Handles login page interactions for OrangeHRM demo application
 * Extends OrangeHRMBasePage for common functionality
 * @class
 * @extends {OrangeHRMBasePage}
 */
export class LoginPage extends OrangeHRMBasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;
  readonly errorAlert: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly credentialHints: Locator;
  readonly logo: Locator;
  readonly footer: Locator;
  readonly socialLinks: Locator;
  readonly usernameRequiredError: Locator;
  readonly passwordRequiredError: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.loginHeading = page.locator('h5.orangehrm-login-title');
    this.errorAlert = page.locator('.oxd-alert--error');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.forgotPasswordLink = page.locator(
      '.orangehrm-login-forgot-header p, p:has-text("Forgot your password?")'
    );
    this.credentialHints = page.locator('.orangehrm-login-slot');
    this.logo = page.locator('.orangehrm-login-branding img');
    this.footer = page.locator('.orangehrm-login-footer');
    this.socialLinks = page.locator('.orangehrm-login-footer-sm a');
    this.usernameRequiredError = page.locator(
      '.oxd-input-group:has(input[name="username"]) .oxd-input-field-error-message'
    );
    this.passwordRequiredError = page.locator(
      '.oxd-input-group:has(input[name="password"]) .oxd-input-field-error-message'
    );
  }

  /**
   * Navigate to the login page
   * @async
   * @returns {Promise<void>}
   * @example
   * await loginPage.navigate();
   */
  async navigate(): Promise<void> {
    await this.page.goto(`${this.BASE_URL}/auth/login`);
    await this.waitForPageLoad();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Perform complete login action with username and password
   * @async
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   * @returns {Promise<void>}
   * @example
   * await loginPage.login('Admin', 'admin123');
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    await this.waitForPageLoad();
  }

  /**
   * Login and wait for successful navigation to dashboard
   * @async
   * @param {string} username - Username for login
   * @param {string} password - Password for login
   * @returns {Promise<void>}
   * @example
   * await loginPage.loginAndWaitForDashboard('Admin', 'admin123');
   */
  async loginAndWaitForDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.waitForUrlContains('/dashboard');
  }

  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.loginHeading.isVisible();
  }

  async isErrorAlertDisplayed(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  async getErrorMessageText(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  async isUsernameRequiredErrorShown(): Promise<boolean> {
    return await this.usernameRequiredError.isVisible();
  }

  async isPasswordRequiredErrorShown(): Promise<boolean> {
    return await this.passwordRequiredError.isVisible();
  }

  async getUsernameRequiredErrorText(): Promise<string> {
    return (await this.usernameRequiredError.textContent()) || '';
  }

  async getPasswordRequiredErrorText(): Promise<string> {
    return (await this.passwordRequiredError.textContent()) || '';
  }

  async isLogoVisible(): Promise<boolean> {
    return await this.logo.isVisible();
  }

  async isForgotPasswordLinkVisible(): Promise<boolean> {
    return await this.forgotPasswordLink.isVisible();
  }

  async getFooterText(): Promise<string> {
    return (await this.footer.textContent()) || '';
  }

  async getSocialLinksCount(): Promise<number> {
    return await this.socialLinks.count();
  }

  async getCredentialHintsText(): Promise<string> {
    return (await this.credentialHints.textContent()) || '';
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForPageLoad();
  }

  async isUsernameFieldVisible(): Promise<boolean> {
    return await this.usernameInput.isVisible();
  }

  async isPasswordFieldVisible(): Promise<boolean> {
    return await this.passwordInput.isVisible();
  }

  async isLoginButtonVisible(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }
}
