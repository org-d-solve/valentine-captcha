/**
 * Cloud Function: resolveUrl
 *
 * Resolves short URLs to full Valentine page URLs
 * - Looks up shortId in Firestore
 * - Redirects to Valentine page with config parameters
 * - Tracks access count
 */

const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

functions.http('resolveUrl', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(204).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract shortId from URL path
    const shortId = req.path.split('/').pop();

    if (!shortId || shortId.length !== 16) {
      return res.status(400).json({ error: 'Invalid short URL' });
    }

    // Look up in Firestore
    const urlDoc = await firestore.collection('urls').doc(shortId).get();

    if (!urlDoc.exists) {
      return res.status(404).json({ error: 'URL not found or expired' });
    }

    const urlData = urlDoc.data();

    // Check if expired
    if (new Date() > urlData.expiresAt.toDate()) {
      return res.status(410).json({ error: 'URL has expired' });
    }

    // Get config
    const configDoc = await firestore.collection('configs').doc(urlData.configId).get();

    if (!configDoc.exists) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const config = configDoc.data();

    // Update access count
    await urlDoc.ref.update({
      accessCount: urlData.accessCount + 1,
      lastAccessedAt: new Date()
    });

    // Build redirect URL
    const params = new URLSearchParams({
      to: config.to,
      from: config.from,
      msg: config.message,
      prompt: config.prompt,
      cells: config.correctCells,
      configId: config.configId
    });

    // Add image URLs
    config.imageUrls.forEach((url, i) => {
      params.append(`img${i}`, url);
    });

    const redirectUrl = `https://d-solve.de/?${params.toString()}`;

    // 302 temporary redirect (can be shared multiple times)
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Resolve error:', error);
    return res.status(500).json({
      error: 'Redirect failed',
      message: error.message
    });
  }
});

module.exports = { resolveUrl };
