import React from 'react';

/**
 * Form for names, message, prompt, captcha answer mode, and TTL.
 */
export default function ConfigForm({ config, setConfig }) {
  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="config-form">
      <label className="field">
        <span className="field-label">To (recipient)</span>
        <input
          type="text"
          maxLength={100}
          placeholder="Sarah"
          value={config.to}
          onChange={(e) => update('to', e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">From (you)</span>
        <input
          type="text"
          maxLength={100}
          placeholder="Alex"
          value={config.from}
          onChange={(e) => update('from', e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">
          Reveal message <span className="field-optional">optional</span>
        </span>
        <textarea
          maxLength={500}
          rows={3}
          placeholder="The captcha agrees. There is no appeal."
          value={config.message}
          onChange={(e) => update('message', e.target.value)}
        />
        <span className="field-counter">{config.message.length}/500</span>
      </label>

      <label className="field">
        <span className="field-label">Captcha prompt (“Select all squares with…”)</span>
        <input
          type="text"
          maxLength={100}
          placeholder="a heart"
          value={config.prompt}
          onChange={(e) => update('prompt', e.target.value)}
        />
      </label>

      <fieldset className="field">
        <span className="field-label">Which squares are “correct”?</span>
        <div className="radio-row">
          {[
            { value: 'all', label: 'All 9 (the joke)' },
            { value: 'any', label: 'Any selection' },
            { value: 'specific', label: 'Specific squares' },
          ].map((opt) => (
            <label key={opt.value} className="radio-pill">
              <input
                type="radio"
                name="correctMode"
                value={opt.value}
                checked={config.correctMode === opt.value}
                onChange={() => update('correctMode', opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {config.correctMode === 'specific' && (
          <p className="field-help">
            Now click “mark correct” on the squares in the upload grid that must
            be selected to pass.
          </p>
        )}
      </fieldset>

      <label className="field">
        <span className="field-label">
          Link lifetime: <strong>{config.ttlDays} days</strong>
        </span>
        <input
          type="range"
          min={1}
          max={30}
          value={config.ttlDays}
          onChange={(e) => update('ttlDays', parseInt(e.target.value, 10))}
        />
        <span className="field-help">
          After this, the link and all uploaded photos are permanently deleted.
        </span>
      </label>
    </div>
  );
}
