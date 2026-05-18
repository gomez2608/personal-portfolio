import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/app/data/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = "https://www.sebastiangomez.me";
const siteTitle = `${site.name} | ${site.role}`;
const siteDescription =
  "Personal portfolio of Sebastian Gomez Ahumada — ML Engineer with a MSc in Biomedical Engineering, based in Bogotá, Colombia. Building production GenAI on AWS with LangChain, PyTorch, and TensorFlow.";

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
    "Biomedical Engineering",
    "Generative AI",
    "Agentic AI",
    "LangChain",
    "LangGraph",
    "PyTorch",
    "TensorFlow",
    "NLP",
    "AWS",
    "AWS Bedrock",
    "AWS SageMaker",
    "Next.js",
    "React",
    "Bogotá",
    "Colombia",
    "Portfolio",
  ],
  authors: [{ name: "Sebastian Gomez Ahumada" }],
  creator: "Sebastian Gomez Ahumada",
  openGraph: {
    type: "website",
    siteName: site.name,
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: siteUrl,
  email: `mailto:${site.email}`,
  worksFor: { "@type": "Organization", name: "Provectus" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de los Andes" },
  address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
  knowsAbout: [
    "Machine Learning",
    "Generative AI",
    "Agentic AI",
    "LangChain",
    "PyTorch",
    "TensorFlow",
    "AWS Bedrock",
    "AWS SageMaker",
  ],
  sameAs: [site.socials.linkedin, site.socials.github],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
        <Analytics />
        <Script
          id="person-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
