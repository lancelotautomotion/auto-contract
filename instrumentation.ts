export async function register() {
  console.log("[instrumentation] register called, runtime:", process.env.NEXT_RUNTIME);
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[instrumentation] loading sentry server config");
    await import("./sentry.server.config");
    const { getClient } = await import("@sentry/nextjs");
    console.log("[instrumentation] sentry client after init:", !!getClient());
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
