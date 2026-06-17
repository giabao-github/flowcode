import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { MessageStatus } from "@flowcode/database/enums";
import {
  DEFAULT_CHAT_MODEL_ID,
  type SupportedChatModelId,
} from "@flowcode/shared";
import { useKeyboard } from "@opentui/react";
import type { InferResponseType } from "hono/client";
import prettyMs from "pretty-ms";
import { z } from "zod";

import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import { SessionShell } from "../components/session-shell";
import { useChat } from "../hooks/use-chat";
import type { ClientMessagePart, Message } from "../hooks/use-chat";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";
import { useKeyBoardLayer } from "../providers/keyboard-layer";
import { useToast } from "../providers/toast";

type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;

const sessionLocationSchema = z.object({
  session: z.custom<SessionData>((val) => {
    if (val === null || typeof val !== "object") return false;
    const v = val as Record<string, unknown>;
    return (
      "id" in v &&
      Array.isArray(v.messages) &&
      (v.messages as unknown[]).every(
        (m) => m !== null && typeof m === "object" && "id" in (m as object),
      )
    );
  }),
});

const newSessionStateSchema = z.object({
  message: z.string().min(1),
});

function mapDbMessages(dbMessages: SessionData["messages"]): Message[] {
  return dbMessages.map((message): Message => {
    if (message.role === "ERROR") {
      return { id: message.id, role: "error", content: message.content };
    }
    if (message.role === "USER") {
      return {
        id: message.id,
        role: "user",
        content: message.content,
        mode: message.mode,
        model: message.model as SupportedChatModelId,
      };
    }

    return {
      id: message.id,
      role: "assistant",
      content: message.content,
      mode: message.mode,
      model: message.model as SupportedChatModelId,
      parts: [{ type: "text", text: message.content }],
      ...(message.duration !== null
        ? { duration: prettyMs(message.duration * 1000) }
        : {}),
      interrupted: message.status === MessageStatus.INTERRUPTED,
    };
  });
}

function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return <UserMessage message={message.content} />;
  }
  if (message.role === "error") {
    return <ErrorMessage message={message.content} />;
  }
  return (
    <BotMessage
      parts={message.parts}
      mode={message.mode}
      model={message.model}
      streaming={false}
      duration={message.duration}
      interrupted={message.interrupted}
    />
  );
}

export function SessionChat({ session }: { session: SessionData }) {
  const [initialMessages] = useState(() => mapDbMessages(session.messages));
  const { isTopLayer } = useKeyBoardLayer();
  const { messages, streaming, submit, abort, interrupt } = useChat(
    session.id,
    initialMessages,
  );

  // Stop the pending reply when the user leaves the current session
  useEffect(() => {
    return () => abort();
  }, [abort]);

  // Let the user cancel a reply even before the first streamed chunk arrives
  useKeyboard((key) => {
    if (
      key.name === "escape" &&
      isTopLayer("base") &&
      streaming.status === "streaming"
    ) {
      key.preventDefault();
      interrupt();
    }
  });

  return (
    <SessionShell
      onSubmit={(text) =>
        submit({ userText: text, mode: "BUILD", model: DEFAULT_CHAT_MODEL_ID })
      }
      loading={streaming.status === "streaming"}
      interruptible={streaming.status === "streaming"}
    >
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {streaming.status === "streaming" && streaming.parts.length > 0 && (
        <BotMessage
          parts={streaming.parts}
          mode={streaming.mode}
          model={streaming.model}
          streaming
        />
      )}
    </SessionShell>
  );
}

export function Session() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = id === "new";

  const newState = useMemo(() => {
    if (!isNew) return null;
    const parsed = newSessionStateSchema.safeParse(location.state);
    return parsed.success ? parsed.data : null;
  }, [isNew, location.state]);

  useEffect(() => {
    if (isNew && !newState) {
      navigate("/", { replace: true });
    }
  }, [isNew, newState, navigate]);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isNew || !newState || hasStartedRef.current) return;
    hasStartedRef.current = true;

    let ignore = false;
    const createSession = async () => {
      try {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        const response = await apiClient.sessions.$post({
          json: {
            title: Array.from(segmenter.segment(newState.message))
              .slice(0, 100)
              .map((s) => s.segment)
              .join(""),
            cwd: process.cwd(),
            initialMessage: {
              role: "USER",
              content: newState.message,
              mode: "BUILD",
              model: DEFAULT_CHAT_MODEL_ID,
            },
          },
        });

        if (ignore) return;

        if (!response.ok) throw new Error(await getErrorMessage(response));

        const session = await response.json();
        navigate(`/sessions/${session.id}`, {
          replace: true,
          state: { session },
        });
      } catch (error) {
        if (ignore) return;
        toast.show({
          variant: "error",
          message:
            error instanceof Error ? error.message : "Failed to create session",
        });
        navigate("/", { replace: true });
      }
    };

    createSession();
    return () => {
      ignore = true;
    };
  }, [isNew, newState, navigate, toast]);

  const prefetched = useMemo(() => {
    if (isNew || !id) return null;
    const parsed = sessionLocationSchema.safeParse(location.state);
    if (!parsed.success) return null;
    return parsed.data.session.id === id ? parsed.data.session : null;
  }, [isNew, id, location.state]);

  const [session, setSession] = useState<SessionData | null>(prefetched);

  useEffect(() => {
    if (isNew) return;

    if (prefetched) {
      setSession(prefetched);
      return;
    }

    if (!id) return;

    let ignore = false;
    setSession(null);

    const fetchSession = async () => {
      try {
        const response = await apiClient.sessions[":id"].$get({
          param: { id },
        });
        if (ignore) return;
        if (!response.ok) throw new Error(await getErrorMessage(response));
        setSession(await response.json());
      } catch (error) {
        if (ignore) return;
        toast.show({
          variant: "error",
          message:
            error instanceof Error ? error.message : "Failed to load session",
        });
        navigate("/", { replace: true });
      }
    };

    fetchSession();
    return () => {
      ignore = true;
    };
  }, [isNew, toast, id, prefetched, navigate]);

  if (isNew) {
    if (!newState) return null;
    return (
      <SessionShell onSubmit={() => {}} inputDisabled loading>
        <UserMessage message={newState.message} />
      </SessionShell>
    );
  }

  const displaySession = session && session.id === id ? session : prefetched;

  if (!displaySession) {
    return <SessionShell onSubmit={() => {}} inputDisabled loading />;
  }

  return <SessionChat key={displaySession.id} session={displaySession} />;
}
