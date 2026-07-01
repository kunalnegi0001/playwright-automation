import { Page, Locator } from '@playwright/test';
import { OrangeHRMBasePage } from '@tests/UI/common/pages/orangehrm-base.page';

export class DashboardPage extends OrangeHRMBasePage {
  readonly dashboardHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = page.locator('.oxd-topbar-header-title h6');
  }
}
