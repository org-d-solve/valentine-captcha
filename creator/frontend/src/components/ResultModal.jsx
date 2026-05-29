import React, { useState } from 'react';

/**
 * Success modal showing the generated short URL with copy-to-clipboard.
 */
export default function ResultModal({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      setCopied(false);
    }
  };

  const expiry = result.expiresAt
    ? new Date(result.expiresAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-seal">💌</div>
        <h2 className="modal-title">Your Valentine is ready!</h2>
        <p className="modal-sub">
          Share this link. When they open it, they'll have to “verify” they're
          your valentine.
        </p>

        <div className="url-box">
          <input type="text" readOnly value={result.shortUrl} onFocus={(e) => e.target.select()} />
          <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
        </div>

        {expiry && (
          <p className="modal-expiry">
            This link works until <strong>{expiry}</strong>, then it (and the
            photos) are deleted.
          </p>
        )}

        <div className="modal-actions">
          <a
            className="modal-test"
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Test the link →
          </a>
          <button className="modal-done" onClick={onClose}>
            Make another
          </button>
        </div>
      </div>
    </div>
  );
}
