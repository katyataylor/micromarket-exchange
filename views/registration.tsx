import { Footer } from './partials/footer';
import { Header } from './partials/header';

export function Registration() {
  return (
    <>
      <Header />

      <section className="hero-page-body">
        <div className="store-hero-bg">
          <div className="store-hero-text">
            <h6 className="gold">account registration</h6>
            <div className="display">Join Micromarket Exchange</div>
            <div className="p2">Micromarket Exchange is a marketplace for licensed agricultural operations.
              Choose your membership type below. Only FDA-licensed operations and licensed
              feed mills may buy or sell. A third-party observer membership is available for
              viewing products only.
            </div>
          </div>
        </div>
      </section>

      <div className="page-body">
        <div className="p2 page-text">Already have an account? <a href="/account">Sign in</a></div>
        <section className="disclosure-container">
          <ul className="h4">
            <li>
              All trading accounts require verification before activation. Our team will review
              documentation and approve or follow up within 2 business days. Third-party memberships
              are approved automatically upon email confirmation.
            </li>
          </ul>
        </section>

        {/* Step 1: Membership type — always visible */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">1</h2>
            <div className="text-container">
              <h3>Membership type</h3>
              <div className="subp1">Select the membership that matches your operation. This determines
                what actions you can take on Micromarket Exchange.
              </div>
            </div>
          </div>
          <hr />
          <div className="bubble-container">
            <div className="membership-type sand-bubble" tabIndex={0} data-membership="trade">
              <h2>Licensed operation</h2>
              <h4 style={{ color: 'var(--brandSoftGraphite)' }}>FDA-licensed farms, operations, and licensed feed mills with a physical location.</h4>
              <h4 style={{ color: 'var(--textEyebrowBlue)' }}>• List &amp; sell products <br />
                • Bid on listings <br />
                • Full marketplace access
              </h4>
              <div className="membership-type type-tag">Seller/Buyer</div>
            </div>

            <div className="membership-type sand-bubble" tabIndex={0} data-membership="viewonly">
              <h2>Third-party member</h2>
              <h4 style={{ color: 'var(--brandSoftGraphite)' }}>Industry consultants, researchers, and observers who need marketplace visibility.</h4>
              <h4 style={{ color: 'var(--textEyebrowBlue)' }}><s>• List &amp; sell products</s> <br />
                <s>• Bid on listings</s> <br />
                • Browse marketplace
              </h4>
              <div className="membership-type type-tag">View only</div>
            </div>
          </div>
        </section>

        {/* Step 2: Contact information — always visible, some fields swap labels */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">2</h2>
            <div className="text-container">
              <h3>Contact information</h3>
              <div className="subp1">The primary contact for this account. This person will receive all notifications.</div>
            </div>
          </div>
          <hr />
          <div className="user-inputs-container">
            <div className="input-row">
              <div className="input-column">
                <h4>First name *</h4>
                <input className="subH1 medium" type="text" placeholder="e.g. John" />
              </div>
              <div className="input-column">
                <h4>Last name *</h4>
                <input className="subH1 medium" type="text" placeholder="e.g. Smith" />
              </div>
            </div>
            <div className="input-row">
              <div className="input-column">
                <h4
                  id="email-label"
                  data-trade-label="Business email *"
                  data-viewonly-label="Email *"
                >Business email *</h4>
                <input className="subH1 medium" type="email" placeholder="you@yourcompany.com" />
              </div>
              <div className="input-column">
                <h4>Phone number *</h4>
                <input className="subH1 medium" type="tel" placeholder="(000) 000-0000" />
              </div>
            </div>
            <div className="subp1 trade-only">Use your business email when possible — personal addresses may delay verification.</div>
            <h4
              id="occupation-label"
              data-trade-label="Job title/role"
              data-viewonly-label="Occupation"
            >Job title/role</h4>
            <input
              id="occupation-input"
              className="subH1 medium"
              type="text"
              placeholder="e.g. Owner, Operations Manager"
              data-trade-placeholder="e.g. Owner, Operations Manager"
              data-viewonly-placeholder="e.g. Consultant, Researcher"
            />
          </div>
        </section>

        {/* Step 3: Business information — trade only */}
        <section className="w-bubble-container trade-only" id="section-business-info">
          <div className="list-item registration">
            <h2 className="blue number">3</h2>
            <div className="text-container">
              <h3>Business information</h3>
              <div className="subp1">Details about your operation. Must match your FDA or state license records.</div>
            </div>
          </div>
          <hr />
          <div className="user-inputs-container">
            <h4>Business name *</h4>
            <input className="subH1 large" type="text" placeholder="As it appears on your license" />
            <div className="input-row">
              <div className="input-column">
                <h4>Business type *</h4>
                <input className="subH1 medium" type="text" placeholder="Input type" />
              </div>
              <div className="input-column">
                <h4>State issuing license *</h4>
                <input className="subH1 medium" type="text" placeholder="Select state" />
              </div>
            </div>
            <h4>Address *</h4>
            <input className="subH1 large" type="text" placeholder="Street address" />
            <div className="input-row">
              <input className="subH1" type="text" placeholder="City" />
              <input className="subH1" type="text" placeholder="State" />
              <input className="subH1" type="text" placeholder="ZIP code" />
            </div>
            <div className="subp1">Must be a physical address. P.O. boxes are not accepted.</div>
            <h4>Website</h4>
            <input className="subH1 large" type="text" placeholder="www.yourcompany.com" />
          </div>
        </section>

        {/* Step 4: License & registration — trade only */}
        <section className="w-bubble-container trade-only" id="section-license">
          <div className="list-item registration">
            <h2 className="blue number">4</h2>
            <div className="text-container">
              <h3>License &amp; registration</h3>
              <div className="subp1">Your FDA and state license details. Our team verifies all trading accounts against these records before activation.</div>
            </div>
          </div>
          <hr />
          <div className="user-inputs-container">
            <div className="input-row">
              <div className="input-column">
                <h4>FDA registration number *</h4>
                <input className="subH1 medium" type="number" placeholder="e.g. 12345678901" />
                <div className="subp1">11-digit FDA Food Facility Registration number.</div>
              </div>
              <div className="input-column">
                <h4>State feed license number *</h4>
                <input className="subH1 medium" type="number" placeholder="State-issued license number" />
              </div>
            </div>
            <div className="input-row">
              <div className="input-column">
                <h4>License expiry date *</h4>
                <input className="subH1 medium" type="text" placeholder="MM/YYYY" />
              </div>
              <div className="input-column">
                <h4>Issuing authority</h4>
                <input className="subH1 medium" type="text" placeholder="e.g. Texas Department of Agriculture" />
              </div>
            </div>
            <h4>Upload license documentation *</h4>
            <div className="user-inputs-container" id="upload-box">
              <div className="upload-box-content">
                <img src="/images/upload icon.png" alt="Yellow upload here icon" />
                <div className="p2">Click to upload or drag and drop</div>
                <div className="tag-container">
                  <div className="upload-tag eyebrow">PDF</div>
                  <div className="upload-tag eyebrow">JPG</div>
                  <div className="upload-tag eyebrow">PNG</div>
                </div>
              </div>
              <div className="subp1">Upload copies of your current FDA registration and state feed license. Both are required for trading accounts.</div>
            </div>
          </div>
        </section>

        {/* Step 5 (trade) / Step 3 (view only): Create your login — always visible */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">5</h2>
            <div className="text-container">
              <h3>Create your login</h3>
              <div className="subp1">Choose a secure password for your Micromarket Exchange account.</div>
            </div>
          </div>
          <hr />
          <div className="user-inputs-container">
            <h4>Username *</h4>
            <input className="subH1 medium" type="text" placeholder="e.g. johnsmith1" />
            <div className="input-row">
              <div className="input-column">
                <h4>Password *</h4>
                <input className="subH1 medium" type="password" placeholder="Minimum 8 characters" />
              </div>
              <div className="input-column">
                <h4>Confirm password *</h4>
                <input className="subH1 medium" type="password" placeholder="Re-enter password" />
              </div>
            </div>
            <div className="subp1">Use at least 8 characters including a number and a symbol.</div>
          </div>
        </section>

        {/* Step 6 (trade) / Step 4 (view only): Agreements — always visible, trade has extra checkboxes */}
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">6</h2>
            <div className="text-container">
              <h3>Agreements</h3>
              <div className="subp1">Review and accept these terms before submitting your application.</div>
            </div>
          </div>
          <hr />
          <div className="user-inputs-container">
            <div className="blue-bubble registration">
              <input type="checkbox" className="blue-check" id="termsOfServiceAndPrivacy" />
              <h4>I have read and agree to the Micromarket Exchange Terms of Service and Privacy Policy.</h4>
            </div>
            <div className="trade-only">
              <div className="blue-bubble registration">
                <input type="checkbox" className="blue-check" id="licensingConfirmation" />
                <h4>I certify that my operation holds a valid FDA registration and/or state feed license and that all
                  information provided is accurate. I understand that providing false information will result in
                  account termination.
                </h4>
              </div>
              <div className="blue-bubble registration">
                <input type="checkbox" className="blue-check" id="accountReview" />
                <h4>I understand that my trading account must be verified by Micromarket Exchange before I can buy
                  or sell, and that Micromarket Exchange reserves the right to suspend accounts found to be operating
                  outside their licensed scope.
                </h4>
              </div>
            </div>
          </div>
        </section>

        {/* Submit — copy swaps between membership types */}
        <section className="w-bubble-container">
          <div className="cta-text-container">
            <div className="trade-only">
              <div className="p2">Submit your application</div>
              <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>Trading accounts are reviewed
                within 2 business days. You'll receive a confirmation email once approved.
              </div>
            </div>
            <div className="viewonly-only">
              <div className="p2">Create your account</div>
              <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>Third party accounts are created
                instantly upon email verification.
              </div>
            </div>
          </div>
          <button className="list-button">Save Draft</button>
          <button className="list-button">Submit</button>
        </section>
      </div>

      <Footer />
    </>
  );
}
