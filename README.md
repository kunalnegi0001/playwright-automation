# Playwright Automation Framework (Clean Starter)

Lightweight Playwright + TypeScript + BDD starter for UI and REST API automation.

This repository is intentionally simplified for new-project bootstrapping:
- one UI reference flow (OrangeHRM login happy-path)
- one API reference flow (JSONPlaceholder create-user CRUD step)
- Allure + Playwright reporting
- pnpm-based workflow
- GitHub-first source layout with Azure DevOps-ready onboarding

## Source control portability

This framework now keeps source-control-specific assets isolated so the same codebase can be used in both GitHub and Azure DevOps:

- `.github/` keeps GitHub-only assets such as Actions, Copilot agents, templates, and repository metadata.
- `ai/` remains platform-neutral and should be retained in both GitHub and Azure DevOps clones.
- `azure-pipelines.yml` provides an Azure DevOps pipeline out of the box.
- `pnpm repo:prepare:ado` removes `.github/` from a client clone when the target organization wants a clean Azure DevOps-only repository.

### Azure DevOps onboarding

For a client clone hosted in Azure DevOps:

1. Clone or import the repository into Azure Repos.
2. Run `pnpm install`.
3. Run `pnpm repo:prepare:ado` if the client wants GitHub-only assets removed.
4. Create a pipeline that points to `azure-pipelines.yml`.
5. Configure secure variables in Azure DevOps Variable Groups or Azure Key Vault.
6. Adjust branch filters, environments, and secrets for the client project.

## What is included

### UI reference
- Feature: OrangeHRM Authentication
- Scenario kept: Verify login page elements and successful login
- Path: src/tests/UI/__examples-orangehrm__/authentication/features/authentication.feature

### API reference
- Feature: Users API - JSONPlaceholder
- Scenario kept: Create a new user
- Path: src/tests/API/__examples-jsonplaceholder__/users/features/users.feature

### Login/auth setup
- src/tests/auth.setup.ts
- src/resources/config/env.config.ts

## Prerequisites

- Node.js 18+
- pnpm 9+

Optional:
- Allure CLI (for local Allure report open/generate)

## Install

```bash
pnpm install
```

This installs dependencies and Playwright browsers via postinstall.

## Environment

Main environment values:
- BASE_URL (UI base URL)
- API_BASE_URL (API base URL)
- ORANGEHRM_BASE_URL
- ORANGEHRM_LOGIN_URL
- ORANGEHRM_USERNAME
- ORANGEHRM_PASSWORD
- BROWSER_HEADLESS (true / false)

Use .env and .env.api.example as starting points.

## Run tests

### Generate BDD specs

```bash
pnpm bdd:gen
```

### Run UI reference suite

```bash
pnpm test:ui
```

Headless run:

```bash
BROWSER_HEADLESS=true pnpm exec playwright test --project=bdd
```

### Run API reference suite

```bash
pnpm test:api
```

### Run both

```bash
pnpm test:e2e
```

### Type check

```bash
pnpm typecheck
```

### Enterprise validation

```bash
pnpm enterprise:validate
```

## Reports

### Playwright HTML report

```bash
pnpm report:playwright:open
```

### Allure

```bash
pnpm report:allure
```

## Current test discovery configuration

In playwright.config.ts:
- UI BDD features:
  - src/tests/UI/__examples-orangehrm__/authentication/features/**/*.feature
- UI BDD steps:
  - src/tests/UI/__examples-orangehrm__/authentication/step_definitions/**/*.ts
  - src/tests/UI/__examples-orangehrm__/common/fixtures/**/*.ts
- API BDD features:
  - src/tests/API/__examples-jsonplaceholder__/users/features/**/*.feature
- API BDD steps:
  - src/tests/API/__examples-jsonplaceholder__/step_definitions/common-api.steps.ts
  - src/tests/API/__examples-jsonplaceholder__/step_definitions/data-setup.steps.ts

## Project structure (starter-focused)

```text
.
├── azure-pipelines.yml
├── .github/
│   ├── agents/
│   ├── prompts/
│   └── skills/
├── ai/
│   ├── instructions/
│   └── templates/
├── scripts/
│   └── prepare-ado.mjs
├── src/
│   ├── resources/
│   │   ├── config/
│   │   └── fixtures/
│   └── tests/
│       ├── auth.setup.ts
│       ├── API/__examples-jsonplaceholder__/
│       └── UI/__examples-orangehrm__/
├── playwright.config.ts
├── playwright-bdd.config.ts
└── package.json
```

## Notes

- This starter keeps only reference scenarios by design.
- If you add more features, update playwright.config.ts globs intentionally.
- GitHub-only repository assets remain isolated under `.github/`.
- Azure DevOps execution is supported through `azure-pipelines.yml` and `pnpm repo:prepare:ado`.
- Additional AI coding guidance/templates are under `ai/` and should be kept in both hosting models.
