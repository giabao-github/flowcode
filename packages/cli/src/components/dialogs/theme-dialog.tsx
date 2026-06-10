import { useCallback, useEffect, useRef } from "react";

import { useDialog } from "../../providers/dialog";
import { useTheme } from "../../providers/theme";
import type { Theme } from "../../providers/theme/theme";
import { THEMES } from "../../providers/theme/theme";
import { DialogSearchList } from "../dialog-search-list";

export function ThemeDialogContent() {
  const dialog = useDialog();
  const { currentTheme, previewTheme, commitTheme } = useTheme();
  const originalThemeRef = useRef(currentTheme);
  const confirmedRef = useRef(false);
  const initialSelectedIndex = Math.max(
    THEMES.findIndex((theme) => theme.name === originalThemeRef.current.name),
    0,
  );

  // Revert to original theme
  useEffect(() => {
    return () => {
      if (!confirmedRef.current) {
        previewTheme(originalThemeRef.current);
      }
    };
  }, [previewTheme]);

  const handleSelect = useCallback(
    (theme: Theme) => {
      confirmedRef.current = true;
      commitTheme(theme);
      dialog.close();
    },
    [dialog, commitTheme],
  );

  const handleHighlight = useCallback(
    (theme: Theme) => {
      previewTheme(theme);
    },
    [previewTheme],
  );

  return (
    <DialogSearchList
      items={THEMES}
      onSelect={handleSelect}
      onHighlight={handleHighlight}
      initialSelectedIndex={initialSelectedIndex}
      filterFn={(theme, query) =>
        theme.name.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(theme, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {theme.name === originalThemeRef.current.name
            ? "\u0020\u2022\u0020"
            : "\u0020\u0020\u0020"}
          {theme.name}
        </text>
      )}
      getKey={(theme) => theme.name}
      placeholder="Search themes..."
      emptyText="No matching themes"
    />
  );
}
