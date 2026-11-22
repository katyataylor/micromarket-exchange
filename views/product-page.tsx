import { useEffect, useState } from 'react';
import { mockListings } from './data/mockListings';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { ProductCard } from './partials/productCard';
import type { Listing, UnitOfMeasure } from './types';

type WatchlistEntry = { listingId: number; qty: number; sold: boolean };
type CartEntry = { listingId: number; qty: number; sold?: boolean };
type StoredBidRecord = {
  listingId: number;
  listingName: string;
  seller: string;
  bidPerUnit: number;
  priceUnit: string;
  lotVolume: string;
  lotTotal: number;
  bidCount: number;
  placedAt: string;
};
type StoredBidMap = Record<string, StoredBidRecord>;

type BidFeedback = {
  kind: 'error' | 'success';
  title: string;
  detail: string;
};

const UNIT_DISPLAY: Record<UnitOfMeasure, { name: string; abbrev: string }> = {
  pounds: { name: 'Pounds', abbrev: 'lbs.' },
  kilograms: { name: 'Kilograms', abbrev: 'kg' },
  grams: { name: 'Grams', abbrev: 'g' },
};

const DOCUMENTS = [
  {
    key: 'spec',
    title: 'Specification sheet',
    meta: 'PDF · 284 KB · Uploaded Oct. 15, 2026',
    summaryTitle: 'Guaranteed Analysis & Product Specifications',
  },
  {
    key: 'sds',
    title: 'Safety data sheet (SDS)',
    meta: 'PDF · 512 KB · Uploaded Oct. 15, 2026',
    summaryTitle: 'OSHA Hazard Communication Safety Data Sheet',
  },
  {
    key: 'coa',
    title: 'Certificate of analysis (COA)',
    meta: 'PDF · 198 KB · Uploaded Oct. 15, 2026',
    summaryTitle: 'Lot-Matched Laboratory Certificate of Analysis',
  },
] as const;

type DocItem = (typeof DOCUMENTS)[number];

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

function getStoredBids(): StoredBidMap {
  return safeParseJSON<StoredBidMap>(localStorage.getItem('mme_bids'), {});
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

function buildDocumentLines(doc: DocItem, listing: Listing, fdaReg: string, stateLicense: string): string[] {
  const lot = listing.lotNumber ?? `LOT-2026-00${listing.id}`;
  const manufacturer = listing.manufacturer ?? listing.seller;
  const coaExpiry = listing.coaExpiry ?? 'Jun. 2027';

  if (doc.key === 'spec') {
    return [
      `Product: ${listing.name}`,
      `Category: ${listing.category ?? 'Feed Ingredient'}`,
      `Manufacturer: ${manufacturer}`,
      `Packaging & Total Volume: ${listing.packaging} · ${listing.qty}`,
      `Storage & Handling: Cool, dry feed-mill storage; protected from moisture.`,
      `Overview: ${listing.description ?? `Verified ${listing.name} lot approved for livestock and feed manufacturing.`}`,
    ];
  }
  if (doc.key === 'sds') {
    return [
      `GHS Classification: Feed-grade agricultural ingredient (non-hazardous under normal handling)`,
      `Manufacturer / Supplier: ${manufacturer} (${listing.location})`,
      `FDA Facility Registration: ${fdaReg} · State License: ${stateLicense}`,
      `Personal Protection: Standard dust mask (NIOSH N95) and safety eyewear during bulk transfer`,
      `Spill & Storage Controls: Sweep dry material to avoid dust generation; store sealed in dry area`,
    ];
  }
  return [
    `Matching Lot Number: ${lot}`,
    `COA Retest / Expiry Date: ${coaExpiry}`,
    `Verified Seller: ${listing.seller} (${listing.location})`,
    `Microbiological & Mycotoxin Screen: Complies with FDA CVM action levels; Salmonella negative`,
    `Heavy Metals & Moisture: Within guaranteed feed-grade specification limits`,
    `Compliance Verification: Reviewed by MicroMarket Exchange Quality Team`,
  ];
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
  const [yourHighestBid, setYourHighestBid] = useState<number | null>(null);
  const [bidFeedback, setBidFeedback] = useState<BidFeedback | null>(null);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [viewedDocs, setViewedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMainPhoto(0);
    setBidInput('');
    setCurrentBid(resolvedListing.price);
    setBidCount(1);
    setYourHighestBid(null);
    setBidFeedback(null);
    setCartFeedback(null);
    setActiveDoc(null);
  }, [resolvedListing.id, resolvedListing.price]);

  useEffect(() => {
    const syncStorage = () => {
      setInWatchlist(getWatchlist().some((w) => w.listingId === resolvedListing.id));
      setInCart(getCart().some((c) => c.listingId === resolvedListing.id && !c.sold));
      const storedBid = getStoredBids()[String(resolvedListing.id)];
      if (storedBid && resolvedListing.listingType === 'auction') {
        setCurrentBid(storedBid.bidPerUnit);
        setBidCount(storedBid.bidCount);
        setYourHighestBid(storedBid.bidPerUnit);
      }
    };
    syncStorage();
    window.addEventListener('mme:storage-sync', syncStorage);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('mme:storage-sync', syncStorage);
      window.removeEventListener('storage', syncStorage);
    };
  }, [resolvedListing.id, resolvedListing.listingType]);

  useEffect(() => {
    if (window.location.hash === '#input-bid') {
      const input = document.getElementById('input-bid') as HTMLInputElement | null;
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus({ preventScroll: true });
      }
    }
  }, [resolvedListing.id]);

  useEffect(() => {
    if (!activeDoc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDoc(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDoc]);

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

  function handleAddToCart(redirectImmediately = false) {
    if (inCart) {
      window.location.href = '/cart#cart';
      return;
    }
    const cart = getCart().filter((c) => c.listingId !== resolvedListing.id);
    localStorage.setItem(
      'mme_cart',
      JSON.stringify([...cart, { listingId: resolvedListing.id, qty: 1 }]),
    );
    setInCart(true);
    window.dispatchEvent(new Event('mme:storage-sync'));
    if (redirectImmediately) {
      window.location.href = '/cart#cart';
      return;
    }
    setCartFeedback('Added to your cart. Proceed to checkout to submit an order request.');
  }

  const unitMeta = UNIT_DISPLAY[resolvedListing.unit];
  const qtyParts = parseQtyParts(resolvedListing.qty, unitMeta.abbrev);
  const numericVolume = parseNumericVolume(resolvedListing.qty);
  const priceSuffix = resolvedListing.priceUnit.replace(/^per\s+/i, '');
  const minIncrement = resolvedListing.price < 0.2 ? 0.01 : 0.05;
  const startingBid = Math.max(0.01, resolvedListing.price - minIncrement);
  const minNextBid = Number((currentBid + minIncrement).toFixed(2));

  const parsedBid = Number.parseFloat(bidInput.replace(/[^0-9.]/g, ''));
  const hasValidBid = Number.isFinite(parsedBid) && parsedBid > 0;
  const bidTotal = hasValidBid ? parsedBid * numericVolume : 0;
  const fixedLotTotal = resolvedListing.price * numericVolume;

  function handlePlaceBid() {
    if (!bidInput.trim() || !hasValidBid) {
      setBidFeedback({
        kind: 'error',
        title: 'Bid amount required',
        detail: `Enter a bid of at least $${minNextBid.toFixed(2)}/${priceSuffix} ($${formatCurrency(minNextBid * numericVolume)} lot total).`,
      });
      return;
    }
    if (parsedBid < minNextBid) {
      setBidFeedback({
        kind: 'error',
        title: 'Bid below minimum increment',
        detail: `Minimum next bid is $${minNextBid.toFixed(2)}/${priceSuffix} ($${minIncrement.toFixed(2)} above current bid).`,
      });
      return;
    }

    const roundedBid = Number(parsedBid.toFixed(2));
    const nextCount = bidCount + 1;
    const totalLotValue = roundedBid * numericVolume;
    const allBids = getStoredBids();
    allBids[String(resolvedListing.id)] = {
      listingId: resolvedListing.id,
      listingName: resolvedListing.name,
      seller: resolvedListing.seller,
      bidPerUnit: roundedBid,
      priceUnit: resolvedListing.priceUnit,
      lotVolume: resolvedListing.qty,
      lotTotal: totalLotValue,
      bidCount: nextCount,
      placedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
    localStorage.setItem('mme_bids', JSON.stringify(allBids));
    window.dispatchEvent(new Event('mme:storage-sync'));

    setCurrentBid(roundedBid);
    setBidCount(nextCount);
    setYourHighestBid(roundedBid);
    setBidInput('');
    setBidFeedback({
      kind: 'success',
      title: `Leading bid confirmed: $${roundedBid.toFixed(2)}/${priceSuffix}`,
      detail: `Full lot commitment: $${formatCurrency(totalLotValue)} (${resolvedListing.qty}).`,
    });
  }

  const stateCode = resolvedListing.location.split(',').pop()?.trim() || 'US';
  const fdaRegNumber = `18492014${String(resolvedListing.id).padStart(3, '0')}`;
  const stateFeedLicense = `${stateCode}-FL-${String(10400 + resolvedListing.id)}`;

  const sellerFacts = [
    ['Business name', resolvedListing.seller],
    ['Location', resolvedListing.location],
    ['FDA Registration', fdaRegNumber],
    ['State feed license', stateFeedLicense],
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

  function openDocumentPreview(doc: DocItem) {
    setViewedDocs((prev) => {
      const next = new Set(prev);
      next.add(doc.key);
      return next;
    });
    setActiveDoc(doc);
  }

  function downloadDocumentSummary(doc: DocItem) {
    const lot = resolvedListing.lotNumber ?? `LOT-2026-00${resolvedListing.id}`;
    const lines = [
      'MICROMARKET EXCHANGE — VERIFIED LISTING DOCUMENTATION',
      '======================================================',
      `Document: ${doc.title} (${doc.summaryTitle})`,
      `Listing ID: MME-2026-00${resolvedListing.id}`,
      ...buildDocumentLines(doc, resolvedListing, fdaRegNumber, stateFeedLicense),
      '',
      'Generated from MicroMarket Exchange Client Review Portal.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MME-${doc.key.toUpperCase()}-${lot}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
              {DOCUMENTS.map((doc) => {
                const isViewed = viewedDocs.has(doc.key);
                return (
                  <div key={doc.key}>
                    <div className="doc-block">
                      <div className="doc-icon" />
                      <div className="doc-text">
                        <p className="doc-name">{doc.title}</p>
                        <p className="subtext">{doc.meta}</p>
                      </div>
                      <button
                        className={`download${isViewed ? ' download--viewed' : ''}`}
                        type="button"
                        onClick={() => openDocumentPreview(doc)}
                      >
                        {isViewed ? 'Viewed ✓' : 'Download'}
                      </button>
                    </div>
                    <hr />
                  </div>
                );
              })}
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
                <div className="pdp-sidebar-header-row">
                  <p className="sidebar-eyebrow">Live auction</p>
                  {yourHighestBid !== null && (
                    <span className="pdp-leading-pill">Highest Bidder ✓</span>
                  )}
                </div>

                <div className="bid-tracking-container">
                  <div className="bid-current-price">
                    ${currentBid.toFixed(2)}/{priceSuffix}
                  </div>
                  <div className="bid-current-label">
                    Current bid ({resolvedListing.qty} lot · ${formatCurrency(currentBid * numericVolume)} est.)
                  </div>

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
                  <div className="pdp-bid-label-row">
                    <label htmlFor="input-bid" className="bid-input-label">
                      Your bid ({resolvedListing.priceUnit})
                    </label>
                    <button
                      type="button"
                      className="pdp-min-bid-fill"
                      onClick={() => {
                        setBidInput(minNextBid.toFixed(2));
                        if (bidFeedback) setBidFeedback(null);
                      }}
                    >
                      Use min (${minNextBid.toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-bid"
                    placeholder={`Min. $${minNextBid.toFixed(2)}`}
                    value={bidInput}
                    onChange={(e) => {
                      setBidInput(e.target.value);
                      if (bidFeedback?.kind === 'error') setBidFeedback(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePlaceBid();
                      }
                    }}
                  />
                </div>

                <p className="bid-total-line">
                  Total at this bid :{' '}
                  <span className="bid-total-amount">${formatCurrency(bidTotal)}</span>
                </p>

                {bidFeedback && (
                  <div
                    className={`pdp-feedback-box pdp-feedback-box--${bidFeedback.kind}`}
                    role={bidFeedback.kind === 'error' ? 'alert' : 'status'}
                  >
                    <p className="pdp-feedback-title">{bidFeedback.title}</p>
                    <p className="pdp-feedback-detail">{bidFeedback.detail}</p>
                    {bidFeedback.kind === 'success' && (
                      <a href="/account#orders" className="pdp-feedback-link">
                        View active bids in My Orders →
                      </a>
                    )}
                  </div>
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
                  Sale commission deducted from seller&apos;s final payout. Applicable taxes may apply.
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

                {cartFeedback && (
                  <div className="pdp-feedback-box pdp-feedback-box--success" role="status">
                    <p className="pdp-feedback-title">Added to Cart ✓</p>
                    <p className="pdp-feedback-detail">{cartFeedback}</p>
                    <a href="/cart#cart" className="pdp-feedback-link">
                      Proceed to Cart &amp; Checkout →
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-bid"
                  style={inCart ? { backgroundColor: 'var(--brandSlate)' } : undefined}
                  onClick={() => handleAddToCart(false)}
                >
                  {inCart ? 'In Cart ✓ — View Cart' : 'Add to Cart'}
                </button>
                {!inCart && (
                  <button
                    type="button"
                    className="pdp-buy-now-btn"
                    onClick={() => handleAddToCart(true)}
                  >
                    Buy Now
                  </button>
                )}
                <button
                  type="button"
                  className={`btn-watchlist${inWatchlist ? ' btn-watchlist--active' : ''}`}
                  onClick={toggleWatchlist}
                >
                  {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
                </button>
                <p className="bid-disclaimer">
                  Sale commission deducted from seller&apos;s final payout. Applicable taxes may apply.
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
              onClick={() => {
                const params = new URLSearchParams({
                  listing: resolvedListing.name,
                  seller: resolvedListing.seller,
                });
                window.location.href = `/contactpage?${params.toString()}`;
              }}
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

      {activeDoc && (
        <div
          className="pdp-doc-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDoc(null);
          }}
        >
          <div
            className="pdp-doc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdp-doc-modal-title"
          >
            <div className="pdp-doc-modal-header">
              <div>
                <p className="pdp-doc-eyebrow">Verified Compliance Document</p>
                <h3 id="pdp-doc-modal-title" className="pdp-doc-title">
                  {activeDoc.title}
                </h3>
                <p className="pdp-doc-subtitle">{activeDoc.summaryTitle}</p>
              </div>
              <button
                type="button"
                className="pdp-doc-close"
                onClick={() => setActiveDoc(null)}
                aria-label="Close document preview"
              >
                ✕
              </button>
            </div>

            <div className="pdp-doc-body">
              {buildDocumentLines(activeDoc, resolvedListing, fdaRegNumber, stateFeedLicense).map(
                (line) => (
                  <p key={line} className="pdp-doc-line">
                    {line}
                  </p>
                ),
              )}
            </div>

            <div className="pdp-doc-actions">
              <button
                type="button"
                className="pdp-doc-download-btn"
                onClick={() => downloadDocumentSummary(activeDoc)}
              >
                Download Summary (.txt)
              </button>
              <button
                type="button"
                className="pdp-doc-secondary-btn"
                onClick={() => setActiveDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
