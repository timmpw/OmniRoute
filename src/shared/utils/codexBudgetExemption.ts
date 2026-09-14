/**
 * Mirrors the families that src/sse/handlers/chatHelpers.ts reroutes away from
 * Codex because Codex OAuth does not serve them.
 */
const CODEX_REROUTED_MODEL_PREFIX = /^(deepseek|qwen|kimi|glm|minimax|mimo)/i;

/**
 * Codex is paid from the user's OpenAI subscription, rather than OmniRoute's
 * metered provider balance. Its native models must therefore remain available
 * after an API key's dollar budget is exhausted.
 */
export function isCodexBudgetExemptModel(model: string | null | undefined): boolean {
  if (typeof model !== "string") return false;

  const normalized = model.trim().toLowerCase();
  const [provider, modelId] = normalized.split("/", 2);
  if (provider !== "codex" && provider !== "cx") return false;

  return !CODEX_REROUTED_MODEL_PREFIX.test(modelId);
}
