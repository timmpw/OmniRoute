import assert from "node:assert/strict";
import test from "node:test";

import { isCodexBudgetExemptModel } from "../../src/shared/utils/codexBudgetExemption.ts";

test("recognizes the canonical Codex provider prefix and its cx alias", () => {
  assert.equal(isCodexBudgetExemptModel("codex/gpt-5.6-sol"), true);
  assert.equal(isCodexBudgetExemptModel(" cx/gpt-5.6-terra "), true);
});

test("does not exempt models from other providers", () => {
  assert.equal(isCodexBudgetExemptModel("openai/gpt-5.6-sol"), false);
  assert.equal(isCodexBudgetExemptModel("anthropic/claude-sonnet-4"), false);
  assert.equal(isCodexBudgetExemptModel(null), false);
});
