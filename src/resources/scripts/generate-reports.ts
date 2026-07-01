#!/usr/bin/env node

/**
 * @fileoverview Test report generation script.
 * Generates HTML reports and aggregates test results into summary statistics.
 * @module scripts/generate-reports
 */

/**
 * Generate Reports Script
 * Generates HTML reports and aggregates test results
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Generate comprehensive test reports from test results
 * Calculates statistics, creates summary, and displays formatted output
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If report generation fails
 */
export const generateReports = async () => {
  console.log('📊 Generating test reports...\n');

  const resultsPath = path.join(rootDir, 'test-results', 'results.json');

  if (!(await fs.pathExists(resultsPath))) {
    console.log('⚠️  No test results found');
    return;
  }

  const results = (await fs.readJSON(resultsPath)) as {
    suites?: Array<{ specs: Array<{ duration?: number; ok: boolean }> }>;
  };

  // Calculate statistics
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
  };

  // Process results
  if (results.suites) {
    results.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        stats.total++;
        stats.duration += spec.duration || 0;

        if (spec.ok) {
          stats.passed++;
        } else {
          stats.failed++;
        }
      });
    });
  }

  // Generate summary
  console.log('📈 Test Execution Summary:');
  console.log('─'.repeat(50));
  console.log(`Total Tests:   ${stats.total}`);
  console.log(`✅ Passed:      ${stats.passed}`);
  console.log(`❌ Failed:      ${stats.failed}`);
  console.log(`⏭️  Skipped:     ${stats.skipped}`);
  console.log(`⏱️  Duration:    ${(stats.duration / 1000).toFixed(2)}s`);
  console.log(`📊 Pass Rate:   ${((stats.passed / stats.total) * 100).toFixed(2)}%`);
  console.log('─'.repeat(50));

  // Save summary
  const summaryPath = path.join(rootDir, 'test-results', 'summary.json');
  await fs.writeJSON(summaryPath, stats, { spaces: 2 });
  console.log(`\n✅ Summary saved to: ${summaryPath}`);

  // Generate HTML report (if Playwright report exists)
  const reportPath = path.join(rootDir, 'playwright-report');
  if (await fs.pathExists(reportPath)) {
    console.log(`\n📄 HTML Report: ${reportPath}/index.html`);
  }

  console.log('\n✨ Report generation complete!');
};

// Run report generation
generateReports().catch(error => {
  console.error(
    `\n❌ Report generation failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
