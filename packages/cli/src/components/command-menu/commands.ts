import type { Command } from "./types";

export const COMMANDS: Command[] = [
  { name: "new", description: "Start a new conversation", value: "/new" },
  { name: "agents", description: "Switch current agent", value: "/agents" },
  {
    name: "models",
    description: "Select an AI model for generation",
    value: "/models",
  },
  {
    name: "history",
    description: "Browse past sessions",
    value: "/history",
  },
  {
    name: "theme",
    description: "Change current color theme",
    value: "/theme",
  },
  {
    name: "login",
    description: "Sign in with your browser",
    value: "/login",
  },
  {
    name: "logout",
    description: "Sign out of your account",
    value: "/logout",
  },
  {
    name: "upgrade",
    description: "Purchase more credits",
    value: "/upgrade",
  },
  {
    name: "usage",
    description: "Open billing portal in your browser",
    value: "/usage",
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
