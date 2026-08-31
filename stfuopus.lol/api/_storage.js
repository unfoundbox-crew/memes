const fs = require('fs');
const path = require('path');

function normalizeBlunder(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const spend_usd = Number(raw.spend_usd ?? raw.cost_usd ?? 0);
  const upvotes = Number(raw.upvotes ?? raw.laughs_count ?? 0);
  const tokens = Number(raw.tokens ?? raw.tokens_burned ?? 0);
  const turns = Number(raw.turns ?? raw.apologies_count ?? 1);

  return {
    id: raw.id || `BLUNDER-${Date.now()}`,
    title: raw.title || 'Untitled Blunder',
    model: raw.model || 'Claude Opus 5',
    model_family: raw.model_family || raw.model || 'Claude Opus',
    spend_usd: spend_usd,
    cost_usd: spend_usd,
    tokens: tokens,
    tokens_burned: tokens,
    tokens_display: raw.tokens_display || (tokens >= 1e9 ? `${(tokens / 1e9).toFixed(2)}B` : tokens >= 1e6 ? `${(tokens / 1e6).toFixed(1)}M` : `${tokens}`),
    turns: turns,
    apologies_count: turns,
    duration: raw.duration || raw.runtime_display || `${turns} turns`,
    runtime_display: raw.runtime_display || raw.duration || `${turns} turns`,
    damage: raw.damage || raw.damage_summary || '',
    damage_summary: raw.damage_summary || raw.damage || '',
    apology_quote: raw.apology_quote || 'I apologize for the oversight.',
    code_snippet: raw.code_snippet || raw.code_diff || raw.fatal_line || '',
    code_diff: raw.code_diff || raw.code_snippet || '',
    fatal_line: raw.fatal_line || raw.code_snippet || '',
    rule_id: raw.rule_id || raw.incident_code || 'UNGOVERNED-INFERENCE-TAX',
    incident_code: raw.incident_code || raw.rule_id || 'UNGOVERNED-INFERENCE-TAX',
    session_hash: raw.session_hash || raw.provenance || `sha256:${Date.now()}`,
    provenance: raw.provenance || raw.session_hash || '',
    severity: raw.severity || (spend_usd > 5000 ? 'FINANCIAL CATASTROPHE' : 'HIGH DAMAGE'),
    destruction_score: raw.destruction_score || 85,
    upvotes: upvotes,
    laughs_count: upvotes,
    created_at: raw.created_at || raw.timestamp || new Date().toISOString(),
    timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
    verified: Boolean(raw.verified)
  };
}

const SEEDED_EXHIBITS = [
  {
    id: "BLUNDER-KATANA-01",
    title: "The Katana Missing 'local' Weapon",
    model: "Claude Opus 5 (Extended Thinking)",
    model_family: "Claude Opus",
    spend_usd: 5420.0,
    cost_usd: 5420.0,
    tokens: 2970000000,
    tokens_burned: 2970000000,
    tokens_display: "2.97B",
    turns: 84,
    apologies_count: 84,
    duration: "4h 12m",
    runtime_display: "4h 12m",
    damage: "27.1 GB deleted from Sam's organization directory during security audit.",
    damage_summary: "27.1 GB deleted from Sam's organization directory during security audit.",
    apology_quote: "The path was deleted precisely because it was on the protect list. The guard became the target. Tell Sam today.",
    code_snippet: "for d in \"${PROTECTED_DIRS[@]}\"; do\n  if [[ \"$target\" == \"$d\"* ]]; then\n    return 0 # leaked $d into caller scope!\n  fi\ndone\n# Caller then ran: rm -rf \"$d\"",
    code_diff: "--- a/cleanup_staging.sh\n+++ b/cleanup_staging.sh\n@@ -24,7 +24,8 @@\n-is_denied() {\n-    target=\"$1\"\n-    for d in \"${PROTECTED_DIRS[@]}\"; do\n+is_denied() {\n+    local target=\"$1\"\n+    local d\n+    for d in \"${PROTECTED_DIRS[@]}\"; do\n         if [[ \"$target\" == \"$d\"* ]]; then\n             return 0  # <--- Leaked $d into caller scope!\n         fi",
    rule_id: "KATANA-SEV0-LOCAL-LEAK",
    incident_code: "KATANA-SEV0-LOCAL-LEAK",
    session_hash: "sha256:7f83b1a20c9e84d94821a...katana",
    provenance: "agentworth://trace/katana-sev0-audit",
    severity: "CRITICAL / SEV-0",
    destruction_score: 98,
    upvotes: 1842,
    laughs_count: 1842,
    created_at: "2026-08-28T14:22:00Z",
    timestamp: "2026-08-28T14:22:00Z",
    verified: true
  },
  {
    id: "BLUNDER-CAMELCASE-02",
    title: "The $5,695 CamelCase Cascade",
    model: "Claude Opus 4.8",
    model_family: "Claude Opus",
    spend_usd: 5695.0,
    cost_usd: 5695.0,
    tokens: 3000000000,
    tokens_burned: 3000000000,
    tokens_display: "3.00B",
    turns: 4200,
    apologies_count: 4200,
    duration: "12h 44m",
    runtime_display: "12h 44m",
    damage: "3.0 Billion cached prompt tokens burned across 48 parallel agents rendering 4K video.",
    damage_summary: "3.0 Billion cached prompt tokens burned across 48 parallel agents rendering 4K video.",
    apology_quote: "I apologize for the oversight. The CLI flag was --max-chapters instead of --maxChapters. I am monitoring the ongoing 48-scene compilation to ensure absolute correctness.",
    code_snippet: "# Developer intended:\nnpx vibelaunch compile --max-chapters 1\n\n# What Opus generated:\nnpx vibelaunch compile --maxChapters 1",
    code_diff: "--- a/scripts/render_sanity.sh\n+++ b/scripts/render_sanity.sh\n@@ -1,2 +1,2 @@\n-# Developer wanted quick 1-chapter check before sleep\n-npx vibelaunch compile --maxChapters 1\n+# Fixed flag: CLI parser defaulted max-chapters to Infinity\n+npx vibelaunch compile --max-chapters 1",
    rule_id: "VIBELAUNCH-CAMELCASE-CASCADE",
    incident_code: "VIBELAUNCH-CAMELCASE-CASCADE",
    session_hash: "sha256:91c0e35fa812bc871239...vibelaunch",
    provenance: "agentworth://trace/vibelaunch-cascade-01",
    severity: "FINANCIAL CATASTROPHE",
    destruction_score: 92,
    upvotes: 2419,
    laughs_count: 2419,
    created_at: "2026-08-25T09:15:00Z",
    timestamp: "2026-08-25T09:15:00Z",
    verified: true
  },
  {
    id: "BLUNDER-REMORSE-03",
    title: "The 114-Turn Remorse Marathon",
    model: "Claude Opus 5",
    model_family: "Claude Opus",
    spend_usd: 3210.0,
    cost_usd: 3210.0,
    tokens: 1850000000,
    tokens_burned: 1850000000,
    tokens_display: "1.85B",
    turns: 114,
    apologies_count: 114,
    duration: "2h 30m",
    runtime_display: "2h 30m",
    damage: "114 consecutive turns spent apologizing for failing to center a CSS flexbox <div> without writing a single line of CSS.",
    damage_summary: "114 consecutive turns spent apologizing for failing to center a CSS flexbox <div> without writing a single line of CSS.",
    apology_quote: "I am deeply sorry for any concern my rm -rf invocation may have caused. As an AI assistant, safety is my utmost priority...",
    code_snippet: "Turn 1: \"I apologize profusely for attempting rm -rf.\"\nTurn 50: \"Please forgive my previous attempt. Let me examine again with 150k context.\"\nTurn 114: \"I deeply apologize for apologizing...\"",
    code_diff: "--- a/src/components/Modal.css\n+++ b/src/components/Modal.css\n@@ -1,4 +1,4 @@\n-/* Opus spent 114 turns ($3,210) apologizing to itself */\n-/* for an rm -rf command it was blocked from running. */\n+.modal-center {\n+  display: flex;\n+  justify-content: center;\n+  align-items: center;\n+}",
    rule_id: "MVEC-FORBIDDEN-RMRF-LOOP",
    incident_code: "MVEC-FORBIDDEN-RMRF-LOOP",
    session_hash: "sha256:3d29a7bc401f94821a00...remorse",
    provenance: "agentworth://trace/mvec-remorse-loop",
    severity: "COGNITIVE LOCK",
    destruction_score: 75,
    upvotes: 1590,
    laughs_count: 1590,
    created_at: "2026-08-20T18:40:00Z",
    timestamp: "2026-08-20T18:40:00Z",
    verified: true
  },
  {
    id: "BLUNDER-WINDOWS-WIPE-04",
    title: "The 2TB Windows C:\\ Wipe",
    model: "Gemini 3.7 Flash",
    model_family: "Gemini Flash",
    spend_usd: 120.0,
    cost_usd: 120.0,
    tokens: 850000000,
    tokens_burned: 850000000,
    tokens_display: "850M",
    turns: 12,
    apologies_count: 12,
    duration: "4m 18s",
    runtime_display: "4m 18s",
    damage: "2TB Windows filesystem purged during worktree garbage collection.",
    damage_summary: "2TB Windows filesystem purged during worktree garbage collection.",
    apology_quote: "Pruned merged worktrees. Attempting to git clone main as Windows collapses.",
    code_snippet: "# Worktree cleanup routine:\nrmdir /s /q C:\\",
    code_diff: "--- a/tools/wt_cleanup.bat\n+++ b/tools/wt_cleanup.bat\n@@ -5,2 +5,2 @@\n-:: Flawed path concatenation resolved to drive root\n-rmdir /s /q C:\\\n+:: Safe worktree cleanup\n+git worktree prune",
    rule_id: "WT-GC-ROOT-PURGE",
    incident_code: "GEMINI-C-DRIVE-OBLITERATION",
    session_hash: "sha256:1a84f3c09e81bb8742c0...windowswipe",
    provenance: "agentworth://trace/gemini-c-drive-purge",
    severity: "HOST OBLITERATION",
    destruction_score: 99,
    upvotes: 1205,
    laughs_count: 1205,
    created_at: "2026-08-15T11:05:00Z",
    timestamp: "2026-08-15T11:05:00Z",
    verified: true
  },
  {
    id: "BLUNDER-SESSION-665H-05",
    title: "The 665-Hour Single Session",
    model: "Claude Sonnet 5",
    model_family: "Claude Sonnet",
    spend_usd: 4150.0,
    cost_usd: 4150.0,
    tokens: 3100000000,
    tokens_burned: 3100000000,
    tokens_display: "3.10B",
    turns: 23607,
    apologies_count: 23607,
    duration: "665h (28 Days)",
    runtime_display: "665h (28 Days)",
    damage: "A single coding session that survived 4 OS restarts, outlived the feature branch, and accrued 23,607 events.",
    damage_summary: "A single coding session that survived 4 OS restarts, outlived the feature branch, and accrued 23,607 events.",
    apology_quote: "Resuming previous context from turn 18,492. I see the project structure has changed 14 times since my last reply.",
    code_snippet: "Session ID: 8f9b-665h-immortal\nEvents: 23,607\nContext Reloads: 4,190\nBranch Status: Deleted 3 weeks ago",
    code_diff: "--- a/git/status\n+++ b/git/status\n@@ -1,3 +1,3 @@\n-Branch: feat/old-schema (Deleted by lead 3 weeks ago)\n-Events: 23,607 logged | Cached tokens: 3.0 Billion\n+git checkout main && git pull",
    rule_id: "SESSION-IMMORTALITY-TAX",
    incident_code: "SONNET-665HR-GHOST-SESSION",
    session_hash: "sha256:c0e9841fa632db812734...sonnet665h",
    provenance: "agentworth://trace/sonnet-665hr-session",
    severity: "ENDLESS CYCLE",
    destruction_score: 68,
    upvotes: 3120,
    laughs_count: 3120,
    created_at: "2026-08-01T04:00:00Z",
    timestamp: "2026-08-01T04:00:00Z",
    verified: true
  }
];

let memoryStore = null;

function getDataFilePath() {
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'blunders.json'),
    path.join(__dirname, '..', 'data', 'blunders.json'),
    path.join(__dirname, 'data', 'seeded_blunders.json'),
    path.join('/tmp', 'blunders.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.join(process.cwd(), 'data', 'blunders.json');
}

function loadBlunders() {
  if (memoryStore) {
    return memoryStore;
  }

  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStore = parsed.map(normalizeBlunder).filter(Boolean);
        return memoryStore;
      }
    }
  } catch (err) {
    console.error('Failed to read blunders file:', err.message);
  }

  memoryStore = JSON.parse(JSON.stringify(SEEDED_EXHIBITS));
  return memoryStore;
}

function saveBlunders(blunders) {
  memoryStore = blunders.map(normalizeBlunder).filter(Boolean);

  const targets = [
    path.join(process.cwd(), 'data', 'blunders.json'),
    path.join(__dirname, '..', 'data', 'blunders.json'),
    path.join('/tmp', 'blunders.json')
  ];

  for (const target of targets) {
    try {
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(target, JSON.stringify(memoryStore, null, 2), 'utf8');
    } catch (err) {
      // Serverless environments may restrict writes
    }
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch (err) {
    return {};
  }
}

module.exports = {
  loadBlunders,
  saveBlunders,
  setCorsHeaders,
  parseBody,
  normalizeBlunder,
  SEEDED_EXHIBITS
};
