/**
 * @fileoverview API performance testing and measurement utilities.
 * Measures response times, throughput, TTFB, and provides statistical analysis.
 * @module api-testing/rest/performance.helper
 */

import { logger } from '@utils/core';

/**
 * Timing information for API request execution
 */
export type APIPerformanceTimingInfo = {
  /** Duration in milliseconds (high precision) */
  duration: number;
  /** Duration in milliseconds (timestamp precision) */
  durationMs: number;
  /** Start timestamp in milliseconds */
  startTime: number;
  /** End timestamp in milliseconds */
  endTime: number;
  /** ISO string of start time */
  startTimestamp: string;
  /** ISO string of end time */
  endTimestamp: string;
};

/**
 * Detailed performance metrics for API requests
 */
export type APIPerformanceDetailedMetrics = {
  /** Time to first byte in milliseconds */
  ttfb: number;
  /** Time to download response body in milliseconds */
  downloadTime: number;
  /** Total request time in milliseconds */
  totalTime: number;
  /** Response body size in bytes */
  responseSize: number;
  /** Download throughput in KB/s */
  throughput: number;
};

/**
 * Statistical analysis of performance test results
 */
export type APIPerformanceStats = {
  /** Number of test iterations performed */
  iterations: number;
  /** Array of all timing measurements */
  timings: number[];
  /** Average response time */
  avg: number;
  /** Minimum response time */
  min: number;
  /** Maximum response time */
  max: number;
  /** Median response time */
  median: number;
  /** 95th percentile response time */
  p95: number;
  /** 99th percentile response time */
  p99: number;
  /** Standard deviation of response times */
  stdDev: number;
};

/**
 * Result of response time validation
 */
export type APIPerformanceValidationResult = {
  /** Whether response time meets threshold */
  valid: boolean;
  /** Actual response duration in milliseconds */
  duration: number | null;
  /** Threshold value in milliseconds */
  threshold: number;
  /** Difference from threshold (positive if exceeded) */
  difference?: number;
  /** Validation result message */
  message: string;
};

/**
 * Throughput test metrics
 */
export type APIPerformanceThroughputMetrics = {
  /** Actual test duration in seconds */
  duration: number;
  /** Total number of requests sent */
  totalRequests: number;
  /** Number of successful requests */
  successfulRequests: number;
  /** Number of failed requests */
  failedRequests: number;
  /** Average requests per second */
  requestsPerSecond: number;
  /** Success rate percentage */
  successRate: number;
};

/**
 * Phase results for load testing
 */
export type APIPerformancePhaseResults = {
  /** Total number of requests in phase */
  totalRequests: number;
  /** Number of successful requests in phase */
  successfulRequests: number;
  /** Number of failed requests in phase */
  failedRequests: number;
  /** Array of response times in milliseconds */
  responseTimes: number[];
};

/**
 * Load test phase with user information
 */
export type APIPerformanceLoadTestPhase = APIPerformancePhaseResults & {
  /** Number of concurrent users */
  users: number;
  /** Phase name (e.g., 'ramp-up', 'sustained') */
  phase?: string;
};

/**
 * Complete load test results with statistics
 */
export type APIPerformanceLoadTestResults = APIPerformancePhaseResults & {
  /** Array of individual phase results */
  phases: APIPerformanceLoadTestPhase[];
  /** Average response time across all requests */
  avgResponseTime?: number;
  /** Minimum response time */
  minResponseTime?: number;
  /** Maximum response time */
  maxResponseTime?: number;
  /** 95th percentile response time */
  p95ResponseTime?: number;
  /** Overall success rate percentage */
  successRate?: number;
};

/**
 * Result of performance comparison between two endpoints
 */
export type APIPerformanceComparisonResult = {
  /** Performance statistics for first endpoint */
  endpoint1: APIPerformanceStats;
  /** Performance statistics for second endpoint */
  endpoint2: APIPerformanceStats;
  /** Which endpoint performed better */
  faster: 'endpoint1' | 'endpoint2';
  /** Absolute difference in milliseconds */
  differenceMs: number;
  /** Percentage difference */
  differencePercent: number;
};

/**
 * @fileoverview API performance testing helpers
 * Provides utilities for measuring and validating API performance metrics
 * @module performance.helper
 */

/**
 * Measure API response time
 * @param {Function} requestFn - Function that returns a promise
 * @returns {Promise<Object>} Response with timing information
 * @example
 * const result = await measureResponseTime(() => fetch('/api/data'));
 * console.log(result.timing.duration); // Response time in ms
 */
export const measureResponseTime = async (
  requestFn: () => Promise<unknown>
): Promise<{ response: unknown; timing: APIPerformanceTimingInfo }> => {
  const startTime = performance.now();
  const startTimeMs = Date.now();

  try {
    const response = await requestFn();
    const endTime = performance.now();
    const endTimeMs = Date.now();

    const timing = {
      duration: Math.round(endTime - startTime),
      durationMs: endTimeMs - startTimeMs,
      startTime: startTimeMs,
      endTime: endTimeMs,
      startTimestamp: new Date(startTimeMs).toISOString(),
      endTimestamp: new Date(endTimeMs).toISOString(),
    };

    logger.info(`Response time: ${timing.duration}ms`);
    return { response, timing };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Request failed after ${duration}ms: ${errorMessage}`);
    throw error;
  }
};

/**
 * Measure multiple request metrics (TTFB, download time, total time)
 * @param {Function} requestFn - Function that returns a Response object
 * @returns {Promise<Object>} Detailed performance metrics
 * @example
 * const metrics = await measureDetailedMetrics(() => fetch('/api/large-data'));
 * console.log(metrics.ttfb, metrics.downloadTime, metrics.totalTime);
 */
export const measureDetailedMetrics = async (
  requestFn: () => Promise<Response>
): Promise<{ response: Response; metrics: APIPerformanceDetailedMetrics }> => {
  const startTime = performance.now();
  let ttfbTime = null;

  try {
    const response = await requestFn();
    ttfbTime = performance.now();

    // Clone response to measure download time
    const clonedResponse = response.clone();
    const body = await clonedResponse.text();
    const endTime = performance.now();

    const metrics = {
      ttfb: Math.round(ttfbTime - startTime), // Time to first byte
      downloadTime: Math.round(endTime - ttfbTime),
      totalTime: Math.round(endTime - startTime),
      responseSize: body.length,
      throughput: Math.round(body.length / ((endTime - startTime) / 1000) / 1024), // KB/s
    };

    logger.info(
      `TTFB: ${metrics.ttfb}ms, Download: ${metrics.downloadTime}ms, Total: ${metrics.totalTime}ms`
    );
    return { response, metrics };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to measure detailed metrics: ${errorMessage}`);
    throw error;
  }
};

/**
 * Run performance test with multiple iterations and calculate statistics
 * @param requestFn - Function that returns a promise (the API request)
 * @param options - Test configuration options
 * @param options.iterations - Number of test iterations (default: 10)
 * @param options.delayBetween - Delay between iterations in ms (default: 100)
 * @param options.warmup - Run warmup iteration before test (default: true)
 * @returns Promise resolving to aggregated performance statistics
 * @throws {Error} When performance test fails
 * @example
 * const stats = await runPerformanceTest(
 *   () => fetch('/api/data'),
 *   { iterations: 100, delayBetween: 50 }
 * );
 * console.log(stats.avg, stats.min, stats.max, stats.p95);
 */
export const runPerformanceTest = async (
  requestFn: () => Promise<unknown>,
  options: { iterations?: number; delayBetween?: number; warmup?: boolean } = {}
): Promise<APIPerformanceStats> => {
  const { iterations = 10, delayBetween = 100, warmup = true } = options;

  try {
    const timings = [];

    // Warmup iteration
    if (warmup) {
      logger.info('Running warmup iteration...');
      await requestFn();
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }

    // Actual test iterations
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await requestFn();
      const endTime = performance.now();
      timings.push(Math.round(endTime - startTime));

      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      }
    }

    // Calculate statistics
    const sorted = [...(timings as number[])].sort((a, b) => a - b) as number[];
    const sum = (timings as number[]).reduce((a, b) => a + b, 0) as number;
    const avg = Math.round(sum / timings.length) as number;
    const min = (sorted as number[])[0] as number;
    const max = (sorted as number[])[sorted.length - 1] as number;
    const median = (sorted as number[])[Math.floor(sorted.length / 2)] as number;
    const p95 = (sorted as number[])[Math.floor(sorted.length * 0.95)] as number;
    const p99 = (sorted as number[])[Math.floor(sorted.length * 0.99)] as number;

    const stats = {
      iterations,
      timings: timings as number[],
      avg: avg as number,
      min: min as number,
      max: max as number,
      median: median as number,
      p95: p95 as number,
      p99: p99 as number,
      stdDev: Math.round(
        Math.sqrt(
          timings.map(t => Math.pow(t - avg, 2)).reduce((a, b) => a + b, 0) / timings.length
        )
      ),
    };

    logger.info(
      `Performance test completed: avg=${avg}ms, min=${min}ms, max=${max}ms, p95=${p95}ms`
    );
    return stats;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Performance test failed: ${errorMessage}`);
    throw error;
  }
};

/**
 * Validate API response time against threshold
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} threshold - Maximum acceptable response time in ms
 * @param {Object} options - Validation options
 * @param {number} options.timeout - Request timeout (default: threshold * 2)
 * @returns {Promise<Object>} Validation result
 * @example
 * const result = await validateResponseTime(() => fetch('/api/data'), 500);
 * console.log(result.valid); // true if response time <= 500ms
 */
export const validateResponseTime = async (
  requestFn: () => Promise<unknown>,
  threshold: number,
  options: { timeout?: number } = {}
): Promise<APIPerformanceValidationResult> => {
  const { timeout = threshold * 2 } = options;

  try {
    const startTime = performance.now();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    );

    await Promise.race([requestFn(), timeoutPromise]);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const valid = duration <= threshold;
    const message = valid
      ? `Response time ${duration}ms is within threshold ${threshold}ms`
      : `Response time ${duration}ms exceeds threshold ${threshold}ms`;

    if (valid) {
      logger.info(message);
    } else {
      logger.warn(message);
    }

    return {
      valid,
      duration,
      threshold,
      difference: duration - threshold,
      message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Response time validation failed: ${errorMessage}`);
    return {
      valid: false,
      duration: null,
      threshold,
      message: errorMessage,
    };
  }
};

/**
 * Measure throughput (requests per second)
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} options - Test options
 * @param {number} options.duration - Test duration in seconds (default: 10)
 * @param {number} options.maxConcurrent - Maximum concurrent requests (default: 10)
 * @returns {Promise<Object>} Throughput metrics
 * @example
 * const metrics = await measureThroughput(
 *   () => fetch('/api/data'),
 *   { duration: 30, maxConcurrent: 20 }
 * );
 * console.log(metrics.requestsPerSecond);
 */
export const measureThroughput = async (
  requestFn: () => Promise<unknown>,
  options: { duration?: number; maxConcurrent?: number } = {}
): Promise<APIPerformanceThroughputMetrics> => {
  const { duration = 10, maxConcurrent = 10 } = options;

  try {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const executing: Array<Promise<void>> = [];

    while (Date.now() < endTime) {
      if (executing.length < maxConcurrent) {
        requestCount++;

        const promise = requestFn()
          .then(() => {
            successCount++;
          })
          .catch(() => {
            errorCount++;
          })
          .finally(() => {
            const index = executing.indexOf(promise);
            if (index > -1) {
              executing.splice(index, 1);
            }
          });

        executing.push(promise);
      }

      await Promise.race([...executing, new Promise(resolve => setTimeout(resolve, 10))]);
    }

    // Wait for remaining requests
    await Promise.allSettled(executing);

    const actualDuration = (Date.now() - startTime) / 1000;
    const requestsPerSecond = Math.round((successCount / actualDuration) * 100) / 100;

    const metrics = {
      duration: actualDuration,
      totalRequests: requestCount,
      successfulRequests: successCount,
      failedRequests: errorCount,
      requestsPerSecond,
      successRate: Math.round((successCount / requestCount) * 100),
    };

    logger.info(`Throughput test completed: ${requestsPerSecond} req/s over ${actualDuration}s`);
    return metrics;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Throughput measurement failed: ${errorMessage}`);
    throw error;
  }
};

/**
 * Run load test with gradual ramp-up and sustained load phases
 * @param requestFn - Function that returns a promise (the API request)
 * @param options - Load test configuration
 * @param options.startUsers - Starting concurrent users (default: 1)
 * @param options.endUsers - Ending concurrent users (default: 10)
 * @param options.rampUpTime - Ramp-up time in seconds (default: 30)
 * @param options.duration - Duration at peak load in seconds (default: 60)
 * @returns Promise resolving to load test results with phase breakdowns
 * @throws {Error} When load test fails
 * @example
 * const results = await runLoadTest(
 *   () => fetch('/api/data'),
 *   { startUsers: 1, endUsers: 50, rampUpTime: 60, duration: 300 }
 * );
 */
export const runLoadTest = async (
  requestFn: () => Promise<unknown>,
  options: { startUsers?: number; endUsers?: number; rampUpTime?: number; duration?: number } = {}
): Promise<APIPerformanceLoadTestResults> => {
  const { startUsers = 1, endUsers = 10, rampUpTime = 30, duration = 60 } = options;

  try {
    const results: APIPerformanceLoadTestResults = {
      phases: [],
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
    };

    // Ramp-up phase
    logger.info(`Starting load test: ${startUsers} to ${endUsers} users over ${rampUpTime}s`);
    const rampUpSteps = endUsers - startUsers;
    const stepDuration = (rampUpTime * 1000) / rampUpSteps;

    for (let users = startUsers; users <= endUsers; users++) {
      const phaseResults = await runConcurrentRequests(
        requestFn,
        users,
        Math.min(stepDuration / 1000, 1)
      );

      results.phases.push({
        users,
        ...phaseResults,
      });

      results.totalRequests += phaseResults.totalRequests;
      results.successfulRequests += phaseResults.successfulRequests;
      results.failedRequests += phaseResults.failedRequests;
      results.responseTimes.push(...phaseResults.responseTimes);
    }

    // Sustained load phase
    logger.info(`Sustaining peak load: ${endUsers} users for ${duration}s`);
    const sustainedResults = await runConcurrentRequests(requestFn, endUsers, duration);

    results.phases.push({
      users: endUsers,
      phase: 'sustained',
      ...sustainedResults,
    });

    results.totalRequests += sustainedResults.totalRequests;
    results.successfulRequests += sustainedResults.successfulRequests;
    results.failedRequests += sustainedResults.failedRequests;
    results.responseTimes.push(...sustainedResults.responseTimes);

    // Calculate overall statistics
    const sorted = [...results.responseTimes].sort((a, b) => a - b);
    results.avgResponseTime = Math.round(
      results.responseTimes.reduce((sum, t) => sum + t, 0) / results.responseTimes.length
    );
    results.minResponseTime = sorted[0];
    results.maxResponseTime = sorted[sorted.length - 1];
    results.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)];
    results.successRate = Math.round((results.successfulRequests / results.totalRequests) * 100);

    logger.info(
      `Load test completed: ${results.totalRequests} requests, ${results.successRate}% success rate`
    );
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Load test failed: ${errorMessage}`);
    throw error;
  }
};

/**
 * Helper function to run concurrent requests for load testing
 * @param requestFn - Function that returns a promise
 * @param concurrentUsers - Number of concurrent users to simulate
 * @param durationSeconds - Duration to run test in seconds
 * @returns Promise resolving to phase results
 */
export const runConcurrentRequests = async (
  requestFn: () => Promise<unknown>,
  concurrentUsers: number,
  durationSeconds: number
): Promise<APIPerformancePhaseResults> => {
  const endTime = Date.now() + durationSeconds * 1000;
  const executing = new Set();
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  const responseTimes: number[] = [];

  while (Date.now() < endTime || executing.size > 0) {
    if (Date.now() < endTime && executing.size < concurrentUsers) {
      totalRequests++;
      const startTime = performance.now();

      const promise = requestFn()
        .then(() => {
          const endTime = performance.now();
          responseTimes.push(Math.round(endTime - startTime));
          successfulRequests++;
        })
        .catch(() => {
          failedRequests++;
        })
        .finally(() => {
          executing.delete(promise);
        });

      executing.add(promise);
    } else {
      await Promise.race([...executing]);
    }
  }

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    responseTimes: responseTimes as number[],
  };
};

/**
 * Compare performance between two API endpoints
 * @param requestFn1 - First request function to test
 * @param requestFn2 - Second request function to test
 * @param options - Comparison configuration
 * @param options.iterations - Number of iterations per endpoint (default: 10)
 * @returns Promise resolving to comparison results
 * @throws {Error} When performance comparison fails
 * @example
 * const comparison = await comparePerformance(
 *   () => fetch('/api/v1/data'),
 *   () => fetch('/api/v2/data'),
 *   { iterations: 50 }
 * );
 */
export const comparePerformance = async (
  requestFn1: () => Promise<unknown>,
  requestFn2: () => Promise<unknown>,
  options: { iterations?: number } = {}
): Promise<APIPerformanceComparisonResult> => {
  const { iterations = 10 } = options;

  try {
    logger.info('Running performance comparison...');

    const stats1 = await runPerformanceTest(requestFn1, { iterations, warmup: true });
    const stats2 = await runPerformanceTest(requestFn2, { iterations, warmup: true });

    const comparison: APIPerformanceComparisonResult = {
      endpoint1: stats1,
      endpoint2: stats2,
      faster: (stats1.avg < stats2.avg ? 'endpoint1' : 'endpoint2') as 'endpoint1' | 'endpoint2',
      differenceMs: Math.abs(stats1.avg - stats2.avg),
      differencePercent: Math.round(Math.abs((stats1.avg - stats2.avg) / stats1.avg) * 100),
    };

    logger.info(
      `Comparison: ${comparison.faster} is faster by ${comparison.differenceMs}ms (${comparison.differencePercent}%)`
    );
    return comparison;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Performance comparison failed: ${errorMessage}`);
    throw error;
  }
};
