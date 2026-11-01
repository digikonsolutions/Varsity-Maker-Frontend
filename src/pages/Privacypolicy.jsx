import { useState } from "react";
import "./Privacypolicy.css";

const policies = [
  {
    id: "privacy",
    icon: "🔒",
    label: "Privacy Policy",
    lastUpdated: "June 1, 2026",
    sections: [
      {
        title: "Information We Collect",
        content:
          "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, payment information, and any other details you choose to provide.",
      },
      {
        title: "How We Use Your Information",
        content:
          "We use the information we collect to process transactions, send order confirmations, respond to your requests, send promotional communications (with your consent), improve our services, and comply with legal obligations.",
      },
      {
        title: "Information Sharing",
        content:
          "We do not sell, trade, or otherwise transfer your personal information to outside parties except trusted third parties who assist us in operating our website, conducting our business, or servicing you — provided those parties agree to keep this information confidential.",
      },
      {
        title: "Data Security",
        content:
          "We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights.",
      },
      {
        title: "Cookies",
        content:
          "We use cookies to enhance your experience, gather general visitor information, and track visits to our website. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies via your browser settings.",
      },
      {
        title: "Your Rights",
        content:
          "You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving marketing communications from us. To exercise these rights, please contact us using the information provided below.",
      },
    ],
  },

];

export default function PolicyPage() {
  const [activePolicy, setActivePolicy] = useState("privacy");
  const [openSections, setOpenSections] = useState({
    0: true
  });

  const current = policies[0];

  const toggleSection = (idx) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="policy-page">
      {/* HERO */}
      <div className="policy-hero">
        <span className="policy-badge">LEGAL & POLICIES</span>
        <h1>Privacy Policy</h1>
        <p className="policy-hero-sub">
          Transparency is at the core of everything we do.
        </p>
      </div>

      {/* TABS */}
      {/* <div className="policy-tabs-wrapper">
        <div className="policy-tabs">
          {policies.map((p) => (
            <button
              key={p.id}
              className={`policy-tab ${activePolicy === p.id ? "active" : ""}`}
              onClick={() => {
                setActivePolicy(p.id);
                setOpenSections({});
              }}
            >
              <span className="tab-icon">{p.icon}</span>
              <span className="tab-label">{p.label}</span>
            </button>
          ))}
        </div>
      </div> */}

      {/* CONTENT */}
      <div className="policy-content">
        <div className="policy-header-row">
          <div>
            <h2 className="policy-title">{current.label}</h2>
            <p className="policy-updated">Last updated: {current.lastUpdated}</p>
          </div>
          <div className="policy-icon-large">{current.icon}</div>
        </div>

        <div className="policy-intro">
          <p>
            Please read this {current.label.toLowerCase()} carefully before
            using our services. By accessing or using our website, you agree to
            be bound by the terms described herein.
          </p>
        </div>

        <div className="policy-accordion">
          {current.sections.map((section, idx) => (
            <div
              key={idx}
              className={`accordion-item ${openSections[idx] ? "open" : ""}`}
            >
              <button
                className="accordion-header"
                onClick={() => toggleSection(idx)}
              >
                <span className="accordion-num">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="accordion-title">{section.title}</span>
                <span className="accordion-arrow">
                  {openSections[idx] ? "−" : "+"}
                </span>
              </button>
              {openSections[idx] && (
                <div className="accordion-body">
                  <p>{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CONTACT CTA */}
        <div className="policy-contact-cta">
          <p>
            Have questions about our {current.label.toLowerCase()}?{" "}
            <a href="/contact" className="policy-link">
              Contact us
            </a>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>
    </div>
  );
}