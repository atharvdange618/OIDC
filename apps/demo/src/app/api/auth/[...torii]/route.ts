import { handleAuth } from "@torii/nextjs/server";

const handler = handleAuth();

export { handler as GET, handler as POST };
