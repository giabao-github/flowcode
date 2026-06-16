import { db } from "@flowcode/database/client";
import { MessageStatus, Mode, Role } from "@flowcode/database/enums";
import {
  type SupportedChatModelId,
  findSupportedChatModel,
} from "@flowcode/shared";
import { zValidator } from "@hono/zod-validator";
import * as Sentry from "@sentry/hono/bun";
import { Hono } from "hono";
import { z } from "zod";

const createSessionSchema = z.object({
  title: z.string(),
  cwd: z.string().optional(),
  initialMessage: z
    .object({
      role: z.enum(Role),
      content: z.string(),
      mode: z.enum(Mode),
      model: z
        .string()
        .refine(
          (id) => !!findSupportedChatModel(id as SupportedChatModelId),
          "Unsupported model",
        ),
    })
    .optional(),
});

const createSessionValidator = zValidator(
  "json",
  createSessionSchema,
  (result, c) => {
    if (!result.success) {
      Sentry.logger.warn("Session creation validation failed", {
        path: c.req.path,
        issues: result.error.issues.length,
      });
      return c.json({ error: "Invalid request body" }, 400);
    }
  },
);

const app = new Hono()
  .get("/", async (c) => {
    const cursor = c.req.query("cursor");
    const limit = 50;

    // TODO: Extract userId from authentication context
    const userId = "mock-user-id";
    const sessions = await db.session.findMany({
      where: { userId },
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    Sentry.logger.info("Listed sessions", {
      count: sessions.length,
    });

    return c.json(sessions);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    // TODO: Extract userId from authentication context
    const userId = "mock-user-id";
    const session = await db.session.findUnique({
      where: { id, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      Sentry.logger.warn("Session not found", {
        sessionId: id,
        userId: "mock-user-id",
      });
      return c.json({ error: "Session not found" }, 404);
    }

    Sentry.logger.info("Loaded session", {
      sessionId: session.id,
      messageCount: session.messages.length,
    });

    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {
    const { initialMessage, ...data } = c.req.valid("json");

    const session = await db.session.create({
      data: {
        ...data,
        // TODO: Replace with real user ID from authentication context
        userId: "mock-user-id",
        ...(initialMessage && {
          messages: {
            create: {
              ...initialMessage,
              status: MessageStatus.COMPLETE,
            },
          },
        }),
      },
      include: { messages: true },
    });

    Sentry.logger.info("Created session", {
      sessionId: session.id,
      title: session.title,
    });

    return c.json(session, 201);
  });

export default app;
