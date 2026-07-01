import fs from 'fs-extra';
import path from 'path';

/**
 * Test Metrics Tracker
 * Tracks and analyzes test execution metrics
 */

export class TestMetrics {
  constructor() {
    this.metrics = {
      testRuns: [],
      flakyTests: new Map(),
      slowTests: [],
      failurePatterns: new Map(),
    };
  }

  /**
   * Record test execution
   */
  recordTestRun(testInfo) {
    const run = {
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
  recordFlakyTest(testName, retryCount) {
    if (!this.metrics.flakyTests.has(testName)) {
      this.metrics.flakyTests.set(testName, {
        count: 0,
        retries: [],
      });
    }

    const flakyInfo = this.metrics.flakyTests.get(testName);
    flakyInfo.count++;
    flakyInfo.retries.push(retryCount);
  }

  /**
   * Record slow test
   */
  recordSlowTest(testInfo) {
    this.metrics.slowTests.push({
      testName: testInfo.title,
      duration: testInfo.duration,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Record test failure
   */
  recordFailure(testInfo) {
    const errorType = this.categorizeError(testInfo.error);

    if (!this.metrics.failurePatterns.has(errorType)) {
      this.metrics.failurePatterns.set(errorType, []);
    }

    this.metrics.failurePatterns.get(errorType).push({
      testName: testInfo.title,
      error: testInfo.error?.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Categorize error type
   */
  categorizeError(error) {
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
  getFlakyTestsReport() {
    const report = [];

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
  getSlowTestsReport(limit = 10) {
    return this.metrics.slowTests.sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  /**
   * Get failure patterns report
   */
  getFailurePatternsReport() {
    const report = [];

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
  getExecutionSummary() {
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
  getTrendData(runs = 10) {
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
  async saveMetrics(filePath) {
    const data = {
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
  async loadMetrics(filePath) {
    if (await fs.pathExists(filePath)) {
      const data = await fs.readJSON(filePath);
      // Restore metrics from saved data
      return data;
    }
    return null;
  }

  /**
   * Generate console report
   */
  printReport() {
    const summary = this.getExecutionSummary();

    console.log('\n📊 Test Execution Metrics');
    console.log('═'.repeat(60));
    console.log(`Total Tests:    ${summary.total}`);
    console.log(`✅ Passed:       ${summary.passed}`);
    console.log(`❌ Failed:       ${summary.failed}`);
    console.log(`⏭️  Skipped:      ${summary.skipped}`);
    console.log(`📈 Pass Rate:    ${summary.passRate}%`);
    console.log(`⏱️  Avg Duration: ${summary.avgDuration}ms`);
    console.log(`⏱️  Total Time:   ${summary.totalDuration}s`);
    console.log('═'.repeat(60));

    // Flaky tests
    if (summary.flakyTestsCount > 0) {
      console.log(`\n⚠️  Flaky Tests Detected: ${summary.flakyTestsCount}`);
      const flakyTests = this.getFlakyTestsReport();
      flakyTests.slice(0, 5).forEach(test => {
        console.log(
          `   - ${test.testName} (${test.flakyCount} times, avg ${test.avgRetries.toFixed(1)} retries)`
        );
      });
    }

    // Slow tests
    if (summary.slowTestsCount > 0) {
      console.log(`\n🐌 Slow Tests: ${summary.slowTestsCount}`);
      const slowTests = this.getSlowTestsReport(5);
      slowTests.forEach(test => {
        console.log(`   - ${test.testName} (${(test.duration / 1000).toFixed(2)}s)`);
      });
    }

    // Failure patterns
    const failurePatterns = this.getFailurePatternsReport();
    if (failurePatterns.length > 0) {
      console.log('\n❌ Failure Patterns:');
      failurePatterns.forEach(pattern => {
        console.log(`   - ${pattern.errorType}: ${pattern.count} failures`);
      });
    }

    console.log('');
  }
}
