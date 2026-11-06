"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { editableItemIds, getPlan } from "@/app/data/mentoria";
import { clearSession, cookiePath, getRole, loginRateLimited, roleForCode, setSession } from "@/lib/mentoria/auth";
import { writeItemStatus, writeNote, writeSessionField } from "@/lib/mentoria/db";

// Server actions are public endpoints: every one re-checks the cookie and the input.

export type LoginState = { error?: string };
export type SaveResult = { ok: boolean };

const MAX_TEXT = 5000;
const itemStatus = z.enum(["pendiente", "curso", "hecho"]);
const sessionStatus = z.enum(["pendiente", "realizada", "reprogramada"]);
const text = z.string().max(MAX_TEXT);

export async function login(
  slug: string,
  view: "mentee" | "panel",
  _prev: LoginState,
  form: FormData,
): Promise<LoginState> {
  const plan = getPlan(slug);
  if (!plan) return { error: "No encontramos esta mentoría." };
  if (await loginRateLimited(slug)) return { error: "Demasiados intentos. Espera unos minutos." };
  const role = roleForCode(plan, String(form.get("code") ?? ""));
  if (!role) return { error: "Ese código no es válido." };
  if (view === "panel" && role !== "mentor") return { error: "Ese código no da acceso al panel del mentor." };
  await setSession(slug, role);
  redirect(view === "panel" ? `${cookiePath(slug)}/panel` : cookiePath(slug));
}

export async function logout(slug: string) {
  if (!getPlan(slug)) return;
  await clearSession(slug);
  redirect(cookiePath(slug));
}

async function authorize(slug: string) {
  const plan = getPlan(slug);
  const role = plan ? await getRole(slug) : null;
  return plan && role ? { plan, role } : null;
}

export async function saveItemStatus(slug: string, id: string, status: string): Promise<SaveResult> {
  const auth = await authorize(slug);
  const st = itemStatus.safeParse(status);
  if (!auth || !st.success || !editableItemIds(auth.plan, auth.role).has(id)) return { ok: false };
  await writeItemStatus(slug, id, st.data);
  return { ok: true };
}

export async function saveSessionStatus(slug: string, sessionId: string, status: string): Promise<SaveResult> {
  const auth = await authorize(slug);
  const st = sessionStatus.safeParse(status);
  if (auth?.role !== "mentor" || !st.success || !auth.plan.sessions.some((s) => s.id === sessionId)) return { ok: false };
  await writeSessionField(slug, sessionId, "status", st.data);
  return { ok: true };
}

export async function saveAcuerdos(slug: string, sessionId: string, value: string): Promise<SaveResult> {
  const auth = await authorize(slug);
  const v = text.safeParse(value);
  if (auth?.role !== "mentor" || !v.success || !auth.plan.sessions.some((s) => s.id === sessionId)) return { ok: false };
  await writeSessionField(slug, sessionId, "acuerdos", v.data);
  return { ok: true };
}

/** Mentor notes are private; mentee notes are the mentee's own and visible to the mentor. */
export async function saveNote(
  slug: string,
  who: "mentor" | "mentee",
  sessionId: string,
  value: string,
): Promise<SaveResult> {
  const auth = await authorize(slug);
  const v = text.safeParse(value);
  if (!auth || !v.success || !auth.plan.sessions.some((s) => s.id === sessionId)) return { ok: false };
  // The mentor may only write mentor notes, the mentee only mentee notes.
  if ((who === "mentor") !== (auth.role === "mentor")) return { ok: false };
  await writeNote(slug, who, sessionId, v.data);
  return { ok: true };
}
