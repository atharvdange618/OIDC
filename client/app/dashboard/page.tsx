"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

function TokenCard({
  label,
  description,
  ttl,
  icon,
}: {
  label: string;
  description: string;
  ttl: string;
  icon: string;
}) {
  return (
    <div className="window p-0">
      <div className="bg-retro-surface-dark border-b border-retro-border px-2.5 py-1.5 font-retro-sans font-semibold text-[11px] flex items-center gap-1.5">
        <span className="text-xs">{icon}</span>
        {label}
      </div>
      <div className="p-2.5">
        <p className="font-retro-sans text-xs text-retro-dim leading-relaxed mb-2">
          {description}
        </p>
        <span className="badge badge-blue text-[10px] font-retro-mono">
          TTL: {ttl}
        </span>
      </div>
    </div>
  );
}

function UserInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="font-retro-sans text-xs font-semibold text-retro-dim pr-4 py-1.5 whitespace-nowrap border-b border-retro-border-light">
        {label}
      </td>
      <td className="font-retro-mono text-xs py-1.5 border-b border-retro-border-light break-all">
        {value}
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiClient.get("/auth/me");
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSettled: () => {
      window.location.href = "/";
    },
  });

  useEffect(() => {
    if (isError) {
      router.push("/?error=session_expired");
    }
  }, [isError, router]);

  if (isPending) {
    return (
      <div className="desktop scanlines min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="window animate-in max-w-sm w-full">
          <div className="window-titlebar">
            <div className="flex items-center gap-2">
              <span className="text-sm">⏳</span>
              <span>Loading...</span>
            </div>
            <div className="window-controls">
              <button className="win-btn">_</button>
            </div>
          </div>
          <div className="window-body px-6 py-8 text-center">
            <div className="inline-block size-3 bg-retro-blue animate-pulse mb-3" />
            <p className="font-retro-sans text-sm text-retro-dim">
              Fetching session from IdP...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = [user.given_name, user.family_name]
    .filter(Boolean)
    .join(" ");
  const initials = [user.given_name?.[0], user.family_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="desktop scanlines min-h-screen px-4 py-6 flex flex-col items-center justify-center">
      <div className="fixed bottom-0 left-0 right-0 h-9 bg-retro-surface-dark border-t border-retro-border-dark flex items-center gap-1 px-1 z-100">
        <button className="btn btn-primary pixel text-[9px] px-2.5 py-1 h-7 gap-1.5">
          ⊞ Start
        </button>
        <div className="border-l border-retro-border h-7 mx-1" />
        <div className="bg-retro-bg border border-retro-border-dark text-[11px] font-retro-sans px-3 h-[22px] flex items-center">
          dashboard.exe
        </div>
        <div className="bg-retro-blue border border-retro-blue-active text-[11px] font-retro-sans px-3 h-[22px] flex items-center text-retro-on-blue">
          userinfo.dat
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="bg-retro-bg border border-retro-border-dark px-2.5 text-[11px] font-retro-mono h-[22px] flex items-center">
            {currentTime}
          </div>
        </div>
      </div>

      <div className="window animate-in max-w-[860px] mx-auto mb-15">
        <div className="window-titlebar">
          <div className="flex items-center gap-2">
            <span className="text-sm">👤</span>
            <span>User Dashboard - Authenticated Session</span>
          </div>
          <div className="window-controls">
            <button className="win-btn">_</button>
            <button className="win-btn">□</button>
            <button className="win-btn close">✕</button>
          </div>
        </div>

        <div className="border-b border-retro-border px-1 py-0.5 flex gap-0.5 bg-retro-bg">
          {["Session", "Tokens", "Help"].map((m) => (
            <button
              key={m}
              className="font-retro-sans text-xs px-2 py-px bg-transparent border border-transparent cursor-pointer hover:bg-retro-blue hover:text-white hover:border-retro-blue"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="window-body px-7 py-6">
          <div className="flex items-start gap-4 mb-6">
            {user.picture ? (
              <img
                src={user.picture}
                alt={displayName}
                className="size-12 border border-retro-border object-cover"
              />
            ) : (
              <div className="size-12 bg-retro-blue border border-retro-blue-active flex items-center justify-center text-retro-on-blue font-retro-sans font-semibold text-sm">
                {initials || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="pixel text-[clamp(9px,1.8vw,13px)] text-retro-blue mb-1 leading-[1.8]">
                Welcome, {displayName || "User"}
              </h1>
              <p className="font-retro-sans text-xs text-retro-dim">
                Authenticated via OIDC Authorization Code Flow with PKCE
              </p>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="btn btn-danger text-xs shrink-0"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          <div className="mb-6">
            <div className="window mb-0">
              <div className="window-titlebar bg-retro-titlebar-inactive">
                <div className="flex items-center gap-2">
                  <span className="text-xs">📋</span>
                  <span>/userinfo Claims</span>
                </div>
                <div className="window-controls">
                  <button className="win-btn">_</button>
                </div>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <UserInfoRow label="sub (Subject)" value={user.sub} />
                    {user.email && (
                      <UserInfoRow label="email" value={user.email} />
                    )}
                    {user.email_verified !== undefined && (
                      <UserInfoRow
                        label="email_verified"
                        value={String(user.email_verified)}
                      />
                    )}
                    {user.given_name && (
                      <UserInfoRow label="given_name" value={user.given_name} />
                    )}
                    {user.family_name && (
                      <UserInfoRow
                        label="family_name"
                        value={user.family_name}
                      />
                    )}
                    {user.picture && (
                      <UserInfoRow label="picture" value={user.picture} />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="window mb-0">
              <div className="window-titlebar bg-retro-titlebar-inactive">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔑</span>
                  <span>Session & Token Info</span>
                </div>
                <div className="window-controls">
                  <button className="win-btn">_</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-1.5 flex-wrap mb-4">
                  <span className="badge badge-green text-[10px] font-retro-mono">
                    Session Active
                  </span>
                  <span className="badge badge-blue text-[10px] font-retro-mono">
                    PKCE: S256
                  </span>
                  <span className="badge badge-blue text-[10px] font-retro-mono">
                    Signing: RS256
                  </span>
                  <span className="badge text-[10px] font-retro-mono">
                    Scopes: openid profile email
                  </span>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                  <TokenCard
                    icon="🪪"
                    label="ID Token"
                    description="Signed JWT containing user identity claims. Verified by the client using the IdP's public key from /jwks.json."
                    ttl="1 hour"
                  />
                  <TokenCard
                    icon="🎫"
                    label="Access Token"
                    description="Bearer token sent to /userinfo. Short-lived to limit damage window if leaked."
                    ttl="15 min"
                  />
                  <TokenCard
                    icon="🔄"
                    label="Refresh Token"
                    description="Opaque token stored server-side. Rotated on every use. Reuse triggers full revocation."
                    ttl="30 days"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-retro-surface-dark border border-retro-border p-3">
            <p className="font-retro-sans text-[11px] text-retro-dim leading-relaxed">
              <span className="font-semibold text-retro-text">
                How you got here:
              </span>{" "}
              Your browser was redirected to the IdP&apos;s /authorize endpoint
              with a PKCE challenge. After you authenticated, the IdP issued an
              authorization code. The client&apos;s server exchanged that code
              (plus the PKCE verifier) for tokens at /token. The access_token
              was then used to fetch your identity from /userinfo.
            </p>
          </div>
        </div>

        <div className="statusbar">
          <span className="statusbar-item">IdP: localhost:4000</span>
          <span className="statusbar-item">Client: localhost:3000</span>
          <span className="statusbar-item ml-auto">
            <span className="inline-block size-[7px] bg-[#107c10] border border-[#0a5c0a] mr-1" />
            Authenticated
          </span>
        </div>
      </div>
    </div>
  );
}
