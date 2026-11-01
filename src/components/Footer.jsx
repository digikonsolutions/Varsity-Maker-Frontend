import React from "react";
import { FaFacebookF as FbIcon, FaInstagram as InstaIcon } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { Link } from "react-router-dom";
import './Footer.css';

/* ===== MINIMALIST HIGH-END VECTOR SVG REPLACEMENTS ===== */
const IconMail = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

function FooterColumn({ title, items }) {
  return (
    <div className="vm-footer-column">
      <h4 className="vm-footer-column-title">{title}</h4>
      <ul className="vm-footer-links-list">
        {items.map((item, index) => (
          <li key={index} className="vm-footer-link-item">
            {item.path ? (
              <Link to={item.path} className="vm-footer-anchor">{item.label}</Link>
            ) : (
              <a href="#" className="vm-footer-anchor">{item.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="vm-luxury-footer">
      <div className="vm-footer-upper-wrapper">
        <div className="vm-footer-main">
          
          {/* EDITORIAL NEWSLETTER SEGMENT */}
          <div className="vm-newsletter-area">
            <h2 className="vm-newsletter-title">Join Our Newsletter</h2>
            <p className="vm-newsletter-desc">Subscribe for exclusive access to our upcoming limited drops.</p>

            <div className="vm-newsletter-input-container">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL ADDRESS" 
                className="vm-newsletter-field"
              />
              <button className="vm-newsletter-submit-btn" aria-label="Subscribe">
                <IconArrow />
              </button>
            </div>

            <div className="vm-studio-contact-info">
              <p className="vm-contact-row">
                <IconMail /> <span>varsitymakers@gmail.com</span>
              </p>
              <p className="vm-contact-row">
                <IconPhone /> <span>+92 301 5676789</span>
              </p>
            </div>
          </div>

          {/* ASYMMETRICAL COLUMN LINKS CONTAINER */}
          <div className="vm-footer-links-grid">
            <FooterColumn
              title="Helpful Links"
              items={[
                { label: "Search", path: "/search" },
                { label: "Size Chart", path: "/size-chart" },
                { label: "Refund & Returns", path: "/refund-policy" },
                { label: "International Shipments", path: "/international-shipments" },
                { label: "Track Your Order", path: "/track-order" },
                { label: "Patches & Embroidery", path: "/patches-embroidery" },
                { label: "Colors & Materials", path: "/colorsandmaterials" },
                { label: "School Registration Page", path: "/school-registration-form" },
                { label: "How it Works", path: "/how-it-works" },
              ]}
            />

            <FooterColumn
              title="Shop"
              items={[
                { label: "Shop", path: "/shop" },
                { label: "Wholesale", path: "/wholesale" },
                { label: "Gift Card", path: "/gift-card" },
                { label: "Contact", path: "/contact" },
                { label: "Our Story", path: "/our-story" },
                { label: "Group Orders", path: "/contact" },
              ]}
            />

            <FooterColumn
              title="Support"
              items={[
                { label: "FAQs", path: "/faqs" },
                { label: "Contact Us", path: "/contact" },
                { label: "Find a Store", path: "/stores" },
                { label: "Do Not Sell My Data", path: "/do-not-sell" },
              ]}
            />
          </div>

        </div>
      </div>

      {/* LOWER ARCHITECTURAL TIMELINE BASELINE */}
      <div className="vm-footer-bottom-wrapper">
        <div className="vm-footer-bottom-bar">
          <p className="vm-copyright-text">© 2026 | VARSITYMAKERS. ALL RIGHTS RESERVED.</p>

          <div className="vm-bottom-legal-links">
            <a href="/refund-policy">REFUND & RETURNS</a>
            <a href="/shipping-policy">SHIPPING POLICY</a>
            <a href="/terms-and-conditions">TERMS & CONDITIONS</a>
            <a href="/privacy-policy">PRIVACY POLICY</a>
          </div>

          <div className="vm-social-wireframe-icons">
            <a href="#" aria-label="Facebook" className="vm-social-btn">
              <FbIcon />
            </a>
            <a href="#" aria-label="Instagram" className="vm-social-btn">
              <InstaIcon />
            </a>
            <a href="#" aria-label="X" className="vm-social-btn">
              <BsTwitterX />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}