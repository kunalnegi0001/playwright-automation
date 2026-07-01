# KnowledgeBase

This folder stores flat knowledge files for product understanding, QA strategy, and AI-assisted test planning.

## Scope

- Capture product and testing knowledge only.
- Guide functional, regression, positive, negative, and edge-case test design.
- Reference existing framework implementation under `src/`.

## Non-goals

- No restructuring of `src/` folders.
- No forced test code migration.

## Current Files

- Global knowledge files at the root
- `orangehrm/` feature knowledge for UI exploration

## Current Structure

- `product-overview.md`
- `functional-testing-knowledge.md`
- `regression-testing-knowledge.md`
- `edge-cases-and-negative-cases.md`
- `automation-generation-rules.md`
- `knowledge-manifest.skill.yaml`
- `orangehrm/`
- `Reports/`
- `Graphify/`

## Local Graph Output

After running `pnpm kb:graphify:sync`, the local graph is written to:

- `KnowledgeBase/Graphify/output/local-graph.json`
- `KnowledgeBase/Graphify/output/local-graph.md`
- `KnowledgeBase/Graphify/viewer/local-graph-viewer.html`

Use `pnpm kb:graphify:status` to print a summary of the current local graph.
Use `pnpm kb:graphify:view` to open the visual graph viewer locally.

## Test Execution Reports

Store test reports inside `KnowledgeBase/Reports`.

Generate report files from Playwright JSON output:

- `pnpm kb:report:generate --input <json-file> --suite <suite-name>`
