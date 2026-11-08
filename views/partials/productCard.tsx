import { useState } from 'react';
import type { Listing } from '../types';

export function ProductCard({ item }: { item: Listing }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);

  const images = item.images.length > 0 ? item.images : ['/images/IMG_9097.jpeg'];
  const total = images.length;

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + total) % total);
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % total);
  }

  const priceFormatted = `$${item.price.toFixed(2)}/${item.priceUnit.replace('per ', '')}`;

  return (
    <div className="product-card">
      {/* Auction / Fixed badge — absolute over top padding area */}
      <div className={`pc-badge ${item.listingType === 'auction' ? 'pc-badge--auction' : 'pc-badge--fixed'}`}>
        <span className="pc-badge-dot" />
        {item.listingType === 'auction' ? 'Auction' : 'Fixed Price'}
      </div>

      {/* Image carousel */}
      <div className="pc-image-wrap">
        <img
          className="pc-image"
          src={images[imgIndex]}
          alt={item.name}
          key={imgIndex}
        />

        {total > 1 && (
          <>
            <button className="pc-arrow pc-arrow--prev" onClick={prev} aria-label="Previous image">&#8592;</button>
            <button className="pc-arrow pc-arrow--next" onClick={next} aria-label="Next image">&#8594;</button>
            <div className="pc-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`pc-dot${i === imgIndex ? ' pc-dot--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card body */}
      <div className="pc-body">
        {/* Name & seller */}
        <div className="pc-name">{item.name}</div>
        <div className="pc-seller">{item.seller}</div>
        <div className="pc-location">{item.location}</div>

        {/* Meta row */}
        <div className="pc-meta">
          <span><span className="pc-meta-label">Vol :</span> {item.qty}</span>
          <span><span className="pc-meta-label">Pkg :</span> {item.packaging}</span>
        </div>

        <hr className="pc-divider" />

        {/* Price */}
        <div className="pc-price">{priceFormatted}</div>
      </div>

      {/* Action buttons */}
      <div className="pc-actions">
        <button className="pc-btn-primary">Bid Now</button>
        <button
          className={`pc-btn-secondary${inWatchlist ? ' pc-btn-secondary--active' : ''}`}
          onClick={() => setInWatchlist((w) => !w)}
        >
          {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
        </button>
      </div>
    </div>
  );
}
