import "server-only";
import { neon } from "@neondatabase/serverless";
import type {
  ItemStatus,
  MentoriaState,
  SessionStatus,
} from "@/app/data/mentoria/types";

// One row per mentee (table mentoria_state in the Neon project "personal-portfolio").
// Every write touches a single key with jsonb_set, so the mentor and the mentee
// editing at the same time never overwrite each other's changes.

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

type Row = {
  progress: MentoriaState["progress"];
  sessions: MentoriaState["sessions"];
  mentor_notes: MentoriaState["mentorNotes"];
  mentee_notes: MentoriaState["menteeNotes"];
};

export async function readState(slug: string): Promise<MentoriaState> {
  const sql = db();
  await sql`INSERT INTO mentoria_state (slug) VALUES (${slug}) ON CONFLICT (slug) DO NOTHING`;
  const rows = (await sql`
    SELECT progress, sessions, mentor_notes, mentee_notes FROM mentoria_state WHERE slug = ${slug}
  `) as Row[];
  const r = rows[0];
  return {
    progress: r?.progress ?? {},
    sessions: r?.sessions ?? {},
    mentorNotes: r?.mentor_notes ?? {},
    menteeNotes: r?.mentee_notes ?? {},
  };
}

export async function writeItemStatus(slug: string, id: string, status: ItemStatus) {
  await db()`
    UPDATE mentoria_state
    SET progress = jsonb_set(progress, ARRAY[${id}::text], to_jsonb(${status}::text)), updated_at = now()
    WHERE slug = ${slug}
  `;
}

export async function writeSessionField(
  slug: string,
  sessionId: string,
  field: "status" | "acuerdos",
  value: SessionStatus | string,
) {
  await db()`
    UPDATE mentoria_state
    SET sessions = jsonb_set(
          sessions,
          ARRAY[${sessionId}::text],
          COALESCE(sessions -> ${sessionId}::text, '{}'::jsonb) || jsonb_build_object(${field}::text, ${value}::text)
        ),
        updated_at = now()
    WHERE slug = ${slug}
  `;
}

export async function writeNote(
  slug: string,
  who: "mentor" | "mentee",
  sessionId: string,
  text: string,
) {
  const sql = db();
  if (who === "mentor") {
    await sql`
      UPDATE mentoria_state
      SET mentor_notes = jsonb_set(mentor_notes, ARRAY[${sessionId}::text], to_jsonb(${text}::text)), updated_at = now()
      WHERE slug = ${slug}
    `;
  } else {
    await sql`
      UPDATE mentoria_state
      SET mentee_notes = jsonb_set(mentee_notes, ARRAY[${sessionId}::text], to_jsonb(${text}::text)), updated_at = now()
      WHERE slug = ${slug}
    `;
  }
}
