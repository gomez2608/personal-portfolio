// Kept free of `server-only` so it can be tested with a fake client. resend.ts wires the real one.

type Result = { error: { message: string } | null };

/** The slice of `resend.contacts` this module needs. */
export type ContactsApi = {
  create(p: { email: string; unsubscribed?: boolean; segments: { id: string }[] }): Promise<Result>;
  update(p: { email: string; unsubscribed: boolean }): Promise<Result>;
  segments: { add(p: { email: string; segmentId: string }): Promise<Result> };
};

/**
 * Puts a confirmed address in the newsletter segment.
 * - resubscribe: true (fresh consent): create it subscribed, or set an existing contact back to
 *   unsubscribed:false and add it to the segment.
 * - resubscribe: false (stale link): only heal. Create the contact if it is missing and make sure it
 *   is in the segment, but never touch the unsubscribed flag of an existing contact.
 */
export async function syncContact(
  contacts: ContactsApi,
  segmentId: string,
  email: string,
  { resubscribe }: { resubscribe: boolean },
): Promise<void> {
  const segments = [{ id: segmentId }];
  const created = await contacts.create(
    resubscribe ? { email, unsubscribed: false, segments } : { email, segments },
  );
  if (!created.error) return;

  if (resubscribe) {
    const updated = await contacts.update({ email, unsubscribed: false });
    if (updated.error) {
      throw new Error(`Resend: could not add contact (${created.error.message}; ${updated.error.message})`);
    }
  }
  const added = await contacts.segments.add({ email, segmentId });
  if (added.error) throw new Error(`Resend: could not add to segment (${added.error.message})`);
}
