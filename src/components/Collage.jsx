import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import c1 from "../assets/collage1.jfif";
import c2 from "../assets/collage2.jfif";
import c3 from "../assets/collage3.jfif";
import c4 from "../assets/collage4.jfif";

gsap.registerPlugin(ScrollTrigger);

export default function Collage() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const item1Ref = useRef(null);
  const item2Ref = useRef(null);
  const item3Ref = useRef(null);
  const item4Ref = useRef(null);

  useEffect(() => {
    const items = [item1Ref.current, item2Ref.current, item3Ref.current, item4Ref.current];
    const container = containerRef.current;
    
    // Set initial states for entrance animation
    gsap.set(items, {
      opacity: 0,
      y: 50,
      scale: 0.95
    });

    // Entrance animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      }
    });

    tl.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });

    // Function to update grid columns based on hover
    const updateGridColumns = (hoverIndex) => {
      if (!container) return;
      
      if (hoverIndex === null) {
        container.style.gridTemplateColumns = "1fr 1fr 1.6fr 1fr";
      } else {
        let col1, col2, col3, col4;
        
        switch(hoverIndex) {
          case 0:
            col1 = "2.2fr";  // Reduced from 2.5fr
            col2 = "0.9fr";
            col3 = "0.9fr";
            col4 = "0.9fr";
            break;
          case 1:
            col1 = "0.9fr";
            col2 = "2.2fr";
            col3 = "0.9fr";
            col4 = "0.9fr";
            break;
          case 2:
            col1 = "0.9fr";
            col2 = "0.9fr";
            col3 = "2.5fr";  // Wide image gets less expansion
            col4 = "0.9fr";
            break;
          case 3:
            col1 = "0.9fr";
            col2 = "0.9fr";
            col3 = "0.9fr";
            col4 = "2.2fr";
            break;
          default:
            return;
        }
        
        container.style.gridTemplateColumns = `${col1} ${col2} ${col3} ${col4}`;
      }
    };

    // Add hover event listeners with MINIMAL zoom
    const hoverHandlers = items.map((item, index) => {
      if (!item) return null;
      
      const img = item.querySelector("img");
      
      const handleMouseEnter = () => {
        updateGridColumns(index);
        
        // VERY MINIMAL zoom on container (not on image)
        gsap.to(item, {
          scale: 1.01,  // Barely noticeable (was 1.02)
          boxShadow: "0 10px 20px -10px rgba(0,0,0,0.15)",
          duration: 0.3,
          ease: "power2.out",
          zIndex: 10
        });
        
        // NO ZOOM on image - comment out completely
        // if (img) {
        //   gsap.to(img, {
        //     scale: 1,
        //     duration: 0.3,
        //     ease: "power2.out"
        //   });
        // }
        
        // Slightly dim other items instead of scaling them
        items.forEach((otherItem, otherIndex) => {
          if (otherIndex !== index && otherItem) {
            gsap.to(otherItem, {
              scale: 0.99,  // Very slight scale down
              opacity: 0.95,  // Slight dim
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      };
      
      const handleMouseLeave = () => {
        updateGridColumns(null);
        
        // Reset hovered item
        gsap.to(item, {
          scale: 1,
          boxShadow: "0 0px 0px rgba(0,0,0,0)",
          duration: 0.3,
          ease: "power2.out",
          zIndex: 1
        });
        
        // Reset other items
        items.forEach((otherItem) => {
          if (otherItem && otherItem !== item) {
            gsap.to(otherItem, {
              scale: 1,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      };
      
      item.addEventListener("mouseenter", handleMouseEnter);
      item.addEventListener("mouseleave", handleMouseLeave);
      
      return { item, handleMouseEnter, handleMouseLeave };
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      hoverHandlers.forEach(handler => {
        if (handler && handler.item) {
          handler.item.removeEventListener("mouseenter", handler.handleMouseEnter);
          handler.item.removeEventListener("mouseleave", handler.handleMouseLeave);
        }
      });
    };
  }, []);

  return (
    <section className="collage" ref={sectionRef}>
      <div className="collage-inner" ref={containerRef}>
        <div className="collage-item" ref={item1Ref}>
          <img src={c1} alt="Look 1" />
        </div>

        <div className="collage-item" ref={item2Ref}>
          <img src={c2} alt="Look 2" />
        </div>

        <div className="collage-item collage-wide" ref={item3Ref}>
          <img src={c3} alt="Look 3" />
        </div>

        <div className="collage-item" ref={item4Ref}>
          <img src={c4} alt="Look 4" />
        </div>
      </div>
    </section>
  );
}