import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { ProductCard } from './partials/productCard';
import type { Listing } from './types';

const sellerStates = [
  ['Texas', '42'],
  ['Iowa', '29'],
  ['Kansas', '19'],
  ['Nebraska', '17'],
  ['Minnesota', '14'],
  ['California', '12'],
  ['Washington', '9'],
] as const;
const units = [
  ['Pounds', '52'],
  ['Kilograms', '34'],
  ['Grand', '27'],
] as const;
export function Marketplace({ listings }: { listings?: Listing[] }) {
  const hasListings = Boolean(listings && listings.length > 0);

   return (
    <>
      <Header />
      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-content">
            <div className="store-hero-text">
              <h6>CURRENT STOCK</h6>
              <div className="display">Verified ingredients from verified sources.</div>
              <h3>Every listing is from an FDA-licensed operation or licensed feed mill.<br />All ingredients are reviewed and approved before going live.</h3>
              <div className="hero-stats-container">
                <div className="hero-stats">
                  <div className="stat">
                    <h1 className="stat-number">142</h1>
                    <div className="stat-label">Active Listings</div>
                  </div>
                  <hr />
                  <div className="stat">
                    <h1 className="stat-number">38</h1>
                    <div className="stat-label">Verified sellers</div>
                  </div>
                  <hr />
                  <div className="stat">
                    <h1 className="stat-number">15</h1>
                    <div className="stat-label">Auctions ending today</div>
                  </div>
                </div>
                <button id="store-hero-button">Learn more</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="store-page-body">
        <aside className="store-sidebar">
          <div className="store-filter-group">
            <div className="store-filter-label">Listing Type</div>
            <div className="store-filter-item">
              <label><input type="checkbox" /> All Listings</label>
              <span className="store-filter-count">142</span>
            </div>
            <div className="store-filter-item">
              <label><input type="checkbox" /> Auctions</label>
              <span className="store-filter-count">115</span>
            </div>
            <div className="store-filter-item">
              <label><input type="checkbox" /> Fixed price</label>
              <span className="store-filter-count">27</span>
            </div>
          </div>
          <div className="store-filter-divider" />
          <div className="store-filter-group">
            <div className="store-filter-label">Price Range</div>
            <div className="store-price-row">
              <input className="price-input" type="text" placeholder="$ Min" />
              <input className="price-input" type="text" placeholder="$ Max" />
            </div>
            <button id="btn-apply">Apply</button>
            <button id="btn-clear">Clear filters</button>
          </div>
          <div className="store-filter-divider" />
          <div className="store-filter-group">
            <div className="store-filter-label">Seller State</div>
            {sellerStates.map(([state, count]) => (
              <div className="store-filter-item" key={state}>
                <label><input type="checkbox" /> {state}</label>
                <span className="filter-count">{count}</span>
              </div>
            ))}
          </div>
          <div className="store-filter-divider" />
          <div className="store-filter-group">
            <div className="store-filter-label">Unit of Measure</div>
            {units.map(([unit, count]) => (
              <div className="store-filter-item" key={unit}>
                <label><input type="checkbox" /> {unit}</label>
                <span className="filter-count">{count}</span>
              </div>
            ))}
          </div>
        </aside>

<main className="store-main">
          <div className="store-results-bar">
            <div className="store-results-count">Showing 142 listings</div>
            <div className="store-search-bar">
              <input id="store-search-input" type="text" placeholder="Search" />
              <select id="store-search-dropdown" defaultValue="Sort by">
                <option>Sort by</option>
                <option>Price: Low-High</option>
                <option>Price: High-Low</option>
                <option>Ending Soon</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
          <div className="store-filter-tags">
            <div className="active tag">All listings ✕</div>
          </div>
          <div className="featured-card">
            <h6 className="featured-eyebrow">Featured Listing</h6>
            <div className="featured-content">
              <div className="featured-seller-info">
                <h2 className="featured-name">Lysine-L 98.5% - Grade A</h2>
                <div className="featured-small-text">
                  <p className="featured-seller">Lone Star Grain Co.</p>
                  <p className="seller-location">Amarillo, TX</p>
                </div>
              </div>
              <div className="featured-price-block">
                <h2 className="featured-price">$0.50</h2>
                <p className="featured-unit">per pound</p>
              </div>
            </div>
            <div className="featured-actions">
              <button id="btn-watchlist">Add to Watchlist</button>
              <button id="btn-bid">Place Bid</button>
            </div>
          </div>
          <div className="product-grid">
            {hasListings ? listings!.map((listing) => (
              <ProductCard key={listing.id} item={listing} />
            )) : (
              <p>No listings yet</p>
            )}
          </div>
          <div className="return-top">
            <a href="#">↑ Return to Top</a>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}