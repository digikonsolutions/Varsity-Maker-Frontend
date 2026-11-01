import React from 'react';
import './HowItWorks.css';

const HowItWorksPage = () => {
  const steps = [
    {
      number: '1',
      title: 'FIND YOUR SCHOOL',
      description: "We've done our homework. We have every high school listed so you can find your design concepts in seconds. Click 'SHOP SCHOOL' to find your jacket.",
      image: './Folder_2.png',
    },
    {
      number: '2',
      title: 'CUSTOMIZE JACKET',
      description: "Customize your jacket online including adding patches. You can upload your own design concepts to personalize the inner lining, the pockets, and exterior allowing a truly custom experience.",
      image: './jacket-red.png',
    },
    {
      number: '3',
      title: 'PATCH PLACEMENT',
      description: "We'll take the heavy lifting. Once you ordered your jacket, write down your size instructions and patches and send your patches.",
      image: './box_main.png',
    },
    {
      number: '4',
      title: 'FASTEST DELIVERY',
      description: "Once you place your order, you can expect to receive your letterman jacket within 3-4 weeks. We'll send you updates with patterns every step of the way. Halve the time of our competitors.",
      image: './truckmain.png',
    }
  ];

  return (
    <div className="hiw-page-wrapper">
      {/* Hero Showcase Feature */}
     {/* Premium Sleek Hero Showcase */}
      <section className="hiw-hero-showcase">
        <div className="hiw-container">
          <div className="hiw-hero-grid">
            
            {/* Left Column: Minimalist Text Content */}
            <div className="hiw-hero-title-area">
              <div className="hiw-tagline-wrapper">
                <span className="hiw-tagline">THE CRAFT JOURNEY</span>
                <span className="hiw-tagline-line"></span>
              </div>
              <h1 className="hiw-main-title">
                How It <span className="hiw-title-italic">Works</span>
              </h1>
              <p className="hiw-intro-text">
                Start your design. Experience digital engineering beautifully wrapped around timeless custom heritage.
              </p>
            </div>
            
            {/* Right Column: Sleek Exhibition Media Frame */}
            <div className="hiw-hero-media-column">
              <div className="hiw-hero-media-frame">
                {/* Modern Studio Frame Corners */}
                <div className="hiw-frame-backdrop-glow"></div>
                
                <div className="hiw-image-reveal-wrapper">
                  <img 
                    src='./video-cover.png' 
                    alt="Custom Jacket Design Tool Interface" 
                    className="tool-screenshot" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modern Sleek Step Cards Process Section */}
      <section className="hiw-process-section">
        <div className="hiw-container clean-stack-center">
          <div className="hiw-process-flow-container">
            
            {/* SVG Curved Connectors Track */}
            <div className="hiw-svg-track-vector">
              <svg viewBox="0 0 100 400" preserveAspectRatio="none" fill="none">
                <path 
                  d="M 20 0 Q -5 65 20 130 Q 45 195 20 260 Q -5 325 20 390" 
                  stroke="var(--gold)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 6" 
                  opacity="0.4"
                />
              </svg>
            </div>

            {steps.map((step) => (
              <div key={step.number} className="hiw-process-card-row">
                
                {/* Modern Step Node Marker */}
                <div className="hiw-node-sentinel">
                  <div className="hiw-step-circle-badge">
                    <span>{step.number}</span>
                  </div>
                </div>

                {/* Content Card Panel */}
                <div className="hiw-process-main-card">
                  <div className="hiw-card-asset-quadrant">
                    <img src={step.image} alt={`${step.title} Icon`} className="hiw-card-inline-vector" />
                  </div>
                  <div className="hiw-card-details-quadrant">
                    <h3 className="hiw-card-step-title">{step.title}</h3>
                    <p className="hiw-card-step-desc">{step.description}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Footer Section */}
      <section className="hiw-action-gate">
        <div className="hiw-container context-center">
          <div className="hiw-cta-inner-panel">
            <div className="hiw-cta-line-top"></div>
            <h3 className="hiw-cta-title">Ready to Make Your Statement?</h3>
            <button className="btn-luxury-primary-dark hiw-shop-button-premium">
              SHOP SCHOOL
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;