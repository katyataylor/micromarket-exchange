import { type FormEvent, useEffect, useState } from 'react';
import {
  PENDING_REGISTRATION_KEY,
  sanitizeNextPath,
  signInMember,
} from './auth';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

function describeGatedDestination(nextPath: string): string {
  if (nextPath.startsWith('/product')) return 'product listing details and live bidding';
  if (nextPath.startsWith('/cart')) return 'your Cart & Watchlist';
  if (nextPath.startsWith('/list-product') || nextPath.startsWith('/sell')) {
    return 'the Seller Listing Portal';
  }
  if (nextPath.startsWith('/account')) return 'your Member Account Portal';
  return 'the MicroMarket Exchange Marketplace';
}

export function Login({ nextUrl }: { nextUrl?: string | null }) {
  const [targetNext, setTargetNext] = useState<string | null>(() => sanitizeNextPath(nextUrl));
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryFeedback, setRecoveryFeedback] = useState<string | null>(null);

  useEffect(() => {
    const queryNext = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'));
    if (queryNext) {
      setTargetNext(queryNext);
    }

    try {
      const pendingRaw = localStorage.getItem(PENDING_REGISTRATION_KEY);
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw) as { email?: string; username?: string };
        const suggested = pending.email || pending.username;
        if (suggested) {
          setIdentifier((prev) => (prev ? prev : suggested));
        }
      }
    } catch {
      // Ignore malformed pending registration metadata
    }
  }, []);

  function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedId = identifier.trim();

    if (!trimmedId || trimmedId.length < 3) {
      setError('Please enter your registered business email or username.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your password (minimum 6 characters).');
      return;
    }

    const isEmail = trimmedId.includes('@');
    let derivedName = isEmail
      ? trimmedId
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : trimmedId;
    let membership: 'trade' | 'viewonly' | undefined;

    try {
      const pendingRaw = localStorage.getItem(PENDING_REGISTRATION_KEY);
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw) as {
          username?: string;
          email?: string;
          name?: string;
          membership?: 'trade' | 'viewonly';
        };
        if (
          pending.name &&
          (pending.email?.toLowerCase() === trimmedId.toLowerCase() ||
            pending.username?.toLowerCase() === trimmedId.toLowerCase())
        ) {
          derivedName = pending.name;
          membership = pending.membership;
        }
      }
    } catch {
      // Ignore malformed storage
    }

    signInMember({
      username: trimmedId,
      email: isEmail ? trimmedId : `${trimmedId}@verifiedmill.com`,
      name: derivedName,
      membership,
      rememberMe,
      signedInAt: new Date().toISOString(),
    });

    setError(null);
    const destination = sanitizeNextPath(targetNext) ?? '/marketplace';
    window.location.href = destination;
  }

  function handleRecoverySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())) {
      setRecoveryFeedback('Enter a valid registered email address to receive a reset link.');
      return;
    }
    setRecoveryFeedback(
      `If an account matches ${recoveryEmail.trim()}, password reset instructions have been sent.`,
    );
  }

  function fillDemoCredentials() {
    setIdentifier('purchasing@prairiefeedmill.com');
    setPassword('MicroMarket2026!');
    setError(null);
  }

  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text">
            <h6 className="gold">account sign in</h6>
            <div className="display">Sign in to MicroMarket Exchange</div>
            <div className="p2">
              Access your verified trading portal, manage active bids and product listings,
              or browse current agricultural microingredient stock.
            </div>
          </div>
        </div>
      </section>

      <div className="page-body">
        <div className="p2 page-text">
          New to MicroMarket Exchange? <a href="/registration">Apply for membership</a>
        </div>

        {targetNext && (
          <div className="login-paywall-notice" role="status">
            <p className="login-paywall-title">Member login required</p>
            <p className="login-paywall-body">
              Please sign in with a verified MicroMarket Exchange account to access{' '}
              <strong>{describeGatedDestination(targetNext)}</strong>. Reviewing the prototype?
              Click <strong>Use demo credentials</strong> below to unlock full member access.
            </p>
          </div>
        )}

        <section className="w-bubble-container login-card-container">
          <div className="login-card-inner">
            <div className="login-header-row">
              <div>
                <h3>Member Sign In</h3>
                <p className="subp1">
                  Enter the credentials associated with your verified operation or observer account.
                </p>
              </div>
              <button
                type="button"
                className="reg-sample-file-btn"
                onClick={fillDemoCredentials}
              >
                Use demo credentials
              </button>
            </div>

            <hr style={{ marginTop: 20, marginBottom: 24 }} />

            <form className="login-form" onSubmit={handleSignIn} noValidate>
              <div className="input-column">
                <label htmlFor="login-identifier">
                  <h4>Business email or username *</h4>
                </label>
                <input
                  id="login-identifier"
                  className="subH1 reg-field-input login-full-input"
                  type="text"
                  autoComplete="username"
                  placeholder="you@yourcompany.com or username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>

              <div className="input-column">
                <label htmlFor="login-password">
                  <h4>Password *</h4>
                </label>
                <input
                  id="login-password"
                  className="subH1 reg-field-input login-full-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>

              <div className="login-options-row">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in on this device</span>
                </label>

                <button
                  type="button"
                  className="login-forgot-btn"
                  onClick={() => {
                    setRecoveryOpen((prev) => !prev);
                    setRecoveryFeedback(null);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="login-error-box" role="alert">
                  {error}
                </p>
              )}

              <div className="login-submit-row">
                <button type="submit" className="login-submit-btn">
                  Sign In
                </button>
                <a href="/registration" className="login-register-link">
                  Create an Account
                </a>
              </div>
            </form>

            {recoveryOpen && (
              <form className="login-recovery-box" onSubmit={handleRecoverySubmit} noValidate>
                <p className="login-recovery-title">Reset your password</p>
                <p className="subp1">
                  Enter your registered business email and we&apos;ll send a verification reset link.
                </p>
                <div className="login-recovery-controls">
                  <input
                    type="email"
                    className="subH1 reg-field-input login-full-input"
                    placeholder="you@yourcompany.com"
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      if (recoveryFeedback) setRecoveryFeedback(null);
                    }}
                  />
                  <button type="submit" className="submit-button login-recovery-btn">
                    Send Reset Link
                  </button>
                </div>
                {recoveryFeedback && (
                  <p className="login-recovery-feedback" role="status">
                    {recoveryFeedback}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
