import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { FaHeart, FaFilter, FaTimes, FaLayerGroup, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./ShopPage.css";
import { fetchproducts } from "../slices/products/productslice.jsx";
import { addToCart } from "../slices/cart/cartSlice.jsx";
import CartDrawer from "./CartDrawer.jsx";
import { storageurl } from "../constants/baseurls.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

/* ─────────────────────────────────────────
   STAR COMPONENT
───────────────────────────────────────── */
const Star = ({ filled = true }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? "#caa24b" : "none"}>
    <path
      d="M12 17.3l-5.2 3 1.4-5.9L3.6 9.7l6.1-.5L12 3.6l2.3 5.6 6.1.5-4.6 4.7 1.4 5.9-5.2-3Z"
      stroke="#caa24b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─────────────────────────────────────────
   PRODUCT CARD (Match With Image Screenshot)
───────────────────────────────────────── */
function ProductCard({ product, onClick, onAddToCart }) {
  const cardRef = useRef(null);
  const [wished, setWished] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    gsap.to(card, {
      rotateX, rotateY, scale: 1.01,
      duration: 0.35, ease: "power3.out",
      transformPerspective: 1200, transformOrigin: "center",
    });
  };

  const resetMouse = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0, rotateY: 0, scale: 1,
      duration: 0.5, ease: "power3.out",
    });
  };

 const images = Array.isArray(product?.main_image)
  ? product.main_image
  : [product?.main_image];

const primaryImage = images?.[0];
const secondaryImage = images?.[1] || images?.[0];

const activeImage = isHovered ? secondaryImage : primaryImage;

const imgSrc = activeImage
  ? (
      typeof activeImage === "string" &&
      activeImage.startsWith("http")
        ? activeImage
        : `${storageurl}${activeImage}`
    )
  : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop";

  return (
    <div
     ref={cardRef}
  className="apc-card"
  onMouseMove={handleMouseMove}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => {
    resetMouse();
    setIsHovered(false);
  }}
  onClick={() => onClick(product)}
    >
      <button
        className={`apc-card__wish ${wished ? "apc-card__wish--active" : ""}`}
        onClick={(e) => { e.stopPropagation(); setWished((p) => !p); }}
        aria-label="Wishlist"
      >
        <FaHeart />
      </button>

      <div
  className="apc-card__img-wrap"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <img
    src={
      primaryImage?.startsWith("http")
        ? primaryImage
        : `${storageurl}${primaryImage}`
    }
    alt={product?.name}
    className={`apc-card__img apc-card__img--primary ${
      isHovered ? "hide" : "show"
    }`}
  />

  {secondaryImage && secondaryImage !== primaryImage && (
    <img
      src={
        secondaryImage?.startsWith("http")
          ? secondaryImage
          : `${storageurl}${secondaryImage}`
      }
      alt={product?.name}
      className={`apc-card__img apc-card__img--secondary ${
        isHovered ? "show" : "hide"
      }`}
    />
  )}
</div>

      <div className="apc-card__meta">
        <h3 className="apc-card__name">{product?.name || "PREMIUM VARSITY JACKET"}</h3>

        <div className="apc-card__rating-row">
          <span className="apc-card__badge">{Number(product?.rating || 4.5).toFixed(1)}</span>
          <span className="apc-card__stars">
            {[1,2,3,4,5].map((n) => <Star key={n} filled={n <= Math.round(product?.rating || 4.5)} />)}
          </span>
          <span className="apc-card__count">({product?.reviews || "25k+"})</span>
        </div>

        <p className="apc-card__sub">2K+ bought in past month</p>

        <div className="apc-card__actions">
          <button
            className="apc-card__cart-btn"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            Add to Cart
          </button>
          <span className="apc-card__price">Rs {Number(product?.price || 750).toLocaleString()}.00</span>
        </div>

        <button className="apc-card__design-btn" onClick={(e) => e.stopPropagation()}>
          Design Your Jacket
        </button>
      </div>
    </div>
  );
}

const AllProductsPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const { items, loading, error } = useSelector((state) => state.products || {});

  const productsArray = useMemo(() => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (items?.data?.products && Array.isArray(items.data.products)) return items.data.products;
    if (items?.products && Array.isArray(items.products)) return items.products;
    return [];
  }, [items]);

  const collectionsArray = useMemo(() => {
    if (items?.data?.collections && Array.isArray(items.data.collections)) return items.data.collections;
    if (items?.collections && Array.isArray(items.collections)) return items.collections;
    return [];
  }, [items]);

  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [selectedCollections, setSelectedCollections] = useState([]); 
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sortBy, setSortBy] = useState("Featured");
  const [openAccordions, setOpenAccordions] = useState({}); 

  useEffect(() => { 
    dispatch(fetchproducts()); 
  }, [dispatch]);

  /* ── Smart Category Hierarchy Engine ── */
  const structuredCollections = useMemo(() => {
    if (!collectionsArray.length) return [];

    const parents = [];
    const childrenMap = {};

    collectionsArray.forEach(col => {
      const potentialParent = collectionsArray.find(p => 
        col.id !== p.id && col.name.startsWith(p.name) && col.name !== p.name
      );

      if (col.parent_id) {
        if (!childrenMap[col.parent_id]) childrenMap[col.parent_id] = [];
        childrenMap[col.parent_id].push(col);
      } else if (potentialParent) {
        if (!childrenMap[potentialParent.id]) childrenMap[potentialParent.id] = [];
        childrenMap[potentialParent.id].push(col);
      } else {
        parents.push(col);
      }
    });

    return parents.map(p => ({
      ...p,
      subcategories: childrenMap[p.id] || []
    }));
  }, [collectionsArray]);

  // Auto-expand accordion panels when any sub-checkbox inside is clicked
  useEffect(() => {
    if (selectedCollections.length > 0) {
      structuredCollections.forEach(parent => {
        const hasChildActive = parent.subcategories.some(sub => selectedCollections.includes(sub.id));
        if (hasChildActive) {
          setOpenAccordions(prev => ({ ...prev, [parent.id]: true }));
        }
      });
    }
  }, [selectedCollections, structuredCollections]);

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle collection multi-selection handler
  const handleCollectionCheckboxChange = (id) => {
    setSelectedCollections(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };



  /* ── Filter Engine (Price Filter Removed) ── */
  const displayed = useMemo(() => {
    let list = productsArray.filter((p) => {
      if (selectedCollections.length > 0) {
        if (!selectedCollections.includes(Number(p.collection_id))) {
          return false;
        }
      }
      
      return true;
    });

    if (sortBy === "Price: Low to High") {
      list = [...list].sort((a,b) => Number(String(a.price).replace(/[^0-9.-]+/g, "")) - Number(String(b.price).replace(/[^0-9.-]+/g, "")));
    }
    if (sortBy === "Price: High to Low") {
      list = [...list].sort((a,b) => Number(String(b.price).replace(/[^0-9.-]+/g, "")) - Number(String(a.price).replace(/[^0-9.-]+/g, "")));
    }
    if (sortBy === "Best Rating") {
      list = [...list].sort((a,b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [productsArray, selectedCollections, sortBy]);

  const hasFilters = selectedCollections.length > 0 || selectedColor || selectedSize;

  const handleClear = () => {
    setSelectedCollections([]);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, id: product.id || product._id }));
    setCartOpen(true);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id || product._id}`);
  };

  /* ─────────────── SIDEBAR JSX ─────────────── */
  const SidebarContent = () => (
    <div className="apc-sidebar__inner">
      <div className="apc-sidebar__head">
        <span className="apc-sidebar__title">Filters</span>
        {hasFilters && (
          <button className="apc-sidebar__clear" onClick={handleClear}>Clear all</button>
        )}
      </div>

      {/* Accordion Collections Filter with Checkboxes */}
      {structuredCollections.length > 0 && (
        <div className="apc-filter-group">
          <p className="apc-filter-group__label">
            {/* <FaLayerGroup style={{marginRight: '6px'}}/> Collections */}
          </p>
          <div className="apc-accordion-container">
            {structuredCollections.map((parent) => {
              const isParentChecked = selectedCollections.includes(parent.id);
              const hasSubs = parent.subcategories && parent.subcategories.length > 0;
              const isExpanded = !!openAccordions[parent.id];

              return (
                <div key={parent.id} className="apc-accordion-item">
                  <div className={`apc-accordion-header ${isParentChecked ? "apc-accordion-header--active" : ""}`}>
                    <label className="apc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isParentChecked}
                        onChange={() => handleCollectionCheckboxChange(parent.id)}
                        className="apc-custom-checkbox"
                      />
                      <span className="apc-checkbox-text">{parent.name}</span>
                    </label>
                    
                    {hasSubs && (
                      <button 
                        className="apc-accordion-header__toggle-btn"
                        onClick={(e) => { e.preventDefault(); toggleAccordion(parent.id); }}
                        aria-label="Toggle Subcategories"
                      >
                        {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                      </button>
                    )}
                  </div>

                  {/* Subcategories Panel */}
                  {hasSubs && isExpanded && (
                    <div className="apc-accordion-panel">
                      {parent.subcategories.map((sub) => {
                        const isSubChecked = selectedCollections.includes(sub.id);
                        return (
                          <label key={sub.id} className="apc-checkbox-label apc-sub-checkbox-label">
                            <input
                              type="checkbox"
                              checked={isSubChecked}
                              onChange={() => handleCollectionCheckboxChange(sub.id)}
                              className="apc-custom-checkbox"
                            />
                            <span className={`apc-checkbox-text ${isSubChecked ? "apc-checkbox-text--active" : ""}`}>
                              {sub.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

     

     
    </div>
  );

  return (
    <>
      <div className="apc-page">
        {/* Top Bar */}
        <div className="apc-topbar">
          <div className="apc-topbar__left">
            <button
              className="apc-topbar__filter-toggle"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label="Toggle filters"
            >
              <FaFilter /> Filters
            </button>
            <h1 className="apc-topbar__title">All Products</h1>
            <span className="apc-topbar__count">
              {displayed.length} / {productsArray.length} products
            </span>
          </div>

          <select
            className="apc-topbar__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Featured">Featured</option>
            <option value="Price: Low to High">Price: Low → High</option>
            <option value="Price: High to Low">Price: High → Low</option>
            <option value="Best Rating">Best Rating</option>
          </select>
        </div>

        {/* Body Layout */}
        <div className="apc-body">
          <aside className="apc-sidebar apc-sidebar--desktop">
            <SidebarContent />
          </aside>

          {/* Mobile drawer */}
          {sidebarOpen && (
            <div className="apc-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
              <aside
                className="apc-sidebar apc-sidebar--mobile"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="apc-sidebar__close"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes />
                </button>
                <SidebarContent />
              </aside>
            </div>
          )}

          {/* Grid Layout Wrapper */}
          <div className="apc-grid-wrap">
            {loading ? (
              <div className="apc-grid-wrap__spinner"><LoadingSpinner /></div>
            ) : error ? (
              <div className="apc-grid-wrap__error">
                <p>Something went wrong loading products.</p>
                <button className="apc-retry-btn" onClick={() => dispatch(fetchproducts())}>Retry</button>
              </div>
            ) : displayed.length > 0 ? (
              <div className="apc-grid">
                {displayed.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="apc-grid-wrap__empty">
                <p>No products match your filters.</p>
                {hasFilters && (
                  <button className="apc-reset-btn" onClick={handleClear}>Reset Filters</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default AllProductsPage;