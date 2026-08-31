const { loadBlunders, setCorsHeaders } = require('../_storage');

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use GET to retrieve blunders.'
    });
  }

  try {
    let blunders = [...loadBlunders()];
    const { sort, model, q, limit, offset } = req.query || {};

    // Filter by model if requested
    if (model && typeof model === 'string' && model.trim() !== '') {
      const modelLower = model.toLowerCase().trim();
      blunders = blunders.filter(b => 
        (b.model || '').toLowerCase().includes(modelLower)
      );
    }

    // Filter by search query if requested
    if (q && typeof q === 'string' && q.trim() !== '') {
      const qLower = q.toLowerCase().trim();
      blunders = blunders.filter(b => 
        (b.title || '').toLowerCase().includes(qLower) ||
        (b.damage || '').toLowerCase().includes(qLower) ||
        (b.apology_quote || '').toLowerCase().includes(qLower) ||
        (b.rule_id || '').toLowerCase().includes(qLower)
      );
    }

    // Sort
    const sortBy = (sort || 'spend_usd').toLowerCase();
    blunders.sort((a, b) => {
      if (sortBy === 'upvotes' || sortBy === 'votes') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === 'created_at' || sortBy === 'date' || sortBy === 'recent') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'tokens') {
        return (b.tokens || 0) - (a.tokens || 0);
      }
      if (sortBy === 'turns') {
        return (b.turns || 0) - (a.turns || 0);
      }
      // Default: spend_usd descending
      return (b.spend_usd || 0) - (a.spend_usd || 0);
    });

    const totalCount = blunders.length;
    const totalBurnedUSD = blunders.reduce((sum, b) => sum + (Number(b.spend_usd) || 0), 0);
    const totalTokens = blunders.reduce((sum, b) => sum + (Number(b.tokens) || 0), 0);

    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const paginated = blunders.slice(parsedOffset, parsedOffset + parsedLimit);

    return res.status(200).json({
      success: true,
      total_count: totalCount,
      total_burned_usd: Number(totalBurnedUSD.toFixed(2)),
      total_tokens: totalTokens,
      offset: parsedOffset,
      limit: parsedLimit,
      blunders: paginated
    });
  } catch (err) {
    console.error('Error fetching blunders:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error fetching blunders.',
      details: err.message
    });
  }
};
