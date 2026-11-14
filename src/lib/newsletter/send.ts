import { renderIssueEmail, type IssuePost } from "./emails";
import type { Issue } from "./issue";

// Kept free of `server-only` and of network modules: the CLI injects the real deps.

export type SendDeps = {
  claimSend(issue: number): Promise<"claimed" | "sending" | "sent">;
  markSent(issue: number, broadcastId: string): Promise<void>;
  isLive(url: string): Promise<boolean>;
  sleep(ms: number): Promise<void>;
  sendBroadcast(e: { name: string; subject: string; html: string; text: string }): Promise<string>;
  log(msg: string): void;
};

export type SendResult = "sent" | "already-sent" | "stuck" | "not-live";

async function live(deps: SendDeps, url: string): Promise<boolean> {
  try {
    return await deps.isLive(url);
  } catch {
    return false;
  }
}

/**
 * Sends an issue at most once. Order: wait until every post is live (no claim yet),
 * claim the issue in the DB, broadcast, mark sent. A claimed issue is never retried:
 * if the broadcast or markSent fails, the claim stays "sending" and a later run
 * reports "stuck" for a human to check.
 */
export async function sendIssue(
  issue: Issue,
  posts: IssuePost[],
  opts: { siteUrl: string; waitMs: number; pollMs: number },
  deps: SendDeps,
): Promise<SendResult> {
  // Render first so a bad URL fails before anything is claimed.
  const email = renderIssueEmail(issue, posts, opts.siteUrl);

  // 1. Live check. Elapsed time is counted from the sleeps, so tests can fake the clock.
  let pending = posts;
  let waited = 0;
  for (;;) {
    const results = await Promise.all(pending.map((p) => live(deps, p.url)));
    pending = pending.filter((_, i) => !results[i]);
    if (pending.length === 0 || waited >= opts.waitMs) break;
    deps.log(`Waiting for ${pending.length} post(s) to go live: ${pending.map((p) => p.slug).join(", ")}`);
    const step = Math.max(1, Math.min(opts.pollMs, opts.waitMs - waited));
    await deps.sleep(step);
    waited += step;
  }
  if (pending.length > 0) {
    deps.log(
      `Not sent: these posts are not live after ${Math.round(waited / 1000)}s: ${pending
        .map((p) => `${p.slug} (${p.url})`)
        .join(", ")}. Nothing was claimed; deploy and run again.`,
    );
    return "not-live";
  }

  // 2. Claim.
  const claim = await deps.claimSend(issue.issue);
  if (claim === "sent") {
    deps.log(`Issue ${issue.issue} was already sent. Nothing to do.`);
    return "already-sent";
  }
  if (claim === "sending") {
    deps.log(
      `A previous run claimed issue ${issue.issue} but didn't confirm sending. Check the Resend dashboard, then mark it in newsletter_sends.`,
    );
    return "stuck";
  }

  // 3. Broadcast. A failure leaves the claim in place on purpose (no retry).
  const name = `Edición ${issue.issue}`;
  const broadcastId = await deps.sendBroadcast({ name, subject: email.subject, html: email.html, text: email.text });
  deps.log(`Broadcast ${broadcastId} created and sent (${name}).`);

  // 4. Mark sent.
  try {
    await deps.markSent(issue.issue, broadcastId);
  } catch (err) {
    deps.log(
      `Issue ${issue.issue} WAS SENT (broadcast ${broadcastId}) but marking it in newsletter_sends failed. Set status='sent', broadcast_id='${broadcastId}' by hand. Do not resend.`,
    );
    throw err;
  }
  return "sent";
}
