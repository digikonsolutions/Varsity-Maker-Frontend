/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - Editorial Chapters
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiRotateCcw, FiZoomIn, FiMaximize, FiMinimize } from "react-icons/fi";
import { LuDroplets, LuPalette, LuLayers3 } from "react-icons/lu";
import { RxFontFamily } from "react-icons/rx";
import "./EditorialChapters.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ================= EDITORIAL MASTER COMPONENT ================= */
const EditorialChapters = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const rows = containerRef.current.querySelectorAll(".v-maker-chapter-row");
    
    rows.forEach((row) => {
      const media = row.querySelector(".v-maker-chapter-media-container");
      const meta = row.querySelector(".v-maker-chapter-meta-wrap");

      gsap.fromTo(
        [media, meta],
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => console.log("Playback error:", error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section ref={containerRef} className="v-maker-editorial-chapters-section">
      
      {/* CHAPTER 01: THE MAISON - CINEMATIC VIDEO INTERACTION (UNCHANGED) */}
      <div className="v-maker-chapter-row">
        <div className="v-maker-chapter-media-container">
          <div className="v-maker-decorative-wireframe-box v-maker-wireframe-right"></div>
          
          <div className="v-maker-chapter-video-wrapper">
            <video 
              ref={videoRef}
              src="/src/assets/cta-video.mp4" 
              className="v-maker-chapter-video"
              autoPlay
              muted
              loop
              playsInline
            />
            
            <div className="v-maker-video-control-overlay" onClick={toggleVideoPlayback}>
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ transform: "translateX(2px)" }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
          </div>

          <div className="v-maker-floating-metric-banner v-maker-metric-left">
            <span className="v-maker-metric-value">42</span>
            <span className="v-maker-metric-label">Years of Craft</span>
          </div>
        </div>

        <div className="v-maker-chapter-meta-wrap">
          <span className="v-maker-chapter-index">The Maison</span>
          <h2 className="v-maker-chapter-heading">A house built on the patience of the hand.</h2>
          <p className="v-maker-chapter-paragraph">
            Since 1984, Maison Aurél has stood for a single conviction: that excellence is the residue of obsession. Our ateliers in Geneva, Florence and Paris work in the old way — slowly, deliberately, and only with the finest materials our buyers can secure.
          </p>
          
          <div className="v-maker-brand-mini-stats-grid">
            <div className="v-maker-mini-stat-item">
              <span className="v-maker-mini-stat-num">3</span>
              <span className="v-maker-mini-stat-label">Ateliers</span>
            </div>
            <div className="v-maker-mini-stat-item">
              <span className="v-maker-mini-stat-num">120+</span>
              <span className="v-maker-mini-stat-label">Master Artisans</span>
            </div>
            <div className="v-maker-mini-stat-item">
              <span className="v-maker-mini-stat-num">90</span>
              <span className="v-maker-mini-stat-label">Countries</span>
            </div>
          </div>

          <button className="v-maker-btn-heritage-action">Shop Now</button>
        </div>
      </div>

      

    </section>
  );
};

export default EditorialChapters;