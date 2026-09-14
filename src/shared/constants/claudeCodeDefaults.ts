/**
 * Browser-safe Claude Code model defaults used by the CLI catalog.
 *
 * Do not import the provider registry from a dashboard client component: the
 * registry loads server-only provider integrations. Keep this table aligned
 * with getClaudeCodeDefaultModels() (covered by a unit test).
 */
export const CLAUDE_CODE_DEFAULT_MODELS = {
  fable: "claude-fable-5-1",
  opus: "claude-opus-5",
  sonnet: "claude-sonnet-5",
  haiku: "claude-haiku-4-5-20251001",
} as const;
