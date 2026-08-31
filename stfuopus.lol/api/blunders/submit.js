const crypto = require('crypto');
const { loadBlunders, saveBlunders, setCorsHeaders, parseBody } = require('../_storage');

function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

function generateBlunderId(title, model) {
  const modelTag = (model || 'AGENT')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BLUNDER-${modelTag || 'DISPATCH'}-${rand}`;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST to submit a blunder.'
    });
  }

  try {
    const body = parseBody(req);
    const {
      title,
      model,
      spend_usd,
      tokens,
      turns,
      duration,
      damage,
      apology_quote,
      code_snippet,
      rule_id,
      session_hash
    } = body;

    const sanitizedTitle = sanitizeString(title, 120) || 'Catastrophic Agent Trajectory';
    const sanitizedModel = sanitizeString(model, 60) || 'Claude Opus 5 (Extended Thinking)';
    const parsedSpend = Math.max(0, parseFloat(spend_usd) || 0.0);
    const parsedTokens = Math.max(0, parseInt(tokens, 10) || 0);
    const parsedTurns = Math.max(1, parseInt(turns, 10) || 1);
    const sanitizedDuration = sanitizeString(duration, 30) || `${parsedTurns} turns`;
    const sanitizedDamage = sanitizeString(damage, 500) || 'Unconstrained autonomous reasoning loop.';
    const sanitizedQuote = sanitizeString(apology_quote, 500) || 'I apologize for the oversight.';
    const sanitizedSnippet = sanitizeString(code_snippet, 2000) || '';
    const sanitizedRule = sanitizeString(rule_id, 60) || 'UNGOVERNED-INFERENCE-TAX';
    const sanitizedSession = sanitizeString(session_hash, 80) || `sha256:${crypto.randomBytes(16).toString('hex')}`;

    const blunderId = generateBlunderId(sanitizedTitle, sanitizedModel);

    const newBlunder = {
      id: blunderId,
      title: sanitizedTitle,
      model: sanitizedModel,
      spend_usd: parsedSpend,
      tokens: parsedTokens,
      turns: parsedTurns,
      duration: sanitizedDuration,
      damage: sanitizedDamage,
      apology_quote: sanitizedQuote,
      code_snippet: sanitizedSnippet,
      rule_id: sanitizedRule,
      session_hash: sanitizedSession,
      upvotes: 1,
      created_at: new Date().toISOString(),
      verified: false
    };

    const blunders = loadBlunders();
    blunders.unshift(newBlunder);
    saveBlunders(blunders);

    return res.status(201).json({
      success: true,
      id: blunderId,
      url: `https://stfuopus.lol/blunders#${blunderId}`,
      blunder: newBlunder
    });
  } catch (err) {
    console.error('Blunder submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error processing blunder submission.',
      details: err.message
    });
  }
};
