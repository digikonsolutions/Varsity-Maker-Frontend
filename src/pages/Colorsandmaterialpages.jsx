import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getcolorsandmaterialsthunk } from '../slices/colorsandmaterials/colorsandmaterialsslice'; 
import { Shield, Droplet, Paintbrush, Wind, Sparkles, Check, Layers } from 'lucide-react';
import './ColorsAndMaterials.css'; 
import {storageurl} from '../constants/baseurls.jsx'
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ColorsAndMaterialsPage = () => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);
  const { items, loading, error } = useSelector((state) => state.colorsandmaterials);

  useEffect(() => {
    dispatch(getcolorsandmaterialsthunk());
  }, [dispatch]);

  const materialsList = items?.data || items || [];

  const getIcon = (iconName) => {
    const iconProps = { size: 18, className: "boutique-svg-icon" };
    switch (iconName?.toLowerCase()) {
      case 'fa-droplet-slash': return <Droplet {...iconProps} />;
      case 'fashieldalt': return <Shield {...iconProps} />;
      case 'fa-paintbrush': return <Paintbrush {...iconProps} />;
      case 'fa-droplet': return <Droplet {...iconProps} />;
      case 'fa-gem': return <Sparkles {...iconProps} />;
      case 'fa-check': return <Check {...iconProps} />;
      case 'fa-wind': return <Wind {...iconProps} />;
      default: return <Layers {...iconProps} />;
    }
  };

  const IMAGE_BASE_URL = 'https://your-api-domain.com/storage/'; 

  if (loading) {
    return (
      <div className="boutique-loader-screen">
        <div className="boutique-spinner-container">
          
          <LoadingSpinner/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="boutique-error-screen">
        <div className="boutique-error-box">
          <h3>Offline</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(getcolorsandmaterialsthunk())} className="boutique-retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="boutique-page-container">
      
      {/* High-End Minimalist Header */}
      <header className="boutique-main-header">
        <span className="boutique-pre-title">Premium Material Archive</span>
        <h1 className="boutique-main-title">Colors & Materials</h1>
        <div className="boutique-title-divider"></div>
        <p className="boutique-lead-paragraph">
          Explore our bespoke textile registry, premium architectural finishes, and heritage color matrix engineered for luxury outerwear styling.
        </p>
        <div class="colors-hero-cta"><button class="colors-btn colors-btn-primary-hero">Online Jacket Builder</button><button class="colors-btn colors-btn-glass">Browse Materials</button></div>
      </header>

      {/* Streamlined Infinite Scroll Sections Layout */}
      <div className="boutique-sections-layout">
        {materialsList.map((material, matIdx) => (
          <section key={material.id || matIdx} className="boutique-material-section">
            
            {/* Premium Content Banner Grid */}
            <div className="boutique-hero-panel">
              <div className="boutique-hero-details">
                <span className="boutique-section-pill">Fabric Specification 0{matIdx + 1}</span>
                <h2 className="boutique-material-title">{material.subname}</h2>
                <p className="boutique-material-desc">
                  {material.description || "Premium high-density engineered composite construction optimized for couture lines and apparel configurations."}
                </p>

                {/* Minimal Spec Tags Stack */}
                <div className="boutique-spec-grid">
                  {material.top_points?.map((point, index) => (
                    <div key={index} className="boutique-spec-pill">
                      <div className="boutique-pill-icon-frame">{getIcon(point.icon)}</div>
                      <span className="boutique-pill-label">{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimalist Border Box Showcase Image */}
              <div className="boutique-hero-media">
                <div className="boutique-image-canvas">
                  {material.feature_image ? (
                    <img
                      src={`${storageurl}${material.feature_image}`}
                      alt={material.subname}
                      className="boutique-canvas-img"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=600&q=80'; }}
                    />
                  ) : (
                    <div className="boutique-image-fallback">
                      <Layers size={32} className="fallback-gray-icon" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Swatches Matrix Panel */}
            {material.blocks && material.blocks.length > 0 && (
              <div className="boutique-swatches-panel">
                
                <div className="boutique-swatches-header">
                  <div className="boutique-swatches-title-block">
                    <h4>{material.content_heading || "Available Palette"}</h4>
                    <p>Select tailored finishes, architectural weaves, and signature custom shades.</p>
                  </div>
                  
                  <div className="boutique-tags-row">
                    {material.content_items?.map((meta, idx) => (
                      <div key={idx} className="boutique-meta-tag">
                        <span>{meta.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clean High-Contrast Palette Matrix */}
               <div className="boutique-colors-grid">
  {material.blocks
    ?.filter((block) => block.feature_image)
    .map((block, index) => (
      <div
        key={index}
        className="boutique-color-card"
        onClick={() =>
          setSelectedImage(`${storageurl}${block.feature_image}`)
        }
      >
        <div className="boutique-color-frame">
          <img
            src={`${storageurl}${block.feature_image}`}
            alt={block.heading}
            className="boutique-color-img"
          />

          <div className="boutique-color-hover-curtain">
            <span className="boutique-hover-label">View</span>
          </div>
        </div>

        <div className="boutique-color-meta">
          <h5>{block.heading}</h5>
        </div>
      </div>
    ))}
</div>

              </div>
            )}
            
            {/* Premium Section Break Divider Line */}
            {matIdx < materialsList.length - 1 && <hr className="boutique-section-divider" />}
            
          </section>
        ))}
      </div>
     <Lightbox
  open={!!selectedImage}
  close={() => setSelectedImage(null)}
  slides={
    selectedImage
      ? [{ src: selectedImage }]
      : []
  }
  plugins={[Zoom]}
/>
    </div>
    
  );
};

export default ColorsAndMaterialsPage;