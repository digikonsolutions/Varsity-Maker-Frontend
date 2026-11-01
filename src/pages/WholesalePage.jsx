import React, { useEffect, useState, useRef } from 'react';
import './WholesalePage.css';
import Collage from '../components/Collage.jsx';
import TestimonialsBanner from '../components/TestimonialBanner.jsx';
const WholesalePage = () => {
  const lookbookImages = [
    {
      id: 1,
      url: "https://www.goldenbearstore.com/cdn/shop/files/74526571_3337443552963212_4728379708944774601_n_1.webp?v=1739484661&width=720",
      alt: "Custom Collaboration Varsity Jacket Display"
    },
    {
      id: 2,
      url: "https://www.goldenbearstore.com/cdn/shop/files/s768593035695673172_p60_i4_w2000.webp?v=1739484786&width=1000",
      alt: "Premium Wool Texture & Craftsmanship Detail"
    },
    {
      id: 3,
      url: "https://www.goldenbearstore.com/cdn/shop/files/https___hypebeast.com_image_2017_12_noah-golden-bear-varsity-jacket-5.jpg?v=1739485059&width=1000",
      alt: "Noah xVarsity Maker Collaborative Piece"
    }
  ];

  const collaboratorLogos = [
    { id: 1, url: "https://www.goldenbearstore.com/cdn/shop/files/AIME_LEON_DORE___CURSIVE_FONT_LOGO_36392fbf-82ef-484d-8ca0-0c48c008f700.png?crop=center&height=400&v=1739405674&width=400", alt: "Aimé Leon Doré" },
    { id: 2, url: "https://www.goldenbearstore.com/cdn/shop/files/RC_white.png?crop=center&height=400&v=1739405796&width=400", alt: "Reigning Champ" },
    { id: 3, url: "https://www.goldenbearstore.com/cdn/shop/files/Palace_55b64440-22f7-4310-973d-1cb858b2802a.png?crop=center&height=400&v=1739482898&width=400", alt: "Palace" },
    { id: 4, url: "https://www.goldenbearstore.com/cdn/shop/files/TS.png?crop=center&height=400&v=1739483231&width=400", alt: "Todd Snyder" }
  ];

  const accordionBrands = [
    { id: 0, name: "KITH", image: "https://www.goldenbearstore.com/cdn/shop/files/Kith-Russell-Athletic-Cuny-Brooklyn-College-Golden-Bear-Black-White-Varsity-Jacket-3.webp?v=1739483629&width=1000" },
    { id: 1, name: "TODD SNYDER", image: "https://www.goldenbearstore.com/cdn/shop/files/ou02782070_yl07_024_r_1024x1024-2.jpg?v=1739483629&width=1000" },
    { id: 2, name: "REIGNING CHAMP", image: "https://www.goldenbearstore.com/cdn/shop/files/MjAzNzAwODc2MjI3OTEzNjE4_upscayl_4x_realesrgan-x4fast.jpg?v=1739483786&width=1000" },
    { id: 2, name: "AIME LEON DORE", image: "https://www.goldenbearstore.com/cdn/shop/files/1645816715-aime-leon-dore-ss22-collection-lookbook-17_upscayl_4x_realesrgan-x4fast.jpg?v=1739483943&width=1000" }
  ];

  const bannerSlides = [
    { id: 0, image: "https://www.goldenbearstore.com/cdn/shop/files/GB_WHolesale5.webp?v=1739402952&width=1000", text: "AMERICAN LUXURY IS" },
    { id: 1, image: "https://www.goldenbearstore.com/cdn/shop/files/GB_WHolesale4.webp?v=1739402952&width=600", text: "CRAFTSMANSHIP, TIMELESS STYLE" },
    { id: 2, image: "https://www.goldenbearstore.com/cdn/shop/files/W603T-Navy-LP-Lux-Wool_5-REV.jpg?v=1763998676&width=1000", text: "& REFINEMENT" },
    { id: 3, image: "https://www.goldenbearstore.com/cdn/shop/files/GB_WHolesale2.webp?v=1739402952&width=600", text: "ROOTED IN AMERICAN HERITAGE." }
  ];

  const publicationLogos = [
    "https://www.goldenbearstore.com/cdn/shop/files/the-new-york-times_logotyp.us.png?v=1732722661&width=140",
    "https://www.goldenbearstore.com/cdn/shop/files/gear-patrol-seeklogo.svg?v=1732722674&width=100",
    "https://www.goldenbearstore.com/cdn/shop/files/512px-HYPEBEAST-Logo__2022.png?v=1732722639&width=100",
    "https://www.goldenbearstore.com/cdn/shop/files/highsnobiety-seeklogo.svg?v=1732722683&width=100",
    "https://www.goldenbearstore.com/cdn/shop/files/SF.png?v=1732722939&width=140"
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const sectionRef = useRef(null);

  // Active image transition handling on scroll
  useEffect(() => {
    const handleScroll = () => {
      const images = document.querySelectorAll('.sticky-image-item');
      if (images.length === 0) return;
      
      let activeIndex = 0;
      const triggerPoint = window.innerHeight * 0.4; // Center view transition trigger

      images.forEach((img, idx) => {
        const rect = img.getBoundingClientRect();
        if (rect.top <= triggerPoint) {
          activeIndex = idx;
        }
      });
      
      setActiveImageIndex(activeIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-rotating bottom banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerSlides.length]);

  return (
    <div className="wholesale-page-wrapper">
      <div className="wholesale-container">
        
        {/* SECTION 1: LEGACY OF LUXURY */}
        <div className="section-text fade-on-scroll">
          <div className="wrapper text-left">
            <p className="text__heading">LEGACY OF LUXURY</p>
            <div className="text__content">
              <p>Over the decades,Varsity Maker has built a legacy of fine tailored Americana across the eras, upholding the dedication to craftsmanship & luxury bolstered by utilizing only best-in-class materials. Long-lasting wools, premium cowhides, and luxurious skins are sourced both domestically and from highly regarded mills & tanneries throughout the world.</p>
              <p>Golden Bear has proudly collaborated with many premier brands such as Mr. Porter, Kith, Aimé Leon Doré, Todd Snyder, Stussy, Bape, BBC, Palace, Noah, L'Art De L'Automobile, Reigning Champ, Psycho Bunny and more.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: STICKY GRID SPLIT (LEFT STICKY PANEL / RIGHT SCROLLABLE STREAM) */}
        <div className="sticky-images-section" ref={sectionRef}>
          <div className="sticky-grid">
            
            {/* LEFT SIDE - STAYS FIXED WHILE RIGHT CONTENT SCROLLS */}
            <div className="sticky-text-panel">
              <div className="sticky-text-inner fade-on-scroll">
                <span className="sticky-tagline">WHOLESALE INQUIRIES</span>
                <h1 className="sticky-heading">
                  CUSTOM <br />
                  <span className="serif-accent">COLLABORATIONS</span>
                </h1>
                <div className="divider-line"></div>
                <p className="sticky-description">
                  With over a century of research & development of manufacturing superior quality garments, 
                  our inherited craftsmanship has earned us a reputation for the excellence of our creations.
                </p>
                <p className="sticky-sub-description">
                  We offer full custom collaborations as well as access to an endless archive of timeless designs 
                  to accommodate the full range of styles from classic to contemporary.
                </p>
                
                <div class="wholesale-hero-cta "><a class="wholesale-btn wholesale-btn-primary-hero" href="#">SHOP NOW <svg viewBox="0 0 24 24" width="20" height="20" fill="none" class="arrow-icon"><path d="M7 17L17 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path><path d="M9 7h8v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div>
              </div>
            </div>

            {/* RIGHT SIDE - IMAGES THAT SCROLL NATURALLY */}
            <div className="sticky-images-stream">
              {lookbookImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`sticky-image-item ${activeImageIndex === index ? 'is-active' : ''}`}
                  data-img-index={index}
                >
                  <div className="image-frame">
                    <div className="stitch-accent"></div>
                    <img src={image.url} alt={image.alt} loading="lazy" />
                    <div className="image-caption">{image.alt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: MULTICOLUMN LOGOS (Appears naturally after section 2 finishes) */}
        <div className="section-multicolumn fade-on-scroll animate-in"> 
  {/* Temporary debugging ke liye 'animate-in' class laga kar direct dekhein agar fade observer issue kar raha hai */}
  <div className="wrapper">
    <div className="logos-grid">
      {collaboratorLogos.map((logo) => (
        <div key={logo.id} className="logo-item">
          <img src={logo.url} alt={logo.alt} />
        </div>
      ))}
    </div>
  </div>
  </div>

        {/* SECTION 4: IMAGE ACCORDIONS */}
        <Collage/>

        {/* SECTION 5: PRESS QUOTE */}
        <div className="section-press fade-on-scroll">
          <div className="press-content">
            <h1 className="press-quote">THE BEST VARSITY JACKET OVERALL</h1>
            <div className="text__content">
              <p>Recognized by some of the most respected publications in the fashion and popular culture industries such as:</p>
            </div>
          </div>
        </div>


        {/* SECTION 8: BANNER SLIDER */}
        <div className="section-banner-slider fade-on-scroll">
          <div className="banner-wrapper">
            <div className="banner-media">
              {bannerSlides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`banner-image ${currentBanner === index ? 'is-selected' : ''}`}
                >
                  <img src={slide.image} alt={slide.text} />
                  <div className="banner-overlay"></div>
                </div>
              ))}
            </div>
            <div className="banner-text-content">
              {bannerSlides.map((slide, index) => (
                <div key={slide.id} className={`banner-text-item ${currentBanner === index ? 'is-active' : ''}`}>
                  <h2 className="banner-heading">{slide.text}</h2>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 9: 100 YEARS IN THE MAKING */}
        <div className="section-text fade-on-scroll">
          <div className="wrapper--narrow text-left">
            <div className="text-subheading">AMERICAN LUXURY</div>
            <p className="text__heading">100 Years in the Making</p>
            <div className="text__content">
              <p>Independently owned,Varsity Maker is a 102-year-old premium outerwear manufacturer & luxury brand based in San Francisco, California.</p>
              <p>Out of a small factory, TheVarsity Maker Sportswear Company began in 1922, crafting durable dockworker coats for the longshoremen who hauled cargo up and out of San Francisco Bay.</p>
              <p>Golden Bear Sportswear remains one of the last standing beacons of authentic premium quality outerwear, proudly handcrafted in the USA.</p>
            </div>
          </div>
        </div>

        <TestimonialsBanner/>
      </div>
    </div>
    
  );
};

export default WholesalePage;