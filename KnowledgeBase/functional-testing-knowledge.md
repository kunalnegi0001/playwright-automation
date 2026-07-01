---
id: kb.functional.testing
title: Functional Testing Knowledge
manifestRef: KnowledgeBase/knowledge-manifest.skill.yaml
---

# Functional Testing Knowledge

Use this knowledge to design behavior-focused functional tests.

## Coverage Model

1. Validate happy-path flows for each major feature.
2. Validate mandatory field and business-rule enforcement.
3. Validate role-based behavior where applicable.
4. Validate data persistence and response consistency.
5. Validate user-visible outcomes and API contract alignment.

## Implementation Mapping

- UI functional scenarios stay in `src/tests/UI/`.
- API functional scenarios stay in `src/tests/API/`.
- Shared helpers continue to reuse `src/resources/` and `src/services/`.
