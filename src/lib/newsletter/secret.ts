// Server-only. Returns NEWSLETTER_SECRET when it is set and at least 32 characters, else null.
// Never log the value itself.
export function getNewsletterSecret(): string | null {
  const s = process.env.NEWSLETTER_SECRET;
  if (!s || s.length < 32) {
    console.error("[newsletter] NEWSLETTER_SECRET is missing or shorter than 32 characters");
    return null;
  }
  return s;
}
