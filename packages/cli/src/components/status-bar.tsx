import { Mode } from "@flowcode/database/enums";
import { findSupportedChatModel } from "@flowcode/shared";
import { TextAttributes } from "@opentui/core";

import { usePromptConfig } from "../providers/prompt-config";
import { useTheme } from "../providers/theme";

export function StatusBar() {
  const { colors } = useTheme();
  const { mode, model } = usePromptConfig();

  const modelData = findSupportedChatModel(model);
  const modelName = modelData?.name ?? model;

  return (
    <box flexDirection="row" width="100%" justifyContent="space-between">
      <box flexDirection="row" gap={1}>
        <text fg={mode === Mode.PLAN ? colors.planMode : colors.primary}>
          {mode === Mode.PLAN ? "Plan" : "Build"}
        </text>
        <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
          ›
        </text>
        <text>{modelName}</text>
      </box>
      <box flexDirection="row" gap={2}>
        <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
          Ctrl+N: Newline
        </text>
        <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
          Enter: Submit
        </text>
      </box>
    </box>
  );
}
