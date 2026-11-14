import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Suscripción",
  robots: { index: false, follow: false },
};

const STATES: Record<string, { title: string; body: string }> = {
  confirmada: {
    title: "¡Listo! Ya estás suscrito.",
    body: "Recibirás la próxima edición del boletín en tu correo.",
  },
  "ya-confirmada": {
    title: "Tu suscripción está activa.",
    body: "No tienes que hacer nada más: la próxima edición llegará a tu correo.",
  },
  expirada: {
    title: "El enlace venció.",
    body: "Suscríbete de nuevo para recibir uno nuevo.",
  },
  invalida: {
    title: "Lo sentimos, este enlace no funcionó.",
    body: "Vuelve a suscribirte desde el blog y te enviaremos un enlace nuevo.",
  },
  error: {
    title: "Lo sentimos, algo salió mal.",
    body: "No pudimos confirmar tu suscripción. Inténtalo de nuevo en unos minutos.",
  },
};

const DEFAULT_STATE = {
  title: "Revisa tu correo",
  body: "Te enviamos un enlace para confirmar tu suscripción. Si no lo ves, mira en spam.",
};

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const { estado } = await searchParams;
  const key = typeof estado === "string" ? estado : "";
  const state = Object.hasOwn(STATES, key) ? STATES[key] : DEFAULT_STATE;

  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto w-full max-w-[640px] px-[clamp(16px,4vw,40px)] pt-14 pb-24 focus:outline-none"
    >
      <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight font-extrabold tracking-[-.03em] text-ink">
        {state.title}
      </h1>
      <p className="mt-4 text-lg text-slate">{state.body}</p>
      <p className="mt-10">
        <Link href="/blog" className="text-graphite underline underline-offset-4 hover:text-ink">
          Volver al blog
        </Link>
      </p>
    </main>
  );
}
