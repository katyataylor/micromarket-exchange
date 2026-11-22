import {
  clearAuthSession,
  PENDING_REGISTRATION_KEY,
  signOutAndRedirect,
  useAuth,
} from '../auth';
import { SELLER_LISTINGS_STORAGE_KEY } from '../data/sellerListings';

const DEMO_STORAGE_KEYS = [
  'mme_cart',
  'mme_watchlist',
  'mme_bids',
  'mme_orders',
  'mme_listing_draft',
  'mme_submitted_listings',
  SELLER_LISTINGS_STORAGE_KEY,
  'mme_account_profile',
  'mme_session',
  PENDING_REGISTRATION_KEY,
] as const;

export function Footer() {
  const { isAuthenticated, memberHref } = useAuth();

  function handleResetDemo() {
    for (const key of DEMO_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    clearAuthSession();
    window.location.href = '/homepage';
  }

  return (
    <footer>
      <section className="footer">
        <div className="footer-top">
          <a href="/homepage" className="logo-link">
            <img
              src="/images/small high-contrast mme logo.png"
              alt="White MicroMarket Exchange logo."
            />
          </a>
          <p>©2026 MicroMarket Exchange Inc.</p>
          <div className="icons">
            <a
              href="mailto:support@micromarketexchange.com"
              aria-label="Email MicroMarket Exchange"
            >
              <img src="/images/email icon.png" alt="Email MicroMarket Exchange" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MicroMarket Exchange on Facebook"
            >
              <img
                src="/images/2023_Facebook_icon.svg.png"
                alt="MicroMarket Exchange Facebook page"
              />
            </a>
          </div>
        </div>
        <hr />
        <div className="footer-bottom">
          <ul>
            {isAuthenticated ? (
              <li>
                <a href="/marketplace">Marketplace</a>
              </li>
            ) : (
              <li>
                <a href="/login">Login</a>
                {' / '}
                <a href="/registration">Sign Up</a>
              </li>
            )}
            <li>
              <a href="/infopage">FAQ</a>
            </li>
            <li>
              <a href={memberHref('/list-product')}>List Your Products</a>
            </li>
            <li>
              <a href={memberHref('/account')}>Account Portal</a>
            </li>
            <li>
              <a href="/contactpage">Contact Us</a>
            </li>
            {isAuthenticated && (
              <li>
                <button
                  type="button"
                  className="footer-reset-btn"
                  onClick={() => signOutAndRedirect('/homepage')}
                >
                  Log Out
                </button>
              </li>
            )}
            <li>
              <button type="button" className="footer-reset-btn" onClick={handleResetDemo}>
                Reset Demo
              </button>
            </li>
          </ul>
        </div>
      </section>
    </footer>
  );
}
