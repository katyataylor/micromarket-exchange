// Footer
export function Footer() {
  return (
    <footer>
      <section className="footer">
        <div className="footer-top">
          <a href="/homepage" className="logo-link">
            <img src="/images/small high-contrast mme logo.png" alt="white micromarket exchange logo." />
          </a>
          <p>©2026 MicroMarket Exchange Inc.</p>
          <div className="icons">
            <img src="/images/email icon.png" alt="link to email." />
            <img src="/images/2023_Facebook_icon.svg.png" alt="facebook link." />
          </div>
        </div>
        <hr />
        <div className="footer-bottom">
          <ul>
            <li>Login/Sign Up</li>
            <li>List Your Products</li>
            <li>Account Portal</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </section>
    </footer>
  );
}