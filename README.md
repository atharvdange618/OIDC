# Kleis OIDC

A from-scratch implementation of an **OpenID Connect Identity Provider** with full Single Sign-On (SSO), built to understand how auth systems actually work under the hood. No third-party auth libraries - every protocol handshake, token, and cryptographic operation is implemented directly.

Includes a published **Next.js SDK** (`@kleis-auth/nextjs`) that wraps the full OIDC Authorization Code Flow with PKCE into a plug-and-play developer experience.

## The Stack

### Monorepo

- **pnpm workspaces** + **Turborepo** for build orchestration
- Prettier for formatting

### Identity Provider (`apps/idp/`)

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| Runtime          | Node.js                                                    |
| Framework        | Express v5 (native async error handling)                   |
| Language         | TypeScript v6 (strict mode)                                |
| Database         | PostgreSQL                                                 |
| ORM              | Prisma v7 (with `adapter-pg` driver adapter)               |
| JWT              | `jose` v6 - RS256 signing, JWKS endpoint                   |
| Validation       | Zod v4 - request body, query params, env vars              |
| Sessions         | `express-session` + `connect-pg-simple` (PostgreSQL store) |
| Logging          | pino + pino-http + pino-roll (structured, rotating)        |
| Security         | helmet, hpp, express-rate-limit                            |
| Templating       | EJS v5 (login, register, consent, dashboard UIs)           |
| Password Hashing | bcrypt v6                                                  |

### SDK (`packages/nextjs/` → `@kleis-auth/nextjs`)

| Layer                | Technology                                      |
| -------------------- | ----------------------------------------------- |
| Language             | TypeScript v5                                   |
| Runtime Dependencies | `jose`, `zod` (intentionally minimal)           |
| Peer Dependencies    | Next.js >=14, React >=18                        |
| Entry Points         | Client (`index.ts`), Server (`server/index.ts`) |

### Frontend Apps (`apps/web/`, `apps/demo/`)

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router) + React 19 |
| Styling   | Tailwind CSS v4                    |

## Auth Protocols Implemented

All implemented from scratch - no `openid-client`, no `passport`, no `next-auth`:

- **OpenID Connect Core 1.0** - Authorization Code Flow with PKCE (S256)
- **OAuth 2.0** (RFC 6749)
- **OAuth 2.0 Token Introspection** (RFC 7662)
- **OIDC Discovery 1.0** - `/.well-known/openid-configuration`
- **OIDC RP-Initiated Logout 1.0** - End-session endpoint
- **PKCE** (RFC 7636) - Mandatory S256 code challenge

## Architecture

```
┌──────────────┐     PKCE Flow     ┌──────────────────────┐
│  Next.js App │ ◄──────────────►  │   Kleis OIDC IdP     │
│  (consumer)  │                   │   (Express v5)       │
│              │   JWKS/Token      │                      │
│ @kleis-auth/ │ ◄──────────────►  │   PostgreSQL         │
│   nextjs     │                   │   (Prisma v7)        │
└──────────────┘                   └──────────────────────┘
```

The **IdP** handles:

- User registration, login, logout
- OAuth client management (developer dashboard)
- Authorization code issuance and verification
- Token generation (access, refresh, ID) with RS256
- JWKS key distribution
- Token introspection
- User consent management (6-month expiry)
- Refresh token rotation with reuse detection

The **SDK** handles:

- `KleisProvider` - React context for auth state
- `useAuth()`, `useUser()`, `getToken()` - hooks
- `SignInButton`, `SignUpButton`, `SignOutButton`, `UserButton` - pre-built components
- `handleAuth()` - catch-all API route handler (`/api/auth/[...kleis]`)
- `authMiddleware()` - Next.js middleware factory for route protection
- Encrypted JWT session cookies (HS256)
- PKCE code challenge/verifier generation

## Token Lifetimes

| Token              | Lifetime   |
| ------------------ | ---------- |
| Authorization Code | 5 minutes  |
| Access Token       | 15 minutes |
| Refresh Token      | 30 days    |
| ID Token           | 1 hour     |
| User Consent       | 6 months   |

## Database Schema (PostgreSQL)

- **User** - accounts with email, name, password hash, profile, metadata
- **OAuthClient** - registered client applications (redirect URIs, allowed grants, logo, etc.)
- **UserConsent** - per-client user consent records
- **AuthCode** - single-use authorization codes with PKCE challenge
- **RefreshToken** - refresh tokens with reuse detection (revokes all on reuse)
- **Session** - server-side session store

## Projects in This Repo

| Directory          | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `apps/idp/`        | The Kleis OIDC Identity Provider (Express server) |
| `apps/web/`        | Marketing and documentation website               |
| `apps/demo/`       | Live demo app consuming the SDK                   |
| `packages/nextjs/` | `@kleis-auth/nextjs` - published npm package      |
| `docs/`            | Integration guides for IdP and SDK                |

## Deployment

Deployed on a VPS with CloudPanel. No Docker, no CI/CD - intentionally simple infrastructure.

---

Built by **Atharv Dange** - full-stack engineer, curious persistent nerd.
