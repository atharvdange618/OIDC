import { handleAuth } from "@kleis-auth/nextjs/server";

const handler = handleAuth({
  scopes: ["openid", "profile", "email", "phone"],
});

export { handler as GET, handler as POST };
