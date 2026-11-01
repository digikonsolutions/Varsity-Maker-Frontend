/* ==========================================================================
   Author Handles: creativetips | Name: fawad ahmad
   Project: Varsity Maker - Luxury Varsity Infographic & Premium Filter System
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiSliders, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { 
  LuSparkles, 
  LuShieldCheck, 
  LuRefreshCw, 
  LuUserCheck,
  LuPlane
} from "react-icons/lu"; 
import "./ProductsPage.css";
import { fetchCollectionProductsBySlug } from "../slices/products/collectionproductslice.jsx";
import { addToCart } from '../slices/cart/cartSlice.jsx'; 
import CartDrawer from './CartDrawer.jsx'; 
import Community from "../components/Community.jsx";
import TestimonialBanner from "../components/TestimonialBanner.jsx";
import { storageurl } from "../constants/baseurls.jsx";
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import DesignCTA from '../components/DesignCTA.jsx';
import VideoSections from '../components/EditorialChapters.jsx';
import Collagesection from '../components/Collage.jsx';
import FAQs from '../components/FAQ.jsx';
import Recentblogs from '../components/RecentBlogs.jsx';
import Relatedcat from '../components/RelatedCategories.jsx';
import VarsityInfographic from '../components/VarsityInfographic.jsx';
import TrustedSchools from '../components/TrustedSchools.jsx';
import Studentscommunity from '../components/StudentCommunity.jsx';
import DesignYourJacket from '../components/DesignYourJacket.jsx';
import TrustBadges from '../components/TrustBadges.jsx';
import CTAvideo from '../assets/cat-hero-video.mp4';
import Categorybestsellers from '../components/CategoryBestSellers.jsx';
import CategoryGridVideo from '/cat-product-grid-video.mp4';

gsap.registerPlugin(ScrollTrigger);

const Star = ({ filled = true }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? "currentColor" : "none"}>
    <path
      d="M12 17.3l-5.2 3 1.4-5.9L3.6 9.7l6.1-.5L12 3.6l2.3 5.6 6.1.5-4.6 4.7 1.4 5.9-5.2-3Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/* --------------------------------------------------------------------------
   Helper: normalize product images into a clean array of path strings.
   Handles all shapes the API might return:
     1) Array of paths      -> ["products/a.png", "products/b.png"]   (current case)
     2) JSON string         -> '["products/a.png","products/b.png"]'
     3) Single plain string -> "products/a.png"
   -------------------------------------------------------------------------- */
const parseProductImages = (mainImage) => {
  if (Array.isArray(mainImage)) {
    // Array could hold either raw paths or a single JSON-encoded string.
    if (mainImage.length === 1 && typeof mainImage[0] === "string" && mainImage[0].trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(mainImage[0]);
        return Array.isArray(parsed) ? parsed : mainImage;
      } catch {
        return mainImage;
      }
    }
    return mainImage;
  }

  if (typeof mainImage === "string" && mainImage.trim() !== "") {
    try {
      const parsed = JSON.parse(mainImage);
      return Array.isArray(parsed) ? parsed : [mainImage];
    } catch {
      return [mainImage];
    }
  }

  return [];
};

/* ================= PRODUCT CARD COMPONENT ================= */
function ProductCard({ product, onClick, onAddToCart }) {
  const cardRef = useRef(null);

  const isLowStock = product.stock <= 5; 
  const piecesLeft = product.stock; 
  const productTag = product.tag || (product.rating >= 4.7 ? "Best Seller" : "Most Popular");
  const discountPercent = product.price && product.discount_price 
    ? ((parseFloat(product.discount_price) / parseFloat(product.price)) * 100).toFixed(0) 
    : "0";

  const images = parseProductImages(product.main_image);
  const defaultImage = images?.[0] || "";
  const hoverImage = images?.[1] || "";

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = (y / rect.height - 0.5) * -8;
    const rotateY = (x / rect.width - 0.5) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.35,
      ease: "power3.out",
      transformPerspective: 1200,
      transformOrigin: "center",
    });
  };

  const resetMouse = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className="product-v-maker-product-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      onClick={() => onClick(product)}
    >
      <div className="v-maker-card-badges-row" onClick={(e) => e.stopPropagation()}>
        <span className={`v-maker-badge-tag ${productTag.toLowerCase().replace(" ", "-")}`}>
          {productTag}
        </span>
        <span className={`v-maker-stock-status ${isLowStock ? 'low-stock' : 'in-stock'}`}>
          {isLowStock ? 'Low Stock' : 'In Stock'}
        </span>
      </div>

      <div className="v-maker-media-wrapper">
        <img
          src={`${storageurl}${defaultImage}`}
          alt={product.name}
          className="v-maker-product-image primary-image"
        />

        {hoverImage && hoverImage !== defaultImage && (
          <img
            src={`${storageurl}${hoverImage}`}
            alt={product.name}
            className="v-maker-product-image secondary-image"
          />
        )}
        <div className="v-maker-hover-actions-overlay">
          <div className="v-maker-pill-buttons-container">
            <button 
              className="v-maker-btn-add-cart-pill"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="v-maker-product-details">
        <div className="v-maker-row-space">
          <h2 className="v-maker-product-name">{product.name}</h2>
          <span className="v-maker-product-price">$ {product.price}</span>
        </div>

        <div className="v-maker-rating-container">
          <div className="v-maker-rating-left">
            <span className="v-maker-rating-score">
              {product.rating || "4.5"}
            </span>

            <div className="v-maker-stars-group">
              <Star filled />
              <Star filled />
              <Star filled />
              <Star filled />
              <Star filled />
            </div>

            <span className="v-maker-reviews-count">
              ({product.reviews || "25k+"})
            </span>
          </div>

          {parseFloat(discountPercent) > 0 && (
            <div className="v-maker-discount-badge">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        <div className="v-maker-stock-countdown-line">
          {product.stock < 30 ? (
            <span className="text-danger">
              <FaFire style={{ marginRight: "6px" }} />
              Only {piecesLeft} pieces left! Hurry up
            </span>
          ) : (
            <span className="text-success">In stock & ready to ship</span>
          )}
        </div>

        <button 
          className="v-maker-btn-custom-design-row" 
          onClick={(e) => e.stopPropagation()}
        >
          Start Customization
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN PRODUCTS PAGE COMPONENT ================= */
const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { slug } = useParams();

  const [cartOpen, setCartOpen] = useState(false);
  const { items, collection, loading } = useSelector((state) => state.collectionProducts);

  // Dynamic Filtering Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [sortBy, setSortBy] = useState("featured");
  const [priceFilter, setPriceFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");

  const sectionRef = useRef(null);
  const leftItemsRef = useRef([]);
  const rightItemsRef = useRef([]);
  const centerImageRef = useRef(null);
  
  const blogsSectionRef = useRef(null);
  const categoriesSectionRef = useRef(null);
  const heroVisualRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCollectionProductsBySlug(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (loading || !items || items.length === 0) return;

    const ctx = gsap.context(() => {
      if (heroVisualRef.current) {
        gsap.fromTo(
          heroVisualRef.current,
          { opacity: 0, scale: 0.95, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: "power4.out", delay: 0.2 }
        );
      }

      gsap.fromTo(
        centerImageRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
       dynamicFilterEngine();
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, items]);

  const dynamicFilterEngine = () => {
    gsap.fromTo(".product-v-maker-product-card", 
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" }
    );
  };

  const handleProductClick = (product) => {
    const productId = product.id || product._id;
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    const fixedProduct = { ...product, id: product.id || product._id };
    dispatch(addToCart(fixedProduct));
    setCartOpen(true); 
  };

  const toggleDropdown = (type) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setPriceFilter("all");
    setMaterialFilter("all");
    setActiveDropdown(null);
    dynamicFilterEngine();
  };

  let processedItems = items ? [...items] : [];

  if (searchQuery) {
    processedItems = processedItems.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (priceFilter !== "all") {
    if (priceFilter === "under-200") processedItems = processedItems.filter(p => parseFloat(p.price) < 200);
    if (priceFilter === "200-400") processedItems = processedItems.filter(p => parseFloat(p.price) >= 200 && parseFloat(p.price) <= 400);
    if (priceFilter === "above-400") processedItems = processedItems.filter(p => parseFloat(p.price) > 400);
  }

  if (sortBy === "price-low") processedItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  if (sortBy === "price-high") processedItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  if (sortBy === "rating") processedItems.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));

  const firstRowProducts = processedItems.slice(0, 2);
  const remainingProducts = processedItems.slice(2);

  return (
    <>
      <div className="v-maker-catalog-viewport">
        
        {/* ================= HERO SECTION ================= */}
        <header className="product-hero-banner-modern">
          <div className="video-background-container">
            <video 
              className="hero-cinematic-video"
              src={CTAvideo} 
              autoPlay 
              loop 
              muted 
              playsInline
            />
            <div className="video-luxury-overlay"></div>
            <div className="video-mesh-gradient"></div>
          </div>
          
          <div className="product-hero-tech-lines"></div>

          <div className="hero-modern-content-wrapper" ref={heroVisualRef}>
            <div className="hero-cta-suite-modern">
              <button className="product-btn-modern-primary">
                <span className="btn-glow-effect"></span>
                <span className="btn-text">Design Your Jacket</span>
                <FiArrowRight className="product-btn-hero-arrow-modern" />
              </button>
              <button className="product-btn-modern-blur">
                <span>Explore Collection</span>
              </button>
            </div>

            <div className="v-maker-hero-social-pill-modern">
              <div className="v-maker-hero-avatar-deck">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Student Creator" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Student Creator" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Student Creator" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Student Creator" />
              </div>
              <div className="v-maker-hero-pill-meta-modern">
                <span>Join 10,000+ students</span> who trust Varsity Maker
              </div>
            </div>
          </div>

          <div className="tech-frame-corner tl"></div>
          <div className="tech-frame-corner tr"></div>
          <div className="tech-frame-corner bl"></div>
          <div className="tech-frame-corner br"></div>
        </header>

        <TrustBadges/>
        <Categorybestsellers setCartOpen={setCartOpen} />

        {/* ================= HIGH-END DYNAMIC FILTERS CONTROL ROW ================= */}
        <div className="v-maker-filter-master-bar" ref={dropdownRef}>
          <div className="v-maker-filter-inner-shell">
            
            <div className="v-maker-filter-search-pod">
              <FiSearch className="v-maker-search-icon" />
              <input 
                type="text" 
                placeholder="Search premium jackets..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  dynamicFilterEngine();
                }}
              />
              {searchQuery && <FiX className="v-maker-search-clear" onClick={() => setSearchQuery("")} />}
            </div>

            <div className="v-maker-filter-actions-deck">
              
              <div className={`v-maker-dropdown-gate ${activeDropdown === 'sort' ? 'is-active' : ''}`}>
                <button onClick={() => toggleDropdown('sort')} className="v-maker-dropdown-trigger">
                  <FiSliders className="trigger-icon-lead" />
                  <span>
                    {sortBy === "featured" && "Sort: Featured"}
                    {sortBy === "price-low" && "Price: Low to High"}
                    {sortBy === "price-high" && "Price: High to Low"}
                    {sortBy === "rating" && "Top Rated"}
                  </span>
                  <FiChevronDown className="trigger-icon-trail" />
                </button>
                <div className="v-maker-dropdown-vault">
                  <div className="vault-opt" onClick={() => { setSortBy("featured"); setActiveDropdown(null); dynamicFilterEngine(); }}>Featured Collection</div>
                  <div className="vault-opt" onClick={() => { setSortBy("price-low"); setActiveDropdown(null); dynamicFilterEngine(); }}>Price: Low to High</div>
                  <div className="vault-opt" onClick={() => { setSortBy("price-high"); setActiveDropdown(null); dynamicFilterEngine(); }}>Price: High to Low</div>
                  <div className="vault-opt" onClick={() => { setSortBy("rating"); setActiveDropdown(null); dynamicFilterEngine(); }}>Highest Rating</div>
                </div>
              </div>

              <div className={`v-maker-dropdown-gate ${activeDropdown === 'price' ? 'is-active' : ''}`}>
                <button onClick={() => toggleDropdown('price')} className="v-maker-dropdown-trigger">
                  <span>
                    {priceFilter === "all" && "All Prices"}
                    {priceFilter === "under-200" && "Under $200"}
                    {priceFilter === "200-400" && "$200 - $400"}
                    {priceFilter === "above-400" && "Over $400"}
                  </span>
                  <FiChevronDown className="trigger-icon-trail" />
                </button>
                <div className="v-maker-dropdown-vault">
                  <div className="vault-opt" onClick={() => { setPriceFilter("all"); setActiveDropdown(null); dynamicFilterEngine(); }}>All Available Rates</div>
                  <div className="vault-opt" onClick={() => { setPriceFilter("under-200"); setActiveDropdown(null); dynamicFilterEngine(); }}>Value (Under $200)</div>
                  <div className="vault-opt" onClick={() => { setPriceFilter("200-400"); setActiveDropdown(null); dynamicFilterEngine(); }}>Mid-Tier ($200 - $400)</div>
                  <div className="vault-opt" onClick={() => { setPriceFilter("above-400"); setActiveDropdown(null); dynamicFilterEngine(); }}>Luxe Series (Over $400)</div>
                </div>
              </div>

              {(searchQuery || sortBy !== "featured" || priceFilter !== "all") && (
                <button className="v-maker-filter-reset-action" onClick={resetFilters}>
                  Clear Filters
                </button>
              )}

            </div>
          </div>
        </div>

        {/* ================= INTERLOCKING PRODUCT STREAM GRID ================= */}
        <div className="v-maker-main-layout" ref={sectionRef}>
          {loading ? (
            <div className="v-maker-loading-wrapper"><LoadingSpinner /></div>
          ) : processedItems.length > 0 ? (
            <div className="v-maker-catalog-flow-wrapper">
              <div className="v-maker-editorial-top-row">
                
                {/* MODERN VIDEO EDITORIAL CARD */}
                <div className="v-maker-editorial-brand-card">
                  <video 
                    className="v-maker-brand-video-bg"
                    src={CategoryGridVideo} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  />
                  <div className="v-maker-brand-card-overlay"></div>
                  <div className="v-maker-brand-card-content">
                    <h2 className="v-maker-brand-title">{collection?.name || "Custom Letterman Jacket"}</h2>
                    <div className="v-maker-brand-divider"></div>
                    <p className="v-maker-brand-desc">
                      {collection?.description || "Crafted with premium wool for warmth and durability..."}
                    </p>
                  </div>
                </div>

                {firstRowProducts.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {remainingProducts.length > 0 && (
                <div className="v-maker-product-standard-grid">
                  {remainingProducts.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                      onClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="v-maker-empty-catalog">
              <p>No designs match your upscale filter combination.</p>
              <button onClick={resetFilters} className="v-maker-btn-custom-design-row" style={{maxWidth: '200px', marginTop: '16px'}}>Reset Filters</button>
            </div>
          )}
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <div>
        <VarsityInfographic />
        <TrustedSchools/>
        <TestimonialBanner />
        <DesignYourJacket/>
        <VideoSections/>
        <Collagesection/>
      </div>
      <div style={{ marginTop: "-10px" }}>
        <Relatedcat/>
        <Recentblogs/>
        <Studentscommunity/>
        <FAQs />
      </div>
    </>
  );
};

export default ProductPage;