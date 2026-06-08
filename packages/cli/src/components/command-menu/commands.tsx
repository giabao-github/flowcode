import { ThemeDialogContent } from "../dialogs";
import type { Command } from "./types";

export const COMMANDS: Command[] = [
  {
    name: "new",
    description: "Start a new conversation",
    value: "/new",
    action: (ctx) => {
      ctx.toast.show({
        message: "Starting new conversation...",
      });
    },
  },
  {
    name: "agents",
    description: "Switch current agent",
    value: "/agents",
    action: (ctx) => {
      ctx.dialog.open({
        title: "Select Mode",
        children: <text>Agents selection will be coming soon...</text>,
      });
    },
  },
  {
    name: "models",
    description: "Select an AI model for generation",
    value: "/models",
    action: (ctx) => {
      ctx.dialog.open({
        title: "Select Model",
        children: <text>Model selection will be coming soon...</text>,
      });
    },
  },
  {
    name: "sessions",
    description: "Browse past sessions",
    value: "/sessions",
    action: (ctx) => {
      ctx.toast.show({
        message: "Loading sessions...",
      });
    },
  },
  {
    name: "theme",
    description: "Change current color theme",
    value: "/theme",
    action: (ctx) => {
      ctx.dialog.open({
        title: "Select Theme",
        backdrop: "theme",
        children: <ThemeDialogContent />,
      });
    },
  },
  {
    name: "login",
    description: "Sign in with your browser",
    value: "/login",
    action: (ctx) => {
      ctx.toast.show({
        message: "Opening browser to sign in...",
      });
    },
  },
  {
    name: "logout",
    description: "Sign out of your account",
    value: "/logout",
    action: (ctx) => {
      ctx.toast.show({
        message: "Signing out...",
      });
    },
  },
  {
    name: "upgrade",
    description: "Purchase more credits",
    value: "/upgrade",
    action: (ctx) => {
      ctx.toast.show({
        message: "Opening credits checkout...",
      });
    },
  },
  {
    name: "usage",
    description: "Open billing portal in your browser",
    value: "/usage",
    action: (ctx) => {
      ctx.toast.show({
        message: "Opening billing portal...",
      });
    },
  },

  {
    name: "exit",
    description: "Quit the application",
    value: "/exit",
    action: (ctx) => {
      ctx.exit();
    },
  },
];

if (process.env.NODE_ENV !== "production") {
  const values = new Set<string>();
  for (const cmd of COMMANDS) {
    if (values.has(cmd.value)) {
      throw new Error(`Duplicate command value: ${cmd.value}`);
    }
    values.add(cmd.value);
  }
}
