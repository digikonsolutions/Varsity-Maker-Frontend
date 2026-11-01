import React, { useState, useEffect } from "react";
import "./PatchesEmbroidery.css";
import { useSelector, useDispatch } from 'react-redux';
import { getpatchesthunk } from '../slices/patches/patchesslice.jsx';
import { storageurl } from '../constants/baseurls.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export default function PatchesEmbroidery() {
  const [lightbox, setLightbox] = useState(null);
  const dispatch = useDispatch();
  
  // Fetching data from Redux state
  const { items, loading, error } = useSelector(
    (state) => state.patches
  );

  useEffect(() => {
    dispatch(getpatchesthunk());
  }, [dispatch]);

  // Smooth Scroll Handler Function
  const handleScrollToSection = (e, id) => {
    e.preventDefault(); // Prevents default anchor tag jump
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // Smooth transition animation
        block: "start"      // Aligns to the top of viewport
      });
    }
  };

  return (
    <div className="page">

      {/* HERO SECTION */}
      <section className="patch-hero">
        <div className="patch-overlay" />
        <div className="patch-hero-content">
          <p className="patch-tagline">
            For Schools, Teams & Brands
          </p>
          <h1>
            Varsity Jacket Patches
            <span>& Embroidery</span>
          </h1>
          <p>
            Premium patch placement, embroidery,
            chenille patches, woven patches,
            tackle twill and more.
          </p>
          <div className="patch-hero-cta">
            <button className="patch-btn patch-btn-primary-hero">
              Online Jacket Builder
            </button>
            <button className="patch-btn patch-btn-glass">
              Browse Materials
            </button>
          </div>
        </div>
      </section>

      {/* DYNAMIC STICKY NAV (Linked directly with API Data) */}
      <div className="sticky-nav">
        {items && items.length > 0 ? (
          items.map((section) => (
            <a 
              key={section.id} 
              href={`#${section.id}`}
              onClick={(e) => handleScrollToSection(e, section.id)}
            >
              {section.name} {/* API se dynamic name show hoga */}
            </a>
          ))
        ) : (
          <span className="nav-loading-text">Loading Filters...</span>
        )}
      </div>

      {/* PLACEMENT INFO SECTION */}
      <section className="placement-section">
        <div className="placement-content">
          <div>
            <h2>Patch Placement & Sizes</h2>
            <p>
              We scale your artwork to match the jacket size, from XS to 6XL. Below are standard sizes for a Medium jacket.
            </p>
            <p>The front view shows common spots for letters, numbers, names, and small detail patches. The back view shows spots for large names, big numbers, and main graphics.</p>
            <h2>Which Method Should You Choose?</h2>
            <ul>
              <li><strong>Small text:</strong> Woven patches or direct embroidery</li>
              <li><strong>3D look:</strong> Chenille patches or puff embroidery</li>
              <li><strong>Budget option:</strong> Felt patches or screen printing</li>
              <li><strong>Full color artwork:</strong> DTF printing or sublimation (poly fabrics)</li>
              <li><strong>Heavy wear:</strong> Tackle twill or direct embroidery</li>
            </ul>
          </div>

          <div className="placement-images">
            <img src="./placement-front.jpg" alt="Front View" />
            <img src="./placement-back.jpg" alt="Back View" />
          </div>
        </div>

        {/* Responsive Production Note */}
        <div className="production-note-container">
          <div className="production-icon-box">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="production-fa-icon"
            />
          </div>
          <div className="production-content-text">
            <strong className="production-highlight-label">Production Note:</strong> We scale all artwork to match your final jacket dimensions perfectly. On request: We can send a digital proof so you can review patch placement before production. To get a proof, leave a note in the jacket builder.
          </div>
        </div>
      </section>
      
      {/* DYNAMIC PATCH SECTIONS */}
      <>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message-box">Something went wrong. Please try again.</div>
        ) : (
          items?.map((section) => (
            <section
              key={section.id}
              id={section.id} /* This ID links with sticky nav href */
              className="patch-section"
            >
              <div className="section-header">
                <h2>{section.name}</h2>
                <p>{section.description}</p>
                {section.subname && <div className="sub-name">{section.subname}</div>}
              </div>

              {/* Gallery Grid */}
              <div className="gallery-grid">
                {section.images?.flatMap((imgObj, i) =>
                  imgObj.images?.map((img, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="image-card"
                      onClick={() => setLightbox(`${storageurl}${img}`)}
                    >
                      <img src={`${storageurl}${img}`} alt="" />
                      <div className="zoom"></div>
                    </div>
                  ))
                )}
              </div>

              {/* Luxury Bento Grid Layout */}
              <div className="luxury-bento-grid">
                {section.sections?.map((sec, i) => {
                  const cardLayoutClass = i === 0 || i === 3 ? "luxury-card luxury-card-full" : "luxury-card";
                  
                  return (
                    <div key={i} className={cardLayoutClass}>
                      <div className="luxury-card-indicator"></div>

                      {sec.title && (
                        <div className="luxury-card-header">
                          <span className="luxury-icon-box">
                            {i === 0 && "🔥"}
                            {i === 1 && "✨"}
                            {i > 1 && "💡"}
                          </span>
                          <h3 className="luxury-title">{sec.title}</h3>
                        </div>
                      )}

                      {sec.type === "text" && (
                        <p className="luxury-text">
                          {sec.content}
                        </p>
                      )}

                      {sec.type === "list" && (
                        <ul className="luxury-list">
                          {sec.items?.map((item, j) => (
                            <li key={j} className="luxury-list-item">
                              <span className="luxury-gold-dot" />
                              <span className="luxury-list-content">{item.value}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

            </section>
          ))
        )}
      </>
      
      {/* CALL TO ACTION */}
      <section className="patch-cta">
        <h2>Ready To Design Your Own Jacket?</h2>
        <p>Create your custom varsity jacket today.</p>
        <button>Design Your Own</button>
      </section>

      {/* LIGHTBOX COMPONENT */}
      {lightbox && (
        <div
          className="lightbox"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Enlarged View" />
        </div>
      )}
    </div>
  );
}