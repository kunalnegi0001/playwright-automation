# Utility Patterns

## Logger

```typescript
import { logger } from '@utils/core';

// Info logging
logger.info('Operation started', { userId: '123', action: 'login' });

// Error logging
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // Always propagate
}

// Debug logging
logger.debug('Debug info', { data });

// Warning
logger.warn('Deprecation warning', { feature: 'oldMethod' });
```

## Retry Utility

```typescript
import { RetryUtil } from '@utils/core';

// Basic retry
const result = await RetryUtil.withRetry(async () => await fetchData(), {
  maxAttempts: 3,
  delayMs: 1000,
});

// With custom options
const data = await RetryUtil.withRetry(async () => await apiCall(), {
  maxAttempts: 5,
  delayMs: 2000,
  backoff: true,
  onRetry: attempt => logger.warn(`Retry attempt ${attempt}`),
});
```

## Configuration

```typescript
import { configManager } from '@config/config.manager';

// Get config value
const baseURL = configManager.get('baseURL');

// Get with default
const timeout = configManager.get('timeout', 30000);

// Get nested value
const apiKey = configManager.get('api.authentication.key');
```

## Validation

```typescript
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from '@utils/validation-transform';

// Email validation
if (!validateEmail(email)) {
  throw new Error('Invalid email');
}

// Password validation
if (!validatePassword(password)) {
  throw new Error('Weak password');
}

// Sanitize input
const cleanInput = sanitizeInput(userInput);
```

## Performance

```typescript
import { LighthouseRunner, getPerformanceMetrics } from '@utils/performance';

// Run Lighthouse
const runner = new LighthouseRunner();
const report = await runner.run(page, {
  categories: ['performance', 'accessibility'],
});

// Get metrics
const metrics = await getPerformanceMetrics(page);
console.log(metrics.FCP, metrics.LCP);
```

## Accessibility

```typescript
import { auditAccessibility } from '@utils/accessibility';

// Run a11y audit
const results = await auditAccessibility(page, {
  rules: ['wcag2a', 'wcag2aa'],
});

if (results.violations.length > 0) {
  console.log('A11y violations:', results.violations);
}
```

## File Operations

```typescript
import { downloadFile, uploadFile } from '@utils/ui';

// Download
const downloadPath = await downloadFile(page, 'button[download]');
console.log('Downloaded to:', downloadPath);

// Upload
await uploadFile(page, 'input[type="file"]', '/path/to/file.pdf');
```
