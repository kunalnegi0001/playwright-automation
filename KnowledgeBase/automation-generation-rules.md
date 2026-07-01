---
id: kb.automation.rules
title: Automation Generation Rules
manifestRef: KnowledgeBase/knowledge-manifest.skill.yaml
---

# Automation Generation Rules

Rules for AI-assisted test generation.

## Generation Rules

1. Reuse existing framework structure and fixtures.
2. Generate scenarios first, then map to existing BDD/test patterns.
3. Prefer stable selectors/contracts and deterministic assertions.
4. Include positive, negative, and edge variants for each feature.
5. Keep tags and naming consistent with current suite conventions.

## Non-Negotiable Constraint

Do not move or redesign folders under `src/`; only add or update tests within current structure.
