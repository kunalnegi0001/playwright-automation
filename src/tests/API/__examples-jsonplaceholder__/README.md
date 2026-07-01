# JSONPlaceholder API Test Examples

Comprehensive API test examples using JSONPlaceholder API, demonstrating REST
API testing with BDD.

## Purpose

These are example tests demonstrating best practices for this test type.

## Running Examples

```bash
# Run all examples
pnpm test:api

# Run this specific example
pnpm bdd:gen:examples && npx playwright test --project=api-bdd
```

## Note

These tests are reference examples. In the starter repository they run through
the example profile and can later be replaced by client-specific API suites.
