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

const baseUrl = "https://kleis.atharvdangedev.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Kleis - Standards-Compliant OIDC for Next.js",
    template: "%s | Kleis",
  },
  description:
    "Kleis is an open-source OIDC provider and Next.js SDK for secure, lightweight authentication with full SSO. Built for the App Router with PKCE and HTTP-only cookies.",
  keywords: [
    "OIDC",
    "Next.js",
    "Authentication",
    "PKCE",
    "Auth SDK",
    "Identity Provider",
    "Next.js Auth",
    "SSO",
    "Single Sign-On",
  ],
  authors: [{ name: "Atharv Dange", url: "https://atharvdangedev.in" }],
  creator: "Atharv Dange",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Kleis",
    title: "Kleis - OIDC for Next.js",
    description:
      "Secure, lightweight authentication with PKCE, HTTP-only cookies, and full SSO for Next.js applications.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kleis - OIDC for Next.js",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kleis - OIDC for Next.js",
    description:
      "Secure, lightweight authentication with PKCE, HTTP-only cookies, and full SSO for Next.js applications.",
    images: ["/og-image.png"],
    creator: "@atharvdangedev",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kleis",
    operatingSystem: "All",
    applicationCategory: "SecurityApplication",
    description:
      "Kleis is an open-source OIDC provider and Next.js SDK for secure, lightweight authentication with PKCE, HTTP-only cookies, and full SSO.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Atharv Dange",
      url: "https://atharvdangedev.in",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased min-h-screen w-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
