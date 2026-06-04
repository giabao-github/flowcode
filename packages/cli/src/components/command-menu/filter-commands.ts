import { COMMANDS } from "./commands";
import type { Command } from "./types";

export function getFilteredCommands(query: string): Command[] {
  const formattedQuery = query.trim().toLowerCase();

  if (!formattedQuery) {
    return [...COMMANDS];
  }

  return COMMANDS.filter((command) =>
    command.name.toLowerCase().startsWith(formattedQuery),
  );
}
