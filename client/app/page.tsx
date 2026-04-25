"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FLOW_STEPS = [
  {
    step: "01",
    label: "Initiate",
    detail:
      "Client generates PKCE verifier & challenge. Redirects to /authorize.",
    tag: "GET /authorize",
  },
  {
    step: "02",
    label: "Authenticate",
    detail:
      "User logs in on IdP. Approves consent screen. Session set server-side.",
    tag: "POST /auth/login",
  },
  {
    step: "03",
    label: "Auth Code",
    detail:
      "IdP issues one-time code (5 min TTL). Redirects to client callback.",
    tag: "302 → callback",
  },
  {
    step: "04",
    label: "Token Exchange",
    detail:
      "Client verifies state (CSRF). Sends code + verifier to token endpoint.",
    tag: "POST /token",
  },
  {
    step: "05",
    label: "Tokens Issued",
    detail:
      "IdP verifies PKCE. Issues id_token (RS256) + access_token + refresh_token.",
    tag: "JWT RS256",
  },
];

const FEATURES = [
  {
    title: "PKCE / S256",
    desc: "code_verifier never travels until token exchange. Intercept the code - still useless.",
  },
  {
    title: "RS256 Signing",
    desc: "IdP signs with private key. Clients verify via /jwks.json. No shared secret.",
  },
  {
    title: "Refresh Rotation",
    desc: "Every refresh issues a new token and marks old one used. Reuse = revoke all.",
  },
  {
    title: "Discovery Doc",
    desc: "/.well-known/openid-configuration. Clients auto-configure. Spec compliant.",
  },
];

export default function Home() {
  const errorParam =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="desktop scanlines min-h-screen px-4 py-6 flex flex-col items-center justify-center">
      <div className="fixed bottom-0 left-0 right-0 h-9 bg-retro-surface-dark border-t border-retro-border-dark flex items-center gap-1 px-1 z-100">
        <button className="btn btn-primary pixel text-[9px] px-2.5 py-1 h-7 gap-1.5">
          ⊞ Start
        </button>
        <div className="border-l border-retro-border h-7 mx-1" />
        <div className="bg-retro-bg border border-retro-border-dark text-[11px] font-retro-sans px-3 h-[22px] flex items-center">
          oidc-demo.exe
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
            <span className="text-sm">🔐</span>
            <span>OIDC Demo Client - Authorization Code Flow with PKCE</span>
          </div>
          <div className="window-controls">
            <button className="win-btn">_</button>
            <button className="win-btn">□</button>
            <button className="win-btn close">✕</button>
          </div>
        </div>

        <div className="border-b border-retro-border px-1 py-0.5 flex gap-0.5 bg-retro-bg">
          {["File", "View", "Help"].map((m) => (
            <button
              key={m}
              className="font-retro-sans text-xs px-2 py-px bg-transparent border border-transparent cursor-pointer hover:bg-retro-blue hover:text-white hover:border-retro-blue"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="window-body px-7 py-6">
          {errorParam && (
            <div className="bg-[#fde8ea] border border-retro-red px-3.5 py-2 mb-5 font-retro-sans text-[13px] text-[#a80000] flex items-center gap-2">
              <span>⚠</span>
              <span>
                {errorParam === "access_denied" &&
                  "Access denied - you cancelled the authorization."}
                {errorParam === "state_mismatch" &&
                  "Security check failed - state mismatch (possible CSRF)."}
                {errorParam === "session_expired" &&
                  "Your session expired. Please sign in again."}
                {![
                  "access_denied",
                  "state_mismatch",
                  "session_expired",
                ].includes(errorParam) && `Error: ${errorParam}`}
              </span>
            </div>
          )}

          <div className="mb-7">
            <h1 className="pixel text-[clamp(11px,2.2vw,16px)] text-retro-blue mb-4 leading-[1.8]">
              OIDC Identity Provider
            </h1>
            <p className="font-retro-sans text-sm text-retro-dim leading-relaxed max-w-[560px] mb-5">
              A from-scratch implementation of the OpenID Connect Authorization
              Code Flow. Every token, every signature, every PKCE check - built
              by hand to understand how auth systems actually work under the
              hood.
            </p>

            <div className="flex gap-2 flex-wrap">
              <Link href="/api/auth/login" className="btn btn-primary">
                Sign in with IdP →
              </Link>
              <a
                href="https://openid.net/specs/openid-connect-core-1_0.html"
                target="_blank"
                rel="noreferrer"
                className="btn"
              >
                Read Spec
              </a>
              <a
                href="https://github.com/atharvdange618/OIDC"
                target="_blank"
                rel="noreferrer"
                className="btn"
              >
                Source
              </a>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-8">
            {[
              "RFC 6749",
              "RFC 7636 PKCE",
              "RS256 / JWK",
              "OIDC Discovery",
              "Refresh Rotation",
            ].map((s) => (
              <span
                key={s}
                className="badge badge-blue text-[10px] font-retro-mono"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mb-8">
            <div className="window mb-0">
              <div className="window-titlebar bg-retro-titlebar-inactive">
                <span>Authorization Flow Diagram</span>
                <div className="window-controls">
                  <button className="win-btn">_</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col">
                  {FLOW_STEPS.map((s, i) => (
                    <div
                      key={s.step}
                      className="grid grid-cols-[40px_1px_1fr_auto] gap-x-3 items-stretch min-h-14"
                    >
                      <div className="flex items-start pt-3 justify-end">
                        <span className="pixel text-[8px] text-retro-blue">
                          {s.step}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="size-2.5 bg-retro-blue border border-retro-blue-active shrink-0 mt-3.5" />
                        {i < FLOW_STEPS.length - 1 && (
                          <div className="w-px flex-1 bg-retro-border mt-0.5" />
                        )}
                      </div>

                      <div className="pt-2.5 pb-4">
                        <div className="font-retro-sans font-semibold text-[13px] mb-0.5">
                          {s.label}
                        </div>
                        <div className="font-retro-sans text-xs text-retro-dim">
                          {s.detail}
                        </div>
                      </div>

                      <div className="pt-2.5 pb-4 flex items-start">
                        <span className="mono text-[10px] bg-retro-surface-dark border border-retro-border px-1.5 py-0.5 text-retro-dim whitespace-nowrap">
                          {s.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="window p-0">
                <div className="bg-retro-surface-dark border-b border-retro-border px-2.5 py-1.5 font-retro-sans font-semibold text-[11px] flex items-center gap-1.5">
                  <span className="inline-block size-1.5 bg-retro-blue" />
                  {f.title}
                </div>
                <div className="p-2.5 font-retro-sans text-xs text-retro-dim leading-relaxed">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="statusbar">
          <span className="statusbar-item">IdP: localhost:4000</span>
          <span className="statusbar-item">Client: localhost:3000</span>
          <span className="statusbar-item ml-auto">
            <span className="inline-block size-[7px] bg-[#107c10] border border-[#0a5c0a] mr-1" />
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
