import { useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { ProductCard } from './partials/productCard';
import { mockListings } from './data/mockListings';

const photos = [
  '/images/IMG_9098.jpeg',
  '/images/IMG_9097.jpeg',
  '/images/IMG_9099.jpeg',
  '/images/IMG_9100.jpeg',
  '/images/IMG_9102.jpeg',
];

const documents = [
  ['Specification sheet', 'PDF · 284 KB · Uploaded Jan. 02, 2026'],
  ['Safety data sheet (SDS)', 'PDF · 512 KB · Uploaded Jan. 02, 2026'],
  ['Certificate of analysis (COA)', 'PDF · 198 KB · Uploaded Jan. 02, 2026'],
] as const;

const sellerFacts = [
  ['Business name', 'Lone Star Grain Co.'],
  ['Location', 'Amarillo, TX'],
  ['FDA Registration', '00000000000'],
  ['State feed license', 'ST-LS-000000'],
  ['Member since', 'December 2025'],
  ['Completed sales', '14 transactions'],
] as const;

const listingDetails = [
  ['Listing ID', 'JN-2026-002'],
  ['Listed', 'Jan. 03, 2026'],
  ['Approved by', 'MicroMarket Exchange'],
  ['Pickup / delivery', 'Seller arranged it'],
  ['Location', 'Amarillo, TX'],
  ['Relisting allowed', 'Yes'],
] as const;

export function ProductPage({ productId }: { productId: string }) {
  const [mainPhoto, setMainPhoto] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);

  return (
    <>
      <Header />

      <div className="page-container" data-product-id={productId}>
        <div className="page-contents">

          {/* ── Left column ──────────────────── */}
          <div className="product-content">

            {/* Photos */}
            <div className="photos-container">
              <img src={photos[mainPhoto]} alt="Product photo" />
              <div className="photos-group">
                {photos.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Product photo ${i + 1}`}
                    className={i === mainPhoto ? 'thumb-active' : ''}
                    onClick={() => setMainPhoto(i)}
                  />
                ))}
              </div>
            </div>

            {/* Product info */}
            <div className="info-container">
              <h6>featured listing</h6>
              <div className="header-section">
                <h2>Lysine-L 98.5% - Grade A</h2>
                <div className="header-section-subheader">
                  <div className="avatar">LS</div>
                  <div className="company-location">
                    <p>Lone Star Grain Co.</p>
                    <p className="italic">Amarillo, TX</p>
                  </div>
                  <div className="seller-tag">Verified Trader</div>
                </div>
              </div>

              <hr />

              <div className="info-grid">
                <div className="grid-box">
                  <p>Total volume</p>
                  <h4>55 <span className="grid-unit">lbs.</span></h4>
                </div>
                <div className="grid-box">
                  <p>Packaging</p>
                  <h4>Pneumatic</h4>
                </div>
                <div className="grid-box">
                  <p>Lot number</p>
                  <h4>1 <span className="grid-unit">lot</span></h4>
                </div>
                <div className="grid-box">
                  <p>Manufacturer</p>
                  <h4>Big Feed Co.</h4>
                </div>
                <div className="grid-box">
                  <p>Unit of measurement</p>
                  <h4>Pounds <span className="grid-unit">lbs.</span></h4>
                </div>
                <div className="grid-box">
                  <p>COA expiry</p>
                  <h4>Jan. 2027</h4>
                </div>
              </div>

              <div className="description-section">
                <p className="desc-title">Product description</p>
                <p className="desc-body">
                  Feed-grade L-Lysine HCl 98.5%. 98.5% L-Lysine HCl assay (≥78.8% free base),
                  moisture not exceeding 1.0%, and heavy metals below 10 ppm. Suitable for swine,
                  poultry, dairy, beef, aquaculture, and companion animal rations.
                  Stored below 25°C in a cool, dry environment since September 2025.
                  Available for pickup or freight with services from freightquote.com
                  as a recommended carrier.
                </p>
              </div>

              <hr />

              <p className="subtext">Included lot numbers</p>
              <div className="lot-tag">LOT-2025-0441</div>
            </div>

            {/* Documents */}
            <div className="docs-container">
              <p className="card-title">Listing documents</p>
              <hr />
              {documents.map(([title, meta]) => (
                <div key={title}>
                  <div className="doc-block">
                    <div className="doc-icon" />
                    <div className="doc-text">
                      <p className="doc-name">{title}</p>
                      <p className="subtext">{meta}</p>
                    </div>
                    <button className="download">Download</button>
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

            {/* Bid / actions card */}
            <div className="actions-container">
              <p className="sidebar-eyebrow">Live auction</p>

              {/* Bid stats block */}
              <div className="bid-tracking-container">
                <div className="bid-current-price">$ 0.50/lbs</div>
                <div className="bid-current-label">Current bid</div>

                <div className="bid-row bid-row--highlight">
                  <span className="bid-row-label">Time remaining</span>
                  <span className="bid-row-value">3d 14h 22m</span>
                </div>
                <div className="bid-row">
                  <span className="bid-row-label">Total bids</span>
                  <span className="bid-row-value">1 bid</span>
                </div>
                <div className="bid-row">
                  <span className="bid-row-label">Starting bid</span>
                  <span className="bid-row-value">$0.40/lbs</span>
                </div>
                <div className="bid-row">
                  <span className="bid-row-label">Min. bid increment</span>
                  <span className="bid-row-value">$0.10</span>
                </div>
              </div>

              <hr />

              <div className="bid-input-container">
                <p className="bid-input-label">Your bid</p>
                <input type="text" id="input-bid" placeholder="Place Bid" />
              </div>

              <p className="bid-total-line">
                Total at this bid : <span className="bid-total-amount">$00.00</span>
              </p>

              <button className="btn-bid">Bid Now</button>
              <button
                className={`btn-watchlist${inWatchlist ? ' btn-watchlist--active' : ''}`}
                onClick={() => setInWatchlist((w) => !w)}
              >
                {inWatchlist ? 'In Watchlist ✓' : 'Add to Watchlist'}
              </button>
              <p className="bid-disclaimer">
                Commission deducted from seller's final payout. Taxes may apply.
              </p>
            </div>

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

            <button id="seller-question">Ask the seller a question</button>
          </div>
        </div>

        <section className="featured-stock">
          <div className="featured-stock-container">
            <p className="similar-title">Similar listings</p>
            <div className="product-grid">
              {mockListings.slice(1, 5).map((listing) => (
                <ProductCard key={listing.id} item={listing} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
