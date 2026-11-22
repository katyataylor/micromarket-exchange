import { type FormEvent, useEffect, useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [listingContext, setListingContext] = useState<{
    listing: string;
    seller?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const listing = params.get('listing')?.trim();
    const seller = params.get('seller')?.trim() || undefined;
    if (listing) {
      setListingContext({ listing, seller });
      setMessage((prev) =>
        prev
          ? prev
          : `Hello${seller ? ` ${seller}` : ''}, I have a question regarding "${listing}": `,
      );
    }
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your first and last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message before sending.');
      return;
    }

    setError(null);
    setSubmittedRef(`MME-INQ-2026-${Math.floor(2100 + Math.random() * 7000)}`);
  }

  return (
    <>
      <Header />

      <main className="contact-page-body">
        <section className="contact-container">
          <div className="contact-content">
            <h1 className="contact-heading">Contact Us</h1>

            <div className="contact-form-section">
              <hr className="contact-divider" />

              {submittedRef ? (
                <div className="contact-success" role="status">
                  <p className="contact-success-eyebrow">Inquiry {submittedRef}</p>
                  <h3>Message sent!</h3>
                  <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>
                    Thank you for reaching out, {firstName.trim()}. We&apos;ve sent a copy to{' '}
                    <strong>{email.trim()}</strong> and will follow up within 1–2 business days.
                  </div>
                  <div className="contact-success-actions">
                    <button
                      type="button"
                      className="contact-submit-button"
                      onClick={() => {
                        setSubmittedRef(null);
                        setMessage('');
                      }}
                    >
                      Send Another Message
                    </button>
                    <a href="/marketplace" className="contact-secondary-link">
                      Browse Marketplace
                    </a>
                  </div>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  {listingContext && (
                    <div className="contact-context-pill">
                      <span>
                        Inquiry regarding <strong>{listingContext.listing}</strong>
                        {listingContext.seller ? ` (${listingContext.seller})` : ''}
                      </span>
                    </div>
                  )}

                  <div className="contact-form-group">
                    <div className="contact-input-row">
                      <input
                        className="subH1 contact-small-input contact-live-input"
                        type="text"
                        placeholder="First name"
                        aria-label="First name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (error) setError(null);
                        }}
                      />
                      <input
                        className="subH1 contact-small-input contact-live-input"
                        type="text"
                        placeholder="Last name"
                        aria-label="Last name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (error) setError(null);
                        }}
                      />
                    </div>

                    <input
                      className="subH1 contact-full-input contact-live-input"
                      type="email"
                      placeholder="Email address"
                      aria-label="Email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                    />

                    <textarea
                      className="subH1 contact-textarea contact-live-input"
                      placeholder="Your message…"
                      aria-label="Your message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (error) setError(null);
                      }}
                    />

                    {error && (
                      <p className="contact-error-banner" role="alert">
                        {error}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="contact-submit-button">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
