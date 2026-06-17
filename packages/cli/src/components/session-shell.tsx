import type { ReactNode } from "react";

import { TextAttributes } from "@opentui/core";

import { InputBar } from "./input-bar";
import { Spinner } from "./spinner";

type Props = {
  children?: ReactNode;
  inputDisabled?: boolean;
  loading?: boolean;
  interruptible?: boolean;
  onSubmit: (text: string) => void;
};

export function SessionShell({
  children,
  inputDisabled = false,
  loading = false,
  interruptible = false,
  onSubmit,
}: Props) {
  return (
    <box
      flexDirection="column"
      flexGrow={1}
      width="100%"
      height="100%"
      paddingY={1}
      paddingX={2}
      gap={1}
    >
      <scrollbox flexGrow={1} width="100%" stickyScroll stickyStart="bottom">
        <box gap={1}>{children}</box>
      </scrollbox>
      <box flexShrink={0}>
        <InputBar disabled={inputDisabled} onSubmit={onSubmit} />
      </box>
      <box
        flexShrink={0}
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        height={1}
        gap={2}
        paddingLeft={1}
      >
        <box flexDirection="row" alignItems="center" gap={2}>
          {loading ? (
            <>
              <Spinner />
              {interruptible ? (
                <text attributes={TextAttributes.DIM}>Esc to interrupt</text>
              ) : null}
            </>
          ) : null}
        </box>
        <box flexDirection="row" gap={1} flexShrink={0} marginLeft="auto">
          <text>Tab</text>
          <text attributes={TextAttributes.DIM}>Agents</text>
        </box>
      </box>
    </box>
  );
}
