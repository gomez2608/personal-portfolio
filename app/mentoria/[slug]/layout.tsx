import type { Metadata } from "next";
import { MentoriaTopBar } from "@/app/components/mentoria/mentoria-shell";

export const metadata: Metadata = {
  title: "Mentoría",
  robots: { index: false, follow: false, nocache: true },
};

export default function MentoriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className="min-h-svh bg-bg">
      <MentoriaTopBar />
      {children}
    </div>
  );
}
