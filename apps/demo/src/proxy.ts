import { authMiddleware } from "@kleis-auth/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/auth/*"],
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
