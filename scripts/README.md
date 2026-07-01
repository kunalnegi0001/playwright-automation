# Automation Scripts

This directory contains utility scripts for maintaining code quality and
consistency across the framework.

## Available Scripts

### `health-check.mjs`

Runs a lightweight framework readiness check for local development and CI.

**Usage:**

```bash
pnpm health:check
```

**What it does:**

- Verifies key framework files exist
- Confirms Node.js and Playwright browser readiness
- Runs the supported TypeScript validation command
- Checks minimum environment readiness for CI

### `prepare-ado.mjs`

Prepares a client clone for Azure DevOps usage while keeping the main repository
GitHub-compatible.

**Usage:**

```bash
# Keep .github but validate ADO assets
pnpm repo:prepare:ado:keep-github

# Remove .github from a client clone
pnpm repo:prepare:ado

# Preview what would be removed
node ./scripts/prepare-ado.mjs --remove-github --dry-run
```

**What it does:**

- Confirms `azure-pipelines.yml` is present
- Optionally removes `.github/` from a client clone
- Prints the next Azure DevOps onboarding steps

### `fix-imports.ts`

Automatically converts relative imports to path aliases throughout the codebase.

**Usage:**

```bash
# Dry run (preview changes without applying)
pnpm tsx scripts/fix-imports.ts --dry-run

# Apply changes
pnpm tsx scripts/fix-imports.ts
```

**What it does:**

- Scans all TypeScript files in `src/`
- Identifies relative imports (e.g., `'../../utils/logger'`)
- Converts to path aliases (e.g., `'@utils/core/logger'`)
- Reports all changes made

**Example transformations:**

```typescript
// Before
import { logger } from '../../../resources/utils/core/logger/logger';
import { configManager } from '../../config/config.manager';

// After
import { logger } from '@utils/core';
import { configManager } from '@config/config.manager';
```

## Configuration

Path aliases are defined in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@utils/*": ["src/resources/utils/*"],
      "@config/*": ["src/resources/config/*"],
      "@services/*": ["src/services/*"],
      // ... etc
    },
  },
}
```

## Adding New Scripts

When creating new automation scripts:

1. Follow the same structure as existing scripts
2. Add TypeScript typing for better IDE support
3. Include usage documentation
4. Support `--dry-run` flag for safety
5. Provide clear console output with emojis for readability
6. Update this README with script details

## Requirements

- Node.js >= 18
- pnpm >= 9
- tsx (installed as dev dependency)
