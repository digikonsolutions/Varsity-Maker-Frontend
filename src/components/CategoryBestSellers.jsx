/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - 3D Stereo Badges System for Category Best Sellers
   ========================================================================== */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AiFillStar } from 'react-icons/ai';
import { ImFire } from 'react-icons/im';
import { storageurl } from "../constants/baseurls.jsx";
import { addToCart } from '../slices/cart/cartSlice.jsx';
import './CategoryBestSellers.css';

/* --------------------------------------------------------------------------
   Helper: normalize product images into a clean array of path strings.
   Defined at MODULE SCOPE so it's created once and is available everywhere.
   Handles:
     1) Array of paths      -> ["products/a.png", "products/b.png"]  (current API)
     2) JSON string         -> '["products/a.png","products/b.png"]'
     3) Single plain string -> "products/a.png"
   -------------------------------------------------------------------------- */
const parseImages = (mainImage) => {
  if (!mainImage) return [];

  // Already an array
  if (Array.isArray(mainImage)) {
    // Handle old malformed data: a single JSON-encoded string inside an array
    if (
      mainImage.length === 1 &&
      typeof mainImage[0] === "string" &&
      mainImage[0].trim().startsWith("[")
    ) {
      try {
        const parsed = JSON.parse(mainImage[0]);
        return Array.isArray(parsed) ? parsed : mainImage;
      } catch {
        return mainImage;
      }
    }
    return mainImage;
  }

  // A single string (could be a JSON array string OR a plain path)
  if (typeof mainImage === "string") {
    const value = mainImage.trim();
    if (value === "") return [];

    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }

    return [value]; // single image path
  }

  return [];
};

const CategoryBestSellers = ({ setCartOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, loading } = useSelector((state) => state.collectionProducts);
  const bestSellersData = items ? items.slice(0, 4) : [];

  const handleProductClick = (product) => {
    const productId = product.id || product._id;
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const fixedProduct = { ...product, id: product.id || product._id };
    dispatch(addToCart(fixedProduct));
    if (setCartOpen) setCartOpen(true);
  };

  if (loading) return null;
  if (!bestSellersData || bestSellersData.length === 0) return null;

  return (
    <section className="v-maker-bestsellers-section">
      <div className="v-maker-bestsellers-container">

        {/* Modern Section Header */}
        <div className="v-maker-bestsellers-header">
          <span className="v-maker-bestsellers-subtitle">Curated Collection</span>
          <h2 className="v-maker-bestsellers-title">Our Best Sellers</h2>
        </div>

        {/* 4-Column Responsive Dynamic Premium Grid */}
        <div className="v-maker-product-grid">
          {bestSellersData.map((product) => {
            const isLowStock = product.stock <= 5;
            const piecesLeft = product.stock;
            const productTag = product.tag || (product.rating >= 4.7 ? "Best Seller" : "Most Popular");

            const parsedImages = parseImages(product.main_image);
            const defaultImage = parsedImages[0] || "";
            const hoverImage = parsedImages[1] || "";

            const discountPercent = product.price && product.discount_price
              ? ((parseFloat(product.discount_price) / parseFloat(product.price)) * 100).toFixed(0)
              : "0";

            return (
              <div
                key={product.id || product._id}
                className="v-maker-product-card"
                onClick={() => handleProductClick(product)}
              >
                {/* 3D FLOATING BATCHES ROW CONTAINER */}
                <div className="v-maker-product-tags-row">
                  <span className="v-maker-tag-popular cat-3d-luxe-badge">{productTag}</span>
                  <span className={`v-maker-tag-instock cat-3d-luxe-badge ${isLowStock ? 'low-stock-tint' : ''}`}>
                    {isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Image Wrapper Frame */}
                <div className="v-maker-product-image-wrapper">
                  <img
                    src={`${storageurl}${defaultImage}`}
                    alt={product.name}
                    className="v-maker-product-img default-img"
                  />

                  {hoverImage && hoverImage !== defaultImage && (
                    <img
                      src={`${storageurl}${hoverImage}`}
                      alt={product.name}
                      className="v-maker-product-img hover-img"
                    />
                  )}

                  <div className="v-maker-image-hover-action-gate">
                    <button
                      className="v-maker-image-instant-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                {/* Product Info Suite */}
                <div className="cat-v-maker-product-details">
                  <div className="v-maker-title-price-row">
                    <h3 className="v-maker-product-name">{product.name}</h3>
                    <span className="v-maker-product-price">$ {product.price}</span>
                  </div>

                  {/* Ratings & 3D Discount Area */}
                  <div className="v-maker-rating-discount-row">
                    <div className="v-maker-rating-block">
                      <span className="v-maker-rating-num">{product.rating || "4.5"}</span>
                      <div className="v-maker-stars-group">
                        {[...Array(5)].map((_, i) => (
                          <AiFillStar key={i} className="v-maker-star-icon" />
                        ))}
                      </div>
                      <span className="v-maker-reviews-count">({product.reviews || "25k+"})</span>
                    </div>

                    {parseFloat(discountPercent) > 0 && (
                      <span className="v-maker-discount-badge cat-3d-luxe-badge">{discountPercent}% OFF</span>
                    )}
                  </div>

                  {/* Stock Status Urgency Row */}
                  <div className="v-maker-status-container">
                    {product.stock < 30 ? (
                      <div className="v-maker-stock-urgency">
                        <ImFire className="v-maker-fire-icon" />
                        <span>Only {piecesLeft} pieces left! Hurry up</span>
                      </div>
                    ) : (
                      <div className="v-maker-ready-to-ship">
                        In stock & ready to ship
                      </div>
                    )}
                  </div>

                  {/* Action Premium Luxury Button */}
                  <div className="v-maker-card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="v-maker-btn-customize"
                      onClick={() => handleProductClick(product)}
                    >
                      Start Customization
                    </button>
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

export default CategoryBestSellers;