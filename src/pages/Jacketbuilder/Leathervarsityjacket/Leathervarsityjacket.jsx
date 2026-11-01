/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shirt,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  Flame,
  Sparkle,
  RotateCcw
} from 'lucide-react';

// Import components
import JacketVisualPreview from '../../../components/Jacketbuilder/Leathervarsityjacket/JacketVisualPreview.jsx';
import MaterialsColorsPanel from '../../../components/Jacketbuilder/Leathervarsityjacket/MaterialsColorsPanel.jsx';
import DesignPatchesPanel from '../../../components/Jacketbuilder/Leathervarsityjacket/DesignPatchesPanel.jsx';
import CartSummaryPanel from '../../../components/Jacketbuilder/Leathervarsityjacket/CartSummaryPanel.jsx';

// Import data
import {
  WOOL_COLORS,
  LEATHER_COLORS,
  SATIN_COLORS
} from '../../../components/Jacketbuilder/Leathervarsityjacket/MaterialsColorsPanel.jsx';
import './Leathervarsityjacket.css';

const TABS = [
  { id: 'materials', label: 'Materials & Colors', Icon: Shirt },
  { id: 'design', label: 'Design & Patches', Icon: Sparkles },
  { id: 'cart', label: 'Size & Cart', Icon: ShoppingBag }
];

const PANEL_META = {
  materials: {
    title: 'Fabric & colour',
    subtitle: 'Pick the wool body, leather sleeves and knit trim.',
    badge: 'Step 1 of 3'
  },
  design: {
    title: 'Letters & patches',
    subtitle: 'Add chest initials, sleeve numbers and back lettering.',
    badge: 'Step 2 of 3'
  },
  cart: {
    title: 'Size & checkout',
    subtitle: 'Confirm your fit, then add the jacket to your cart.',
    badge: 'Step 3 of 3'
  }
};

const emptyPlacement = () => ({
  type: 'None', text: '', font: 'Script', color: '#ffffff',
  colorName: 'White', patchId: '', patchUrl: '', patchName: '', price: 0
});

// ─── LOCAL PERSISTENCE ────────────────────────────────────────────────────
// ⚠️ NEW: har change (color, patch, font, view switch — sab kuch) apne aap
// localStorage mein save hota hai. Isse:
//  1. View badalne par (Front/Left/Right/Back) tumhari latest customization
//     kabhi gum nahi hoti — sab views ek hi state se render hote hain, aur
//     ab wo state disk par bhi mehfooz hai.
//  2. Page refresh / tab close + reopen karne par bhi wahi design wapas load
//     ho jaata hai — dobara se shuru nahi karna padta.
const STORAGE_KEY = 'varsityco_jacket_builder_v2';

const loadPersistedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const savePersistedState = (payload) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // storage full / disabled — fail silently, builder still works in-memory
  }
};

const createInitialSections = () => ({
  style: false,
  body: false,
  sleeves: false,
  inserts: false,
  pockets: false,
  fasteners: false,
  knit: false,
  collar: false,
  lining: false,
  advanced: false,
});

const createInitialJacket = () => ({
  style: 'Classic',
  bodyMaterial: 'Wool',
  bodyColor: WOOL_COLORS.find(c => c.name === 'Gold') || WOOL_COLORS[0],
  sleeveMaterial: 'Leather',
  sleeveColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
  pocketMaterial: 'Leather',
  pocketColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
  pocketStyle: 'Slash',
  innerLining: 'Quilted',
  innerLiningColor: SATIN_COLORS.find(c => c.name === 'Red') || SATIN_COLORS[0],
  snapsOrZipper: 'Snap',
  snapColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],

  hasShoulderInserts: false,
  shoulderInsertCount: 0,
  shoulderMaterial: 'Leather',
  shoulderColor: WOOL_COLORS.find(c => c.name === 'Black') || WOOL_COLORS[0],

  knitStyle: 'Two Stripes',
  knitBaseColor: WOOL_COLORS.find(c => c.name === 'Black') || WOOL_COLORS[0],
  knitLineColor: LEATHER_COLORS.find(c => c.name === 'White') || LEATHER_COLORS[1],
  knitFeatheringColor: WOOL_COLORS.find(c => c.name === 'Gold') || WOOL_COLORS[3],

  collarStyle: 'classic_standup',
  collarColor: { name: 'Black', hex: '#1a1a1a' },
  collarColorName: 'Black',

  leftChest: emptyPlacement(),
  rightChest: emptyPlacement(),
  leftSleeve: emptyPlacement(),
  rightSleeve: emptyPlacement(),
  back: {
    type: 'None',
    line1Text: '', line1Font: 'Varsity', line1Color: '#ffffff', line1ColorName: 'White',
    line2Text: '', line2Font: 'Varsity', line2Color: '#ffffff', line2ColorName: 'White',
    line3Text: '', line3Font: 'Script', line3Color: '#ffffff', line3ColorName: 'White',
    patchId: '', patchUrl: '', patchName: '', price: 0
  },
  size: ''
});

export default function LettermanJackets() {
  // ⚠️ NEW: agar pehle se saved design mili to usi se shuru karo (state +
  // jis view/tab par tum the), warna fresh default state.
  const persisted = React.useMemo(() => loadPersistedState(), []);

  const [activeTab, setActiveTab] = useState(persisted?.activeTab || 'materials');
  // ⚠️ NEW: view hamesha 'Front' se shuru hoti hai jab builder naye se
  // load ho (page refresh/reopen) — chahe pichli baar tum Left/Right/Back
  // pe hi kyun na chhode ho. jacketState (colors/patches) aur activeTab
  // wahi persisted se load hote hain, sirf view hamesha reset hoti hai.
  const [activeView, setActiveView] = useState('Front');
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [completedSections, setCompletedSections] = useState(persisted?.completedSections || createInitialSections);
  const [jacketState, setJacketState] = useState(persisted?.jacketState || createInitialJacket);

const handleStateUpdate = (updater) => {
  setJacketState(prev =>
    typeof updater === 'function'
      ? updater(prev)
      : { ...prev, ...updater }
  );
};

  // ⚠️ NEW: koi bhi change ho — jacketState, activeView, activeTab, ya
  // completedSections — sab ek saath localStorage mein save ho jaata hai.
  // Isi wajah se view switch karne par (Front→Left→Right→Back) ya page
  // refresh karne par bhi tumhari latest customization wahi ki wahi rehti hai.
  useEffect(() => {
    savePersistedState({ jacketState, activeView, activeTab, completedSections });
  }, [jacketState, activeView, activeTab, completedSections]);

  const notifyUser = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // ⚠️ FIX: pehle har tab-switch par activeView ko 'Front' (ya cart par
  // 'Back') par FORCE kar diya jaata tha — chahe tum Left/Right/Back dekh
  // rahe ho. Design tab par jaate hi view achanak 'Front' pe jump ho jaati
  // thi, jo "sab badal/kharab ho gaya" jaisa lagta tha (asal mein sirf view
  // switch hui thi, koi color/material nahi toota).
  // Ab: sirf CART tab par jaate waqt view ko 'Back' par le jaate hain (taake
  // checkout se pehle back design confirm ho sake); Materials aur Design ke
  // beech switch karne par jo bhi view khuli hai wahi rehti hai.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'cart') {
      setActiveView('Front');
    }
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    notifyUser('Jacket added to your cart. Checkout below when you\u2019re ready.');
  };

  const handleStartOver = () => {
    setJacketState(createInitialJacket());
    setCompletedSections(createInitialSections());
    setActiveTab('materials');
    setActiveView('Front');
    // ⚠️ NEW: saved design bhi clear karo, warna refresh karne par purana
    // design localStorage se wapas load ho jaata.
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    }
    notifyUser('Build reset. Start with the fabric and colours.');
  };

  const meta = PANEL_META[activeTab];

  return (
    <div className="leather-app-container">

      {notification && (
        <div className="leather-notification-banner" role="status" aria-live="polite">
          <CheckCircle size={17} className="leather-notification-icon" />
          <p className="leather-notification-text">{notification}</p>
        </div>
      )}

      <header className="leather-app-header">
        <div className="leather-header-inner">
          <div className="leather-brand-container">
            <div className="leather-brand-logo"><span className="leather-brand-letter">V</span></div>
            <div>
              <h1 className="leather-brand-title">Varsity Co.</h1>
              <p className="leather-brand-subtitle">Jacket Builder</p>
            </div>
          </div>

          <div className="leather-header-actions">
            <div className="leather-promo-tag">
              <Flame size={12} className="leather-promo-icon" />
              <span className="leather-promo-text">Season price &middot; $249</span>
            </div>

            <button
              type="button"
              className="leather-cart-indicator"
              onClick={() => handleTabChange('cart')}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              <ShoppingBag size={16} className="leather-cart-icon" />
              {cartCount > 0 && <span className="leather-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="leather-main-content">

        {/* Preview — left, wide */}
        <div className="leather-preview-column">
        
            <JacketVisualPreview
              state={jacketState}
              view={activeView}
              onChangeView={setActiveView}
            />
         

          <div className="leather-helper-tip">
            <Sparkle size={14} className="leather-helper-icon" />
            <p className="leather-helper-text">
              Switch between <b>Front</b>, <b>Left</b>, <b>Right</b> and <b>Back</b> under the
              preview to check your sleeves, initials and back lettering.
            </p>
          </div>
        </div>

        {/* Controls — right */}
        <div className="leather-config-column">

          <div className="leather-builder-head">
            <h2 className="leather-builder-title">Build your jacket</h2>
            <button type="button" className="leather-reset-btn" onClick={handleStartOver}>
              <RotateCcw size={13} />
              <span>Start over</span>
            </button>
          </div>

          <nav className="leather-tab-navigation" aria-label="Builder steps">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabChange(id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`leather-tab-button ${isActive ? 'leather-tab-button-active' : 'leather-tab-button-inactive'}`}
                >
                  <Icon size={13} className={isActive ? 'leather-tab-icon-active' : 'leather-tab-icon-inactive'} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="leather-panel-container">
            <div className="leather-panel-content" >
              <div className="leather-panel-header">
                <div>
                  <h3 className="leather-panel-title">{meta.title}</h3>
                  <p className="leather-panel-subtitle">{meta.subtitle}</p>
                </div>
                <span className="leather-step-badge">{meta.badge}</span>
              </div>

              {activeTab === 'materials' && (
                <MaterialsColorsPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  completedSections={completedSections}
                  setCompletedSections={setCompletedSections}
                  onChangeView={setActiveView}
                  onNext={() => {
                    handleTabChange('design');
                    notifyUser('Fabrics saved. Next, add your letters and patches.');
                  }}
                />
              )}

              {activeTab === 'design' && (
                <DesignPatchesPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  completedSections={completedSections}
                  setCompletedSections={setCompletedSections}
                  onNext={() => {
                    handleTabChange('cart');
                    notifyUser('Personalisation saved. Now pick your size.');
                  }}
                />
              )}

              {activeTab === 'cart' && (
                <CartSummaryPanel
                  state={jacketState}
                  onChangeState={handleStateUpdate}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}