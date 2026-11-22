import { useAuth } from './auth';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function NotFound() {
  const { memberHref } = useAuth();

  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="eyebrow" style={{ color: 'var(--brandGold)' }}>404 error</div>
            <div className="display">Page not found</div>
            <div className="p2" style={{ color: 'var(--textDarkBackground)' }}>
              The page or listing you requested could not be found. Browse active listings or return to the homepage.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
              <a href={memberHref('/marketplace')} className="store-hero-button" style={{ marginLeft: 0 }}>
                Browse Marketplace
              </a>
              <a
                href="/homepage"
                className="store-hero-button"
                style={{ marginLeft: 0, borderColor: 'rgba(255, 255, 255, 0.7)', color: 'var(--textWhite)' }}
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
