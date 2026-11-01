/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shirt, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle, 
  Flame, 
  Sparkle 
} from 'lucide-react';

// Import components
import JacketVisualPreview from '../../../components/Jacketbuilder/Bandcollarvarsityjacket/JacketVisualPreview.jsx';
import MaterialsColorsPanel from '../../../components/Jacketbuilder/Bandcollarvarsityjacket/MaterialsColorsPanel.jsx';
import DesignPatchesPanel from '../../../components/Jacketbuilder/Bandcollarvarsityjacket/DesignPatchesPanel.jsx';
import CartSummaryPanel from '../../../components/Jacketbuilder/Bandcollarvarsityjacket/CartSummaryPanel.jsx';

// Import data
import { 
  WOOL_COLORS, 
  LEATHER_COLORS, 
  SATIN_COLORS 
} from '../../../components/Jacketbuilder/Bandcollarvarsityjacket/MaterialsColorsPanel.jsx';
import './Bandcollarvarsityjacket.css';

export default function LettermanJackets() {
  const [activeTab, setActiveTab] = useState('materials');
  const [activeView, setActiveView] = useState('Front');
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);

  // Initialize tracking state for completed customization steps
  const [completedSections, setCompletedSections] = useState({
    style: false,
    body: false,
    sleeves: false,
    inserts: false,
    pockets: false,
    fasteners: false,
    knit: false,
    collar: false,
    lining: false,
  });

  // 🔥 FIXED: Complete state with proper collarColor as OBJECT
  const [jacketState, setJacketState] = useState({
    style: 'Classic',
    bodyMaterial: 'Wool',
    bodyColor: WOOL_COLORS.find(c => c.name === 'Old Gold') || WOOL_COLORS[0],
    sleeveMaterial: 'Leather',
    sleeveColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
    pocketMaterial: 'Leather',
    pocketColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
    innerLining: 'Quilted',
    innerLiningColor: SATIN_COLORS.find(c => c.name === 'Red') || SATIN_COLORS[0],
    snapsOrZipper: 'Snap',
    snapColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
    
    hasShoulderInserts: false,
    shoulderMaterial: 'Leather',
    shoulderColor: WOOL_COLORS.find(c => c.name === 'Black') || WOOL_COLORS[0],

    knitStyle: 'Two Stripes',
    knitBaseColor: WOOL_COLORS.find(c => c.name === 'Black') || WOOL_COLORS[0],
    knitLineColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
    knitFeatheringColor: WOOL_COLORS.find(c => c.name === 'Gold') || WOOL_COLORS[3],
    
    // 🔥 FIX: collarColor as OBJECT with name and hex
    collarStyle: 'classic_standup',
    collarColor: { name: 'Black', hex: '#1a1a1a' },
    collarColorName: 'Black',

    leftChest: { 
      type: 'None', 
      text: '', 
      font: 'Varsity', 
      color: '#ffffff', 
      colorName: 'White', 
      patchId: '', 
      patchUrl: '', 
      patchName: '', 
      price: 0 
    },
    rightChest: { 
      type: 'None', 
      text: '', 
      font: 'Varsity', 
      color: '#ffffff', 
      colorName: 'White', 
      patchId: '', 
      patchUrl: '', 
      patchName: '', 
      price: 0 
    },
    leftSleeve: { 
      type: 'None', 
      text: '', 
      font: 'Varsity', 
      color: '#ffffff', 
      colorName: 'White', 
      patchId: '', 
      patchUrl: '', 
      patchName: '', 
      price: 0 
    },
    rightSleeve: { 
      type: 'None', 
      text: '', 
      font: 'Varsity', 
      color: '#ffffff', 
      colorName: 'White', 
      patchId: '', 
      patchUrl: '', 
      patchName: '', 
      price: 0 
    },
    back: {
      type: 'None',
      line1Text: '', 
      line1Font: 'Varsity', 
      line1Color: '#ffffff', 
      line1ColorName: 'White',
      line2Text: '', 
      line2Font: 'Varsity', 
      line2Color: '#ffffff', 
      line2ColorName: 'White',
      line3Text: '', 
      line3Font: 'Script', 
      line3Color: '#ffffff', 
      line3ColorName: 'White',
      patchId: '', 
      patchUrl: '', 
      patchName: '', 
      price: 0
    },
    size: ''
  });

  const handleStateUpdate = (updater) => {
    setJacketState(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  };

  const notifyUser = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    notifyUser('Your configured Varsity Jacket added to cart! Complete order checkout below.');
  };

  return (
    <div className="band-app-container">
      
      {/* Toast Notification Alert Banner */}
      {notification && (
        <div className="band-notification-banner">
          <CheckCircle size={18} className="band-notification-icon" />
          <p className="band-notification-text">{notification}</p>
        </div>
      )}

      {/* Main Luxury Brand Header */}
      <header className="band-app-header">
        <div className="band-header-inner">
          <div className="band-brand-container">
            <div className="band-brand-logo">
              <span className="band-brand-letter">V</span>
            </div>
            <div>
              <h1 className="band-brand-title">VARSITY CO.</h1>
              <p className="band-brand-subtitle">Premium Customizer</p>
            </div>
          </div>

          <div className="band-header-actions">
            {/* Promo Tag */}
            <div className="band-promo-tag">
              <Flame size={12} className="band-promo-icon" />
              <span className="band-promo-text">Promotional Event: $249</span>
            </div>

            {/* Shopping Cart Indicator */}
            <div className="band-cart-indicator" onClick={() => setActiveTab('cart')}>
              <ShoppingBag size={16} className="band-cart-icon" />
              {cartCount > 0 && (
                <span className="band-cart-badge">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Configurator Area */}
      <main className="band-main-content">
        
        {/* DESKTOP: RIGHT COLUMN, MOBILE: TOP PREVIEW */}
        <div className="band-preview-column">
          <JacketVisualPreview 
            state={jacketState} 
            view={activeView} 
            onChangeView={setActiveView} 
          />
          
          {/* Quick Helper Tips */}
          <div className="band-helper-tip">
            <Sparkle size={14} className="band-helper-icon" />
            <p className="band-helper-text">
              Pro Tip: Toggle between <b>Front, Left, Right</b> and <b>Back</b> view tabs at the base of the preview to examine your custom sleeves, initials, and back arched lettering.
            </p>
          </div>
        </div>

        {/* DESKTOP: LEFT COLUMN, MOBILE: BOTTOM SELECTIONS */}
        <div className="band-config-column">
          {/* Tab Navigation Menu */}
          <nav className="band-tab-navigation">
            {['materials', 'design', 'cart'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'design') {
                    setActiveView('Front');
                  } else if (tab === 'materials') {
                    setActiveView('Front');
                  } else if (tab === 'cart') {
                    setActiveView('Back');
                  }
                }}
                className={`band-tab-button ${activeTab === tab ? 'band-tab-button-active' : 'band-tab-button-inactive'}`}
              >
                {tab === 'materials' && (
                  <>
                    <Shirt size={14} className={activeTab === tab ? 'band-tab-icon-active' : 'band-tab-icon-inactive'} />
                    <span>Materials & Colors</span>
                  </>
                )}
                {tab === 'design' && (
                  <>
                    <Sparkles size={14} className={activeTab === tab ? 'band-tab-icon-active' : 'band-tab-icon-inactive'} />
                    <span>Design & Patches</span>
                  </>
                )}
                {tab === 'cart' && (
                  <>
                    <ShoppingBag size={14} className={activeTab === tab ? 'band-tab-icon-active' : 'band-tab-icon-inactive'} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* ACTIVE PANEL CONTENT CARDS */}
          <div className="band-panel-container">
            {activeTab === 'materials' && (
              <div className="band-panel-content">
                <div className="band-panel-header">
                  <div>
                    <h2 className="band-panel-title">Tailoring & Colors</h2>
                    <p className="band-panel-subtitle">Customize your body wools and sleeve leathers</p>
                  </div>
                  <span className="band-step-badge">Step 1 of 3</span>
                </div>
                <MaterialsColorsPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  completedSections={completedSections}
                  setCompletedSections={setCompletedSections}
                  onNext={() => {
                    setActiveTab('design');
                    notifyUser('Nice chassis configured! Now add sports initial embroideries.');
                  }}
                />
              </div>
            )}

            {activeTab === 'design' && (
              <div className="band-panel-content">
                <div className="band-panel-header">
                  <div>
                    <h2 className="band-panel-title">Insignias & Patches</h2>
                    <p className="band-panel-subtitle">Brand with athletic insignias, crest and letters</p>
                  </div>
                  <span className="band-step-badge">Step 2 of 3</span>
                </div>
                <DesignPatchesPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  onNext={() => {
                    setActiveTab('cart');
                    setActiveView('Back');
                    notifyUser('Personalizations saved. Select fits sizing below.');
                  }}
                />
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="band-panel-content">
                <div className="band-panel-header">
                  <div>
                    <h2 className="band-panel-title">Cart Checkout</h2>
                    <p className="band-panel-subtitle">Verify your sizes and checkout configuration</p>
                  </div>
                  <span className="band-step-badge">Step 3 of 3</span>
                </div>
                <CartSummaryPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}