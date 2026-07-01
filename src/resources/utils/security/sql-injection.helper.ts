/**
 * @fileoverview SQL injection security testing utilities.
 * Provides payload injection, vulnerability detection, and parameterized query helpers.
 * @module validation-transform/security/sql-injection.helper
 */

/**
 * Common SQL injection attack payloads for testing
 * @constant {Array<string>}
 */
export const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "'; DROP TABLE users; --",
  "' UNION SELECT null,null --",
  "admin' --",
];

/**
 * Detect SQL error signatures in response text
 * @param text - Response text or HTML content (default: '')
 * @returns True if SQL error patterns detected
 * @example
 * const hasError = detectSqlErrorSignatures(response);
 * if (hasError) console.error('SQL injection vulnerability detected!');
 */
export const detectSqlErrorSignatures = (text = '') => {
  const patterns = [/sql syntax/i, /mysql/i, /postgresql/i, /sqlite/i, /odbc/i, /ora-\d+/i];
  return patterns.some(p => p.test(text));
};

/**
 * Test an input field against multiple SQL injection payloads
 * @param page - Playwright page object
 * @param selector - CSS/XPath selector for the input field
 * @param submitSelector - Optional selector for submit button
 * @param payloads - SQL injection payloads to test (default: SQLI_PAYLOADS)
 * @returns Promise resolving to array of test results
 * @example
 * const results = await testSqlInjectionField(page, '#username', '#login');
 * const vulnerable = results.some(r => r.vulnerable);
 */
export const testSqlInjectionField = async (
  page: {
    fill: (selector: string, value: string) => Promise<void>;
    click: (selector: string) => Promise<void>;
    content: () => Promise<string>;
  },
  selector: string,
  submitSelector?: string,
  payloads: string[] = SQLI_PAYLOADS
): Promise<Array<{ payload: string; vulnerable: boolean }>> => {
  const results: Array<{ payload: string; vulnerable: boolean }> = [];
  for (const payload of payloads) {
    await page.fill(selector, payload);
    if (submitSelector) {
      await page.click(submitSelector);
    }
    const content = await page.content();
    results.push({ payload, vulnerable: detectSqlErrorSignatures(content) });
  }
  return results;
};

/**
 * Sanitize SQL parameter by escaping single quotes
 * @param value - Value to sanitize
 * @returns Sanitized value with escaped quotes
 * @example
 * const safe = sanitizeSqlParam("O'Brien");
 * // Returns: "O''Brien"
 */
export const sanitizeSqlParam = (value: string | number | boolean | null | undefined): string => {
  return String(value).replace(/'/g, "''");
};

/**
 * Build parameterized query structure (use with prepared statements)
 * @param baseQuery - SQL query with placeholders
 * @param params - Array of parameter values (default: [])
 * @returns Query object for parameterized execution
 * @example
 * const query = buildParameterizedQuery(
 *   'SELECT * FROM users WHERE email = $1 AND status = $2',
 *   ['user@example.com', 'active']
 * );
 */
export const buildParameterizedQuery = (
  baseQuery: string,
  params: unknown[] = []
): { query: string; params: unknown[] } => {
  return { query: baseQuery, params };
};
