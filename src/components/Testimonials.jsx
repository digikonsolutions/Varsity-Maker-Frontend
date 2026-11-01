import {
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './Testimonials.css';

gsap.registerPlugin(ScrollTrigger);

/* ================= STAR ================= */
const StarBox = () => (
  <span className="t-starBox" aria-hidden="true">
    ★
  </span>
);

/* ================= CARD ================= */
function TestimonialCard({ item, absoluteIndex, onMouseEnter, onMouseLeave }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    gsap.to(card, {
      rotateY,
      rotateX,
      scale: 1.01,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const resetCard = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className="t-card"
      onMouseMove={handleMove}
      onMouseLeave={() => {
        resetCard();
        if (onMouseLeave) onMouseLeave();
      }}
      onMouseEnter={onMouseEnter}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div>
        <div className="t-cardTop">
          <div className="t-stars">
            {[...Array(5)].map((_, i) => (
              <StarBox key={i} />
            ))}
          </div>
          <div className="t-time">{item.time}</div>
        </div>

        <div className="t-title">{item.title}</div>
        <div className="t-text">“{item.text}”</div>
      </div>

      <div className="t-meta">
        <div className="t-name">{item.name}</div>
        <div className="t-cardIndex">
          {String(absoluteIndex + 1).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function Testimonials() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const loopRef = useRef(null);

  const baseData = useMemo(
    () => [
      { id: "t1", title: "Best in market", text: "I love this jacket because the support is awesome.", name: "Herman Salt", time: "2 Days Ago" },
      { id: "t2", title: "Amazing Quality", text: "Material and stitching is next level. Highly recommend.", name: "Sarah Khan", time: "1 Day Ago" },
      { id: "t3", title: "Perfect Fit", text: "Perfect size, comfort 10/10. Classical design.", name: "Ali Raza", time: "3 Days Ago" },
      { id: "t4", title: "Worth the Price", text: "All jackets are beyond beautiful. Absolutely love it!", name: "Hassan Ahmed", time: "4 Days Ago" },
      { id: "t5", title: "Fast Delivery", text: "Delivery on time. My best purchase so far!", name: "Ayesha Noor", time: "5 Days Ago" },
      { id: "t6", title: "Love the Design", text: "Classical and fancy design. Highly recommended!", name: "Usman Tariq", time: "1 Week Ago" },
      { id: "t7", title: "Super Comfortable", text: "Daily wear ke liye best, bohat comfortable.", name: "Hamza Shah", time: "2 Weeks Ago" },
      { id: "t8", title: "Premium Feel", text: "Wearing feel premium hai, looks expensive.", name: "Noor Fatima", time: "3 Weeks Ago" },
      { id: "t9", title: "Great Support", text: "Customer support helped instantly. Premium look!", name: "Bilal Javed", time: "1 Month Ago" },
    ],
    []
  );

  const extendedData = useMemo(() => [...baseData, ...baseData], [baseData]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      const items = track.children;
      const totalItems = items.length;
      const midPoint = totalItems / 2;

      const calculateOffset = () => {
        if (!items[0]) return 0;
        const cardWidth = items[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 28;
        return (cardWidth + gap) * midPoint;
      };

      let movementDistance = calculateOffset();

      loopRef.current = gsap.to(track, {
        x: `-=${movementDistance}`,
        duration: 95, // Smooth and premium pacing
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => {
            const parsedX = parseFloat(x);
            return parsedX <= -movementDistance ? parsedX + movementDistance : parsedX;
          })
        }
      });

      const handleResize = () => {
        if (loopRef.current) {
          loopRef.current.invalidate();
          movementDistance = calculateOffset();
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const pauseMarquee = () => {
    if (loopRef.current) {
      gsap.to(loopRef.current, { timeScale: 0.15, duration: 0.6, ease: "power2.out" });
    }
  };

  const resumeMarquee = () => {
    if (loopRef.current) {
      gsap.to(loopRef.current, { timeScale: 1, duration: 0.6, ease: "power2.out" });
    }
  };

  return (
    <section className="testimonials" ref={wrapperRef}>
      <div className="t-inner">

        {/* INFINITE MARQUEE ROW WITH FIXED WRAPPER FADING OVERLAYS */}
        <div className="t-marquee-wrapper">
          <div className="t-marquee-container">
            <div className="t-track" ref={trackRef}>
              {extendedData.map((item, idx) => (
                <TestimonialCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  absoluteIndex={idx % baseData.length}
                  onMouseEnter={pauseMarquee}
                  onMouseLeave={resumeMarquee}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}