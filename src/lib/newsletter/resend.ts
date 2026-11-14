import "server-only";
import { Resend } from "resend";

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

// Creates the contact in the segment; if it already exists, makes sure it is
// subscribed again and in the segment.
export async function addToSegment(email: string): Promise<void> {
  const resend = client();
  const segment = segmentId();
  const created = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: segment }],
  });
  if (!created.error) return;

  const updated = await resend.contacts.update({ email, unsubscribed: false });
  if (updated.error) {
    throw new Error(`Resend: could not add contact (${created.error.message}; ${updated.error.message})`);
  }
  const added = await resend.contacts.segments.add({ email, segmentId: segment });
  if (added.error) throw new Error(`Resend: could not add to segment (${added.error.message})`);
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
