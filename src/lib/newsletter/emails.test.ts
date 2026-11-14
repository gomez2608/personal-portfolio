import { expect, test } from "vitest";
import { renderConfirmEmail, renderIssueEmail, type IssuePost } from "./emails";

const issue = { issue: 3, subject: "Edición 3: modelos que razonan", preheader: "Dos papers explicados simple", intro: "Hola.\n\nEsta edición trae dos papers." };
const post = (slug: string): IssuePost => ({ slug, title: `Post ${slug}`, blurb: `Resumen ${slug}`, url: `https://x.co/blog/${slug}`, imageUrl: `https://x.co/blog/${slug}/og.png` });

test("confirm email links the URL and states expiry", () => {
  const e = renderConfirmEmail("https://x.co/api/newsletter/confirm?token=a.b.c");
  expect(e.subject).toBe("Confirma tu suscripción al boletín");
  expect(e.html).toContain('href="https://x.co/api/newsletter/confirm?token=a.b.c"');
  expect(e.text).toContain("7 días");
  expect(e.html).toContain("Si no fuiste tú, ignora este correo");
});
test("issue email has every post link, unsubscribe placeholder and privacy link", () => {
  const e = renderIssueEmail(issue, [post("a"), post("b")], "https://x.co");
  expect(e.html).toContain("https://x.co/blog/a");
  expect(e.html).toContain("https://x.co/blog/b");
  expect(e.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  expect(e.html).toContain("https://x.co/privacidad");
  expect(e.text).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  expect(e.subject).toBe(issue.subject);
  expect(e.html).toContain("Edición 3");
});
test("each intro paragraph is its own p; image has dimensions and alt", () => {
  const e = renderIssueEmail(issue, [post("a")], "https://x.co");
  expect(e.html).toContain(">Hola.</p>");
  expect(e.html).toContain(">Esta edición trae dos papers.</p>");
  expect(e.html).toMatch(/<img[^>]+width="520"[^>]+height="273"[^>]+alt="Post a"/);
});
test("escapes HTML in titles and blurbs", () => {
  const html = renderIssueEmail(issue, [{ ...post("a"), title: '<script>"x"</script>', blurb: "<b>hi</b>" }], "https://x.co").html;
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("<b>hi");
});
test("tangerine is never a text color", () => {
  expect(renderIssueEmail(issue, [post("a")], "https://x.co").html).not.toMatch(/(?<!background-)color:\s*#F07A2E/i);
  expect(renderConfirmEmail("https://x.co/c").html).not.toMatch(/(?<!background-)color:\s*#F07A2E/i);
});
