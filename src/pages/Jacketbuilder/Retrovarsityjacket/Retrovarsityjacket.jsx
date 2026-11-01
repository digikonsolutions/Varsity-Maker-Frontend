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
import JacketVisualPreview from '../../../components/Jacketbuilder/Retrovarsityjacket/JacketVisualPreview.jsx';
import MaterialsColorsPanel from '../../../components/Jacketbuilder/Retrovarsityjacket/MaterialsColorsPanel.jsx';
import DesignPatchesPanel from '../../../components/Jacketbuilder/Retrovarsityjacket/DesignPatchesPanel.jsx';
import CartSummaryPanel from '../../../components/Jacketbuilder/Retrovarsityjacket/CartSummaryPanel.jsx';

// Import data
import { 
  WOOL_COLORS, 
  LEATHER_COLORS, 
  SATIN_COLORS 
} from '../../../components/Jacketbuilder/Retrovarsityjacket/MaterialsColorsPanel.jsx';
import './Retrovarsityjacket.css';

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
    <div className="vjc-shell">
      
      {/* Toast Notification Alert Banner */}
      {notification && (
        <div className="vjc-toast">
          <CheckCircle size={18} className="vjc-toast-icon" />
          <p className="vjc-toast-label">{notification}</p>
        </div>
      )}

      {/* Main Luxury Brand Header */}
      <header className="vjc-topbar">
        <div className="vjc-topbar-inner">
          <div className="vjc-brand">
            <div className="vjc-brand-mark">
              <span className="vjc-brand-initial">V</span>
            </div>
            <div>
              <h1 className="vjc-brand-name">VARSITY CO.</h1>
              <p className="vjc-brand-tagline">Premium Customizer</p>
            </div>
          </div>

          <div className="vjc-topbar-actions">
            {/* Promo Tag */}
            <div className="vjc-promo">
              <Flame size={12} className="vjc-promo-icon" />
              <span className="vjc-promo-label">Promotional Event: $249</span>
            </div>

            {/* Shopping Cart Indicator */}
            <div className="vjc-cart-btn" onClick={() => setActiveTab('cart')}>
              <ShoppingBag size={16} className="vjc-cart-glyph" />
              {cartCount > 0 && (
                <span className="vjc-cart-count">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Configurator Area */}
      <main className="vjc-stage">
        
        {/* DESKTOP: RIGHT COLUMN, MOBILE: TOP PREVIEW */}
        <div className="vjc-preview-pane">
          <JacketVisualPreview 
            state={jacketState} 
            view={activeView} 
            onChangeView={setActiveView} 
          />
          
          {/* Quick Helper Tips */}
          <div className="vjc-tip">
            <Sparkle size={14} className="vjc-tip-icon" />
            <p className="vjc-tip-text">
              Pro Tip: Toggle between <b>Front, Left, Right</b> and <b>Back</b> view tabs at the base of the preview to examine your custom sleeves, initials, and back arched lettering.
            </p>
          </div>
        </div>

        {/* DESKTOP: LEFT COLUMN, MOBILE: BOTTOM SELECTIONS */}
        <div className="vjc-config-pane">
          {/* Tab Navigation Menu */}
          <nav className="vjc-tabs">
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
                className={`vjc-tab ${activeTab === tab ? 'vjc-tab-on' : 'vjc-tab-off'}`}
              >
                {tab === 'materials' && (
                  <>
                    <Shirt size={14} className={activeTab === tab ? 'vjc-tab-glyph-on' : 'vjc-tab-glyph-off'} />
                    <span>Materials & Colors</span>
                  </>
                )}
                {tab === 'design' && (
                  <>
                    <Sparkles size={14} className={activeTab === tab ? 'vjc-tab-glyph-on' : 'vjc-tab-glyph-off'} />
                    <span>Design & Patches</span>
                  </>
                )}
                {tab === 'cart' && (
                  <>
                    <ShoppingBag size={14} className={activeTab === tab ? 'vjc-tab-glyph-on' : 'vjc-tab-glyph-off'} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* ACTIVE PANEL CONTENT CARDS */}
          <div className="vjc-panel">
            {activeTab === 'materials' && (
              <div className="vjc-panel-body">
                <div className="vjc-panel-head">
                  <div>
                    <h2 className="vjc-panel-title">Tailoring & Colors</h2>
                    <p className="vjc-panel-sub">Customize your body wools and sleeve leathers</p>
                  </div>
                  <span className="vjc-step-chip">Step 1 of 3</span>
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
              <div className="vjc-panel-body">
                <div className="vjc-panel-head">
                  <div>
                    <h2 className="vjc-panel-title">Insignias & Patches</h2>
                    <p className="vjc-panel-sub">Brand with athletic insignias, crest and letters</p>
                  </div>
                  <span className="vjc-step-chip">Step 2 of 3</span>
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
              <div className="vjc-panel-body">
                <div className="vjc-panel-head">
                  <div>
                    <h2 className="vjc-panel-title">Cart Checkout</h2>
                    <p className="vjc-panel-sub">Verify your sizes and checkout configuration</p>
                  </div>
                  <span className="vjc-step-chip">Step 3 of 3</span>
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