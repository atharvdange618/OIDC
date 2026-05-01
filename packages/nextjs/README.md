# @kleis-auth/nextjs

The official Next.js SDK for **Kleis OIDC**. Effortless authentication for Next.js applications using OpenID Connect and PKCE.

## Features

- **Secure by Default**: Uses HTTP-only cookies and PKCE.
- **Next.js Optimized**: Built for App Router, Middleware, and Server Actions.
- **Lightweight**: Minimal dependencies (`jose`, `zod`).
- TypeScript ready with full type safety.

## Installation

```bash
npm install @kleis-auth/nextjs
# or
pnpm add @kleis-auth/nextjs
# or
yarn add @kleis-auth/nextjs
```

## Configuration

Add the following environment variables to your `.env.local`:

```env
NEXT_PUBLIC_KLEIS_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
KLEIS_CLIENT_ID=your_client_id
KLEIS_CLIENT_SECRET=your_client_secret
KLEIS_SECRET=your_session_encryption_secret # Use a long random string
```

## Setup

### 1. API Route Handler

Create `app/api/auth/[...kleis]/route.ts`:

```typescript
import { handleAuth } from "@kleis-auth/nextjs/server";

const handler = handleAuth({
  scopes: ["openid", "profile", "email"],
});

export { handler as GET, handler as POST };
```

### 2. Middleware Protection

Create `middleware.ts` in your root:

```typescript
import { authMiddleware } from "@kleis-auth/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 3. Root Layout Provider

Wrap your application with `KleisProvider` in `app/layout.tsx`:

```tsx
import { KleisProvider } from "@kleis-auth/nextjs";
import { getSession } from "@kleis-auth/nextjs/server";

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html>
      <body>
        <KleisProvider session={session}>
          {children}
        </KleisProvider>
      </body>
    </html>
  );
}
```

## Usage

### Client Components

```tsx
"use client";

import { useUser, useAuth, SignInButton, SignOutButton } from "@kleis-auth/nextjs";

export default function Home() {
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();

  if (!isSignedIn) {
    return <SignInButton />;
  }

  return (
    <div>
      <p>Welcome, {user.given_name}!</p>
      <button onClick={() => getToken().then(console.log)}>Get Token</button>
      <SignOutButton />
    </div>
  );
}
```

### Server Components

```tsx
import { getSession } from "@kleis-auth/nextjs/server";

export default async function Dashboard() {
  const session = await getSession();
  
  return (
    <div>
      <h1>Protected Dashboard</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </div>
  );
}
```

## Components

- `<SignInButton>`: Triggers the login flow.
- `<SignUpButton>`: Triggers the registration flow.
- `<SignOutButton>`: Clears the session.
- `<UserButton>`: A pre-built avatar dropdown.
- `<KleisProvider>`: Context provider for auth state.

## Hooks

- `useUser()`: Access the current user profile.
- `useAuth()`: Access `isSignedIn`, `isLoaded`, and `getToken()`.

## License

MIT
