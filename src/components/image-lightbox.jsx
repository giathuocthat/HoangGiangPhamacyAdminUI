import React, { useEffect } from 'react';

const ImageLightbox = ({ open, images = [], index = 0, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  const src = images && images.length ? images[index] : '';

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>&times;</button>
        <div className="lightbox-body">
          <button className="lightbox-prev" onClick={onPrev} aria-label="Previous">&#10094;</button>
          <div className="lightbox-image-wrap">
            {src ? <img src={src} alt={`image-${index+1}`} /> : <div className="lightbox-empty">No image</div>}
          </div>
          <button className="lightbox-next" onClick={onNext} aria-label="Next">&#10095;</button>
        </div>
        <div className="lightbox-footer">{index + 1} / {images.length}</div>
      </div>
      <style>{`
        .lightbox-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1100}
        .lightbox-content{position:relative;max-width:90%;max-height:90%;width:900px;background:transparent}
        .lightbox-body{display:flex;align-items:center;justify-content:space-between}
        .lightbox-image-wrap{flex:1;display:flex;align-items:center;justify-content:center}
        .lightbox-image-wrap img{max-width:100%;max-height:80vh;border-radius:4px}
        .lightbox-prev,.lightbox-next{background:transparent;border:none;color:#fff;font-size:2.4rem;cursor:pointer;padding:0 12px}
        .lightbox-close{position:absolute;right:-8px;top:-28px;background:transparent;border:none;color:#fff;font-size:2.4rem;cursor:pointer}
        .lightbox-footer{color:#fff;text-align:center;margin-top:8px}
      `}</style>
    </div>
  );
};

export default ImageLightbox;
