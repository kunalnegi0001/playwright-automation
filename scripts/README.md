# Automation Scripts

This directory contains utility scripts for maintaining code quality and
consistency across the framework.

## Available Scripts

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
