import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faPenNib,
  faGlobe,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import './Stats.css';

gsap.registerPlugin(ScrollTrigger);

/* ===== ELEGANT MINIMALIST CIRCLE ICON ===== */
const StatIcon = ({ icon }) => {
  return (
    <div className="ssMaisonIconOuter">
      <div className="ssMaisonIconInner">
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
  );
};

export default function Stats() {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  const items = [
    { icon: faHeadset, value: "41,000+", label: "Ateliers Served" },
    { icon: faPenNib, value: "478,000+", label: "Master Artisans" },
    { icon: faGlobe, value: "135+", label: "Countries Covered" },
    { icon: faStar, value: "3,900+", label: "Bespoke Reviews" },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      /* ================= INITIAL LUXURY STATES ================= */
      gsap.set(".ssMaisonIconOuter", {
        scale: 0.8,
        opacity: 0,
      });

      gsap.set(".ssMaisonValue", {
        opacity: 0,
        y: 20,
      });

      gsap.set(".ssMaisonLabel", {
        opacity: 0,
        y: 15,
      });

      gsap.set(".ssMaisonDivider", {
        scaleY: 0,
        transformOrigin: "top center",
      });

      /* ================= GSAP SCROLL TIMELINE ================= */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 60%",
          scrub: 1,
        },
      });

      tl.to(".ssMaisonIconOuter", {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      })
      .to(".ssMaisonDivider", {
        scaleY: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.inOut",
      }, 0.2)
      .to(".ssMaisonValue", {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
      }, 0.3)
      .to(".ssMaisonLabel", {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
      }, 0.4);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="ssMaisonStatsSection" ref={sectionRef}>
      <div className="ssMaisonStatsContainer">
        {items.map((it, idx) => (
          <React.Fragment key={idx}>
            <div 
              className="ssMaisonStatCard"
              ref={(el) => (itemsRef.current[idx] = el)}
            >
              <StatIcon icon={it.icon} />
              <div className="ssMaisonTextGroup">
                <h3 className="ssMaisonValue">{it.value}</h3>
                <p className="ssMaisonLabel">{it.label}</p>
              </div>
            </div>
            {idx < items.length - 1 && <div className="ssMaisonDivider" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}