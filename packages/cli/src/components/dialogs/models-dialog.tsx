import { useCallback } from "react";

import type { SupportedChatModelId } from "@flowcode/shared";
import { findSupportedChatModel } from "@flowcode/shared";

import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";

type ModelsDialogContentProps = {
  models: SupportedChatModelId[];
  currentModel: SupportedChatModelId;
  onSelectModel: (modelId: SupportedChatModelId) => void;
};

const getProviderName = (provider: string) => {
  if (provider === "openai") return "OpenAI";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

const getDisplayName = (modelId: SupportedChatModelId) => {
  const model = findSupportedChatModel(modelId);
  return model ? `${model.name} (${getProviderName(model.provider)})` : modelId;
};

export function ModelsDialogContent({
  models,
  currentModel,
  onSelectModel,
}: ModelsDialogContentProps) {
  const dialog = useDialog();

  const handleSelect = useCallback(
    (modelId: SupportedChatModelId) => {
      onSelectModel(modelId);
      dialog.close();
    },
    [dialog, onSelectModel],
  );

  const initialSelectedIndex = Math.max(models.indexOf(currentModel), 0);

  return (
    <DialogSearchList
      items={models}
      onSelect={handleSelect}
      initialSelectedIndex={initialSelectedIndex}
      filterFn={(modelId, query) => {
        const displayName = getDisplayName(modelId);
        return displayName.toLowerCase().includes(query.toLowerCase());
      }}
      renderItem={(modelId, isSelected) => {
        const displayName = getDisplayName(modelId);
        return (
          <text selectable={false} fg={isSelected ? "black" : "white"}>
            {modelId === currentModel ? "• " : "  "}
            {displayName}
          </text>
        );
      }}
      getKey={(modelId) => modelId}
      placeholder="Search models..."
      emptyText="No matching models"
    />
  );
}
