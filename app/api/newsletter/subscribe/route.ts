import { NextResponse } from "next/server";
import { site } from "@/app/data/site";
import type { NewsletterResponse } from "@/lib/newsletter/constants";
import { getSubscriber, touchLink, upsertPending } from "@/lib/newsletter/db";
import { SubscribeSchema } from "@/lib/newsletter/email";
import { renderConfirmEmail } from "@/lib/newsletter/emails";
import { sendEmail } from "@/lib/newsletter/resend";
import { getNewsletterSecret } from "@/lib/newsletter/secret";
import { handleSubscribe } from "@/lib/newsletter/subscribe";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// 5 requests per IP per 10 minutes (in memory).
const rateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function reply(body: NewsletterResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return reply({ ok: false, error: "rate_limited" }, 429);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return reply({ ok: false, error: "invalid" }, 400);
  }

  // Honeypot filled: pretend it worked and store nothing.
  if (
    typeof json === "object" &&
    json !== null &&
    "company" in json &&
    typeof json.company === "string" &&
    json.company.trim()
  ) {
    return reply({ ok: true });
  }

  const parsed = SubscribeSchema.safeParse(json);
  if (!parsed.success) return reply({ ok: false, error: "invalid" }, 400);

  const secret = getNewsletterSecret();
  if (!secret) return reply({ ok: false, error: "server" }, 500);

  try {
    await handleSubscribe(parsed.data, ip, {
      getSubscriber,
      upsertPending,
      touchLink,
      sendConfirmEmail: async (email, confirmUrl) => {
        const { subject, html, text } = renderConfirmEmail(confirmUrl);
        await sendEmail({ to: email, subject, html, text });
      },
      secret,
      siteUrl: site.url,
      now: () => Date.now(),
    });
  } catch (err) {
    console.error("[newsletter] subscribe failed", err instanceof Error ? err.message : "unknown");
    return reply({ ok: false, error: "server" }, 500);
  }
  return reply({ ok: true });
}
