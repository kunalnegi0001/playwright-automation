import { logger } from '@utils/core';

/**
 * Test execution metrics
 */
export type TestMetrics = {
  /** Test name */
  testName: string;
  /** Test file path */
  testFile: string;
  /** Test status */
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  /** Execution duration in milliseconds */
  duration: number;
  /** Number of retries */
  retries: number;
  /** Browser name */
  browser: string;
  /** Environment */
  environment: string;
  /** Error message if failed */
  error?: string;
  /** Timestamp */
  timestamp: Date;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
};

/**
 * Test suite metrics aggregation
 */
export type SuiteMetrics = {
  /** Total tests executed */
  totalTests: number;
  /** Passed tests count */
  passed: number;
  /** Failed tests count */
  failed: number;
  /** Skipped tests count */
  skipped: number;
  /** Timed out tests count */
  timedOut: number;
  /** Total execution time */
  totalDuration: number;
  /** Average test duration */
  avgDuration: number;
  /** Pass rate percentage */
  passRate: number;
  /** Flaky tests (passed after retry) */
  flakyTests: number;
  /** Test suite start time */
  startTime: Date;
  /** Test suite end time */
  endTime: Date;
};

/**
 * Metrics collector for test execution monitoring
 *
 * @example
 * ```typescript
 * const collector = MetricsCollector.getInstance();
 *
 * // Record test metric
 * collector.recordTest({
 *   testName: 'login successful',
 *   testFile: 'auth.spec.ts',
 *   status: 'passed',
 *   duration: 1234,
 *   retries: 0,
 *   browser: 'chromium',
 *   environment: 'staging',
 *   timestamp: new Date(),
 * });
 *
 * // Get aggregated metrics
 * const metrics = collector.getAggregatedMetrics();
 * console.log(`Pass rate: ${metrics.passRate}%`);
 * ```
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: TestMetrics[] = [];
  private suiteStartTime: Date;

  private constructor() {
    this.suiteStartTime = new Date();
    logger.info('MetricsCollector initialized');
  }

  /**
   * Get singleton instance
   * @returns MetricsCollector instance
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a test execution metric
   * @param metric - Test metric to record
   */
  public recordTest(metric: TestMetrics): void {
    this.metrics.push(metric);
    logger.debug('Test metric recorded', {
      testName: metric.testName,
      status: metric.status,
      duration: metric.duration,
    });
  }

  /**
   * Get all recorded metrics
   * @returns Array of test metrics
   */
  public getAllMetrics(): TestMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics filtered by status
   * @param status - Test status to filter by
   * @returns Filtered test metrics
   */
  public getMetricsByStatus(status: TestMetrics['status']): TestMetrics[] {
    return this.metrics.filter(m => m.status === status);
  }

  /**
   * Get metrics for a specific test file
   * @param testFile - Test file path
   * @returns Metrics for the specified file
   */
  public getMetricsByFile(testFile: string): TestMetrics[] {
    return this.metrics.filter(m => m.testFile === testFile);
  }

  /**
   * Get metrics for a specific browser
   * @param browser - Browser name
   * @returns Metrics for the specified browser
   */
  public getMetricsByBrowser(browser: string): TestMetrics[] {
    return this.metrics.filter(m => m.browser === browser);
  }

  /**
   * Get flaky tests (tests that passed after retry)
   * @returns Array of flaky test metrics
   */
  public getFlakyTests(): TestMetrics[] {
    return this.metrics.filter(m => m.status === 'passed' && m.retries > 0);
  }

  /**
   * Get slowest tests
   * @param count - Number of slowest tests to return
   * @returns Array of slowest test metrics
   */
  public getSlowestTests(count = 10): TestMetrics[] {
    return [...this.metrics].sort((a, b) => b.duration - a.duration).slice(0, count);
  }

  /**
   * Get aggregated suite metrics
   * @returns Aggregated suite metrics
   */
  public getAggregatedMetrics(): SuiteMetrics {
    const totalTests = this.metrics.length;
    const passed = this.metrics.filter(m => m.status === 'passed').length;
    const failed = this.metrics.filter(m => m.status === 'failed').length;
    const skipped = this.metrics.filter(m => m.status === 'skipped').length;
    const timedOut = this.metrics.filter(m => m.status === 'timedOut').length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;
    const flakyTests = this.getFlakyTests().length;

    return {
      totalTests,
      passed,
      failed,
      skipped,
      timedOut,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      passRate: parseFloat(passRate.toFixed(2)),
      flakyTests,
      startTime: this.suiteStartTime,
      endTime: new Date(),
    };
  }

  /**
   * Export metrics to JSON
   * @returns JSON string of all metrics
   */
  public exportToJSON(): string {
    return JSON.stringify(
      {
        suiteMetrics: this.getAggregatedMetrics(),
        testMetrics: this.metrics,
      },
      null,
      2
    );
  }

  /**
   * Clear all collected metrics
   */
  public clear(): void {
    this.metrics = [];
    this.suiteStartTime = new Date();
    logger.info('Metrics cleared');
  }

  /**
   * Reset the singleton instance (for testing)
   */
  public static reset(): void {
    if (MetricsCollector.instance) {
      MetricsCollector.instance.clear();
    }
    MetricsCollector.instance = null as unknown as MetricsCollector;
  }
}
