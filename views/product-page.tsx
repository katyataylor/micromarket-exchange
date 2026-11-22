import { useEffect, useState } from 'react';
import { mockListings } from './data/mockListings';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { ProductCard } from './partials/productCard';
import type { Listing, UnitOfMeasure } from './types';

type WatchlistEntry = { listingId: number; qty: number; sold: boolean };
type CartEntry = { listingId: number; qty: number };

const UNIT_DISPLAY: Record<UnitOfMeasure, { name: string; abbrev: string }> = {
  pounds: { name: 'Pounds', abbrev: 'lbs.' },
  kilograms: { name: 'Kilograms', abbrev: 'kg' },
  grams: { name: 'Grams', abbrev: 'g' },
};

const DOCUMENTS = [
  ['Specification sheet', 'PDF · 284 KB · Uploaded Oct. 15, 2026'],
  ['Safety data sheet (SDS)', 'PDF · 512 KB · Uploaded Oct. 15, 2026'],
  ['Certificate of analysis (COA)', 'PDF · 198 KB · Uploaded Oct. 15, 2026'],
] as const;

function safeParseJSON<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function getWatchlist(): WatchlistEntry[] {
  return safeParseJSON<WatchlistEntry[]>(localStorage.getItem('mme_watchlist'), []);
}

function getCart(): CartEntry[] {
  return safeParseJSON<CartEntry[]>(localStorage.getItem('mme_cart'), []);
}

function getSellerInitials(seller: string): string {
  const words = seller.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return seller.slice(0, 2).toUpperCase();
}

function parseQtyParts(qty: string, fallbackAbbrev: string): { amount: string; unit: string } {
  const match = qty.trim().match(/^([\d,.]+)\s*(.*)$/);
  if (!match) return { amount: qty, unit: fallbackAbbrev };
  const rawUnit = match[2].trim();
  const normalizedUnit = rawUnit === 'lbs' ? 'lbs.' : rawUnit || fallbackAbbrev;
  return { amount: match[1], unit: normalizedUnit };
}

function parseNumericVolume(qty: string): number {
  const numeric = Number(qty.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductPage({
  productId,
  listing: initialListing,
}: {
  productId: string;
  listing?: Listing;
}) {
  const resolvedListing =
    initialListing ??
    mockListings.find((item) => String(item.id) === productId) ??
    mockListings[0];

  const photos =
    resolvedListing.images.length > 0
      ? resolvedListing.images
      : ['/images/IMG_9097.jpeg'];

  const [mainPhoto, setMainPhoto] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [bidInput, setBidInput] = useState('');
  const [currentBid, setCurrentBid] = useState(resolvedListing.price);
  const [bidCount, setBidCount] = useState(1);
  const [bidStatus, setBidStatus] = useState<string | null>(null);

  useEffect(() => {
    setMainPhoto(0);
    setBidInput('');
    setCurrentBid(resolvedListing.price);
    setBidCount(1);
    setBidStatus(null);
  }, [resolvedListing.id, resolvedListing.price]);

  useEffect(() => {
    const syncStorage = () => {
      setInWatchlist(getWatchlist().some((w) => w.listingId === resolvedListing.id));
      setInCart(getCart().some((c) => c.listingId === resolvedListing.id));
    };
    syncStorage();
    window.addEventListener('mme:storage-sync', syncStorage);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('mme:storage-sync', syncStorage);
      window.removeEventListener('storage', syncStorage);
    };
  }, [resolvedListing.id]);

  function toggleWatchlist() {
    const wl = getWatchlist();
    if (inWatchlist) {
      localStorage.setItem(
        'mme_watchlist',
        JSON.stringify(wl.filter((w) => w.listingId !== resolvedListing.id)),
      );
      setInWatchlist(false);
    } else {
      localStorage.setItem(
        'mme_watchlist',
        JSON.stringify([...wl, { listingId: resolvedListing.id, qty: 1, sold: false }]),
      );
      setInWatchlist(true);
    }
    window.dispatchEvent(new Event('mme:storage-sync'));
  }

  function handleAddToCart() {
    if (inCart) {
      window.location.href = '/cart';
      return;
    }
    const cart = getCart();
    localStorage.setItem(
      'mme_cart',
      JSON.stringify([...cart, { listingId: resolvedListing.id, qty: 1 }]),
    );
    setInCart(true);
    window.dispatchEvent(new Event('mme:storage-sync'));
  }

  const unitMeta = UNIT_DISPLAY[resolvedListing.unit];
  const qtyParts = parseQtyParts(resolvedListing.qty, unitMeta.abbrev);
  const numericVolume = parseNumericVolume(resolvedListing.qty);
  const priceSuffix = resolvedListing.priceUnit.replace(/^per\s+/i, '');
  const minIncrement = resolvedListing.price < 0.2 ? 0.01 : 0.05;
  const startingBid = Math.max(0.01, currentBid - minIncrement);

  const parsedBid = Number.parseFloat(bidInput.replace(/[^0-9.]/g, ''));
  const hasValidBid = Number.isFinite(parsedBid) && parsedBid > 0;
  const bidTotal = hasValidBid ? parsedBid * numericVolume : 0;
  const fixedLotTotal = resolvedListing.price * numericVolume;

  function handlePlaceBid() {
    const minNextBid = Number((currentBid + minIncrement).toFixed(2));
    if (!hasValidBid || parsedBid < minNextBid) {
      setBidStatus(`Enter at least $${minNextBid.toFixed(2)}/${priceSuffix} to place a bid.`);
      return;
    }
    setCurrentBid(parsedBid);
    setBidCount((c) => c + 1);
    setBidInput('');
    setBidStatus(`Bid of $${parsedBid.toFixed(2)}/${priceSuffix} recorded ($${formatCurrency(parsedBid * numericVolume)} lot total).`);
  }

  const stateCode = resolvedListing.location.split(',').pop()?.trim() || 'US';
  const sellerFacts = [
    ['Business name', resolvedListing.seller],
    ['Location', resolvedListing.location],
    ['FDA Registration', `18492014${String(resolvedListing.id).padStart(3, '0')}`],
    ['State feed license', `${stateCode}-FL-${String(10400 + resolvedListing.id)}`],
    ['Member since', 'December 2025'],
    ['Completed sales', `${11 + resolvedListing.id * 3} transactions`],
  ] as const;

  const listingDetails = [
    ['Listing ID', `MME-2026-00${resolvedListing.id}`],
    ['Category', resolvedListing.category ?? 'Feed Ingredient'],
    ['Approved by', 'MicroMarket Exchange'],
    ['Pickup / delivery', 'Seller arranged'],
    ['Location', resolvedListing.location],
    ['Expires', resolvedListing.expires],
  ] as const;

  const similarListings = mockListings
    .filter((item) => item.id !== resolvedListing.id)
    .slice(0, 4);

  const activePhotoSrc = photos[mainPhoto] ?? photos[0];

  return (
    <>
      <Header />

      <div className="page-container" data-product-id={String(resolvedListing.id)}>
        <div className="page-contents">

          {/* ── Left column ──────────────────── */}
          <div className="product-content">

            {/* Photos */}
            <div className="photos-container">
              <img src={activePhotoSrc} alt={resolvedListing.name} />
              {photos.length > 1 && (
                <div className="photos-group">
                  {photos.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`${resolvedListing.name} photo ${i + 1}`}
                      className={i === mainPhoto ? 'thumb-active' : ''}
                      onClick={() => setMainPhoto(i)}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="info-container">
              <h6>{resolvedListing.category ?? 'verified listing'}</h6>
              <div className="header-section">
                <h2>{resolvedListing.name}</h2>
                <div className="header-section-subheader">
                  <div className="avatar">{getSellerInitials(resolvedListing.seller)}</div>
                  <div className="company-location">
                    <p>{resolvedListing.seller}</p>
                    <p className="italic">{resolvedListing.location}</p>
                  </div>
                  <div className="seller-tag">Verified Seller</div>
                </div>
              </div>

              <hr />

              <div className="info-grid">
                <div className="grid-box">
                  <p>Total volume</p>
                  <h4>{qtyParts.amount} <span className="grid-unit">{qtyParts.unit}</span></h4>
                </div>
                <div className="grid-box">
                  <p>Packaging</p>
                  <h4>{resolvedListing.packaging}</h4>
                </div>
                <div className="grid-box">
                  <p>Lot number</p>
                  <h4>1 <span className="grid-unit">lot</span></h4>
                </div>
                <div className="grid-box">
                  <p>Manufacturer</p>
                  <h4>{resolvedListing.manufacturer ?? resolvedListing.seller}</h4>
                </div>
                <div className="grid-box">
                  <p>Unit of measurement</p>
                  <h4>{unitMeta.name} <span className="grid-unit">{unitMeta.abbrev}</span></h4>
                </div>
                <div className="grid-box">
                  <p>COA expiry</p>
                  <h4>{resolvedListing.coaExpiry ?? 'Jun. 2027'}</h4>
                </div>
              </div>

              <div className="description-section">
                <p className="desc-title">Product description</p>
                <p className="desc-body">
                  {resolvedListing.description ??
                    `Verified ${resolvedListing.name} offered by ${resolvedListing.seller} (${resolvedListing.location}). Complete specification sheet, SDS, and certificate of analysis included.`}
                </p>
              </div>

              <hr />

              <p className="subtext">Included lot numbers</p>
              <div className="lot-tag">{resolvedListing.lotNumber ?? `LOT-2026-00${resolvedListing.id}`}</div>
            </div>

            {/* Documents */}
            <div className="docs-container">
              <p className="card-title">Listing documents</p>
              <hr />
              {DOCUMENTS.map(([title, meta]) => (
                <div key={title}>
                  <div className="doc-block">
                    <div className="doc-icon" />
                    <div className="doc-text">
                      <p className="doc-name">{title}</p>
                      <p className="subtext">{meta}</p>
                    </div>
                    <button className="download" type="button">Download</button>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            {/* About the seller */}
            <div className="about-seller-container">
              <p className="card-title">About the seller</p>
              <hr />
              {sellerFacts.map(([label, value]) => (
                <div key={label}>
                  <div className="about-text-container">
                    <p className="subtext">{label}</p>
                    <p className="l-subtext">{value}</p>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right sidebar ─────────────────── */}
          <div className="sidebar">

            {resolvedListing.listingType === 'auction' ? (
              <div className="actions-container">
                <p className="sidebar-eyebrow">Live auction</p>

                <div className="bid-tracking-container">
                  <div className="bid-current-price">
                    ${currentBid.toFixed(2)}/{priceSuffix}
                  </div>
                  <div className="bid-current-label">Current bid ({resolvedListing.qty} lot)</div>

                  <div className="bid-row bid-row--highlight">
                    <span className="bid-row-label">Auction ends</span>
                    <span className="bid-row-value">{resolvedListing.expires}</span>
                  </div>
                  <div className="bid-row">
                    <span className="bid-row-label">Total bids</span>
                    <span className="bid-row-value">{bidCount} {bidCount === 1 ? 'bid' : 'bids'}</span>
                  </div>
                  <div className="bid-row">
                    <span className="bid-row-label">Starting bid</span>
                    <span className="bid-row-value">${startingBid.toFixed(2)}/{priceSuffix}</span>
                  </div>
                  <div className="bid-row">
                    <span className="bid-row-label">Min. bid increment</span>
                    <span className="bid-row-value">${minIncrement.toFixed(2)}</span>
                  </div>
                </div>

                <hr />

                <div className="bid-input-container">
                  <p className="bid-input-label">Your bid ({resolvedListing.priceUnit})</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-bid"
                    placeholder={`e.g. ${(currentBid + minIncrement).toFixed(2)}`}
                    value={bidInput}
                    onChange={(e) => {
                      setBidInput(e.target.value);
                      if (bidStatus) setBidStatus(null);
                    }}
                  />
                </div>

                <p className="bid-total-line">
                  Total at this bid :{' '}
                  <span className="bid-total-amount">${formatCurrency(bidTotal)}</span>
                </p>

                {bidStatus && (
                  <p className="bid-disclaimer" style={{ color: 'var(--brandSlate)', fontWeight: 500 }}>
                    {bidStatus}
                  </p>
                )}

                <button className="btn-bid" type="button" onClick={handlePlaceBid}>
                  Bid Now
                </button>
                <button
                  type="button"
                  className={`btn-watchlist${inWatchlist ? ' btn-watchlist--active' : ''}`}
                  onClick={toggleWatchlist}
                >
                  {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
                </button>
                <p className="bid-disclaimer">
                  Commission deducted from seller&apos;s final payout. Taxes may apply.
                </p>
              </div>
            ) : (
              <div className="actions-container">
                <p className="sidebar-eyebrow">Fixed price</p>

                <div className="bid-tracking-container">
                  <div className="bid-current-price">
                    ${resolvedListing.price.toFixed(2)}/{priceSuffix}
                  </div>
                  <div className="bid-current-label">Listed price ({resolvedListing.priceUnit})</div>

                  <div className="bid-row bid-row--highlight">
                    <span className="bid-row-label">Available volume</span>
                    <span className="bid-row-value">{resolvedListing.qty}</span>
                  </div>
                  <div className="bid-row">
                    <span className="bid-row-label">Packaging</span>
                    <span className="bid-row-value">{resolvedListing.packaging}</span>
                  </div>
                  <div className="bid-row">
                    <span className="bid-row-label">Listing expires</span>
                    <span className="bid-row-value">{resolvedListing.expires}</span>
                  </div>
                </div>

                <hr />

                <p className="bid-total-line">
                  Full lot total :{' '}
                  <span className="bid-total-amount">${formatCurrency(fixedLotTotal)}</span>
                </p>

                <button
                  type="button"
                  className="btn-bid"
                  style={inCart ? { backgroundColor: 'var(--brandSlate)' } : undefined}
                  onClick={handleAddToCart}
                >
                  {inCart ? 'In Cart ✓' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  className={`btn-watchlist${inWatchlist ? ' btn-watchlist--active' : ''}`}
                  onClick={toggleWatchlist}
                >
                  {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
                </button>
                <p className="bid-disclaimer">
                  Commission deducted from seller&apos;s final payout. Taxes may apply.
                </p>
              </div>
            )}

            {/* Listing details card */}
            <div className="listing-details-container">
              <p className="sidebar-eyebrow sidebar-eyebrow--gold">Listing details</p>
              {listingDetails.map(([label, value]) => (
                <div key={label}>
                  <div className="details-text-container">
                    <p className="subtext">{label}</p>
                    <p className="detail-value">{value}</p>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <button
              id="seller-question"
              type="button"
              onClick={() => { window.location.href = '/contact'; }}
            >
              Ask the seller a question
            </button>
          </div>
        </div>

        <section className="featured-stock">
          <div className="featured-stock-container">
            <p className="similar-title">Similar listings</p>
            <div className="product-grid">
              {similarListings.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
