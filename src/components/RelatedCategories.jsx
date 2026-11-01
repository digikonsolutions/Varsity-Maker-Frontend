/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - Luxury Varsity Infographic System
   ========================================================================== */

import React, { useEffect } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchcollections } from '../slices/collections/collectionsslice.jsx';
import { storageurl } from '../constants/baseurls.jsx';
import './RelatedCategories.css';

// Bento layout sizes — index ke hisab se cycle honge taake design same rahe
const bentoSizes = [
  'v-maker-size-large',
  'v-maker-size-standard',
  'v-maker-size-standard',
  'v-maker-size-wide',
];

const RelatedCategories = ({ categoriesSectionRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], loading, error } = useSelector(
    (state) => state.collections
  );

  useEffect(() => {
    dispatch(fetchcollections());
  }, [dispatch]);

  // Sirf woh items jinki "show_in_ui" bit true hai
  const filtered = items.filter(
    (item) => item.show_in_ui === true || item.show_in_ui === 1
  );

  // Custom order: reverse karo phir pehle do items swap karo
  // Result -> [2nd-last, last, 3rd-last, ... , first]
  const visibleCategories = filtered.slice().reverse();
  if (visibleCategories.length >= 2) {
    [visibleCategories[0], visibleCategories[1]] =
      [visibleCategories[1], visibleCategories[0]];
  }

  if (loading) {
    return (
      <div className="modern-skeleton-container">
        <div className="skeleton-header-box"></div>
        <div className="skeleton-row-mock">
          <div className="skeleton-large-box"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-state-box">Failed to load premium experience.</div>;
  }

  return (
    <section ref={categoriesSectionRef} className="v-maker-related-categories-section">
      {/* Structural Line Elements for Luxury Architecture Layout */}
      <div className="v-maker-section-axis-line-x"></div>
      <div className="v-maker-section-mesh-matrix"></div>

      <div className="v-maker-categories-container">

        {/* Modern Left-Aligned Asymmetric Header Suite */}
        <div className="v-maker-categories-architectural-header">
          <div className="v-maker-header-title-block">
            <span className="v-maker-section-pill-tag">Categories</span>
            <h2 className="v-maker-section-display-title">Our Main Categories</h2>
          </div>
          <p className="v-maker-header-context-clause">
            Delve into advanced material configurations, premium heavy-weight custom wools, and tailored finishes engineered for legacy endurance.
          </p>
        </div>

        {/* Premium Bento Grid Stream */}
        <div className="v-maker-categories-bento-stream">
          {visibleCategories.map((cat, idx) => {
            const imageUrl = cat.image
              ? `${storageurl}${cat.image}`
              : `https://via.placeholder.com/600x600?text=${encodeURIComponent(cat.name || 'Premium')}`;

            // index ke hisab se size assign (design same rakhne ke liye)
            const sizeClass = bentoSizes[idx % bentoSizes.length];

            return (
              <div
                key={cat.id || `cat-${idx}`}
                className={`v-maker-category-sleek-card ${sizeClass}`}
                onClick={() => navigate(`/products/categories/${cat.slug}`)}
                style={{ cursor: 'pointer' }}
              >

                {/* Premium Background Visual Layer */}
                <div className="v-maker-cat-image-wrapper">
                  <img src={imageUrl} alt={cat.name} loading="lazy" />
                  <div className="v-maker-cat-glass-gradient-overlay"></div>
                  <div className="v-maker-cat-chromatic-glow"></div>
                </div>

                {/* Top Meta Hub */}
                <div className="v-maker-cat-top-meta-hub">
                  {/* <span className="v-maker-cat-item-counter">{cat.count}</span> */}
                  <div className="v-maker-action-hud-trigger">
                    <FiArrowUpRight />
                  </div>
                </div>

                {/* Bottom Details Suite */}
                <div className="v-maker-cat-content-suite">
                  <h4 className="v-maker-cat-display-name">{cat.description}</h4>

                  <div className="v-maker-cat-discover-link">
                    <span>Explore Our Category</span>
                  </div>
                </div>

                {/* Card Corner Architectural Markers */}
                <div className="v-maker-card-hud-marker-tr"></div>
                <div className="v-maker-card-hud-marker-bl"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedCategories;