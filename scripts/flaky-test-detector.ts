#!/usr/bin/env node

/**
 * @fileoverview Flaky test detector for identifying inconsistent test results.
 * Analyzes test result history to find tests with low pass rates.
 * @module scripts/flaky-test-detector
 *
 * Flaky Test Detector
 *
 * Analyzes test results history to identify flaky tests
 * (tests that pass/fail inconsistently across runs)
 *
 * Usage:
 *   node scripts/flaky-test-detector.js
 *   npm run test:flaky-report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.join(__dirname, '../test-results');
const THRESHOLD = 0.8; // Tests passing < 80% are considered flaky

/**
 * Test result type
 */
export type FTTestResult = {
  /** Test name including suite hierarchy */
  name: string;
  /** Test execution status */
  status: 'passed' | 'failed' | 'skipped';
  /** Test duration in milliseconds */
  duration: number;
  /** ISO timestamp of test execution */
  timestamp: string;
};

/**
 * Flaky test summary type
 */
export type FTFlakyTest = {
  /** Test name including suite hierarchy */
  name: string;
  /** Total number of test runs */
  runs: number;
  /** Number of passed runs */
  passed: number;
  /** Number of failed runs */
  failed: number;
  /** Pass rate as decimal (0-1) */
  passRate: number;
  /** Average duration across all runs in milliseconds */
  avgDuration: number;
  /** ISO timestamp of most recent failure */
  lastFailure: string;
};

/**
 * Playwright test spec type
 */
export type FlakyTestSpec = {
  /** Test title */
  title: string;
  /** Whether test passed */
  ok: boolean;
  /** Array of test attempts */
  tests: Array<{
    /** Array of test results */
    results: Array<{
      /** Test duration in milliseconds */
      duration: number;
    }>;
  }>;
};

/**
 * Playwright test suite type
 */
export type FlakyTestSuite = {
  /** Suite title */
  title: string;
  /** Array of test specs in suite */
  specs?: FlakyTestSpec[];
  /** Array of nested suites */
  suites?: FlakyTestSuite[];
};

/**
 * Playwright test data structure
 */
export type FlakyTestData = {
  /** Top-level test suites */
  suites: FlakyTestSuite[];
};

/**
 * Analyzes test results from all test runs and builds a history map
 * Scans the test-results directory recursively for results.json files,
 * parses them, and builds a comprehensive history of all test executions
 * @returns Map of test names to their result history
 * @example
 * const history = analyzeTestResults();
 * console.log(`Analyzed ${history.size} tests`);
 */
export const analyzeTestResults = (): Map<string, FTTestResult[]> => {
  const testHistory = new Map<string, FTTestResult[]>();

  if (!fs.existsSync(RESULTS_DIR)) {
    return testHistory;
  }

  const walk = (dir: string) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file === 'results.json') {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const data = JSON.parse(content) as FlakyTestData;

          if (data.suites) {
            extractTests(data.suites, testHistory, stat.mtime);
          }
        } catch {
          // Skip invalid JSON files
        }
      }
    });
  };

  walk(RESULTS_DIR);
  return testHistory;
};

/**
 * Recursively extracts test results from test suite hierarchy
 * Traverses the nested suite structure and extracts individual test results,
 * adding them to the history map with full test names including suite hierarchy
 * @param suites - Array of test suites to process
 * @param history - Map to store test results
 * @param timestamp - Timestamp of the test run
 * @example
 * extractTests(data.suites, testHistory, new Date());
 */
export const extractTests = (
  suites: FlakyTestSuite[],
  history: Map<string, FTTestResult[]>,
  timestamp: Date
): void => {
  suites.forEach(suite => {
    if (suite.specs) {
      suite.specs.forEach((spec: FlakyTestSpec) => {
        const testName = `${suite.title} > ${spec.title}`;
        const result: FTTestResult = {
          name: testName,
          status: spec.ok ? 'passed' : 'failed',
          duration: spec.tests[0]?.results[0]?.duration || 0,
          timestamp: timestamp.toISOString(),
        };

        if (!history.has(testName)) {
          history.set(testName, []);
        }
        history.get(testName)!.push(result);
      });
    }

    if (suite.suites) {
      extractTests(suite.suites, history, timestamp);
    }
  });
};

/**
 * Identifies flaky tests based on pass rate threshold
 * Analyzes test history to find tests with pass rate below 80% threshold,
 * requiring at least 2 runs to qualify as potentially flaky
 * @param history - Map of test names to their result history
 * @returns Array of flaky tests sorted by pass rate (lowest first)
 * @example
 * const flakyTests = identifyFlakyTests(testHistory);
 * console.log(`Found ${flakyTests.length} flaky tests`);
 */
export const identifyFlakyTests = (history: Map<string, FTTestResult[]>): FTFlakyTest[] => {
  const flakyTests: FTFlakyTest[] = [];

  history.forEach((results, name) => {
    if (results.length < 2) {
      return; // Need at least 2 runs
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const passRate = passed / (passed + failed);

    if (passRate < THRESHOLD && passRate > 0) {
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const lastFailure =
        results
          .filter(r => r.status === 'failed')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          ?.timestamp || '';

      flakyTests.push({
        name,
        runs: passed + failed,
        passed,
        failed,
        passRate,
        avgDuration,
        lastFailure,
      });
    }
  });

  return flakyTests.sort((a, b) => a.passRate - b.passRate);
};

/**
 * Generates a console report of flaky tests with recommendations
 * Prints detailed information about each flaky test including pass rate,
 * duration statistics, and actionable recommendations for fixing flaky tests
 * @param flakyTests - Array of flaky tests to report
 * @example
 * generateReport(flakyTests);
 */
export const generateReport = (flakyTests: FTFlakyTest[]): void => {
  console.log('\n🔍 Flaky Test Analysis Report');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (flakyTests.length === 0) {
    console.log('✅ No flaky tests detected!');
    console.log('All tests have a pass rate >= 80% or < 2 runs\n');
    return;
  }

  console.log(`Found ${flakyTests.length} flaky test(s):\n`);

  flakyTests.forEach((test, index) => {
    const passRatePercent = (test.passRate * 100).toFixed(1);
    const status = test.passRate < 0.5 ? '🔴' : test.passRate < 0.7 ? '🟠' : '🟡';

    console.log(`${index + 1}. ${status} ${test.name}`);
    console.log(`   Pass Rate: ${passRatePercent}% (${test.passed}/${test.runs} runs)`);
    console.log(`   Avg Duration: ${test.avgDuration.toFixed(0)}ms`);
    console.log(`   Last Failure: ${new Date(test.lastFailure).toLocaleString()}`);
    console.log('');
  });

  console.log('\n💡 Recommendations:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('1. Review flaky tests for timing issues or race conditions');
  console.log('2. Add explicit waits (waitForSelector, waitForLoadState)');
  console.log('3. Check for dynamic selectors or unstable elements');
  console.log('4. Consider increasing timeouts for slow operations');
  console.log('5. Use test retries strategically: test.describe.configure({ retries: 2 })');
  console.log('');
};

/**
 * Generates a JSON report file of flaky tests
 * Creates a timestamped JSON file containing all flaky test data
 * for further analysis or integration with CI/CD pipelines
 * @param flakyTests - Array of flaky tests to include in report
 * @example
 * generateJSONReport(flakyTests);
 */
export const generateJSONReport = (flakyTests: FTFlakyTest[]): void => {
  const report = {
    timestamp: new Date().toISOString(),
    threshold: THRESHOLD,
    totalFlaky: flakyTests.length,
    tests: flakyTests,
  };

  const outputPath = path.join(__dirname, '../flaky-tests-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report saved: ${outputPath}\n`);
};

/**
 * Main entry point for flaky test detector
 * Orchestrates the complete flaky test detection workflow:
 * 1. Analyzes test results history
 * 2. Identifies flaky tests
 * 3. Generates console and JSON reports
 * @example
 * main();
 */
export const main = (): void => {
  console.log('🔍 Analyzing test results for flaky tests...\n');

  const history = analyzeTestResults();

  if (history.size === 0) {
    console.log('⚠️  No test results found in test-results/ directory');
    console.log('   Run tests first to generate results\n');
    return;
  }

  console.log(`Analyzed ${history.size} unique test(s)`);

  const flakyTests = identifyFlakyTests(history);

  generateReport(flakyTests);

  if (flakyTests.length > 0) {
    generateJSONReport(flakyTests);
  }
};

main();
