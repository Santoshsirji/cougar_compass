import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client"; // Import Role enum

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // If trying to access /admin routes
  if (pathname.startsWith("/admin")) {
    // If no token (not logged in) OR token exists but user is not ADMIN
    if (!token || (token && token.role !== Role.ADMIN)) {
      // Redirect to login page, adding a callbackUrl for convenience
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", req.nextUrl.pathname); 
      // Add an error query param to indicate insufficient permissions if needed
      if (token && token.role !== Role.ADMIN) {
          url.searchParams.set("error", "AdminAccessRequired");
      }
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed if authorized or accessing other routes
  return NextResponse.next();
}

// Configure the middleware to run only on /admin paths
export const config = {
  matcher: ["/admin/:path*"],
}; 