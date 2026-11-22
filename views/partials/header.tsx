import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { signOutAndRedirect, useAuth } from '../auth';

const ACCOUNT_MENU_ITEMS = [
  { label: 'My Cart', href: '/cart#cart', cartSection: 'cart' as const },
  { label: 'Watchlist', href: '/cart#watchlist', cartSection: 'watchlist' as const },
  { label: 'Account Tools', href: '/account' },
  { label: 'List a product', href: '/list-product' },
] as const;

export type HeaderProps = {
  simple?: boolean;
};

export function Header(_props?: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const enteredDropdownRef = useRef(false);

  const closeAccountMenu = () => {
    enteredDropdownRef.current = false;
    setAccountMenuOpen(false);
  };

  const toggleAccountMenu = () => {
    setAccountMenuOpen((prev) => {
      enteredDropdownRef.current = false;
      return !prev;
    });
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!navRef.current || !toggleRef.current) return;
      const isClickInside =
        navRef.current.contains(target) || toggleRef.current.contains(target);
      if (!isClickInside) {
        setOpen(false);
        closeAccountMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAccountMenu();
        setOpen(false);
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      closeAccountMenu();
    }
  }, [isAuthenticated]);

  const handleMenuItemClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    item: (typeof ACCOUNT_MENU_ITEMS)[number],
  ) => {
    closeAccountMenu();
    setOpen(false);

    if ('cartSection' in item && item.cartSection && window.location.pathname === '/cart') {
      event.preventDefault();
      window.history.pushState(null, '', item.href);
      window.dispatchEvent(
        new CustomEvent('mme:cart-navigate', { detail: { section: item.cartSection } }),
      );
    }
  };

  const handleSignOut = () => {
    closeAccountMenu();
    setOpen(false);
    signOutAndRedirect('/homepage');
  };

  return (
    <nav data-auth-mode={isAuthenticated ? 'member' : 'guest'}>
      <div className="nav-content">
        <a href="/homepage" className="logo-link">
          <img src="/images/small-mme-logo.png" alt="MicroMarket Exchange logo" />
        </a>
        <button
          ref={toggleRef}
          type="button"
          className={`menu-toggle${open ? ' active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="12" x2="20" y2="12" className="line-mid" />
            <line x1="4" y1="6" x2="20" y2="6" className="line-top" />
            <line x1="4" y1="18" x2="20" y2="18" className="line-bottom" />
          </svg>
        </button>

        {isAuthenticated ? (
          <div ref={navRef} className={`nav-right${open ? ' is-active active' : ''}`}>
            <div className="nav-links">
              <ul>
                <li>
                  <a href="/marketplace" onClick={() => setOpen(false)}>
                    Marketplace
                  </a>
                </li>
                <li>
                  <a href="/list-product" onClick={() => setOpen(false)}>
                    List a product
                  </a>
                </li>
                <li>
                  <a href="/infopage" onClick={() => setOpen(false)}>
                    FAQ
                  </a>
                </li>
                <li
                  className={`nav-account-item${accountMenuOpen ? ' is-open' : ''}`}
                  onMouseLeave={closeAccountMenu}
                >
                  <button
                    type="button"
                    className="nav-account-trigger"
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    onClick={toggleAccountMenu}
                  >
                    <span>My Account</span>
                    <svg
                      className="nav-account-caret"
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M0.75 0.75L6.8 6.75L13.25 0.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                  {accountMenuOpen && (
                    <>
                      <div className="nav-account-bridge" aria-hidden="true" />
                      <div
                        className="nav-account-menu"
                        role="menu"
                        aria-label="My Account"
                        onMouseEnter={() => {
                          enteredDropdownRef.current = true;
                        }}
                        onMouseLeave={closeAccountMenu}
                      >
                        {ACCOUNT_MENU_ITEMS.map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            role="menuitem"
                            className="nav-account-menu-link"
                            onClick={(event) => handleMenuItemClick(event, item)}
                          >
                            {item.label}
                          </a>
                        ))}
                        <div className="nav-account-menu-divider" role="separator" />
                        <button
                          type="button"
                          role="menuitem"
                          className="nav-account-menu-link nav-account-signout"
                          onClick={handleSignOut}
                        >
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </li>
              </ul>
            </div>
            <a href="/contact" className="contact-button" onClick={() => setOpen(false)}>
              Contact Us
            </a>
          </div>
        ) : (
          <div
            ref={navRef}
            className={`nav-right nav-right--guest${open ? ' is-active active' : ''}`}
          >
            <div className="nav-links">
              <ul>
                <li>
                  <a href="/infopage" onClick={() => setOpen(false)}>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/registration" onClick={() => setOpen(false)}>
                    Create Account
                  </a>
                </li>
              </ul>
            </div>
            <a
              href="/login"
              className="contact-button nav-login-button"
              onClick={() => setOpen(false)}
            >
              Login
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
