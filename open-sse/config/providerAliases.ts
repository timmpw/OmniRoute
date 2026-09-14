import { generateAliasMap } from "./providerRegistry.ts";

const PROVIDER_ID_TO_ALIAS = generateAliasMap();
const ALIAS_TO_PROVIDER_ID: Record<string, string> = {};

for (const [providerId, alias] of Object.entries(PROVIDER_ID_TO_ALIAS)) {
  ALIAS_TO_PROVIDER_ID[alias] = providerId;
}

// These prefixes describe compatibility routes rather than a registry entry's
// display alias. Keep them with the resolver so client and server callers use
// the same canonical provider identity.
Object.assign(ALIAS_TO_PROVIDER_ID, {
  opencode: "opencode-zen",
  xiaomi: "xiaomi-mimo",
  llamacpp: "llama-cpp",
  agy: "antigravity",
  aq: "amazon-q",
});

/**
 * Resolve a provider alias to its canonical provider ID.
 *
 * This module intentionally depends only on the browser-safe provider registry.
 * Do not move it into `services/model.ts`: dashboard code also needs this
 * normalization and must not pull database-backed model resolution into the
 * client bundle.
 */
export function resolveProviderAlias(aliasOrId: string | null | undefined): string | null {
  if (typeof aliasOrId !== "string") return null;

  let current = aliasOrId;
  const seen = new Set<string>();
  for (let index = 0; index < 10; index++) {
    const next = ALIAS_TO_PROVIDER_ID[current];
    if (!next || next === current) return current;
    if (next in PROVIDER_ID_TO_ALIAS) return next;
    if (seen.has(next)) return next;
    seen.add(next);
    current = next;
  }
  return current;
}
