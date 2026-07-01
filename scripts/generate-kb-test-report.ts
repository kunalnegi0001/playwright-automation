#!/usr/bin/env tsx
/**
 * @fileoverview Generate KnowledgeBase markdown and HTML reports from Playwright JSON output.
 */

import * as fs from 'fs';
import * as path from 'path';

type ParsedArgs = {
  /** Input JSON path */
  input: string;
  /** Suite/report name */
  suite: string;
};

type TestCaseResult = {
  /** Scenario summary */
  scenarioSummary: string;
  /** Steps to reproduce */
  stepsToReproduce: string[];
  /** Test status */
  status: string;
  /** Duration in ms */
  duration: number;
  /** Error snippet */
  error: string;
  /** Project name */
  project: string;
  /** File path */
  file: string;
};

type ReportSummary = {
  /** Total tests */
  total: number;
  /** Passed tests */
  passed: number;
  /** Failed tests */
  failed: number;
  /** Skipped tests */
  skipped: number;
  /** Timed out tests */
  timedOut: number;
  /** Total duration */
  duration: number;
};

/**
 * Parses CLI arguments.
 */
const parseArgs = (): ParsedArgs => {
  const args = process.argv.slice(2);

  const getValue = (flag: string): string | undefined => {
    const flagIndex = args.indexOf(flag);
    if (flagIndex === -1 || flagIndex + 1 >= args.length) {
      return undefined;
    }
    return args[flagIndex + 1];
  };

  const input = getValue('--input');
  const suite = getValue('--suite');

  if (!input || !suite) {
    console.error('Usage: pnpm kb:report:generate --input <json-file> --suite <suite-name>');
    process.exit(1);
  }

  return { input, suite };
};

/**
 * Ensures reports folder exists.
 */
const ensureReportsDirectory = (): string => {
  const reportsDir = path.join(process.cwd(), 'KnowledgeBase', 'Reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
};

/**
 * Converts raw Playwright test entries to normalized test cases.
 */
const normalizeTestCases = (payload: unknown): TestCaseResult[] => {
  const report = payload as Record<string, unknown>;
  const rootSuites = Array.isArray(report.suites) ? report.suites : [];
  const collectedCases: TestCaseResult[] = [];

  const walkSuites = (suites: unknown[], parentTitles: string[] = []): void => {
    for (const suiteEntry of suites) {
      if (!suiteEntry || typeof suiteEntry !== 'object') {
        continue;
      }

      const suiteRecord = suiteEntry as Record<string, unknown>;
      const suiteTitle = String(suiteRecord.title ?? '').trim();
      const nextParentTitles = suiteTitle ? [...parentTitles, suiteTitle] : parentTitles;

      const specs = Array.isArray(suiteRecord.specs) ? suiteRecord.specs : [];
      for (const specEntry of specs) {
        if (!specEntry || typeof specEntry !== 'object') {
          continue;
        }

        const specRecord = specEntry as Record<string, unknown>;
        const specTitle = String(specRecord.title ?? 'Untitled test').trim();
        const tests = Array.isArray(specRecord.tests) ? specRecord.tests : [];

        for (const testEntry of tests) {
          if (!testEntry || typeof testEntry !== 'object') {
            continue;
          }

          const testRecord = testEntry as Record<string, unknown>;
          const results = Array.isArray(testRecord.results) ? testRecord.results : [];
          const latestResult =
            results.length > 0 && typeof results[results.length - 1] === 'object'
              ? (results[results.length - 1] as Record<string, unknown>)
              : {};

          const errors = Array.isArray(latestResult.errors) ? latestResult.errors : [];
          const firstError =
            errors.length > 0 && typeof errors[0] === 'object'
              ? (errors[0] as Record<string, unknown>)
              : {};

          const contextualTitle = [...nextParentTitles.slice(-1), specTitle]
            .filter(Boolean)
            .join(' › ');

          const rawSteps = Array.isArray(latestResult.steps) ? latestResult.steps : [];
          const stepsToReproduce = rawSteps
            .filter(step => step && typeof step === 'object')
            .map(step => {
              const stepRecord = step as Record<string, unknown>;
              return String(stepRecord.title ?? '').trim();
            })
            .filter(Boolean);

          collectedCases.push({
            scenarioSummary: contextualTitle || specTitle,
            stepsToReproduce,
            status: String(latestResult.status ?? testRecord.status ?? 'unknown'),
            duration: Number(latestResult.duration ?? 0),
            error: String(firstError.message ?? '').trim(),
            project: String(testRecord.projectName ?? 'unknown'),
            file: String(specRecord.file ?? suiteRecord.file ?? 'unknown'),
          });
        }
      }

      const childSuites = Array.isArray(suiteRecord.suites) ? suiteRecord.suites : [];
      if (childSuites.length > 0) {
        walkSuites(childSuites, nextParentTitles);
      }
    }
  };

  walkSuites(rootSuites);
  return collectedCases;
};

/**
 * Builds summary metrics.
 */
const buildSummary = (cases: TestCaseResult[]): ReportSummary => {
  const total = cases.length;
  const passed = cases.filter(testCase => testCase.status === 'passed').length;
  const failed = cases.filter(testCase => testCase.status === 'failed').length;
  const skipped = cases.filter(testCase => testCase.status === 'skipped').length;
  const timedOut = cases.filter(testCase => testCase.status === 'timedOut').length;
  const duration = cases.reduce((sum, testCase) => sum + testCase.duration, 0);

  return {
    total,
    passed,
    failed,
    skipped,
    timedOut,
    duration,
  };
};

/**
 * Formats timestamp for filenames.
 */
const getTimestamp = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}${min}${ss}`;
};

/**
 * Escapes HTML entities.
 */
const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/**
 * Creates markdown report content.
 */
const buildMarkdown = (
  suite: string,
  generatedAt: string,
  summary: ReportSummary,
  cases: TestCaseResult[]
): string => {
  const lines = [
    `# Test Report: ${suite}`,
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total: ${summary.total}`,
    `- Passed: ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    `- Skipped: ${summary.skipped}`,
    `- Timed Out: ${summary.timedOut}`,
    `- Duration (ms): ${summary.duration}`,
    '',
    '## Test Cases',
    '',
    '| # | Scenario Summary | Steps to Reproduce | Status | Duration (ms) | Project | File |',
    '| --- | --- | --- | --- | ---: | --- | --- |',
  ];

  cases.forEach((testCase, index) => {
    const steps =
      testCase.stepsToReproduce.length > 0
        ? testCase.stepsToReproduce
            .map((step, stepIndex) => `${stepIndex + 1}. ${step}`)
            .join('<br/>')
            .replaceAll('|', '\\|')
        : 'N/A';

    lines.push(
      `| ${index + 1} | ${testCase.scenarioSummary.replaceAll('|', '\\|')} | ${steps} | ${testCase.status} | ${testCase.duration} | ${testCase.project} | ${testCase.file} |`
    );
  });

  const failedCases = cases.filter(testCase => testCase.status === 'failed' && testCase.error);
  if (failedCases.length > 0) {
    lines.push('', '## Failure Details', '');
    failedCases.forEach((testCase, index) => {
      lines.push(`### ${index + 1}. ${testCase.scenarioSummary}`);
      lines.push('');
      lines.push(`- File: ${testCase.file}`);
      lines.push(
        `- Steps to reproduce: ${
          testCase.stepsToReproduce.length > 0
            ? testCase.stepsToReproduce.join(' -> ')
            : 'N/A'
        }`
      );
      lines.push(`- Error: ${testCase.error}`);
      lines.push('');
    });
  }

  return `${lines.join('\n')}\n`;
};

/**
 * Creates HTML report content.
 */
const buildHtml = (
  suite: string,
  generatedAt: string,
  summary: ReportSummary,
  cases: TestCaseResult[]
): string => {
  const rows = cases
    .map(
      (testCase, index) => `
      <tr class="status-${escapeHtml(testCase.status)}">
        <td>${index + 1}</td>
        <td>${escapeHtml(testCase.scenarioSummary)}</td>
        <td>${
          testCase.stepsToReproduce.length > 0
            ? `<ol>${testCase.stepsToReproduce
                .map(step => `<li>${escapeHtml(step)}</li>`)
                .join('')}</ol>`
            : 'N/A'
        }</td>
        <td>${escapeHtml(testCase.status)}</td>
        <td>${testCase.duration}</td>
        <td>${escapeHtml(testCase.project)}</td>
        <td>${escapeHtml(testCase.file)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Report: ${escapeHtml(suite)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 24px; color: #0f172a; }
    h1 { margin-bottom: 8px; }
    .meta { color: #475569; margin-bottom: 20px; }
    .cards { display: grid; grid-template-columns: repeat(6, minmax(100px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .value { font-size: 22px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    .status-passed { background: #ecfdf5; }
    .status-failed { background: #fef2f2; }
    .status-skipped { background: #f8fafc; }
    .status-timedOut { background: #fff7ed; }
  </style>
</head>
<body>
  <h1>Test Report: ${escapeHtml(suite)}</h1>
  <div class="meta">Generated at: ${escapeHtml(generatedAt)}</div>

  <div class="cards">
    <div class="card"><div class="label">Total</div><div class="value">${summary.total}</div></div>
    <div class="card"><div class="label">Passed</div><div class="value">${summary.passed}</div></div>
    <div class="card"><div class="label">Failed</div><div class="value">${summary.failed}</div></div>
    <div class="card"><div class="label">Skipped</div><div class="value">${summary.skipped}</div></div>
    <div class="card"><div class="label">Timed Out</div><div class="value">${summary.timedOut}</div></div>
    <div class="card"><div class="label">Duration (ms)</div><div class="value">${summary.duration}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Scenario Summary</th>
        <th>Steps to Reproduce</th>
        <th>Status</th>
        <th>Duration (ms)</th>
        <th>Project</th>
        <th>File</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</body>
</html>
`;
};

/**
 * Extracts valid JSON payload from mixed stdout content.
 */
const extractJsonPayload = (rawContent: string): string => {
  const firstBraceIndex = rawContent.indexOf('{');
  const lastBraceIndex = rawContent.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error('Could not find JSON object boundaries in input file.');
  }

  return rawContent.slice(firstBraceIndex, lastBraceIndex + 1);
};

/**
 * Main execution.
 */
const main = (): void => {
  const args = parseArgs();
  const reportsDir = ensureReportsDirectory();

  const inputPath = path.isAbsolute(args.input)
    ? args.input
    : path.join(process.cwd(), args.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(inputPath, 'utf-8').trim();
  if (!rawContent) {
    console.error('Input JSON is empty.');
    process.exit(1);
  }

  const jsonPayload = extractJsonPayload(rawContent);
  const parsed = JSON.parse(jsonPayload) as unknown;
  const cases = normalizeTestCases(parsed);
  const summary = buildSummary(cases);
  const generatedAt = new Date().toISOString();
  const timestamp = getTimestamp();
  const executionDirectory = path.join(reportsDir, timestamp);

  if (!fs.existsSync(executionDirectory)) {
    fs.mkdirSync(executionDirectory, { recursive: true });
  }

  const safeSuiteName = args.suite.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const markdownPath = path.join(executionDirectory, `${safeSuiteName}.md`);
  const htmlPath = path.join(executionDirectory, `${safeSuiteName}.html`);

  const markdown = buildMarkdown(args.suite, generatedAt, summary, cases);
  const html = buildHtml(args.suite, generatedAt, summary, cases);

  fs.writeFileSync(markdownPath, markdown, 'utf-8');
  fs.writeFileSync(htmlPath, html, 'utf-8');

  console.log('✅ KnowledgeBase report generated');
  console.log(`- Execution folder: ${path.relative(process.cwd(), executionDirectory)}`);
  console.log(`- ${path.relative(process.cwd(), markdownPath)}`);
  console.log(`- ${path.relative(process.cwd(), htmlPath)}`);
};

main();
