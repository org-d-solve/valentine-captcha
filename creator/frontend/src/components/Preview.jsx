import React from 'react';

/**
 * Live preview of how the Valentine captcha grid and reveal will look.
 */
export default function Preview({ images, config }) {
  const toName = config.to.trim() || 'You';
  const fromName = config.from.trim() || 'Your Secret Admirer';

  return (
    <div className="preview">
      <div className="preview-card">
        <div className="preview-eyebrow">02 / IMAGE CHALLENGE</div>
        <div className="preview-challenge-head">
          Select all squares with <strong>{config.prompt || 'a heart'}</strong>
        </div>
        <div className="preview-grid">
          {images.map((img, i) => {
            const isCorrect =
              config.correctMode === 'all' ||
              (config.correctMode === 'specific' && config.correctCells.has(i));
            return (
              <div
                key={i}
                className={'preview-cell' + (isCorrect ? ' marked' : '')}
              >
                {img ? (
                  <img src={img.previewUrl} alt="" />
                ) : (
                  <div className="preview-cell-empty">{i + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="preview-card preview-reveal">
        <div className="preview-eyebrow">04 / VERIFIED</div>
        <div className="preview-reveal-title">
          <span className="preview-name">{toName}</span>, you are my valentine.
        </div>
        <div className="preview-reveal-sub">
          {config.message.trim() ||
            'The system has spoken. The captcha agrees. There is no appeals process.'}
        </div>
        <div className="preview-signature">— {fromName}</div>
      </div>
    </div>
  );
}
