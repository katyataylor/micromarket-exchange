import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function RegistrationSuccess() {
  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text">
            <h6 className="gold">account Registration</h6>
            <div className="display">Welcome to MicroMarket Exchange</div>
            <div className="p2">
              List your overstock and bid on auctions from our verified sellers.
            </div>
          </div>
        </div>
      </section>

      <div className="page-body">
        <section className="w-bubble-container reg-success-section">

          {/* Verification notice */}
          <div className="reg-success-notice">
            <p className="reg-success-notice-text">
              All trading accounts require verification before activation. Our team will review
              your documentation and approve or follow up within 2 business days. Third-party
              memberships are approved automatically upon email confirmation.
            </p>
          </div>

          {/* CTA */}
          <div className="reg-success-cta-wrap">
            <div className="reg-success-cta">
              <div className="reg-success-cta-text">
                <p className="reg-success-cta-title">View Marketplace</p>
                <p className="reg-success-cta-body">
                  While your trading account is reviewed by our team we welcome you to browse
                  through products currently up for auction in our marketplace.
                </p>
              </div>
              <a href="/marketplace" className="reg-success-btn">View Marketplace</a>
            </div>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}
