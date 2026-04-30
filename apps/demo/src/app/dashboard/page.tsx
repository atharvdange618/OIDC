import { getSession } from "@torii/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex-1 p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">
          Protected Dashboard
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          This page is protected by Torii middleware. Since you can see this,
          the middleware successfully verified your HTTP-only session cookie.
        </p>

        <h2 className="font-semibold mb-2">
          Encrypted Session Data (Decrypted):
        </h2>
        <pre className="p-4 bg-zinc-100 dark:bg-zinc-950 rounded-lg overflow-x-auto text-sm border border-zinc-200 dark:border-zinc-800 mb-6">
          {JSON.stringify(session, null, 2)}
        </pre>

        <Link href="/" className="text-blue-500 hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
