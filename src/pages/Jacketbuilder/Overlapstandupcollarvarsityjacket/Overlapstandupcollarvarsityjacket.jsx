/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NOTE: All CSS classes are namespaced with the `rvj-` prefix
 * (Raglan Varsity Jacket) so they never collide with other pages/panels.
 */

import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  Flame,
  Sparkle,
} from 'lucide-react';

// Import components
import JacketVisualPreview from '../../../components/Jacketbuilder/Overlapstandupcollarvarsityjacket/JacketVisualPreview.jsx';
import MaterialsColorsPanel from '../../../components/Jacketbuilder/Overlapstandupcollarvarsityjacket/MaterialsColorsPanel.jsx';
import DesignPatchesPanel from '../../../components/Jacketbuilder/Overlapstandupcollarvarsityjacket/DesignPatchesPanel.jsx';
import CartSummaryPanel from '../../../components/Jacketbuilder/Overlapstandupcollarvarsityjacket/CartSummaryPanel.jsx';

// Import data
import {
  WOOL_COLORS,
  LEATHER_COLORS,
  SATIN_COLORS,
} from '../../../components/Jacketbuilder/Overlapstandupcollarvarsityjacket/MaterialsColorsPanel.jsx';
import './Overlapstandupcollarvarsityjacket.css';

export default function LettermanJackets() {
  const [activeTab, setActiveTab] = useState('materials');
  const [activeView, setActiveView] = useState('Front');
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);

  // Tracking state for completed customization steps
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

    // collarColor as OBJECT with name and hex
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
      price: 0,
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
      price: 0,
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
      price: 0,
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
      price: 0,
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
      price: 0,
    },
    size: '',
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
    <div className="rvj-shell">

      {/* Toast Notification */}
      {notification && (
        <div className="rvj-toast">
          <CheckCircle size={18} className="rvj-toast-icon" />
          <p className="rvj-toast-label">{notification}</p>
        </div>
      )}

      {/* Header */}
      <header className="rvj-topbar">
        <div className="rvj-topbar-inner">
          <div className="rvj-brand">
            <div className="rvj-brand-mark">
              <span className="rvj-brand-initial">V</span>
            </div>
            <div>
              <h1 className="rvj-brand-name">VARSITY CO.</h1>
              <p className="rvj-brand-tagline">Premium Customizer</p>
            </div>
          </div>

          <div className="rvj-topbar-actions">
            {/* Promo Tag */}
            <div className="rvj-promo">
              <Flame size={12} className="rvj-promo-icon" />
              <span className="rvj-promo-label">Promotional Event: $249</span>
            </div>

            {/* Cart Indicator */}
            <div className="rvj-cart-btn" onClick={() => setActiveTab('cart')}>
              <ShoppingBag size={16} className="rvj-cart-glyph" />
              {cartCount > 0 && (
                <span className="rvj-cart-count">{cartCount}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Configurator Area */}
      <main className="rvj-stage">

        {/* PREVIEW PANE */}
        <div className="rvj-preview-pane">
          <JacketVisualPreview
            state={jacketState}
            view={activeView}
            onChangeView={setActiveView}
          />

          {/* Quick Helper Tip */}
          <div className="rvj-tip">
            <Sparkle size={14} className="rvj-tip-icon" />
            <p className="rvj-tip-text">
              Pro Tip: Toggle between <b>Front, Left, Right</b> and <b>Back</b> view tabs at the base of the preview to examine your custom sleeves, initials, and back arched lettering.
            </p>
          </div>
        </div>

        {/* CONFIG PANE */}
        <div className="rvj-config-pane">
          {/* Tab Navigation */}
          <nav className="rvj-tabs">
            {['materials', 'design', 'cart'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'cart') {
                    setActiveView('Back');
                  } else {
                    setActiveView('Front');
                  }
                }}
                className={`rvj-tab ${activeTab === tab ? 'rvj-tab-on' : 'rvj-tab-off'}`}
              >
                {tab === 'materials' && (
                  <>
                    <Shirt size={14} className={activeTab === tab ? 'rvj-tab-glyph-on' : 'rvj-tab-glyph-off'} />
                    <span>Materials &amp; Colors</span>
                  </>
                )}
                {tab === 'design' && (
                  <>
                    <Sparkles size={14} className={activeTab === tab ? 'rvj-tab-glyph-on' : 'rvj-tab-glyph-off'} />
                    <span>Design &amp; Patches</span>
                  </>
                )}
                {tab === 'cart' && (
                  <>
                    <ShoppingBag size={14} className={activeTab === tab ? 'rvj-tab-glyph-on' : 'rvj-tab-glyph-off'} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* ACTIVE PANEL */}
          <div className="rvj-panel">
            {activeTab === 'materials' && (
              <div className="rvj-panel-body">
                <div className="rvj-panel-head">
                  <div>
                    <h2 className="rvj-panel-title">Tailoring &amp; Colors</h2>
                    <p className="rvj-panel-sub">Customize your body wools and sleeve leathers</p>
                  </div>
                  <span className="rvj-step-chip">Step 1 of 3</span>
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
              <div className="rvj-panel-body">
                <div className="rvj-panel-head">
                  <div>
                    <h2 className="rvj-panel-title">Insignias &amp; Patches</h2>
                    <p className="rvj-panel-sub">Brand with athletic insignias, crest and letters</p>
                  </div>
                  <span className="rvj-step-chip">Step 2 of 3</span>
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
              <div className="rvj-panel-body">
                <div className="rvj-panel-head">
                  <div>
                    <h2 className="rvj-panel-title">Cart Checkout</h2>
                    <p className="rvj-panel-sub">Verify your sizes and checkout configuration</p>
                  </div>
                  <span className="rvj-step-chip">Step 3 of 3</span>
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