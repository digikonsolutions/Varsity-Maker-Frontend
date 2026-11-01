/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - 3D Stereoscopic Badge Overlays Engine
   ========================================================================== */

import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchproducts } from "../slices/products/productslice.jsx";
import { storageurl } from "../constants/baseurls.jsx";
import LoadingSpinner from './LoadingSpinner.jsx';

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import CartDrawer from '../pages/CartDrawer.jsx';
import { addToCart } from '../slices/cart/cartSlice.jsx';

import "./BestSellers.css";

gsap.registerPlugin(ScrollTrigger);

/* ================= LUXURY STAR ICON ================= */
const Star = ({ filled = true }) => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    className="home-bestsellers-star-icon"
    fill={filled ? "currentColor" : "none"}
  >
    <path
      d="M12 17.3l-5.2 3 1.4-5.9L3.6 9.7l6.1-.5L12 3.6l2.3 5.6 6.1.5-4.6 4.7 1.4 5.9-5.2-3Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/* ================= SAFE IMAGE PARSER ================= */
// Data kisi bhi shakal mein aaye (JSON string, array, ya plain string) — crash na kare
const parseImages = (raw) => {
  if (!raw) return [];

  // Case 1: array of strings jaise ["a.jpg", "b.jpg"] ya ['["a.jpg","b.jpg"]']
  if (Array.isArray(raw)) {
    if (typeof raw[0] === "string" && raw[0].trim().startsWith("[")) {
      try {
        return JSON.parse(raw[0]);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  // Case 2: single JSON string jaise '["a.jpg","b.jpg"]'
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return [raw];
      }
    }
    // Case 3: plain single image path jaise "products/carter.png"
    return [raw];
  }

  return [];
};

/* ================= COMPACT PREMIUM CARD CONTAINER ================= */
function ProductCard({
  title,
  price,
  rating,
  images,
  onAddToCart
}) {

  const parsedImages = parseImages(images);

  return (
    <div className="home-bestsellers-product-card">
      
      {/* 3D FLOATING TAGS CONTAINER */}
      <div className="home-bestsellers-tags-row">
        <span className="home-bestsellers-tag-popular 3d-luxe-layer">POPULAR</span>
        <span className="home-bestsellers-tag-instock 3d-luxe-layer">IN STOCK</span>
      </div>

      {/* IMAGE CONTAINER SHELL */}
      <div className="home-bestsellers-image-wrapper">

        <img
          src={`${storageurl}${parsedImages?.[0] || ""}`}
          alt={title}
          className="home-bestsellers-product-img primary-img"
        />

        {parsedImages?.[1] && (
          <img
            src={`${storageurl}${parsedImages[1]}`}
            alt={title}
            className="home-bestsellers-product-img secondary-img"
          />
        )}

        <div className="home-bestsellers-hover-action-gate">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="home-bestsellers-instant-btn"
          >
            Add to Cart
          </button>
        </div>

      </div>

      {/* METADATA CONTENT AREA */}
      <div className="home-bestsellers-product-details">
        <div className="home-bestsellers-title-price-row">
          <h3 className="home-bestsellers-product-name">{title}</h3>
          <span className="home-bestsellers-product-price">Rs {price?.toLocaleString()}</span>
        </div>

        <div className="home-bestsellers-rating-discount-row">
          <div className="home-bestsellers-rating-block">
            <span className="home-bestsellers-rating-num">{rating?.rate || 4.5}</span>
            <div className="home-bestsellers-stars-group">
              <Star filled />
              <Star filled />
              <Star filled />
              <Star filled />
              <Star filled={false} />
            </div>
            <span className="home-bestsellers-reviews-count">({rating?.count || "48"})</span>
          </div>
          
          {/* 3D ACCENT DISCOUNT BADGE */}
          <span className="home-bestsellers-discount-badge 3d-luxe-layer">-10% OFF</span>
        </div>

        <div className="home-bestsellers-status-container">
          <span className="home-bestsellers-ready-to-ship">
            Ready to Ship Fast
          </span>
        </div>

        {/* ACTION CTA */}
        <div className="home-bestsellers-card-actions-wrapper">
          <button className="home-bestsellers-btn-customize">
            Design Your Jacket
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= CORE ROOT MODULE ================= */
export default function BestSellers() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const sectionRef = useRef(null);
  const [cartopen, setcartopen] = useState(false);

  const productsList = items?.data?.products || [];

  useEffect(() => {
    dispatch(fetchproducts());
  }, [dispatch]);

  const HandleAddtoCart = (product) => {
    if (!product) return;

    const payload = {
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      main_image: product.main_image,
      sizes: product.sizes,
      selectedSize: 'M',
      quantity: 1,
    };

    dispatch(addToCart(payload));
    setcartopen(true);
  };

  useLayoutEffect(() => {
    if (productsList.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(".home-bestsellers-title", {
        scrollTrigger: {
          trigger: ".home-bestsellers-header",
          start: "top 85%",
          end: "top 30%",
          scrub: 1,
        },
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out",
      });

      gsap.utils.toArray(".home-bestsellers-product-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [productsList]);

  if (loading) return <LoadingSpinner />;
  if (error) return <h2 style={{ color: "#fff", textAlign: "center" }}>Error: {error}</h2>;

  return (
    <>
      <section className="home-bestsellers-section" ref={sectionRef}>
        <div className="home-bestsellers-container">
          
          <div className="home-bestsellers-header">
            <span className="home-bestsellers-subtitle">Our loved items</span>
            <h2 className="home-bestsellers-title">Best Sellers</h2>
          </div>

          <div className="home-bestsellers-grid">
            {productsList.slice(1, 5).map((product, idx) => (
              <ProductCard
                key={product.id || product._id || idx}
                title={product.name}
                price={product.price}
                rating={product.rating}
                images={product.main_image}
                onAddToCart={() => HandleAddtoCart(product)}
              />
            ))}

            {productsList.length === 0 && (
              <div style={{ color: "#0f172a", textAlign: "center", gridColumn: "1/-1", padding: "40px 0" }}>
                No Best Seller products found.
              </div>
            )}
          </div>

        </div>
      </section>

      <CartDrawer open={cartopen} onClose={() => setcartopen(false)} />
    </>
  );
}