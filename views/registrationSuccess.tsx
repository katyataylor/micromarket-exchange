import { useAuth } from './auth';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function RegistrationSuccess() {
  const { memberHref } = useAuth();

  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text">
            <h6 className="gold">ACCOUNT REGISTRATION</h6>
            <div className="display">Welcome to MicroMarket Exchange</div>
            <div className="p2">
              List your overstock and bid on auctions from our verified sellers.
            </div>
          </div>
        </div>
      </section>

      <div className="page-body">
        <section className="reg-success-section">

          {/* Verification notice */}
          <div className="disclosure-container reg-success-notice">
            <ul className="reg-success-notice-list">
              <li className="reg-success-notice-text">
                All trading accounts require verification before activation. Our team will review
                your documentation and approve or follow up within 2 business days. Third-party
                memberships are approved automatically upon email confirmation.
              </li>
            </ul>
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
              <a href={memberHref('/marketplace')} className="reg-success-btn">
                View Store
              </a>
            </div>
          </div>

        </section>
      </div>

      <Footer />
    </>
  );
}
