import { useCallback, useEffect, useRef } from "react";

import type { KeyBinding, TextareaRenderable } from "@opentui/core";
import { useRenderer } from "@opentui/react";

import { EmptyBorder } from "./border";
import { CommandMenu } from "./command-menu";
import type { Command } from "./command-menu/types";
import { useCommandMenu } from "./command-menu/use-command-menu";
import { StatusBar } from "./status-bar";

type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
};

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
  { name: "enter", action: "submit" },
  { name: "return", action: "submit" },
  { name: "n", ctrl: true, action: "newline" },
];

export function InputBar({ onSubmit, disabled = false }: Props) {
  const textareaRef = useRef<TextareaRenderable | null>(null);
  const onSubmitRef = useRef<() => Promise<void>>(async () => {});
  const renderer = useRenderer();

  const {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    scrollRef,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
  } = useCommandMenu();

  const handleTextareaContentChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    handleContentChange(textarea.plainText);
  }, [handleContentChange]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.plainText.trim();

    if (!text) return;

    textarea.clear();
    onSubmit(text);
  }, [disabled, onSubmit]);

  const handleCommandError = useCallback((error: unknown) => {
    console.error("Command action failed", error);
  }, []);

  const handleCommand = useCallback(
    async (command: Command | undefined) => {
      const textarea = textareaRef.current;
      if (!textarea || !command) return;

      textarea.setText("");

      if (command.action) {
        await command.action({
          exit: () => renderer.destroy(),
        });
      } else {
        textarea.insertText(command.value + " ");
      }
    },
    [renderer],
  );

  const handleCommandExecute = useCallback(
    (index: number) => {
      const command = resolveCommand(index);
      void handleCommand(command).catch(handleCommandError);
    },
    [handleCommand, handleCommandError, resolveCommand],
  );

  // Wire up text area submit handler once, so it always reads the latest state.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.onSubmit = () => {
      void onSubmitRef.current().catch(handleCommandError);
    };
  }, [handleCommandError]);

  onSubmitRef.current = async () => {
    if (disabled) return;

    if (showCommandMenu) {
      const command = resolveCommand(selectedIndex);
      await handleCommand(command);
      return;
    }

    handleSubmit();
  };

  return (
    <box width="100%" alignItems="center">
      <box
        border={["left"]}
        borderColor="orange"
        width="100%"
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "╹",
        }}
      >
        <box
          width="100%"
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          gap={1}
          backgroundColor="#1A1A24"
        >
          {showCommandMenu && (
            <box
              position="absolute"
              bottom="100%"
              width="100%"
              backgroundColor="#1A1A24"
              left={0}
              zIndex={10}
            >
              <CommandMenu
                query={commandQuery}
                selectedIndex={selectedIndex}
                scrollRef={scrollRef}
                onSelect={setSelectedIndex}
                onExecute={handleCommandExecute}
              />
            </box>
          )}
          <textarea
            ref={textareaRef}
            focused={!disabled}
            placeholder="Fix hydration issue in dashboard page"
            keyBindings={TEXTAREA_KEY_BINDINGS}
            onContentChange={handleTextareaContentChange}
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
