import { createContext, useContext, useEffect } from "react";

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

import { Header } from "./components/header";
import { InputBar } from "./components/input-bar";
import { DialogProvider } from "./providers/dialog";
import { KeyboardLayerProvider } from "./providers/keyboard-layer";
import { ThemeProvider, getInitialTheme, useTheme } from "./providers/theme";
import { ToastProvider } from "./providers/toast";

type Renderer = Awaited<ReturnType<typeof createCliRenderer>>;

const RendererContext = createContext<Renderer | null>(null);

function setTerminalBgColor(hex: string) {
  try {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
      console.warn(`Invalid hex color format: ${hex}`);
      return;
    }
    process.stdout.write(`\x1b]11;${hex}\x07`);
  } catch (error) {
    console.error("Error setting terminal background color:", error);
  }
}

function resetTerminalBgColor() {
  try {
    process.stdout.write("\x1b]111\x07");
  } catch (error) {
    console.error("Error resetting terminal background color:", error);
  }
}

function ThemeRoot() {
  const renderer = useContext(RendererContext);
  const { colors } = useTheme();

  useEffect(() => {
    if (!renderer) return;
    renderer.setBackgroundColor(colors.background);
    setTerminalBgColor(colors.background);
  }, [renderer, colors.background]);

  if (!renderer) {
    return null;
  }

  return (
    <box
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.background}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <box width="100%" maxWidth={78} paddingX={2}>
        <InputBar
          onSubmit={(text) => {
            console.log("Submitted: ", text);
          }}
        />
      </box>
    </box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <ThemeRoot />
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>
  );
}

const initialTheme = getInitialTheme();

setTerminalBgColor(initialTheme.colors.background);

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
  backgroundColor: initialTheme.colors.background,
  onDestroy: resetTerminalBgColor,
});

createRoot(renderer).render(
  <RendererContext.Provider value={renderer}>
    <App />
  </RendererContext.Provider>,
);
