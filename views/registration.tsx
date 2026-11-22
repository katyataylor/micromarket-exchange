import { type DragEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

type MembershipType = 'trade' | 'viewonly';

export function Registration() {
  const [membership, setMembership] = useState<MembershipType>('trade');
  const isTrade = membership === 'trade';

  // Contact fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  // Trade business & license fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateAddr, setStateAddr] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [website, setWebsite] = useState('');
  const [fdaNumber, setFdaNumber] = useState('');
  const [feedLicense, setFeedLicense] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [licenseFiles, setLicenseFiles] = useState<string[]>([]);

  // Login & agreements
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreeLicense, setAgreeLicense] = useState(false);
  const [agreeReview, setAgreeReview] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const typeParam = new URLSearchParams(window.location.search).get('type')?.toLowerCase();
    if (typeParam === 'viewonly' || typeParam === 'observer') {
      setMembership('viewonly');
    } else if (typeParam === 'trade' || typeParam === 'full') {
      setMembership('trade');
    }
  }, []);

  const loginStep = isTrade ? 5 : 3;
  const agreeStep = isTrade ? 6 : 4;

  function handleCardKey(e: React.KeyboardEvent, type: MembershipType) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMembership(type);
      setErrors([]);
    }
  }

  function handleLicenseDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const names = Array.from(e.dataTransfer.files ?? []).map((f) => f.name);
    if (names.length > 0) {
      setLicenseFiles((prev) => Array.from(new Set([...prev, ...names])));
      if (errors.length > 0) setErrors([]);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: string[] = [];

    if (!firstName.trim()) nextErrors.push('First name is required.');
    if (!lastName.trim()) nextErrors.push('Last name is required.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.push('Enter a valid email address.');
    }
    if (!phone.trim()) nextErrors.push('Phone number is required.');

    if (isTrade) {
      if (!businessName.trim()) nextErrors.push('Business name is required.');
      if (!businessType.trim()) nextErrors.push('Business type is required.');
      if (!licenseState.trim()) nextErrors.push('State issuing license is required.');
      if (!streetAddress.trim()) {
        nextErrors.push('Physical street address is required.');
      } else if (/\bp\.?\s*o\.?\s*box\b/i.test(streetAddress)) {
        nextErrors.push('P.O. boxes are not accepted — please enter a physical facility address.');
      }
      if (!city.trim() || !stateAddr.trim() || !zipCode.trim()) {
        nextErrors.push('City, state, and ZIP code are required.');
      }
      if (!fdaNumber.trim()) nextErrors.push('FDA registration number is required.');
      if (!feedLicense.trim()) nextErrors.push('State feed license number is required.');
      if (!licenseExpiry.trim()) nextErrors.push('License expiry date is required.');
      if (licenseFiles.length === 0) {
        nextErrors.push('Upload at least one license verification document.');
      }
    }

    if (!username.trim() || username.trim().length < 4) {
      nextErrors.push('Username must be at least 4 characters.');
    }
    if (password.length < 8) {
      nextErrors.push('Password must be at least 8 characters.');
    }
    if (password !== confirmPassword) {
      nextErrors.push('Password and confirmation password do not match.');
    }

    if (!agreeTos) {
      nextErrors.push('You must agree to the Terms of Service and Privacy Policy.');
    }
    if (isTrade && (!agreeLicense || !agreeReview)) {
      nextErrors.push('Please accept all trading license and verification agreements.');
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    localStorage.setItem(
      'mme_session',
      JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        name: fullName,
        membership,
        signedInAt: new Date().toISOString(),
      }),
    );
    localStorage.setItem(
      'mme_account_profile',
      JSON.stringify({
        contactName: fullName,
        email: email.trim(),
        phone: phone.trim(),
        businessName: isTrade ? businessName.trim() : `${fullName} (Industry Observer)`,
        address: isTrade
          ? `${streetAddress.trim()}, ${city.trim()}, ${stateAddr.trim()} ${zipCode.trim()}`
          : '',
        fdaRegistration: isTrade ? fdaNumber.trim() : 'Observer — View Only',
        stateLicense: isTrade ? feedLicense.trim() : 'N/A',
      }),
    );

    window.location.href = isTrade
      ? '/registration/success'
      : '/registration/success-observer';
  }

  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text">
            <h6 className="gold">account registration</h6>
            <div className="display">Join MicroMarket Exchange</div>
            <div className="p2">
              MicroMarket Exchange is a marketplace for licensed agricultural operations.
              Choose your membership type below. Only FDA-licensed operations and licensed
              feed mills may buy or sell. A third-party observer membership is available for
              viewing products only.
            </div>
          </div>
        </div>
      </section>

      <form className="page-body" onSubmit={handleSubmit} noValidate>
        <div className="p2 page-text">
          Already have an account? <a href="/login">Sign in</a>
        </div>
        <section className="disclosure-container">
          <ul className="h4">
            <li>
              All trading accounts require verification before activation. Our team will review
              documentation and approve or follow up within 2 business days. Third-party memberships
              are approved automatically upon email confirmation.
            </li>
          </ul>
        </section>

        {errors.length > 0 && (
          <div className="reg-validation-banner" role="alert" ref={errorRef}>
            <p className="reg-validation-title">
              Please review the following fields before continuing:
            </p>
            <ul>
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 1: Membership type */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">1</h2>
            <div className="text-container">
              <h3>Membership type</h3>
              <div className="subp1">
                Select the membership that matches your operation. This determines
                what actions you can take on MicroMarket Exchange.
              </div>
            </div>
          </div>
          <hr style={{ marginTop: 28 }} />
          <div className="bubble-container">
            <div
              className={`membership-type sand-bubble${membership === 'trade' ? ' selected' : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={membership === 'trade'}
              onClick={() => {
                setMembership('trade');
                setErrors([]);
              }}
              onKeyDown={(e) => handleCardKey(e, 'trade')}
            >
              <h2>Licensed operation</h2>
              <h4 style={{ color: 'var(--brandSoftGraphite)' }}>
                FDA-licensed farms, operations, and licensed feed mills with a physical location.
              </h4>
              <h4 style={{ color: 'var(--textEyebrowBlue)' }}>
                • List &amp; sell products <br />
                • Bid on listings <br />
                • Full marketplace access
              </h4>
              <div className="membership-type type-tag">Seller/Buyer</div>
            </div>

            <div
              className={`membership-type sand-bubble${membership === 'viewonly' ? ' selected' : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={membership === 'viewonly'}
              onClick={() => {
                setMembership('viewonly');
                setErrors([]);
              }}
              onKeyDown={(e) => handleCardKey(e, 'viewonly')}
            >
              <h2>Industry Experts</h2>
              <h4 style={{ color: 'var(--brandSoftGraphite)' }}>
                Industry consultants, researchers, and observers who need marketplace visibility.
              </h4>
              <h4 style={{ color: 'var(--textEyebrowBlue)' }}>
                <s>• List &amp; sell products</s> <br />
                <s>• Bid on listings</s> <br />
                • Browse marketplace
              </h4>
              <div className="membership-type type-tag">View only</div>
            </div>
          </div>
        </section>

        {/* Step 2: Contact information */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">2</h2>
            <div className="text-container">
              <h3>Contact information</h3>
              <div className="subp1">
                The primary contact for this account. This person will receive all notifications.
              </div>
            </div>
          </div>
          <hr style={{ marginTop: 28 }} />
          <div className="user-inputs-container">
            <div className="input-row">
              <div className="input-column">
                <h4>First name *</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="text"
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="input-column">
                <h4>Last name *</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="text"
                  placeholder="e.g. Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-column">
                <h4>{isTrade ? 'Business email *' : 'Email *'}</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="email"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-column">
                <h4>Phone number *</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="tel"
                  placeholder="(000) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            {isTrade && (
              <div className="subp1">
                Use your business email when possible — personal addresses may delay verification.
              </div>
            )}
            <h4>{isTrade ? 'Job title/role' : 'Occupation'}</h4>
            <input
              className="subH1 medium reg-field-input"
              type="text"
              placeholder={isTrade ? 'e.g. Owner, Operations Manager' : 'e.g. Consultant, Researcher'}
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>
        </section>

        {/* Steps 3 & 4: Business info and License — trade only */}
        {isTrade && (
          <>
            <section className="w-bubble-container">
              <div className="list-item registration">
                <h2 className="blue number">3</h2>
                <div className="text-container">
                  <h3>Business information</h3>
                  <div className="subp1">
                    Details about your operation. Must match your FDA or state license records.
                  </div>
                </div>
              </div>
              <hr style={{ marginTop: 28 }} />
              <div className="user-inputs-container">
                <h4>Business name *</h4>
                <input
                  className="subH1 large reg-field-input"
                  type="text"
                  placeholder="As it appears on your license"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <div className="input-row">
                  <div className="input-column">
                    <h4>Business type *</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      placeholder="e.g. Commercial Feed Mill"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    />
                  </div>
                  <div className="input-column">
                    <h4>State issuing license *</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      placeholder="e.g. Texas"
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                    />
                  </div>
                </div>
                <h4>Address *</h4>
                <input
                  className="subH1 large reg-field-input"
                  type="text"
                  placeholder="Street address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
                <div className="input-row">
                  <input
                    className="subH1 reg-field-input"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    className="subH1 reg-field-input"
                    type="text"
                    placeholder="State"
                    value={stateAddr}
                    onChange={(e) => setStateAddr(e.target.value)}
                  />
                  <input
                    className="subH1 reg-field-input"
                    type="text"
                    placeholder="ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="subp1">Must be a physical address. P.O. boxes are not accepted.</div>
                <h4>Website</h4>
                <input
                  className="subH1 large reg-field-input"
                  type="text"
                  placeholder="www.yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </section>

            <section className="w-bubble-container">
              <div className="list-item registration">
                <h2 className="blue number">4</h2>
                <div className="text-container">
                  <h3>License &amp; registration</h3>
                  <div className="subp1">
                    Your FDA and state license details. Our team verifies all trading accounts against these records before activation.
                  </div>
                </div>
              </div>
              <hr style={{ marginTop: 28 }} />
              <div className="user-inputs-container">
                <div className="input-row">
                  <div className="input-column">
                    <h4>FDA registration number *</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 12345678901"
                      value={fdaNumber}
                      onChange={(e) => setFdaNumber(e.target.value)}
                    />
                    <div className="subp1">11-digit FDA Food Facility Registration number.</div>
                  </div>
                  <div className="input-column">
                    <h4>State feed license number *</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      placeholder="e.g. TX-FL-10401"
                      value={feedLicense}
                      onChange={(e) => setFeedLicense(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-column">
                    <h4>License expiry date *</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      placeholder="MM/YYYY"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                    />
                  </div>
                  <div className="input-column">
                    <h4>Issuing authority</h4>
                    <input
                      className="subH1 medium reg-field-input"
                      type="text"
                      placeholder="e.g. Texas Department of Agriculture"
                      value={issuingAuthority}
                      onChange={(e) => setIssuingAuthority(e.target.value)}
                    />
                  </div>
                </div>
                <h4>Upload license documentation *</h4>
                <label
                  className={`user-inputs-container${licenseFiles.length > 0 ? ' reg-upload-filled' : ''}`}
                  id="upload-box"
                  htmlFor="reg-license-upload"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleLicenseDrop}
                >
                  <div className="upload-box-content">
                    <img src="/images/upload icon.png" alt="Upload license documentation" />
                    <div className="p2">
                      {licenseFiles.length > 0
                        ? `${licenseFiles.length} document(s) attached ✓`
                        : 'Click to upload or drag and drop'}
                    </div>
                    <div className="tag-container">
                      <div className="upload-tag eyebrow">PDF</div>
                      <div className="upload-tag eyebrow">JPG</div>
                      <div className="upload-tag eyebrow">PNG</div>
                    </div>
                  </div>
                  <input
                    id="reg-license-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="reg-hidden-file-input"
                    onChange={(e) => {
                      const names = Array.from(e.target.files ?? []).map((f) => f.name);
                      if (names.length > 0) {
                        setLicenseFiles((prev) => Array.from(new Set([...prev, ...names])));
                        if (errors.length > 0) setErrors([]);
                      }
                    }}
                  />
                  <div className="subp1">
                    Upload copies of your current FDA registration and state feed license. Both are required for trading accounts.
                  </div>
                </label>
                <div className="reg-upload-actions">
                  {licenseFiles.length > 0 ? (
                    <>
                      <span className="reg-upload-filenames">{licenseFiles.join(', ')}</span>
                      <button
                        type="button"
                        className="reg-sample-file-btn"
                        onClick={() => setLicenseFiles([])}
                      >
                        Remove files
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="reg-sample-file-btn"
                      onClick={() => {
                        setLicenseFiles(['FDA-Facility-Reg-2026.pdf', 'State-Feed-License.pdf']);
                        if (errors.length > 0) setErrors([]);
                      }}
                    >
                      Attach sample license PDFs
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Create your login */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">{loginStep}</h2>
            <div className="text-container">
              <h3>Create your login</h3>
              <div className="subp1">Choose a secure password for your MicroMarket Exchange account.</div>
            </div>
          </div>
          <hr style={{ marginTop: 28 }} />
          <div className="user-inputs-container">
            <h4>Username *</h4>
            <input
              className="subH1 medium reg-field-input"
              type="text"
              placeholder="e.g. johnsmith1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="subp1">Choose a unique username (4–24 characters) for signing in.</div>
            <div className="input-row">
              <div className="input-column">
                <h4>Password *</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="input-column">
                <h4>Confirm password *</h4>
                <input
                  className="subH1 medium reg-field-input"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="subp1">Use at least 8 characters including a number and a symbol.</div>
          </div>
        </section>

        {/* Agreements */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">{agreeStep}</h2>
            <div className="text-container">
              <h3>Agreements</h3>
              <div className="subp1">Review and accept these terms before submitting your application.</div>
            </div>
          </div>
          <hr style={{ marginTop: 28 }} />
          <div className="user-inputs-container">
            <label className="blue-bubble registration" htmlFor="termsOfServiceAndPrivacy" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="blue-check"
                id="termsOfServiceAndPrivacy"
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
              />
              <h4>I have read and agree to the MicroMarket Exchange Terms of Service and Privacy Policy.</h4>
            </label>
            {isTrade && (
              <>
                <label className="blue-bubble registration" htmlFor="licensingConfirmation" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="blue-check"
                    id="licensingConfirmation"
                    checked={agreeLicense}
                    onChange={(e) => setAgreeLicense(e.target.checked)}
                  />
                  <h4>
                    I certify that my operation holds a valid FDA registration and/or state feed license and that all
                    information provided is accurate. I understand that providing false information will result in
                    account termination.
                  </h4>
                </label>
                <label className="blue-bubble registration" htmlFor="accountReview" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="blue-check"
                    id="accountReview"
                    checked={agreeReview}
                    onChange={(e) => setAgreeReview(e.target.checked)}
                  />
                  <h4>
                    I understand that my trading account must be verified by MicroMarket Exchange before I can buy
                    or sell, and that MicroMarket Exchange reserves the right to suspend accounts found to be operating
                    outside their licensed scope.
                  </h4>
                </label>
              </>
            )}
          </div>
        </section>

        {/* Submit */}
        <section className="w-bubble-container">
          <div className="cta-content-container">
            <div className="cta-text-container">
              {isTrade ? (
                <>
                  <div className="p2">Submit your application</div>
                  <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>
                    Trading accounts are reviewed within 2 business days. You&apos;ll receive a confirmation email once approved.
                  </div>
                </>
              ) : (
                <>
                  <div className="p2">Create your account</div>
                  <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>
                    Third-party observer accounts are created instantly upon email verification.
                  </div>
                </>
              )}
            </div>
            <div className="save-submit-container">
              <button type="submit" className="submit-button">
                Submit
              </button>
            </div>
          </div>
        </section>
      </form>

      <Footer />
    </>
  );
}
