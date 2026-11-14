import "server-only";
import { Resend } from "resend";
import { syncContact } from "@/lib/newsletter/contact-sync";

const DEFAULT_FROM = "Sebastián Gómez <boletin@news.sebastiangomezahumada.com>";
const REPLY_TO = "contact@sebastiangomezahumada.com";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function segmentId() {
  const id = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!id) throw new Error("RESEND_NEWSLETTER_SEGMENT_ID is not set");
  return id;
}

export function newsletterFrom(): string {
  return process.env.NEWSLETTER_FROM_EMAIL || DEFAULT_FROM;
}

/** See syncContact: `resubscribe` is true only for fresh consent (a newly confirmed link). */
export async function addToSegment(email: string, opts: { resubscribe: boolean }): Promise<void> {
  await syncContact(client().contacts, segmentId(), email, opts);
}

export async function sendEmail(m: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const { error } = await client().emails.send({
    from: newsletterFrom(),
    to: m.to,
    replyTo: REPLY_TO,
    subject: m.subject,
    html: m.html,
    text: m.text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendBroadcast(m: {
  name: string;
  subject: string;
  html: string;
  text: string;
}): Promise<string> {
  const { data, error } = await client().broadcasts.create({
    segmentId: segmentId(),
    from: newsletterFrom(),
    replyTo: REPLY_TO,
    name: m.name,
    subject: m.subject,
    html: m.html,
    text: m.text,
    send: true,
  });
  if (error || !data) throw new Error(`Resend: ${error?.message ?? "no broadcast id"}`);
  return data.id;
}
