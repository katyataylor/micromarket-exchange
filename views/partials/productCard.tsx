import { useEffect, useState } from 'react';
import type { Listing } from '../types';

type WatchlistEntry = { listingId: number; qty: number; sold: boolean };
type CartEntry = { listingId: number; qty: number };

function safeParseJSON<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

function getWatchlist(): WatchlistEntry[] {
  return safeParseJSON<WatchlistEntry[]>(localStorage.getItem('mme_watchlist'), []);
}
function getCart(): CartEntry[] {
  return safeParseJSON<CartEntry[]>(localStorage.getItem('mme_cart'), []);
}

export function ProductCard({ item }: { item: Listing }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inCart, setInCart] = useState(false);

  const images = item.images.length > 0 ? item.images : ['/images/IMG_9097.jpeg'];
  const total = images.length;

  // Sync with localStorage after hydration (avoids SSR mismatch)
  useEffect(() => {
    setInWatchlist(getWatchlist().some((w) => w.listingId === item.id));
    setInCart(getCart().some((c) => c.listingId === item.id));
  }, [item.id]);

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

  function toggleWatchlist(e: React.MouseEvent) {
    e.stopPropagation();
    const wl = getWatchlist();
    if (inWatchlist) {
      localStorage.setItem(
        'mme_watchlist',
        JSON.stringify(wl.filter((w) => w.listingId !== item.id)),
      );
      setInWatchlist(false);
    } else {
      localStorage.setItem(
        'mme_watchlist',
        JSON.stringify([...wl, { listingId: item.id, qty: 1, sold: false }]),
      );
      setInWatchlist(true);
    }
  }

  function addToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (inCart) {
      // Navigate to cart if already added
      window.location.href = '/cart';
      return;
    }
    const cart = getCart();
    localStorage.setItem(
      'mme_cart',
      JSON.stringify([...cart, { listingId: item.id, qty: 1 }]),
    );
    setInCart(true);
  }

  const price = `$${item.price.toFixed(2)}/${item.priceUnit.replace('per ', '')}`;
  const bidLabel = item.listingType === 'auction' ? 'Bid Now' : 'Add to Cart';

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

      {/* Image carousel */}
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
        <button
          className={`pc-btn-primary${inCart ? ' pc-btn-primary--active' : ''}`}
          onClick={addToCart}
        >
          {inCart ? 'In Cart ✓' : bidLabel}
        </button>
        <button
          className={`pc-btn-secondary${inWatchlist ? ' pc-btn-secondary--active' : ''}`}
          onClick={toggleWatchlist}
        >
          {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
        </button>
      </div>
    </div>
  );
}
