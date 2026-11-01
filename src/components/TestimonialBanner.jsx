import { useMemo, useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'; 
import { FaPlay } from 'react-icons/fa';
import './TestimonialBanner.css';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  // 5 high-fidelity video URLs from unsplash/pexels for cinematic background reels
  const videoData = useMemo(
    () => [
      {
        id: 1,
        videoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e8d0e76a6cf49ca3090cd7da4ef&profile_id=165&oauth2_token_id=57447761",
        poster: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
        label: "Summer Drop Outfit"
      },
      {
        id: 2,
        videoUrl: "https://player.vimeo.com/external/435649375.sd.mp4?s=44fb868b209dfb018b10cb7c25143a41ffaf7b21&profile_id=165&oauth2_token_id=57447761",
        poster: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80",
        label: "Luxury Streetwear Review"
      },
      {
        id: 3,
        videoUrl: "https://player.vimeo.com/external/384761655.sd.mp4?s=3c19ae978fd6f0b2e6a99268f0cb64600570b240&profile_id=165&oauth2_token_id=57447761",
        poster: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80",
        label: "Premium Fit Check"
      },
      {
        id: 4,
        videoUrl: "https://player.vimeo.com/external/409156711.sd.mp4?s=b5f7b0a72fa344d5cfd137b2d56a282cb97910e5&profile_id=165&oauth2_token_id=57447761",
        poster: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80",
        label: "Varsity Jacket Detail"
      },
      {
        id: 5,
        videoUrl: "https://player.vimeo.com/external/517604314.sd.mp4?s=6a9b4edcb6eb949fcbfdf631f47fa10a30b4ec75&profile_id=165&oauth2_token_id=57447761",
        poster: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop&q=80",
        label: "Editorial Fabric Close-up"
      }
    ],
    []
  );

  // Since we display 3 items at once, max translation page index is length - 3
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = videoData.length - 3;

  const sectionRef = useRef(null);
  const sliderTrackRef = useRef(null);

  // Smooth 3D Translation Matrix slide effect using GSAP
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(sliderTrackRef.current, {
        xPercent: -((currentIndex * 100) / 3),
        duration: 0.75,
        ease: "power4.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [currentIndex]);

  // Entrance triggers for global block
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".tb-reel-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        rotationY: 15,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const goNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Inline dynamic play state handling wrapper
  const handlePlayVideo = (e, index) => {
    const video = document.getElementById(`reel-vid-${index}`);
    const overlay = e.currentTarget.closest('.tb-video-overlay');
    if (video) {
      if (video.paused) {
        video.play();
        if (overlay) overlay.style.opacity = "0";
      } else {
        video.pause();
        if (overlay) overlay.style.opacity = "1";
      }
    }
  };

  return (
    <section className="tb" ref={sectionRef}>
      <div className="tb-inner">
        
        {/* Header Block: Split Screen Layout */}
        <div className="tb-header-split">
          <div className="tb-header-left">
            <h2 className="tb-title">What Our Customer Says</h2>
            <div className="tb-trust-badge">
              <span className="tb-badge-platform">✓ Verified Video Reviews</span>
              <span className="tb-badge-rating"><div class="vm-stars-row"><svg stroke="none" fill="#caa35a" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg><svg stroke="none" fill="#caa35a" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg><svg stroke="none" fill="#caa35a" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg><svg stroke="none" fill="#caa35a" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg><svg stroke="none" fill="#caa35a" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg></div>4.7/5 Based on latest user feedback</span>
            </div>
          </div>
          
          {/* Navigation Action Buttons on the Absolute Right Side */}
          <div className="tb-header-nav">
            <button 
              className="tb-nav-arrow" 
              onClick={goPrev} 
              disabled={currentIndex === 0}
              aria-label="Previous Reels Row"
            >
              <FiArrowLeft />
            </button>
            <button 
              className="tb-nav-arrow" 
              onClick={goNext} 
              disabled={currentIndex === maxIndex}
              aria-label="Next Reels Row"
            >
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Masked Slider Viewport Window Container */}
        <div className="tb-grid-viewport">
          <div className="tb-slider-track" ref={sliderTrackRef}>
            {videoData.map((item, index) => (
              <div className="tb-reel-card" key={item.id}>
                <div className="tb-reel-media-box">
                  
                  {/* Native low-overhead video layer */}
                  <video 
                    id={`reel-vid-${index}`}
                    className="tb-reel-native-video"
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={item.poster}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                  </video>

                  {/* Standard Static Interactive Mask Overlay Layer */}
                  <div className="tb-video-overlay">
                    <button 
                      className="tb-modern-play-hub" 
                      onClick={(e) => handlePlayVideo(e, index)}
                      aria-label="Stream Video Review"
                    >
                      <div className="tb-pulse-ring-ambient"></div>
                      <div className="tb-pulse-ring-ambient slower"></div>
                      <div className="tb-play-icon-center">
                        <FaPlay />
                      </div>
                    </button>
                    <span className="tb-reel-tag">{item.label}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Carousel Dot Indicator Layout Row */}
        <div className="tb-bottom-dots-row">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`tb-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Shift to frame portfolio group ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}