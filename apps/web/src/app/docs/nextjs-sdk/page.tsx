import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { CodeBlock } from "@/components/neo/CodeBlock";
import { Tag } from "@/components/neo/Tag";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SDK Guide",
  description:
    "Comprehensive guide for integrating the @kleis-auth/nextjs SDK into your Next.js application.",
};

export default function NextJsSdkDocs() {
  return (
    <div className="space-y-12 pb-20">
      <header>
        <Tag tone="blue" className="mb-4">
          SDK GUIDE
        </Tag>
        <h1 className="text-4xl sm:text-6xl font-black font-sans leading-tight">
          Next.js SDK
        </h1>
        <p className="mt-6 text-xl text-muted-foreground font-serif leading-relaxed max-w-3xl">
          The{" "}
          <code className="font-mono bg-muted px-1">@kleis-auth/nextjs</code>{" "}
          SDK provides a seamless way to integrate Kleis into your applications.
          It handles PKCE, session management, and route protection with minimal
          configuration.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-black font-sans">Installation</h2>
        <p className="font-serif text-muted-foreground leading-relaxed">
          Install the package via your preferred package manager:
        </p>
        <CodeBlock title="Terminal">
          <code>pnpm add @kleis-auth/nextjs</code>
        </CodeBlock>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-black font-sans">Environment Variables</h2>
        <p className="font-serif text-muted-foreground leading-relaxed">
          Add these to your{" "}
          <code className="font-mono bg-muted px-1">.env.local</code> file. Make
          sure to keep your secrets safe!
        </p>
        <CodeBlock title=".env.local">
          <code>{`# The URL of your Kleis IdP instance
NEXT_PUBLIC_KLEIS_URL="https://auth.atharvdangedev.in"

# The Client ID provided when you registered your app
KLEIS_CLIENT_ID="your_client_id"

# The Client Secret provided when you registered your app
KLEIS_CLIENT_SECRET="your_client_secret"

# The base URL of your Next.js application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# A random 32+ character string used to encrypt the session cookie
KLEIS_SECRET="generate_a_random_secure_string_here"`}</code>
        </CodeBlock>
      </section>

      <section className="space-y-10">
        <h2 className="text-3xl font-black font-sans">Server Setup</h2>

        <div className="space-y-6">
          <h3 className="text-2xl font-black font-sans">
            1. API Route Handler
          </h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            Create a catch-all API route to handle login, callback, logout, and
            token refresh.
          </p>
          <CodeBlock title="app/api/auth/[...kleis]/route.ts">
            <code>{`import { handleAuth } from "@kleis-auth/nextjs/server";

const handler = handleAuth({
  scopes: ["openid", "profile", "email"],
});

export { handler as GET, handler as POST };`}</code>
          </CodeBlock>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black font-sans">2. Route Protection</h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            Use the provided middleware to protect your application routes.
            Unauthenticated users will be redirected to the login page.
          </p>
          <CodeBlock title="middleware.ts">
            <code>{`import { authMiddleware } from "@kleis-auth/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/about", "/api/public/*"],
  loginUrl: "/api/auth/login",
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};`}</code>
          </CodeBlock>
        </div>
      </section>

      <section className="space-y-10">
        <h2 className="text-3xl font-black font-sans">Client Setup</h2>

        <div className="space-y-6">
          <h3 className="text-2xl font-black font-sans">1. Session Provider</h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            Wrap your application in the <code className="font-mono bg-muted px-1">KleisProvider</code> to make authentication state available to all client components.
          </p>
          <CodeBlock title="app/layout.tsx">
            <code>{`import { KleisProvider } from "@kleis-auth/nextjs";
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
}`}</code>
          </CodeBlock>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-black font-sans">Usage</h2>

        <Card>
          <CardHeader>
            <p className="font-black font-sans">Server-Side Data Fetching</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              Use <code className="font-mono bg-muted px-1">getSession()</code>{" "}
              to access the current user&apos;s session securely on the server.
            </p>
            <CodeBlock title="app/dashboard/page.tsx">
              <code>{`import { getSession } from "@kleis-auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  return <div>Welcome, {session.user.email}!</div>;
}`}</code>
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-black font-sans">Client-Side Hooks</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              Use <code className="font-mono bg-muted px-1">useAuth()</code> and
              <code className="font-mono bg-muted px-1">useUser()</code> in
              Client Components.
            </p>
            <CodeBlock title="ProfileComponent.tsx">
              <code>{`"use client";
import { useAuth, useUser } from "@kleis-auth/nextjs";

export default function ProfileComponent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  const handleApiCall = async () => {
    const token = await getToken();
    const res = await fetch("/api/protected", {
      headers: { Authorization: \`Bearer \${token}\` },
    });
  };

  return (
    <div>
      <p>Hello, {user.given_name}!</p>
      <button onClick={handleApiCall}>Fetch Data</button>
    </div>
  );
}`}</code>
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-black font-sans">Pre-Built UI Components</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              The SDK includes basic UI components that you can drop into your application:
            </p>
            <CodeBlock title="Navigation.tsx">
              <code>{`import {
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
}`}</code>
            </CodeBlock>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
