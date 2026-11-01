import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './TrustedSchools.css';

const TrustedSchools = () => {
  const sliderTrackRef = useRef(null);

  const schoolLogos = [
    { id: 1, name: "Alpha Academy", url: "https://t4.ftcdn.net/jpg/02/38/94/05/360_F_238940516_0BihE7YocY9vpgClPDDWuuaLneDwxtWn.jpg" },
    { id: 2, name: "Apex Institute", url: "https://static.vecteezy.com/system/resources/thumbnails/046/006/102/small/education-logo-design-template-for-school-and-organization-vector.jpg" },
    { id: 3, name: "Vanguard High", url: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/school-logo-design-template-60e86856a4746be1635685190fc68b57_screen.jpg?ts=1724450420" },
    { id: 4, name: "Elite Prep", url: "https://template.canva.com/EAGLphtN1-E/1/0/1600w-bVNORNpm-c8.jpg" },
    { id: 5, name: "Beacon House", url: "https://template.canva.com/EAGVl61QpZM/1/0/1600w-kvculYjF4NY.jpg" },
    { id: 6, name: "Legacy Grammar", url: "https://template.canva.com/EAGLpqXEUbM/1/0/1600w-6YU1RLJqQoE.jpg" },
  ];

  // Infinite loop cloned content
  const repeatedLogos = [...schoolLogos, ...schoolLogos, ...schoolLogos, ...schoolLogos];

  const scrollLeft = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="v-maker-trusted-section">
      <div className="v-maker-trusted-container">
        
        {/* Header Suite */}
        <div className="v-maker-trusted-header-row">
          <div className="v-maker-trusted-title-block">
            {/* <span className="v-maker-trusted-pill">Global Network</span> */}
            <h2 className="v-maker-trusted-title">Trusted by 10,000+ Buyers</h2>
          </div>
          
         
        </div>

        {/* Viewport Horizon Wrapper */}
        <div className="v-maker-slider-viewport-wrapper">
          {/* Luxury Fading Edges */}
          <div className="v-maker-slider-fade-overlay left-edge"></div>
          <div className="v-maker-slider-fade-overlay right-edge"></div>

          {/* Endless Animated Scrolling Track */}
          <div ref={sliderTrackRef} className="v-maker-slider-scroll-track">
            <div className="v-maker-ticker-mover-inner">
              {repeatedLogos.map((logo, index) => (
                <div key={`${logo.id}-${index}`} className="v-maker-logo-card-frame">
                  <div className="v-maker-logo-card-glow"></div>
                  
                  {/* Image Presentation Canvas */}
                  <div className="v-maker-brand-image-canvas">
                    <img 
                      src={logo.url} 
                      alt={`${logo.name} Identity Emblem`} 
                      className="v-maker-brand-logo-image" 
                    />
                  </div>

                  {/* Typography Reveal */}
                  <span className="v-maker-logo-hover-title">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustedSchools;