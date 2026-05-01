"use client";

import {
  useUser,
  useAuth,
  SignInButton,
  SignOutButton,
  UserButton,
  SignUpButton,
} from "@kleis-auth/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const handleGetToken = async () => {
    const t = await getToken();
    setToken(t);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Kleis SDK Demo</h1>

        {user ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
              <div>
                <p className="font-semibold">Successfully Authenticated</p>
                <p className="text-sm opacity-80">
                  Welcome back, {user.given_name || user.email}
                </p>
              </div>
              <UserButton />
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-zinc-200 dark:border-zinc-800">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>

            {token && (
              <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50 break-all">
                <p className="font-semibold text-xs mb-1">Rotated Token:</p>
                <p className="font-mono text-xs">{token}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleGetToken}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-zinc-300 text-white dark:text-black rounded-lg font-medium transition-colors"
              >
                Test getToken()
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Protected Dashboard
              </Link>

              <SignOutButton>
                <div className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center justify-center">
                  Sign Out
                </div>
              </SignOutButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              You are currently signed out. Click the button below to test the
              Kleis PKCE flow.
            </p>
            <div className="flex justify-center gap-4">
              <SignInButton>
                <div className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer inline-flex items-center justify-center">
                  Sign In with Kleis
                </div>
              </SignInButton>
              <SignUpButton>
                <div className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center justify-center">
                  Sign Up
                </div>
              </SignUpButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
