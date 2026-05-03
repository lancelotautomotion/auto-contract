import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAuthPage   = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // Utilisateur déjà connecté → redirige vers le dashboard
  if (userId && isAuthPage(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protection des routes /admin
  if (isAdminRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Essai via sessionClaims d'abord (JWT), fallback sur clerkClient (API)
    const roleFromClaims = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role;

    if (roleFromClaims === "admin") return; // JWT inclut déjà le rôle → OK

    // JWT ne contient pas encore la metadata → vérification via API Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const roleFromApi = user.publicMetadata?.role;

    if (roleFromApi !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
