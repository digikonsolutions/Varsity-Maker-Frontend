import React from "react";
import './ProductDetailGiftsec.css';

const ProductDetailGift = () => {
  return (
    <section className="gift-section">
      <div className="gift-content">
        <h2 className="gift-title">THE UNBOXING EXPERIENCE</h2>

        <p className="gift-subtitle">
          OUR NEW & IMPROVED FRONT LOCK MAILER PACKAGING DELIVERS A
          <br />
          FIRST LOOK BEYOND THE ORDINARY
        </p>

        <div className="gift-image-wrapper">
          <img
            src="/gift-box.jpg"
            alt="Gift Boxes"
            className="gift-image"
          />
        </div>
      </div>
    </section>
  );
};

export default ProductDetailGift;