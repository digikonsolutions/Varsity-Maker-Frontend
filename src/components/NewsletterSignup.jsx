import React from "react";

const NewsletterSignup = () => {
  return (
    <section className="ns-container">
      <div className="ns-box">
      <h2>
  Stay ahead of the <span className="ns-curve">curve</span>
  <span className="ns-dot">.</span>
</h2>

        <p>
          Join 10,000+ readers who receive our weekly digest of the most
          compelling stories in design and culture.
        </p>

        <div className="ns-form">
          <input type="email" placeholder="Enter your email" />
          <button>Join Now</button>
        </div>

        <small>
          By subscribing, you agree to our Privacy Policy and Terms of Service.
        </small>
      </div>
    </section>
  );
};

export default NewsletterSignup;