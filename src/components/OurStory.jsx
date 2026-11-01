// OurStory.jsx
// ✅ UI bilkul same
// ✅ Modern GSAP + 3D + ScrollTrigger animations added

import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import story1 from "../assets/story1.jfif";
import story2 from "../assets/story2.jpg";

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

export default function OurStory() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ✅ Section smooth reveal
      gsap.from(".story-inner", {
        opacity: 0,
        y: 120,
        scale: 0.97,
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // ✅ Left Images stagger cinematic entry
      gsap.from(".story-img1", {
        x: -120,
        rotate: -8,
        opacity: 0,
        scale: 0.85,
        duration: 1.3,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".story-img1",
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".story-img2", {
        x: -80,
        y: 80,
        rotate: 8,
        opacity: 0,
        scale: 0.85,
        duration: 1.4,
        delay: 0.15,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".story-img2",
          start: "top 85%",
          once: true,
        },
      });

      // ✅ Content animation
      gsap.from(".story-kicker", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".story-kicker",
          start: "top 90%",
        },
      });

      gsap.from(".story-title", {
        opacity: 0,
        y: 60,
        rotateX: -80,
        transformPerspective: 1200,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".story-title",
          start: "top 85%",
        },
      });

      gsap.from(".story-text", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".story-text",
          start: "top 90%",
        },
      });

      // ✅ Buttons stagger
      gsap.from(".story-btn", {
        opacity: 0,
        y: 35,
        scale: 0.9,
        stagger: 0.12,
        duration: 0.9,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".story-actions",
          start: "top 90%",
        },
      });

      // ✅ Premium floating parallax effect
      gsap.to(".story-img1", {
        y: -18,
        duration: 3,
        repeat: 0,
        ease: "sine.inOut",
      });

      gsap.to(".story-img2", {
        y: 18,
        duration: 3.5,
        repeat: 0,
        ease: "sine.inOut",
      });

      // ✅ 3D hover image effect
      const cards = gsap.utils.toArray([
        document.querySelector(".story-img1"),
        document.querySelector(".story-img2"),
      ]);

      cards.forEach((card) => {
        if (!card) return;

        const move = (e) => {
          const rect = card.getBoundingClientRect();

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const rotateY = ((x / rect.width) - 0.5) * 14;
          const rotateX = ((y / rect.height) - 0.5) * -14;

          gsap.to(card, {
            rotateY,
            rotateX,
            scale: 1.01,
            duration: 0.45,
            ease: "power3.out",
            transformPerspective: 1200,
          });
        };

        const leave = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
          });
        };

        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
      });

      // ✅ Button hover magnetic effect
      const buttons = gsap.utils.toArray(".story-btn");

      buttons.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          gsap.to(btn, {
            y: -4,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(btn.querySelector(".story-arrow"), {
            rotate: -45,
            x: 4,
            y: -2,
            duration: 0.35,
            ease: "power2.out",
          });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, {
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          });

          gsap.to(btn.querySelector(".story-arrow"), {
            rotate: 0,
            x: 0,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="story" ref={sectionRef}>
      <div className="story-inner">
        {/* LEFT IMAGES */}
        <div className="story-left">
          <div className="story-img1">
            <img src={story1} alt="Varsity jacket" />
          </div>

          <div className="story-img2">
            <img src={story2} alt="Vintage story" />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="story-right">
          <div className="story-kicker">ABOUT US</div>

          <h2 className="story-title">
            OUR <span>STORY</span>
          </h2>

          <p className="story-text">
            Golden Bear began making hard-wearing coats for San Francisco
            longshoremen in 1922. The brand has been a fixture in the
            City by the Bay ever since, trusted for its outerwear range
            that now includes bomber, biker and varsity-style jackets.
          </p>

          <div className="story-actions storyShift">
            <a className="story-btn story-primary storyBuy" href="#">
              SHOP NOW{" "}
              <span className="story-ic">
                <IconArrow className="story-arrow" />
              </span>
            </a>

            <a className="story-btn story-outline storyDesign" href="#">
              DESIGN YOUR JACKET{" "}
              <span className="story-ic">
                <IconArrow className="story-arrow" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}