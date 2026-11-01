import { useMemo, useState, useEffect } from "react";
import show1 from "../assets/video-1.mp4";
// Yahan aap mazeed videos import kar sakte hain:
// import show2 from "../assets/video-2.mp4"; 

import './CarterShowcase.css'

const IconArrow = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CarterShowcase() {
  const [active, setActive] = useState(0);

  // 💡 JITNI VIDEOS DAALNI HAIN AAP IS ARRAY MEIN INJECT KAREIN
  const showcaseData = useMemo(() => [
    {
      videoSrc: show1,
      name: "Bomber Jacket",
      year: "(1950s)",
      description: "Inspired by military A-2 bombers, THE CARTER modernized this silhouette in the 1950s with details like a removable fur collar and functional side-entry pockets. Available in leathers, exotic skins, and wools, it's a refined yet rugged statement piece."
    },
    // {
    //   videoSrc: show2,
    //   name: "Varsity Jacket",
    //   year: "(1960s)",
    //   description: "A campus icon reimagined by THE CARTER featuring premium wool bodies with genuine leather sleeves. The snap-button front and ribbed cuffs provide classic comfort while customized patches add personal storytelling."
    // }
  ], []);

  // 💡 Automatic Slider Logic (Rotates both background video and content every 3 seconds)
  useEffect(() => {
    if (showcaseData.length <= 1) return;

    const interval = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % showcaseData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showcaseData.length]);

  return (
    <section className="carterS-fullscreen-wrapper">
      
      {/* BACKGROUND VIDEO NODE */}
      <div className="carterS-bg-video-container">
        <video 
          key={showcaseData[active].videoSrc} // Key forcing react to refresh source smoothly on change
          className="carterS-bg-intrinsic-video" 
          src={showcaseData[active].videoSrc} 
          autoPlay
          muted
          loop
          playsInline
        />
        {/* CINEMATIC BLENDING VIGNETTE */}
        <div className="carterS-bg-overlay-gradient" />
      </div>

      {/* FOREGROUND INTERACTIVE CONTENT */}
      <div className="carterS-content-overlay">
        <div className="carterS-inner">
          <div className="carterS-left">
            <div className="carterS-kicker">CLASSICS</div>
            <h2 className="carterS-title">THE CARTER</h2>
            <div className="carterS-underline" />

            <div className="carterS-sub">
              <b>{showcaseData[active].name}&nbsp;&nbsp;{showcaseData[active].year}</b>
            </div>

            <p className="carterS-text">
              {showcaseData[active].description}
            </p>

            <div className="carterS-actions carterSShift">
              <a className="carterS-btn carterS-primary" href="#">
                SHOP NOW{" "}
                <span className="carterS-ic">
                  <IconArrow className="carterS-arrow" />
                </span>
              </a>

              <a className="carterS-btn carterS-outline" href="#">
                DESIGN YOUR JACKET{" "}
                <span className="carterS-ic">
                  <IconArrow className="carterS-arrow" />
                </span>
              </a>
            </div>
          </div>

          {/* RIGHT SIDE PIPELINE INDICATORS (OPTIONAL PURE DESIGN BREATHING ROOM) */}
          <div className="carterS-right-blank-zone">
            {showcaseData.length > 1 && (
              <div className="carterS-progress-dots-stack">
                {showcaseData.map((_, index) => (
                  <div 
                    key={index} 
                    className={`carterS-progress-bar-line ${index === active ? 'active-line' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}