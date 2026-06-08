import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import { useKeyboard, useRenderer } from "@opentui/react";

type Responder = () => boolean;

type KeyBoardLayerContextValue = {
  push: (id: string, responder?: Responder) => void;
  pop: (id: string) => void;
  isTopLayer: (id: string) => boolean;
  setResponder: (id: string, responder: Responder | null) => void;
};

const KeyBoardLayerContext = createContext<KeyBoardLayerContextValue | null>(
  null,
);

export function KeyboardLayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<string[]>(["base"]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const responders = useRef<Map<string, Responder>>(new Map());
  const renderer = useRenderer();

  const push = useCallback((id: string, responder?: Responder) => {
    setStack((prev) => {
      if (prev.includes(id)) return prev;
      if (responder) {
        responders.current.set(id, responder);
      }
      return [...prev, id];
    });
  }, []);

  const pop = useCallback((id: string) => {
    responders.current.delete(id);
    setStack((prev) => prev.filter((layer) => layer !== id));
  }, []);

  const isTopLayer = useCallback((id: string) => {
    return stackRef.current[stackRef.current.length - 1] === id;
  }, []);

  const setResponder = useCallback(
    (id: string, responder: Responder | null) => {
      if (responder) {
        responders.current.set(id, responder);
      } else {
        responders.current.delete(id);
      }
    },
    [],
  );

  // Single Ctrl+C handler that walks the responder chain
  useKeyboard((key) => {
    if (!key.ctrl || key.name !== "c") return;

    const currentStack = stackRef.current;
    for (let i = currentStack.length - 1; i >= 0; i--) {
      const layerId = currentStack[i]!;

      const responder = responders.current.get(layerId);
      if (responder && responder()) return;
    }

    renderer.destroy();
  });

  return (
    <KeyBoardLayerContext.Provider
      value={{
        push,
        pop,
        isTopLayer,
        setResponder,
      }}
    >
      {children}
    </KeyBoardLayerContext.Provider>
  );
}

export function useKeyBoardLayer(): KeyBoardLayerContextValue {
  const value = useContext(KeyBoardLayerContext);
  if (!value) {
    throw new Error(
      "useKeyBoardLayer must be used within a KeyBoardLayerProvider",
    );
  }
  return value;
}
