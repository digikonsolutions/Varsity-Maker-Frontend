import React, { useState, useEffect } from "react";
import { FiCpu } from "react-icons/fi"; // AI core feel ke liye icon
import "./AIPageLoader.css";

const AIPageLoader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Page ko top par force karna
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // 2. AI Loading State Simulation (e.g., 1.8 seconds)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="ai-loader-overlay">
      {/* BACKGROUND MATRIX GRID SCANNER */}
      <div className="ai-loader-grid-bg"></div>
      <div className="ai-loader-laser-scan"></div>

      {/* CENTER HUD CORE */}
      <div className="ai-loader-center-hub">
        
        {/* NEON RING ANIMATIONS */}
        <div className="ai-ring ai-ring-outer"></div>
        <div className="ai-ring ai-ring-inner"></div>

        {/* AI INTEL CORE ICON */}
        <div className="ai-core-icon-frame">
          <FiCpu className="ai-icon-pulse" />
        </div>

        {/* METRIC TEXT SUB-HUD */}
        <div className="ai-loader-text-group">
          <span className="ai-loader-title">INITIALIZING AI STAGE</span>
          <div className="ai-loading-bar-wrapper">
            <div className="ai-loading-bar-fill"></div>
          </div>
          <span className="ai-loader-status-ticker">SYNCHRONIZING MESH NETWORKS...</span>
        </div>

      </div>
    </div>
  );
};

export default AIPageLoader;