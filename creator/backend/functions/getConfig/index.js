/**
 * Cloud Function: getConfig
 *
 * Returns Valentine configuration as JSON
 * - Used by Valentine page to load custom data
 * - Validates configId exists and not expired
 */

const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

functions.http('getConfig', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const configId = req.query.id || req.path.split('/').pop();

    if (!configId) {
      return res.status(400).json({ error: 'Missing configId parameter' });
    }

    // Look up config in Firestore
    const doc = await firestore.collection('configs').doc(configId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const config = doc.data();

    // Check if expired
    if (new Date() > config.expiresAt.toDate()) {
      return res.status(410).json({ error: 'Configuration has expired' });
    }

    // Return config (exclude sensitive fields)
    return res.status(200).json({
      configId: config.configId,
      to: config.to,
      from: config.from,
      message: config.message,
      prompt: config.prompt,
      correctCells: config.correctCells,
      imageUrls: config.imageUrls,
      createdAt: config.createdAt.toISOString(),
      expiresAt: config.expiresAt.toISOString(),
      accessCount: config.accessCount
    });

  } catch (error) {
    console.error('Get config error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve configuration',
      message: error.message
    });
  }
});

module.exports = { getConfig };
