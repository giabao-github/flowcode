export type ModelPricing = {
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
};

export type SupportedProvider = "anthropic" | "openai" | "google";

type SupportedChatModelDefinition = {
  id: string;
  name: string;
  provider: SupportedProvider;
  pricing: ModelPricing;
};

export const SUPPORTED_CHAT_MODELS = [
  {
    id: "claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    pricing: { inputUsdPerMillionTokens: 5, outputUsdPerMillionTokens: 25 },
  },
  {
    id: "claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    pricing: { inputUsdPerMillionTokens: 3, outputUsdPerMillionTokens: 15 },
  },
  {
    id: "claude-haiku-4.6",
    name: "Claude Haiku 4.6",
    provider: "anthropic",
    pricing: { inputUsdPerMillionTokens: 1, outputUsdPerMillionTokens: 5 },
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    provider: "openai",
    pricing: { inputUsdPerMillionTokens: 2.5, outputUsdPerMillionTokens: 12.5 },
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "openai",
    pricing: { inputUsdPerMillionTokens: 0.75, outputUsdPerMillionTokens: 4.5 },
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT-5.4 Nano",
    provider: "openai",
    pricing: { inputUsdPerMillionTokens: 0.2, outputUsdPerMillionTokens: 1.25 },
  },
] as const satisfies readonly SupportedChatModelDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];
export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(
  modelId: SupportedChatModelId,
): SupportedChatModel | undefined {
  return SUPPORTED_CHAT_MODELS.find((model) => model.id === modelId);
}

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "claude-opus-4.6";

type IsUniqueIds<
  T extends readonly { id: string }[],
  Seen extends string = never,
> = T extends readonly [
  infer Head extends { id: string },
  ...infer Rest extends readonly { id: string }[],
]
  ? Head["id"] extends Seen
    ? ["Duplicate model id:", Head["id"]]
    : IsUniqueIds<Rest, Seen | Head["id"]>
  : true;

type AssertTrue<T extends true> = T;

type _CheckUniqueModelIds = AssertTrue<
  IsUniqueIds<typeof SUPPORTED_CHAT_MODELS>
>;
