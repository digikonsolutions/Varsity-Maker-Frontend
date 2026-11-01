import { useState } from "react";
import "./Privacypolicy.css";

const policies = [
  {
    id: "refund",
    icon: "↩️",
    label: "Refund Policy",
    lastUpdated: "June 1, 2026",
    sections: [
      {
        title: "Return Window",
        content:
          "We offer a 30-day return policy from the date of purchase. Items must be in their original condition, unworn, unwashed, and with all original tags attached. Sale items are final sale and cannot be returned or exchanged.",
      },
      {
        title: "How to Initiate a Return",
        content:
          "To initiate a return, please contact our customer service team at returns@example.com with your order number and reason for return. We will provide you with a return authorization number and instructions within 2 business days.",
      },
      {
        title: "Refund Processing",
        content:
          "Once we receive your returned item and verify its condition, we will process your refund within 5–7 business days. Refunds are issued to the original payment method. Shipping costs are non-refundable unless the return is due to our error.",
      },
      {
        title: "Exchanges",
        content:
          "If you would like to exchange an item for a different size or color, please follow the same return process and place a new order for the desired item. We cannot guarantee availability of exchange items.",
      },
      {
        title: "Damaged or Defective Items",
        content:
          "If you receive a damaged or defective item, please contact us immediately at support@example.com with photos of the damage. We will arrange a replacement or full refund at no additional cost to you.",
      },
      {
        title: "Non-Returnable Items",
        content:
          "Certain items are exempt from being returned including gift cards, downloadable software products, and some health and personal care items. These will be clearly marked as non-returnable on the product page.",
      },
    ],
  },
 
];

export default function RefunPolicyPage() {
  const [activePolicy, setActivePolicy] = useState("refund");
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
        <h1>Refund Policy</h1>
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