/**
 * HTML Report Template
 * Generates comprehensive HTML test reports
 */

export type HtmlReportTest = {
  name: string;
  status: string;
  duration: number;
  retries: number;
};

export type HtmlReportSummary = {
  total: number;
  passed: number;
  failed: number;
  totalDuration: number;
  passRate: number;
};

export type HtmlReportData = {
  summary: HtmlReportSummary;
  tests: HtmlReportTest[];
  timestamp: string;
};

export const generateHTMLReport = (data: HtmlReportData): string => {
  const { summary, tests, timestamp } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }
        .header h1 { margin-bottom: 10px; }
        .timestamp { opacity: 0.9; font-size: 14px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f9f9f9;
        }
        .metric {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .metric-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .metric.passed { border-left: 4px solid #4caf50; }
        .metric.failed { border-left: 4px solid #f44336; }
        .metric.total { border-left: 4px solid #2196f3; }
        .metric.duration { border-left: 4px solid #ff9800; }
        .tests-list {
            padding: 30px;
        }
        .test-item {
            padding: 15px;
            border-left: 4px solid #ddd;
            margin-bottom: 15px;
            background: #fafafa;
            border-radius: 4px;
        }
        .test-item.passed { border-left-color: #4caf50; }
        .test-item.failed { border-left-color: #f44336; }
        .test-name { font-weight: 600; margin-bottom: 8px; }
        .test-meta {
            font-size: 13px;
            color: #666;
            display: flex;
            gap: 20px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge.passed { background: #4caf50; color: white; }
        .badge.failed { background: #f44336; color: white; }
        .footer {
            padding: 20px 30px;
            background: #f9f9f9;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .pass-rate {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: ${summary.passRate >= 80 ? '#4caf50' : '#f44336'};
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Execution Report</h1>
            <div class="timestamp">Generated: ${new Date(timestamp).toLocaleString()}</div>
        </div>

        <div class="summary">
            <div class="metric total">
                <div class="metric-label">Total Tests</div>
                <div class="metric-value">${summary.total}</div>
            </div>
            <div class="metric passed">
                <div class="metric-label">Passed</div>
                <div class="metric-value">${summary.passed}</div>
            </div>
            <div class="metric failed">
                <div class="metric-label">Failed</div>
                <div class="metric-value">${summary.failed}</div>
            </div>
            <div class="metric duration">
                <div class="metric-label">Duration</div>
                <div class="metric-value">${summary.totalDuration}s</div>
            </div>
        </div>

        <div class="pass-rate">${summary.passRate}%</div>

        <div class="tests-list">
            <h2 style="margin-bottom: 20px;">Test Results</h2>
            ${tests
              .map(
                test => `
                <div class="test-item ${test.status}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-meta">
                        <span class="badge ${test.status}">${test.status.toUpperCase()}</span>
                        <span>⏱️ ${(test.duration / 1000).toFixed(2)}s</span>
                        ${test.retries > 0 ? `<span>🔄 ${test.retries} retries</span>` : ''}
                    </div>
                </div>
            `
              )
              .join('')}
        </div>

        <div class="footer">
            Generated by Enterprise Playwright Framework
        </div>
    </div>
</body>
</html>
  `;
};
