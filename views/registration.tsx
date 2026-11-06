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
        <section className="w-bubble-container">
          <div className="list-item registration">
            <h2 className="blue number">4</h2>
            <div className="text-container">
              <h3>License & registration</h3>
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
                <input className="subH1 medium" type="text" placeholder="Minimum 8 characters" />
              </div>
              <div className="input-column">
                <h4>Confirm password *</h4>
                <input className="subH1 medium" type="text" placeholder="Re-enter password" />
              </div>
            </div>
            <div className="subp1">Use at least 8 characters including a number and a symbol.</div>
          </div>
        </section>
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
        </section>
        <section className="w-bubble-container">
          <div className="cta-text-container">
            <div className="p2">Submit your application</div>
            <div className="p2" style={{ color: 'var(--textMutedCaptions)' }}>Trading accounts are reviewed
              within 2 business days. You'll receive a confirmation email once approved.
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