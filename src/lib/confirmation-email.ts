import { copy, type Lang } from "@/app/data/content";
import { site } from "@/app/data/site";

// Brand colors, inlined because email clients ignore stylesheets and CSS variables.
const FOG = "#ECE8DF";
const PAPER = "#F7F5F0";
const LINE = "#E4E0D6";
const INK = "#0F1220";
const NAVY = "#1B2238";
const SLATE = "#43465A";
const GRAPHITE = "#5E6070";
const TANGERINE = "#F07A2E";
const SANS = "Manrope,Helvetica,Arial,sans-serif";
const MONO = "'Courier New',Courier,monospace";

/**
 * First name to greet the visitor with, or null. Only plain names are used
 * (letters, marks, apostrophes and hyphens, max 30 characters), so the name field
 * can't be used to smuggle links or spam text into email sent from our domain.
 */
export function safeFirstName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return /^[\p{L}\p{M}'’-]{1,30}$/u.test(first) ? first : null;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Receipt number, e.g. SG-20260930 (date in Bogotá). */
function receiptId(now: Date) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/-/g, "");
  return `SG-${ymd}`;
}

/** The "sg" brand mark as nested tables, so it survives Outlook and Gmail. */
const MARK = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="36" height="36" valign="top" style="width:36px;height:36px;background:${NAVY};border-radius:8px;"><table role="presentation" width="36" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:5px 0 0 6px;font-family:${SANS};font-size:13px;line-height:13px;mso-line-height-rule:exactly;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">sg</td></tr><tr><td align="right" style="padding:2px 5px 5px 0;line-height:9px;font-size:0;"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TANGERINE};"></span></td></tr></table></td></tr></table>`;

/** Dashed "tear line" with notches, between receipt sections. */
const TEAR = `<tr><td style="background:${PAPER};padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="14" style="width:14px;background:${FOG};border-radius:0 14px 14px 0;font-size:0;line-height:28px;">&nbsp;</td><td style="padding:0 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px dashed ${LINE};font-size:0;line-height:0;">&nbsp;</td></tr></table></td><td width="14" style="width:14px;background:${FOG};border-radius:14px 0 0 14px;font-size:0;line-height:28px;">&nbsp;</td></tr></table></td></tr>`;

/**
 * The receipt-style "thanks for reaching out" email sent to the visitor.
 * It never repeats what they wrote, so the form can't relay arbitrary content.
 */
export function renderConfirmationEmail(
  lang: Lang,
  name: string,
  now = new Date(),
) {
  const t = copy[lang];
  const c = t.confirmationEmail;
  const up = (s: string) => s.toLocaleUpperCase(lang);
  const first = safeFirstName(name);
  const intro = first ? c.intro.replace("{name}", first) : c.introNoName;
  const siteHost = new URL(site.url).host.replace(/^www\./, "");
  const footnote = c.footnote.replace("{site}", siteHost);
  const receipt = receiptId(now);

  const links = [
    { title: t.talks.title, meta: c.talkMeta, url: t.talks.link },
    {
      title: c.linkedinTitle,
      meta: c.linkedinMeta,
      url: site.socials.linkedin,
    },
  ];

  const rows = c.rows
    .map(([label, value], i) => {
      const border = i === 0 ? PAPER : LINE;
      const dot =
        i === 0
          ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${TANGERINE};"></span>&nbsp; `
          : "";
      return `<tr><td width="45%" style="border-top:1px solid ${border};padding:14px 0;font-family:${MONO};font-size:12px;line-height:18px;letter-spacing:1px;color:${GRAPHITE};">${esc(up(label))}</td><td align="right" style="border-top:1px solid ${border};padding:14px 0;font-family:${SANS};font-size:15px;line-height:20px;font-weight:700;color:${INK};">${dot}${esc(value)}</td></tr>`;
    })
    .join("");

  const linkRows = links
    .map((l, i) => {
      const top = i === 0 ? `2px solid ${NAVY}` : `1px solid ${LINE}`;
      const bottom =
        i === links.length - 1 ? `border-bottom:1px solid ${LINE};` : "";
      return `<tr><td style="border-top:${top};${bottom}padding:16px 0;"><a href="${esc(l.url)}" style="font-family:${SANS};font-size:17px;line-height:24px;font-weight:700;color:${INK};text-decoration:none;">${esc(l.title)}&nbsp;&rarr;</a><br><span style="font-family:${MONO};font-size:11px;letter-spacing:1px;color:${GRAPHITE};">${esc(up(l.meta))}</span></td></tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${esc(c.title)}</title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]-->
<style>@media (max-width:620px){.wrap{width:100% !important}.pad{padding-left:24px !important;padding-right:24px !important}.h1{font-size:30px !important;line-height:36px !important}.stack{display:block !important;width:100% !important;text-align:left !important}}
:root{color-scheme:light only}</style></head>
<body style="margin:0;padding:0;background:${FOG};-webkit-text-size-adjust:100%;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${FOG};">${esc(c.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${FOG};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td class="pad" style="background:${PAPER};border-radius:12px 12px 0 0;padding:32px 40px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="stack" valign="top"><p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${GRAPHITE};">${esc(up(c.receipt))}</p><p style="margin:0;font-family:${MONO};font-size:14px;letter-spacing:1px;font-weight:bold;color:${INK};">${receipt}</p></td>
<td class="stack" align="right" valign="top">${MARK}</td></tr></table>
<h1 class="h1" style="margin:36px 0 10px;font-family:${SANS};font-size:40px;line-height:44px;mso-line-height-rule:exactly;font-weight:700;letter-spacing:-1.5px;color:${INK};">${esc(c.headline[0])}<br>${esc(c.headline[1])}<span style="color:${TANGERINE};">.</span></h1>
<p style="margin:0;font-family:${SANS};font-size:16px;line-height:26px;mso-line-height-rule:exactly;color:${SLATE};">${esc(intro)}</p>
</td></tr>
${TEAR}
<tr><td class="pad" style="background:${PAPER};padding:20px 40px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
${TEAR}
<tr><td style="background:${PAPER};font-size:0;line-height:16px;">&nbsp;</td></tr>
<tr><td class="pad" style="background:${PAPER};padding:8px 40px 0;">
<p style="margin:0 0 12px;font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:1px;color:${GRAPHITE};">${esc(up(c.whileYouWait))}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${linkRows}</table></td></tr>
<tr><td class="pad" style="background:${PAPER};border-radius:0 0 12px 12px;padding:28px 40px 36px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${MARK}</td><td style="padding-left:12px;" valign="middle"><p style="margin:0;font-family:${SANS};font-size:15px;line-height:20px;font-weight:700;color:${INK};">${esc(site.fullName)}</p><p style="margin:2px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${GRAPHITE};">${esc(up(c.role))}</p></td></tr></table>
</td></tr>
<tr><td class="pad" style="padding:20px 40px 0;font-family:${SANS};font-size:12px;line-height:18px;color:${GRAPHITE};">${esc(footnote)}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `${up(c.receipt)} ${receipt}`,
    "",
    `${c.headline.join(" ")}.`,
    intro,
    "",
    ...c.rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `${up(c.whileYouWait)}`,
    ...links.map((l) => `- ${l.title}: ${l.url}`),
    "",
    site.fullName,
    c.role,
    "",
    "—",
    footnote,
  ].join("\n");

  return { subject: c.subject, html, text };
}
