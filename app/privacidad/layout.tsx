import Header from "@/app/components/header/header";

/** Spanish page shell for the privacy policy, mirroring the blog layout. */
export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es" className="min-h-svh bg-bg text-ink">
      <a
        href="#contenido"
        className="sr-only z-[70] rounded-lg bg-paper px-4 py-3 text-sm font-semibold text-hero focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>
      <Header />
      {/* The shared header is fixed; this keeps the page clear of it. */}
      <div aria-hidden="true" className="h-[84px]" />
      {children}
    </div>
  );
}
