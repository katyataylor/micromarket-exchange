import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function InfoPage() {
  return (
    <>
      <Header />

      <div className="page-body">
        <section className="info-container">
          <div className="eyebrow" style={{ color: 'var(--brandGold)' }}>who can trade on micromarket exchange</div>
          <div className="display" style={{ color: 'var(--brandSlate)' }}>A verified marketplace for the industry</div>
          <div className="p2">Micromarket Exchange is built exclusively for licensed feed manufacturers.
            Every buyer and seller on our platform is verified before they can list, so you always know who you're dealing with.</div>
          <div className="bubble-container">
            <div className="membership-types-container">
              <div className="callout-bubble">
                <div className="eyebrow" style={{ color: 'var(--brandGold)' }}>account registration</div>
                <div className="display">Join Micromarket Exchange</div>
                <div className="p2">Micromarket Exchange is a marketplace for licensed agricultural operations.
                  <span style={{ fontWeight: 800 }}>Select the option below that describes your operation to sign up.</span>
                  Only FDA-licensed operations and licensed feed mills may buy ot sell.
                  A third party memebrship is available for viewing products only.</div>
              </div>

              <div className="full-membership">
                <div className="eyebrow" style={{ color: 'var(--textEyebrowBlue)' }}>full membership</div>
                <h2>FDA-licensed operations</h2>
                <h4>FDA-licensed farms and operations approved to list feed ingredients for sale on the platform.</h4>
                <div className="type-tag">Buy & Sell</div>
              </div>

              <div className="full-membership">
                <div className="eyebrow" style={{ color: 'var(--textEyebrowBlue)' }}>full membership</div>
                <h2>Verified businesses</h2>
                <h4>Licensed feed mills and brick-and-mortar operations who need to source verified ingredients.</h4>
                <div className="type-tag">Buy & Sell</div>
              </div>

              <div className="third-party-membership">
                <div className="eyebrow" style={{ color: 'var(--textEyebrowBlue)' }}>third-party members</div>
                <h2>Industry Experts</h2>
                <h4>Consultants, researchers and industry professionals can view the marketplace.</h4>
                <div className="type-tag">View Only</div>
              </div>
            </div>
          </div>

          <div className="l-subtext">No traders. No middlemen. Only licensed operations whith a physical presence can buy or sell.</div>
          <hr />
        </section>

        <section className="info-container">
          <div className="eyebrow" style={{ color: 'var(--brandGold)' }}>listing process</div>
          <h5>Every listing is reviewed before it goes live</h5>
          <div className="p2">We manually approve all submissions, including photos, to keep listing quality high and the marketplace trustworthy.</div>
          
          <div className="list-container">
            <div className="list-item infopage">
              <h2 className="number">1</h2>
              <div className="text-container">
                <h2>Submit your listing</h2>
                <h4>Provide product details, quantity, asking price, and clear photos of what you're selling.</h4>
              </div>
            </div>
            <hr />
            <div className="list-item infopage">
              <h2 className="number">2</h2>
              <div className="text-container">
                <h2>Review & approval</h2>
                <h4>Our team reviews your submission for accuracy and quality.
                  We check photos too - blurry, misleading, or low quality images won't make it through.
                </h4>
              </div>
            </div>
            <hr />
            <div className="list-item infopage">
              <h2 className="number">3</h2>
              <div className="text-container">
                <h2>Listing goes live</h2>
                <h4>Once approved, your listing is visible to all qualified buyers on the marketplace.</h4>
              </div>
            </div>
            <hr />
            <div className="list-item infopage">
              <h2 className="number">4</h2>
              <div className="text-container">
                <h2>Sale completes or listing expires</h2>
                <h4>If your item sells, the commission is deducted from your final payout - nothing to pay upfront.
                  If it doesn't sell in the 14-day period, you can relist.
                </h4>
              </div>
            </div>
            <hr />
          </div>
        </section>

        <section className="info-container">
          <div className="eyebrow" style={{ color: 'var(--brandGold)' }}>fees & pricing</div>
          <h5>Simple, seller-side fees</h5>
          <div className="p2">Buyers pay only listing price + sales tax.
            Sellers pay an initial listing fee and a percentage of the completed sale.
            No hidden platform fees.
          </div>

          <div className="bubble-list-container">
            <h3>Marketplace fee structure</h3>
            <div className="list-item infopage">
              <div className="text-container">
                <h2>Listing fee</h2>
                <h4 className="gold">Charged when your listing is approved and goes live.</h4>
              </div>
              <div className="p2">Per listing</div>
            </div>
            <hr />
            <div className="list-item infopage">
              <div className="text-container">
                <h2>Sale commission</h2>
                <h4 className="gold">Deducted from seller's payout when a sale completes. Buyers pay the listed price + tax.</h4>
              </div>
              <div className="p2">% of final sale</div>
            </div>
            <hr />
            <div className="list-item infopage">
              <div className="text-container">
                <h2>Relisting</h2>
                <h4 className="gold">Unsold listings that are unlisted after 14 days in the marketplace can be resubmitted.</h4>
              </div>
              <div className="p2">After 14 days</div>
            </div>
          </div>
        </section>
        
        <div className="infopage-cta">
          <div className="cta-text-container">
            <div className="p2">Ready to list an ingredient?</div>
            <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>Fill out the product listing form.
              Our team will review all submissions within 1-2 business days.
            </div>
          </div>
          <button className="list-button">List Product</button>
        </div>
      </div>
      <Footer />
    </>
  );
}