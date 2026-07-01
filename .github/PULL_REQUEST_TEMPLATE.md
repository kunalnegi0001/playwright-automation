## 📋 Pull Request Description

<!-- Provide a clear and concise description of your changes -->

### Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality
      to not work as expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] 🎨 Style/formatting changes
- [ ] ⚡ Performance improvement
- [ ] ✅ Test updates
- [ ] 🔧 Configuration changes
- [ ] 🚀 CI/CD changes

### Related Issues

<!-- Link to related issues -->

Closes # Related to #

### What Changed?

<!-- Describe what code changed and why -->

-
-
-

### How to Test?

<!-- Provide steps to test your changes -->

1.
2.
3.

### Screenshots/Videos (if applicable)

<!-- Add screenshots or videos demonstrating the changes -->

### Checklist

<!-- Ensure all items are completed before requesting review -->

#### Code Quality

- [ ] My code follows the style guidelines of this project (AGENTS.md)
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have used TypeScript with strict types (no `any` types)
- [ ] I have used arrow functions with explicit return types
- [ ] I have used named exports (no `export default`)
- [ ] I have added JSDoc comments to all functions and types

#### Testing

- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested my changes across multiple browsers (if UI changes)
- [ ] I have verified test isolation (no shared state between tests)
- [ ] No `.only` or `.skip` statements left in test files

#### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have updated CHANGELOG.md with my changes
- [ ] I have updated README.md if needed
- [ ] I have added/updated JSDoc comments

#### Conventions

- [ ] I have used kebab-case for file names
- [ ] I have used path aliases (@utils, @config, etc.) instead of relative
      imports
- [ ] I have used proper naming conventions (PascalCase for types, camelCase for
      functions)
- [ ] My commit messages follow conventional commits format

#### Security

- [ ] I have not committed any secrets, API keys, or credentials
- [ ] I have used environment variables for sensitive data
- [ ] I have sanitized user inputs where applicable
- [ ] I have not introduced any security vulnerabilities

#### Performance

- [ ] My changes do not negatively impact performance
- [ ] I have optimized any database queries or API calls
- [ ] I have avoided unnecessary re-renders or computations

### Additional Context

<!-- Add any other context about the pull request here -->

### Reviewer Notes

<!-- Add specific areas you'd like reviewers to focus on -->

---

**For Reviewers:**

Please ensure:

1. Code follows [AGENTS.md](AGENTS.md) guidelines
2. All tests pass in CI/CD pipeline
3. No security vulnerabilities introduced
4. Documentation is updated
5. TypeScript strict mode compliance
