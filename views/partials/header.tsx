// Header
import { useEffect, useRef, useState } from 'react';
export function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!navRef.current || !toggleRef.current) return;
      const isClickInside = navRef.current.contains(target) || toggleRef.current.contains(target);
      if (!isClickInside) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return (
    <nav>
      <div className="nav-content">
        <a href="/homepage" className="logo-link">
          <img src="/images/small-mme-logo.png" alt="Small yellow MicroMarket logo." />
        </a>
        <button
          ref={toggleRef}
          className={`menu-toggle${open ? ' active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" className="line-mid" />
            <line x1="4" y1="6" x2="20" y2="6" className="line-top" />
            <line x1="4" y1="18" x2="20" y2="18" className="line-bottom" />
          </svg>
        </button>
        <div ref={navRef} className={`nav-right${open ? ' is-active active' : ''}`}>
          <div className="nav-links">
            <ul>
              <li><a href="/marketplace">Buy</a></li>
              <li><a href="/infoPage">Sell</a></li>
              <li><a href="/account">My Account</a></li>
              <li><a href="/registration">Sign Up/Login</a></li>
            </ul>
          </div>
          <button className="contact-button" onClick={() => { window.location.href = '/contact'; }}>Contact Us</button>
        </div>
      </div>
    </nav>
  );
}