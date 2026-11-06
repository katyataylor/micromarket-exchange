import { Footer } from './partials/footer';
import { Header } from './partials/header';
import { StockCard } from './partials/stockCard';
export function Homepage() {
  return (
    <>
      <Header />
      <section className="hero">
        <img src="/images/ag-warehouse.jpg" alt="Photo of the inside of a large agricultural warehouse. Lots of rows of stacked canvas bags." />
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="display">Where obsolete and overstock inventory finds a home.</div>
            <div className="p2" style={{ color: 'white' }}>Connecting unicorn ingredient havers to unicorn ingredient needers.
              Reducing waste in the ag industry and freeing up space in your warehouse.
            </div>
            <button className="hero-info-button">Learn More</button>
          </div>
        </div>
      </section>
      <section className="info">
        <div className="info-grid">
          <div className="card-content">
            <div className="card-left">
              <div className="card-text">
                <h2>How It Works</h2>
                <div className="p2" style={{ opacity: '60%' }}>In four easy steps you can have your product listed for buyers across the US. MicroMarket Exchange charges a monthly subsciption and a small listing fee once your product sells.</div>
                <button className="about-button">About Us</button>
              </div>
            </div>
            <div className="card-left">
              <img id="hay-bales" src="/images/Hay-Missouri.webp" alt="Hay bale in the forefront of a green field." />
            </div>
          </div>
          <div className="card-content">
            <div className="card-right">
              <img id="grain" src="/images/Grain.jpg" alt="Hands holding unprocessed grain in front of a bag full of grain." />
            </div>
            <div className="card-right">
              <div className="card-text">
                <h2>Commitment to Quality</h2>
                <div className="p2" style={{ opacity: '60%' }}>Every listing includes a spec sheet, SDS, and certificate of analysis so buyers know exactly what they're getting. Quantities, packaging type, and pickup or freight details are all handled directly between buyer and seller.</div>
                <button className="shop-button">In Stock</button>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="card-left">
              <div className="card-text">
                <h2>Selling Requirements</h2>
                <div className="p2" style={{ opacity: '60%' }}>To buy or sell on MicroMarket Exchange, your operation must hold a valid FDA registration, an active state feed license, and a physical facility - no brokers or traders allowed. Every account and listing is manually reviewed before going live.</div>
                <button className="info-button">Selling Info</button>
              </div>
            </div>
            <div className="card-left">
              <img id="cows" style={{ height: '412px' }} src="/images/Cattle-feedlot-south-africa-beef-industry.webp" alt="Cattle eating at a large, outoor trough." />
            </div>
          </div>
        </div>
      </section>
      <section className="featured-stock">
        <div className="featured-stock-container">
          <h2>Current Stock</h2>
          <div className="product-grid">
            <StockCard category="Amino acid" name="Product 1" price="$20.00" imageSrc="/images/IMG_9098.jpeg" categoryTag="h6" />
            <StockCard category="Vitamin" name="Product 2" price="$300.00" alt />
            <StockCard category="Mineral" name="Product 3" price="$300.00" />
            <StockCard category="Enzyme" name="Product 4" price="$30.00" alt />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}