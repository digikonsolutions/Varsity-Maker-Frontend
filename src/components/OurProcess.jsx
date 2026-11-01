import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import img from "../assets/process.jfif";
import './OurProcess.css';

gsap.registerPlugin(ScrollTrigger);

/* ================= LUXURY MINIMALIST ICONS ================= */
const IconPlay = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path
      d="M9.5 7.5v9l7-4.5-7-4.5Z"
      fill="#caa24b"
    />
  </svg>
);

const Check = () => (
  <span className="p-check" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </span>
);

export default function OurProcess() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  const points = [
    "Easy To Wear",
    "Highly Recommended",
    "Trusted Brand",
    "34+ Reviews",
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      /* ===== INITIAL LUXURY STATES ===== */
      gsap.set(".process-kicker", { opacity: 0, y: 20 });
      gsap.set(".process-title", { opacity: 0, y: 40 });
      gsap.set(".process-subTitle", { opacity: 0, x: -20 });
      gsap.set(".process-text", { opacity: 0, y: 30 });
      gsap.set(".process-item", { opacity: 0, x: 20 });
      gsap.set(".process-media", { opacity: 0, scale: 0.96 });
      gsap.set(".process-floating-badge", { opacity: 0, y: 30 });

      /* ===== MAIN SCROLL TIMELINE ===== */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 60%",
          scrub: 1,
        },
      });

      tl.to(".process-media", { opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" })
        .to(".process-floating-badge", { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" }, "-=0.6")
        .to(".process-kicker", { opacity: 1, y: 0, duration: 0.6 }, "-=0.8")
        .to(".process-title", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
        .to(".process-subTitle", { opacity: 1, x: 0, duration: 0.6 }, "-=0.5")
        .to(".process-text", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(".process-item", { opacity: 1, x: 0, stagger: 0.08, duration: 0.6 }, "-=0.4");

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ================= INTERACTIVE 3D HOVER MULTIPLIER ================= */
  const handleMouseMove = (e) => {
    const card = imageRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;

    gsap.to(card, {
      rotateY,
      rotateX,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1200,
    });
  };

  const resetCard = () => {
    gsap.to(imageRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <section className="process" ref={sectionRef}>
      <div className="process-inner">
        
        {/* LEFT COMPARTMENT - ARTISAN IMAGE PRODUCTION */}
        <div className="process-left">
          <div
            ref={imageRef}
            className="process-media"
            onMouseMove={handleMouseMove}
            onMouseLeave={resetCard}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="process-image-container">
              <img
                className="process-img"
                src={img}
                alt="Our premium crafting process"
              />
              <div className="process-overlay-shimmer" />
            </div>

         

            {/* FLOATING HERITAGE BADGE FROM REFERENCE */}
            <div className="process-floating-badge">
              <span className="badge-num">42</span>
              <span className="badge-text">Years of Craft</span>
            </div>
          </div>
        </div>

        {/* RIGHT COMPARTMENT - EDITORIAL MARGIN TYPOGRAPHY */}
        <div className="process-right">
          <span className="process-kicker">The Heritage Suite</span>
          
          <h2 className="process-title">
            A house built on the patience of the hand.
          </h2>

          <div className="process-subTitle">
            THE CARTER COLLECTION (1950s)
          </div>

          <p className="process-text">
            Inspired by military A-2 bombers, modernization meets bespoke heritage silhouettes. 
            Tailored exquisitely with details like a removable fur contour collar and functional side-entry 
            pockets. Available in selected fine leathers, premium exotic skins, and carefully combed wools—it is a 
            refined, rugged luxury statement.
          </p>

          <div className="process-list">
            {points.map((p) => (
              <div className="process-item" key={p}>
                <Check />
                <span className="p-item-text">{p}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}