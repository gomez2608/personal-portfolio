import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ContactResponse } from "@/lib/contact";
import { contactSchema } from "@/lib/contact-schema";
import { renderConfirmationEmail } from "@/lib/confirmation-email";
import { site } from "@/app/data/site";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Sender shown in inboxes: "Sebastian Gomez <contact@sebastiangomezahumada.com>".
// CONTACT_FROM_EMAIL overrides it (e.g. onboarding@resend.dev for testing).
const FROM =
  process.env.CONTACT_FROM_EMAIL ??
  `${site.name} <contact@${new URL(site.url).host.replace(/^www\./, "")}>`;

// 5 requests per IP per 10 minutes (in memory, see src/lib/rate-limit.ts).
const rateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function reply(body: ContactResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return reply({ ok: false, error: "rate_limited" }, 429);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return reply({ ok: false, error: "invalid" }, 400);
  }

  // Honeypot filled: pretend it worked and send nothing.
  if (
    typeof json === "object" &&
    json !== null &&
    "company" in json &&
    typeof json.company === "string" &&
    json.company.trim()
  ) {
    return reply({ ok: true });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return reply({ ok: false, error: "invalid" }, 400);
  }
  const { reason, name, email, message, lang } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return reply({ ok: false, error: "server" }, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: email,
      subject: `[Portfolio] ${reason} — ${name}`,
      text: [
        `Reason: ${reason}`,
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    });
    if (error) {
      console.error("[contact] Resend error", error);
      return reply({ ok: false, error: "server" }, 500);
    }

    // Confirmation to the visitor: fixed copy only (never echoes their message).
    // Best-effort: the owner already has the message, so a failure here isn't an error.
    try {
      const confirmation = renderConfirmationEmail(lang, name);
      const { error: confirmError } = await resend.emails.send({
        from: FROM,
        to: email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      });
      if (confirmError) {
        console.error("[contact] confirmation email failed", confirmError);
      }
    } catch (err) {
      console.error("[contact] confirmation email failed", err);
    }
  } catch (err) {
    console.error("[contact] send failed", err);
    return reply({ ok: false, error: "server" }, 500);
  }

  return reply({ ok: true });
}
