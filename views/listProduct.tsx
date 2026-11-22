import { type DragEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

const STEPS = [
  { n: 1, label: 'Product\ninfo' },
  { n: 2, label: 'Lot &\nVolume' },
  { n: 3, label: 'Documentation' },
  { n: 4, label: 'Photos' },
  { n: 5, label: 'Review &\nSubmit' },
];

const CATEGORY_OPTIONS = [
  'Amino Acids',
  'Protein Supplements',
  'Energy Feeds',
  'Roughage & Silage',
  'Vitamins & Premixes',
  'Minerals & Trace Elements',
  'Specialty / Other',
] as const;

const UNIT_OPTIONS = [
  'Pounds (lbs)',
  'Kilograms (kg)',
  'Grams (g)',
  'Metric Tons (MT)',
] as const;

const PACKAGING_OPTIONS = [
  'Bulk',
  '50 lb Multi-Wall Bags',
  'FIBC Super Sacks / Totes',
  'Bales',
  'Drums / Pails',
  'Pneumatic Tanker',
] as const;

export type SubmittedListingRecord = {
  referenceId: string;
  submittedAt: string;
  productName: string;
  manufacturer: string;
  category: string;
  lotNumbers: string[];
  totalVolume: string;
  unitOfMeasure: string;
  packagingType: string;
  askingPrice: string;
  listingMode: 'Fixed Price' | 'Live Auction';
  documents: string[];
  photos: string[];
  status: 'Pending Compliance Review';
};

type ListingDraft = {
  productName: string;
  manufacturer: string;
  category: string;
  description: string;
  lotRows: string[];
  totalVolume: string;
  unitOfMeasure: string;
  packagingType: string;
  askingPrice: string;
  specFile: string;
  sdsFile: string;
  coaFile: string;
  photoFiles: string[];
  sellerNotes: string;
  savedAt: string;
};

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

function UploadBox({
  idSlug,
  hint,
  accept,
  tags,
  selectedFile,
  sampleFileName,
  onSelectFile,
  onClearFile,
}: {
  idSlug: string;
  hint: string;
  accept: string;
  tags: string[];
  selectedFile: string;
  sampleFileName: string;
  onSelectFile: (name: string) => void;
  onClearFile: () => void;
}) {
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      onSelectFile(dropped.name);
    }
  }

  return (
    <div className="pl-upload-field">
      <div
        className={`pl-upload-box${selectedFile ? ' pl-upload-box--filled' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <label className="pl-upload-label" htmlFor={`upload-${idSlug}`}>
          <div className="pl-upload-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 6v18M9 15l9-9 9 9" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 30h24" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pl-upload-text">
            {selectedFile ? (
              <span className="pl-upload-selected-name">Attached: {selectedFile} ✓</span>
            ) : (
              <>
                <span className="pl-upload-click">Click to upload</span>
                {' '}
                <span className="pl-upload-drop">or drag and drop</span>
              </>
            )}
          </div>
          <div className="pl-upload-tags">
            {tags.map((t) => <span key={t} className="pl-tag">{t}</span>)}
          </div>
          <input
            id={`upload-${idSlug}`}
            type="file"
            accept={accept}
            className="pl-upload-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelectFile(file.name);
            }}
          />
        </label>
      </div>
      <div className="pl-upload-meta-row">
        <p className="pl-upload-hint">{hint}</p>
        {selectedFile ? (
          <button type="button" className="pl-upload-helper-btn" onClick={onClearFile}>
            Remove file
          </button>
        ) : (
          <button
            type="button"
            className="pl-upload-helper-btn"
            onClick={() => onSelectFile(sampleFileName)}
          >
            Attach sample PDF
          </button>
        )}
      </div>
    </div>
  );
}

export function ListProduct() {
  const [productName, setProductName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [lotRows, setLotRows] = useState<string[]>(['']);
  const [totalVolume, setTotalVolume] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [packagingType, setPackagingType] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [specFile, setSpecFile] = useState('');
  const [sdsFile, setSdsFile] = useState('');
  const [coaFile, setCoaFile] = useState('');
  const [photoFiles, setPhotoFiles] = useState<string[]>([]);
  const [sellerNotes, setSellerNotes] = useState('');

  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedListingRecord | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mme_listing_draft');
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<ListingDraft>;
      if (draft.productName) setProductName(draft.productName);
      if (draft.manufacturer) setManufacturer(draft.manufacturer);
      if (draft.category) setCategory(draft.category);
      if (draft.description) setDescription(draft.description);
      if (Array.isArray(draft.lotRows) && draft.lotRows.length > 0) setLotRows(draft.lotRows);
      if (draft.totalVolume) setTotalVolume(draft.totalVolume);
      if (draft.unitOfMeasure) setUnitOfMeasure(draft.unitOfMeasure);
      if (draft.packagingType) setPackagingType(draft.packagingType);
      if (draft.askingPrice) setAskingPrice(draft.askingPrice);
      if (draft.specFile) setSpecFile(draft.specFile);
      if (draft.sdsFile) setSdsFile(draft.sdsFile);
      if (draft.coaFile) setCoaFile(draft.coaFile);
      if (Array.isArray(draft.photoFiles)) setPhotoFiles(draft.photoFiles);
      if (draft.sellerNotes) setSellerNotes(draft.sellerNotes);
      if (draft.savedAt) {
        setDraftNotice(`Restored draft saved ${draft.savedAt}.`);
      }
    } catch {
      // Ignore malformed draft data
    }
  }, []);

  function addLotRow() {
    setLotRows((prev) => [...prev, '']);
  }

  function updateLotRow(index: number, value: string) {
    setLotRows((prev) => prev.map((v, i) => (i === index ? value : v)));
    if (errors.length > 0) setErrors([]);
  }

  function removeLotRow(index: number) {
    setLotRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSaveDraft() {
    const savedAt = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    const payload: ListingDraft = {
      productName,
      manufacturer,
      category,
      description,
      lotRows,
      totalVolume,
      unitOfMeasure,
      packagingType,
      askingPrice,
      specFile,
      sdsFile,
      coaFile,
      photoFiles,
      sellerNotes,
      savedAt,
    };
    localStorage.setItem('mme_listing_draft', JSON.stringify(payload));
    setErrors([]);
    setDraftNotice(
      `Draft saved at ${savedAt}. Your progress is stored in this browser until you submit.`,
    );
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleClearDraft() {
    localStorage.removeItem('mme_listing_draft');
    setProductName('');
    setManufacturer('');
    setCategory('');
    setDescription('');
    setLotRows(['']);
    setTotalVolume('');
    setUnitOfMeasure('');
    setPackagingType('');
    setAskingPrice('');
    setSpecFile('');
    setSdsFile('');
    setCoaFile('');
    setPhotoFiles([]);
    setSellerNotes('');
    setDraftNotice(null);
    setErrors([]);
  }

  function handlePhotoDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []).map((f) => f.name);
    if (files.length > 0) {
      setPhotoFiles((prev) => Array.from(new Set([...prev, ...files])).slice(0, 10));
      if (errors.length > 0) setErrors([]);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: string[] = [];

    if (!productName.trim()) nextErrors.push('Product name is required.');
    if (!manufacturer.trim()) nextErrors.push('Manufacturer / producer is required.');
    if (!description.trim()) nextErrors.push('Product description is required.');

    const validLots = lotRows.map((l) => l.trim()).filter(Boolean);
    if (validLots.length === 0) nextErrors.push('At least one lot number is required.');

    const numericVolume = Number(totalVolume.replace(/[^0-9.]/g, ''));
    if (!totalVolume.trim() || !Number.isFinite(numericVolume) || numericVolume <= 0) {
      nextErrors.push('Enter a valid total volume greater than 0.');
    }
    if (!unitOfMeasure) nextErrors.push('Select a unit of measure.');

    if (askingPrice.trim()) {
      const numericPrice = Number(askingPrice.replace(/[^0-9.]/g, ''));
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        nextErrors.push('Asking price must be a positive number (or leave blank for auction).');
      }
    }

    if (!specFile) nextErrors.push('Specification sheet upload is required.');
    if (!sdsFile) nextErrors.push('Safety data sheet (SDS) upload is required.');
    if (!coaFile) nextErrors.push('Certificate of analysis (COA) upload is required.');
    if (photoFiles.length === 0) nextErrors.push('At least one product photo is required.');

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setDraftNotice(null);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    let existing: SubmittedListingRecord[] = [];
    try {
      const raw = localStorage.getItem('mme_submitted_listings');
      existing = raw ? (JSON.parse(raw) as SubmittedListingRecord[]) : [];
    } catch {
      existing = [];
    }

    const record: SubmittedListingRecord = {
      referenceId: `MME-LST-2026-${String(305 + existing.length).padStart(4, '0')}`,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      productName: productName.trim(),
      manufacturer: manufacturer.trim(),
      category: category || 'Feed Ingredient',
      lotNumbers: validLots,
      totalVolume: totalVolume.trim(),
      unitOfMeasure,
      packagingType: packagingType || 'Bulk',
      askingPrice: askingPrice.trim(),
      listingMode: askingPrice.trim() ? 'Fixed Price' : 'Live Auction',
      documents: [specFile, sdsFile, coaFile],
      photos: photoFiles,
      status: 'Pending Compliance Review',
    };

    localStorage.setItem('mme_submitted_listings', JSON.stringify([record, ...existing]));
    localStorage.removeItem('mme_listing_draft');

    setErrors([]);
    setDraftNotice(null);
    setSubmittedRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              so you always know who you&apos;re dealing with.
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

      {submittedRecord ? (
        <div className="pl-form-wrap">
          <div className="pl-form-sections">
            <div className="pl-card pl-confirmation-card" role="status">
              <div className="pl-card-inner">
                <p className="pl-confirm-eyebrow">Submission Received</p>
                <h2 className="pl-confirm-title">
                  Your listing has been submitted for compliance review
                </h2>
                <p className="pl-confirm-lead">
                  Reference <strong>{submittedRecord.referenceId}</strong> · Our verification team
                  reviews product specs, COA/SDS lot match, and packaging photos within 1–2 business
                  days before publishing live.
                </p>

                <div className="pl-confirm-grid">
                  <div className="pl-confirm-item">
                    <span>Product</span>
                    <strong>{submittedRecord.productName}</strong>
                  </div>
                  <div className="pl-confirm-item">
                    <span>Manufacturer</span>
                    <strong>{submittedRecord.manufacturer}</strong>
                  </div>
                  <div className="pl-confirm-item">
                    <span>Category</span>
                    <strong>{submittedRecord.category}</strong>
                  </div>
                  <div className="pl-confirm-item">
                    <span>Volume &amp; Packaging</span>
                    <strong>
                      {submittedRecord.totalVolume} {submittedRecord.unitOfMeasure} ·{' '}
                      {submittedRecord.packagingType}
                    </strong>
                  </div>
                  <div className="pl-confirm-item">
                    <span>Listing Format</span>
                    <strong>
                      {submittedRecord.listingMode}
                      {submittedRecord.askingPrice
                        ? ` ($${Number(submittedRecord.askingPrice).toFixed(2)})`
                        : ''}
                    </strong>
                  </div>
                  <div className="pl-confirm-item">
                    <span>Included Lot(s)</span>
                    <strong>{submittedRecord.lotNumbers.join(', ')}</strong>
                  </div>
                </div>

                <div className="pl-confirm-docs">
                  <p className="pl-confirm-docs-label">Verified attachments queued for review</p>
                  <ul>
                    {submittedRecord.documents.map((doc) => (
                      <li key={doc}>{doc} ✓</li>
                    ))}
                    <li>{submittedRecord.photos.length} product photo(s) attached ✓</li>
                  </ul>
                </div>

                <div className="pl-confirm-actions">
                  <button
                    type="button"
                    className="pl-btn-primary"
                    onClick={() => {
                      handleClearDraft();
                      setSubmittedRecord(null);
                    }}
                  >
                    Submit Another Listing
                  </button>
                  <a href="/marketplace" className="pl-btn-outline pl-btn-link">
                    Browse Marketplace
                  </a>
                  <a href="/account" className="pl-btn-outline pl-btn-link">
                    Go to My Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Required-fields notice ────────────────── */}
          <div className="pl-required-banner-wrap" ref={formTopRef}>
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
            <form className="pl-form-sections" onSubmit={handleSubmit} noValidate>
              {draftNotice && (
                <div className="pl-status-banner pl-status-banner--draft" role="status">
                  <span>{draftNotice}</span>
                  <button type="button" className="pl-status-action" onClick={handleClearDraft}>
                    Clear draft
                  </button>
                </div>
              )}

              {errors.length > 0 && (
                <div className="pl-status-banner pl-status-banner--error" role="alert">
                  <p className="pl-error-heading">
                    Please complete the following before submitting your listing:
                  </p>
                  <ul className="pl-error-list">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                      <input
                        type="text"
                        className="pl-input"
                        placeholder="e.g. L-Lysine HCl 98.5% Feed Grade"
                        value={productName}
                        onChange={(e) => {
                          setProductName(e.target.value);
                          if (errors.length > 0) setErrors([]);
                        }}
                      />
                    </div>

                    <div className="pl-field-row">
                      <div className="pl-field pl-field--half">
                        <FieldLabel required>Manufacturer / producer</FieldLabel>
                        <input
                          type="text"
                          className="pl-input"
                          placeholder="Business name"
                          value={manufacturer}
                          onChange={(e) => {
                            setManufacturer(e.target.value);
                            if (errors.length > 0) setErrors([]);
                          }}
                        />
                      </div>
                      <div className="pl-field pl-field--half">
                        <FieldLabel>Product category</FieldLabel>
                        <select
                          className={`pl-input pl-select${!category ? ' pl-select--placeholder' : ''}`}
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          aria-label="Product category"
                        >
                          <option value="">Select a category</option>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pl-field">
                      <FieldLabel required>Product description</FieldLabel>
                      <textarea
                        className="pl-input pl-input--tall"
                        placeholder="Describe the product: grade, quality characteristics, intended use, any relevant certifications or storage history..."
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (errors.length > 0) setErrors([]);
                        }}
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
                              placeholder="Enter a lot number (e.g. LOT-2026-0441)"
                              value={val}
                              onChange={(e) => updateLotRow(i, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addLotRow();
                                }
                              }}
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
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="pl-input"
                          placeholder="0.00"
                          value={totalVolume}
                          onChange={(e) => {
                            setTotalVolume(e.target.value);
                            if (errors.length > 0) setErrors([]);
                          }}
                        />
                      </div>
                      <div className="pl-field pl-field--half">
                        <FieldLabel required>Unit of measure</FieldLabel>
                        <select
                          className={`pl-input pl-select${!unitOfMeasure ? ' pl-select--placeholder' : ''}`}
                          value={unitOfMeasure}
                          onChange={(e) => {
                            setUnitOfMeasure(e.target.value);
                            if (errors.length > 0) setErrors([]);
                          }}
                          aria-label="Unit of measure"
                        >
                          <option value="">Select unit</option>
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pl-field-row">
                      <div className="pl-field pl-field--half">
                        <FieldLabel>Packaging type</FieldLabel>
                        <select
                          className={`pl-input pl-select${!packagingType ? ' pl-select--placeholder' : ''}`}
                          value={packagingType}
                          onChange={(e) => setPackagingType(e.target.value)}
                          aria-label="Packaging type"
                        >
                          <option value="">Select packaging</option>
                          {PACKAGING_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="pl-field pl-field--half">
                        <FieldLabel>Asking price</FieldLabel>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-input"
                          placeholder="0.00"
                          value={askingPrice}
                          onChange={(e) => setAskingPrice(e.target.value)}
                        />
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
                      idSlug="spec"
                      hint="Product specifications including nutritional analysis, physical characteristics, and guaranteed analysis."
                      accept=".pdf,.doc,.docx"
                      tags={['PDF', 'DOC', 'DOCX']}
                      selectedFile={specFile}
                      sampleFileName="Product-Specification-Sheet-2026.pdf"
                      onSelectFile={(name) => {
                        setSpecFile(name);
                        if (errors.length > 0) setErrors([]);
                      }}
                      onClearFile={() => setSpecFile('')}
                    />

                    <FieldLabel required>Safety data sheet (SDS)</FieldLabel>
                    <UploadBox
                      idSlug="sds"
                      hint="Current OSHA-format SDS. Must correspond to the lot numbers listed above."
                      accept=".pdf,.doc,.docx"
                      tags={['PDF', 'DOC', 'DOCX']}
                      selectedFile={sdsFile}
                      sampleFileName="Safety-Data-Sheet-OSHA-2026.pdf"
                      onSelectFile={(name) => {
                        setSdsFile(name);
                        if (errors.length > 0) setErrors([]);
                      }}
                      onClearFile={() => setSdsFile('')}
                    />

                    <FieldLabel required>Certificate of analysis (COA)</FieldLabel>
                    <UploadBox
                      idSlug="coa"
                      hint="Lab-certified analysis matching the lot numbers on this listing. Must be dated within 12 months."
                      accept=".pdf,.doc,.docx"
                      tags={['PDF', 'DOC', 'DOCX']}
                      selectedFile={coaFile}
                      sampleFileName="Certificate-of-Analysis-Lot-Verified.pdf"
                      onSelectFile={(name) => {
                        setCoaFile(name);
                        if (errors.length > 0) setErrors([]);
                      }}
                      onClearFile={() => setCoaFile('')}
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
                    <div
                      className={`pl-upload-box pl-upload-box--photos${photoFiles.length > 0 ? ' pl-upload-box--filled' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handlePhotoDrop}
                    >
                      <label className="pl-upload-label" htmlFor="upload-photos">
                        <div className="pl-upload-icon pl-upload-icon--photo">
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <rect x="3" y="8" width="30" height="22" rx="3" stroke="#9bb8bf" strokeWidth="2.5" />
                            <circle cx="18" cy="19" r="6" stroke="#9bb8bf" strokeWidth="2.5" />
                            <path d="M13 8l2-4h6l2 4" stroke="#9bb8bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="pl-upload-text pl-upload-text--photos">
                          <span className="pl-upload-heading">
                            {photoFiles.length > 0
                              ? `${photoFiles.length} photo(s) selected ✓`
                              : 'Upload product photos'}
                          </span>
                          <span className="pl-upload-sub">
                            <span className="pl-upload-click">Click to upload</span>
                            {' '}
                            <span className="pl-upload-drop">or drag and drop — Up to 10 images</span>
                          </span>
                        </div>
                        <div className="pl-upload-tags">
                          {['JPG', 'PNG', 'WEBP'].map((t) => <span key={t} className="pl-tag">{t}</span>)}
                        </div>
                        <input
                          id="upload-photos"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          multiple
                          className="pl-upload-input"
                          onChange={(e) => {
                            const names = Array.from(e.target.files ?? []).map((f) => f.name);
                            if (names.length > 0) {
                              setPhotoFiles((prev) =>
                                Array.from(new Set([...prev, ...names])).slice(0, 10),
                              );
                              if (errors.length > 0) setErrors([]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {photoFiles.length > 0 && (
                      <div className="pl-selected-files-list">
                        {photoFiles.map((name) => (
                          <span className="pl-selected-file-pill" key={name}>
                            {name}
                            <button
                              type="button"
                              aria-label={`Remove ${name}`}
                              onClick={() =>
                                setPhotoFiles((prev) => prev.filter((item) => item !== name))
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="pl-upload-meta-row">
                      <p className="pl-upload-hint">
                        Include: product close-up, packaging label, lot number visible on packaging, and overall condition. Minimum 3 photos recommended.
                      </p>
                      {photoFiles.length > 0 ? (
                        <button
                          type="button"
                          className="pl-upload-helper-btn"
                          onClick={() => setPhotoFiles([])}
                        >
                          Clear photos
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pl-upload-helper-btn"
                          onClick={() => {
                            setPhotoFiles([
                              'lot-packaging-label.jpg',
                              'ingredient-closeup.jpg',
                              'pallet-condition.jpg',
                            ]);
                            if (errors.length > 0) setErrors([]);
                          }}
                        >
                          Attach sample photos
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── §5 Review & additional notes ──────── */}
              <div className="pl-card">
                <div className="pl-card-inner">
                  <SectionHeader
                    n={5}
                    title="Review & additional notes"
                    subtitle="Anything else buyers should know — storage conditions, pickup/delivery details, expiry, etc."
                  />
                  <div className="pl-fields">
                    <div className="pl-field">
                      <FieldLabel>Seller notes</FieldLabel>
                      <textarea
                        className="pl-input pl-input--notes"
                        placeholder="e.g. Stored in climate-controlled warehouse. Available for pickup or freight arrangements. Retest date MM/YYYY."
                        value={sellerNotes}
                        onChange={(e) => setSellerNotes(e.target.value)}
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
                      You&apos;ll receive an email with the outcome within 1–2 business days.
                    </p>
                  </div>
                  <div className="pl-submit-actions">
                    <button
                      type="button"
                      className="pl-btn-outline"
                      onClick={handleSaveDraft}
                    >
                      Save Draft
                    </button>
                    <button type="submit" className="pl-btn-primary">
                      Submit Listing
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
