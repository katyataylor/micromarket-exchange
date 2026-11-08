import { useState, useMemo } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { ProductCard } from './partials/productCard';
import { mockListings, featuredListing } from './data/mockListings';
import type { Listing, ListingType, UnitOfMeasure } from './types';

/* ── filter-state shape ───────────────────────────────────────── */
type FilterState = {
  listingType: 'all' | ListingType;
  states: Set<string>;
  units: Set<UnitOfMeasure>;
  minPrice: string;
  maxPrice: string;
};

const INITIAL_FILTERS: FilterState = {
  listingType: 'all',
  states: new Set(),
  units: new Set(),
  minPrice: '',
  maxPrice: '',
};

const SELLER_STATES: [string, number][] = [
  ['Texas', 72], ['Iowa', 25], ['Kansas', 14],
  ['Nebraska', 13], ['Minnesota', 11], ['California', 9], ['Washington', 8],
];

const UNITS: [UnitOfMeasure, number][] = [
  ['pounds', 52], ['kilograms', 34], ['grams', 27],
];

const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  pounds: 'Pounds', kilograms: 'Kilograms', grams: 'Grams',
};

const SORT_OPTIONS = [
  { value: 'default',  label: 'Sort by' },
  { value: 'price-asc', label: 'Price: Low–High' },
  { value: 'price-desc', label: 'Price: High–Low' },
  { value: 'ending',    label: 'Ending Soon' },
  { value: 'newest',    label: 'Newest' },
];

function applyFilters(listings: Listing[], f: FilterState, search: string, sort: string): Listing[] {
  let result = listings.filter((l) => {
    if (f.listingType !== 'all' && l.listingType !== f.listingType) return false;
    if (f.states.size > 0 && !f.states.has(l.state)) return false;
    if (f.units.size > 0 && !f.units.has(l.unit)) return false;
    if (f.minPrice !== '' && l.price < parseFloat(f.minPrice)) return false;
    if (f.maxPrice !== '' && l.price > parseFloat(f.maxPrice)) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.seller.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (sort === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
  if (sort === 'ending')     result = [...result].sort((a, b) => a.expires.localeCompare(b.expires));

  return result;
}

export function Marketplace({ listings }: { listings?: Listing[] }) {
  const source = listings && listings.length > 0 ? listings : mockListings;

  /* ── ui state ─────────────────────────────────────────────── */
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [pendingMin, setPendingMin] = useState('');
  const [pendingMax, setPendingMax] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  /* ── derived values ───────────────────────────────────────── */
  const filtered = useMemo(
    () => applyFilters(source, filters, search, sort),
    [source, filters, search, sort],
  );

  /* ── filter helpers ───────────────────────────────────────── */
  function toggleType(type: 'all' | ListingType) {
    setFilters((f) => ({ ...f, listingType: type }));
  }

  function toggleState(state: string) {
    setFilters((f) => {
      const next = new Set(f.states);
      if (next.has(state)) next.delete(state); else next.add(state);
      return { ...f, states: next };
    });
  }

  function toggleUnit(unit: UnitOfMeasure) {
    setFilters((f) => {
      const next = new Set(f.units);
      if (next.has(unit)) next.delete(unit); else next.add(unit);
      return { ...f, units: next };
    });
  }

  function applyPrice() {
    setFilters((f) => ({ ...f, minPrice: pendingMin, maxPrice: pendingMax }));
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setPendingMin('');
    setPendingMax('');
    setSearch('');
    setSort('default');
  }

  /* ── active-tag chips for the results bar ─────────────────── */
  const activeTags: { label: string; onRemove: () => void }[] = [];

  if (filters.listingType !== 'all') {
    activeTags.push({
      label: filters.listingType === 'auction' ? 'Auctions' : 'Fixed Price',
      onRemove: () => setFilters((f) => ({ ...f, listingType: 'all' })),
    });
  }
  filters.states.forEach((s) =>
    activeTags.push({ label: s, onRemove: () => toggleState(s) }),
  );
  filters.units.forEach((u) =>
    activeTags.push({ label: UNIT_LABELS[u], onRemove: () => toggleUnit(u) }),
  );
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `$${filters.minPrice} – $${filters.maxPrice}`
      : filters.minPrice ? `≥ $${filters.minPrice}` : `≤ $${filters.maxPrice}`;
    activeTags.push({ label, onRemove: () => setFilters((f) => ({ ...f, minPrice: '', maxPrice: '' })) });
  }
  if (search.trim()) {
    activeTags.push({ label: `"${search}"`, onRemove: () => setSearch('') });
  }

  /* ── render ───────────────────────────────────────────────── */
  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <section className="store-hero-bg">
        <div className="store-hero-content">
          <div className="store-hero-text">
            <div className="eyebrow">CURRENT STOCK</div>
            <div className="display">Verified ingredients from verified sources.</div>
            <p className="p2" style={{ color: 'var(--textDarkBackground)' }}>
              Every listing is from an FDA-licensed operation or licensed feed mill.<br />
              All ingredients are reviewed and approved before going live.
            </p>
            <div className="hero-stats-container">
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">{source.filter(l => l.listingType === 'auction').length + 115}</div>
                  <div className="stat-label italic">Active listings</div>
                </div>
                <div className="hero-stat-sep" />
                <div className="stat">
                  <div className="stat-number">38</div>
                  <div className="stat-label italic">Verified sellers</div>
                </div>
                <div className="hero-stat-sep" />
                <div className="stat">
                  <div className="stat-number">15</div>
                  <div className="stat-label italic">Auctions ending today</div>
                </div>
              </div>
              <a href="/infopage" className="store-hero-button">Learn more</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop body ── */}
      <div className="shop-frame">
        <div className="shop-contents">

          {/* ── Sidebar ── */}
          <aside className="shop-sidebar">
            <div className="shop-filters">

              {/* Listing Type */}
              <div className="sf-group">
                <div className="sf-label">Listing Type</div>
                <div className="sf-items">
                  {(['all', 'auction', 'fixed'] as const).map((type) => {
                    const count = type === 'all'
                      ? source.length
                      : source.filter(l => l.listingType === type).length;
                    const label = type === 'all' ? 'All listings' : type === 'auction' ? 'Auctions' : 'Fixed price';
                    const checked = filters.listingType === type;
                    return (
                      <div className="sf-row" key={type} onClick={() => toggleType(type)}>
                        <div className="sf-row-left">
                          <div className={`sf-checkbox${checked ? ' sf-checkbox--checked' : ''}`}>
                            {checked && <span className="sf-check">✓</span>}
                          </div>
                          <span className="sf-text">{label}</span>
                        </div>
                        <span className="sf-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="sf-divider" />

              {/* Price Range */}
              <div className="sf-group">
                <div className="sf-label">Price Range</div>
                <div className="sf-price-row">
                  <input
                    className="sf-price-input"
                    type="text"
                    placeholder="$ Min"
                    value={pendingMin}
                    onChange={(e) => setPendingMin(e.target.value)}
                  />
                  <span className="sf-price-sep">–</span>
                  <input
                    className="sf-price-input"
                    type="text"
                    placeholder="$ Max"
                    value={pendingMax}
                    onChange={(e) => setPendingMax(e.target.value)}
                  />
                </div>
                <button className="sf-btn sf-btn--apply" onClick={applyPrice}>Apply</button>
                <button className="sf-btn sf-btn--clear" onClick={clearFilters}>Clear filters</button>
              </div>

              <hr className="sf-divider" />

              {/* Seller State */}
              <div className="sf-group">
                <div className="sf-label">Seller State</div>
                <div className="sf-items">
                  {SELLER_STATES.map(([state, count]) => {
                    const checked = filters.states.has(state);
                    return (
                      <div className="sf-row" key={state} onClick={() => toggleState(state)}>
                        <div className="sf-row-left">
                          <div className={`sf-checkbox${checked ? ' sf-checkbox--checked' : ''}`}>
                            {checked && <span className="sf-check">✓</span>}
                          </div>
                          <span className="sf-text">{state}</span>
                        </div>
                        <span className="sf-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="sf-divider" />

              {/* Unit of Measure */}
              <div className="sf-group">
                <div className="sf-label">Unit of Measure</div>
                <div className="sf-items">
                  {UNITS.map(([unit, count]) => {
                    const checked = filters.units.has(unit);
                    return (
                      <div className="sf-row" key={unit} onClick={() => toggleUnit(unit)}>
                        <div className="sf-row-left">
                          <div className={`sf-checkbox${checked ? ' sf-checkbox--checked' : ''}`}>
                            {checked && <span className="sf-check">✓</span>}
                          </div>
                          <span className="sf-text">{UNIT_LABELS[unit]}</span>
                        </div>
                        <span className="sf-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* ── Main ── */}
          <main className="shop-main">

            {/* Results bar */}
            <div className="shop-results-bar">
              <span className="shop-results-count">Showing {filtered.length} listings</span>
              <div className="shop-search-bar">
                <input
                  className="shop-search-input"
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="shop-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {activeTags.length > 0 && (
              <div className="shop-tags-row">
                {activeTags.map((tag, i) => (
                  <button key={i} className="shop-active-tag" onClick={tag.onRemove}>
                    {tag.label} <span className="shop-tag-x">✕</span>
                  </button>
                ))}
                {activeTags.length > 1 && (
                  <button className="shop-clear-all" onClick={clearFilters}>Clear all</button>
                )}
              </div>
            )}

            {/* Featured listing */}
            <div className="featured-card">
              <div className="featured-eyebrow">Featured Listing</div>
              <div className="featured-content">
                <div className="featured-seller-info">
                  <h2 className="featured-name">{featuredListing.name}</h2>
                  <div className="featured-small-text">
                    <span className="featured-seller">{featuredListing.seller}</span>
                    <span className="seller-location">{featuredListing.location}</span>
                  </div>
                </div>
                <div className="featured-price-block">
                  <div className="featured-price">${featuredListing.price.toFixed(2)}</div>
                  <div className="featured-unit">{featuredListing.priceUnit}</div>
                </div>
              </div>
              <div className="featured-actions">
                <button id="btn-watchlist">Add to Watchlist</button>
                <button id="btn-bid">Place Bid</button>
              </div>
            </div>

            {/* Product grid */}
            {filtered.length > 0 ? (
              <div className="product-grid">
                {filtered.map((listing) => (
                  <ProductCard key={listing.id} item={listing} />
                ))}
              </div>
            ) : (
              <div className="shop-empty">
                <p>No listings match your filters.</p>
                <button className="sf-btn sf-btn--apply" onClick={clearFilters}>Clear filters</button>
              </div>
            )}

            <div className="return-top">
              <a href="#">↑ Return to Top</a>
            </div>
          </main>

        </div>
      </div>

      <Footer />
    </>
  );
}
