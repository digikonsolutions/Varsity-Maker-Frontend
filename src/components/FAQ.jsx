import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What do your relocation services include?",
      answer: "Our comprehensive relocation services cover everything from secure premium packing and structured loading to safe transportation, unloading, and final unpacking at your new destination."
    },
    {
      question: "Do you handle both individual and team relocations?",
      answer: "Yes, we fully manage individual domestic moves as well as large-scale corporate team relocations with dedicated project managers overseeing the entire transition smoothly."
    },
    {
      question: "How do you ensure belongings are safe?",
      answer: "We utilize industrial-grade, shock-absorbent packing materials, double-walled security crates, and climate-controlled vehicles managed by vetted, professional transit experts."
    },
    {
      question: "What is the typical timeline for an international move?",
      answer: "International relocations generally take between 3 to 6 weeks depending on the destination country, custom clearance protocols, and chosen freight method (air or ocean)."
    },
    {
      question: "Can I track the status of my shipment in real-time?",
      answer: "Absolutely. Once your shipment is dispatched, you will receive a secure tracking link and direct access to an automated portal with live GPS status updates."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="clean-faq-section">
      <div className="clean-faq-container">
        <h2 className="clean-faq-title">Frequently Asked Questions</h2>

        <div className="clean-faq-list">
          {faqData.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div 
                key={index} 
                className={`clean-faq-item ${isOpen ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="clean-faq-question-bar">
                  <h3 className="clean-faq-question">{faq.question}</h3>
                  <span className="clean-faq-icon">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
                <div className="clean-faq-answer-wrapper">
                  <div className="clean-faq-answer-content">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;