// `controlCenter.ts` is imported by a dashboard client component. Keep this
// mapping deliberately small and dependency-free: it only covers compatibility
// prefixes that need a canonical display label after combo-target normalization.
const COMBO_TARGET_PROVIDER_DISPLAY_ALIASES: Readonly<Record<string, string>> = {
  oc: "opencode",
  xiaomi: "xiaomi-mimo",
  llamacpp: "llama-cpp",
  agy: "antigravity",
  aq: "amazon-q",
};

export function resolveComboTargetProviderDisplayAlias(providerPrefix: string): string {
  return COMBO_TARGET_PROVIDER_DISPLAY_ALIASES[providerPrefix] || providerPrefix;
}
