// Stock Card
function IngredientMark() {
  return (
    <svg viewBox="0 0 26 26" fill="none">
      <path d="M13 3C13 3 7 7.5 7 13s6 10 6 10 6-4.5 6-10S13 3 13 3z" fill="#5E9E96" opacity="0.25" />
      <path d="M13 5v16M7.5 9.5l5.5-3.5 5.5 3.5M9.5 18l3.5 2 3.5-2" stroke="#5E9E96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type StockCardProps = {
  category: string;
  name: string;
  price: string;
  alt?: boolean;
  imageSrc?: string;
  categoryTag?: 'h6' | 'div';
};

export function StockCard({ category, name, price, alt = false, imageSrc, categoryTag = 'div' }: StockCardProps) {
  return (
    <div className="product-card">
      <div className={alt ? 'card-img card-img-alt' : 'card-img'}>
        <span className="card-badge">Auction</span>
        {imageSrc ? (
          <img className="card-img-icon" src={imageSrc} alt="Product photo" />
        ) : (
          <div className="card-img-icon">
            <IngredientMark />
          </div>
        )}
      </div>
      <div className="card-body">
        {categoryTag === 'h6' ? (
          <h6 className="card-category">{category}</h6>
        ) : (
          <div className="card-category">{category}</div>
        )}
        <div className="card-name">{name}</div>
        <div className="card-seller">Genetic Feed Co.</div>
        <div className="card-meta">Location: USA {'\u00A0\u00A0'} Pkg: Bulk</div>
        <div className="card-price">{price}<span> /lbs</span></div>
        <div className="card-actions">
          <button className="btn-bid">Bid Now</button>
          <button className="btn-watchlist">Add to Watchlist</button>
        </div>
      </div>
    </div>
  );
}