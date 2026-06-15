import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { DEFAULT_CHAT_MODEL_ID } from "@flowcode/shared";
import type { InferResponseType } from "hono/client";
import { z } from "zod";

import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import { SessionShell } from "../components/session-shell";
import { apiClient } from "../lib/api-client";
import { getErrorMessage } from "../lib/http-errors";
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

function ChatMessage({
  message,
}: {
  message: SessionData["messages"][number];
}) {
  if (message.role === "USER") {
    return <UserMessage message={message.content} />;
  }
  if (message.role === "ERROR") {
    return <ErrorMessage message={message.content} />;
  }
  return <BotMessage content={message.content} model={message.model} />;
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
    if (isNew) return null;
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, [isNew, location.state]);

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

  return (
    <SessionShell onSubmit={() => {}} inputDisabled>
      {displaySession.messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </SessionShell>
  );
}
