---
id: kb.graphify.integration
title: Graphify Integration
manifestRef: KnowledgeBase/knowledge-manifest.skill.yaml
---

# Graphify Integration

This file defines how Graphify supports AI-driven QA without changing current framework layout.

## Purpose

- Build a project knowledge graph from docs, tests, configs, and services.
- Use graph context to suggest impacted areas and missing scenarios.
- Reduce token usage by targeted retrieval.

## Suggested Inputs

- `README.md`, `AGENTS.md`, `COMMANDS.md`, `SKILL.md`
- `src/tests/`, `src/services/`, `src/resources/`
- `playwright.config.ts`, `playwright-bdd.config.ts`, `package.json`

## Usage Pattern

1. Detect changed files/features.
2. Resolve impacted nodes in graph.
3. Suggest functional/regression/negative/edge scenarios.
4. Map suggestions into existing test folders under `src/tests/`.

## Fallback

If Graphify is unavailable, continue using these KnowledgeBase files directly.
