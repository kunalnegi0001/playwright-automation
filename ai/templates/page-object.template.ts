import type { Page, Locator } from '@playwright/test';
import { logger } from '@utils/core';
import { OrangeHRMBasePage } from '../../common/pages/base.page';

/**
 * Page Object for [PageName] page
 * [Brief description of what this page does]
 * @extends OrangeHRMBasePage
 */
export class [PageName]Page extends OrangeHRMBasePage {
  // ==================== LOCATORS ====================
  // Define all page locators as readonly properties
  // Use semantic selectors (role, text, label) when possible

  readonly [elementName]Button: Locator;
  readonly [elementName]Input: Locator;
  readonly [elementName]Heading: Locator;
  readonly [elementName]Table: Locator;
  readonly errorMessage: Locator;

  // ==================== CONSTRUCTOR ====================
  /**
   * Initialize [PageName]Page
   * @param {Page} page - Playwright Page object
   */
  constructor(page: Page) {
    super(page); // MUST call super constructor
    logger.info('Initializing [PageName]Page');

    // Initialize locators using semantic selectors
    this.[elementName]Button = this.page.getByRole('button', { name: '[Button Text]' });
    this.[elementName]Input = this.page.getByRole('textbox', { name: '[Input Label]' });
    this.[elementName]Heading = this.page.getByRole('heading', { name: '[Heading Text]' });
    this.[elementName]Table = this.page.getByRole('table');
    this.errorMessage = this.page.getByRole('alert');
  }

  // ==================== NAVIGATION METHODS ====================
  /**
   * Navigate to [PageName] page
   * @async
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.navigate();
   */
  async navigate(): Promise<void> {
    logger.info('Navigating to [PageName] page');
    await this.page.goto('/[path]');
    await this.waitForPageLoad();
  }

  // ==================== ACTION METHODS ====================
  /**
   * Click the [element] button
   * @async
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.click[Element]Button();
   */
  async click[Element]Button(): Promise<void> {
    logger.info('Clicking [element] button');
    await this.[elementName]Button.click();
  }

  /**
   * Enter value in [element] input field
   * @async
   * @param {string} value - Value to enter
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.enter[Element]('test value');
   */
  async enter[Element](value: string): Promise<void> {
    logger.info('Entering value in [element] field', { value });
    await this.[elementName]Input.fill(value);
  }

  /**
   * Select option from dropdown
   * @async
   * @param {string} option - Option text to select
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.selectOption('Option 1');
   */
  async selectOption(option: string): Promise<void> {
    logger.info('Selecting option', { option });
    await this.page.selectOption('select[name="dropdown"]', option);
  }

  // ==================== COMPOSITE METHODS ====================
  // Higher-level methods that combine multiple actions

  /**
   * Complete [action name] flow
   * @async
   * @param {object} data - Data object with required fields
   * @param {string} data.field1 - Description of field1
   * @param {string} data.field2 - Description of field2
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.complete[Action]({ field1: 'value1', field2: 'value2' });
   */
  async complete[Action](data: { field1: string; field2: string }): Promise<void> {
    logger.info('Completing [action]', data);

    await this.enter[Element](data.field1);
    await this.selectOption(data.field2);
    await this.click[Element]Button();
    await this.page.waitForLoadState('networkidle');

    logger.info('[Action] completed successfully');
  }

  // ==================== GETTER METHODS ====================
  // Methods that retrieve information from the page

  /**
   * Get [element] text
   * @async
   * @returns {Promise<string>} Element text content
   * @example
   * const text = await [pageName]Page.get[Element]Text();
   */
  async get[Element]Text(): Promise<string> {
    logger.info('Getting [element] text');
    const text = await this.[elementName]Heading.textContent();
    return text || '';
  }

  /**
   * Get error message text
   * @async
   * @returns {Promise<string>} Error message text
   * @example
   * const error = await [pageName]Page.getErrorMessage();
   */
  async getErrorMessage(): Promise<string> {
    logger.info('Getting error message');
    const message = await this.errorMessage.textContent();
    return message || '';
  }

  /**
   * Get all table row data
   * @async
   * @returns {Promise<string[]>} Array of row data
   * @example
   * const rows = await [pageName]Page.getTableRows();
   */
  async getTableRows(): Promise<string[]> {
    logger.info('Getting table rows');
    const rows = await this.[elementName]Table.locator('tbody tr').all();
    const rowData = await Promise.all(
      rows.map(async (row) => (await row.textContent()) || '')
    );
    return rowData;
  }

  /**
   * Get row count in table
   * @async
   * @returns {Promise<number>} Number of rows
   * @example
   * const count = await [pageName]Page.getRowCount();
   */
  async getRowCount(): Promise<number> {
    logger.info('Getting row count');
    return await this.[elementName]Table.locator('tbody tr').count();
  }

  // ==================== VALIDATION METHODS ====================
  // Methods that return boolean values for validation

  /**
   * Check if [element] is visible
   * @async
   * @returns {Promise<boolean>} True if visible
   * @example
   * const isVisible = await [pageName]Page.is[Element]Visible();
   */
  async is[Element]Visible(): Promise<boolean> {
    try {
      await this.[elementName]Button.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error message is displayed
   * @async
   * @returns {Promise<boolean>} True if error is visible
   * @example
   * const hasError = await [pageName]Page.hasErrorMessage();
   */
  async hasErrorMessage(): Promise<boolean> {
    logger.info('Checking for error message');
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify page is fully loaded
   * @async
   * @returns {Promise<boolean>} True if page is loaded
   * @example
   * const isLoaded = await [pageName]Page.isPageLoaded();
   */
  async isPageLoaded(): Promise<boolean> {
    logger.info('Verifying [PageName] page is loaded');

    try {
      const headingVisible = await this.[elementName]Heading.isVisible();
      const buttonVisible = await this.[elementName]Button.isVisible();
      const loadingHidden = !(await this.loadingSpinner.isVisible().catch(() => false));

      return headingVisible && buttonVisible && loadingHidden;
    } catch (error) {
      logger.error('Page load verification failed', error);
      return false;
    }
  }

  // ==================== WAIT HELPER METHODS ====================
  /**
   * Wait for [specific element or condition]
   * @async
   * @param {number} timeout - Max wait time in milliseconds
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.waitFor[Element](10000);
   */
  async waitFor[Element](timeout: number = 10000): Promise<void> {
    logger.info('Waiting for [element]');
    await this.[elementName]Button.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for table to populate with data
   * @async
   * @param {number} timeout - Max wait time in milliseconds
   * @returns {Promise<void>}
   * @example
   * await [pageName]Page.waitForTableData();
   */
  async waitForTableData(timeout: number = 10000): Promise<void> {
    logger.info('Waiting for table data');
    await this.page.waitForFunction(
      () => document.querySelectorAll('table tbody tr').length > 0,
      { timeout }
    );
  }
}

// ==================== USAGE EXAMPLE ====================
/*
import { test, expect } from '@fixtures/test.fixtures';
import [PageName]Page from './pages/[page-name].page';

test.describe('[PageName] Tests @ui', () => {
  let [pageName]Page: [PageName]Page;

  test.beforeEach(async ({ page }) => {
    [pageName]Page = new [PageName]Page(page);
    await [pageName]Page.navigate();
  });

  test('should perform [action]', async () => {
    await [pageName]Page.complete[Action]({
      field1: 'value1',
      field2: 'value2'
    });

    const isVisible = await [pageName]Page.is[Element]Visible();
    expect(isVisible).toBe(true);
  });
});
*/
