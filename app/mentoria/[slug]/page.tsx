import { notFound } from "next/navigation";
import { getPlan, toMenteePlan } from "@/app/data/mentoria";
import { todayInBogota } from "@/app/components/mentoria/dates";
import { LoginCard } from "@/app/components/mentoria/login-card";
import { MenteeView } from "@/app/components/mentoria/mentee-view";
import { getRole } from "@/lib/mentoria/auth";
import { readState } from "@/lib/mentoria/db";

export default async function MenteePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();

  const role = await getRole(slug);
  if (!role) {
    return (
      <LoginCard
        slug={slug}
        view="mentee"
        title={`Hola, ${plan.mentee.firstName}`}
        hint={`Escribe el código que te compartió ${plan.mentor.firstName} para ver tu plan de mentoría.`}
      />
    );
  }

  // Mentor notes never leave the server on this route.
  const { progress, sessions, menteeNotes } = await readState(slug);
  const state = { progress, sessions, menteeNotes };
  return <MenteeView plan={toMenteePlan(plan)} initial={state} today={todayInBogota()} isMentor={role === "mentor"} />;
}
