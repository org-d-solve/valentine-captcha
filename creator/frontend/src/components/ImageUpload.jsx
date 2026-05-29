import React, { useRef, useState } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 3x3 grid of upload cells. Each cell accepts one image.
 * When correctMode === "specific", clicking the badge toggles whether the
 * cell is part of the "correct" captcha answer.
 */
export default function ImageUpload({
  images,
  setImageAt,
  correctMode,
  correctCells,
  toggleCorrectCell,
}) {
  return (
    <div className="upload-grid">
      {images.map((img, i) => (
        <UploadCell
          key={i}
          index={i}
          img={img}
          setImageAt={setImageAt}
          isCorrect={correctCells.has(i)}
          showCorrectToggle={correctMode === 'specific'}
          onToggleCorrect={() => toggleCorrectCell(i)}
        />
      ))}
    </div>
  );
}

function UploadCell({
  index,
  img,
  setImageAt,
  isCorrect,
  showCorrectToggle,
  onToggleCorrect,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = (file) => {
    setLocalError('');
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setLocalError('JPEG/PNG/WebP only');
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError('Max 10MB');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setImageAt(index, { file, previewUrl });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = (e) => {
    e.stopPropagation();
    setImageAt(index, null);
  };

  return (
    <div
      className={
        'upload-cell' +
        (dragOver ? ' drag-over' : '') +
        (img ? ' filled' : '') +
        (isCorrect ? ' correct' : '')
      }
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {img ? (
        <>
          <img src={img.previewUrl} alt={`cell ${index}`} className="cell-img" />
          <button className="cell-clear" onClick={clear} title="Remove">
            ✕
          </button>
          {showCorrectToggle && (
            <button
              className={'cell-correct-badge' + (isCorrect ? ' on' : '')}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCorrect();
              }}
              title="Mark this square as a correct answer"
            >
              {isCorrect ? '✓ correct' : 'mark correct'}
            </button>
          )}
        </>
      ) : (
        <div className="cell-empty">
          <span className="cell-plus">+</span>
          <span className="cell-index">{index + 1}</span>
        </div>
      )}

      {localError && <div className="cell-error">{localError}</div>}
    </div>
  );
}
