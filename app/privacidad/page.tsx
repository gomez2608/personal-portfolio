import type { Metadata } from "next";
import type { ReactNode } from "react";
import { blogSocialMetadata } from "@/lib/blog/metadata";
import { formatDateEs } from "@/lib/blog/format";
import { deploymentEnv } from "@/lib/blog/visibility";
import { isNewsletterConfigured } from "@/lib/newsletter/config";
import { POLICY_VERSION } from "@/lib/newsletter/constants";

const title = "Política de tratamiento de datos";
const description =
  "Cómo se tratan los datos de quienes se suscriben al boletín de Sebastián Gómez Ahumada.";
const CONTACT = "contact@sebastiangomezahumada.com";

// noindex (and out of the sitemap) until the newsletter is configured; evaluated at build.
export function generateMetadata(): Metadata {
  return {
    title,
    description,
    ...blogSocialMetadata({ title, description, path: "/privacidad" }),
    ...(isNewsletterConfigured() ? {} : { robots: { index: false, follow: false } }),
  };
}

function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-2xl leading-tight font-bold tracking-[-.01em] text-ink">
        {heading}
      </h2>
      <div className="mt-4 grid gap-4 text-[17px] leading-[1.7] text-slate">{children}</div>
    </section>
  );
}

const linkClass =
  "font-semibold text-ink underline decoration-current/60 underline-offset-4 hover:decoration-current";

const Mail = () => (
  <a href={`mailto:${CONTACT}`} className={linkClass}>
    {CONTACT}
  </a>
);

export default function PrivacidadPage() {
  const draft = deploymentEnv() !== "production";
  const effective = formatDateEs(POLICY_VERSION);

  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="mx-auto w-full max-w-[68ch] px-[clamp(16px,4vw,40px)] pt-12 pb-24 focus:outline-none"
    >
      {draft ? (
        <p
          role="note"
          className="mb-8 rounded-lg border border-dashed border-line bg-fog px-4 py-2 font-mono text-xs tracking-[.06em] text-graphite uppercase"
        >
          Borrador: pendiente de revisión por Sebastián antes del lanzamiento
        </p>
      ) : null}

      <h1 className="text-[clamp(2rem,5vw,2.75rem)] leading-[1.1] font-extrabold tracking-[-.02em] text-ink">
        {title}
      </h1>
      <p className="mt-4 text-xl leading-snug text-slate">
        Esta política explica qué datos se recogen cuando te suscribes al boletín del blog, para qué se
        usan y cómo puedes ejercer tus derechos.
      </p>
      <p className="mt-5 font-mono text-xs tracking-[.06em] text-graphite uppercase">
        Versión {POLICY_VERSION} · Vigente desde el {effective}
      </p>

      <Section id="responsable" heading="Responsable del tratamiento">
        <p>
          Sebastián Gómez Ahumada, persona natural, con domicilio en Bogotá, Colombia. Para cualquier
          asunto relacionado con tus datos puedes escribir a <Mail />.
        </p>
      </Section>

      <Section id="datos" heading="Qué datos recogemos">
        <p>
          Solo te pedimos tu <strong className="font-semibold text-ink">correo electrónico</strong>. Además,
          como evidencia de tu autorización, guardamos:
        </p>
        <ul className="grid list-disc gap-2 pl-6">
          <li>La fecha y hora en que diste tu consentimiento y, si confirmas, la fecha de confirmación.</li>
          <li>La versión de esta política que aceptaste.</li>
          <li>La página del blog desde la que te suscribiste.</li>
          <li>
            Un hash irreversible de tu dirección IP. No guardamos la IP: solo un valor derivado de ella
            que no permite recuperarla.
          </li>
        </ul>
        <p>No pedimos tu nombre ni ningún otro dato, y no recogemos datos sensibles.</p>
      </Section>

      <Section id="finalidad" heading="Para qué los usamos">
        <p>
          Para enviarte el boletín: un resumen cada dos semanas con ideas recientes de IA explicadas en
          simple, y el correo para confirmar tu suscripción. No vendemos ni compartimos tu correo con
          terceros para otros fines.
        </p>
        <p>
          La suscripción es de doble confirmación: después de registrarte te enviamos un enlace, y solo
          empiezas a recibir el boletín cuando haces clic en él. El enlace vence a los 7 días.
        </p>
      </Section>

      <Section id="base-legal" heading="Base legal">
        <p>
          Tratamos tus datos con base en tu consentimiento previo, expreso e informado, que das al marcar
          la casilla de aceptación y confirmar tu correo, conforme a la Ley 1581 de 2012 y el Decreto 1377
          de 2013 (hoy compilado en el Decreto 1074 de 2015).
        </p>
      </Section>

      <Section id="encargados" heading="Encargados y transmisión internacional">
        <p>Para operar el boletín usamos dos proveedores que tratan los datos por nuestra cuenta:</p>
        <ul className="grid list-disc gap-2 pl-6">
          <li>
            <strong className="font-semibold text-ink">Resend</strong>, para enviar los correos.
          </li>
          <li>
            <strong className="font-semibold text-ink">Neon</strong>, para almacenar el registro de
            suscripción y la evidencia del consentimiento.
          </li>
        </ul>
        <p>
          Sus servidores están fuera de Colombia, por lo que tus datos se transmiten a otro país. Al
          suscribirte autorizas esa transmisión, que se limita a la finalidad descrita arriba.
        </p>
      </Section>

      <Section id="derechos" heading="Tus derechos">
        <p>Como titular de los datos tienes derecho a:</p>
        <ul className="grid list-disc gap-2 pl-6">
          <li>Conocer los datos que tenemos sobre ti y saber cómo se han usado.</li>
          <li>Actualizarlos y rectificarlos si son inexactos o están incompletos.</li>
          <li>Pedir que los suprimamos.</li>
          <li>Revocar en cualquier momento la autorización que diste.</li>
          <li>Pedir prueba de esa autorización.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio, después de haber hecho tu
            consulta o reclamo ante nosotros.
          </li>
        </ul>
        <p>Para ejercerlos tienes dos caminos:</p>
        <ul className="grid list-disc gap-2 pl-6">
          <li>
            Usar el enlace <strong className="font-semibold text-ink">“Darte de baja”</strong> que
            aparece al final de cada boletín. Dejas de recibir el boletín de inmediato.
          </li>
          <li>
            Escribir a <Mail /> desde el correo suscrito, indicando qué necesitas.
          </li>
        </ul>
        <p>
          Respondemos las consultas en un máximo de 10 días hábiles y los reclamos en un máximo de 15
          días hábiles, según los plazos de la Ley 1581 de 2012.
        </p>
      </Section>

      <Section id="conservacion" heading="Cuánto tiempo los conservamos">
        <p>
          Conservamos tus datos mientras estés suscrito. Si te registras pero no confirmas, no recibes el
          boletín, y el registro pendiente se guarda hasta que lo confirmes o nos pidas eliminarlo.
        </p>
        <p>
          Si te das de baja, dejamos de enviarte el boletín de inmediato. Resend conserva tu correo
          marcado como dado de baja, para que no vuelva a recibir envíos, y en Neon guardamos el
          registro de la última autorización que confirmaste (fecha, versión de la política, página de
          origen y hash de la IP), para poder demostrarla. Un enlace de confirmación antiguo no te
          vuelve a suscribir: para volver, tienes que suscribirte de nuevo y confirmar el enlace nuevo.
        </p>
        <p>
          Si quieres que eliminemos tus datos por completo, escríbenos a <Mail /> y los borraremos de
          ambos proveedores.
        </p>
      </Section>

      <Section id="version" heading="Versión y cambios">
        <p>
          Esta es la versión {POLICY_VERSION} de la política, vigente desde el {effective}. Si la
          cambiamos de forma relevante, publicaremos la nueva versión en esta página con su fecha y te
          avisaremos por correo antes de aplicarla.
        </p>
      </Section>
    </main>
  );
}
