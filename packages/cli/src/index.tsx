import { RouterProvider, createMemoryRouter } from "react-router";

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

import { RootLayout } from "./layouts/root-layout";
import { RendererContext } from "./layouts/themed-root";
import { getInitialTheme } from "./providers/theme";
import { Home } from "./screens/home";
import { Session } from "./screens/session";
import { resetTerminalBgColor, setTerminalBgColor } from "./utils/terminal";

const router = createMemoryRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "sessions/:id",
        element: <Session />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
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
