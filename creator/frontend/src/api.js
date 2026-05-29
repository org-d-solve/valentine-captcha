/**
 * API client for the Valentine Creator backend.
 *
 * In development, Vite proxies /api → http://localhost:8080.
 * In production, uses the d-solve.de nginx reverse proxy.
 *
 * VITE_API_URL env var (set during build):
 *   Development: http://localhost:8080 (or /api/v1 via Vite proxy)
 *   Production: https://d-solve.de/api/v1 (via nginx reverse proxy)
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Upload images + config, get back a short URL.
 *
 * @param {Object} params
 * @param {File[]} params.images - exactly 9 image files
 * @param {string} params.to
 * @param {string} params.from
 * @param {string} params.message
 * @param {string} params.prompt
 * @param {string} params.correctCells - "all" | "any" | "0,1,2"
 * @param {number} params.ttlDays
 * @returns {Promise<{shortUrl, fullUrl, expiresAt, ...}>}
 */
export async function createValentine({
  images,
  to,
  from,
  message,
  prompt,
  correctCells,
  ttlDays,
}) {
  const formData = new FormData();

  images.forEach((file, i) => {
    formData.append(`images[${i}]`, file);
  });

  formData.append('to', to);
  formData.append('from', from);
  formData.append('message', message || '');
  formData.append('prompt', prompt || 'a heart');
  formData.append('correctCells', correctCells || 'all');
  formData.append('ttl', String(ttlDays || 7));

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(data.details)
      ? data.details.join('; ')
      : data.message || data.error || `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}
