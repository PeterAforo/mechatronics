import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.userType;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/products", "/order", "/icon.svg"];
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
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\..*).*)"],
};
