import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./CollectionsGrid.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchcollections } from "../slices/collections/collectionsslice.jsx";
import { storageurl } from "../constants/baseurls.jsx";

// Swiper Components aur Modules Import
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Swiper Essential Styles
import "swiper/css";
import "swiper/css/navigation";

const CollectionsGrid = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Custom Navigation state triggers
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  const { items = [], loading, error } = useSelector(
    (state) => state.collections
  );

  useEffect(() => {
    dispatch(fetchcollections());
  }, [dispatch]);

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

  if (error) return <div className="error-state-box">Failed to load premium experience.</div>;

  return (
    <div className="collections-page">
      <section className="signature-masonry-section">
        <div className="container-luxury-fluid">
          
          {/* Centered Heading Layout */}
          <div className="luxury-slider-header-centered">
            <span className="gold-mini-tag">CATEGORIES</span>
            <h2 className="luxury-section-title">OUR PREMIUM CATEGORIES</h2>
          </div>

          <div className="luxury-swiper-outer-container">
            {/* Left Edge Arrow Button */}
            <button 
              ref={(el) => setPrevEl(el)} 
              className="lux-edge-nav-btn lux-edge-prev" 
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="luxury-swiper-wrapper">
              {items.length > 0 && (
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1.2}
                  loop={true}
                  speed={1200} // Speed adjusted for manual navigation smoothness
                  allowTouchMove={true}
                  autoplay={{
                    delay: 3500, // Smooth transition gap
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  navigation={{
                    prevEl: prevEl,
                    nextEl: nextEl,
                  }}
                  // Re-render and initialize targets inside loop structure
                  onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevEl;
                    swiper.params.navigation.nextEl = nextEl;
                  }}
                  breakpoints={{
                    576: { slidesPerView: 2.2, spaceBetween: 24 },
                    992: { slidesPerView: 3.2, spaceBetween: 30 },
                    1400: { slidesPerView: 4.2, spaceBetween: 30 },
                    1800: { slidesPerView: 5.2, spaceBetween: 35 }
                  }}
                  className="luxury-discrete-swiper"
                >
                  {items.map((item, idx) => {
                    const displayIndex = (idx + 1).toString().padStart(2, '0');
                    const imageUrl = item.image 
                      ? `${storageurl}${item.image}` 
                      : `https://via.placeholder.com/400x530?text=${encodeURIComponent(item.name || 'Premium')}`;

                    return (
                      <SwiperSlide key={item.id || `sig-${idx}`}>
                        <div 
                          className="luxury-slider-card"
                          onClick={() => navigate(`/products/categories/${item.slug}`)}
                        >
                          <div className="lux-img-wrapper">
                            <img src={imageUrl} alt={item.name} loading="lazy" />
                            <div className="lux-card-overlay"></div>
                            <div className="lux-card-content">
                              
                              <div className="lux-text-side">
                                <span className="lux-number">{displayIndex}</span>
                                <h4 className="lux-title">{item.name}</h4>
                              </div>

                              <div className="trinity-arrow-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>

                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </div>

            {/* Right Edge Arrow Button */}
            <button 
              ref={(el) => setNextEl(el)} 
              className="lux-edge-nav-btn lux-edge-next" 
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default CollectionsGrid;