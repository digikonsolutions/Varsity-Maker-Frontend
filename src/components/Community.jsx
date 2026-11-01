import React, {
  useLayoutEffect,
  useRef,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import thumb from "../assets/thumb.jpg";
import img1 from "../assets/community1.jpg";
import img2 from "../assets/community2.jpg";
import img3 from "../assets/community3.jpg";


gsap.registerPlugin(ScrollTrigger);

/* ================= ICONS ================= */

const IconPlay = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="currentColor"
  >
    <path d="M9 7.5v9l8-4.5-8-4.5Z" />
  </svg>
);

const IconChevron = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
  >
    <path
      d="M6.5 9.5L12 15l5.5-5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ================= CARD ================= */

function Card({ img, index }) {
  const cardRef = useRef(null);

  /* ===== 3D HOVER ===== */
  const handleMouseMove = (e) => {
    const card = cardRef.current;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY =
      ((x / rect.width) - 0.5) * 20;

    const rotateX =
      ((y / rect.height) - 0.5) * -20;

    gsap.to(card, {
      rotateY,
      rotateX,
      scale: 1.04,
      duration: 0.45,
      ease: "power3.out",
      transformPerspective: 1400,
      transformOrigin: "center",
    });
  };

  const resetCard = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: "expo.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className="com-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetCard}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* GLOW */}
      <div className="com-glow" />

      {/* IMAGE */}
      <img
        className="com-img"
        src={img}
        alt="Community"
      />

      {/* PLAY BUTTON */}
      <button
        className="com-play"
        aria-label="Play"
      >
        <IconPlay />
      </button>

      {/* BOTTOM BAR */}
      <div className="com-bar">

        <div className="com-left">

          <img
            className="com-thumbImg"
            src={thumb}
            alt="Product thumbnail"
          />

          <div className="com-info">

            <div className="com-name">
              RANCHSON BLACK
            </div>

            <div className="com-sub">
              LEATHER SHIRT
            </div>

            <div className="com-priceRow">

              <span className="com-priceLbl">
                Price:
              </span>

              <span className="com-old">
                $3000
              </span>

              <span className="com-new">
                $2500
              </span>

            </div>

          </div>
        </div>

        <button
          className="com-drop"
          aria-label="Open"
        >
          <IconChevron />
        </button>
      </div>

      {/* INDEX */}
      <div className="com-index">
        0{index + 1}
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function Community() {

  const sectionRef = useRef(null);

  const items = [img1, img2, img3];

  /* ================= GSAP ================= */

  useLayoutEffect(() => {

    const ctx = gsap.context(() => {

      /* ===== INITIAL ===== */

      gsap.set(".community-title", {
        opacity: 0,
        y: 80,
      });

      gsap.set(".community-sub", {
        opacity: 0,
        y: 50,
      });

      gsap.set(".com-card", {
        opacity: 0,
        y: 180,
        rotateX: 45,
        rotateY: -25,
        scale: 0.8,
        transformPerspective: 1500,
      });

      /* ===== MAIN TIMELINE ===== */

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 85%",
          scrub: 1.2,
        },
      });

      /* TITLE */

      tl.to(".community-title", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
      });

      tl.to(
        ".community-sub",
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.9"
      );

      /* CARDS */

      tl.to(
        ".com-card",
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          stagger: 0.2,
          duration: 1.5,
          ease: "expo.out",
        },
        "-=0.5"
      );

      /* PARALLAX */

      gsap.to(".com-img", {
        yPercent: 10,
        ease: "none",

        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

    }, sectionRef);

    return () => ctx.revert();

  }, []);

  return (
    <section
      className="community"
      ref={sectionRef}
    >
      {/* BACKGROUND LIGHT */}
      <div className="community-light" />

      <div className="community-inner">

        {/* TITLE */}
        <h2 className="community-title">
          Community In Action
        </h2>

        <p className="community-sub">
          WHAT OUR CUSTOMERS SAY ABOUT US
        </p>

        {/* GRID */}
        <div className="community-grid">

          {items.map((img, idx) => (
            <Card
              key={idx}
              img={img}
              index={idx}
            />
          ))}

        </div>
      </div>
    </section>
  );
}