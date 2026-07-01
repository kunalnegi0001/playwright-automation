/**
 * @fileoverview Test metrics tracking and analysis utility.
 * Tracks test runs, flaky tests, slow tests, and failure patterns for reporting.
 * @module reports/metrics/test-metrics
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '@utils/core';

type MetricsTestRun = {
  testName: string;
  status: string;
  duration: number;
  timestamp: string;
  retries: number;
  project?: string;
};

type MetricsFlakyTestInfo = {
  count: number;
  retries: number[];
};

type MetricsSlowTestInfo = {
  testName: string;
  duration: number;
  timestamp: string;
};

type MetricsFailureInfo = {
  testName: string;
  error?: string;
  timestamp: string;
};

type MetricsTestInfo = {
  title: string;
  status: string;
  duration: number;
  retry: number;
  project?: { name: string };
  error?: { message?: string };
};

type MetricsFlakyTestReport = {
  testName: string;
  flakyCount: number;
  avgRetries: number;
};

type MetricsFailurePatternReport = {
  errorType: string;
  count: number;
  examples: MetricsFailureInfo[];
};

type MetricsExecutionSummary = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: string | number;
  avgDuration: string | number;
  totalDuration: string;
  flakyTestsCount: number;
  slowTestsCount: number;
};

type MetricsTrendDataPoint = {
  timestamp: string;
  passed: boolean;
  duration: number;
};

type MetricsData = {
  summary: MetricsExecutionSummary;
  flakyTests: MetricsFlakyTestReport[];
  slowTests: MetricsSlowTestInfo[];
  failurePatterns: MetricsFailurePatternReport[];
  timestamp: string;
};

type Metrics = {
  testRuns: MetricsTestRun[];
  flakyTests: Map<string, MetricsFlakyTestInfo>;
  slowTests: MetricsSlowTestInfo[];
  failurePatterns: Map<string, MetricsFailureInfo[]>;
};

/**
 * Test Metrics Tracker
 * Tracks and analyzes test execution metrics including flakiness and performance
 * @class
 * @example
 * const metrics = new TestMetrics();
 * metrics.recordTestRun(testInfo);
 * const report = metrics.generateReport();
 */
export class TestMetrics {
  metrics: Metrics;
  constructor() {
    this.metrics = {
      testRuns: [],
      flakyTests: new Map<string, MetricsFlakyTestInfo>(),
      slowTests: [],
      failurePatterns: new Map<string, MetricsFailureInfo[]>(),
    };
  }

  /**
   * Record test execution
   */
  recordTestRun(testInfo: MetricsTestInfo): void {
    const run: MetricsTestRun = {
      testName: testInfo.title,
      status: testInfo.status,
      duration: testInfo.duration,
      timestamp: new Date().toISOString(),
      retries: testInfo.retry,
      project: testInfo.project?.name,
    };

    this.metrics.testRuns.push(run);

    // Track flaky tests (tests that passed after retry)
    if (testInfo.status === 'passed' && testInfo.retry > 0) {
      this.recordFlakyTest(testInfo.title, testInfo.retry);
    }

    // Track slow tests (over 30 seconds)
    if (testInfo.duration > 30000) {
      this.recordSlowTest(testInfo);
    }

    // Track failure patterns
    if (testInfo.status === 'failed') {
      this.recordFailure(testInfo);
    }
  }

  /**
   * Record flaky test
   */
  recordFlakyTest(testName: string, retryCount: number): void {
    if (!this.metrics.flakyTests.has(testName)) {
      this.metrics.flakyTests.set(testName, {
        count: 0,
        retries: [],
      });
    }

    const flakyInfo = this.metrics.flakyTests.get(testName)!;
    flakyInfo.count++;
    flakyInfo.retries.push(retryCount);
  }

  /**
   * Record slow test
   */
  recordSlowTest(testInfo: MetricsTestInfo): void {
    this.metrics.slowTests.push({
      testName: testInfo.title,
      duration: testInfo.duration,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Record test failure
   */
  recordFailure(testInfo: MetricsTestInfo): void {
    const errorType = this.categorizeError(testInfo.error);

    if (!this.metrics.failurePatterns.has(errorType)) {
      this.metrics.failurePatterns.set(errorType, []);
    }

    this.metrics.failurePatterns.get(errorType)!.push({
      testName: testInfo.title,
      error: testInfo.error?.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Categorize error type
   */
  categorizeError(error?: { message?: string }): string {
    if (!error) {
      return 'Unknown';
    }

    const message = error.message || '';

    if (message.includes('Timeout')) {
      return 'Timeout';
    }
    if (message.includes('toBeVisible')) {
      return 'Element Not Found';
    }
    if (message.includes('Network')) {
      return 'Network Error';
    }
    if (message.includes('expect')) {
      return 'Assertion Failure';
    }

    return 'Other';
  }

  /**
   * Get flaky tests report
   */
  getFlakyTestsReport(): MetricsFlakyTestReport[] {
    const report: MetricsFlakyTestReport[] = [];

    this.metrics.flakyTests.forEach((info, testName) => {
      report.push({
        testName,
        flakyCount: info.count,
        avgRetries: info.retries.reduce((a, b) => a + b, 0) / info.retries.length,
      });
    });

    return report.sort((a, b) => b.flakyCount - a.flakyCount);
  }

  /**
   * Get slow tests report
   */
  getSlowTestsReport(limit = 10): MetricsSlowTestInfo[] {
    return this.metrics.slowTests.sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  /**
   * Get failure patterns report
   */
  getFailurePatternsReport(): MetricsFailurePatternReport[] {
    const report: MetricsFailurePatternReport[] = [];

    this.metrics.failurePatterns.forEach((failures, errorType) => {
      report.push({
        errorType,
        count: failures.length,
        examples: failures.slice(0, 5), // First 5 examples
      });
    });

    return report.sort((a, b) => b.count - a.count);
  }

  /**
   * Get execution summary
   */
  getExecutionSummary(): MetricsExecutionSummary {
    const total = this.metrics.testRuns.length;
    const passed = this.metrics.testRuns.filter(r => r.status === 'passed').length;
    const failed = this.metrics.testRuns.filter(r => r.status === 'failed').length;
    const skipped = this.metrics.testRuns.filter(r => r.status === 'skipped').length;
    const totalDuration = this.metrics.testRuns.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0,
      avgDuration: total > 0 ? (totalDuration / total).toFixed(2) : 0,
      totalDuration: (totalDuration / 1000).toFixed(2), // in seconds
      flakyTestsCount: this.metrics.flakyTests.size,
      slowTestsCount: this.metrics.slowTests.length,
    };
  }

  /**
   * Get trend data (last N runs)
   */
  getTrendData(runs = 10): MetricsTrendDataPoint[] {
    const recentRuns = this.metrics.testRuns.slice(-runs);

    return recentRuns.map(run => ({
      timestamp: run.timestamp,
      passed: run.status === 'passed',
      duration: run.duration,
    }));
  }

  /**
   * Save metrics to file
   */
  async saveMetrics(filePath: string): Promise<void> {
    const data: MetricsData = {
      summary: this.getExecutionSummary(),
      flakyTests: this.getFlakyTestsReport(),
      slowTests: this.getSlowTestsReport(),
      failurePatterns: this.getFailurePatternsReport(),
      timestamp: new Date().toISOString(),
    };

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJSON(filePath, data, { spaces: 2 });
  }

  /**
   * Load metrics from file
   */
  async loadMetrics(filePath: string): Promise<MetricsData | null> {
    if (await fs.pathExists(filePath)) {
      const data = (await fs.readJSON(filePath)) as MetricsData;
      // Restore metrics from saved data
      return data;
    }
    return null;
  }

  /**
   * Generate console report
   */
  printReport(): void {
    const summary = this.getExecutionSummary();

    const metricsOutput = [
      '',
      '📊 Test Execution Metrics',
      '═'.repeat(60),
      `Total Tests:    ${summary.total}`,
      `✅ Passed:       ${summary.passed}`,
      `❌ Failed:       ${summary.failed}`,
      `⏭️  Skipped:      ${summary.skipped}`,
      `📈 Pass Rate:    ${summary.passRate}%`,
      `⏱️  Avg Duration: ${summary.avgDuration}ms`,
      `⏱️  Total Time:   ${summary.totalDuration}s`,
      '═'.repeat(60),
    ].join('\n');
    logger.info(metricsOutput);

    // Flaky tests
    if (summary.flakyTestsCount > 0) {
      const flakyOutput = [`\n⚠️  Flaky Tests Detected: ${summary.flakyTestsCount}`];
      const flakyTests = this.getFlakyTestsReport();
      flakyTests.slice(0, 5).forEach(test => {
        flakyOutput.push(
          `   - ${test.testName} (${test.flakyCount} times, avg ${test.avgRetries.toFixed(1)} retries)`
        );
      });
      logger.warn(flakyOutput.join('\n'));
    }

    // Slow tests
    if (summary.slowTestsCount > 0) {
      const slowOutput = [`\n🐌 Slow Tests: ${summary.slowTestsCount}`];
      const slowTests = this.getSlowTestsReport(5);
      slowTests.forEach(test => {
        slowOutput.push(`   - ${test.testName} (${(test.duration / 1000).toFixed(2)}s)`);
      });
      logger.warn(slowOutput.join('\n'));
    }

    // Failure patterns
    const failurePatterns = this.getFailurePatternsReport();
    if (failurePatterns.length > 0) {
      const failureOutput = ['\n❌ Failure Patterns:'];
      failurePatterns.forEach(pattern => {
        failureOutput.push(`   - ${pattern.errorType}: ${pattern.count} failures`);
      });
      logger.error(failureOutput.join('\n'));
    }

    console.log('');
  }
}
