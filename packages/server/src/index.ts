import { sentry } from "@sentry/hono/bun";
import * as Sentry from "@sentry/hono/bun";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import chat from "./routes/chat";
import sessions from "./routes/sessions";

const app = new Hono();

const parsedRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE);
const tracesSampleRate =
  process.env.SENTRY_TRACES_SAMPLE_RATE !== undefined &&
  Number.isFinite(parsedRate) &&
  parsedRate >= 0 &&
  parsedRate <= 1
    ? parsedRate
    : 0.1;

app.use(
  sentry(app, {
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate,
    enableLogs: true,
    dataCollection: {
      userInfo: true,
      httpHeaders: { request: true, response: true },
      queryParams: false,
    },
  }),
);

if (process.env.NODE_ENV === "development") {
  app.get("/debug-sentry", () => {
    Sentry.logger.info("User triggered test error", {
      action: "test_error_endpoint",
    });
    Sentry.metrics.count("test_counter", 1);
    throw new Error("My first Sentry error!");
  });
}

app.onError((error, c) => {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";

  if (error instanceof HTTPException) {
    const status = error.status;
    Sentry.logger.warn("Handled HTTP error", {
      status,
      message,
      path: c.req.path,
      method: c.req.method,
    });
    Sentry.captureException(error, { level: "warning" });

    const clientMessage =
      status >= 400 && status < 500 ? message : "Internal server error";
    return c.json({ error: clientMessage }, status);
  }

  Sentry.logger.error("Unhandled server error", {
    path: c.req.path,
    method: c.req.method,
    message,
  });
  Sentry.captureException(error);

  return c.json({ error: "Internal server error" }, 500);
});

const routes = app.route("/sessions", sessions).route("/chat", chat);
export type AppType = typeof routes;

// Due to LLM tool calls which take a while to complete, idleTimeout must be high
export default {
  port: (() => {
    const rawPort = process.env.PORT;
    if (rawPort === undefined) return 3000;
    const port = Number(rawPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid PORT: ${rawPort}`);
    }
    return port;
  })(),
  fetch: app.fetch,
  idleTimeout: 255,
};
