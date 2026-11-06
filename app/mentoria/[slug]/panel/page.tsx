import { notFound } from "next/navigation";
import { getPlan } from "@/app/data/mentoria";
import { todayInBogota } from "@/app/components/mentoria/dates";
import { LoginCard } from "@/app/components/mentoria/login-card";
import { MentorView } from "@/app/components/mentoria/mentor-view";
import { getRole } from "@/lib/mentoria/auth";
import { readState } from "@/lib/mentoria/db";

export const metadata = { title: "Panel de mentoría" };

export default async function MentorPanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = getPlan(slug);
  if (!plan) notFound();

  if ((await getRole(slug)) !== "mentor") {
    return (
      <LoginCard
        slug={slug}
        view="panel"
        title="Panel del mentor"
        hint={`Seguimiento de la mentoría con ${plan.mentee.fullName}.`}
      />
    );
  }

  return <MentorView plan={plan} initial={await readState(slug)} today={todayInBogota()} />;
}
