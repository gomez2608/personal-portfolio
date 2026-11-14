import {
  FOG,
  GRAPHITE,
  INK,
  LINE,
  MARK,
  MONO,
  NAVY,
  PAPER,
  SANS,
  SLATE,
  TANGERINE,
  esc,
} from "@/src/lib/confirmation-email";

export type IssuePost = {
  slug: string;
  title: string;
  blurb: string;
  url: string;
  imageUrl: string;
};

export type IssueMeta = {
  issue: number;
  subject: string;
  preheader: string;
  intro: string;
};

/** Returns the URL only if it is http(s); throws otherwise so a bad send fails loudly. */
export function safeUrl(u: string): string {
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    throw new Error(`Invalid URL in email: ${u}`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`Unsafe URL scheme in email: ${parsed.protocol}`);
  }
  return u;
}

type Rendered = { subject: string; html: string; text: string };

const UNSUB = "{{{RESEND_UNSUBSCRIBE_URL}}}";
// Content width: 600px card minus 40px padding on each side. Images are 1200x630.
const CONTENT_W = 520;
const IMG_H = Math.round((CONTENT_W * 630) / 1200);

const HEAD = (title: string) => `<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${esc(title)}</title>
<!--[if mso]><style>table,td,div,p,a{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]-->
<style>@media (max-width:620px){.wrap{width:100% !important}.pad{padding-left:24px !important;padding-right:24px !important}.h1{font-size:30px !important;line-height:36px !important}.fluid{width:100% !important;height:auto !important}}
:root{color-scheme:light only}</style></head>`;

const preheaderDiv = (s: string) =>
  `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${FOG};">${esc(s)}</div>`;

/** Wraps rows in the 600px outer shell shared by both emails. */
function shell(title: string, preheader: string, rows: string, below: string) {
  return `${HEAD(title)}
<body style="margin:0;padding:0;background:${FOG};-webkit-text-size-adjust:100%;">
${preheaderDiv(preheader)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${FOG};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
${rows}
${below}
</table></td></tr></table></body></html>`;
}

const brandRow = (label: string) =>
  `<tr><td class="pad" style="background:${PAPER};border-radius:12px 12px 0 0;padding:32px 40px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:1px;color:${GRAPHITE};">${esc(label.toLocaleUpperCase("es"))}</td>
<td align="right" valign="middle">${MARK}</td></tr></table></td></tr>`;

const para = (s: string, extra = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:26px;mso-line-height-rule:exactly;color:${SLATE};${extra}">${esc(s)}</p>`;

export function renderConfirmEmail(confirmUrl: string): Rendered {
  const subject = "Confirma tu suscripción al boletín";
  const preheader = "Un clic para confirmar y empezar a recibir el boletín.";
  const url = esc(safeUrl(confirmUrl));

  const rows = `${brandRow("Boletín")}
<tr><td class="pad" style="background:${PAPER};border-radius:0 0 12px 12px;padding:28px 40px 36px;">
<h1 class="h1" style="margin:0 0 14px;font-family:${SANS};font-size:36px;line-height:42px;mso-line-height-rule:exactly;font-weight:700;letter-spacing:-1.2px;color:${INK};">Confirma tu suscripción</h1>
${para("Pediste recibir el boletín quincenal: un resumen de investigación en inteligencia artificial, explicado de forma simple. Confirma tu correo para empezar a recibirlo.")}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px;"><tr><td align="center" bgcolor="${NAVY}" style="background:${NAVY};border-radius:8px;border-bottom:3px solid ${TANGERINE};"><a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:16px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;">Confirmar suscripción</a></td></tr></table>
<p style="margin:0 0 6px;font-family:${SANS};font-size:14px;line-height:22px;color:${GRAPHITE};">El enlace vence en 7 días. Si el botón no funciona, copia esta dirección en tu navegador:</p>
<p style="margin:0 0 20px;font-family:${MONO};font-size:12px;line-height:18px;word-break:break-all;"><a href="${url}" style="color:${NAVY};text-decoration:underline;">${url}</a></p>
<p style="margin:0;padding-top:16px;border-top:1px solid ${LINE};font-family:${SANS};font-size:14px;line-height:22px;color:${GRAPHITE};">Si no fuiste tú, ignora este correo y no se te suscribirá a nada.</p>
</td></tr>`;

  const html = shell(subject, preheader, rows, "");
  const text = [
    "Confirma tu suscripción",
    "",
    "Pediste recibir el boletín quincenal: un resumen de investigación en inteligencia artificial, explicado de forma simple.",
    "",
    "Confirmar suscripción:",
    confirmUrl,
    "",
    "El enlace vence en 7 días.",
    "Si no fuiste tú, ignora este correo.",
  ].join("\n");
  return { subject, html, text };
}

export function renderIssueEmail(
  issue: IssueMeta,
  posts: IssuePost[],
  siteUrl: string,
): Rendered {
  const base = safeUrl(siteUrl).replace(/\/+$/, "");
  const privacyUrl = `${base}/privacidad`;
  const paragraphs = issue.intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const postBlocks = posts
    .map((p, i) => {
      safeUrl(p.url);
      safeUrl(p.imageUrl);
      const top = i === 0 ? `2px solid ${NAVY}` : `1px solid ${LINE}`;
      return `<tr><td class="pad" style="background:${PAPER};padding:${i === 0 ? "8px" : "0"} 40px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:${top};padding:28px 0 32px;">
<a href="${esc(p.url)}" style="text-decoration:none;"><img src="${esc(p.imageUrl)}" width="${CONTENT_W}" height="${IMG_H}" alt="${esc(p.title)}" class="fluid" style="display:block;width:100%;max-width:${CONTENT_W}px;height:auto;border:0;border-radius:8px;outline:none;text-decoration:none;"></a>
<h2 style="margin:20px 0 8px;font-family:${SANS};font-size:22px;line-height:28px;mso-line-height-rule:exactly;font-weight:700;letter-spacing:-0.4px;"><a href="${esc(p.url)}" style="color:${INK};text-decoration:none;">${esc(p.title)}</a></h2>
${para(p.blurb, "margin-bottom:14px;")}
<a href="${esc(p.url)}" style="font-family:${SANS};font-size:15px;line-height:22px;font-weight:700;color:${NAVY};text-decoration:underline;">Leer la explicación &rarr;</a>
</td></tr></table></td></tr>`;
    })
    .join("\n");

  const rows = `${brandRow("Boletín")}
<tr><td class="pad" style="background:${PAPER};padding:28px 40px 24px;">
<p style="margin:0 0 8px;font-family:${MONO};font-size:12px;line-height:18px;letter-spacing:1px;font-weight:bold;color:${INK};"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${TANGERINE};"></span>&nbsp; EDICIÓN ${issue.issue}</p>
<h1 class="h1" style="margin:0 0 20px;font-family:${SANS};font-size:36px;line-height:42px;mso-line-height-rule:exactly;font-weight:700;letter-spacing:-1.2px;color:${INK};">${esc(issue.subject)}</h1>
${paragraphs.map((p) => para(p)).join("\n")}
</td></tr>
${postBlocks}
<tr><td class="pad" style="background:${PAPER};border-radius:0 0 12px 12px;padding:24px 40px 32px;border-top:1px solid ${LINE};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${MARK}</td><td style="padding-left:12px;" valign="middle"><p style="margin:0;font-family:${SANS};font-size:15px;line-height:20px;font-weight:700;color:${INK};">Sebastián Gómez</p></td></tr></table>
</td></tr>`;

  const below = `<tr><td class="pad" style="padding:20px 40px 0;font-family:${SANS};font-size:12px;line-height:20px;color:${GRAPHITE};">Recibes esto porque te suscribiste en sebastiangomezahumada.com/blog.<br><a href="${UNSUB}" style="color:${GRAPHITE};text-decoration:underline;">Darte de baja</a> &nbsp;·&nbsp; <a href="${esc(privacyUrl)}" style="color:${GRAPHITE};text-decoration:underline;">Política de privacidad</a></td></tr>`;

  const html = shell(issue.subject, issue.preheader, rows, below);
  const text = [
    `EDICIÓN ${issue.issue}`,
    issue.subject,
    "",
    paragraphs.join("\n\n"),
    "",
    ...posts.flatMap((p) => [
      p.title,
      p.blurb,
      `Leer la explicación: ${p.url}`,
      "",
    ]),
    "—",
    "Recibes esto porque te suscribiste en sebastiangomezahumada.com/blog.",
    `Darte de baja: ${UNSUB}`,
    `Privacidad: ${privacyUrl}`,
  ].join("\n");
  return { subject: issue.subject, html, text };
}
