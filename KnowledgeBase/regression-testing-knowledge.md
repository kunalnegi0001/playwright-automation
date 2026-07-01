---
id: kb.regression.testing
title: Regression Testing Knowledge
manifestRef: KnowledgeBase/knowledge-manifest.skill.yaml
---

# Regression Testing Knowledge

Use this file to keep core behavior stable across releases.

## Regression Principles

- Prioritize critical user journeys and high-defect modules.
- Re-run smoke + module regression after config/dependency changes.
- Keep flaky scenarios out of release blockers until stabilized.

## Existing Command Alignment

- `pnpm test:smoke`
- `pnpm test:ui`
- `pnpm test:api`
- `pnpm test:e2e`

## Rule

Regression expansion must add/adjust tests in existing `src/tests/` areas only.
