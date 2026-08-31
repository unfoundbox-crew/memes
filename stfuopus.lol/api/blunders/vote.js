const { loadBlunders, saveBlunders, setCorsHeaders, parseBody } = require('../_storage');

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST or PUT to upvote a blunder.'
    });
  }

  try {
    const body = parseBody(req);
    const id = (body.id || body.blunder_id || req.query.id || req.query.blunder_id || '').trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required blunder id parameter.'
      });
    }

    const blunders = loadBlunders();
    const blunder = blunders.find(b => b.id.toLowerCase() === id.toLowerCase());

    if (!blunder) {
      return res.status(404).json({
        success: false,
        error: `Blunder with id '${id}' not found.`
      });
    }

    blunder.upvotes = (blunder.upvotes || 0) + 1;
    saveBlunders(blunders);

    return res.status(200).json({
      success: true,
      id: blunder.id,
      upvotes: blunder.upvotes
    });
  } catch (err) {
    console.error('Error upvoting blunder:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error processing upvote.',
      details: err.message
    });
  }
};
