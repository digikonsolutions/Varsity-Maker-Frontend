import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import carterImg from "../assets/carter.png";

gsap.registerPlugin(ScrollTrigger);

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
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 7h8v8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CarterSection() {
  const sectionRef = useRef(null);

  const imageRef = useRef(null);

  const contentRef = useRef(null);

  const buttonsRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      /* ================= INITIAL STATES ================= */

      gsap.set(imageRef.current, {
        xPercent: -25,
        opacity: 0,
        scale: 0.92,
        rotate: -3,
        filter: "blur(10px)",
      });

      gsap.set(contentRef.current.children, {
        xPercent: 25,
        opacity: 0,
        filter: "blur(10px)",
      });

      gsap.set(buttonsRef.current.children, {
        y: 30,
        opacity: 0,
      });

      /* ================= MAIN TIMELINE ================= */

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,

          start: "top 75%",
          end: "bottom 80%",

          scrub: 1,

          toggleActions: "play reverse play reverse",

          invalidateOnRefresh: true,
        },
      });

      /* ======================================================
         IMAGE + CONTENT TOGETHER
      ====================================================== */

      tl.to(
        imageRef.current,
        {
          xPercent: 0,
          opacity: 1,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
          duration: 1.5,
          ease: "power4.out",
        },
        0
      );

      tl.to(
        contentRef.current.children,
        {
          xPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.12,
          duration: 1.1,
          ease: "power3.out",
        },
        0 // 👈 same time as image
      );

      /* ======================================================
         BUTTONS AFTER CONTENT
      ====================================================== */

      tl.to(
        buttonsRef.current.children,
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
        },
        0.4
      );

      /* ================= FLOAT EFFECT ================= */

      gsap.to(imageRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* ================= PARALLAX ================= */

      gsap.to(imageRef.current, {
        yPercent: 8,
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
    <section className="carter" ref={sectionRef}>

      {/* BACKGROUND GLOW */}
      <div className="carter-glow"></div>

      <div className="carter-inner">

        {/* ================= IMAGE SIDE ================= */}
        <div className="carter-left" ref={imageRef}>
          <div className="carter-image-wrap">

            <img
              className="carter-img"
              src={carterImg}
              alt="The Carter Jacket"
            />

          </div>
        </div>

        {/* ================= CONTENT SIDE ================= */}
        <div className="carter-right">

          <div className="carter-copy" ref={contentRef}>

            <div className="carter-kicker">
              CLASSICS
            </div>

            <h2 className="carter-title">
              THE CARTER
            </h2>

            <div className="carter-sub">
              Bomber Jacket&nbsp;&nbsp;(1950s)
            </div>

            <p className="carter-text">
              Inspired by military A-2 bombers, THE CARTER modernized this
              silhouette in the 1950s with details like a removable fur collar
              and functional side-entry pockets. Available in leathers,
              exotic skins, and wools, it&apos;s a refined yet rugged
              statement piece.
            </p>

          </div>

          {/* ================= BUTTONS ================= */}
          <div className="carter-actions" ref={buttonsRef}>

            <a className="carter-btn carter-primary" href="#">
              SHOP NOW

              <span className="carter-ic">
                <IconArrow className="carter-arrow" />
              </span>
            </a>

            <a className="carter-btn carter-outline" href="#">
              DESIGN YOUR JACKET

              <span className="carter-ic">
                <IconArrow className="carter-arrow" />
              </span>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}