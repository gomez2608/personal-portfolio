/**
 * The Chromium binary `blog:snap` should launch: `CHROME_PATH` when it's set (cloud
 * sandboxes that ship their own Chrome), otherwise undefined so Playwright uses its own.
 */
export function resolveChromePath(env: Record<string, string | undefined>): string | undefined {
  const value = env.CHROME_PATH;
  return value ? value : undefined;
}
