# Kleis Next.js SDK Guide

The `@kleis-auth/nextjs` SDK provides a seamless way to integrate the Kleis Identity Provider (IdP) into Next.js applications (App Router). It abstracts away the complexities of the OIDC Authorization Code Flow with PKCE, session management, and route protection.

## Installation

Install the package via your preferred package manager:

```bash
npm install @kleis-auth/nextjs
# or
yarn add @kleis-auth/nextjs
# or
pnpm add @kleis-auth/nextjs
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# The URL of your Kleis IdP instance
NEXT_PUBLIC_KLEIS_URL="https://auth.atharvdangedev.in"

# The Client ID provided when you registered your app
KLEIS_CLIENT_ID="your_client_id"

# The Client Secret provided when you registered your app
KLEIS_CLIENT_SECRET="your_client_secret"

# The base URL of your Next.js application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# A random 32+ character string used to encrypt the session cookie
KLEIS_SECRET="generate_a_random_secure_string_here"
```

---

## Server Setup

### 1. API Route Handler

Create a catch-all API route to handle login, callback, logout, and token refresh.

**File:** `app/api/auth/[...kleis]/route.ts`

```typescript
import { handleAuth } from "@kleis-auth/nextjs/server";

const handler = handleAuth({
  scopes: ["openid", "profile", "email"], // Optional: Override default scopes
});

export { handler as GET, handler as POST };
```

### 2. Route Protection (Middleware)

Use the provided middleware to protect your application routes. Unauthenticated users will be redirected to the login page.

**File:** `middleware.ts`

```typescript
import { authMiddleware } from "@kleis-auth/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/about", "/api/public/*"], // Routes that don't require authentication
  loginUrl: "/api/auth/login", // The URL to redirect to for login
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"], // Exclude static assets
};
```

---

## Client Setup

### 1. Session Provider

Wrap your application in the `KleisProvider` to make authentication state available to all client components.

**File:** `app/layout.tsx`

```tsx
import { KleisProvider } from "@kleis-auth/nextjs";
import { getSession } from "@kleis-auth/nextjs/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <KleisProvider session={session}>{children}</KleisProvider>
      </body>
    </html>
  );
}
```

---

## Usage

### Server-Side Data Fetching

Use `getSession()` to access the current user's session securely on the server.

```tsx
// app/dashboard/page.tsx
import { getSession } from "@kleis-auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  return <div>Welcome, {session.user.email}!</div>;
}
```

### Client-Side Hooks

Use `useAuth()` and `useUser()` in Client Components.

```tsx
"use client";
import { useAuth, useUser } from "@kleis-auth/nextjs";

export default function ProfileComponent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  const handleApiCall = async () => {
    // Automatically refreshes the token if needed
    const token = await getToken();
    const res = await fetch("/api/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div>
      <p>Hello, {user.given_name}!</p>
      <button onClick={handleApiCall}>Fetch Data</button>
    </div>
  );
}
```

### Pre-Built UI Components

The SDK includes basic UI components that you can drop into your application:

```tsx
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
} from "@kleis-auth/nextjs";

export default function Navigation() {
  return (
    <nav>
      {/* Renders a circular avatar that opens a dropdown with user info and a sign-out button */}
      <UserButton />

      {/* Triggers the login flow */}
      <SignInButton>Login</SignInButton>

      {/* Triggers the registration flow directly */}
      <SignUpButton>Register Now</SignUpButton>

      {/* Triggers the logout flow */}
      <SignOutButton />
    </nav>
  );
}
```
