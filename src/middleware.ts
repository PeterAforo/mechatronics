import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Use getToken for Edge-compatible JWT verification
  // NextAuth v5 uses different cookie names for secure (HTTPS) vs non-secure (HTTP)
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
    cookieName: request.nextUrl.protocol === "https:" 
      ? "__Secure-authjs.session-token" 
      : "authjs.session-token",
  });
  
  const { nextUrl } = request;
  
  const isLoggedIn = !!token;
  const userType = token?.userType as string | undefined;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/products", "/order", "/icon.svg", "/about", "/contact", "/faq", "/terms", "/privacy"];
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith("/products/")
  );

  // API routes
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  
  // Auth routes (login, register)
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || 
                      nextUrl.pathname.startsWith("/register") ||
                      nextUrl.pathname.startsWith("/forgot-password");

  // Admin routes
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  
  // Tenant portal routes
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");

  // Dashboard routes
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  // Invite routes
  const isInviteRoute = nextUrl.pathname.startsWith("/invite");

  // If it's an API route, let it through (API has its own auth)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Invite routes are public
  if (isInviteRoute) {
    return NextResponse.next();
  }

  // Dashboard routes are public (device dashboards)
  if (isDashboardRoute) {
    return NextResponse.next();
  }

  // If user is logged in and trying to access auth pages, redirect to appropriate portal
  if (isLoggedIn && isAuthRoute) {
    if (userType === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    } else if (userType === "tenant") {
      return NextResponse.redirect(new URL("/portal", nextUrl));
    }
    return NextResponse.next();
  }

  // If it's a public route, let it through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login?type=admin", nextUrl));
    }
    if (isPortalRoute) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // User is logged in - check they're accessing the correct portal
  if (isAdminRoute && userType !== "admin") {
    if (userType === "tenant") {
      return NextResponse.redirect(new URL("/portal", nextUrl));
    }
    return NextResponse.redirect(new URL("/login?type=admin", nextUrl));
  }

  if (isPortalRoute && userType !== "tenant") {
    if (userType === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\..*).*)"],
};
