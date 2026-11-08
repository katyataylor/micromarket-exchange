import { Footer } from './partials/footer';
import { Header } from './partials/header';

const accountCards = [
  {
    title: 'My Listings',
    description: 'View approval status, re-list and manage your listed products.',
  },
  {
    title: 'Account Support',
    description: 'Troubleshoot account-related issues. Get customer support.',
  },
  {
    title: 'My Messages',
    description: 'View, respond to messages from sellers, buyers & MicroMarket.',
  },
  {
    title: 'My Orders',
    description: 'Track, return, or cancel orders. Invoices, documents & receipts.',
  },
  {
    title: 'Login & Passwords',
    description: 'Account security details — view, or change your login information.',
  },
  {
    title: 'Manage Transactions',
    description: 'View transactions, manage payment methods & settings.',
  },
  {
    title: 'My Subscription',
    description: 'Current plan information. Change or cancel your current plan.',
  },
  {
    title: 'Account Details',
    description: 'Edit name, business information, address, email & phone number.',
  },
] as const;

export function Account() {
  return (
    <>
      <Header />

      <div className="account-page">

        {/* ── Main content ─────────────────────────── */}
        <div className="account-outer">
          <div className="account-inner">

            {/* Header text */}
            <div className="account-header">
              <p className="account-eyebrow">My Account</p>
              <p className="account-subtitle">
                Access your account details, track your sales and orders, communicate with sellers
                and reach out to us with any issue. MicroMarket Exchange is committed to making
                this platform a useful tool for business owners.
              </p>
            </div>

            {/* Navigation card grid */}
            <div className="account-grid">
              {accountCards.map((card) => (
                <div className="account-card" key={card.title}>
                  <p className="account-card-title">{card.title}</p>
                  <p className="account-card-desc">{card.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HR separator */}
          <div className="account-rule-container">
            <hr className="account-rule" />
          </div>
        </div>

        {/* ── CTA section ──────────────────────────── */}
        <div className="account-cta-outer">
          <div className="account-cta-card">
            <div className="account-cta-text">
              <p className="account-cta-title">Ready to list an ingredient?</p>
              <p className="account-cta-body">
                Fill out the product listing form. Our team will review
                all submissions within 1–2 business days.
              </p>
            </div>
            <a href="/list-product" className="account-cta-btn">List Product</a>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
