import { Mode } from "@flowcode/database/enums";
import { TextAttributes } from "@opentui/core";

import type { ClientMessagePart } from "../../hooks/use-chat";
import { useTheme } from "../../providers/theme";

type Props = {
  parts: ClientMessagePart[];
  mode: Mode;
  model: string;
  duration?: string;
  streaming?: boolean;
  interrupted?: boolean;
};

export function BotMessage({
  parts,
  mode,
  model,
  duration,
  streaming = false,
  interrupted = false,
}: Props) {
  const { colors } = useTheme();
  const text = parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  return (
    <box width="100%" alignItems="center">
      <box width="100%" paddingY={1}>
        <box width="100%" paddingX={3}>
          <text>{text}</text>
        </box>
      </box>

      <box width="100%" paddingX={3} paddingBottom={1} gap={1}>
        <box flexDirection="row" gap={2}>
          <text
            attributes={interrupted ? TextAttributes.DIM : 0}
            fg={
              interrupted
                ? undefined
                : mode === Mode.PLAN
                  ? colors.planMode
                  : colors.primary
            }
          >
            ◉
          </text>
          <box flexDirection="row" gap={1}>
            <text attributes={interrupted ? TextAttributes.DIM : 0}>
              {mode === Mode.PLAN ? "Plan" : "Build"}
            </text>
            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              ›
            </text>
            <text attributes={TextAttributes.DIM}>{model}</text>
            {(duration || interrupted) && (
              <>
                <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
                  ›
                </text>
                <text attributes={TextAttributes.DIM}>
                  {interrupted ? "interrupted" : duration}
                </text>
              </>
            )}
          </box>
        </box>
      </box>
    </box>
  );
}
