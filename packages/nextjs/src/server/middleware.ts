import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "./session";

interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  loginUrl?: string;
}

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const { publicRoutes = [], loginUrl = "/api/auth/login" } = options;

  return async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    const isPublic = [loginUrl, ...publicRoutes].some((route) => {
      if (route.includes("*")) {
        const pattern = route
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\\*/g, ".*");
        return new RegExp(`^${pattern}$`).test(pathname);
      }
      return pathname === route;
    });

    if (isPublic) {
      return NextResponse.next();
    }

    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return redirectToLogin(req, loginUrl);
    }

    const payload = await decrypt(token);

    if (!payload) {
      return redirectToLogin(req, loginUrl);
    }

    return NextResponse.next();
  };
}

function redirectToLogin(req: NextRequest, loginUrl: string) {
  const url = req.nextUrl.clone();
  url.pathname = loginUrl;
  url.searchParams.set("redirect_url", req.url);
  return NextResponse.redirect(url);
}
