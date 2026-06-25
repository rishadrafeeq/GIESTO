import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/siteConfig';
import { whatsAppContactUrl } from '../../utils/whatsapp';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="trust-bar">
        <div className="container trust-grid">
          <div className="trust-item"><strong>Free Shipping</strong><span>On all orders</span></div>
          <div className="trust-item"><strong>Easy Exchange</strong><span>Within 7 days</span></div>
          <div className="trust-item"><strong>WhatsApp Support</strong><span>Quick replies</span></div>
          <div className="trust-item"><strong>Order on WhatsApp</strong><span>No payment online</span></div>
        </div>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="site-logo">{siteConfig.shopName}</Link>
          <p>Premium men&apos;s fashion. Pick your size and order on WhatsApp.</p>
          <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-ig">@geistooffical</a>
        </div>
        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop?cat=formal">Formal Wear</Link></li>
            <li><Link to="/shop?cat=casual">Casual Wear</Link></li>
            <li><Link to="/shop?cat=sports">Sports Wear</Link></li>
            <li><Link to="/shop">All Products</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/lookbook">Lookbook</Link></li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>Stay in touch</h4>
          <p>Message us on WhatsApp for new drops.</p>
          <a href={whatsAppContactUrl()} className="btn btn-dark" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; 2026 {siteConfig.shopName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
