/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - Fullscreen Video Cinematic Hero with Social Proof
   ========================================================================== */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import './Hero.css';
import catherovideo from '../assets/cat-hero-video.mp4';

// Simulated avatar imports or URLs for the student section
const studentAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=100&q=80"
];

const IconArrow = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props} className="v-hero-arrow-icon">
    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 7h8v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Hero() {
  const { pathname } = useLocation();
  const isDesignActive = pathname === "/design";

  return (
    <main className="v-hero-master-container full-screen-variant">
      {/* FULLSCREEN BACKGROUND VIDEO */}
      <div className="v-hero-bg-video-container">
        <video 
          className="v-hero-fullscreen-video"
          src={catherovideo} 
          autoPlay 
          loop 
          muted 
          playsInline
        />
        {/* CINEMATIC SHADOW OVERLAYS FOR MAXIMUM TEXT READABILITY */}
        <div className="v-hero-video-vignette" />
        <div className="v-hero-bottom-shading" />
      </div>

      {/* BACKGROUND DECOR SYSTEM */}
      <div className="v-hero-grid-pattern-overlay" />

      <section className="v-hero-inner-bounds-cinematic">
        <div className="v-hero-content-deck-bottom">
          
          
         
          {/* FLOATING ACTION INTERFACE */}
          <div className={`v-hero-cta-group ${isDesignActive ? "v-shift-design-active" : ""}`}>
            <a className="v-hero-btn v-btn-primary-gold" href="#">
              <span>SHOP NOW</span> <IconArrow />
            </a>

            <Link className="v-hero-btn v-btn-glass" to="/builder/raglanjacketbuilder">
              <span>Design Your Own</span> <IconArrow />
            </Link>
          </div>
          
          {/* IMAGE-INSPIRED SOCIAL PROOF PILL */}
          <div className="v-hero-social-proof-pill">
            <div className="v-hero-avatar-stack">
              {studentAvatars.map((src, idx) => (
                <img 
                  key={idx} 
                  src={src} 
                  alt={`Student face ${idx + 1}`} 
                  className="v-hero-stack-avatar" 
                />
              ))}
            </div>
            <p className="v-hero-proof-text">
              <span className="v-highlight-gold">Join 10,000+ Customers</span> who trust Varsity Maker
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}