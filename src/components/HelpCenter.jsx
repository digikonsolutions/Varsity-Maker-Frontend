import React, { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How long does a custom jacket take?",
    answer:
      "Each custom varsity jacket is handcrafted in our workshop and typically takes 4–6 weeks for production and delivery, depending on the level of customization.",
  },
  {
    id: 2,
    question: "What is the difference between Classic and Contemporary fit?",
    answer:
      "Classic fit offers a traditional varsity silhouette with a roomier body, while Contemporary fit is slightly more tailored and streamlined for a sharper look.",
  },
  {
    id: 3,
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide. International delivery timelines vary by region, and duties or taxes may apply depending on your country.",
  },
  {
    id: 4,
    question: "Can I return a custom jacket?",
    answer:
      "Because custom jackets are made to order, returns are limited. However, if there is a workmanship issue or production error, we will work with you to make it right.",
  },
];

export default function HelpCenter() {
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="helpCenter">
      <div className="helpCenter-inner">
        <p className="helpCenter-kicker">HELP CENTER</p>
        <h2 className="helpCenter-title">Frequently Asked Questions</h2>

        <div className="helpCenter-list">
          {faqs.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`helpCenter-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="helpCenter-questionRow"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="helpCenter-question">{item.question}</span>
                  <span className="helpCenter-toggle">{isOpen ? "−" : "+"}</span>
                </button>

                <div className={`helpCenter-answerWrap ${isOpen ? "is-open" : ""}`}>
                  <p className="helpCenter-answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}