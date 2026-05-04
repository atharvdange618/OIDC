"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { Tag } from "@/components/neo/Tag";

const sidebarLinks = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/nextjs-sdk", label: "Next.js SDK" },
  { href: "/docs/idp-integration", label: "IDP Integration" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 border-b-4 lg:border-b-0 lg:border-r-4 border-black dark:border-gray-700 p-6 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="sticky top-28">
            <p className="uppercase tracking-widest font-black text-xs font-sans mb-6">
              Documentation
            </p>
            <nav className="space-y-2">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block px-4 py-2 font-black font-sans border-2 border-transparent transition-all",
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                        : "hover:border-black dark:hover:border-gray-700 hover:translate-x-1",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-12 p-4 border-2 border-black dark:border-gray-700 bg-[#FFECDB] dark:bg-neutral-900">
              <p className="text-xs font-black font-sans uppercase mb-2">
                Status
              </p>
              <Tag tone="peach" className="w-full justify-center">
                v1.0.0
              </Tag>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-12 bg-white dark:bg-background">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
