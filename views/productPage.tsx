                  <p>lot number</p>
                  <h4>1</h4><p className="italic">lot</p>
                </div>
                <div className="grid-box">
                  <p>manufacturer</p>
                  <h4>Big Feed Co.</h4><p className="italic" />
                </div>
                <div className="grid-box">
                  <p>unit of measurement</p>
                  <h4>pounds</h4><p className="italic">lbs.</p>
                </div>
                <div className="grid-box">
                  <p>coa</p>
                  <h4>Jan. 2027</h4><p className="italic" />
                </div>
              </div>
              <div className="description-section">
                <h5 className="bold">Product description</h5>
                <h5>
                  Feed-grade L-Lysine HCl 98.5%. 98.5% L-Lysine HCl assay (≥78.8% free base),
                  moisture not exceeding 1.0%, and heavy metals below 10 ppm. Suitable for swine,
                  poultry, dairy, beef, aquaculture, and companion animal rations.
                  Stored below 25°C in a cool, dry environment since September 2025.
                  Available for pickup of freight with services from freightquote.com
                  as a recommended carrier.
                </h5>
              </div>
              <hr />
              <p className="subtext">Included lot numbers</p>
              <div className="lot-tag">
                <p>LOT-2025-0441</p>
              </div>
            </div>
            <div className="docs-container">
              <h5 className="bold">Listing documents</h5>
              <hr />
              {documents.map(([title, meta]) => (
                <div key={title}>
                  <div className="doc-block">
                    <div className="doc-icon" />
                    <div className="doc-text">
                      <h5>{title}</h5>
                      <p className="subtext">{meta}</p>
                    </div>
                    <button className="download">Download</button>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
            <div className="about-seller-container">
              <h5 className="bold">About the seller</h5>
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
          <div className="sidebar">
            <div className="actions-container">
              <h6 className="gold">Live auction</h6>
              <div className="bid-tracking-container" />
              <hr />
              <div className="bid-input-container">
                <p className="subtext">Your Bid</p>
                <input type="text" id="input-bid" placeholder="Place Bid" />
              </div>
              <div className="bid-total">
                <p>Total at this bid : </p><p className="bold">$00.00</p>
              </div>
              <button className="btn-bid">Bid Now</button>
              <button className="btn-watchlist">Add to Watchlist</button>
              <p className="italic">Commission deducted from seller’s final payout. Taxes may apply.</p>
            </div>
            <div className="listing-details-container">
              <h6 className="gold">Listing details</h6>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index}>
                  <div className="details-text-container">
                    <p className="subtext">Listing ID</p>
                    <p className="subtext">JN-2026-002</p>
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
            <h5>Similar listings</h5>
            <div className="product-grid">
              <StockCard category="Amino acid" name="Product 1" price="$20.00" />
              <StockCard category="Vitamin" name="Product 2" price="$300.00" alt />
              <StockCard category="Mineral" name="Product 3" price="$300.00" />
              <StockCard category="Enzyme" name="Product 4" price="$30.00" alt />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}