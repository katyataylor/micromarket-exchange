import { useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

const STEPS = [
  { n: 1, label: 'Product\ninfo' },
  { n: 2, label: 'Lot &\nVolume' },
  { n: 3, label: 'Documentation' },
  { n: 4, label: 'Photos' },
  { n: 5, label: 'Review &\nSubmit' },
];

function SectionHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="pl-section-title-block">
      <div className="pl-section-title-row">
        <div className="pl-step-circle">{n}</div>
        <div className="pl-section-text">
          <p className="pl-section-title">{title}</p>
          <p className="pl-section-sub">{subtitle}</p>
        </div>
      </div>
      <hr className="pl-section-rule" />
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="pl-field-label">
      {children}
      {required && <span className="pl-required"> *</span>}
    </p>
  );
}

function TextInput({ placeholder, tall }: { placeholder: string; tall?: boolean }) {
  return tall ? (
    <textarea className="pl-input pl-input--tall" placeholder={placeholder} />
  ) : (
    <input type="text" className="pl-input" placeholder={placeholder} />
  );
}

function UploadBox({ title, hint, accept, tags }: {
  title: string;
  hint: string;
  accept: string;
  tags: string[];
}) {
  return (
    <div className="pl-upload-field">
      <div className="pl-upload-box">
        <label className="pl-upload-label" htmlFor={`upload-${title}`}>
          <div className="pl-upload-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 6v18M9 15l9-9 9 9" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 30h24" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pl-upload-text">
            <span className="pl-upload-click">Click to upload</span>
            {' '}
            <span className="pl-upload-drop">or drag and drop</span>
          </div>
          <div className="pl-upload-tags">
            {tags.map((t) => <span key={t} className="pl-tag">{t}</span>)}
          </div>
          <input id={`upload-${title}`} type="file" accept={accept} className="pl-upload-input" />
        </label>
      </div>
      <p className="pl-upload-hint">{hint}</p>
    </div>
  );
}

export function ListProduct() {
  const [lotRows, setLotRows] = useState<string[]>(['']);

  function addLotRow() {
    setLotRows((prev) => [...prev, '']);
  }

  function updateLotRow(index: number, value: string) {
    setLotRows((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeLotRow(index: number) {
    setLotRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <Header />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="pl-hero">
        <div className="pl-hero-inner">
          <div className="pl-hero-text">
            <p className="pl-hero-eyebrow">Seller Portal</p>
            <h1 className="pl-hero-title">Submit a new listing</h1>
            <p className="pl-hero-subtitle">
              MicroMarket Exchange is built exclusively for licensed agricultural operations.
              Every buyer and seller on our platform is verified before they can transact,
              so you always know who you're dealing with.
            </p>
          </div>

          <div className="pl-steps">
            {STEPS.map(({ n, label }) => (
              <div className="pl-step" key={n}>
                <div className="pl-step-bullet">{n}</div>
                <p className="pl-step-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Required-fields notice ────────────────── */}
      <div className="pl-required-banner-wrap">
        <div className="pl-required-banner">
          <ul>
            <li>
              All fields marked with <span className="pl-req-star">*</span> are required.
              Your listing will not be approved without complete documentation including
              spec sheet, SDS, and certificate of analysis.
            </li>
          </ul>
        </div>
      </div>

      {/* ── Form sections ────────────────────────── */}
      <div className="pl-form-wrap">
        <div className="pl-form-sections">

          {/* ── §1 Product information ────────────── */}
          <div className="pl-card">
            <div className="pl-card-inner">
              <SectionHeader
                n={1}
                title="Product information"
                subtitle="Basic details about the ingredient you're listing for sale."
              />
              <div className="pl-fields">
                <div className="pl-field">
                  <FieldLabel required>Product name</FieldLabel>
                  <TextInput placeholder="e.g. Micro Ingredient Example" />
                </div>

                <div className="pl-field-row">
                  <div className="pl-field pl-field--half">
                    <FieldLabel required>Manufacturer / producer</FieldLabel>
                    <TextInput placeholder="Business name" />
                  </div>
                  <div className="pl-field pl-field--half">
                    <FieldLabel>Product category</FieldLabel>
                    <TextInput placeholder="Select a category" />
                  </div>
                </div>

                <div className="pl-field">
                  <FieldLabel required>Product description</FieldLabel>
                  <TextInput
                    placeholder="Describe the product: grade, quality characteristics, intended use, any relevant certifications or storage history..."
                    tall
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── §2 Lot numbers & volume ───────────── */}
          <div className="pl-card">
            <div className="pl-card-inner">
              <SectionHeader
                n={2}
                title="Lot numbers & volume"
                subtitle="Enter all lot numbers included in this listing and the total volume available."
              />
              <div className="pl-fields">
                <div className="pl-field">
                  <FieldLabel required>Lot number(s)</FieldLabel>
                  <div className="pl-lot-inputs">
                    {lotRows.map((val, i) => (
                      <div className="pl-lot-row" key={i}>
                        <input
                          type="text"
                          className="pl-input pl-input--lot"
                          placeholder="Enter a lot number"
                          value={val}
                          onChange={(e) => updateLotRow(i, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLotRow(); } }}
                        />
                        {lotRows.length > 1 && (
                          <button
                            type="button"
                            className="pl-lot-remove-row"
                            onClick={() => removeLotRow(i)}
                            aria-label="Remove lot"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="pl-btn-add-lot" type="button" onClick={addLotRow}>
                    + Add lot
                  </button>
                  <p className="pl-field-hint">
                    Add each lot number separately. Multiple lots can be included in one listing.
                  </p>
                </div>

                <div className="pl-field-row">
                  <div className="pl-field pl-field--half">
                    <FieldLabel required>Total volume available</FieldLabel>
                    <TextInput placeholder="0.00" />
                  </div>
                  <div className="pl-field pl-field--half">
                    <FieldLabel required>Unit of measure</FieldLabel>
                    <TextInput placeholder="Select unit" />
                  </div>
                </div>

                <div className="pl-field-row">
                  <div className="pl-field pl-field--half">
                    <FieldLabel>Packaging type</FieldLabel>
                    <TextInput placeholder="Select packaging" />
                  </div>
                  <div className="pl-field pl-field--half">
                    <FieldLabel>Asking price</FieldLabel>
                    <TextInput placeholder="0.00" />
                  </div>
                </div>
                <p className="pl-price-hint">
                  Per unit of measure selected above. Leave blank to list as auction.
                </p>
              </div>
            </div>
          </div>

          {/* ── §3 Required documentation ─────────── */}
          <div className="pl-card">
            <div className="pl-card-inner">
              <SectionHeader
                n={3}
                title="Required documentation"
                subtitle="All three documents below are required. Listings submitted without complete documentation will not be approved."
              />
              <div className="pl-fields">
                <FieldLabel required>Specification sheet</FieldLabel>
                <UploadBox
                  title="spec"
                  hint="Product specifications including nutritional analysis, physical characteristics, and guaranteed analysis."
                  accept=".pdf,.doc,.docx"
                  tags={['PDF', 'DOC', 'DOCX']}
                />

                <FieldLabel required>Safety data sheet (SDS)</FieldLabel>
                <UploadBox
                  title="sds"
                  hint="Current OSHA-format SDS. Must correspond to the lot numbers listed above."
                  accept=".pdf,.doc,.docx"
                  tags={['PDF', 'DOC', 'DOCX']}
                />

                <FieldLabel required>Certificate of analysis (COA)</FieldLabel>
                <UploadBox
                  title="coa"
                  hint="Lab-certified analysis matching the lot numbers on this listing. Must be dated within 12 months."
                  accept=".pdf,.doc,.docx"
                  tags={['PDF', 'DOC', 'DOCX']}
                />
              </div>
            </div>
          </div>

          {/* ── §4 Product photos ─────────────────── */}
          <div className="pl-card">
            <div className="pl-card-inner">
              <SectionHeader
                n={4}
                title="Product photos"
                subtitle="Clear, accurate photos of the actual product and packaging. Blurry, misleading, or stock images will not be approved."
              />
              <div className="pl-fields">
                <FieldLabel required>Product and packaging photos</FieldLabel>
                <div className="pl-upload-box pl-upload-box--photos">
                  <label className="pl-upload-label" htmlFor="upload-photos">
                    <div className="pl-upload-icon pl-upload-icon--photo">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect x="3" y="8" width="30" height="22" rx="3" stroke="#9bb8bf" strokeWidth="2.5" />
                        <circle cx="18" cy="19" r="6" stroke="#9bb8bf" strokeWidth="2.5" />
                        <path d="M13 8l2-4h6l2 4" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="pl-upload-text pl-upload-text--photos">
                      <span className="pl-upload-heading">Upload product photos</span>
                      <span className="pl-upload-sub">
                        <span className="pl-upload-click">Click to upload</span>
                        {' '}
                        <span className="pl-upload-drop">or drag and drop — Up to 10 images</span>
                      </span>
                    </div>
                    <div className="pl-upload-tags">
                      {['JPG', 'PNG', 'WEBP'].map((t) => <span key={t} className="pl-tag">{t}</span>)}
                    </div>
                    <input id="upload-photos" type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="pl-upload-input" />
                  </label>
                </div>
                <p className="pl-upload-hint">
                  Include: product close-up, packaging label, lot number visible on packaging, and overall condition. Minimum 3 photos.
                </p>
              </div>
            </div>
          </div>

          {/* ── §5 Additional notes ───────────────── */}
          <div className="pl-card">
            <div className="pl-card-inner">
              <SectionHeader
                n={5}
                title="Additional notes"
                subtitle="Anything else buyers should know — storage conditions, pickup/delivery details, expiry, etc."
              />
              <div className="pl-fields">
                <div className="pl-field">
                  <FieldLabel>Seller notes</FieldLabel>
                  <textarea
                    className="pl-input pl-input--notes"
                    placeholder="e.g. Stored in climate-controlled warehouse. Available for pickup or freight arrangements. Product expired MM/YYYY"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Submit card ───────────────────────── */}
          <div className="pl-card">
            <div className="pl-submit-row">
              <div className="pl-submit-text">
                <p className="pl-submit-title">Ready to submit?</p>
                <p className="pl-submit-body">
                  Your listing will be reviewed before going live.
                  You'll receive an email with the outcome within 1–2 business days.
                </p>
              </div>
              <div className="pl-submit-actions">
                <button type="button" className="pl-btn-outline">Save Draft</button>
                <button type="submit" className="pl-btn-outline">Submit</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
