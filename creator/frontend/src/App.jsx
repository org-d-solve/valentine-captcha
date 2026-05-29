import React, { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload.jsx';
import ConfigForm from './components/ConfigForm.jsx';
import Preview from './components/Preview.jsx';
import ResultModal from './components/ResultModal.jsx';
import { createValentine } from './api.js';

const EMPTY_IMAGES = Array(9).fill(null);

export default function App() {
  // images: array of 9 { file, previewUrl } | null
  const [images, setImages] = useState(EMPTY_IMAGES);

  const [config, setConfig] = useState({
    to: '',
    from: '',
    message: '',
    prompt: 'a heart',
    correctMode: 'all', // "all" | "any" | "specific"
    correctCells: new Set(), // used when correctMode === "specific"
    ttlDays: 7,
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const filledCount = images.filter(Boolean).length;

  const setImageAt = useCallback((index, payload) => {
    setImages((prev) => {
      const next = [...prev];
      // Revoke old object URL to avoid memory leaks
      if (next[index]?.previewUrl) {
        URL.revokeObjectURL(next[index].previewUrl);
      }
      next[index] = payload;
      return next;
    });
  }, []);

  const toggleCorrectCell = useCallback((index) => {
    setConfig((prev) => {
      const next = new Set(prev.correctCells);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return { ...prev, correctCells: next };
    });
  }, []);

  const validate = () => {
    if (filledCount !== 9) {
      return 'Please upload all 9 images.';
    }
    if (!config.to.trim()) return 'Please enter the recipient name.';
    if (!config.from.trim()) return 'Please enter your name.';
    if (config.correctMode === 'specific' && config.correctCells.size === 0) {
      return 'Pick at least one correct square (or switch to "all"/"any").';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setError('');
    setStatus('submitting');

    // Resolve correctCells into the backend format
    let correctCells = 'all';
    if (config.correctMode === 'any') correctCells = 'any';
    else if (config.correctMode === 'specific') {
      correctCells = [...config.correctCells].sort((a, b) => a - b).join(',');
    }

    try {
      const data = await createValentine({
        images: images.map((i) => i.file),
        to: config.to.trim(),
        from: config.from.trim(),
        message: config.message.trim(),
        prompt: config.prompt.trim() || 'a heart',
        correctCells,
        ttlDays: config.ttlDays,
      });
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="meta-row">
          <span><span className="dot" />VALENTINE CREATOR</span>
          <span>d-solve.de</span>
        </div>
        <h1 className="app-title">
          Make a Valentine <em>they can't decline.</em>
        </h1>
        <p className="app-subtitle">
          Upload your photos, write your message, and get a single short link
          to send. No account, no fuss. The link self-destructs after a week.
        </p>
      </header>

      <main className="app-grid">
        <section className="panel">
          <h2 className="panel-title">1 · Upload 9 photos</h2>
          <p className="panel-hint">
            They'll become the captcha grid. Drag &amp; drop or click each cell.
            <strong> {filledCount}/9</strong> added.
          </p>
          <ImageUpload
            images={images}
            setImageAt={setImageAt}
            correctMode={config.correctMode}
            correctCells={config.correctCells}
            toggleCorrectCell={toggleCorrectCell}
          />
        </section>

        <section className="panel">
          <h2 className="panel-title">2 · Personalize</h2>
          <ConfigForm config={config} setConfig={setConfig} />
        </section>

        <section className="panel panel-wide">
          <h2 className="panel-title">3 · Preview &amp; create</h2>
          <Preview images={images} config={config} />

          {error && status === 'error' && (
            <div className="error-banner">⚠ {error}</div>
          )}

          <button
            className="create-btn"
            onClick={handleSubmit}
            disabled={status === 'submitting'}
          >
            {status === 'submitting'
              ? 'Uploading & creating…'
              : 'Create my Valentine link'}
          </button>
        </section>
      </main>

      <footer className="app-footer">
        powered by{' '}
        <a href="https://d-solve.de" target="_blank" rel="noopener noreferrer">
          d-solve.de
        </a>
      </footer>

      {status === 'done' && result && (
        <ResultModal result={result} onClose={() => setStatus('idle')} />
      )}
    </div>
  );
}
