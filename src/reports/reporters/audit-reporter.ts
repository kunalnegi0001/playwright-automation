/**
 * @fileoverview Custom audit reporter for test execution tracking.
 * Logs test execution details for compliance, debugging, and audit purposes.
 * @module reports/reporters/audit-reporter
 */

import { logger } from '@utils/core';
import { configManager } from '@config/config.manager';
import fs from 'fs/promises';
import path from 'path';

export type AuditReporterLogEntry = {
  testId: string;
  testName: string;
  testFile: string;
  project: string | undefined;
  startTime: string;
  endTime?: string;
  status?: string;
  duration?: number;
  retry?: number;
  environment: string;
  user: string | undefined;
  ci: boolean;
  errors?: Array<{ message: string; stack?: string }>;
  attachments?: Array<{ name: string; contentType: string; path?: string }>;
};

/**
 * Custom Audit Reporter
 * Logs test execution details for compliance and audit purposes
 * Integrates with Playwright's reporter interface
 * @class
 */
export class AuditReporter {
  private auditLog: Array<AuditReporterLogEntry>;
  private startTime: Date | null;
  private outputFile: string;

  /**
   * Creates an instance of AuditReporter
   * @param {Object} [options={}] - Reporter configuration options
   * @param {string} [options.outputFile='logs/audit-log.json'] - Path to output audit log file
   */
  constructor(options: { outputFile?: string } = {}) {
    this.auditLog = [];
    this.startTime = null;
    this.outputFile = options.outputFile || 'logs/audit-log.json';
  }

  /**
   * Called when test suite begins
   * @param {Object} config - Playwright test configuration
   * @param {Object} suite - Test suite object
   * @returns {void}
   */
  onBegin(config: Record<string, unknown>, suite: Record<string, unknown>): void {
    this.startTime = new Date();
    const suiteObj = suite as { allTests: () => unknown[] };
    logger.info('Test suite started', {
      totalTests: suiteObj.allTests().length,
      workers: config.workers,
      timestamp: this.startTime.toISOString(),
    });
  }

  /**
   * Called when an individual test begins
   * @param {Object} test - Test object
   * @param {Object} result - Test result object (incomplete at this stage)
   * @returns {void}
   */
  onTestBegin(test: Record<string, unknown>, _result: Record<string, unknown>): void {
    const testObj = test as {
      id: string;
      title: string;
      location: { file: string };
      parent: { project?: () => { name?: string } };
      retries: number;
    };
    const entry: AuditReporterLogEntry = {
      testId: testObj.id,
      testName: testObj.title,
      testFile: testObj.location.file,
      project: testObj.parent.project?.()?.name,
      startTime: new Date().toISOString(),
      environment: configManager.getEnvironment(),
      user: process.env.USER || process.env.USERNAME,
      ci: configManager.isCI(),
    };

    this.auditLog.push(entry);
    logger.logTestStart({
      title: testObj.title,
      file: testObj.location.file,
      project: testObj.parent.project?.()?.name
        ? { name: testObj.parent.project()?.name || '' }
        : undefined,
      retry: testObj.retries,
    });
  }

  /**
   * Called when an individual test completes
   * @param {Object} test - Test object
   * @param {Object} result - Complete test result with status and errors
   * @returns {void}
   */
  onTestEnd(test: Record<string, unknown>, result: Record<string, unknown>): void {
    const testObj = test as { id: string; title: string; retries: number };
    const resultObj = result as {
      status: string;
      duration: number;
      retry: number;
      errors: Array<{ message: string; stack?: string }>;
      attachments: Array<{ name: string; contentType: string; path?: string }>;
    };
    const entry = this.auditLog.find(e => e.testId === testObj.id);

    if (entry) {
      entry.endTime = new Date().toISOString();
      entry.status = resultObj.status;
      entry.duration = resultObj.duration;
      entry.retry = resultObj.retry;
      entry.errors = resultObj.errors.map(e => ({
        message: e.message,
        stack: e.stack,
      }));
      entry.attachments = resultObj.attachments.map(a => ({
        name: a.name,
        contentType: a.contentType,
        path: a.path,
      }));
    }

    logger.logTestEnd(
      { title: testObj.title, retry: testObj.retries },
      { status: resultObj.status, duration: resultObj.duration }
    );
  }

  /**
   * Called when test suite completes
   * Generates summary and writes audit log to file
   * @async
   * @param {Object} result - Suite result with overall status and duration
   * @returns {Promise<void>}
   */
  async onEnd(result: Record<string, unknown>): Promise<void> {
    const resultObj = result as { duration: number; status: string };
    const summary = {
      executionId: `exec_${Date.now()}`,
      startTime: this.startTime!.toISOString(),
      endTime: new Date().toISOString(),
      duration: resultObj.duration,
      status: resultObj.status,
      totalTests: this.auditLog.length,
      passed: this.auditLog.filter(t => t.status === 'passed').length,
      failed: this.auditLog.filter(t => t.status === 'failed').length,
      skipped: this.auditLog.filter(t => t.status === 'skipped').length,
      environment: configManager.getEnvironment(),
      testDetails: this.auditLog,
    };

    // Write audit log to file
    await fs.mkdir(path.dirname(this.outputFile), { recursive: true });
    await fs.writeFile(this.outputFile, JSON.stringify(summary, null, 2));

    logger.info('Test suite completed', {
      status: result.status,
      totalTests: summary.totalTests,
      passed: summary.passed,
      failed: summary.failed,
      duration: resultObj.duration,
    });

    // Send notifications if configured
    if (summary.failed > 0) {
      await this.sendNotifications(summary);
    }
  }

  /**
   * Send notifications for failed test runs
   * Supports Slack, email, and other notification channels
   * @async
   * @param {Object} summary - Test execution summary
   * @returns {Promise<void>}
   */
  async sendNotifications(summary: Record<string, unknown>): Promise<void> {
    const notificationConfig = configManager.getReportingConfig() as Record<string, unknown>;

    // Slack notification
    if (notificationConfig.slackWebhookURL) {
      await this.sendSlackNotification(notificationConfig.slackWebhookURL as string, summary);
    }

    // Teams notification
    if (notificationConfig.teamsWebhookURL) {
      await this.sendTeamsNotification(notificationConfig.teamsWebhookURL as string, summary);
    }
  }

  async sendSlackNotification(webhookUrl: string, summary: Record<string, unknown>): Promise<void> {
    const { IncomingWebhook } = await import('@slack/webhook');
    const webhook = new IncomingWebhook(webhookUrl);

    const failed = summary.failed as number;
    const status = failed > 0 ? '❌ Failed' : '✅ Passed';
    const color = failed > 0 ? 'danger' : 'good';

    await webhook.send({
      text: `Test Execution ${status}`,
      attachments: [
        {
          color,
          fields: [
            { title: 'Total Tests', value: (summary.totalTests as number).toString(), short: true },
            { title: 'Passed', value: (summary.passed as number).toString(), short: true },
            { title: 'Failed', value: (summary.failed as number).toString(), short: true },
            {
              title: 'Duration',
              value: `${((summary.duration as number) / 1000).toFixed(2)}s`,
              short: true,
            },
            { title: 'Environment', value: summary.environment as string, short: true },
          ],
        },
      ],
    });

    logger.info('Slack notification sent');
  }

  async sendTeamsNotification(webhookUrl: string, summary: Record<string, unknown>): Promise<void> {
    const axios = (await import('axios')).default;

    const failed = summary.failed as number;
    const status = failed > 0 ? '❌ Failed' : '✅ Passed';
    const color = failed > 0 ? 'FF0000' : '00FF00';

    const message = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Test Execution ${status}`,
      themeColor: color,
      title: `Test Execution ${status}`,
      sections: [
        {
          facts: [
            { name: 'Total Tests', value: (summary.totalTests as number).toString() },
            { name: 'Passed', value: (summary.passed as number).toString() },
            { name: 'Failed', value: (summary.failed as number).toString() },
            { name: 'Duration', value: `${((summary.duration as number) / 1000).toFixed(2)}s` },
            { name: 'Environment', value: summary.environment as string },
          ],
        },
      ],
    };

    await axios.post(webhookUrl, message);
    logger.info('Teams notification sent');
  }
}
