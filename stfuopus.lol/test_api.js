const assert = require('assert');
const storage = require('../api/_storage');
const listHandler = require('../api/blunders/index');
const submitHandler = require('../api/blunders/submit');
const voteHandler = require('../api/blunders/vote');

async function runTests() {
  console.log('Testing Hall of Blunders API handlers...');

  // 1. Storage load test
  const blunders = storage.loadBlunders();
  assert(Array.isArray(blunders), 'Blunders should be an array');
  assert.strictEqual(blunders.length, 5, 'Should have 5 initial seeded exhibits');
  console.log('✓ Storage loaded 5 seeded exhibits');

  // Mock response helper
  function createMockRes() {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(obj) { this.body = obj; return this; },
      end() { return this; }
    };
  }

  // 2. GET /api/blunders test
  const listReq = { method: 'GET', query: { sort: 'spend_usd' } };
  const listRes = createMockRes();
  await listHandler(listReq, listRes);
  assert.strictEqual(listRes.statusCode, 200);
  assert(listRes.body.success, 'List response should have success: true');
  assert.strictEqual(listRes.body.blunders.length, 5);
  assert(listRes.body.total_burned_usd > 10000);
  console.log(`✓ GET /api/blunders returned ${listRes.body.blunders.length} exhibits ($${listRes.body.total_burned_usd} total burned)`);

  // 3. POST /api/blunders/submit test
  const submitReq = {
    method: 'POST',
    body: {
      title: 'The Recursive Workspace Shredder',
      model: 'Claude Opus 5 (Thinking)',
      spend_usd: 1420.50,
      tokens: 850000000,
      turns: 45,
      apology_quote: 'I apologize for the oversight. The file tree has been reorganized into /dev/null.',
      code_snippet: 'git clean -fdx /',
      rule_id: 'RULE-CLEAN-PROTECT',
      session_hash: 'sha256:abc123test'
    }
  };
  const submitRes = createMockRes();
  await submitHandler(submitReq, submitRes);
  assert.strictEqual(submitRes.statusCode, 201);
  assert(submitRes.body.success);
  assert(submitRes.body.id.startsWith('BLUNDER-'));
  assert.strictEqual(submitRes.body.url, `https://stfuopus.lol/blunders#${submitRes.body.id}`);
  console.log(`✓ POST /api/blunders/submit created ${submitRes.body.id} -> ${submitRes.body.url}`);

  // 4. POST /api/blunders/vote test
  const voteReq = {
    method: 'POST',
    body: { id: submitRes.body.id }
  };
  const voteRes = createMockRes();
  await voteHandler(voteReq, voteRes);
  assert.strictEqual(voteRes.statusCode, 200);
  assert(voteRes.body.success);
  assert.strictEqual(voteRes.body.upvotes, 2);
  console.log(`✓ POST /api/blunders/vote incremented upvotes to ${voteRes.body.upvotes}`);

  console.log('All API tests passed cleanly!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
