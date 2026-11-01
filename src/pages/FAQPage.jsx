import { useState } from "react";
import {
  faCircleQuestion,
  faBox,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./FAQPage.css";

const categories = [
  { id: "general", label: "General", icon: faCircleQuestion },
  { id: "orders", label: "Orders & Shipping", icon: faBox },
  { id: "payments", label: "Payments", icon: faCreditCard },
];

const faqData = {
  general: [
    { question: "What is your return policy?",          answer: "You can return any item within 14 days of purchase for a full refund. No questions asked, as long as the item is in its original condition and packaging." },
    { question: "Do you offer customer support?",       answer: "Yes, we offer 24/7 dedicated customer support via live chat and email. Our average response time is under 10 minutes, even on weekends and holidays." },
    { question: "How do I create an account?",          answer: "Simply click the 'Sign Up' button on the top right, enter your email and a secure password, and you're good to go. Account creation takes under 30 seconds." },
    { question: "Can I update my account information?", answer: "Absolutely. Head to your profile settings at any time to update your name, email, password, or billing details. All changes are saved instantly." },
    { question: "Is my personal data safe with you?",   answer: "We take data privacy very seriously. All personal information is stored with AES-256 encryption. We never sell or share your data with third parties and are fully GDPR compliant." },
  ],
  orders: [
    { question: "How long does delivery take?",         answer: "Standard delivery takes 3–7 business days depending on your location. Express (1–2 days) and same-day options are available at checkout for eligible areas." },
    { question: "Can I track my order?",                answer: "Yes! Once your order is dispatched, you'll receive an email with a live tracking link. You can monitor your shipment in real time directly from the confirmation email." },
    { question: "Can I cancel or modify my order?",     answer: "Orders can be cancelled or modified within 1 hour of placement. After that window our fulfillment process begins — please contact support immediately if you need a change." },
    { question: "What if my package arrives damaged?",  answer: "We're sorry to hear that! Take photos of the damaged item and packaging, then contact our support team within 48 hours. We'll send a replacement or issue a full refund — your choice." },
    { question: "Do you offer international shipping?", answer: "Yes, we ship to over 50 countries worldwide. International delivery typically takes 7–14 business days. Customs duties and import taxes may apply depending on your country." },
  ],
  payments: [
    { question: "What payment methods do you accept?",  answer: "We accept all major credit and debit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, Google Pay, and direct bank transfers for orders above $500." },
    { question: "Is my payment information secure?",    answer: "Absolutely. We use SSL/TLS encryption and are Level 1 PCI-DSS compliant. Your card details are never stored on our servers — all transactions are fully tokenized." },
    { question: "Can I pay in installments?",           answer: "Yes! We've partnered with Klarna and Afterpay for Buy Now, Pay Later. Split your purchase into 4 interest-free installments at no extra cost to you." },
    { question: "When will I be charged for my order?", answer: "Payment is authorized at order placement and fully captured when your order ships. You'll receive an email receipt immediately after the charge is processed." },
    { question: "How do refunds work?",                 answer: "Once your return is received and inspected (usually within 2 business days), the refund is sent to your original payment method. Bank transfers may take an additional 3–5 business days." },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery]       = useState("");
  const [openIndex, setOpenIndex]           = useState(0);

  const handleSearch = (e) => { setSearchQuery(e.target.value); setOpenIndex(null); };
  const handleCategory = (id) => { setActiveCategory(id); setOpenIndex(null); };
  const handleToggle = (i) => setOpenIndex((p) => (p === i ? null : i));

  const q = searchQuery.trim().toLowerCase();
  let displayedFaqs = [];

  if (q) {
    Object.values(faqData).forEach((items) =>
      items.forEach((item) => {
        if (item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q))
          displayedFaqs.push(item);
      })
    );
  } else {
    displayedFaqs = faqData[activeCategory] || [];
  }

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <div className="faq-page">

      {/* ── HERO ── */}
      <section className="faq-hero">
        <div className="faq-hero-bar" />
        <div className="hero-inner-faq">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            Help Center
          </span>

          <h1 className="hero-title-faq">
            How can we{" "}
            <span className="hero-title--gold">help you?</span>
          </h1>

          <p className="hero-sub">
            Search our knowledge base or browse the categories below.
          </p>

          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search questions, keywords, topics…"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search FAQs"
            />
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="faq-body">

        {/* Category tabs */}
        {!q && (
          <div className="cat-tabs" role="tablist">
            {categories.map((cat) => (
  <button
    key={cat.id}
    role="tab"
    aria-selected={activeCategory === cat.id}
    className={`cat-tab${activeCategory === cat.id ? " cat-tab--active" : ""}`}
    onClick={() => handleCategory(cat.id)}
  >
    <span className="cat-tab__icon" aria-hidden="true">
      <FontAwesomeIcon icon={cat.icon} style={{ fontSize: "18px" }} />
    </span>

    <span className="cat-tab__label">
      {cat.label}
    </span>
  </button>
))}
          </div>
        )}

        {/* Section label */}
        {!q && (
          <div className="section-label">
            <div className="section-label__line" />
            <span className="section-label__text">{activeCat?.label}</span>
            <div className="section-label__line" />
          </div>
        )}

        {/* Search count */}
        {q && (
          <p className="search-count" aria-live="polite">
            Found <span className="search-count--gold">{displayedFaqs.length}</span>{" "}
            result{displayedFaqs.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* FAQ Accordion */}
        {displayedFaqs.length > 0 ? (
          <div className="faq-list" role="list">
            {displayedFaqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={`${activeCategory}-${index}`}
                  className={`faq-item${isOpen ? " faq-item--open" : ""}`}
                  role="listitem"
                >
                  <button
                    className="faq-question"
                    onClick={() => handleToggle(index)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <span className="faq-question__text">{item.question}</span>
                    <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="faq-answer-wrap" aria-hidden={!isOpen}>
                    <div className="faq-answer-inner">
                      <p className="faq-answer">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results" role="status">
            <span className="no-results__icon" aria-hidden="true">🔍</span>
            <h3 className="no-results__title">No answers found</h3>
            <p className="no-results__sub">Try different keywords or browse a category above.</p>
          </div>
        )}

        {/* CTA */}
        <div className="faq-cta">
          <div className="faq-cta__orb" aria-hidden="true" />
          <div className="faq-cta__text">
            <h3 className="faq-cta__title">Still have questions?</h3>
            <p className="faq-cta__sub">Can't find the answer? Our friendly team is here to help.</p>
          </div>
          <button
  className="faq-cta__btn"
  onClick={() => window.location.href = "/contact"}
>
  Get In Touch
</button>
        </div>

      </div>
    </div>
  );
}