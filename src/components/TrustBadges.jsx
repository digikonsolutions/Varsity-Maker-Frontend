import React from 'react';
import './TrustBadges.css';
import { FaGlobe, FaTshirt, FaAward, FaHandshake   } from "react-icons/fa";

/* ── Inline SVG helpers ── */
const StarSVG = ({ size = 11, fill = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MedalIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ff0022" strokeWidth="1.7">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ff0022" strokeWidth="1.7">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const HandshakeIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ff0022" strokeWidth="1.7">
    <path d="M2 12h4l3-3 4 6 3-3h6" />
    <path d="M5 12c0 3.866 3.134 7 7 7s7-3.134 7-7" />
  </svg>
);

/* ── Component ── */
const TrustBadges = () => {
  return (
    <section className="v-trust-badge-bar-section">
      <div className="v-trust-badge-matrix-container">

        {/* ── Badge 1: Trustpilot ── */}
        <div className="v-trust-node-item">
          <div className="v-trust-top-wrapper">
            <span className="v-trust-main-heavy-title">Excellent</span>
            <div className="v-trustpilot-star-row-block">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="v-tp-star-box">
                  <StarSVG size={11} fill="white" />
                </div>
              ))}
            </div>
          </div>

          <div className="v-trust-brand-subheading">
            {/* Trustpilot green star icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#00b67a">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Trustpilot
          </div>

          <p className="v-trust-node-caption">Trustpilot Rating</p>
          <p className="v-trust-node-micro-desc">4.8 out of 5 based on 200+ reviews</p>
        </div>

        <div className="v-trust-node-divider" />

        {/* ── Badge 2: Google ── */}
        <div className="v-trust-node-item">
          <div className="v-trust-google-header-combo">
            <GoogleLogo />
            <div className="v-trust-google-numeric-stars">
              <span className="v-trust-google-score-num">4.9</span>
              <div className="v-google-star-mini-row">
                {[...Array(5)].map((_, i) => (
                  <StarSVG key={i} size={13} fill="#FBBC05" />
                ))}
              </div>
            </div>
          </div>

          <p className="v-trust-node-caption">Based on 150+ Reviews</p>
          <p className="v-trust-node-micro-desc active-link">Read our reviews on Google</p>
        </div>

        <div className="v-trust-node-divider" />

        {/* ── Badge 3: 100% Guaranteed ── */}
        <div className="v-trust-node-item">
          <div className="v-trust-icon-center-stage">
            <FaGlobe size={38} color="#fff" />
          </div>
          <p className="v-trust-main-heavy-title">500+ Schools</p>
          <p className="v-trust-node-caption">Trusted Worldwide Academies</p>
          <p className="v-trust-node-micro-desc">We stand behind our quality.</p>
        </div>

        <div className="v-trust-node-divider" />

        {/* ── Badge 4: Academies Served ── */}
        <div className="v-trust-node-item">
          <div className="v-trust-icon-center-stage">
            <FaTshirt  size={38} color="#fff" />
          </div>
          <p className="v-trust-main-heavy-title">10,000+ Jackets</p>
          <p className="v-trust-node-caption">Delivered & Custom Crafted</p>
          <p className="v-trust-node-micro-desc">Served worldwide with premium gear.</p>
        </div>

        <div className="v-trust-node-divider" />

        {/* ── Badge 5: BJJ Brand Served ── */}
        <div className="v-trust-node-item">
          <div className="v-trust-icon-center-stage">
            <FaHandshake size={38} color="#fff" />
          </div>
          <p className="v-trust-main-heavy-title">30-Day Guarantee</p>
          <p className="v-trust-node-caption">Risk-Free Shopping</p>
          <p className="v-trust-node-micro-desc">Return within 30 days for a full refund, no questions asked.</p>
        </div>

      </div>
    </section>
  );
};

export default TrustBadges;