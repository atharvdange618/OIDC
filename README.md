# Kleis OIDC

> **A from-scratch implementation of an OpenID Connect Identity Provider with full Single Sign-On (SSO), built to demystify modern authentication protocols.**

Building an identity provider from scratch is one of the most rewarding challenges a developer can undertake. If you have only ever consumed authentication as a client (using tools like NextAuth, Auth0, or Firebase), the inner workings of protocols like OAuth 2.0 and OpenID Connect (OIDC) can feel like a black box.

Kleis OIDC flips this mental model completely. Written in TypeScript and powered by Express v5, PostgreSQL, and Prisma, this project implements every cryptographic operation, handshake, token lifecycle, and session verification layer directly: with zero third-party auth engines. It also ships with a custom Next.js SDK (`@kleis-auth/nextjs`) to demonstrate a plug-and-play developer integration.

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express v5](https://img.shields.io/badge/Framework-Express%20v5-green?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%20v7-darkblue?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Jose JWT](https://img.shields.io/badge/Cryptography-Jose%20v6-orange?style=flat-square)](https://github.com/panva/jose)
[![Next.js SDK](https://img.shields.io/badge/SDK-Next.js-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)

---

## Features

### Protocol Compliance & Security

- **OAuth 2.0 & OIDC Core 1.0**: Clean implementation of the Authorization Code Flow.
- **PKCE (S256)**: Mandatory Proof Key for Code Exchange to protect mobile and single-page apps.
- **RS256 JWT Token Signing**: Asymmetric cryptographic token signing using private and public key pairs.
- **JWKS Endpoint**: A public keyset endpoint exposing active verification keys to clients.
- **OIDC Discovery**: A standard metadata endpoint enabling zero-config client integration.

### Identity & Session Management

- **Single Sign-On (SSO)**: Cross-client session synchronization: authenticate once, access all registered apps.
- **User Consent Flow**: Granular consent screens with a 6-month auto-expiry mechanism.
- **Secure Logout (RP-Initiated)**: Standardized logout flow that revokes active sessions and associated tokens.
- **Refresh Token Rotation**: Continuous rotation of refresh tokens with strict reuse-detection systems.

### Developer Experience

- **Next.js SDK (`@kleis-auth/nextjs`)**: Wrapper providing React Context providers (`KleisProvider`), Hooks (`useAuth`, `useUser`), pre-built UI components, and API route handlers.
- **Developer Portal**: Integrated dashboard inside the IdP for managing redirect URIs, scopes, and secrets.

---

## Technical Architecture

The codebase is organized as a monorepo managed with **pnpm workspaces** and **Turborepo** for optimized building.

### Monorepo Components & Data Flow

```
                 ┌────────────────────────────────────────────────────────┐
                 │                       KLEIS OIDC                       │
                 │                       (Monorepo)                       │
                 └───────────┬────────────────────────────────┬───────────┘
                             │                                │
                             ▼                                ▼
                 ┌──────────────────────┐        ┌────────────────────────┐
                 │      apps/idp/       │        │   packages/nextjs/     │
                 │   (Identity Server)  │        │     (Consumer SDK)     │
                 └───────────┬──────────┘        └────────────┬───────────┘
                             │                                │
                             ▼                                ▼
                 ┌──────────────────────┐        ┌────────────────────────┐
                 │      PostgreSQL      │        │    apps/demo & apps/   │
                 │     (Prisma ORM)     │        │     (Client Apps)      │
                 └──────────────────────┘        └────────────────────────┘
```

The **Identity Provider (IdP)** handles database-backed storage of credentials, developer clients, active consents, and cryptographic configurations. The **SDK** abstracts network exchanges, token caching, cookie decryption, and client-side route protection.

---

## Under the Hood: Deep Dives & Core Protocols

To make these abstract authentication flows concrete, let's explore how they work, starting from simple real-life analogies and moving down into database transactions and cryptographic algorithms.

### 1. OpenID Connect vs. OAuth 2.0

> **The Hotel Keycard vs. Passport Analogy**
>
> Think of standard OAuth 2.0 as a **hotel keycard**. When you check into a hotel, you receive a plastic card. This keycard lets you unlock the door to Room 302 and access the gym. However, the card itself does not contain your name, your address, or your photo: the door locks do not care who you are, they only care that the card holds the authorized key to open the door.
>
> OpenID Connect (OIDC) is like your **passport**. It is an official document containing your verified name, your date of birth, your photo, and your unique ID number. It proves exactly who you are, rather than just what doors you can open.

#### Beginner Concepts

OAuth 2.0 is an authorization protocol designed to grant access to APIs. OIDC is an identity layer built on top of OAuth 2.0. OIDC introduces the concept of an **ID Token** (a structured card containing user details) in addition to the standard **Access Token** (which is merely a key to access APIs).

#### Intermediate Details

During the authentication handshake, the client requests specific **scopes** like `openid`, `profile`, and `email`. If the client only wants to authorize API calls, it receives an Access Token. If the `openid` scope is present, the IdP is instructed to sign and return an ID Token containing claims about the user's identity.

#### Advanced Insights

The ID Token is formatted as a JSON Web Token (JWT). The IdP encodes user information into the payload (the claims) and signs the header and payload using a private key. The client decodes the token and validates its signature, ensuring it was issued by the trusted IdP and has not been tampered with.

---

### 2. Authorization Code Flow with PKCE (Proof Key for Code Exchange)

> **The Secret Handshake Analogy**
>
> Imagine you want to send a lockbox full of cash (the token) to a business partner, but you must send the key via a messenger (the browser redirect). If a thief intercepts the messenger and steals the key (the authorization code), they could go to the bank and take the cash.
>
> To prevent this, you and the bank establish a **secret word** (the code verifier) before sending the messenger. You hash the secret word (the code challenge) and send it to the bank first. When your partner arrives at the bank with the key, the bank asks them for the secret word. If the hash of their word matches your original challenge, the bank knows the key was not stolen and releases the cash.

#### Protocol Flow Diagram

```
┌──────────────┐             (1) /authorize (Challenge)           ┌──────────────┐
│  Client App  ├─────────────────────────────────────────────────►│  Kleis IdP   │
│              │◄─────────────────────────────────────────────────┤   (Server)   │
│ (User Agent) │          (2) Redirect with Auth Code             │              │
└──────┬───────┘                                                  └──────┬───────┘
       │                                                                 ▲
       │                                                                 │
       │             (3) POST /token (Code + Verifier)                   │
       └─────────────────────────────────────────────────────────────────┘
```

#### Code Implementation Details

During the `/authorize` endpoint handshake, the IdP stores the PKCE challenge:

```typescript
// From src/lib/pkce.ts
import crypto from "crypto";

export function verifyPkce(
  codeVerifier: string,
  storedChallenge: string,
): boolean {
  const computed = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return computed === storedChallenge;
}
```

When the client makes a server-to-server request to the `/token` endpoint, the IdP extracts the `code_verifier`, hashes it using SHA256, and compares it to the stored `codeChallenge` from the DB:

```typescript
const pkceValid = verifyPkce(input.code_verifier, authCode.codeChallenge);
if (!pkceValid) {
  throw new BadRequestError("PKCE verification failed", ErrorCodes.PKCE_FAILED);
}
```

---

### 3. Asymmetric Cryptographic Signing (RS256 vs. HS256)

> **The Sealed Mailbox Analogy**
>
> Symmetric signing (HS256) is like a **locked box** where you and the clients share the exact same key. If a client needs to verify a token, they must have the key. However, this means any client could also use that key to lock their own boxes (forge fake tokens).
>
> Asymmetric signing (RS256) is like a **sealed mailbox** with a public slot (the public key) and a private key. Anyone can drop a letter into the mailbox slot to verify its contents, but only the owner of the private key can unlock the box and sign official letters.

#### Asymmetric Validation Architecture

```
┌─────────────────────────────────┐
│           KLEIS IdP             │
│  (Signs JWT with Private Key)   │
└────────────────┬────────────────┘
                 │
                 ▼ JWT Token Issued
┌─────────────────────────────────┐
│           CLIENT APP            │
│  (Verifies JWT with Public Key) │
│  Exposed at /.well-known/jwks   │
└─────────────────────────────────┘
```

#### Crypto Signing in Kleis OIDC

We use the `jose` package to load PEM-formatted RSA key pairs and sign tokens:

```typescript
// From src/lib/jwt.ts
import { SignJWT, importPKCS8 } from "jose";
import { privateKeyPem, KEY_ID, ISSUER } from "../config/keys";

export async function signJwt(
  payload: Record<string, unknown>,
  expiresIn: string,
) {
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: KEY_ID })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}
```

The public key is exposed standardly via a JSON Web Key Set (JWKS) endpoint at `/.well-known/jwks.json`. Clients can download the public key, cache it, and cryptographically verify the signatures of incoming tokens locally without querying our authentication server.

---

### 4. Refresh Token Rotation & Reuse Detection

> **The Numbered Checkbook Analogy**
>
> Imagine a bank gives you a checkbook where checks must be written in order: check #1, then check #2, then check #3. When you cash check #1, the bank hands you check #2.
>
> If a pickpocket steals check #1 and tries to present it after you have already cashed it, the bank looks at its ledger and realizes check #1 was already used. Recognizing a security breach, the bank immediately freezes your entire account and cancels all outstanding checks.

#### Rotation State Diagram

```
[ Active Token ] ──(Used once)──► [ Issue New Token ] + [ Mark Old Used ]
       │
 (Attempted Reuse)
       ▼
 [ Revoke All Tokens for User/Client ] ──► [ Force Login ]
```

#### Transactional Security Code

To ensure that concurrent requests or network delays do not compromise security, the rotation check uses a database transaction:

```typescript
// From src/services/token.service.ts
return prisma.$transaction(async (tx) => {
  const updated = await tx.refreshToken.updateMany({
    where: { token: input.refresh_token, usedAt: null },
    data: { usedAt: new Date() },
  });

  // If count is 0, the token was already marked used!
  if (updated.count === 0) {
    log.error(
      {
        clientId: input.client_id,
        userId: stored.userId,
        security: true,
      },
      "Refresh token reuse detected: revoking all tokens",
    );
    // Immediate mitigation: revoke everything
    await authService.revokeTokensForLogout(stored.userId, input.client_id);
    throw new BadRequestError(
      "Refresh token reuse detected: all tokens revoked",
      ErrorCodes.TOKEN_REUSE_DETECTED,
    );
  }

  // Create and issue new pair...
});
```

---

## Technical Challenges & Trade-Offs

### 1. From-Scratch Protocol Compliance

Writing standard-compliant OAuth 2.0 and OIDC endpoints is challenging because the specifications are designed to handle many edge cases. For instance, the token exchange endpoint must accept request parameters strictly formatted as `application/x-www-form-urlencoded` rather than JSON. Managing redirect query validation, client credential verification, and error-response structures (returning fields like `error` and `error_description`) required strict adherence to RFC 6749.

- **Trade-off**: Building the server from scratch was chosen over established libraries like `oidc-provider`. While it increased development time, it gave us absolute control over the data layer and helped us avoid black-box security configurations.

### 2. Concurrency & Transactional Safety in Reuse Detection

In refresh token rotation, check-and-update race conditions can occur. If a client triggers two parallel token refreshes (e.g., due to React rendering twice or a slow network connection), the second request might arrive before the first has finished issuing the new token.

- **Solution**: We implemented database transactions using Prisma (`prisma.$transaction`). Instead of performing a read followed by a write, we perform an atomic `updateMany` that filters for `usedAt: null`. If the update count returns 0, we know the token was already used and initiate an immediate security revocation of all sessions.

### 3. Asymmetric (RS256) vs. Symmetric (HS256) Cryptography

Symmetric signing (HS256) is computationally fast and requires only a shared string environment variable. However, it requires every consuming client service to hold the exact same secret. If a single microservice client gets compromised, the attacker can forge tokens for the entire system.

- **Trade-off**: We chose RS256. Although generating RSA signatures consumes more CPU cycles than hashing, the security benefits (clients can verify signatures locally but can never forge tokens) outweigh the performance cost.

### 4. Stateful SSO Sessions vs. Stateless REST API

Modern microservices strive to be completely stateless. However, providing a Single Sign-On (SSO) experience (where users remain logged in across multiple client applications) requires a central session management layer.

- **Trade-off**: We introduced a stateful session store in the IdP (`apps/idp`) using Express Sessions backed by PostgreSQL (`connect-pg-simple`). While this introduces database lookups for session validation during authorization requests, it enables seamless cross-app login and unified remote session termination.

---

## Getting Started

### Run with Docker (no local setup)

Needs Docker Desktop only. From the repo root:

```bash
docker compose up --build
```

This starts Postgres and the IdP. On first boot the IdP container generates its
RSA keypair, applies the Prisma migrations, and starts on
[http://localhost:4000](http://localhost:4000). Check the discovery document at
`http://localhost:4000/.well-known/openid-configuration`.

The keypair lives in a named volume (`idp_keys`) and Postgres data in `pgdata`,
so both survive `docker compose down`. Source is baked into the image; rebuild
with `docker compose up --build` to pick up code changes.

### Run locally

Follow these steps to run Kleis OIDC without Docker:

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/atharvdange618/OIDC.git
cd OIDC
pnpm install
```

### 2. Generate RSA Key Pairs

```bash
mkdir -p apps/idp/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out apps/idp/keys/private.pem
openssl rsa -in apps/idp/keys/private.pem -pubout -out apps/idp/keys/public.pem
```

### 3. Configure the Environment

Copy `.env.example` in `apps/idp/` to `.env` and fill in the database URL and key settings:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kleis_oidc?schema=public"
KEY_ID="kleis-key-v1"
ISSUER="http://localhost:3001"
PORT=3001
```

### 4. Run Migrations & Seed Database

```bash
pnpm --filter idp prisma migrate dev
```

### 5. Start the Development Server

```bash
pnpm dev
```

---

Built by **Atharv Dange** - full-stack engineer, curious persistent nerd.
