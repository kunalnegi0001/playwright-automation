import { logger } from '@utils/core';

/**
 * Wrap Playwright action and capture screenshot on error.
 */
export const withScreenshotOnError = <
  T extends (page: unknown, ...args: unknown[]) => Promise<unknown>,
>(
  fn: T,
  options: { screenshotPathBuilder?: (testInfo: unknown) => string } = {}
): T => {
  const {
    screenshotPathBuilder = _testInfo =>
      (_testInfo as { outputPath?: (name: string) => string })?.outputPath
        ? (_testInfo as { outputPath: (name: string) => string }).outputPath(
            `error-${Date.now()}.png`
          )
        : `./error-${Date.now()}.png`,
  } = options;

  return (async (page: unknown, ...args: unknown[]) => {
    try {
      return await fn(page, ...args);
    } catch (error) {
      try {
        const testInfo = args.find(
          x =>
            x &&
            typeof x === 'object' &&
            typeof (x as { outputPath?: unknown }).outputPath === 'function'
        );
        const screenshotPath = screenshotPathBuilder(testInfo);
        await (
          page as { screenshot: (opts: { path: string; fullPage: boolean }) => Promise<void> }
        ).screenshot({ path: screenshotPath, fullPage: true });
        logger.error(`Screenshot captured on error: ${screenshotPath}`, error as Error);
      } catch (screenshotError) {
        const errorMessage =
          screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
        logger.warn(`Failed to capture screenshot: ${errorMessage}`);
      }
      throw error;
    }
  }) as T;
};

/**
 * Wrap action in Playwright test.step when available.
 */
export const withStep = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  stepName?: string
): T => {
  return (async (...args: unknown[]) => {
    const testInfo = args.find(
      x => x && typeof x === 'object' && typeof (x as { step?: unknown }).step === 'function'
    ) as { step?: (name: string, fn: () => Promise<unknown>) => Promise<unknown> } | undefined;

    if (!testInfo) {
      return fn(...args);
    }

    return testInfo.step!(stepName || fn.name || 'decorated-step', async () => fn(...args));
  }) as T;
};

/**
 * Wrap function with trace start/stop when context is provided.
 */
export const withTrace = <T extends (context: unknown, ...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: { traceName?: string } = {}
): T => {
  const { traceName = `trace-${Date.now()}.zip` } = options;

  return (async (context: unknown, ...args: unknown[]) => {
    let tracingStarted = false;
    const ctx = context as {
      tracing?: {
        start: (opts: Record<string, boolean>) => Promise<void>;
        stop: (opts: { path: string }) => Promise<void>;
      };
    };
    try {
      if (ctx?.tracing) {
        await ctx.tracing.start({ screenshots: true, snapshots: true, sources: true });
        tracingStarted = true;
      }

      const result = await fn(context, ...args);

      if (tracingStarted) {
        await ctx.tracing!.stop({ path: traceName });
      }

      return result;
    } catch (error) {
      if (tracingStarted) {
        try {
          await ctx.tracing!.stop({ path: traceName });
        } catch {
          // ignore tracing stop failures
        }
      }
      throw error;
    }
  }) as T;
};

/**
 * Wrap Playwright action with auto wait + retry for transient failures.
 */
export const withActionRetry = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: { attempts?: number; delayMs?: number } = {}
): T => {
  const { attempts = 3, delayMs = 300 } = options;

  return (async (...args: unknown[]) => {
    let lastError: unknown;

    for (let i = 1; i <= attempts; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        if (i < attempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          logger.warn(`Retrying action ${fn.name || 'anonymous'} (${i}/${attempts})`);
        }
      }
    }

    throw lastError;
  }) as T;
};
