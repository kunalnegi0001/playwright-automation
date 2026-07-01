---
id: kb.edge.negative
title: Edge Cases and Negative Cases
manifestRef: KnowledgeBase/knowledge-manifest.skill.yaml
---

# Edge Cases and Negative Cases

Use this as baseline intelligence for bug discovery.

## Positive Cases

- Expected input with valid role and state.
- Standard business flow with normal payloads.

## Negative Cases

- Invalid credentials, invalid payloads, invalid transitions.
- Unauthorized/forbidden access.
- Missing required fields.

## Edge Cases

- Boundary values (min/max/empty/oversized).
- Time-based behavior (timeouts/retries/race conditions).
- Duplicate submissions and idempotency checks.
- Partial data and optional-field permutations.

## Mapping

- UI negatives/edges: `src/tests/UI/`
- API negatives/edges: `src/tests/API/`
