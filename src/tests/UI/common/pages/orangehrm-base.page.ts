/**
 * @fileoverview Base page object for OrangeHRM application.
 * Provides shared locators and common actions for all OrangeHRM page objects.
 * @module tests/UI/common/pages/orangehrm-base.page
 */

import { Page, Locator } from '@playwright/test';
import { env } from '@config/env.config';

/**
 * OrangeHRM Base Page
 * Foundation for all OrangeHRM page objects with shared selectors and actions
 * Provides sidebar navigation, topbar actions, toast messages, and common UI elements
 * @class
 * @example
 * class MyPage extends OrangeHRMBasePage {
 *   async navigate() {
 *     await this.navigateToModule('PIM');
 *   }
 * }
 */
export class OrangeHRMBasePage {
  readonly page: Page;
  readonly BASE_URL = env.orangehrm.baseUrl;

  // Sidebar
  readonly sidebar: Locator;
  readonly sidebarSearch: Locator;
  readonly sidebarMenuItems: Locator;

  // Topbar
  readonly topbar: Locator;
  readonly topbarItems: Locator;
  readonly pageTitle: Locator;
  readonly breadcrumb: Locator;

  // User dropdown
  readonly userDropdown: Locator;
  readonly userDropdownName: Locator;
  readonly userDropdownMenu: Locator;

  // Common action elements
  readonly toastMessage: Locator;
  readonly toastSuccess: Locator;
  readonly toastError: Locator;
  readonly addButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly resetButton: Locator;
  readonly searchButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly spinner: Locator;
  readonly recordsCount: Locator;
  readonly tableRows: Locator;
  readonly tableHeaders: Locator;
  readonly noRecordsMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.sidebar = page.locator('.oxd-sidepanel');
    this.sidebarSearch = page.locator('.oxd-main-menu-search input');
    this.sidebarMenuItems = page.locator('.oxd-main-menu-item');

    // Topbar
    this.topbar = page.locator('.oxd-topbar-body-nav');
    this.topbarItems = page.locator('.oxd-topbar-body-nav-tab');
    this.pageTitle = page.locator('.oxd-topbar-header-title h6');
    this.breadcrumb = page.locator('.oxd-topbar-header-breadcrumb');

    // User dropdown
    this.userDropdown = page.locator('.oxd-userdropdown');
    this.userDropdownName = page.locator('.oxd-userdropdown-tab p');
    this.userDropdownMenu = page.locator('.oxd-dropdown-menu');

    // Common elements
    this.toastMessage = page.locator('.oxd-toast');
    this.toastSuccess = page.locator('.oxd-toast--success');
    this.toastError = page.locator('.oxd-toast--error');
    this.addButton = page.locator('.orangehrm-header-container button:has(.oxd-icon.bi-plus)');
    this.saveButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button.oxd-button--ghost:has-text("Cancel")');
    this.resetButton = page.locator('button.oxd-button--ghost:has-text("Reset")');
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
    this.deleteConfirmButton = page.locator(
      '.orangehrm-modal-footer button.oxd-button--label-danger'
    );
    this.deleteCancelButton = page.locator('.orangehrm-modal-footer button.oxd-button--ghost');
    this.spinner = page.locator('.oxd-loading-spinner');
    this.recordsCount = page.locator('.orangehrm-header-container span');
    this.tableRows = page.locator('.oxd-table-card');
    this.tableHeaders = page.locator('.oxd-table-header .oxd-table-row div');
    this.noRecordsMessage = page.locator(
      '.orangehrm-header-container span:has-text("No Records Found")'
    );
  }

  // ── Navigation ──

  /**
   * Navigate to a specific module in sidebar
   * @async
   * @param {string} moduleName - Module name (e.g., 'PIM', 'Admin', 'Leave')
   * @returns {Promise<void>}
   * @example
   * await basePage.navigateToModule('PIM');
   */
  async navigateToModule(moduleName: string): Promise<void> {
    await this.page.locator(`.oxd-main-menu a:has-text("${moduleName}")`).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Click a topbar navigation item
   * @async
   * @param {string} itemName - Item name to click
   * @returns {Promise<void>}
   */
  async clickTopbarItem(itemName: string): Promise<void> {
    const navTab = this.page.locator(`.oxd-topbar-body-nav-tab:has-text("${itemName}")`);
    await navTab.waitFor({ state: 'visible', timeout: 5000 });
    await navTab.click({ force: true });
  }

  /**
   * Click a topbar dropdown item
   * @async
   * @param {string} parentName - Parent menu name
   * @param {string} itemName - Dropdown item name
   * @returns {Promise<void>}
   * @example
   * await basePage.clickTopbarDropdownItem('Job', 'Job Titles');
   */
  async clickTopbarDropdownItem(parentName: string, itemName: string): Promise<void> {
    await this.clickTopbarItem(parentName);
    // Wait for dropdown menu to appear
    await this.page.locator('.oxd-dropdown-menu').waitFor({ state: 'visible', timeout: 5000 });
    const dropdownItem = this.page.locator(`.oxd-dropdown-menu a:has-text("${itemName}")`);
    await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    await dropdownItem.click({ force: true });
    await this.waitForPageLoad();
  }

  async navigateBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  // ── User Dropdown ──

  async openUserDropdown(): Promise<void> {
    await this.userDropdown.click();
  }

  async clickUserDropdownItem(itemName: string): Promise<void> {
    await this.openUserDropdown();
    await this.page.locator(`.oxd-dropdown-menu a:has-text("${itemName}")`).click();
    await this.waitForPageLoad();
  }

  async getUserDropdownName(): Promise<string> {
    return (await this.userDropdownName.textContent()) || '';
  }

  async getUserDropdownOptions(): Promise<string[]> {
    await this.openUserDropdown();
    const options = await this.page.locator('.oxd-dropdown-menu a').allTextContents();
    return options.map(opt => opt.trim());
  }

  // ── Sidebar ──

  async searchSidebar(searchText: string): Promise<void> {
    await this.sidebarSearch.fill(searchText);
  }

  async clearSidebarSearch(): Promise<void> {
    await this.sidebarSearch.clear();
  }

  async getSidebarMenuItemCount(): Promise<number> {
    return await this.sidebarMenuItems.count();
  }

  async getVisibleSidebarItems(): Promise<string[]> {
    const items = await this.sidebarMenuItems.allTextContents();
    return items.map(item => item.trim());
  }

  // ── Toast Messages ──

  async waitForToastSuccess(): Promise<void> {
    await this.toastSuccess.waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForToastError(): Promise<void> {
    await this.toastError.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getToastMessage(): Promise<string> {
    await this.toastMessage.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.toastMessage.locator('.oxd-text--toast-message').textContent()) || '';
  }

  async waitForToastDismiss(): Promise<void> {
    await this.toastMessage.waitFor({ state: 'hidden', timeout: 10000 });
  }

  // ── Table ──

  async getRecordsCountText(): Promise<string> {
    return (await this.recordsCount.textContent()) || '';
  }

  async getTableRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getTableCellText(rowIndex: number, cellIndex: number): Promise<string> {
    const row = this.tableRows.nth(rowIndex);
    const cell = row.locator('.oxd-table-cell').nth(cellIndex);
    return (await cell.textContent()) || '';
  }

  async clickTableRowAction(rowIndex: number, action: 'edit' | 'delete'): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const icon = action === 'edit' ? '.bi-pencil-fill' : '.bi-trash';
    await row.locator(`.oxd-icon${icon}`).click();
  }

  async selectTableRowCheckbox(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator('.oxd-checkbox-input').click();
  }

  // ── Dialog / Confirmation ──

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete(): Promise<void> {
    await this.deleteCancelButton.click();
  }

  async isDeleteDialogVisible(): Promise<boolean> {
    return await this.page.locator('.orangehrm-dialog-popup').isVisible();
  }

  // ── Form Helpers ──

  async fillInputByLabel(label: string, value: string): Promise<void> {
    const formGroup = this.page.locator(`.oxd-input-group:has(.oxd-label:text-is("${label}"))`);
    await formGroup.locator('.oxd-input').fill(value);
  }

  async selectDropdownByLabel(label: string, optionText: string): Promise<void> {
    const formGroup = this.page.locator(`.oxd-input-group:has(.oxd-label:text-is("${label}"))`);
    await formGroup.locator('.oxd-select-text').click();
    await this.page
      .locator(`.oxd-select-dropdown .oxd-select-option:has-text("${optionText}")`)
      .click();
  }

  async fillAutocompleteByLabel(
    label: string,
    searchText: string,
    selectFirst: boolean = true
  ): Promise<void> {
    const formGroup = this.page.locator(`.oxd-input-group:has(.oxd-label:text-is("${label}"))`);
    await formGroup.locator('.oxd-autocomplete-text-input input').fill(searchText);
    if (selectFirst) {
      await this.page
        .locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option')
        .first()
        .click();
    }
  }

  async getValidationError(label: string): Promise<string> {
    const formGroup = this.page.locator(`.oxd-input-group:has(.oxd-label:text-is("${label}"))`);
    return (await formGroup.locator('.oxd-input-field-error-message').textContent()) || '';
  }

  async isValidationErrorVisible(label: string): Promise<boolean> {
    const formGroup = this.page.locator(`.oxd-input-group:has(.oxd-label:text-is("${label}"))`);
    return await formGroup.locator('.oxd-input-field-error-message').isVisible();
  }

  // ── Common Actions ──

  async clickAdd(): Promise<void> {
    await this.addButton.click();
    await this.waitForPageLoad();
  }

  async clickSave(): Promise<void> {
    await this.saveButton.first().click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.first().click();
    await this.waitForPageLoad();
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click();
    await this.waitForPageLoad();
  }

  async clickSearch(): Promise<void> {
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  // ── Pagination ──

  async clickPaginationPage(pageNumber: number): Promise<void> {
    await this.page
      .locator(`.oxd-pagination .oxd-pagination-page-item:has-text("${pageNumber}")`)
      .click();
    await this.waitForPageLoad();
  }

  async clickPaginationNext(): Promise<void> {
    await this.page
      .locator('.oxd-pagination .oxd-pagination-page-item--previous-next')
      .last()
      .click();
    await this.waitForPageLoad();
  }

  async getActivePaginationPage(): Promise<string> {
    return (
      (await this.page
        .locator('.oxd-pagination .oxd-pagination-page-item--active')
        .textContent()) || ''
    );
  }

  async isPaginationVisible(): Promise<boolean> {
    return await this.page.locator('.oxd-pagination').isVisible();
  }

  // ── Utilities ──

  async waitForPageLoad(): Promise<void> {
    // Wait for document ready
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    // Also attempt load state with a reasonable timeout
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForUrlContains(text: string): Promise<void> {
    await this.page.waitForURL(url => url.href.includes(text), { timeout: 15000 });
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }

  async getTopbarItems(): Promise<string[]> {
    const items = await this.topbarItems.allTextContents();
    return items.map(item => item.trim());
  }
}
