import type { Metadata } from "next";
import { Inter, Aleo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300","400","500","700"]
});

const aleo = Aleo({
  variable: "--font-aleo",
  subsets: ["latin"],
  weight: ["300", "400", "500" ,"700"]
});

export const metadata: Metadata = {
  title: "Sebastian Gomez | ML Engineer",
  description: "Welcome to my personal website!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter} ${aleo} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
