import { logger } from '@utils/core';
import { TestMetrics } from './metrics-collector';

/**
 * Flaky test detection result
 */
export type FlakyTestResult = {
  /** Test name */
  testName: string;
  /** Test file path */
  testFile: string;
  /** Number of executions */
  executions: number;
  /** Number of failures */
  failures: number;
  /** Failure rate */
  failureRate: number;
  /** Is flaky (based on threshold) */
  isFlaky: boolean;
  /** Last failure timestamp */
  lastFailure?: Date;
  /** Browsers where test failed */
  failedBrowsers: string[];
};

/**
 * Flaky test detection configuration
 */
export type FlakyDetectionConfig = {
  /** Minimum executions required for analysis */
  minExecutions: number;
  /** Failure rate threshold (0.0-1.0) */
  failureRateThreshold: number;
  /** Time window in days for analysis */
  timeWindowDays: number;
};

/**
 * Default flaky detection configuration
 */
const DEFAULT_CONFIG: FlakyDetectionConfig = {
  minExecutions: 5, // At least 5 runs
  failureRateThreshold: 0.3, // 30% failure rate = flaky
  timeWindowDays: 7, // Look at last 7 days
};

/**
 * Detector for identifying flaky tests using statistical analysis
 *
 * A flaky test is one that sometimes passes and sometimes fails without
 * code changes. This detector analyzes test execution history to identify
 * such tests based on failure patterns.
 *
 * @example
 * ```typescript
 * const detector = new FlakyTestDetector();
 *
 * // Analyze metrics
 * const flakyTests = detector.detectFlakyTests(metrics);
 *
 * // Log flaky tests
 * flakyTests.forEach(test => {
 *   console.log(`Flaky: ${test.testName} (${test.failureRate}% failure rate)`);
 * });
 * ```
 */
export class FlakyTestDetector {
  private config: FlakyDetectionConfig;

  /**
   * Create a new flaky test detector
   * @param config - Detection configuration (optional)
   */
  constructor(config: Partial<FlakyDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('FlakyTestDetector initialized', this.config);
  }

  /**
   * Detect flaky tests from test metrics
   * @param metrics - Array of test metrics to analyze
   * @returns Array of flaky test results
   */
  public detectFlakyTests(metrics: TestMetrics[]): FlakyTestResult[] {
    const filteredMetrics = this.filterMetricsByTimeWindow(metrics);
    const groupedMetrics = this.groupMetricsByTest(filteredMetrics);

    const results: FlakyTestResult[] = [];

    for (const [testKey, testMetrics] of groupedMetrics.entries()) {
      const result = this.analyzeTest(testKey, testMetrics);

      if (result.isFlaky) {
        results.push(result);
        logger.warn('Flaky test detected', {
          testName: result.testName,
          failureRate: result.failureRate,
          executions: result.executions,
        });
      }
    }

    return results.sort((a, b) => b.failureRate - a.failureRate);
  }

  /**
   * Filter metrics within the configured time window
   * @param metrics - Test metrics
   * @returns Filtered metrics
   */
  private filterMetricsByTimeWindow(metrics: TestMetrics[]): TestMetrics[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.timeWindowDays);

    return metrics.filter(m => m.timestamp >= cutoffDate);
  }

  /**
   * Group metrics by test (testFile + testName)
   * @param metrics - Test metrics
   * @returns Map of test key to metrics
   */
  private groupMetricsByTest(metrics: TestMetrics[]): Map<string, TestMetrics[]> {
    const grouped = new Map<string, TestMetrics[]>();

    for (const metric of metrics) {
      const key = `${metric.testFile}::${metric.testName}`;
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, metric]);
    }

    return grouped;
  }

  /**
   * Analyze a single test for flakiness
   * @param testKey - Test key (file::name)
   * @param metrics - Metrics for this test
   * @returns Flaky test result
   */
  private analyzeTest(testKey: string, metrics: TestMetrics[]): FlakyTestResult {
    const [testFile, testName] = testKey.split('::');

    const executions = metrics.length;
    const failures = metrics.filter(m => m.status === 'failed' || m.status === 'timedOut').length;
    const failureRate = executions > 0 ? (failures / executions) * 100 : 0;

    // Test is flaky if:
    // 1. Has minimum number of executions
    // 2. Failure rate is above threshold BUT not 0% or 100%
    const isFlaky =
      executions >= this.config.minExecutions &&
      failureRate > 0 &&
      failureRate < 100 &&
      failureRate >= this.config.failureRateThreshold * 100;

    const failedMetrics = metrics.filter(m => m.status === 'failed' || m.status === 'timedOut');
    const lastFailure =
      failedMetrics.length > 0 ? failedMetrics[failedMetrics.length - 1].timestamp : undefined;

    const failedBrowsers = [...new Set(failedMetrics.map(m => m.browser))];

    return {
      testName,
      testFile,
      executions,
      failures,
      failureRate: parseFloat(failureRate.toFixed(2)),
      isFlaky,
      lastFailure,
      failedBrowsers,
    };
  }

  /**
   * Generate a flaky test report
   * @param flakyTests - Array of flaky test results
   * @returns Formatted report string
   */
  public generateReport(flakyTests: FlakyTestResult[]): string {
    if (flakyTests.length === 0) {
      return '✅ No flaky tests detected!';
    }

    const lines = [
      '⚠️  Flaky Tests Report',
      '='.repeat(80),
      `Total flaky tests: ${flakyTests.length}`,
      '',
    ];

    flakyTests.forEach((test, index) => {
      lines.push(`${index + 1}. ${test.testName}`);
      lines.push(`   File: ${test.testFile}`);
      lines.push(`   Failure Rate: ${test.failureRate}% (${test.failures}/${test.executions})`);
      lines.push(`   Failed Browsers: ${test.failedBrowsers.join(', ')}`);
      if (test.lastFailure) {
        lines.push(`   Last Failure: ${test.lastFailure.toISOString()}`);
      }
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export flaky tests to JSON
   * @param flakyTests - Array of flaky test results
   * @returns JSON string
   */
  public exportToJSON(flakyTests: FlakyTestResult[]): string {
    return JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalFlakyTests: flakyTests.length,
        config: this.config,
        flakyTests,
      },
      null,
      2
    );
  }
}
