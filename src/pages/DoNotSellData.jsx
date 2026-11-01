import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoNotSellData.css";

const DoNotSellData = () => {
  const navigate = useNavigate();
  const [optedOut, setOptedOut] = useState(false);

  return (
    <div className="collections-page privacy-gate-page">
      
      {/* SECTION 1: BREADCRUMB & HEADER */}
      <header className="privacy-hero-header">
        <div className="container-luxury">
          <nav className="luxury-breadcrumb">
            <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Do Not Sell My Data</span>
          </nav>
          
          <div className="section-title-wrapper-left">
            <span className="gold-mini-tag">PRIVACY RIGHTS</span>
            <h1 className="luxury-section-title large-title">Privacy Choices</h1>
          </div>
        </div>
      </header>

      {/* SECTION 2: EDITORIAL LAW BRIEF & CONTROLS */}
      <section className="privacy-body-section">
        <div className="container-luxury">
          <div className="editorial-layout-box privacy-grid-box">
            
            {/* Left Column: Description Text */}
            <div className="editorial-content-block privacy-text-block">
              <h2 className="editorial-heading">Your Data. <br /><span className="serif-gold-text">Your Sovereignty.</span></h2>
              <p className="editorial-text">
                We gather personal data through your engagement with us and our website, utilizing cookies and similar technologies. This information may be shared with third-party entities, including our advertising partners, to present you with advertisements on other sites tailored to your interests, among other purposes detailed in our privacy policy.
              </p>
              <p className="editorial-text legal-fine-print">
                Certain privacy regulations may classify the distribution of personal data for targeted advertising, based on your activities across various websites, as "sales," "sharing," or "targeted advertising." Depending on your location, you may have the right to opt out of these practices.
              </p>
              <blockquote className="jurisdiction-note">
                <strong>Geographical Notice:</strong> To withdraw from the "sale" or "sharing" of your personal data gathered through cookies and other device-based identifiers as mentioned earlier, you need to be accessing the internet from one of the relevant US states.
              </blockquote>
            </div>

            

          </div>
        </div>
      </section>

      {/* SECTION 3: BRAND ASSURANCE VALUES */}
      <section className="brand-values-bar privacy-values-bar">
        <div className="container-luxury">
          <div className="values-grid-wrapper">
            <div className="value-item">
              <h5>COMPLIANCE SEALS</h5>
              <p>Aligned with CCPA / CPRA and state-level data infrastructure protection benchmarks.</p>
            </div>
            <div className="value-item">
              <h5>ENCRYPTED REFS</h5>
              <p>Your local identifiers and opt-out data signals are cached strictly via encrypted protocols.</p>
            </div>
            <div className="value-item">
              <h5>TRANSPARENT OPERATIONS</h5>
              <p>Zero hidden tracking layer implementations across any our global store sub-domains.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DoNotSellData;