// ProductDetailGallery.jsx
import React, { useState } from "react";
import './ProductDetailGallery.css';

const galleryImages = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
  },
];

const ProductDetailGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  return (
    <>
      <section className="pd-gallery-section">
        <div className="pd-gallery-header">
          <h2>#THEJACKETMAKER CUSTOMERS GALLERY</h2>
          <p>
            TAG #THEJACKETMAKER OR UPLOAD YOUR PHOTOS TO BE FEATURED IN OUR
            GALLERY.
          </p>
        </div>

        <div className="pd-gallery-grid">
          {galleryImages.map((item) => (
            <div className="pd-gallery-item" key={item.id}>
              <img src={item.image} alt="gallery" />
              <div className="pd-gallery-overlay">
                <button 
                  className="pd-gallery-img-btn"
                  onClick={() => openLightbox(item.image)}
                >
                  VIEW DETAILS
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pd-gallery-btn-wrap">
          <button className="pd-gallery-btn">VIEW COMPLETE GALLERY</button>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="pd-lightbox" onClick={closeLightbox}>
          <div className="pd-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="pd-lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailGallery;