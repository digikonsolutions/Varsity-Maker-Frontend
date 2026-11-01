import React from 'react';
import './VarsityInfographic.css';

const VarsityInfographic = () => {
  // Absolute production cinematic stream link embedded directly inside the architecture
  const assetStreamSource = "/cat-video.mp4";

  return (
    <section className="v-maker-infographic-section">
      <div className="v-maker-infographic-container">
        
        {/* Header Row */}
        <div className="infographic-header-meta">
          <span className="info-section-tagline">Our Strengths</span>
          <h2 className="info-section-title">Why Choose Us</h2>
        </div>

        {/* Canvas Area */}
        <div className="infographic-canvas-container">
          <div className="infographic-wrapper">
            
            {/* Left Panel Architecture */}
            <div className="info-feature-panel left-panel">
              <div className="info-feature-item">
                <div className="info-text-meta">
                  <h5>Your Name</h5>
                  <p>Custom luxury script patch on shoulder structure.</p>
                </div>
                <div className="info-pointer-circle">01</div>
              </div>
              
              <div className="info-feature-item">
                <div className="info-text-meta">
                  <h5>Team Patches</h5>
                  <p>High-density premium embroidery chenille patches.</p>
                </div>
                <div className="info-pointer-circle">02</div>
              </div>
              
              <div className="info-feature-item">
                <div className="info-text-meta">
                  <h5>School Colors</h5>
                  <p>Pure wool body layered with custom knit ribs.</p>
                </div>
                <div className="info-pointer-circle">03</div>
              </div>
            </div>

            {/* Central Cinematic Premium Video Wrapper with 4-Corner Edge Masking */}
            <div className="info-video-center-canvas">
              <div className="info-video-ambient-glow"></div>
              
              <div className="info-video-mask-frame">
                {/* 4-Way Smooth Alpha Radial Blend Mask */}
                <div className="info-video-4way-vignette"></div>
                <video 
                  src={assetStreamSource}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="info-core-stream-asset"
                />
              </div>
            </div>

            {/* Right Panel Architecture */}
            <div className="info-feature-panel right-panel">
              <div className="info-feature-item">
                <div className="info-pointer-circle">04</div>
                <div className="info-text-meta">
                  <h5>School Logo</h5>
                  <p>Authentic vintage leather backed emblem work.</p>
                </div>
              </div>
              
              <div className="info-feature-item">
                <div className="info-pointer-circle">05</div>
                <div className="info-text-meta">
                  <h5>Graduation Year</h5>
                  <p>Die-cut pristine premium felt numbers on sleeves.</p>
                </div>
              </div>
              
              <div className="info-feature-item">
                <div className="info-pointer-circle">06</div>
                <div className="info-text-meta">
                  <h5>Premium Details</h5>
                  <p>Heavy duty satin stitching lines precision detail.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default VarsityInfographic;