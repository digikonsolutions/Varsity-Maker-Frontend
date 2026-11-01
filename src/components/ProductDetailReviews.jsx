import React from "react";
import './ProductDetailReviews.css';

const ProductDetailReviews = () => {
  return (
    <div className="pdr-container">
      
      {/* Top Review Section */}
      <div className="pdr-top">
        <p className="pdr-featured-text">AS FEATURED IN</p>

        <div className="pdr-brand-list">
          <span>Refinery29</span>
          <span>Esquire</span>
          <span>Men's Health</span>
          <span>Elle</span>
        </div>

        <h3 className="pdr-heading">
          "A solid brand for first-time buyers"
        </h3>

        <div className="pdr-stars">★★★★★</div>

        <p className="pdr-count">
          OVER 3000 5-STAR CUSTOMER REVIEWS
        </p>
      </div>

      {/* First Difference Section - Image left, Text right */}
      <div className="pdr-diff-section">
        <h2 className="pdr-diff-title">
          THE JACKET MAKER DIFFERENCE
        </h2>

        <div className="pdr-diff-content">
          <div className="pdr-diff-image">
            <img
              src="/rev1.jpg"
              alt="Luxury Jacket"
            />
          </div>

          <div className="pdr-diff-text">
            <h3>FINEST RAW MATERIALS</h3>
            <p>
              It all starts with the raw materials and is one we carry our life
              in our jackets, we don't use anything but only the best possible
              materials. All our jackets are made with full grain natural
              leather, YKK zippers, and polyester lining.
            </p>
          </div>
        </div>
      </div>

      {/* Second Difference Section - Text left, Image right (Swapped) */}
      <div className="pdr-diff-section">
        <div className="pdr-diff-content">
          <div className="pdr-diff-text">
            <h3>EXPERT CRAFTSMANSHIP</h3>
            <p>
              Each jacket is meticulously handcrafted by skilled artisans with 
              years of experience. Every stitch is carefully placed to ensure 
              durability and longevity. Our attention to detail ensures that 
              every jacket meets the highest standards of quality.
            </p>
          </div>

          <div className="pdr-diff-image">
            <img
              src="/rev2.jpg"
              alt="Craftsmanship"
            />
          </div>
        </div>
      </div>

      {/* Third Difference Section - Image left, Text right */}
      <div className="pdr-diff-section">
        <div className="pdr-diff-content">
          <div className="pdr-diff-image">
            <img
              src="/rev3.jpg"
              alt="Premium Quality"
            />
          </div>

          <div className="pdr-diff-text">
            <h3>SUSTAINABLE PRACTICES</h3>
            <p>
              We are committed to sustainable and ethical manufacturing practices. 
              Our leather is sourced from environmentally responsible tanneries, 
              and we minimize waste throughout our production process. When you 
              buy from us, you're supporting responsible fashion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailReviews;