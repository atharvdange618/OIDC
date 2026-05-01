import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Kleis - OIDC for Next.js",
  description:
    "Kleis is an OIDC provider and Next.js SDK for secure, lightweight authentication with PKCE and HTTP-only cookies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased min-h-screen w-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
