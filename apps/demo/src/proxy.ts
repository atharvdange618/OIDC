import { authMiddleware } from "@torii/nextjs/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/auth/*",
  ],
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
