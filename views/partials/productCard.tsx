// Product Card
import type { Listing } from '../types';

export function ProductCard({ item }: { item: Listing }) {
  return (
    <div className="product-card">
      <div className="card-image-wrapper">
        <span className="auction-badge">
          <span className="dot" /> AUCTION
        </span>
        <img className="cover-img product-img" src="/images/probios-precise.jpg" alt={item.name} />
      </div>

      <div className="card-details">
        <h3 className="product-title">Product</h3>
        <p className="company-name">General Feed Co.</p>
        <p className="location">Location, USA</p>

        <div className="meta-row">
          <span>Vol: <strong className="meta-val">55lbs</strong></span>
          <span>Pkg: <strong className="meta-val">Bulk</strong></span>
        </div>

        <div className="price-display">
          <span className="amount">$00.00</span><span className="unit">/lbs</span>
        </div>
      </div>
      
      <div className="card-actions">
        <button className="bid-btn">Bid Now</button>
        <button className="watchlist-btn">Add to Watchlist</button>
      </div>
    </div>
  );
}