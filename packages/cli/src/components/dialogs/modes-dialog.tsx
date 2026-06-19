import { useCallback } from "react";

import { Mode } from "@flowcode/database/enums";

import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";

type ModesDialogContentProps = {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
};

const AVAILABLE_MODES: Mode[] = [Mode.PLAN, Mode.BUILD];

function getModeLabel(mode: Mode) {
  return mode === Mode.PLAN ? "Plan" : "Build";
}

export function ModesDialogContent({
  currentMode,
  onSelectMode,
}: ModesDialogContentProps) {
  const dialog = useDialog();

  const handleSelect = useCallback(
    (nextMode: Mode) => {
      onSelectMode(nextMode);
      dialog.close();
    },
    [dialog, onSelectMode],
  );

  const initialSelectedIndex = Math.max(AVAILABLE_MODES.indexOf(currentMode), 0);

  return (
    <DialogSearchList
      items={AVAILABLE_MODES}
      onSelect={handleSelect}
      initialSelectedIndex={initialSelectedIndex}
      filterFn={(mode, query) =>
        getModeLabel(mode).toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(mode, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {mode === currentMode ? "• " : "  "}
          {getModeLabel(mode)}
        </text>
      )}
      getKey={(mode) => mode}
      placeholder="Search modes..."
      emptyText="No matching modes"
    />
  );
}
