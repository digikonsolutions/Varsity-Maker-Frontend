import React from "react";
import { 
  FiArrowRight, 
  FiRotateCcw, 
  FiZoomIn, 
  FiMaximize2, 
  FiCheck,
  FiCompass
} from "react-icons/fi";
import { LuDroplets, LuPalette, LuLayers3 } from "react-icons/lu";
import { RxFontFamily } from "react-icons/rx";
import "./DesignYourJacket.css";
import jacketimage from '/src/assets/builder-video.mp4';

const DesignYourJacket = () => {
  return (
    <section className="v-maker-clean-stacked-section">
      <div className="v-maker-studio-container-block">

        {/* 1. TOP HEADER OUTSIDE THE VIDEO */}
        <header className="v-maker-studio-outside-header">
          <span className="v-maker-studio-mini-pill">
            <span className="v-maker-pill-icon-pulse">●</span> LIVE STUDIO MODE
          </span>
          <h2 className="v-maker-studio-main-title">
            Configure <span className="v-maker-title-gold-accent">Your Jacket</span>
          </h2>
          <p className="v-maker-studio-description-prose">
            Interact with our real-time studio build engine. Pick premium materials, inject tackle twill patches, and craft your custom legacy.
          </p>
        </header>

        {/* 2. CENTER ZONE - PURE VIDEO CONTAINER STAGE */}
        <div className="v-maker-isolated-video-canvas">
          <video
            src={jacketimage}
            className="v-maker-embedded-stage-video"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* CINEMATIC SHADOW DEPTH INSIDE VIDEO BOX ONLY */}
          <div className="v-maker-canvas-inner-vignette"></div>

          {/* FLOATING HUD CONTROLS EMBEDDED SAFELY INSIDE THE STAGE */}
          
        </div>

        {/* 3. BOTTOM CONTROL CENTER & CTAs OUTSIDE THE VIDEO */}
        <footer className="v-maker-studio-outside-footer-panel">
          
          {/* HORIZONTAL WORKSHOP OPTIONS */}
          

          {/* FINAL CONVERSION ROW */}
          <div className="v-maker-action-footer-row">
            <button className="v-maker-studio-btn-ultimate">
              <span>Customize Your Jacket Now</span>
              <FiArrowRight className="v-maker-btn-arrow-move" />
            </button>
            <div className="v-maker-studio-trust-item">
              <FiCheck className="v-maker-trust-icon" /> <span>Real-time instant rendering engine</span>
            </div>
          </div>

        </footer>

      </div>
    </section>
  );
};

export default DesignYourJacket;