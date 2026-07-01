---
id: kb.orangehrm.authentication.login-flows
title: Authentication Login Flows
manifestRef: KnowledgeBase/orangehrm/authentication/authentication.skill.yaml
---

# Authentication Login Flows

## Happy path

1. Open `/auth/login`.
2. Confirm username and password fields.
3. Enter `Admin` / `admin123`.
4. Confirm navigation to `/dashboard`.

## Variations already covered by tests

- Login with valid credentials.
- Login button click after manual entry.
- Direct navigation to dashboard URL.
- Logout/session return path.
