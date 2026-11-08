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

  function goTo(i: number, e: React.MouseEvent) {
    e.stopPropagation();
    setImgIndex(i);
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation();
  }

  const price = `$${item.price.toFixed(2)}/${item.priceUnit.replace('per ', '')}`;

  return (
    <div
      className="product-card"
      onClick={() => { window.location.href = `/product/${item.id}`; }}
    >
      {/* Badge — absolute over the 68 px top-padding zone */}
      <div className={`pc-badge ${item.listingType === 'auction' ? 'pc-badge--auction' : 'pc-badge--fixed'}`}>
        <span className="pc-badge-dot" />
        {item.listingType === 'auction' ? 'Auction' : 'Fixed Price'}
      </div>

      {/* Image carousel
          pc-image-container: position: relative for arrow/dot anchoring
          pc-image-clip: overflow: hidden + border-radius clips the photo
          Arrows are outside pc-image-clip so they are never clipped */}
      <div className="pc-image-container">
        <div className="pc-image-clip">
          <img
            className="pc-image"
            src={images[imgIndex]}
            alt={item.name}
            key={imgIndex}
          />
        </div>

        {total > 1 && (
          <>
            <button className="pc-arrow pc-arrow--prev" onClick={prev} aria-label="Previous image">&#8592;</button>
            <button className="pc-arrow pc-arrow--next" onClick={next} aria-label="Next image">&#8594;</button>
            <div className="pc-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`pc-dot${i === imgIndex ? ' pc-dot--active' : ''}`}
                  onClick={(e) => goTo(i, e)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Text details */}
      <div className="pc-body">
        <div className="pc-name">{item.name}</div>
        <div className="pc-seller">{item.seller}</div>
        <div className="pc-location">{item.location}</div>

        <div className="pc-meta">
          <span><span className="pc-meta-label">Vol :</span> {item.qty}</span>
          <span><span className="pc-meta-label">Pkg :</span> {item.packaging}</span>
        </div>

        <hr className="pc-divider" />
        <div className="pc-price">{price}</div>
      </div>

      {/* Action buttons — stopPropagation prevents the card click from firing */}
      <div className="pc-actions" onClick={stopProp}>
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
