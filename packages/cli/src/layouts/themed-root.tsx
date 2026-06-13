import { type ReactNode, createContext, useContext, useEffect } from "react";

import { createCliRenderer } from "@opentui/core";

import { useTheme } from "../providers/theme";
import { resetTerminalBgColor, setTerminalBgColor } from "../utils/terminal";

type Renderer = Awaited<ReturnType<typeof createCliRenderer>>;

export const RendererContext = createContext<Renderer | null>(null);

type Props = {
  children: ReactNode;
};

export function ThemedRoot({ children }: Props) {
  const renderer = useContext(RendererContext);
  const { colors } = useTheme();

  useEffect(() => {
    if (!renderer) return;
    renderer.setBackgroundColor(colors.background);
    setTerminalBgColor(colors.background);
  }, [renderer, colors.background]);

  useEffect(() => {
    return () => {
      resetTerminalBgColor();
    };
  }, []);

  if (!renderer) {
    return null;
  }

  return (
    <box
      backgroundColor={colors.background}
      width="100%"
      height="100%"
      flexGrow={1}
    >
      {children}
    </box>
  );
}
