import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  type SupportedChatModel,
  type SupportedChatModelId,
  type SupportedProvider,
  findSupportedChatModel,
} from "@flowcode/shared";
import type { LanguageModel } from "ai";

type AnthropicModelId = Extract<
  SupportedChatModel,
  { readonly provider: "anthropic" }
>["id"];

type OpenAIModelId = Extract<
  SupportedChatModel,
  { readonly provider: "openai" }
>["id"];

type GoogleModelId = Extract<
  SupportedChatModel,
  { readonly provider: "google" }
>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
};

function assertUnsupportedProvider(model: never): never {
  throw new Error(`Unsupported provider: ${JSON.stringify(model)}`);
}

function resolveAnthropicModel(modelId: AnthropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
  };
}

function resolveOpenAIModel(modelId: OpenAIModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
  };
}

function resolveGoogleModel(modelId: GoogleModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
  };
}

function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  switch (model.provider) {
    case "anthropic":
      return resolveAnthropicModel(model.id);
    case "openai":
      return resolveOpenAIModel(model.id);
    case "google":
      return resolveGoogleModel(model.id);
    default:
      return assertUnsupportedProvider(model);
  }
}

export function isSupportedChatModel(modelId: string) {
  return findSupportedChatModel(modelId as SupportedChatModelId) !== undefined;
}

export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId as SupportedChatModelId);
  if (!model) {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  return resolveSupportedChatModel(model);
}
