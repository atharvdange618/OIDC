import { Card, CardContent, CardHeader } from "@/components/neo/Card";
import { CodeBlock } from "@/components/neo/CodeBlock";
import { Tag } from "@/components/neo/Tag";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IDP Integration Guide",
  description:
    "Learn how to manually integrate with the Kleis Identity Provider (IdP) using standard OIDC endpoints and PKCE flow.",
};

export default function IdpIntegrationDocs() {
  return (
    <div className="space-y-12 pb-20">
      <header>
        <Tag tone="peach" className="mb-4">
          API GUIDE
        </Tag>
        <h1 className="text-4xl sm:text-6xl font-semibold font-sans leading-tight">
          IDP Integration
        </h1>
        <p className="mt-6 text-xl text-muted-foreground font-serif leading-relaxed max-w-3xl">
          The Kleis Auth Server can be used completely independently of any SDK.
          It implements standard OIDC specifications, allowing integration via
          any HTTP client or OIDC library.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold font-sans">Endpoints</h2>
        <p className="font-serif text-muted-foreground leading-relaxed">
          Kleis exposes standard OIDC endpoints for discovery and
          authentication:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Discovery", path: "/.well-known/openid-configuration" },
            { label: "Authorization", path: "/authorize" },
            { label: "Token", path: "/token" },
            { label: "UserInfo", path: "/userinfo" },
            { label: "JWKS", path: "/.well-known/jwks.json" },
            { label: "Logout", path: "/auth/logout" },
          ].map((ep) => (
            <div
              key={ep.path}
              className="p-4 border-2 border-black dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
            >
              <p className="text-xs font-black font-sans uppercase mb-1 opacity-60">
                {ep.label}
              </p>
              <code className="text-sm font-bold font-mono">{ep.path}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-semibold font-sans">PKCE Flow</h2>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold font-sans italic">
            1. Authorization Request
          </h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            Redirect the user to the{" "}
            <code className="font-mono bg-muted px-1">/authorize</code> endpoint
            with your PKCE{" "}
            <code className="font-mono bg-muted px-1">code_challenge</code>.
          </p>
          <CodeBlock title="HTTP GET">
            <code>{`GET /authorize?
  client_id=your_client_id&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=openid profile email&
  state=random_state_string&
  code_challenge=base64_encoded_challenge&
  code_challenge_method=S256`}</code>
          </CodeBlock>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold font-sans italic">
            2. Handle the Callback
          </h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            After the user authenticates, the IdP will redirect back to your{" "}
            <code className="font-mono bg-muted px-1">redirect_uri</code> with{" "}
            <code className="font-mono bg-muted px-1">code</code> and{" "}
            <code className="font-mono bg-muted px-1">state</code> parameters.
          </p>
          <CodeBlock title="Example Callback">
            <code>{`GET https://yourapp.com/callback?code=auth_code_123&state=random_state_string`}</code>
          </CodeBlock>
          <p className="font-serif text-muted-foreground leading-relaxed">
            <strong>Security Check:</strong> Verify that the{" "}
            <code className="font-mono bg-muted px-1">state</code> matches the
            one you originally sent.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold font-sans italic">
            3. Exchange Code
          </h3>
          <p className="font-serif text-muted-foreground leading-relaxed">
            Exchange the authorization code for tokens using your
            <code className="font-mono bg-muted px-1">code_verifier</code>.
          </p>
          <CodeBlock title="HTTP POST /token">
            <code>{`POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=auth_code_received&
redirect_uri=https://yourapp.com/callback&
client_id=your_client_id&
client_secret=your_client_secret&
code_verifier=original_unhashed_verifier`}</code>
          </CodeBlock>
          <CodeBlock title="Response">
            <code>{`{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900
}`}</code>
          </CodeBlock>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold font-sans">User Info</h2>
        <Card>
          <CardHeader>
            <p className="font-black font-sans">Fetching Profile Data</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              Use the{" "}
              <code className="font-mono bg-muted px-1">access_token</code> to
              access the user&apos;s profile from the{" "}
              <code className="font-mono bg-muted px-1">/userinfo</code>{" "}
              endpoint.
            </p>
            <CodeBlock title="HTTP GET /userinfo">
              <code>{`GET /userinfo
Authorization: Bearer <access_token>`}</code>
            </CodeBlock>
            <CodeBlock title="Response">
              <code>{`{
  "sub": "user_id_123",
  "email": "user@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://..."
}`}</code>
            </CodeBlock>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold font-sans">Refreshing Tokens</h2>
        <Card>
          <CardHeader>
            <p className="font-black font-sans">Obtain a new access token</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              When an{" "}
              <code className="font-mono bg-muted px-1">access_token</code>{" "}
              expires, use the{" "}
              <code className="font-mono bg-muted px-1">refresh_token</code> to
              obtain a new one.
            </p>
            <CodeBlock title="HTTP POST /token">
              <code>{`POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=your_current_refresh_token&
client_id=your_client_id&
client_secret=your_client_secret`}</code>
            </CodeBlock>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold font-sans">Logging Out</h2>
        <Card>
          <CardHeader>
            <p className="font-black font-sans">End the user session</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-serif text-muted-foreground leading-relaxed">
              To end the user&apos;s session on the IdP, redirect them to the{" "}
              <code className="font-mono bg-muted px-1">/auth/logout</code>{" "}
              endpoint.
            </p>
            <CodeBlock title="HTTP GET /auth/logout">
              <code>{`GET /auth/logout?client_id=your_client_id&post_logout_redirect_uri=https://yourapp.com/`}</code>
            </CodeBlock>
          </CardContent>
        </Card>
      </section>

      <div className="p-8 border-4 border-black dark:border-neutral-700 bg-[#FF9149] dark:bg-secondary text-black">
        <p className="font-black font-sans text-xl mb-2">
          Pro Tip: Standard Compatibility
        </p>
        <p className="font-serif leading-relaxed opacity-90">
          Because Kleis follows the OpenID Connect specification, you can use
          popular libraries like{" "}
          <code className="font-mono bg-white/20 px-1">openid-client</code>{" "}
          (Node.js),
          <code className="font-mono bg-white/20 px-1">AppAuth</code>{" "}
          (iOS/Android), or
          <code className="font-mono bg-white/20 px-1">
            golang.org/x/oauth2
          </code>{" "}
          without any Kleis-specific code.
        </p>
      </div>
    </div>
  );
}
