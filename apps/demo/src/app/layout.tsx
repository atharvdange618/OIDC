import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { KleisProvider } from "@kleis-auth/nextjs";
import { getSession } from "@kleis-auth/nextjs/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kleis SDK Demo",
  description: "Testing Kleis Client SDK",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen flex flex-col`}
      >
        <KleisProvider session={session}>{children}</KleisProvider>
      </body>
    </html>
  );
}
