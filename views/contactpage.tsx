import { useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
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

              {submitted ? (
                <div className="contact-success">
                  <h3>Message sent!</h3>
                  <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>
                    Thank you for reaching out. We'll get back to you within 1–2 business days.
                  </div>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-group">
                    <div className="contact-input-row">
                      <input
                        className="subH1 contact-small-input"
                        type="text"
                        placeholder="First name"
                        required
                      />
                      <input
                        className="subH1 contact-small-input"
                        type="text"
                        placeholder="Last name"
                        required
                      />
                    </div>

                    <input
                      className="subH1 contact-full-input"
                      type="email"
                      placeholder="Email address"
                      required
                    />

                    <textarea
                      className="subH1 contact-textarea"
                      placeholder="Your message…"
                      required
                    />
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
