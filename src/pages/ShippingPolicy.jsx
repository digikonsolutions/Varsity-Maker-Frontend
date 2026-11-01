import { useState } from "react";
import "./Privacypolicy.css";

const policies = [

  {
    id: "shipping",
    icon: "🚚",
    label: "Shipping Policy",
    lastUpdated: "June 1, 2026",
    sections: [
      {
        title: "Processing Time",
        content:
          "All orders are processed within 1–3 business days. Orders placed on weekends or public holidays will be processed on the next business day. You will receive a confirmation email with tracking information once your order has been shipped.",
      },
      {
        title: "Domestic Shipping",
        content:
          "Standard shipping within Austria takes 3–5 business days and costs €4.99. Express shipping is available for €9.99 and typically arrives within 1–2 business days. Free standard shipping is available on orders over €75.",
      },
      {
        title: "International Shipping",
        content:
          "We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Standard international shipping takes 7–21 business days. Customers are responsible for any customs fees, taxes, or duties imposed by their country.",
      },
      {
        title: "Order Tracking",
        content:
          "Once your order has been shipped, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier's website. Please allow 24 hours for tracking information to become available.",
      },
      {
        title: "Shipping Restrictions",
        content:
          "Some items may be restricted from shipping to certain locations due to local regulations. If we are unable to ship a specific item to your location, we will notify you promptly and provide a full refund.",
      },
      {
        title: "Lost or Stolen Packages",
        content:
          "We are not responsible for packages that are lost or stolen after confirmed delivery. If your tracking shows delivered but you have not received your package, please contact your local carrier or file a claim with the shipping provider.",
      },
    ],
  },
];

export default function ShippingPolicyPage() {
  const [activePolicy, setActivePolicy] = useState("shipping");
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
        <h1>Shipping Policy</h1>
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