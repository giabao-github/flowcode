import type { RefObject } from "react";

import { type ScrollBoxRenderable, TextAttributes } from "@opentui/core";

import { useTheme } from "../../providers/theme";
import { COMMANDS } from "./commands";
import { getFilteredCommands } from "./filter-commands";

const MAX_VISIBLE_ITEMS = 8;
const ITEM_ROW_HEIGHT = 1;

const COMMAND_COL_WIDTH =
  Math.max(...COMMANDS.map((cmd) => cmd.name.length)) + 4;

type CommandMenuProps = {
  query: string;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};

export function CommandMenu({
  query,
  selectedIndex,
  scrollRef,
  onSelect,
  onExecute,
}: CommandMenuProps) {
  const { colors } = useTheme();
  const filtered = getFilteredCommands(query);
  const visibleHeight = Math.min(filtered.length, MAX_VISIBLE_ITEMS);

  if (filtered.length === 0) {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>No matching commands</text>
      </box>
    );
  }

  return (
    <scrollbox ref={scrollRef} height={visibleHeight * ITEM_ROW_HEIGHT}>
      {filtered.map((command, index) => {
        const isSelected = index === selectedIndex;

        return (
          <box
            key={command.value}
            flexDirection="row"
            alignItems="center"
            paddingX={1}
            height={ITEM_ROW_HEIGHT}
            overflow="hidden"
            backgroundColor={isSelected ? colors.selection : undefined}
            onMouseMove={() => onSelect(index)}
            onMouseDown={() => onExecute(index)}
          >
            <box width={COMMAND_COL_WIDTH} flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                /{command.name}
              </text>
            </box>
            <box flexGrow={1} flexShrink={1} overflow="hidden">
              <text selectable={false} fg={isSelected ? "black" : "gray"}>
                {command.description}
              </text>
            </box>
          </box>
        );
      })}
    </scrollbox>
  );
}
