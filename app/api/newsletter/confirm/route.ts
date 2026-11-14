import { NextResponse } from "next/server";
import { handleConfirm, type ConfirmResult } from "@/lib/newsletter/confirm";
import { markConfirmed } from "@/lib/newsletter/db";
import { addToSegment } from "@/lib/newsletter/resend";
import { getNewsletterSecret } from "@/lib/newsletter/secret";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const secret = getNewsletterSecret();

  const result: ConfirmResult = secret
    ? await handleConfirm(token, { markConfirmed, addToSegment, secret, now: () => Date.now() })
    : "error";

  const res = NextResponse.redirect(new URL(`/blog/suscripcion?estado=${result}`, url), 303);
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
