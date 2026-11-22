import { useEffect, useState } from 'react';
import { buildLoginUrl, useAuth } from '../auth';
import type { Listing } from '../types';

type WatchlistEntry = { listingId: number; qty: number; sold: boolean };
type CartEntry = { listingId: number; qty: number; sold?: boolean };
type StoredBidMap = Record<
  string,
  { bidPerUnit: number; lotTotal: number; bidCount: number; placedAt: string }
>;

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
function getBids(): StoredBidMap {
  return safeParseJSON<StoredBidMap>(localStorage.getItem('mme_bids'), {});
}

export function ProductCard({ item }: { item: Listing }) {
  const { isAuthenticated } = useAuth();
  const [imgIndex, setImgIndex] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [activePrice, setActivePrice] = useState(item.price);

  const images = item.images.length > 0 ? item.images : ['/images/IMG_9097.jpeg'];
  const total = images.length;

  useEffect(() => {
    setActivePrice(item.price);
  }, [item.price]);

  // Sync with localStorage after hydration when authenticated (avoids SSR mismatch & guest leaks)
  useEffect(() => {
    const syncStorage = () => {
      if (!isAuthenticated) {
        setInWatchlist(false);
        setInCart(false);
        setHasBid(false);
        setActivePrice(item.price);
        return;
      }
      setInWatchlist(getWatchlist().some((w) => w.listingId === item.id));
      setInCart(getCart().some((c) => c.listingId === item.id && !c.sold));
      const recordedBid = getBids()[String(item.id)];
      if (recordedBid && item.listingType === 'auction') {
        setHasBid(true);
        setActivePrice(recordedBid.bidPerUnit);
      } else {
        setHasBid(false);
        setActivePrice(item.price);
      }
    };
    syncStorage();
    window.addEventListener('mme:storage-sync', syncStorage);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('mme:storage-sync', syncStorage);
      window.removeEventListener('storage', syncStorage);
    };
  }, [isAuthenticated, item.id, item.listingType, item.price]);

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
    if (!isAuthenticated) {
      window.location.href = buildLoginUrl(`/product/${item.id}`);
      return;
    }
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
    window.dispatchEvent(new Event('mme:storage-sync'));
  }

  function handlePrimaryAction(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      const target =
        item.listingType === 'auction' ? `/product/${item.id}#input-bid` : `/product/${item.id}`;
      window.location.href = buildLoginUrl(target);
      return;
    }
    if (item.listingType === 'auction') {
      window.location.href = `/product/${item.id}#input-bid`;
      return;
    }
    if (inCart) {
      window.location.href = '/cart#cart';
      return;
    }
    const cart = getCart().filter((c) => c.listingId !== item.id);
    localStorage.setItem(
      'mme_cart',
      JSON.stringify([...cart, { listingId: item.id, qty: 1 }]),
    );
    setInCart(true);
    window.dispatchEvent(new Event('mme:storage-sync'));
  }

  const price = `$${activePrice.toFixed(2)}/${item.priceUnit.replace('per ', '')}`;
  const primaryLabel =
    item.listingType === 'auction'
      ? hasBid
        ? 'Bid Placed ✓'
        : 'Bid Now'
      : inCart
        ? 'In Cart ✓'
        : 'Add to Cart';
  const primaryActive = item.listingType === 'auction' ? hasBid : inCart;

  return (
    <div
      className="product-card"
      onClick={() => {
        window.location.href = isAuthenticated
          ? `/product/${item.id}`
          : buildLoginUrl(`/product/${item.id}`);
      }}
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
            loading="lazy"
            decoding="async"
          />
        </div>

        {total > 1 && (
          <>
            <button type="button" className="pc-arrow pc-arrow--prev" onClick={prev} aria-label="Previous image">&#8592;</button>
            <button type="button" className="pc-arrow pc-arrow--next" onClick={next} aria-label="Next image">&#8594;</button>
            <div className="pc-dots">
              {images.map((_, i) => (
                <button
                  type="button"
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
          type="button"
          className={`pc-btn-primary${primaryActive ? ' pc-btn-primary--active' : ''}`}
          onClick={handlePrimaryAction}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          className={`pc-btn-secondary${inWatchlist ? ' pc-btn-secondary--active' : ''}`}
          onClick={toggleWatchlist}
        >
          {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
        </button>
      </div>
    </div>
  );
}
