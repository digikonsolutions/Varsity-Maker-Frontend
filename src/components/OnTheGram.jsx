// OnTheGram.jsx
// ✅ UI same rakhi hai
// ✅ Sirf GSAP + 3D animations + ScrollTrigger add kiya gaya hai

import { useMemo, useState, useRef, useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import g1 from "../assets/gram1.jpg";
import g2 from "../assets/gram2.jpg";
import g3 from "../assets/gram3.jpg";
import g4 from "../assets/gram4.jpg";

import g5 from "../assets/gram5.jfif";
import g6 from "../assets/gram6.jfif";
import g7 from "../assets/gram7.jfif";
import g8 from "../assets/gram8.jfif";

gsap.registerPlugin(ScrollTrigger);

function GramCard({ img }) {
  return (
    <div className="gram-card">
      <img className="gram-img" src={img} alt="Instagram post" />

      <div className="gram-bar">
        <span className="gram-handle">@varsitymaker</span>
        <button className="gram-btn">Shop Now</button>
      </div>
    </div>
  );
}

export default function OnTheGram() {
  const data = useMemo(() => [g1, g2, g3, g4, g5, g6, g7, g8], []);

  const perPage = 4;
  const maxPage = Math.max(0, Math.ceil(data.length / perPage) - 1);

  const [page, setPage] = useState(0);

  const visible = data.slice(page * perPage, page * perPage + perPage);

  // ✅ refs
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const navRef = useRef(null);
  const gridRef = useRef(null);

  // ✅ Section Intro Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 120,
        scale: 0.96,
        duration: 1.3,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: 60,
        rotateX: -80,
        transformPerspective: 1200,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        },
      });

      gsap.from(subRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: subRef.current,
          start: "top 90%",
        },
      });

      gsap.from(navRef.current, {
        opacity: 0,
        scale: 0.6,
        rotate: -10,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: navRef.current,
          start: "top 90%",
        },
      });

      // ✅ 3D stagger cards animation
      gsap.from(".gram-card", {
        opacity: 0,
        y: 100,
        rotateY: 25,
        rotateX: 15,
        scale: 0.85,
        stagger: 0.12,
        duration: 1.2,
        ease: "power4.out",
        transformPerspective: 1200,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
        },
      });

      // ✅ Hover 3D effect
      const cards = gsap.utils.toArray(".gram-card");

      cards.forEach((card) => {
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect();

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const rotateY = ((x / rect.width) - 0.5) * 18;
          const rotateX = ((y / rect.height) - 0.5) * -18;

          gsap.to(card, {
            rotateY,
            rotateX,
            scale: 1,
            z: 80,
            duration: 0.4,
            ease: "power3.out",
            transformPerspective: 1200,
          });
        };

        const reset = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            z: 0,
            duration: 0.6,
            ease: "power3.out",
          });
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", reset);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ✅ page change animation
  useEffect(() => {
    gsap.fromTo(
      ".gram-card",
      {
        opacity: 0,
        y: 70,
        rotateY: 18,
        scale: 0.92,
      },
      {
        opacity: 1,
        y: 0,
        rotateY: 0,
        scale: 1,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
      }
    );
  }, [page]);

  return (
    <section className="gram" ref={sectionRef}>
      <div className="gram-inner">
        <div className="gram-head">
          <div>
            <h2 className="gram-title" ref={titleRef}>
              On The Gram
            </h2>

            <p className="gram-sub" ref={subRef}>
              We&apos;d love to see your latest looks in our creations.
              Share your style with #VarsityMaker for a chance to be
              featured on our socials &amp; website.
            </p>
          </div>

          <div className="gram-nav" ref={navRef}>
            {/* Previous */}
            <button
              className="gram-navBtn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous"
            >
              <i
                className="fas fa-arrow-left"
                style={{
                  transform: "rotate(45deg)",
                  display: "inline-block",
                  fontSize: "20px",
                }}
              ></i>
            </button>

            {/* Next */}
            <button
              className="gram-navBtn"
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page === maxPage}
              aria-label="Next"
            >
              <i
                className="fas fa-arrow-right"
                style={{
                  transform: "rotate(-45deg)",
                  display: "inline-block",
                  fontSize: "20px",
                }}
              ></i>
            </button>
          </div>
        </div>

        <div className="gram-grid" ref={gridRef}>
          {visible.map((img, idx) => (
            <GramCard key={idx} img={img} />
          ))}
        </div>
      </div>
    </section>
  );
}