/**
 * @fileoverview XSS (Cross-Site Scripting) security testing utilities.
 * Provides payload injection, detection, and output sanitization for XSS testing.
 * @module validation-transform/security/xss.helper
 */

/**
 * Common XSS (Cross-Site Scripting) attack payloads for testing
 * @constant {Array<string>}
 */
export const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '" onmouseover="alert(1)"',
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  'javascript:alert(1)',
];

/**
 * Inject an XSS payload into an input field
 * @param page - Playwright page object
 * @param selector - CSS/XPath selector for the input field
 * @param payload - XSS payload to inject
 * @returns Promise that resolves when payload is injected
 * @example
 * await injectXssPayload(page, '#searchInput', '<script>alert(1)</script>');
 */
export const injectXssPayload = async (
  page: { fill: (selector: string, value: string) => Promise<void> },
  selector: string,
  payload: string
): Promise<void> => {
  await page.fill(selector, payload);
};

/**
 * Test an input field against multiple XSS payloads
 * @param page - Playwright page object
 * @param selector - CSS/XPath selector for the input field
 * @param submitSelector - Optional selector for submit button
 * @param payloads - Array of XSS payloads to test (default: XSS_PAYLOADS)
 * @returns Promise resolving to array of test results
 * @example
 * const results = await testXssField(page, '#comment', '#submit');
 * const allSafe = results.every(r => r.safe);
 */
export const testXssField = async (
  page: {
    fill: (selector: string, value: string) => Promise<void>;
    click: (selector: string) => Promise<void>;
    content: () => Promise<string>;
  },
  selector: string,
  submitSelector: string | undefined,
  payloads: string[] = XSS_PAYLOADS
): Promise<Array<{ payload: string; safe: boolean }>> => {
  const results: Array<{ payload: string; safe: boolean }> = [];
  for (const payload of payloads) {
    await injectXssPayload(page, selector, payload);
    if (submitSelector) {
      await page.click(submitSelector);
    }
    const reflected = await page.content();
    const unsafe = reflected.includes(payload);
    results.push({ payload, safe: !unsafe });
  }
  return results;
};

/**
 * Detect inline script execution attempts (monitors for alert dialogs)
 * @param page - Playwright page object
 * @returns Promise resolving to array of dialog messages captured
 * @example
 * const logs = await detectInlineScriptExecution(page);
 * // Returns array like: ['dialog:1'] if alert(1) was executed
 */
export const detectInlineScriptExecution = async (page: {
  on: (event: string, callback: (dialog: { message: () => string }) => void) => void;
}): Promise<string[]> => {
  const logs: string[] = [];
  page.on('dialog', (d: { message: () => string }) => logs.push(`dialog:${d.message()}`));
  return logs;
};

/**
 * Validate that output is properly escaped (no raw HTML/script tags)
 * @param value - Value to check for XSS vulnerabilities
 * @returns Validation result object
 * @example
 * const result = validateOutputEscaped(userInput);
 * if (!result.passed) {
 *   console.error('Unsafe output detected!');
 * }
 */
export const validateOutputEscaped = (value: string): { passed: boolean; hasRawTag: boolean } => {
  const hasRawTag = /<script|onerror=|onload=|javascript:/i.test(String(value));
  return { passed: !hasRawTag, hasRawTag };
};

/**
 * Sanitize user input for safe output (HTML entity encoding)
 * @param value - Value to sanitize
 * @returns Sanitized value with HTML entities encoded
 * @example
 * const safe = sanitizeForOutput('<script>alert(1)</script>');
 * // Returns: '&lt;script&gt;alert(1)&lt;/script&gt;'
 */
export const sanitizeForOutput = (value: string): string => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
