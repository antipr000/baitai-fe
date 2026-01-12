import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "@/lib/auth/config";

const AUTH_PAGES = ['/signup', '/login'];
const PUBLIC_PATHS = ['/', '/about', '/pricing', ...AUTH_PAGES];

export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // If authenticated user tries to access login/signup, redirect to home
      if (AUTH_PAGES.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }
      // Allow access to all other routes (including public ones like /)
      return NextResponse.next({
        request: {
          headers
        }
      });
    },
    handleInvalidToken: async (reason) => {
      console.info('Missing or malformed credentials', { reason });

      // If the user is trying to access a public path, allow it
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      // Otherwise, redirect to login
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      return redirectToLogin(request, {
        path: '/login',
        publicPaths: PUBLIC_PATHS
      });
    }
  });
  
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
