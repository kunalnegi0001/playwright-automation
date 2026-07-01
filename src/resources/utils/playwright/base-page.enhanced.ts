import { expect, Page, Locator } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { logger } from '@utils/core';

export type PageConfig = {
  pageName?: string;
  urlSuffix?: string;
};

export type PageTranslationContext = {
  root?: Page | Locator;
  productKey: string;
  translationKey: string;
  interpolationValues?: Record<string, unknown>;
};

export type PageI18nHelper = {
  fetchTranslations(page: Page, productKey: string, translationUrl: string): Promise<void>;
  translate(
    page: Page,
    productKey: string,
    translationKey: string,
    interpolationValues?: Record<string, unknown>
  ): Promise<string>;
};

export type PageApiHelper = {
  setBearerToken(token: string): void;
};

export type PageBrowserStorageHelper = {
  getToken(page: Page): Promise<string>;
};

export type PageLocatorOptions = {
  exact?: boolean;
  index?: number;
  timeout?: number;
  elementRole?: string;
  negate?: boolean;
  force?: boolean;
};

export type PageFunctionContext = PageTranslationContext & {
  targetState?: boolean;
  force?: boolean;
  locator?: Locator;
  index?: number;
};

export type PageNavigationParams = {
  menuName: string;
  submenuTabName: string;
  pageName: string;
  verticalTabName?: string;
};

/**
 * Enhanced Base Page with i18n support
 * Provides common functionalities with translation capabilities for multi-language testing
 *
 * NOTE: This is a converted version with i18n features.
 * To use, you'll need to implement/import:
 * - I18nHelper (translation helper)
 * - ApiHelper (API utilities)
 * - BrowserStorageHelper (storage utilities)
 */
class EnhancedBasePage {
  page: Page;
  timeout: number = 30000;
  actionTimeout: number = 10000;
  pageName: string;
  i18nHelper?: PageI18nHelper;
  apiHelper?: PageApiHelper;
  browserStorageHelper?: PageBrowserStorageHelper;
  baseUrl: string;
  url: string;
  userProfileData: Record<string, unknown> | null;

  /**
   * Creates an instance of EnhancedBasePage.
   * @param {Page} page - The Playwright page object.
   * @param {Object} config - The configuration for the page.
   * @param {string} [config.pageName] - The name of the page.
   * @param {string} [config.urlSuffix] - The URL suffix for the page.
   */
  constructor(page: Page, config: PageConfig) {
    this.baseUrl = process.env.BASE_URL ?? '';
    if (!this.baseUrl) {
      throw new Error('BASE_URL is not set');
    }

    this.page = page;
    this.url = new URL(config.urlSuffix ?? '', this.baseUrl).href;
    this.pageName = config.pageName ?? '';

    // Helpers - These need to be implemented/imported
    // Uncomment when you have these helpers ready:
    // this.i18nHelper = I18nHelper;
    // this.apiHelper = ApiHelper;
    // this.browserStorageHelper = BrowserStorageHelper;

    this.userProfileData = null;
  }

  /**
   * Navigates to the page URL and waits for the network to be idle.
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('load');
  }

  /**
   * Navigates to the Base URL and waits for the network to be idle.
   */
  async navigateToBaseUrl() {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('load');
  }

  /**
   * Sets the URL of the page.
   * @param {string} urlSuffix - The URL suffix to be appended to the base URL.
   */
  setUrl(urlSuffix: string) {
    this.url = new URL(urlSuffix ?? '', this.baseUrl).href;
  }

  /**
   * Verifies the current page URL.
   * @param {string} [urlSuffix] - Optional suffix to append to the base URL for verification.
   */
  async checkUrl(urlSuffix?: string) {
    const expectedUrl = urlSuffix ? `${this.baseUrl}${urlSuffix}` : this.url;
    await expect(this.page).toHaveURL(expectedUrl, {
      timeout: 40000,
    });
  }

  /**
   * Waits for the network to be idle.
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('load');
  }

  /**
   * Verifies that an element with a specific translated text is visible on the page.
   * @param {Object} textContext - An object containing the product and translation keys.
   * @param {string} textContext.productKey - The product key for translation.
   * @param {string} textContext.translationKey - The translation key.
   * @param {Locator|Page} [textContext.root] - Optional parent locator.
   * @param {Object} [options={}] - Optional parameters for the locator and assertion.
   */
  async verifyTextState(
    textContext: PageTranslationContext,
    state: string,
    options: PageLocatorOptions = {}
  ) {
    const { locator, timeout, negate } = await this._getLocator('text', textContext, options);
    await this.verifyState(locator, state, negate, timeout);
  }

  /**
   * Verifies that an element associated with a specific translated label text is visible.
   * @param {Object} textContext - An object containing the product and translation keys.
   * @param {string} state - The expected state of the element.
   * @param {Object} [options={}] - Optional parameters.
   */
  async verifyLabelState(
    textContext: PageTranslationContext,
    state: string,
    options: PageLocatorOptions = {}
  ) {
    const { locator, timeout, negate } = await this._getLocator('label', textContext, options);
    await this.verifyState(locator, state, negate, timeout);
  }

  /**
   * Verifies that an element with a specific translated title attribute is visible.
   * @param {Object} textContext - An object containing the product and translation keys.
   * @param {string} state - The expected state of the element.
   * @param {Object} [options={}] - Optional parameters.
   */
  async verifyTitleState(
    textContext: PageTranslationContext,
    state: string,
    options: PageLocatorOptions = {}
  ) {
    const { locator, timeout, negate } = await this._getLocator('title', textContext, options);
    await this.verifyState(locator, state, negate, timeout);
  }

  /**
   * Verifies the state of an element found by its ARIA role and translated accessible name.
   * @param {Object} textContext - The context for translating the element's name.
   * @param {string} state - The expected state of the element.
   * @param {Object} options - Options for locating the element, must include elementRole.
   */
  async verifyRoleState(
    textContext: PageTranslationContext,
    state: string,
    options: PageLocatorOptions
  ) {
    const { locator, timeout, negate } = await this._getLocator('role', textContext, options);
    await this.verifyState(locator, state, negate, timeout);
  }

  /**
   * Hovers over an element identified by its translated text content.
   * @param {Object} textContext - An object containing the product and translation keys.
   * @param {Object} [options={}] - Optional parameters.
   */
  async hoverOnText(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { root, productKey, translationKey } = textContext;
    const { exact = true, index = 0, timeout } = options;
    const name = await this.translate(productKey, translationKey);

    const searchRoot = root ?? this.page;
    const text = searchRoot.getByText(name, { exact }).nth(index);
    await text.hover({ timeout });
  }

  /**
   * Clicks an element found by its ARIA role and translated accessible name.
   * @param {Object} textContext - The context for translating the element's name.
   * @param {Object} options - Options for locating the element, must include elementRole.
   */
  async clickOnRole(textContext: PageTranslationContext, options: PageLocatorOptions) {
    const { locator, timeout } = await this._getLocator('role', textContext, options);
    await this.clickOnElement(locator, timeout);
  }

  /**
   * Clicks an element found by its translated text content.
   * @param {Object} textContext - The context for translating the element's text.
   * @param {Object} [options={}] - Options for locating the element.
   */
  async clickOnText(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { locator, timeout } = await this._getLocator('text', textContext, options);
    await this.clickOnElement(locator, timeout);
  }

  /**
   * Clicks an element found by its associated translated label text.
   * @param {Object} textContext - The context for translating the label's text.
   * @param {Object} [options={}] - Options for locating the element.
   */
  async clickOnLabel(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { locator, timeout } = await this._getLocator('label', textContext, options);
    await this.clickOnElement(locator, timeout);
  }

  /**
   * Clicks an element found by its translated title attribute.
   * @param {Object} textContext - The context for translating the title attribute.
   * @param {Object} [options={}] - Options for locating the element.
   */
  async clickOnTitle(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { locator, timeout } = await this._getLocator('title', textContext, options);
    await this.clickOnElement(locator, timeout);
  }

  /**
   * Fills a textbox identified by its accessible name.
   * @param {Object} textContext - Translation context.
   * @param {string} roleOrPlaceholder - Either 'role' or 'placeholder' strategy.
   * @param {string} value - The value to fill.
   * @param {Object} [options={}] - Optional parameters.
   */
  async fillTextbox(
    textContext: PageTranslationContext,
    roleOrPlaceholder: string,
    value: string,
    options: PageLocatorOptions = {}
  ) {
    const { root, productKey, translationKey, interpolationValues } = textContext;
    const { exact = true, index = 0 } = options;
    const name = await this.translate(productKey, translationKey, interpolationValues);

    const searchRoot = root ?? this.page;

    const textbox =
      roleOrPlaceholder === 'role'
        ? searchRoot.getByRole('textbox', { name, exact }).nth(index)
        : searchRoot.getByPlaceholder(name, { exact }).nth(index);

    await textbox.click();
    await textbox.fill(value);
  }

  /**
   * Presses the 'Enter' key on a textbox.
   * @param {Object} textContext - Translation context.
   * @param {Object} [options={}] - Optional parameters.
   */
  async pressEnterOnTextbox(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { root, productKey, translationKey } = textContext;
    const { exact = true, index = 0 } = options;
    const name = await this.translate(productKey, translationKey);

    const searchRoot = root ?? this.page;
    const text = searchRoot.getByRole('textbox', { name, exact }).nth(index);
    await text.press('Enter');
  }

  /**
   * Sets the state of a checkbox.
   * @param {Object} textContext - Translation context.
   * @param {string} state - Either 'checked' or 'unchecked'.
   * @param {Object} [options={}] - Optional parameters.
   */
  async setCheckboxState(
    textContext: PageTranslationContext,
    state: string,
    options: PageLocatorOptions = {}
  ) {
    const { root, productKey, translationKey, interpolationValues } = textContext;
    const { exact = true, index = 0 } = options;
    const name = await this.translate(productKey, translationKey, interpolationValues);

    const searchRoot = root ?? this.page;
    const checkbox = searchRoot.getByRole('checkbox', { name, exact }).nth(index);

    if (state === 'checked') {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  /**
   * Handles file downloads triggered by a locator click.
   * @param {Locator} locator - The locator that triggers the download.
   * @param {Object} textContext - Translation context for popup verification.
   * @param {string} [fileName] - Optional expected filename.
   */
  async download(locator: Locator, textContext: PageTranslationContext, fileName?: string) {
    const [download] = await Promise.all([this.page.waitForEvent('download'), locator.click()]);

    await this.verifyTextState(textContext, 'visible', {});

    if (fileName) {
      const actualFilename = download.suggestedFilename();
      logger.info(`Downloaded file name: ${actualFilename}`);
      expect(actualFilename).toBe(fileName);
    }
  }

  /**
   * Clicks a radio button.
   * @param {Object} textContext - Translation context.
   * @param {Object} [options={}] - Optional parameters.
   */
  async clickOnRadioButton(textContext: PageTranslationContext, options: PageLocatorOptions = {}) {
    const { root, productKey, translationKey, interpolationValues } = textContext;
    const { exact = true, index = 0, timeout } = options;
    const name = await this.translate(productKey, translationKey, interpolationValues);

    const searchRoot = root ?? this.page;
    const button = searchRoot.getByRole('radio', { name, exact }).nth(index);
    await button.click({ timeout });
  }

  /**
   * Checks if a radio button is checked.
   * @param {Object} functionContext - Translation context.
   * @param {Object} [options={}] - Optional parameters.
   * @returns {Promise<boolean>} True if checked.
   */
  async isRadioButtonChecked(
    functionContext: PageTranslationContext,
    options: PageLocatorOptions = {}
  ) {
    const { root, productKey, translationKey, interpolationValues } = functionContext;
    const { exact = true, index = 0 } = options;
    const name = await this.translate(productKey, translationKey, interpolationValues);

    const searchRoot = root ?? this.page;
    const radio = searchRoot.getByRole('radio', { name, exact }).nth(index);

    await radio.waitFor({ state: 'attached' });

    const ariaChecked = await radio.getAttribute('aria-checked');
    const dataSelected = await radio.getAttribute('data-selected');
    const isRadioChecked = await radio.isChecked();

    return isRadioChecked || ariaChecked === 'true' || dataSelected === 'true';
  }

  /**
   * Checks if a switch/toggle is in the "on" state.
   * @param {Object} functionContext - Translation context.
   * @param {Object} [options={}] - Optional parameters.
   * @returns {Promise<boolean>} True if toggled on.
   */
  async isSwitchToggled(functionContext: PageFunctionContext, options: PageLocatorOptions = {}) {
    const { productKey, translationKey = 'toggle switch', root = this.page } = functionContext;
    const name = await this.translate(productKey, translationKey);
    const toggle = root
      .getByRole('switch', { name, exact: options.exact ?? true })
      .nth(options.index ?? 0);

    await toggle.waitFor({ state: 'attached' });

    return (
      (await toggle.isChecked()) ||
      (await toggle.getAttribute('aria-checked')) === 'true' ||
      (await toggle.getAttribute('data-selected')) === 'true'
    );
  }

  /**
   * Sets a switch/toggle to a specific state.
   * @param {Object} functionContext - Translation context with targetState.
   * @param {Object} [options={}] - Optional parameters.
   */
  async setSwitchState(functionContext: PageFunctionContext, options: PageLocatorOptions = {}) {
    const {
      productKey,
      targetState,
      translationKey = 'toggle switch',
      root = this.page,
      force = true,
    } = functionContext;

    const currentState = await this.isSwitchToggled(functionContext, options);

    if (currentState !== targetState) {
      const name = await this.translate(productKey, translationKey);
      const toggle = root
        .getByRole('switch', { name, exact: options.exact ?? true })
        .nth(options.index ?? 0);

      if (targetState) {
        await toggle.check({ force });
      } else {
        await toggle.uncheck({ force });
      }

      const postState = await this.isSwitchToggled(functionContext, options);
      if (postState !== targetState) {
        throw new Error(`Switch failed to reach target state: ${targetState}`);
      }
    }
  }

  /**
   * Scrolls an element into the center of the viewport.
   * @param {Object} functionContext - Context with locator.
   */
  async scrollIntoCenter(functionContext: PageFunctionContext) {
    const { locator, index = 0 } = functionContext;

    await locator!.nth(index).evaluate((element: Element) => {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    });

    await locator!.nth(index).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Navigates through the global navigation menu to a specific page.
   * @param {Object} params - Navigation parameters.
   */
  async navigateToGlobalNavPages({
    menuName,
    submenuTabName,
    pageName,
    verticalTabName,
  }: PageNavigationParams) {
    await this.clickOnRole(
      { productKey: 'XC', translationKey: menuName },
      { elementRole: 'button', exact: false }
    );

    await this.clickOnRole(
      { productKey: 'XC', translationKey: submenuTabName },
      { elementRole: 'button' }
    );

    if (verticalTabName) {
      await this.clickOnRole(
        { productKey: 'XC', translationKey: verticalTabName },
        { elementRole: 'button' }
      );
    }

    await this.clickOnRole({ productKey: 'XC', translationKey: pageName }, { elementRole: 'link' });
  }

  /**
   * Validates that the page's visual appearance remains identical after a reload.
   * @param {Object} [clip] - Optional clip region.
   */
  async validateScreenshotEqualityOnReload(clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    await this.page.waitForLoadState('load');
    const screenshot1Buffer = await this.page.screenshot({ ...(clip && { clip }) });

    await this.page.reload();
    await this.page.waitForLoadState('load');
    const screenshot2Buffer = await this.page.screenshot({ ...(clip && { clip }) });

    const img1 = PNG.sync.read(screenshot1Buffer);
    const img2 = PNG.sync.read(screenshot2Buffer);

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height);

    expect(numDiffPixels).toBe(0);
  }

  /**
   * Clicks a link that opens a new browser tab and verifies the URL.
   * @param {Object} textContext - Translation context.
   * @param {string} [elementType='link'] - Either 'button' or 'link'.
   * @param {string} expectedUrl - The expected URL of the new page.
   * @param {Object} [options={}] - Optional parameters.
   */
  async clickOnExternalLink(
    textContext: PageTranslationContext,
    elementType: 'link' | 'button' = 'link',
    expectedUrl: string,
    options: PageLocatorOptions = {}
  ) {
    const { exact = true, index = 0 } = options;
    const name = await this.translate(
      textContext.productKey,
      textContext.translationKey,
      textContext.interpolationValues
    );

    const locator = this.page.getByRole(elementType, { name, exact }).nth(index);
    const [newPage] = await Promise.all([this.page.waitForEvent('popup'), locator.click()]);

    await expect(newPage).toHaveURL(expectedUrl);
    await newPage.close();
  }

  /**
   * Fetches the token from browser storage and sets it in ApiHelper.
   * Requires BrowserStorageHelper to be implemented.
   */
  async fetchToken() {
    if (!this.browserStorageHelper) {
      throw new Error('BrowserStorageHelper is not initialized');
    }
    if (!this.apiHelper) {
      throw new Error('ApiHelper is not initialized');
    }
    const raw = await this.browserStorageHelper.getToken(this.page);
    const token = raw.replace(/^Bearer\s+/i, '');
    this.apiHelper.setBearerToken(token);
  }

  /**
   * Fetches translations for a specific product.
   * Requires I18nHelper to be implemented.
   * @param {string} productKey - The product key (e.g., 'XC', 'ZIA', 'MA').
   * @param {string} translationUrl - The URL to fetch translations from.
   */
  async fetchProductTranslations(productKey: string, translationUrl: string) {
    if (!this.i18nHelper) {
      throw new Error('I18nHelper is not initialized');
    }
    await this.i18nHelper.fetchTranslations(this.page, productKey, translationUrl);
  }

  /**
   * Retrieves a localized string for a given key.
   * Requires I18nHelper to be implemented.
   * @param {string} productKey - The product key.
   * @param {string} translationKey - The translation key.
   * @param {Object} [interpolationValues={}] - Values for interpolation.
   * @returns {Promise<string>} The translated string.
   */
  async translate(
    productKey: string,
    translationKey: string,
    interpolationValues: Record<string, unknown> = {}
  ) {
    if (!this.i18nHelper) {
      // Fallback: return the translation key if helper is not available
      console.warn('I18nHelper not initialized, returning translation key');
      return translationKey;
    }
    const translatedValue = await this.i18nHelper.translate(
      this.page,
      productKey,
      translationKey,
      interpolationValues
    );
    return translatedValue;
  }

  /**
   * Clicks a Playwright locator.
   * @param {Locator} locator - The locator to click.
   * @param {number} [timeout=10000] - The timeout for the click action.
   */
  async clickOnElement(locator: Locator, timeout = 10000) {
    await locator.click({ timeout });
  }

  /**
   * Verifies the state of a Playwright locator.
   * @param {Locator} locator - The locator to verify.
   * @param {string} state - The expected state.
   * @param {boolean} [negate=false] - Whether to negate the assertion.
   * @param {number} [timeout=10000] - The timeout for the assertion.
   */
  async verifyState(locator: Locator, state: string, negate = false, timeout = 10000) {
    switch (state) {
      case 'enabled':
        if (negate) {
          await expect(locator).not.toBeEnabled({ timeout });
        } else {
          await expect(locator).toBeEnabled({ timeout });
        }
        break;
      case 'visible':
        if (negate) {
          await expect(locator).not.toBeVisible({ timeout });
        } else {
          await expect(locator).toBeVisible({ timeout });
        }
        break;
      case 'present':
        if (negate) {
          await expect(locator).not.toBeAttached({ timeout });
        } else {
          await expect(locator).toBeAttached({ timeout });
        }
        break;
      case 'focused':
        if (negate) {
          await expect(locator).not.toBeFocused({ timeout });
        } else {
          await expect(locator).toBeFocused({ timeout });
        }
        break;
      case 'disabled':
        if (negate) {
          await expect(locator).toBeEnabled({ timeout });
        } else {
          await expect(locator).toBeDisabled({ timeout });
        }
        break;
      case 'hidden':
        if (negate) {
          await expect(locator).toBeVisible({ timeout });
        } else {
          await expect(locator).toBeHidden({ timeout });
        }
        break;
      case 'absent':
        if (negate) {
          await expect(locator).not.toHaveCount(0, { timeout });
        } else {
          await expect(locator).toHaveCount(0, { timeout });
        }
        break;
      default:
        throw new Error(`Unsupported state requested: ${state}`);
    }
  }

  /**
   * Private helper to resolve translated text and common locator options.
   * @private
   */
  async _getTranslatedLocatorContext(
    textContext: PageTranslationContext,
    options: PageLocatorOptions = {}
  ) {
    const { root, productKey, translationKey, interpolationValues } = textContext;
    const { exact = true, index = 0, timeout = 10000, ...rest } = options;

    const name = await this.translate(productKey, translationKey, interpolationValues);
    const searchRoot = root ?? this.page;
    const locatorOptions = { exact, index, timeout, ...rest };

    return { name, searchRoot, locatorOptions };
  }

  /**
   * Private helper to retrieve a Playwright locator based on a specific strategy.
   * @private
   */
  async _getLocator(
    type: string,
    textContext: PageTranslationContext,
    options: PageLocatorOptions
  ): Promise<{
    locator: Locator;
    timeout: number | undefined;
    negate: boolean | undefined;
  }> {
    const { name, searchRoot, locatorOptions } = await this._getTranslatedLocatorContext(
      textContext,
      options
    );

    let locator: Locator;
    switch (type) {
      case 'role':
        if (!locatorOptions.elementRole) {
          throw new Error('`elementRole` must be provided in options for `getByRole`.');
        }
        locator = searchRoot.getByRole(
          locatorOptions.elementRole as
            | 'button'
            | 'link'
            | 'textbox'
            | 'checkbox'
            | 'radio'
            | 'switch',
          {
            name,
            exact: locatorOptions.exact,
          }
        );
        break;
      case 'text':
        locator = searchRoot.getByText(name, { exact: locatorOptions.exact });
        break;
      case 'label':
        locator = searchRoot.getByLabel(name, { exact: locatorOptions.exact });
        break;
      case 'title':
        locator = searchRoot.getByTitle(name, { exact: locatorOptions.exact });
        break;
      default:
        throw new Error(`Unknown locator type: ${type}`);
    }

    return {
      locator: locator.nth(locatorOptions.index ?? 0),
      timeout: locatorOptions.timeout,
      negate: locatorOptions.negate,
    };
  }
}

export { EnhancedBasePage };
