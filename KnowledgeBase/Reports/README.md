# Reports

This folder stores detailed test case style reports for executed test runs.

## Output format

Each run should generate:

- One Markdown report (`.md`)
- One HTML report (`.html`)

Inside a timestamped execution folder.

## Naming convention

`<YYYY-MM-DD-HHmmss>/`
`  <suite-name>.md`
`  <suite-name>.html`

## Usage

1. Run tests with JSON reporter and save output to a file.
2. Generate report files from the JSON output.

Example:

- `pnpm bdd:gen`
- `pnpm exec playwright test --project=bdd-examples --grep "@dashboard.*@regression|@regression.*@dashboard" --reporter=json > KnowledgeBase/Reports/dashboard-regression-raw.json`
- `pnpm kb:report:generate --input KnowledgeBase/Reports/dashboard-regression-raw.json --suite dashboard-regression`
