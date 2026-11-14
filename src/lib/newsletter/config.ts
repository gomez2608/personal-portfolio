import "server-only";

type Env = Record<string, string | undefined>;

const set = (v: string | undefined) => !!v && v.trim() !== "";

/**
 * True when everything the newsletter needs at runtime is set: Resend key and segment, Neon, and a
 * NEWSLETTER_SECRET of at least 32 characters. The signup form and the indexability of /privacidad
 * depend on it. The blog pages are static, so this is evaluated at build time: set the env in
 * Vercel and redeploy to turn the newsletter on.
 */
export function isNewsletterConfigured(env: Env = process.env): boolean {
  return (
    set(env.RESEND_API_KEY) &&
    set(env.RESEND_NEWSLETTER_SEGMENT_ID) &&
    set(env.DATABASE_URL) &&
    set(env.NEWSLETTER_SECRET) &&
    env.NEWSLETTER_SECRET!.length >= 32
  );
}
