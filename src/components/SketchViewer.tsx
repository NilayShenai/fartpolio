import { useState } from 'react';

interface SketchViewerProps {
  src: string;
  title: string;
}

export function SketchViewer({ src, title }: SketchViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toggleOpen = () => {
    if (!hasError) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <div className="sketch-container" onClick={toggleOpen}>
        {hasError ? (
          <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            [sketch file: {src.split('/').pop()} - not found]
          </div>
        ) : (
          <img 
            className="sketch-img" 
            src={src} 
            alt={title} 
            onError={() => setHasError(true)}
          />
        )}
      </div>

      {isOpen && !hasError && (
        <div className="sketch-modal-overlay" onClick={toggleOpen}>
          <div className="sketch-modal-content">
            <img className="sketch-modal-img" src={src} alt={title} />
            <div style={{ 
              textAlign: 'center', 
              marginTop: '12px', 
              fontSize: '12px', 
              color: 'var(--text-muted)' 
            }}>
              {title} (click anywhere to close)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
