import { logger } from '@utils/core';
import { configManager } from '@config/config.manager';
import { TestMetrics } from './metrics-collector';

/**
 * DataDog metric types
 */
export type DataDogMetricType = 'count' | 'gauge' | 'histogram' | 'distribution';

/**
 * DataDog metric data
 */
export type DataDogMetric = {
  /** Metric name */
  metric: string;
  /** Metric type */
  type: DataDogMetricType;
  /** Points (timestamp, value pairs) */
  points: Array<[number, number]>;
  /** Tags */
  tags?: string[];
  /** Host */
  host?: string;
};

/**
 * DataDog integration for test metrics monitoring
 *
 * @example
 * ```typescript
 * const datadog = new DataDogIntegration();
 *
 * // Send test metric
 * await datadog.sendTestMetric({
 *   testName: 'login',
 *   status: 'passed',
 *   duration: 1234,
 *   browser: 'chromium',
 *   environment: 'staging',
 * });
 *
 * // Send custom metric
 * await datadog.sendMetric('test.duration', 1234, {
 *   tags: ['test:login', 'browser:chromium'],
 *   type: 'histogram',
 * });
 * ```
 */
export class DataDogIntegration {
  private apiKey: string;
  private apiUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = configManager.get('monitoring.datadog.apiKey', '') || '';
    this.apiUrl =
      configManager.get('monitoring.datadog.apiUrl', '') ||
      'https://api.datadoghq.com/api/v1/series';
    this.enabled = !!configManager.get('monitoring.datadog.enabled', false);

    if (this.enabled && !this.apiKey) {
      logger.warn('DataDog integration enabled but API key not configured');
      this.enabled = false;
    }

    logger.info('DataDog integration initialized', { enabled: this.enabled });
  }

  /**
   * Send a test execution metric to DataDog
   * @param metric - Test metric to send
   */
  public async sendTestMetric(metric: TestMetrics): Promise<void> {
    if (!this.enabled) {
      logger.debug('DataDog integration disabled, skipping metric');
      return;
    }

    const tags = [
      `test:${metric.testName}`,
      `status:${metric.status}`,
      `browser:${metric.browser}`,
      `environment:${metric.environment}`,
      `file:${metric.testFile}`,
    ];

    try {
      // Send test duration
      await this.sendMetric('test.duration', metric.duration, {
        tags,
        type: 'histogram',
      });

      // Send test status (1 for passed, 0 for failed)
      await this.sendMetric('test.status', metric.status === 'passed' ? 1 : 0, {
        tags,
        type: 'gauge',
      });

      // Send retry count
      if (metric.retries > 0) {
        await this.sendMetric('test.retries', metric.retries, {
          tags,
          type: 'count',
        });
      }

      logger.debug('Test metric sent to DataDog', { testName: metric.testName });
    } catch (error) {
      logger.error('Failed to send test metric to DataDog', error);
    }
  }

  /**
   * Send a custom metric to DataDog
   * @param name - Metric name
   * @param value - Metric value
   * @param options - Additional options
   */
  public async sendMetric(
    name: string,
    value: number,
    options: {
      tags?: string[];
      type?: DataDogMetricType;
      timestamp?: number;
      host?: string;
    } = {}
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const timestamp = options.timestamp || Math.floor(Date.now() / 1000);
    const metricData: DataDogMetric = {
      metric: `playwright.${name}`,
      type: options.type || 'gauge',
      points: [[timestamp, value]],
      tags: options.tags,
      host: options.host,
    };

    try {
      // In production, this would make an actual HTTP request
      // For now, this is a placeholder implementation
      logger.debug('DataDog metric prepared', { metricData, apiUrl: this.apiUrl });

      // TODO: Uncomment when DataDog is fully configured
      // await fetch(this.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'DD-API-KEY': this.apiKey,
      //   },
      //   body: JSON.stringify({ series: [metricData] }),
      // });
    } catch (error) {
      logger.error('Failed to send metric to DataDog', { name, error });
    }
  }

  /**
   * Send batch metrics to DataDog
   * @param metrics - Array of metrics to send
   */
  public async sendBatchMetrics(metrics: DataDogMetric[]): Promise<void> {
    if (!this.enabled || metrics.length === 0) {
      return;
    }

    try {
      logger.debug('Sending batch metrics to DataDog', { count: metrics.length });

      // TODO: Uncomment when DataDog is fully configured
      // await fetch(this.apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'DD-API-KEY': this.apiKey,
      //   },
      //   body: JSON.stringify({ series: metrics }),
      // });
    } catch (error) {
      logger.error('Failed to send batch metrics to DataDog', error);
    }
  }

  /**
   * Check if DataDog integration is enabled
   * @returns True if enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}
