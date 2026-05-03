# Kleis Identity Provider (IdP) Integration Guide

This guide explains how to integrate your application directly with the Kleis Identity Provider (IdP) using standard OAuth 2.0 and OpenID Connect (OIDC) protocols.

**Yes, the Kleis Auth Server can be used completely independently of any SDK.** It implements standard OIDC specifications, meaning you can interact with it using any HTTP client or standard OIDC libraries across any language or framework.

## Endpoints Overview

The Kleis IdP exposes the following standard endpoints:

- **Discovery Endpoint**: `/.well-known/openid-configuration`
- **Authorization Endpoint**: `/authorize`
- **Token Endpoint**: `/token`
- **UserInfo Endpoint**: `/userinfo`
- **Logout Endpoint**: `/auth/logout`

---

## Authentication Flow (Authorization Code with PKCE)

The recommended flow for applications is the **Authorization Code Flow with PKCE** (Proof Key for Code Exchange).

### 1. Initiate the Authorization Request

Redirect the user to the IdP's `/authorize` endpoint. You must generate a `state`, `code_verifier`, and `code_challenge` before redirecting.

**HTTP Method:** `GET`
**Endpoint:** `/authorize`

**Parameters:**

- `client_id`: Your application's Client ID.
- `redirect_uri`: The URL where the IdP should redirect back to after auth.
- `response_type`: Must be `code`.
- `scope`: Space-separated list of scopes (e.g., `openid profile email`).
- `state`: A random string to prevent CSRF attacks.
- `code_challenge`: The base64url-encoded SHA256 hash of your `code_verifier`.
- `code_challenge_method`: Must be `S256`.
- `prompt` (Optional): Set to `create` to directly open the registration page.

**Example:**

```http
GET /authorize?client_id=your_client_id&redirect_uri=https://yourapp.com/callback&response_type=code&scope=openid profile email&state=random_state_string&code_challenge=base64_encoded_challenge&code_challenge_method=S256
```

### 2. Handle the Callback

After the user authenticates, the IdP will redirect back to your `redirect_uri` with `code` and `state` parameters.

**Example Callback:**

```http
GET https://yourapp.com/callback?code=auth_code_123&state=random_state_string
```

**Security Check:** Verify that the `state` matches the one you originally sent.

### 3. Exchange Code for Tokens

Make a server-to-server POST request to the `/token` endpoint to exchange the authorization `code` for an `access_token`, `id_token`, and `refresh_token`.

**HTTP Method:** `POST`
**Endpoint:** `/token`
**Content-Type:** `application/x-www-form-urlencoded`

**Body Parameters:**

- `grant_type`: Must be `authorization_code`.
- `code`: The authorization code received in the callback.
- `redirect_uri`: Must match the original redirect URI.
- `client_id`: Your application's Client ID.
- `client_secret`: Your application's Client Secret.
- `code_verifier`: The original unhashed string used to generate the `code_challenge`.

**Response:**

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## Accessing User Information

Use the `access_token` to fetch the authenticated user's profile data from the `/userinfo` endpoint.

**HTTP Method:** `GET`
**Endpoint:** `/userinfo`
**Headers:**

- `Authorization`: `Bearer <access_token>`

**Response:**

```json
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://..."
}
```

---

## Refreshing Tokens

When an `access_token` expires, use the `refresh_token` to obtain a new one.

**HTTP Method:** `POST`
**Endpoint:** `/token`
**Content-Type:** `application/x-www-form-urlencoded`

**Body Parameters:**

- `grant_type`: Must be `refresh_token`.
- `refresh_token`: The user's current refresh token.
- `client_id`: Your application's Client ID.
- `client_secret`: Your application's Client Secret.

---

## Logging Out

To end the user's session on the IdP, redirect them to the `/auth/logout` endpoint.

**HTTP Method:** `GET`
**Endpoint:** `/auth/logout`

**Parameters:**

- `client_id`: Your application's Client ID.
- `post_logout_redirect_uri`: (Optional) Where to redirect the user after logging out.

**Example:**

```http
GET /auth/logout?client_id=your_client_id&post_logout_redirect_uri=https://yourapp.com/
```
