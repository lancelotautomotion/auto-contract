export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: 0.2,
    });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  error: Parameters<typeof import("@sentry/nextjs").captureRequestError>[0],
  request: Parameters<typeof import("@sentry/nextjs").captureRequestError>[1],
  context: Parameters<typeof import("@sentry/nextjs").captureRequestError>[2]
) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, request, context);
}
