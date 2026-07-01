/**
 * Monitoring and Observability Utilities
 *
 * This module provides monitoring, metrics collection, and observability tools
 * for test execution tracking and analysis.
 *
 * @example
 * ```typescript
 * import { MetricsCollector, FlakyTestDetector, DataDogIntegration } from '@utils/monitoring';
 *
 * // Collect metrics
 * const collector = MetricsCollector.getInstance();
 * collector.recordTest({ ...testMetrics });
 *
 * // Detect flaky tests
 * const detector = new FlakyTestDetector();
 * const flakyTests = detector.detectFlakyTests(collector.getAllMetrics());
 *
 * // Send to DataDog
 * const datadog = new DataDogIntegration();
 * await datadog.sendTestMetric(testMetric);
 * ```
 *
 * @module utils/monitoring
 */

export { MetricsCollector, type TestMetrics, type SuiteMetrics } from './metrics-collector';

export {
  FlakyTestDetector,
  type FlakyTestResult,
  type FlakyDetectionConfig,
} from './flaky-test-detector';

export {
  DataDogIntegration,
  type DataDogMetric,
  type DataDogMetricType,
} from './datadog-integration';
