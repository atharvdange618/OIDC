# OIDC Identity Provider (IdP) - Spec Sheet

> **A from-scratch implementation of an OpenID Connect Identity Provider, built to understand how auth systems actually work under the hood.**

This is a full-fledged IdP implementation. The goal is to implement every part of the OIDC Authorization Code Flow manually, so that concepts like token signing, PKCE verification, and the discovery document stop being black boxes. Every implementation decision maps directly to an RFC or spec.

If you've only ever been on the client side of OIDC (using Google, GitHub, etc. as your IdP), this will flip your mental model completely.

---

## What We're Building

Two services:

**1. The IdP Service (this repo)** - the identity provider. Handles user registration, login, OAuth client registration, authorization, and token issuance. Signs JWTs with RS256.

**2. A Demo Client App** - a simple frontend that registers as a client with our IdP and demonstrates the full OIDC flow end to end. Think of it as "Login with Our IdP."

---

## Concepts Implemented

- OpenID Connect Authorization Code Flow
- PKCE (Proof Key for Code Exchange) - S256 method
- RS256 JWT signing with asymmetric key pair
- JWKS endpoint for public key exposure
- OpenID Connect Discovery document
- Short-lived, one-time-use authorization codes
- Access tokens + ID tokens + Nonce support
- Refresh tokens with rotation and reuse detection
- Userinfo endpoint
- RP-Initiated Logout with token revocation
- Token Introspection endpoint
- Just-in-Time user provisioning (on the client side)

---

## Tech Stack

| Layer            | Choice                 |
| ---------------- | ---------------------- |
| Runtime          | Node.js                |
| Language         | TypeScript             |
| Framework        | Express                |
| ORM              | Prisma                 |
| Database         | PostgreSQL             |
| JWT              | `jose` library (RS256) |
| Password hashing | `bcrypt`               |
| Validation       | Zod                    |

---

## OIDC Flow - Full Picture

```
User clicks "Continue with [Platform]"
          |
          v
Platform redirects user to IdP /authorize
with: client_id, redirect_uri, scope, state, code_challenge, code_challenge_method
          |
          v
IdP checks: does this user exist?
          |
     no   |   yes
     |         |
     v         v
IdP login    Check existing consent
screen            |
     |     consent valid + covers scopes?
     |          |
     |     yes  |  no
     |     |         |
     |     v         v
     |  Skip UI   Show consent screen
     |  (auto-approve)    |
     |     |         user rejects
     |     |              |
     |     |              v
     |     |         Redirect back with error
     |     |
     v (user logs in)
     |
     +---------> Check existing consent
                      |
              consent valid + covers scopes?
                      |
                 yes  |  no
                 |         |
                 v         v
              Skip UI   Show consent screen
              (auto-approve)   |
                          user approves
                               |
                               v
          IdP generates auth code
          Stores: code, client_id, user_id,
                  redirect_uri, scopes,
                  code_challenge, expires_at
                      |
                      v
          Redirect to platform's redirect_uri
          with: ?code=AUTH_CODE&state=STATE
                      |
                      v
          Platform's backend verifies state (CSRF check)
                      |
                      v
          Platform's backend sends server-to-server POST
          to IdP /token with:
          code, client_id, client_secret,
          redirect_uri, code_verifier, grant_type
                      |
                      v
          IdP verifies:
          - code exists and is not expired
          - code has not been used before
          - client_id and redirect_uri match
          - SHA256(code_verifier) === stored code_challenge
                      |
                      v
          IdP marks code as used
          Issues: id_token (JWT, RS256 signed) + access_token + refresh_token
                      |
                      v
          Platform's backend decodes id_token
          Extracts user info (sub, email, name, etc.)
          Checks if user exists in platform's DB
                      |
              exists  |  doesn't exist
                 |         |
                 |         v
                 |    Create new account (JIT provisioning)
                 |         |
                 +---------+
                      |
                      v
               Start user session
               User is logged in
```

---

## Database Schema

### `users`

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  firstName       String
  lastName        String
  passwordHash    String
  profileImageUrl String?
  phoneNumber     String?
  phoneVerifiedAt DateTime?
  dateOfBirth     String? // Format: YYYY-MM-DD
  gender          String?
  address         Json? // { formatted, street_address, locality, region, postal_code, country }

  // App-Specific Data
  publicMetadata  Json? // Visible to the client
  privateMetadata Json? // Visible only to IdP/backend

  emailVerifiedAt DateTime?
  lastLoginAt     DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Developer Portal Relations
  developedClients OAuthClient[] @relation("DeveloperClients")

  authCodes     AuthCode[]
  refreshTokens RefreshToken[]
  consents      UserConsent[]
}
```

### `oauth_clients`

Represents any application registered to use this IdP. Each client gets a `client_id` and `client_secret`.

```prisma
model OAuthClient {
  id                     String   @id @default(cuid())
  name                   String
  clientId               String   @unique @default(cuid())
  clientSecretHash       String
  redirectUris           Json     // JSONB array of allowed redirect URIs
  allowedScopes          String[] // e.g. ["openid", "profile", "email"]
  appUrl                 String?
  logoUrl                String?
  postLogoutRedirectUris String[] // allowlist for RP-Initiated Logout redirect URIs
  isActive               Boolean  @default(true)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  developerId String?
  developer   User?   @relation("DeveloperClients", fields: [developerId], references: [id])

  authCodes     AuthCode[]
  refreshTokens RefreshToken[]
  consents      UserConsent[]
}
```

### `user_consents`

Tracks the user's consent decision **per client** so we don't show the consent screen every time. Consent is re-requested when it expires (time-based) or when the client requests scopes the user hasn't granted yet.

```prisma
model UserConsent {
  id        String   @id @default(cuid())
  userId    String
  clientId  String
  scopes    String[] // union of granted scopes
  grantedAt DateTime @default(now())
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User        @relation(fields: [userId], references: [id])
  client OAuthClient @relation(fields: [clientId], references: [clientId])

  @@unique([userId, clientId])
  @@index([userId])
  @@index([clientId])
}
```

### `auth_codes`

Short-lived, one-time-use codes. The `usedAt` field enforces single-use at the DB level. PKCE challenge is stored here because the IdP is the one verifying it during token exchange.

```prisma
model AuthCode {
  id                  String    @id @default(cuid())
  code                String    @unique
  scopes              String[]
  redirectUri         String
  expiresAt           DateTime
  usedAt              DateTime?
  codeChallenge       String
  codeChallengeMethod String    @default("S256")
  nonce               String?   // stored if client sends one; echoed in id_token
  createdAt           DateTime  @default(now())

  clientId String
  userId   String

  client OAuthClient @relation(fields: [clientId], references: [clientId])
  user   User        @relation(fields: [userId], references: [id])

  @@index([code])
}
```

**Why `usedAt` instead of deleting the record?**

Deletion loses the audit trail. If a code gets reused, you want to know it happened. Some IdPs revoke all tokens from a reused code as a security measure. `usedAt` makes that possible.

### `refresh_tokens`

Persistent tokens that allow clients to obtain new access tokens without requiring the user to log in again. This table tracks the refresh token lifecycle, allowing us to implement features like validation, revocation, and rotation.

```prisma
model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  clientId  String
  scopes    String[]
  expiresAt DateTime
  usedAt    DateTime?
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user   User        @relation(fields: [userId], references: [id])
  client OAuthClient @relation(fields: [clientId], references: [clientId])

  @@index([token])
}
```

**Why store refresh tokens in the database?**

Unlike access tokens (which are usually stateless JWTs), refresh tokens are long-lived and must be stateful. By storing them, we can:

- **Revoke them** when a user logs out, disconnects an app, or if a token is compromised (`revokedAt`).
- **Track usage** (`usedAt`) to implement refresh token rotation and detect reuse/replay attacks.
- **Enforce expiration** (`expiresAt`) securely on the server-side.

### `session`

Stores the user's session data across interactions with the IdP (e.g. tracking intermediate state during the consent flow or developer dashboard sessions).

```prisma
model Session {
  sid    String   @id
  sess   Json
  expire DateTime @db.Timestamp(6)

  @@index([expire], name: "IDX_session_expire")
  @@map("session")
}
```

---

## RS256 Key Pair

This IdP signs JWTs using RSA private/public key pairs instead of a shared secret (HS256). Here's why that matters:

- With HS256, any party that can verify a token also has the ability to forge one (same secret used for both sign + verify)
- With RS256, the IdP signs with a private key that never leaves the server. Clients verify using the public key exposed at `/.well-known/jwks.json`. They can verify, but they cannot forge.

**Generating the key pair:**

```bash
# Generate private key
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

Store both in `.env` as escaped PEM strings. Also generate a `KEY_ID` (kid) - a simple UUID or string like `"key-1"` that identifies this key pair in the JWKS response.

**Important:** Generate once. Do not regenerate on server restart. All previously issued tokens will become unverifiable if the key pair changes.

---

## API Endpoints

### `GET /.well-known/openid-configuration`

The discovery document. OIDC clients hit this first to auto-configure themselves. No auth required.

Returns a JSON object describing all endpoints, supported scopes, signing algorithms, etc.

```json
{
  "issuer": "http://localhost:4000",
  "authorization_endpoint": "http://localhost:4000/authorize",
  "token_endpoint": "http://localhost:4000/token",
  "userinfo_endpoint": "http://localhost:4000/userinfo",
  "jwks_uri": "http://localhost:4000/.well-known/jwks.json",
  "end_session_endpoint": "http://localhost:4000/auth/logout",
  "introspection_endpoint": "http://localhost:4000/token/introspect",
  "scopes_supported": ["openid", "profile", "email"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "userinfo_signing_alg_values_supported": ["none"],
  "token_endpoint_auth_methods_supported": ["client_secret_post"],
  "code_challenge_methods_supported": ["S256"],
  "claims_supported": [
    "sub",
    "iss",
    "aud",
    "iat",
    "exp",
    "nonce",
    "email",
    "email_verified",
    "given_name",
    "family_name",
    "picture"
  ]
}
```

### `GET /.well-known/jwks.json`

Exposes the public key so clients can verify JWTs without contacting the IdP for every request.

```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "key-1",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

### `GET /authorize`

The authorization endpoint. Validates the incoming request, ensures the user is logged in, and then either:

- **Skips the consent UI** and redirects back immediately if there is an existing, unexpired consent that already covers the requested scopes, or
- Shows the consent UI if consent is missing/expired or the client is requesting new scopes.

Query params:

```
client_id            required
redirect_uri         required, must match registered URI
response_type        required, must be "code"
scope                required, must include "openid"
state                recommended, echoed back in redirect
code_challenge       required (PKCE)
code_challenge_method required, must be "S256"
```

On success, redirects to `redirect_uri?code=AUTH_CODE&state=STATE`.

### `POST /token`

Token endpoint. Exchanges a valid auth code for tokens. Server-to-server only - client secret is sent here.

Request body (application/x-www-form-urlencoded):

```
grant_type     authorization_code
code           the auth code from /authorize
redirect_uri   must exactly match what was used in /authorize
client_id
client_secret
code_verifier  the original random string (PKCE)
```

Verification steps in order:

1. Validate client_id + client_secret
2. Find the auth code - must exist, not expired, not used
3. Verify redirect_uri matches stored value
4. Verify `SHA256(code_verifier) === stored code_challenge`
5. Mark code as used (`usedAt = now()`)
6. Issue tokens

Response:

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

### `GET /userinfo`

Returns identity claims for the authenticated user. Requires a valid access token in the `Authorization: Bearer` header.

```json
{
  "sub": "user_cuid",
  "email": "user@example.com",
  "given_name": "Atharv",
  "family_name": "Dange",
  "picture": "https://..."
}
```

### `POST /auth/register`

Register a new user on the IdP.

> Note: we expose **two variants** of auth endpoints:
>
> - **UI (form + redirects)** for the `/authorize` flow: `POST /auth/register` and `POST /auth/login`
> - **API (JSON)** for programmatic use: `POST /auth/api/register` and `POST /auth/api/login`

### `POST /auth/login`

Authenticate a user. Returns a session or short-lived cookie used during the `/authorize` consent flow.

### `POST /auth/api/register`

API variant of register (JSON).

### `POST /auth/api/login`

API variant of login (JSON).

### `GET /auth/logout` · `POST /auth/logout`

RP-Initiated Logout endpoint (`end_session_endpoint`). Terminates the user's IdP session and revokes all active refresh tokens.

Accepted params (query string for GET, body for POST):

```
id_token_hint            optional – expired tokens accepted; used to identify user + client
client_id                optional – alternative to id_token_hint for identifying the RP;
                                    if both are provided, client_id must match id_token_hint.aud
post_logout_redirect_uri optional – must be pre-registered on the client; requires id_token_hint
                                    or client_id to be present
state                    optional – echoed back as a query param in the redirect
```

Logout logic in order:

1. Validate params via Zod middleware
2. If `id_token_hint` present → verify signature (expired tokens accepted), extract `sub` (userId) and `aud` (clientId)
3. If `client_id` present → verify it matches `id_token_hint.aud` when both are given
4. If `post_logout_redirect_uri` present → verify it's in the client's `postLogoutRedirectUris` allowlist
5. Revoke all non-revoked refresh tokens for the user (scoped to the specific client if known, global otherwise)
6. Destroy the IdP session; force-clear `connect.sid` cookie on store failure
7. Redirect to `post_logout_redirect_uri?state=STATE` or render the logout confirmation page

### `POST /clients/register`

Register a new OAuth client (app). Returns `client_id` and `client_secret`. The secret is shown once - only the hash is stored.

Request body includes optional `postLogoutRedirectUris: string[]` - the allowlist of URIs the client is permitted to redirect to after logout.

---

## ID Token Claims

The id_token is a signed JWT. Its payload looks like:

```json
{
  "iss": "http://localhost:4000",
  "sub": "user_cuid",
  "aud": "client_id",
  "iat": 1713500000,
  "exp": 1713503600,
  "email": "user@example.com",
  "given_name": "Atharv",
  "family_name": "Dange",
  "picture": "https://..."
}
```

`iss` (issuer), `sub` (subject), `aud` (audience), `iat` (issued at), `exp` (expiry) are standard OIDC required claims.

---

## PKCE Verification Logic

```
// During /authorize - store the challenge
code_challenge = base64url(SHA256(code_verifier))  // sent by client
store code_challenge in auth_codes table

// During /token - verify
incoming_code_verifier = req.body.code_verifier
computed = base64url(SHA256(incoming_code_verifier))

if (computed !== stored_code_challenge) {
  return 400 invalid_grant
}
```

The `code_verifier` never traveled the network before the token exchange. So even if an attacker intercepted the auth code in the redirect, they cannot exchange it without the verifier.

---

## State Parameter (CSRF Protection)

State is generated and verified entirely on the **client side**. The IdP just echoes it back in the redirect. This is by design - state is the client's CSRF protection mechanism, not the IdP's.

The IdP does not store or validate state. The client stores it in a cookie or session before the redirect, and checks it matches when the callback arrives.

---

## Project Structure

```
OIDC/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/               # config and env variables
│   ├── controller/           # Express route controllers
│   ├── errors/               # custom error classes
│   ├── lib/
│   │   ├── jwks.ts           # build JWKS response from public key
│   │   ├── jwt.ts            # sign + verify with RS256
│   │   ├── pkce.ts           # PKCE verification logic
│   │   └── prisma.ts         # prisma client instance
│   ├── middleware/
│   │   ├── errorHandler.ts   # global error handler
│   │   ├── requireAuth.ts    # authentication middleware
│   │   ├── validate.ts       # validation middleware
│   │   └── validateClient.ts # client validation
│   ├── rest/                 # .http files for testing
│   ├── routes/
│   │   ├── auth.routes.ts           # register, login
│   │   ├── authorize.routes.ts      # /authorize endpoint
│   │   ├── clients.routes.ts        # client registration
│   │   ├── discovery.routes.ts      # /.well-known/* endpoints
│   │   ├── token.routes.ts          # /token endpoint
│   │   └── userinfo.routes.ts       # /userinfo endpoint
│   ├── services/             # Business logic
│   ├── validation/           # Zod schemas for request validation
│   └── index.ts
├── keys/
│   ├── private.pem           # gitignored
│   └── public.pem            # gitignored
├── .env.example
└── README.md
```

---

## Getting Started

```bash
# Clone and install
git clone https://github.com/atharvdange618/OIDC.git
cd OIDC
npm install

# Generate RS256 key pair
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/private.pem
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Setup env
cp .env.example .env
# Fill in DATABASE_URL, KEY_ID, and paste PEM contents

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

---

## What This Is Not

This is a full implementation for learning and reference. It is not:

- Hardened for multi-tenant production traffic
- Formally security audited

---

Note: ye plan ai se format karwaya hai, likha maine hi hain, soo please verify and think twice before considering it an ai slop, this is best of my efforts, after reading offical spec sheets. kuch doubts honge toh dm me on x(atharvdangedev)

Note: one important thing, there are currently some issues in client implementation. soo please do not refer it as a good implementation.

Here are all the spec sheets and important reference docs

- https://openid.net/specs/openid-connect-core-1_0.html (this is open id spec sheet)
- https://datatracker.ietf.org/doc/html/rfc6749 (oauth 2.0 spec sheet)
- https://datatracker.ietf.org/doc/html/rfc7636 (pkce ka spec sheet)
- https://github.com/panva/jose (jose ke docs)
- https://openid.net/specs/openid-connect-discovery-1_0.html (jo jwks wla endpoint hai na uska spec sheet)
- https://datatracker.ietf.org/doc/html/rfc7519 (jwt ka official spec sheet for rabbit hole dwellers)
- https://datatracker.ietf.org/doc/html/rfc7517 (jwk ka spec sheet)
- https://datatracker.ietf.org/doc/html/rfc7662#section-2 (token introspection endpoint spec sheet)
- https://openid.net/specs/openid-connect-rpinitiated-1_0.html (RP-Initiated Logout spec)
