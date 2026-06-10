import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { type InputRenderable, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";

import { useKeyBoardLayer } from "../providers/keyboard-layer";
import { useTheme } from "../providers/theme";

const MAX_VISIBLE_ITEMS = 6;

type DialogSearchListProps<T> = {
  items: T[];
  onSelect: (item: T) => void;
  onHighlight?: (item: T) => void;
  filterFn: (item: T, query: string) => boolean;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  getKey: (item: T) => string;
  initialSelectedIndex?: number;
  placeholder?: string;
  emptyText?: string;
};

function clampSelectedIndex(index: number, itemCount: number) {
  if (itemCount === 0) return 0;
  return Math.min(Math.max(index, 0), itemCount - 1);
}

function clampWindowStart(index: number, itemCount: number) {
  const maxWindowStart = Math.max(0, itemCount - MAX_VISIBLE_ITEMS);
  return Math.min(Math.max(index, 0), maxWindowStart);
}

function getWindowStartForIndex(
  selectedIndex: number,
  windowStart: number,
  itemCount: number,
) {
  if (selectedIndex < windowStart) {
    return selectedIndex;
  }

  const visibleEnd = windowStart + MAX_VISIBLE_ITEMS - 1;
  if (selectedIndex > visibleEnd) {
    return clampWindowStart(selectedIndex - MAX_VISIBLE_ITEMS + 1, itemCount);
  }

  return clampWindowStart(windowStart, itemCount);
}

export function DialogSearchList<T>({
  items,
  onSelect,
  onHighlight,
  filterFn,
  renderItem,
  getKey,
  initialSelectedIndex = 0,
  placeholder = "Search...",
  emptyText = "No results",
}: DialogSearchListProps<T>) {
  const clampedInitialSelectedIndex = clampSelectedIndex(
    initialSelectedIndex,
    items.length,
  );
  const [selectedIndex, setSelectedIndex] = useState(
    clampedInitialSelectedIndex,
  );
  const [windowStart, setWindowStart] = useState(() =>
    getWindowStartForIndex(clampedInitialSelectedIndex, 0, items.length),
  );
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<InputRenderable | null>(null);
  const { isTopLayer } = useKeyBoardLayer();
  const { colors } = useTheme();

  const filtered = searchValue
    ? items.filter((item) => filterFn(item, searchValue))
    : items;

  // Reconcile selection and window when filtered results count changes externally
  const [prevFilteredLength, setPrevFilteredLength] = useState(filtered.length);
  if (filtered.length !== prevFilteredLength) {
    setPrevFilteredLength(filtered.length);
    const nextSelected = clampSelectedIndex(selectedIndex, filtered.length);
    if (nextSelected !== selectedIndex) {
      setSelectedIndex(nextSelected);
    }
    setWindowStart(
      getWindowStartForIndex(nextSelected, windowStart, filtered.length),
    );
  }

  // Synchronize onHighlight preview state reactively whenever selected item changes
  const selectedItem = filtered[selectedIndex];
  useEffect(() => {
    if (selectedItem && onHighlight) {
      onHighlight(selectedItem);
    }
  }, [selectedItem, onHighlight]);

  const visibleItems = filtered.slice(
    windowStart,
    windowStart + MAX_VISIBLE_ITEMS,
  );

  const handleContentChange = useCallback(() => {
    const text = inputRef.current?.value ?? "";
    setSearchValue(text);
    setSelectedIndex(0);
    setWindowStart(0);
  }, []);

  useKeyboard((key) => {
    if (!isTopLayer("dialog")) return;

    if (key.name === "return" || key.name === "enter") {
      const item = filtered[selectedIndex];
      if (item) {
        onSelect(item);
      }
    } else if (key.name === "up") {
      if (filtered.length === 0) return;

      setSelectedIndex((index) => {
        const nextIndex = Math.max(0, index - 1);
        setWindowStart((start) =>
          getWindowStartForIndex(nextIndex, start, filtered.length),
        );
        return nextIndex;
      });
    } else if (key.name === "down") {
      if (filtered.length === 0) return;

      setSelectedIndex((index) => {
        const nextIndex = Math.min(filtered.length - 1, index + 1);
        setWindowStart((start) =>
          getWindowStartForIndex(nextIndex, start, filtered.length),
        );
        return nextIndex;
      });
    }
  });

  return (
    <box flexDirection="column" gap={1}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        focused
        onChange={handleContentChange}
      />
      {filtered.length === 0 ? (
        <text attributes={TextAttributes.DIM}>{emptyText}</text>
      ) : (
        <box flexDirection="column" height={visibleItems.length}>
          {visibleItems.map((item, index) => {
            const itemIndex = windowStart + index;
            const isSelected = itemIndex === selectedIndex;
            return (
              <box
                key={getKey(item)}
                flexDirection="row"
                height={1}
                overflow="hidden"
                backgroundColor={isSelected ? colors.selection : undefined}
                onMouseMove={() => {
                  setSelectedIndex(itemIndex);
                }}
              >
                {renderItem(item, isSelected)}
              </box>
            );
          })}
        </box>
      )}
    </box>
  );
}
