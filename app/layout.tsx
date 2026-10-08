import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/app/data/site";
import { copy } from "@/app/data/content";
import { Providers } from "@/app/components/providers/providers";
import "./globals.css";

// Variable font: one file covers weights 400–800.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = site.url;
const siteTitle = `${site.name} | ${site.role}`;
const siteDescription = copy.en.hello;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Sebastian Gomez",
  },
  description: siteDescription,
  keywords: [
    "Sebastian Gomez",
    "ML Engineer",
    "Machine Learning",
    "LLM",
    "RAG",
    "Agentic AI",
    "LLM evaluation",
    "LangGraph",
    "DSPy",
    "MLflow",
    "PyTorch",
    "AWS Bedrock",
    "Claude",
    "S3 Vectors",
    "OpenSearch",
    "Biomedical Engineering",
    "Bogotá",
    "Colombia",
  ],
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
    alternateLocale: ["es_CO"],
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${site.name} — ${site.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  jobTitle: site.role,
  url: siteUrl,
  worksFor: { "@type": "Organization", name: "Provectus" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de los Andes" },
  address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
  knowsAbout: [
    "Machine Learning",
    "Large Language Models",
    "Retrieval-Augmented Generation",
    "Agentic AI",
    "LLM evaluation",
    "PyTorch",
    "AWS Bedrock",
    "Claude",
    "Document AI",
  ],
  sameAs: [site.socials.linkedin, site.socials.github],
};

// Runs before paint: skip the logo intro for returning visitors in this session
// and for anyone who prefers reduced motion.
const introScript = `try{if(sessionStorage.getItem('sg-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-intro-seen','')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className={`${manrope.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
