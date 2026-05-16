import * as Sentry from "@sentry/nextjs";

// Next.js bundles each API route separately, so instrumentation.ts's Sentry
// instance is isolated from route handlers. We ensure init happens here,
// within the route's own bundle, so getClient() is non-null when imported.
if (!Sentry.getClient()) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
