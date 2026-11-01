import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cart/cartSlice.jsx';
import './giftcard.css';
import Stats from '../components/Stats.jsx';
import CartDrawer from '../pages/CartDrawer.jsx';

const GiftCard = () => {
  const dispatch = useDispatch();
  const [selectedAmount, setSelectedAmount] = useState('$10.00');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [cartOpen, setCartOpen] = useState(false);

  const amounts = ['$10.00', '$25.00', '$50.00', '$100.00'];

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'increase') {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    const numericalPrice = parseFloat(selectedAmount.replace('$', ''));

    const dynamicDigits = selectedAmount.replace(/[^0-9]/g, '');

    const productPayload = {
      id: parseInt(`999${dynamicDigits}`, 10), 
      name: `Varsity Maker Gift Card`,
      price: numericalPrice,
      quantity: quantity,
      main_image: 'giftcard/giftcard.png',
      sizes: ['N/A'], 
      selectedSize: 'N/A' 
    };

    dispatch(addToCart({ ...productPayload, quantity }));
    setCartOpen(true);
  };

  return (
    <>
    <div className="page-container">
      
      {/* Main Product Section */}
      <main className="gift-main-content">
        <div className="product-grid">
          {/* Left: Product Image (Fixed for Responsiveness) */}
          <div className="image-column">
            <img src="./giftcard.png" alt="Varsity Maker Gift Card" className="responsive-prod-img" />
          </div>

          {/* Right: Product Details & Purchase */}
          <div className="details-column">
            <span className="brand-subtitle">VARSITY MAKER</span>
            <h1 className="product-title-gift">Varsity Maker Gift Card</h1>
            <p className="product-price">{selectedAmount} USD</p>
            <p className="shipping-note">Shipping calculated at checkout.</p>

            {/* Denominations */}
            <div className="selector-section">
              <label className="section-label">Denominations</label>
              <div className="amount-chips">
                {amounts.map((amount) => (
                  <button
                    key={amount}
                    className={`chip ${selectedAmount === amount ? 'active' : ''}`}
                    onClick={() => setSelectedAmount(amount)}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="selector-section">
              <label className="section-label">Quantity</label>
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange('decrease')}>−</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange('increase')}>+</button>
              </div>
            </div>

            {/* Actions */}
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Information Tabs */}
<section className="info-tabs-section">
  <div className="tabs-header-wrapper">
    <div className="tabs-header">
      {['details', 'delivery', 'redemption'].map((tab) => (
        <button
          key={tab}
          className={`tab-link ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'faq' ? 'FAQ' : tab.toUpperCase()}
        </button>
      ))}
    </div>
  </div>
  
  <div className="tab-content-wrapper">
    <div className="tab-content">
      {activeTab === 'details' && (
        <div className="details-tab-grid">
          <div className="tab-main-info">
            <h3>THE PERFECT GIFT OF CHOICE</h3>
            <p>Shopping for someone else but want them to have the ultimate design freedom? Give them the gift of total personalization with the Varsity Maker E-Gift Card. Whether they are looking to build a premium custom varsity jacket or craft a tailored setup, this card unlocks endless creative possibilities.</p>
            
            <h4 className="sub-section-title">Key Highlights</h4>
            <ul className="highlights-list">
              <li>
                <strong>Instant Digital Delivery:</strong> Sent directly to your email or the recipient's inbox within minutes of checkout.
              </li>
              <li>
                <strong>Zero Hidden Fees:</strong> No processing charges, maintenance fees, or activation deductions ever.
              </li>
              <li>
                <strong>100% Flexible Value:</strong> Can be applied towards any custom patches, premium leathers, wool options, or fully completed jacket builds.
              </li>
              <li>
                <strong>Partial Redemptions:</strong> Use as much or as little as you like. The remaining balance stays safely locked to the card code for future orders.
              </li>
            </ul>
          </div>
          <div className="side-specs-panel">
            <div className="spec-card">
              <h4>Card Type</h4>
              <p>Digital Premium E-Gift Card</p>
            </div>
            <div className="spec-card">
              <h4>Expiration</h4>
              <p>Never Expires (Lifetime Validity)</p>
            </div>
            <div className="spec-card">
              <h4>Currency Availability</h4>
              <p>USD / Secure Digital Validation</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="delivery-tab-content">
          <h3>SEAMLESS DIGITAL DISPATCH</h3>
          <p>We believe in instant gratification, especially when it comes to gifting. Here is exactly how our delivery process works:</p>
          <div className="process-steps-grid">
            <div className="step-box">
              <span className="step-num">01</span>
              <h5>Instant Email Email Fulfillment</h5>
              <p>Right after payment verification, a high-resolution digital gift card will land in your inbox.</p>
            </div>
            <div className="step-box">
              <span className="step-num">02</span>
              <h5>Forward or Print</h5>
              <p>You can seamlessly forward the digital email to your friend, or print out the premium certificate manually.</p>
            </div>
            <div className="step-box">
              <span className="step-num">03</span>
              <h5>Secure Control</h5>
              <p>Each card contains a unique, encrypted alphabetic security code to prevent misuse.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'redemption' && (
        <div className="redemption-tab-content">
          <h3>HOW TO REDEEM YOUR VALUE</h3>
          <p>Redeeming your Varsity Maker Gift Card value is incredibly straightforward during checkout:</p>
          <ol className="redemption-steps">
            <li>Configure your premium custom product or design configurations using our live interactive jacket builder.</li>
            <li>Proceed to the <strong>Checkout Page</strong> when your custom layout is fully completed.</li>
            <li>Enter your unique Gift Card Code into the <em>"Discount Code or Gift Card"</em> field on the right-hand summary sidebar.</li>
            <li>Click <strong>Apply</strong>. The total value of your card will be instantly deducted from your grand total.</li>
          </ol>
          <div className="alert-notice-box">
            <p><strong>Note:</strong> If your order total exceeds the gift card balance, you can easily pay the remaining amount via credit card or standard checkout payment methods.</p>
          </div>
        </div>
      )}

      
    </div>
  </div>
</section>
      
        
      </main>
    </div>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default GiftCard;