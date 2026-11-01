import { useState } from "react";
import "./Privacypolicy.css";

const policies = [
  {
    id: "terms",
    icon: "📋",
    label: "Terms & Conditions",
    lastUpdated: "June 1, 2026",
    sections: [
      {
        title: "Acceptance of Terms",
        content:
          "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.",
      },
      {
        title: "Use License",
        content:
          "Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.",
      },
      {
        title: "Disclaimer",
        content:
          "The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability.",
      },
      {
        title: "Limitations",
        content:
          "In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.",
      },
      {
        title: "Governing Law",
        content:
          "These terms and conditions are governed by and construed in accordance with the laws of Austria and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.",
      },
      {
        title: "Modifications",
        content:
          "We may revise these terms of service for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.",
      },
    ],
  },

 
];

export default function TermsandconditionsPage() {
  const [activePolicy, setActivePolicy] = useState("terms");
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
        <h1>Terms & Conditions</h1>
        <p className="policy-hero-sub">
          Transparency is at the core of everything we do.
        </p>
      </div>

     

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