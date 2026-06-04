import { TextAttributes } from "@opentui/core";

export function StatusBar() {
  return (
    <box flexDirection="row" width="100%" justifyContent="space-between">
      <box flexDirection="row" gap={1}>
        <text fg="orange">Build</text>
        <text attributes={TextAttributes.DIM}>›</text>
        <text>Opus 4.8</text>
      </box>
      <box flexDirection="row" gap={2}>
        <text attributes={TextAttributes.DIM}>Ctrl+N: Newline</text>
        <text fg="green">Enter: Submit</text>
      </box>
    </box>
  );
}
