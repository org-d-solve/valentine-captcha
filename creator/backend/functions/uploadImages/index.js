/**
 * Cloud Function: uploadImages
 *
 * Handles image uploads and configuration storage
 * - Validates images and metadata
 * - Uploads to Cloud Storage
 * - Stores config in Firestore
 * - Returns short URL
 */

const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const sharp = require('sharp');

// Initialize GCP clients
const storage = new Storage();
const firestore = new Firestore();

// Configuration from environment
const GCS_BUCKET = process.env.GCS_BUCKET || 'valentines-creator-prod';
const FIRESTORE_DB = process.env.FIRESTORE_DB || 'valentines-prod';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760; // 10MB
const MAX_TOTAL_SIZE = parseInt(process.env.UPLOAD_MAX_TOTAL) || 94371840; // 90MB
const DEFAULT_TTL_DAYS = parseInt(process.env.UPLOAD_TTL_DAYS) || 7;
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR) || 10;

// Allowed image formats
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Rate limiting: simple IP-based check
 */
async function checkRateLimit(ip) {
  const key = `ratelimit:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const bucket = firestore.collection('_ratelimit');

  try {
    const doc = await bucket.doc(key).get();
    const count = doc.exists ? doc.data().count : 0;

    if (count >= RATE_LIMIT_PER_HOUR) {
      return false; // Rate limited
    }

    await bucket.doc(key).set({
      count: count + 1,
      ttl: Date.now() + 3600000
    });
    return true;
  } catch (error) {
    console.warn('Rate limit check failed:', error);
    return true; // Fail open
  }
}

/**
 * Generate random short ID (16 chars, base62)
 */
function generateShortId() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Validate image file
 */
function validateImage(mimetype, buffer) {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new Error(`Invalid file type: ${mimetype}. Allowed: JPEG, PNG, WebP`);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Max: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`);
  }

  return true;
}

/**
 * Compress image using Sharp
 */
async function compressImage(buffer) {
  try {
    return await sharp(buffer)
      .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return buffer; // Fall back to original if compression fails
  }
}

/**
 * Validate configuration metadata
 */
function validateConfig(config) {
  const errors = [];

  if (!config.to || config.to.length === 0) errors.push('Recipient name (to) is required');
  if (config.to && config.to.length > 100) errors.push('Recipient name too long (max 100 chars)');

  if (!config.from || config.from.length === 0) errors.push('Sender name (from) is required');
  if (config.from && config.from.length > 100) errors.push('Sender name too long (max 100 chars)');

  if (config.message && config.message.length > 500) errors.push('Message too long (max 500 chars)');

  if (config.prompt && config.prompt.length > 100) errors.push('Prompt too long (max 100 chars)');

  if (config.correctCells) {
    if (config.correctCells !== 'all' && config.correctCells !== 'any') {
      const cells = config.correctCells.split(',').map(c => parseInt(c.trim(), 10));
      if (cells.some(c => isNaN(c) || c < 0 || c > 8)) {
        errors.push('Invalid cells: must be "all", "any", or comma-separated indices 0-8');
      }
    }
  }

  return errors;
}

/**
 * Parse multipart form data
 */
async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const files = {};
    const fields = {};
    let fileCount = 0;
    let totalSize = 0;

    bb.on('file', (fieldname, file, info) => {
      const chunks = [];

      file.on('data', (chunk) => {
        chunks.push(chunk);
        totalSize += chunk.length;

        if (totalSize > MAX_TOTAL_SIZE) {
          file.destroy();
          reject(new Error(`Total upload size exceeds limit (${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)}MB)`));
        }
      });

      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        files[fieldname] = {
          buffer,
          mimetype: info.mimeType,
          filename: info.filename
        };
        fileCount++;
      });

      file.on('error', reject);
    });

    bb.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    bb.on('close', () => {
      resolve({ files, fields });
    });

    bb.on('error', reject);

    req.pipe(bb);
  });
}

/**
 * Main upload handler
 */
functions.http('uploadImages', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
    if (!await checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Max 10 uploads per hour.' });
    }

    // Parse form data
    const { files, fields } = await parseForm(req);

    // Validate images
    if (Object.keys(files).length < 9) {
      return res.status(400).json({ error: 'Must provide exactly 9 images' });
    }

    // Validate each image
    for (let i = 0; i < 9; i++) {
      const key = `images[${i}]`;
      if (!files[key]) {
        return res.status(400).json({ error: `Missing image ${i}` });
      }
      validateImage(files[key].mimetype, files[key].buffer);
    }

    // Validate configuration
    const configErrors = validateConfig(fields);
    if (configErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: configErrors });
    }

    // Generate IDs
    const configId = uuidv4();
    const shortId = generateShortId();

    // Upload images to GCS
    const bucket = storage.bucket(GCS_BUCKET);
    const imageUrls = [];

    for (let i = 0; i < 9; i++) {
      const file = files[`images[${i}]`];
      if (!file) continue;

      try {
        // Compress image
        let buffer = file.buffer;
        try {
          buffer = await compressImage(buffer);
        } catch (error) {
          console.warn(`Compression failed for image ${i}:`, error);
        }

        // Upload to GCS
        const filename = `uploads/${configId}/image-${i}.jpg`;
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
          metadata: {
            cacheControl: 'public, max-age=604800', // Cache for 7 days
            contentType: 'image/jpeg'
          },
          public: true
        });

        const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${filename}`;
        imageUrls.push(publicUrl);
      } catch (uploadError) {
        console.error(`Failed to upload image ${i}:`, uploadError);
        // Clean up previous uploads on error
        for (let j = 0; j < i; j++) {
          await bucket.file(`uploads/${configId}/image-${j}.jpg`).delete().catch(() => {});
        }
        throw new Error(`Failed to upload image ${i}`);
      }
    }

    // Calculate expiration
    const ttlDays = Math.min(parseInt(fields.ttl) || DEFAULT_TTL_DAYS, 30);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    // Store config in Firestore
    const configData = {
      configId,
      to: fields.to.trim(),
      from: fields.from.trim(),
      message: (fields.message || '').trim(),
      prompt: (fields.prompt || 'a heart').trim(),
      correctCells: fields.correctCells || 'all',
      imageUrls,
      createdAt: new Date(),
      expiresAt,
      ttlSeconds: ttlDays * 24 * 60 * 60,
      accessCount: 0,
      ipAddressHash: crypto.createHash('sha256').update(ip).digest('hex')
    };

    await firestore.collection('configs').doc(configId).set(configData);

    // Store URL mapping in Firestore
    await firestore.collection('urls').doc(shortId).set({
      shortId,
      configId,
      createdAt: new Date(),
      expiresAt,
      accessCount: 0,
      lastAccessedAt: null
    });

    // Set TTL deletion (Firestore will auto-delete after TTL)
    // Note: Requires TTL delete policy in Firestore

    // Build URLs
    const shortUrl = `https://d-solve.de/v/${shortId}`;
    const params = new URLSearchParams({
      to: configData.to,
      from: configData.from,
      msg: configData.message,
      prompt: configData.prompt,
      cells: configData.correctCells,
      ...imageUrls.reduce((acc, url, i) => ({ ...acc, [`img${i}`]: url }), {})
    });

    const fullUrl = `https://d-solve.de/?${params.toString()}`;

    return res.status(200).json({
      success: true,
      configId,
      shortId,
      shortUrl,
      fullUrl,
      expiresAt: expiresAt.toISOString(),
      ttlDays
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error.message.includes('File too large') ||
        error.message.includes('exceeds limit') ||
        error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

module.exports = { uploadImages };
