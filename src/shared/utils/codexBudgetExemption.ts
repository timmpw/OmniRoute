/**
 * Codex is paid from the user's OpenAI subscription, rather than OmniRoute's
 * metered provider balance. Its models must therefore remain available after
 * an API key's dollar budget is exhausted.
 */
export function isCodexBudgetExemptModel(model: string | null | undefined): boolean {
  if (typeof model !== "string") return false;

  const normalized = model.trim().toLowerCase();
  return normalized.startsWith("codex/") || normalized.startsWith("cx/");
}
