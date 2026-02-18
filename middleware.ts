import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/lib/auth/config";
import { rootDomain } from "@/lib/utils";

// Auth pages for candidates (main domain)
const CANDIDATE_AUTH_PAGES = ['/login'];

// Auth pages for company (team subdomain) - these are under /company/(auth)
const COMPANY_AUTH_PAGES = ['/company/login', '/company/signup'];

// Public paths for the main domain (candidate-facing)
const MAIN_PUBLIC_PATHS = ['/', '/about', '/pricing', '/founders', '/privacy', ...CANDIDATE_AUTH_PAGES];

// Public paths for the team subdomain (no /company root - goes to login or dashboard)
const TEAM_PUBLIC_PATHS = ['/company/login'];

export const runtime = 'nodejs_compat';

/**
 * Detects if the request is coming from the team subdomain
 * Handles both local development and production
 */
function isTeamSubdomain(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0]; // Remove port if present

  // Local development: check for team.localhost or team.lvh.me
  if (hostname === 'team.localhost' || hostname.startsWith('team.localhost')) {
    return true;
  }

  // Production: check for team.{rootDomain}
  const rootDomainHost = rootDomain.split(':')[0];
  if (hostname === `team.${rootDomainHost}`) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  const isTeam = isTeamSubdomain(request);

  // Determine which public paths to use based on subdomain
  const publicPaths = isTeam ? TEAM_PUBLIC_PATHS : MAIN_PUBLIC_PATHS;
  const authPages = isTeam ? COMPANY_AUTH_PAGES : CANDIDATE_AUTH_PAGES;
  const loginPath = isTeam ? '/company/login' : '/login';
  const homePath = isTeam ? '/company/dashboard' : '/';

  // SKIP AUTH for public paths on main domain
  if (!isTeam && MAIN_PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }


  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // If authenticated user tries to access auth pages, redirect to appropriate home
      if (authPages.includes(pathname)) {
        return redirectToHome(request, { path: homePath });
      }

      // For team subdomain, redirect root to /company/dashboard (authenticated)
      if (isTeam && pathname === '/') {
        return NextResponse.redirect(new URL('/company/dashboard', request.url));
      }

      // Block non-company routes on team subdomain (except API routes)
      if (isTeam && !pathname.startsWith('/company') && !pathname.startsWith('/api') && !pathname.startsWith('/results/')) {
        return NextResponse.redirect(new URL('/company/dashboard', request.url));
      }

      // Block company routes on main domain
      if (!isTeam && pathname.startsWith('/company')) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Log execution time for valid token
      console.log(`Middleware (valid token) took ${Date.now() - start}ms for ${pathname}`);
      return NextResponse.next({
        request: {
          headers
        }
      });
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', { reason });

      // Log execution time for invalid token
      console.log(`Middleware (invalid token) took ${Date.now() - start}ms for ${pathname}`);

      // Redirect to appropriate login (redirectToLogin handles publicPaths internally)
      return redirectToLogin(request, {
        path: loginPath,
        publicPaths: publicPaths
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      // Log execution time for error
      console.log(`Middleware (error) took ${Date.now() - start}ms for ${pathname}`);

      return redirectToLogin(request, {
        path: loginPath,
        publicPaths: publicPaths
      });
    }
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/login",
    "/api/logout",
  ],
};
