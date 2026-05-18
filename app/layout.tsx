import type { Metadata } from "next";
import { Inter, Aleo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const aleo = Aleo({
  variable: "--font-aleo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const siteUrl = "https://sebastiangomez.dev";
const siteTitle = "Sebastian Gomez | ML Engineer";
const siteDescription =
  "Personal portfolio of Sebastian Gomez Ahumada, an ML Engineer with a MSc in Biomedical Engineering based in Bogotá, Colombia. Focused on agentic AI workflows, NLP, and production-ready ML solutions with LangChain, PyTorch, TensorFlow, and AWS.";

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
    siteName: "Sebastian Gomez",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${aleo.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
