import { TextAttributes } from "@opentui/core";

import { useTheme } from "../providers/theme";

export function StatusBar() {
  const { colors } = useTheme();

  return (
    <box flexDirection="row" width="100%" justifyContent="space-between">
      <box flexDirection="row" gap={1}>
        <text fg={colors.primary}>Build</text>
        <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
          ›
        </text>
        <text>Opus 4.8</text>
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
