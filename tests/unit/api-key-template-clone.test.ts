import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-api-key-template-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.API_KEY_SECRET = "test-api-key-template-secret";

const core = await import("../../src/lib/db/core.ts");
const apiKeysDb = await import("../../src/lib/db/apiKeys.ts");

function reset(): void {
  core.resetDbInstance();
  apiKeysDb.resetApiKeyState();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

test.beforeEach(reset);
test.after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

test("new API keys inherit timofey_bunin settings without inheriting its secret", async () => {
  const template = await apiKeysDb.createApiKey("timofey_bunin", "template-machine");
  const db = core.getDbInstance();

  db.prepare(
    `UPDATE api_keys SET
      model_access_mode = 'restricted', allowed_models = '["cx/*"]', allowed_combos = '["team"]',
      allowed_connections = '["connection-1"]', no_log = 1, usage_limit_enabled = 1,
      daily_usage_limit_usd = 100, weekly_usage_limit_usd = 125, cache_default_mode = 'bypass',
      stream_default_mode = 'openai', compression_enabled = 0, max_requests_per_day = 500,
      max_requests_per_minute = 20, allowed_endpoints = '["chat"]', chaos_mode_enabled = 1
     WHERE id = ?`
  ).run(template.id);
  db.prepare(
    `INSERT INTO domain_budgets (
      api_key_id, daily_limit_usd, weekly_limit_usd, monthly_limit_usd,
      warning_threshold, reset_interval, reset_time
    ) VALUES (?, 10, 20, 30, 0.7, 'weekly', '09:00')`
  ).run(template.id);

  const created = await apiKeysDb.createApiKey("copied", "new-machine");
  const copied = db
    .prepare(
      `SELECT model_access_mode, allowed_models, allowed_combos, allowed_connections, no_log,
        usage_limit_enabled, daily_usage_limit_usd, weekly_usage_limit_usd, cache_default_mode,
        stream_default_mode, compression_enabled, max_requests_per_day, max_requests_per_minute,
        allowed_endpoints, chaos_mode_enabled
       FROM api_keys WHERE id = ?`
    )
    .get(created.id) as Record<string, unknown>;
  const budget = db
    .prepare(
      `SELECT daily_limit_usd, weekly_limit_usd, monthly_limit_usd, warning_threshold,
        reset_interval, reset_time FROM domain_budgets WHERE api_key_id = ?`
    )
    .get(created.id) as Record<string, unknown>;

  assert.deepEqual(copied, {
    model_access_mode: "restricted",
    allowed_models: '["cx/*"]',
    allowed_combos: '["team"]',
    allowed_connections: '["connection-1"]',
    no_log: 1,
    usage_limit_enabled: 1,
    daily_usage_limit_usd: 100,
    weekly_usage_limit_usd: 125,
    cache_default_mode: "bypass",
    stream_default_mode: "openai",
    compression_enabled: 0,
    max_requests_per_day: 500,
    max_requests_per_minute: 20,
    allowed_endpoints: '["chat"]',
    chaos_mode_enabled: 1,
  });
  assert.deepEqual(budget, {
    daily_limit_usd: 10,
    weekly_limit_usd: 20,
    monthly_limit_usd: 30,
    warning_threshold: 0.7,
    reset_interval: "weekly",
    reset_time: "09:00",
  });
  assert.notEqual(created.key, template.key);
  assert.notEqual(created.id, template.id);
});
