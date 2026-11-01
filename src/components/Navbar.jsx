import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchproducts } from "../slices/products/productslice.jsx";
import './Navbar.css';
import CartDrawer from '../pages/CartDrawer.jsx';
import DesignStudioModal from './HeaderPopup.jsx'; 

const IconCart = (props) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" {...props}>
    <path
      d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5 3H2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.5 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17.5 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" {...props}>
    <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" {...props}>
    <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21l-4.2-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false); // <-- NAYA (mobile ke liye alag)
  const [cartOpen, setCartOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false); // <-- NAYA (popup ke liye)

  const cartItems = useSelector((state) => state.cart.items || []);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, loading } = useSelector((state) => state.products);
  const apiCollections = useMemo(() => items?.data?.collections || [], [items]);

  useEffect(() => {
    if (apiCollections.length === 0 && !loading) {
      dispatch(fetchproducts());
    }
  }, [dispatch, apiCollections.length, loading]);

  useEffect(() => {
    if (apiCollections.length > 0 && !activeCategory) {
      setActiveCategory(apiCollections[0]);
    }
  }, [apiCollections, activeCategory]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMobileMenuOpen(false);
    setMobileExpandedCat(null);
    setMobileCollectionsOpen(false); // <-- route change pe reset
  }, [location.pathname]);

  const closeDropdown = () => {
    setIsOpen(false);
    setMobileMenuOpen(false);
    setMobileExpandedCat(null);
    setMobileCollectionsOpen(false); // <-- reset
  };

  const handleMobileCatToggle = (e, catSlug) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileExpandedCat(prev => (prev === catSlug ? null : catSlug));
  };

  return (
    <>
      {/* FIXED ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <span className="announcement-text">⚡ END OF SEASON SALE: UP TO 40% OFF SITEWIDE — CODE: VARSITY26</span>
          <span className="announcement-text" aria-hidden="true">⚡ END OF SEASON SALE: UP TO 40% OFF SITEWIDE — CODE: VARSITY26</span>
          <span className="announcement-text" aria-hidden="true">⚡ END OF SEASON SALE: UP TO 40% OFF SITEWIDE — CODE: VARSITY26</span>
        </div>
      </div>

      <header className={`nav-wrap ${mobileMenuOpen ? "mob-header-hidden" : ""}`}>
        <nav className="nav">
          <Link to="/" className="brand" onClick={closeDropdown}>
            <img src="/logo.png" alt="Varsity Maker Logo" className="nav-logo" />
          </Link>

          <ul className="nav-links desktop-only">
            <li>
              <Link to="/shop" className={location.pathname === "/shop" ? "active-link" : ""}>
                Shop
              </Link>
            </li>

            <li
              ref={dropdownRef}
              className={`nav-dropdown ${isOpen ? "open" : ""}`}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button className="nav-drop-trigger" type="button">
                Categories
                <svg className="nav-drop-arrow" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="nav-mega-menu">
                {apiCollections.length > 0 ? (
                  <div className="mistral-split-container">
                    <div className="mistral-left-panel category-scroll-engine">
                      <span className="panel-section-title">Core Collections</span>
                      <div className="main-cat-list">
                        {apiCollections.map((cat) => (
                          <div
                            key={cat.id || cat._id}
                            className={`main-cat-item ${activeCategory?.slug === cat.slug ? "is-active" : ""}`}
                            onMouseEnter={() => setActiveCategory(cat)}
                          >
                            <div className="main-cat-container-block">
                              <div className="main-cat-info-wrap">
                                <Link to={`/products/categories/${cat.slug}`} className="main-cat-link-title" onClick={closeDropdown}>
                                  {cat.name}
                                </Link>
                                <p className="main-cat-subtext">Explore custom {cat.name.toLowerCase()}</p>
                              </div>
                              <svg className="main-cat-chevron" viewBox="0 0 24 24" fill="none">
                                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mistral-right-panel category-scroll-engine">
                      <span className="panel-section-title">
                        {activeCategory ? activeCategory.name : "Sub Categories"}
                      </span>
                      {activeCategory && activeCategory.children && activeCategory.children.length > 0 ? (
                        <div className={`sub-cat-grid ${activeCategory.children.length > 8 ? "two-columns" : "one-column"}`}>
                          {activeCategory.children.map((child) => (
                            <Link
                              key={child.id || child._id}
                              to={`/products/categories/${child.slug}`}
                              className="sub-cat-grid-link"
                              onClick={closeDropdown}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-sub-state">No sub-collections available.</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mega-menu-loading">Loading collections...</div>
                )}
              </div>
            </li>

            <li><a href="/wholesale">Wholesale</a></li>
            <li><a href="/our-collaborators">Collaborations</a></li>
            <li><a href="/contact">Contact</a></li>
            <li>
              <Link to="blog/categories" className={location.pathname.includes("blog") ? "active-link" : ""}>
                Blog
              </Link>
            </li>
          </ul>

          {/* ACTION BUTTONS ROW */}
          <div className="nav-actions">
            {/* ===== NAYA DESIGN STUDIO BUTTON ===== */}
            <button className="design-studio-btn" onClick={() => setStudioOpen(true)} aria-label="Open Design Studio">
              <svg className="ds-spark" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.7 5.4L19 9l-4.4 2.3L12 16.5 9.4 11.3 5 9l5.3-1.6L12 2z" />
                <circle cx="18.6" cy="17.4" r="1.4" />
                <circle cx="5.6" cy="16.6" r="1" />
              </svg>
              <span>Design Your Own</span>
            </button>

            <button className="icon-btn" aria-label="Search">
              <IconSearch />
            </button>
            <button className="icon-btn" aria-label="Account" onClick={() => navigate('/login')}>
              <IconUser />
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <IconCart />
              <span className="cart-badge">{cartItems.length}</span>
            </button>

            <button
              className={`mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* MOBILE OVERLAY SHEET */}
        <div className={`mobile-navigation-sheet ${mobileMenuOpen ? "sheet-active" : ""}`}>
          <div className="mobile-sheet-inner">
            <ul className="mobile-links-list">
              <li>
                <Link to="/shop" className={location.pathname === "/shop" ? "m-active" : ""} onClick={closeDropdown}>Shop All</Link>
              </li>

              <li className="mobile-accordion-root">
                <button
                  className={`mobile-accordion-trigger ${mobileCollectionsOpen ? "expanded" : ""}`}  // <-- ab alag state
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileCollectionsOpen(!mobileCollectionsOpen); // <-- alag state toggle
                  }}
                  type="button"
                >
                  Collections
                  <svg className="m-arrow" viewBox="0 0 24 24" fill="none">
                    <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={`mobile-accordion-panel ${mobileCollectionsOpen ? "panel-open" : ""}`}> {/* <-- alag state */}
                  {apiCollections.map((cat) => {
                    const isExpanded = mobileExpandedCat === cat.slug;
                    return (
                      <div key={cat.id || cat._id} className="m-cat-block">
                        <div className="m-cat-header" onClick={(e) => handleMobileCatToggle(e, cat.slug)}>
                          <span className="m-cat-title-text">{cat.name}</span>
                          {cat.children && cat.children.length > 0 && (
                            <span className="m-sub-plus-icon-wrap">
                              <svg className={`m-dropdown-arrow-icon ${isExpanded ? "rotated" : ""}`} viewBox="0 0 24 24" fill="none">
                                <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          )}
                        </div>

                        {isExpanded && cat.children && cat.children.length > 0 && (
                          <div className="m-sub-links-wrapper" onClick={(e) => e.stopPropagation()}>
                            <Link to={`/products/categories/${cat.slug}`} className="m-sub-child-link view-all-accent" onClick={closeDropdown}>
                              View All {cat.name} →
                            </Link>
                            {cat.children.map((child) => (
                              <Link
                                key={child.id || child._id}
                                to={`/products/categories/${child.slug}`}
                                className="m-sub-child-link"
                                onClick={closeDropdown}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>

              <li><a href="/wholesale" onClick={closeDropdown}>Wholesale</a></li>
              <li><a href="/our-collaborators" onClick={closeDropdown}>Collaborations</a></li>
              <li><a href="/contact" onClick={closeDropdown}>Contact</a></li>
              <li><Link to="blog/categories" onClick={closeDropdown}>Blog Articles</Link></li>
            </ul>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <DesignStudioModal open={studioOpen} onClose={() => setStudioOpen(false)} /> {/* <-- NAYA */}
    </>
  );
}