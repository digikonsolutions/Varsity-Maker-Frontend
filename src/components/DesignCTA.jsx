import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './DesignCTA.css';

import videoBg from "../assets/cta-video.mp4";

gsap.registerPlugin(ScrollTrigger);

/* ================= MODERN ICON ARROW ================= */
const IconArrow = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
  >
    <path
      d="M7 17L17 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M9 7h8v8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ================= PRECISE TEXT SPLIT ================= */
function splitText(text) {
  return text.split("").map((char, i) => (
    <span className="cta-char" key={i}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

/* ================= MAIN COMPONENT ================= */
export default function DesignCTA() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      /* ================= INITIAL SYSTEM STATES ================= */
      gsap.set(".cta-stage", {
        opacity: 0,
        y: 80,
        scale: 0.96,
        filter: "blur(10px)",
      });

      gsap.set(".cta-video", {
        scale: 1.2,
      });

      gsap.set(".cta-char", {
        opacity: 0,
        y: 60,
        rotateX: -60,
        display: "inline-block",
      });

      gsap.set(".cta-accent-tag, .cta-text, .cta-perks-grid, .cta-btn", {
        opacity: 0,
        y: 30,
      });

      /* ================= GSAP SCROLL ANIMATION TIMELINE ================= */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 40%",
          scrub: 1.2,
        },
      });

      tl.to(".cta-stage", {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power3.out",
      })
      .to(".cta-video", {
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
      }, 0)
      .to(".cta-char", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.2)",
      }, 0.3)
      .to(".cta-accent-tag, .cta-text, .cta-perks-grid, .cta-btn", {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      }, 0.5);

     

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="cta" ref={sectionRef}>
      <div className="cta-stage">
        
        {/* ================= BACKGROUND HIGH FIDELITY MEDIA ================= */}
        <video
          className="cta-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoBg} type="video/mp4" />
        </video>

        {/* ================= EDITORIAL OVERLAY ================= */}
        <div className="cta-overlay" />

        {/* ================= CONTENT ARCHITECTURE CONTAINER ================= */}
        <div className="cta-inner">
          
          <span className="cta-accent-tag">Interactive Atelier</span>

          <h2 className="cta-title">
            {splitText("Design Your Own Jackets")}
          </h2>

          <p className="cta-text">
            Create a jacket that&apos;s uniquely yours. Choose your colors, premium wool, 
            leathers, and bespoke patches to construct a high-end custom masterpiece that showcases your signature style.
          </p>

          {/* ================= MICRO ATELIER PERKS SYSTEM ================= */}
          <div className="cta-perks-grid">
            <div className="cta-perk-item">
              <span className="cta-perk-number">01</span>
              <span className="cta-perk-label">Real-time 3D View</span>
            </div>
            <div className="cta-perk-item">
              <span className="cta-perk-number">02</span>
              <span className="cta-perk-label">Handcrafted Patches</span>
            </div>
            <div className="cta-perk-item">
              <span className="cta-perk-number">03</span>
              <span className="cta-perk-label">Premium Leather Ops</span>
            </div>
          </div>

          {/* ================= HYPER INTERACTIVE ACTION BUTTON ================= */}
          <a className="cta-btn" href="#">
            <span className="cta-btn-bg"></span>
            <span className="cta-btn-text">
              Start Customization
              <span className="cta-ic">
                <IconArrow className="ctaArrow" />
              </span>
            </span>
          </a>

        </div>

      </div>
    </section>
  );
}