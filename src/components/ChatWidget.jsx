import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleChat, sendChatMessage } from "../slices/chatbot/chatbotslice";
import { storageurl } from "../constants/baseurls.jsx";
import "./chatwidget.css";

/* ================================================================
   CHAT WIDGET (root)
================================================================ */
export default function ChatWidget() {
  const dispatch = useDispatch();
  const { open, messages, loading } = useSelector((s) => s.chatbot);
  const [input, setInput]           = useState("");
  const messagesEndRef              = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const autoOpenedRef               = useRef(false);

  // Auto-open on first visit
  useEffect(() => {
    if (autoOpenedRef.current) return;
    const t = setTimeout(() => {
      autoOpenedRef.current = true;
      if (!open) {
        dispatch(toggleChat());
      }
    }, 3000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  useEffect(() => {
  if (autoOpenedRef.current) return;
  const t = setTimeout(() => {
    autoOpenedRef.current = true;
    if (!open) dispatch(toggleChat()); // sirf open karo
  }, 3000);
  return () => clearTimeout(t);
}, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Unread badge
  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length - 1]?.role === "bot") {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendChatMessage(input.trim(), "session_1"));
    setInput("");
    if (!open) dispatch(toggleChat());
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSend(); };

  const handleToggle = () => {
    dispatch(toggleChat());
    if (!open) setUnreadCount(0);
  };

  const handleChip = (text) => {
    dispatch(sendChatMessage(text, "session_1"));
    if (!open) dispatch(toggleChat());
  };

  return (
    <div className="zw-wrapper">
      {/* TRIGGER BUTTON */}
      <div className="zw-trigger" onClick={handleToggle}>
        {!open && <div className="zw-ping" />}
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-comment-dots"}`} />
        {unreadCount > 0 && !open && (
          <div className="zw-badge">{unreadCount}</div>
        )}
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="zw-window">
          {/* HEADER */}
          <div className="zw-header">
            <div className="zw-header-left">
              <div className="zw-avatar">
                <i className="fa-solid fa-robot" style={{ color: "#fff" }} />
              </div>
              <div>
                <div className="zw-header-name">Zara</div>
                <div className="zw-header-status">
                  <div className="zw-status-dot" />
                  Online · Your Shopping Assistant
                </div>
              </div>
            </div>
            <button className="zw-close-btn" onClick={handleToggle}>
              <i className="fa-solid fa-chevron-down" />
            </button>
          </div>

          {/* BODY */}
          <div className="zw-body">
            {/* EMPTY STATE */}
            {messages.length === 0 && (
              <div className="zw-welcome">
                <div className="zw-welcome-icon">
                  <i className="fa-solid fa-bag-shopping" style={{ color: "#c8a96e" }} />
                </div>
                <h3>Hey, I'm Zara! 👋</h3>
                <p>Ask me anything — I'll help you find exactly what you're looking for.</p>
                <div className="zw-welcome-chips">
                  {[
                    "What's hot right now?",
                    "Show me something cheap",
                    "I want a jacket",
                    "What collections do you have?",
                  ].map((chip) => (
                    <div key={chip} className="zw-chip" onClick={() => handleChip(chip)}>
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            )}

        

            {/* MESSAGES */}
            {messages.map((msg, i) => (
              <MessageRow key={i} msg={msg} dispatch={dispatch} />
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="zw-msg-row bot">
                <div className="zw-typing">
                  <div className="zw-dot" />
                  <div className="zw-dot" />
                  <div className="zw-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER */}
          <div className="zw-footer">
            <div className="zw-input-row">
              <input
                className="zw-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="zw-send-btn"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                <i className="fa-solid fa-paper-plane" />
              </button>
            </div>
            <div className="zw-footer-brand">Powered by Digikon Solutions</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MESSAGE ROW
   — handles all intent types: products, policy links, reviews, etc.
================================================================ */
function MessageRow({ msg, dispatch }) {
  if (msg.role === "user") {
    return (
      <div className="zw-msg-row user">
        <div className="zw-bubble user">{msg.text}</div>
      </div>
    );
  }

  // ── Resolve product list ──────────────────────────────────────
  // product can be: null | single object | array of objects
  const rawProduct    = msg.product;
  const productsToShow = Array.isArray(rawProduct)
    ? rawProduct
    : rawProduct ? [rawProduct] : [];

  const shouldShowCards =
    msg.show_product_card === true && productsToShow.length > 0;

  const catName    = msg.category_name  || null;
  const totalInCat = msg.total_products || productsToShow.length;
  const hasUpsell  = msg.upsell_products?.length > 0;
  const hasCross   = msg.cross_sell_products?.length > 0;
  const policyLinks = msg.policy_links || {};
  const hasPolicies = Object.keys(policyLinks).length > 0;

  // Top-level reviews (from review_query intent)
  // Also, each product object now carries its own .reviews array
  const topLevelReviews = Array.isArray(msg.reviews) ? msg.reviews : [];

  return (
    <div className="zw-msg-row bot">
      {/* BUBBLE */}
      <div className="zw-bubble bot">{msg.text}</div>

      {/* POLICY LINKS (refund / privacy / customize) */}
      {hasPolicies && (
        <div className="zw-policy-links">
          {policyLinks.refund && (
            <a href={policyLinks.refund} target="_blank" rel="noopener noreferrer" className="zw-policy-link">
              <i className="fa-solid fa-rotate-left" /> Refund Policy
            </a>
          )}
          {policyLinks.privacy && (
            <a href={policyLinks.privacy} target="_blank" rel="noopener noreferrer" className="zw-policy-link">
              <i className="fa-solid fa-shield-halved" /> Privacy Policy
            </a>
          )}
          {policyLinks.customize && (
            <a href={policyLinks.customize} target="_blank" rel="noopener noreferrer" className="zw-policy-link">
              <i className="fa-solid fa-palette" /> Customize Now
            </a>
          )}
        </div>
      )}

      {/* CATEGORY HEADER */}
      {shouldShowCards && catName && (
        <div className="zw-cat-header">
          <i className="fa-solid fa-layer-group" />
          <span className="zw-cat-header-name">{catName}</span>
          <span className="zw-cat-header-count">
            {productsToShow.length} of {totalInCat} items
          </span>
        </div>
      )}

      {/* MAIN PRODUCT SLIDER */}
      {shouldShowCards && (
        <ProductSlider
          products={productsToShow}
          topLevelReviews={topLevelReviews}
        />
      )}

      {/* UPSELL */}
      {hasUpsell && (
        <div className="zw-upsell-section">
          <div className="zw-section-label">
            <i className="fa-solid fa-arrow-trend-up" /> Upgrade Options
          </div>
          <ProductSlider products={msg.upsell_products} compact />
        </div>
      )}

      {/* CROSS-SELL */}
      {hasCross && (
        <div className="zw-crosssell-section">
          <div className="zw-section-label">
            <i className="fa-solid fa-layer-group" /> Complete the Look
          </div>
          <ProductSlider products={msg.cross_sell_products} compact />
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PRODUCT SLIDER
================================================================ */
function ProductSlider({ products, compact = false, topLevelReviews = [] }) {
  const sliderRef           = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const t  = setTimeout(checkScroll, 80);
    const el = sliderRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => { clearTimeout(t); el?.removeEventListener("scroll", checkScroll); };
  }, [products]);

  const scroll = (dir) => {
    const cardW = compact ? 182 : 222;
    sliderRef.current?.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  if (!products?.length) return null;

  return (
    <div className="zw-slider-wrapper">
      {canLeft && (
        <button className="zw-slider-arrow left" onClick={() => scroll(-1)}>
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}

      <div className={`zw-slider-track ${compact ? "compact" : ""}`} ref={sliderRef}>
        {products.map((product, idx) => {
          // Reviews priority:
          // 1. product.reviews (embedded by backend in _slim/_slims)
          // 2. topLevelReviews (from review_query — single product)
          const productReviews =
            Array.isArray(product?.reviews) && product.reviews.length > 0
              ? product.reviews
              : topLevelReviews;

          return (
            <SliderCard
              key={product?.id ?? idx}
              product={product}
              compact={compact}
              reviews={productReviews}
            />
          );
        })}
      </div>

      {canRight && (
        <button className="zw-slider-arrow right" onClick={() => scroll(1)}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      {products.length > 1 && (
        <div className="zw-slider-dots">
          {products.map((_, i) => (
            <div
              key={i}
              className="zw-slider-dot"
              onClick={() => {
                const cardW = compact ? 182 : 222;
                sliderRef.current?.scrollTo({ left: i * cardW, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SLIDER CARD
================================================================ */
function SliderCard({ product, compact, reviews = [] }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTryOn,    setShowTryOn]    = useState(false);

  if (!product) return null;

  const sizes = product.sizes
    ? product.sizes.replace(/"/g, "").split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Price logic — backend: price = original, discount_price = discounted (lower)
  const origPrice      = parseFloat(product.price || 0);
  const discountedPrice= parseFloat(product.discount_price || 0);
  const hasSavings     = product.discount_price && discountedPrice < origPrice;
  const displayPrice   = hasSavings ? discountedPrice : origPrice;
  const savedAmount    = hasSavings ? Math.round(discountedPrice) : 0;

  // Emotional offer override
  const isEmotional    = product.emotional_offer === true;
  const emotionalPrice = product.emotional_discounted_price;

  const isLow = product.stock > 0 && product.stock <= 5;
  const isOut = product.stock <= 0;

  const handleViewProduct = () => {
    if (product.product_url) window.open(product.product_url, "_blank", "noopener,noreferrer");
  };

  const handleCustomize = () => {
    window.location.href = product.customize_url || `/customize?product=${product.id}`;
  };

  // Star rating component
  const StarRating = ({ rating, size = 9 }) => (
    <div className="zw-review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-${star <= Math.round(rating) ? "solid" : "regular"} fa-star`}
          style={{ color: star <= Math.round(rating) ? "#f59e0b" : "#ddd", fontSize: size }}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className={`zw-slider-card ${compact ? "compact" : ""} ${isEmotional ? "emotional" : ""}`}>

        {/* EMOTIONAL OFFER BANNER */}
        {isEmotional && (
          <div className="zw-emotional-banner">
            <i className="fa-solid fa-tag" /> Exclusive Deal — Just for You!
          </div>
        )}

        {/* LOW STOCK BADGE */}
        {isLow && !isOut && !isEmotional && (
          <div className="zw-stock-badge">
            <i className="fa-solid fa-fire" /> Only {product.stock} left!
          </div>
        )}

        {/* PRODUCT IMAGE */}
        {product.main_image ? (
          <div
            className="zw-slider-img-wrap"
            onClick={handleViewProduct}
            style={{ cursor: product.product_url ? "pointer" : "default" }}
            title="View product"
          >
            <img
              src={`${storageurl}/${product.main_image}`}
              alt={product.name}
              className="zw-slider-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        ) : (
          <div className="zw-slider-img-placeholder">
            <i className="fa-solid fa-shirt" />
          </div>
        )}

        {/* CARD BODY */}
        <div className="zw-slider-body">

          {/* NAME */}
          {product.product_url ? (
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="zw-slider-name-link"
            >
              <h4 className="zw-slider-name">{product.name}</h4>
            </a>
          ) : (
            <h4 className="zw-slider-name">{product.name}</h4>
          )}

          {/* AGGREGATE RATING (from avg_rating + total_reviews) */}
          {product.avg_rating && (
            <div className="zw-aggregate-rating">
              <StarRating rating={product.avg_rating} size={10} />
              <span className="zw-rating-text">
                {product.avg_rating}/5
                {product.total_reviews > 0 && (
                  <span className="zw-rating-count"> ({product.total_reviews} reviews)</span>
                )}
              </span>
            </div>
          )}

          {/* PRICE */}
          <div className="zw-slider-price-row">
            {isEmotional && emotionalPrice ? (
              <>
                <span className="zw-slider-price-new">Rs. {origPrice}</span>
                {/* <span className="zw-slider-price-old">Rs. {emotionalPrice}</span> */}
                <span className="zw-slider-save">
                  {product.emotional_discount_pct}% OFF — Exclusive!
                </span>
              </>
            ) : hasSavings ? (
              <>
                <span className="zw-slider-price-new">Rs. {origPrice}</span>
                <span className="zw-slider-save">Save Rs. {savedAmount}</span>
              </>
            ) : (
              <span className="zw-slider-price-only">Rs. {origPrice}</span>
            )}
          </div>

          {/* SIZES (skip in compact) */}
          {!compact && sizes.length > 0 && (
            <div className="zw-slider-sizes">
              {sizes.slice(0, 3).map((s, i) => (
                <span key={i} className="zw-size-pill">{s}</span>
              ))}
              {sizes.length > 3 && (
                <span className="zw-size-more">+{sizes.length - 3}</span>
              )}
            </div>
          )}

          {/* STOCK STATUS */}
        <div className={`zw-slider-stock ${isOut ? "out" : isLow ? "low" : ""}`}>
  {isOut ? (
    <>
      <i className="fa-solid fa-ban" /> Out of stock
    </>
  ) : (
    <>
      <i className="fa-solid fa-circle-check" /> 
      {isLow ? `Only ${product.stock} left!` : `In stock (${product.stock})`}
    </>
  )}
</div>

          {/* ACTION BUTTONS */}
          <div className="zw-slider-actions">
            <button
              className={`zw-btn-buy ${isEmotional ? "emotional-buy" : ""}`}
              disabled={isOut}
              onClick={() => setShowCheckout(true)}
            >
              <i className="fa-solid fa-bag-shopping" />
              {isOut ? "Sold Out" : isEmotional ? "Grab This Deal!" : "Buy Now"}
            </button>
            <button className="zw-btn-customize" onClick={handleCustomize}>
              <i className="fa-solid fa-palette" /> Customize
            </button>
            <button className="zw-btn-tryon" onClick={() => setShowTryOn(true)}>
              <i className="fa-solid fa-camera" /> Try On
            </button>
          </div>

          {/* VIEW FULL PAGE */}
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="zw-view-product-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              View Full Product Page
            </a>
          )}

          {/* ── REVIEWS SECTION ── */}
          {reviews.length > 0 ? (
            <div className="zw-reviews-section">
              <div className="zw-reviews-header">
                <i className="fa-solid fa-star" style={{ color: "#f59e0b" }} />
                <span className="zw-reviews-title">Customer Reviews</span>
                {product.avg_rating && (
                  <span className="zw-reviews-avg">{product.avg_rating}/5</span>
                )}
              </div>
              <div className="zw-reviews-list">
                {reviews.slice(0, 2).map((r, i) => (
                  <div key={i} className="zw-review-item">
                    <div className="zw-review-top">
                      <span className="zw-review-name">
                        {r.reviewer_name || "Customer"}
                      </span>
                      <StarRating rating={r.rating || 0} size={9} />
                    </div>
                    <p className="zw-review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !compact && (
              <div className="zw-no-reviews">
                <i className="fa-regular fa-star" /> No reviews yet
              </div>
            )
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutPopup product={product} onClose={() => setShowCheckout(false)} />
      )}
      {showTryOn && (
        <TryOnPopup product={product} onClose={() => setShowTryOn(false)} />
      )}
    </>
  );
}

/* ================================================================
   CHECKOUT POPUP
================================================================ */
const SHIPPING_OPTIONS = [
  {
    id: "express",   label: "Express Delivery",  days: "1–2 days", price: 250,
    icon: "fa-bolt", badge: "Fastest", badgeColor: "#7c3aed",
    description: "Priority handling & fast courier",
  },
  {
    id: "standard",  label: "Standard Delivery", days: "3–5 days", price: 120,
    icon: "fa-truck", badge: "Popular", badgeColor: "#2563eb",
    description: "Reliable door-to-door delivery",
  },
  {
    id: "economy",   label: "Economy Delivery",  days: "7–10 days", price: 60,
    icon: "fa-box",  badge: "Budget", badgeColor: "#27ae60",
    description: "Most affordable shipping option",
  },
];

function CheckoutPopup({ product, onClose }) {
  const [step, setStep]                   = useState(1);
  const [selectedShipping, setSelected]   = useState("standard");
  const [form, setForm]                   = useState({
    fullName: "", email: "", address: "", city: "",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Order placed! 🎉 We'll be in touch soon.");
    onClose();
  };

  const shipping    = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping);
  const basePrice   = parseFloat(product.emotional_discounted_price || product.discount_price || product.price || 0);
  const totalPrice  = basePrice + (shipping?.price ?? 0);

  return (
    <div className="zw-popup-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="zw-popup">
        <button className="zw-popup-close" onClick={onClose}>×</button>
        <h2 className="zw-popup-title">
          <i className="fa-solid fa-bag-shopping" /> Checkout
        </h2>

        <div className="zw-popup-product-mini">
          <span className="zw-popup-product-name">{product.name}</span>
          <span className="zw-popup-product-price">Rs. {basePrice}</span>
        </div>

        {/* STEP INDICATOR */}
        <div className="zw-checkout-steps">
          <div className={`zw-checkout-step ${step >= 1 ? "active" : ""}`}>
            <div className="zw-step-num">1</div><span>Shipping</span>
          </div>
          <div className="zw-step-line" />
          <div className={`zw-checkout-step ${step >= 2 ? "active" : ""}`}>
            <div className="zw-step-num">2</div><span>Payment</span>
          </div>
        </div>

        {step === 1 && (
          <div>
            <div className="zw-popup-section-label">Shipping Info</div>
            <input type="text"  name="fullName" placeholder="Full Name"   value={form.fullName}  onChange={handleChange} className="zw-popup-input" />
            <input type="email" name="email"     placeholder="Email"       value={form.email}     onChange={handleChange} className="zw-popup-input" />
            <input type="text"  name="address"   placeholder="Address"     value={form.address}   onChange={handleChange} className="zw-popup-input" />
            <input type="text"  name="city"      placeholder="City"        value={form.city}      onChange={handleChange} className="zw-popup-input" />

            <div className="zw-popup-section-label" style={{ marginTop: 14 }}>
              <i className="fa-solid fa-truck" style={{ marginRight: 5 }} /> Delivery Speed
            </div>
            <div className="zw-shipping-options">
              {SHIPPING_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`zw-shipping-option ${selectedShipping === opt.id ? "selected" : ""}`}
                  onClick={() => setSelected(opt.id)}
                >
                  <div className="zw-shipping-radio">
                    <div className={`zw-radio-dot ${selectedShipping === opt.id ? "active" : ""}`} />
                  </div>
                  <div className="zw-shipping-icon">
                    <i className={`fa-solid ${opt.icon}`} />
                  </div>
                  <div className="zw-shipping-info">
                    <div className="zw-shipping-top">
                      <span className="zw-shipping-label">{opt.label}</span>
                      {opt.badge && (
                        <span className="zw-shipping-badge" style={{ background: opt.badgeColor }}>
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div className="zw-shipping-meta">
                      <span className="zw-shipping-days">
                        <i className="fa-regular fa-clock" /> {opt.days}
                      </span>
                      <span className="zw-shipping-desc">{opt.description}</span>
                    </div>
                  </div>
                  <div className="zw-shipping-price">
                    {opt.price === 0
                      ? <span className="zw-ship-free">FREE</span>
                      : <span>+Rs.{opt.price}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="zw-order-summary">
              <div className="zw-summary-row"><span>Product</span><span>Rs. {basePrice}</span></div>
              <div className="zw-summary-row">
                <span>Shipping ({shipping?.label})</span>
                <span>{shipping?.price === 0 ? "FREE" : `Rs. ${shipping?.price}`}</span>
              </div>
              <div className="zw-summary-row total"><span>Total</span><span>Rs. {totalPrice}</span></div>
            </div>

            <button
              className="zw-pay-btn"
              onClick={() => {
                if (!form.fullName || !form.email || !form.address || !form.city) {
                  alert("Please fill in all shipping details.");
                  return;
                }
                setStep(2);
              }}
            >
              Continue to Payment <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="zw-delivery-reminder">
              <i className="fa-solid fa-truck" />
              <span>
                <strong>{shipping?.label}</strong> — {shipping?.days}
                {shipping?.price === 0 ? " · FREE" : ` · +Rs. ${shipping?.price}`}
              </span>
              <button type="button" className="zw-change-shipping" onClick={() => setStep(1)}>
                Change
              </button>
            </div>

            <div className="zw-popup-section-label">Payment Details</div>
            <input type="text"     name="cardName"   placeholder="Card Holder Name" value={form.cardName}   onChange={handleChange} className="zw-popup-input" />
            <input type="text"     name="cardNumber" placeholder="Card Number"      value={form.cardNumber} onChange={handleChange} maxLength="16" className="zw-popup-input" />
            <div className="zw-card-row">
              <input type="text"     name="expiry" placeholder="MM/YY" value={form.expiry} onChange={handleChange} className="zw-popup-input" />
              <input type="password" name="cvv"    placeholder="CVV"   value={form.cvv}    onChange={handleChange} maxLength="3"  className="zw-popup-input" />
            </div>

            <div className="zw-order-summary">
              <div className="zw-summary-row"><span>Product</span><span>Rs. {basePrice}</span></div>
              <div className="zw-summary-row">
                <span>Shipping</span>
                <span>{shipping?.price === 0 ? "FREE" : `Rs. ${shipping?.price}`}</span>
              </div>
              <div className="zw-summary-row total"><span>Total</span><span>Rs. {totalPrice}</span></div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" className="zw-back-btn" onClick={() => setStep(1)}>
                <i className="fa-solid fa-arrow-left" /> Back
              </button>
              <button type="submit" className="zw-pay-btn" style={{ flex: 1, marginTop: 0 }}>
                <i className="fa-solid fa-lock" /> Pay Rs. {totalPrice}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   VIRTUAL TRY-ON POPUP
================================================================ */
function TryOnPopup({ product, onClose }) {
  const [uploadedImg, setUploadedImg] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="zw-popup-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="zw-popup zw-tryon-popup">
        <button className="zw-popup-close" onClick={onClose}>×</button>
        <h2 className="zw-popup-title">
          <i className="fa-solid fa-camera" /> Virtual Try-On
        </h2>
        <p className="zw-tryon-subtitle">
          See how <strong>{product.name}</strong> looks on you
        </p>

        <div className="zw-tryon-preview">
          {uploadedImg ? (
            <div className="zw-tryon-result">
              <img src={uploadedImg} alt="Your photo" className="zw-tryon-user-img" />
              <div className="zw-tryon-overlay-badge">
                <i className="fa-solid fa-wand-magic-sparkles" /> AI Try-On Processing...
              </div>
            </div>
          ) : (
            <div className="zw-tryon-upload-area" onClick={() => fileRef.current?.click()}>
              <i className="fa-solid fa-cloud-arrow-up" />
              <p>Upload your photo</p>
              <span>Click to browse or drag & drop</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>

        {uploadedImg && (
          <button className="zw-tryon-reset" onClick={() => setUploadedImg(null)}>
            <i className="fa-solid fa-rotate-left" /> Try Different Photo
          </button>
        )}

        <div className="zw-tryon-note">
          <i className="fa-solid fa-circle-info" />
          AI visualizes the outfit on your uploaded photo
        </div>
      </div>
    </div>
  );
}