/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MaterialsColorsPanel.jsx
 * UI refreshed to the editorial row layout (Montserrat + Poppins only).
 * All inline styling moved into MaterialsColorsPanel.css — options and
 * state keys are unchanged.
 *
 * ── SKIN (BODY MATERIAL) PASS ────────────────────────────────────
 *  - Jacket Body mein ab sirf 3 skins hain: Ostrich, Snake, Crocodile.
 *    Har skin ki apni jacket /leather/<folder>/{front,back,left,right}/ se
 *    load hoti hai (mapping JacketVisualPreview.jsx ke SKIN_SVG_SETS mein).
 *  - Default skin = Ostrich. Agar state mein koi valid skin nahi (naya user,
 *    ya purana saved 'Melton Wool' design) to mount par khud Ostrich select
 *    ho jaati hai, aur har commit() bhi valid skin ki guarantee deta hai.
 *  - Skin card click → state.style + state.bodyMaterial dono us skin par →
 *    preview us skin ke folder ki 4 files load karta hai.
 *
 * ── PRICING ────────────────────────────────────────────────────
 * Every option carries a price. The running total is pushed back up
 * through `onChangeState` as:
 *   state.totalPrice      — number
 *   state.priceBreakdown  — [{ group, label, amount }]
 *
 * Edit the PRICING object below to change any number.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import PropTypes from 'prop-types';
import './MaterialsColorsPanel.css';
import { COLLAR_STYLES } from './DesignPatchesPanel.jsx';

// ─────────────────────────────────────────────
// SKINS (Jacket Body materials)
// ─────────────────────────────────────────────
// ⚠️ `key` wahi naam hai jo state.bodyMaterial / state.style mein jata hai.
// JacketVisualPreview.jsx ke SKIN_SVG_SETS mein bhi bilkul yahi keys hain.
export const SKIN_OPTIONS = [
  { key: 'Ostrich',   desc: 'Classic exotic texture' },
  { key: 'Snake',     desc: 'Bold scaled finish' },
  { key: 'Crocodile', desc: 'Premium croc pattern' },
];

export const DEFAULT_SKIN = 'Ostrich';

const SKIN_WARNING_EVENT = 'jacket:skin-required'; // JacketVisualPreview isi event ko sunta hai

// state se valid skin naam nikaalo ('' agar koi valid skin nahi)
const getSkin = (s) => {
  const m = s?.bodyMaterial;
  const raw = m && typeof m === 'object' ? (m.id || m.name || m.value || '') : m;
  if (typeof raw !== 'string') return '';
  const v = raw.trim().toLowerCase();
  if (v === 'ostritch') return 'Ostrich';
  return SKIN_OPTIONS.find((o) => o.key.toLowerCase() === v)?.key || '';
};

const isSkinSelected = (s) => getSkin(s) !== '';

// Har state mein ek valid skin zaroor ho — warna Ostrich daal do.
const withDefaultSkin = (s) => {
  if (isSkinSelected(s)) return s;
  return {
    ...s,
    style: DEFAULT_SKIN,
    bodyMaterial: DEFAULT_SKIN,
    sleeveMaterial: ['Faux Leather', 'Sheep Leather', 'Cowhide Leather'].includes(s?.sleeveMaterial)
      ? s.sleeveMaterial
      : 'Cowhide Leather',
  };
};

const requestSkinWarning = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SKIN_WARNING_EVENT));
};

// ─────────────────────────────────────────────
// PRICING TABLE  — change the numbers here only
// ─────────────────────────────────────────────

export const CURRENCY = '$';

export const PRICING = {
  BASE: 149,
  knitLineMaterial: { Knit: 0, Chenille: 8, Embroidery: 6, Satin: 5 },

  // 2. Jacket body (skin) — apni prices yahan daalo
  style: {
    Ostrich: 0,
    Snake: 0,
    Crocodile: 0,
  },

  // 3. Sleeves
  sleeveMaterial: {
    'Melton Wool': 0,
    'Cotton Fleece': 0,
    'Polyster Satin': 0,
    'Cotton Twill': 0,
    'Softshell': 0,
    'Nylon': 0,
    'Satin': 0,
    'Faux Leather': 25,
    'Sheep Leather': 59,
    'Cowhide Leather': 79,
  },

  // 8. Collar (keyed by COLLAR_STYLES id — anything missing is 0)
  collarStyle: {
    classic_standup: 0,
  },

  // 4. Shoulder inserts
  shoulderInsertCount: { 0: 0, 1: 14, 2: 24, 3: 32 },
  shoulderMaterial: { Wool: 0, Leather: 18, Vinyl: 9, Satin: 6 },

  // 5. Pockets
  pocketStyle: { Slash: 0, Straight: 4, Welt: 6, Flap: 8, Snap: 10, Zipper: 14 },
  pocketMaterial: { Wool: 0, Leather: 16, Vinyl: 8, Satin: 6 },

  // 6. Knit trim
  knitStyle: {
    'Plain Knit': 0,
    'Single Stripe': 6,
    'Double Stripe': 10,
    'Single Stripe Border': 12,
    'Double Stripe Border': 16,
    'Rainbow': 22,
  },

  // 7. Closure
  snapsOrZipper: { Snap: 0, Zipper: 18 },
  addZipperFlap: 12,

  // 9. Lining
  innerLining: { Quilted: 24, Lightweight: 12, None: 0 },
  addZipoutLining: 39,

  // 10. Advanced
  cuffStyle: { Classic: 0, Pro: 20 },
  toggles: {
    addChestPocket: 9,
    addSleeveStripe: 12,
    addPocketPiping: 7,
    addShoulderPiping: 7,
    addStripePiping: 7,
  },

  // Premium colours — charged once per place they're used
  colorSurcharge: {
    Gold: 5,
    Silver: 4,
    Champagne: 6,
    Cognac: 4,
  },
};

// ── money helpers ──
export const fmtMoney = (n) =>
  `${n < 0 ? '-' : ''}${CURRENCY}${Math.abs(Number(n) || 0).toLocaleString()}`;

export const fmtDelta = (n) => {
  const v = Number(n) || 0;
  if (v === 0) return 'Included';
  return `${v > 0 ? '+' : '−'}${CURRENCY}${Math.abs(v).toLocaleString()}`;
};

const colorFee = (color) => PRICING.colorSurcharge[color?.name] || 0;

/**
 * Builds the full line-item breakdown from the current state.
 */
export function getPriceBreakdown(state = {}) {
  const lines = [];
  const add = (group, label, amount) => {
    const v = Number(amount) || 0;
    if (v !== 0) lines.push({ group, label, amount: v });
  };

  // Base — always present
  lines.push({ group: 'body', label: 'Base jacket', amount: PRICING.BASE });

  // 2. Body
  add('body', `Body — ${state.style || DEFAULT_SKIN}`, PRICING.style[state.style] ?? 0);
  add('body', `Body colour — ${state.bodyColor?.name}`, colorFee(state.bodyColor));

  // 3. Sleeves
  add('sleeves', `Sleeves — ${state.sleeveMaterial}`, PRICING.sleeveMaterial[state.sleeveMaterial] ?? 0);
  add('sleeves', `Sleeve colour — ${state.sleeveColor?.name}`, colorFee(state.sleeveColor));

  // 8. Collar
  const collarName = COLLAR_STYLES?.find((c) => c.id === state.collarStyle)?.name;
  add('collar', `Collar — ${collarName || 'Classic'}`, PRICING.collarStyle[state.collarStyle] ?? 0);
  add('collar', `Collar colour — ${state.collarColor?.name}`, colorFee(state.collarColor));

  // 4. Shoulder inserts
  const insertCount = state.shoulderInsertCount || 0;
  if (insertCount > 0) {
    add('inserts', `Shoulder inserts × ${insertCount}`, PRICING.shoulderInsertCount[insertCount] ?? 0);
    add('inserts', `Insert material — ${state.shoulderMaterial || 'Leather'}`,
      PRICING.shoulderMaterial[state.shoulderMaterial || 'Leather'] ?? 0);
    add('inserts', `Insert 1 colour — ${state.shoulderColor?.name}`, colorFee(state.shoulderColor));
    if (insertCount >= 2) add('inserts', `Insert 2 colour — ${state.shoulderColor2?.name}`, colorFee(state.shoulderColor2));
    if (insertCount >= 3) add('inserts', `Insert 3 colour — ${state.shoulderColor3?.name}`, colorFee(state.shoulderColor3));
  }

  // 5. Pockets
  add('pockets', `Pocket style — ${state.pocketStyle || 'Slash'}`, PRICING.pocketStyle[state.pocketStyle || 'Slash'] ?? 0);
  add('pockets', `Pocket material — ${state.pocketMaterial}`, PRICING.pocketMaterial[state.pocketMaterial] ?? 0);
  add('pockets', `Pocket colour — ${state.pocketColor?.name}`, colorFee(state.pocketColor));

  // 6. Knit trim
  add('knit', `Knit trim — ${state.knitStyle || 'Plain Knit'}`, PRICING.knitStyle[state.knitStyle || 'Plain Knit'] ?? 0);
  add('knit', `Knit base colour — ${state.knitBaseColor?.name}`, colorFee(state.knitBaseColor));
  if (state.knitStyle && state.knitStyle !== 'Plain Knit' && state.knitStyle !== 'Rainbow') {
    add('knit', `Knit stripe colour — ${state.knitLineColor?.name}`, colorFee(state.knitLineColor));
  }
  if (state.knitStyle === 'Two Stripes With Feathering') {
    add('knit', `Feathering — ${state.knitFeatheringColor?.name}`, colorFee(state.knitFeatheringColor));
  }

  // 7. Closure
  add('fasteners', state.snapsOrZipper === 'Zipper' ? 'Zipper closure' : 'Snap closure',
    PRICING.snapsOrZipper[state.snapsOrZipper === 'Zipper' ? 'Zipper' : 'Snap'] ?? 0);
  if (state.snapsOrZipper === 'Zipper' && state.addZipperFlap) {
    add('fasteners', 'Zipper flap', PRICING.addZipperFlap);
  }
  if (state.snapsOrZipper !== 'Zipper') {
    add('fasteners', `Snap colour — ${state.snapColor?.name}`, colorFee(state.snapColor));
  }

  // 9. Lining
  const lining = state.innerLining || 'Quilted';
  add('lining', `Lining — ${lining}`, PRICING.innerLining[lining] ?? 0);
  if (state.addZipoutLining) add('lining', 'Zipout lining', PRICING.addZipoutLining);
  if (lining !== 'None') add('lining', `Lining colour — ${state.innerLiningColor?.name}`, colorFee(state.innerLiningColor));

  // 10. Advanced
  const cuff = state.cuffStyle || 'Classic';
  add('advanced', cuff === 'Pro' ? 'Pro cuff' : 'Knit cuff', PRICING.cuffStyle[cuff] ?? 0);
  if (cuff === 'Pro') add('advanced', `Pro cuff colour — ${state.proCuffColor?.name}`, colorFee(state.proCuffColor));

  const ADVANCED = [
    { key: 'addChestPocket', label: 'Chest pocket', colorKey: 'chestPocketColor' },
    { key: 'addSleeveStripe', label: 'Sleeve stripe', colorKey: 'sleeveStripeColor' },
    { key: 'addPocketPiping', label: 'Pocket piping', colorKey: 'pocketPipingColor' },
    { key: 'addShoulderPiping', label: 'Shoulder piping', colorKey: 'shoulderPipingColor' },
    { key: 'addStripePiping', label: 'Stripe piping', colorKey: 'stripePipingColor' },
  ];
  ADVANCED.forEach(({ key, label, colorKey }) => {
    if (state[key]) {
      add('advanced', label, PRICING.toggles[key]);
      add('advanced', `${label} colour — ${state[colorKey]?.name}`, colorFee(state[colorKey]));
    }
  });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total };
}

// ─────────────────────────────────────────────
// COLOR DATA
// ─────────────────────────────────────────────

export const WOOL_COLORS = [
  { name: 'Black',    hex: '#1a1a1a' },
  { name: 'Navy',     hex: '#1e3a8a' },
  { name: 'Grey',     hex: '#6b7280' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Camel',    hex: '#c4a882' },
  { name: 'White',    hex: '#ffffff' },
  { name: 'Red',      hex: '#dc2626' },
  { name: 'Maroon',   hex: '#991b1b' },
  { name: 'Forest',   hex: '#14532d' },
  { name: 'Gold',     hex: '#d4af37' },
];

export const LEATHER_COLORS = [
  { name: 'Black',    hex: '#1a1a1a' },
  { name: 'Brown',    hex: '#854d0e' },
  { name: 'Tan',      hex: '#d97706' },
  { name: 'Burgundy', hex: '#7f1d1d' },
  { name: 'Navy',     hex: '#1e3a8a' },
  { name: 'White',    hex: '#ffffff' },
  { name: 'Red',      hex: '#dc2626' },
  { name: 'Gold',     hex: '#d4af37' },
  { name: 'Silver',   hex: '#c0c0c0' },
  { name: 'Cognac',   hex: '#9a6b3a' },
];

export const SATIN_COLORS = [
  { name: 'Red',        hex: '#dc2626' },
  { name: 'Black',      hex: '#1a1a1a' },
  { name: 'White',      hex: '#ffffff' },
  { name: 'Navy',       hex: '#1e3a8a' },
  { name: 'Gold',       hex: '#d4af37' },
  { name: 'Silver',     hex: '#c0c0c0' },
  { name: 'Burgundy',   hex: '#7f1d1d' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald',    hex: '#059669' },
  { name: 'Champagne',  hex: '#f7e7ce' },
];

export const getColorsForMaterial = (material) => {
  const map = {
    Wool: WOOL_COLORS,
    Leather: LEATHER_COLORS,
    Vinyl: LEATHER_COLORS,
    Satin: SATIN_COLORS,
    // exotic skins → leather palette
    Ostrich: LEATHER_COLORS,
    Snake: LEATHER_COLORS,
    Crocodile: LEATHER_COLORS,
    'Faux Leather': LEATHER_COLORS,
    'Sheep Leather': LEATHER_COLORS,
    'Cowhide Leather': LEATHER_COLORS,
  };
  return map[material] || WOOL_COLORS;
};

// ─────────────────────────────────────────────
// POCKET STYLE VISUAL CARDS
// ─────────────────────────────────────────────

const POCKET_STYLES = [
  {
    id: 'Slash',
    label: 'Slash',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={36} height={36}>
        <line x1="12" y1="10" x2="20" y2="30" stroke={hex} strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="10" x2="20" y2="30" stroke={hex} strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'Flap',
    label: 'Flap',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={36} height={36}>
        <polygon points="10,12 30,12 26,24 14,24" fill={hex} stroke="#E6E2DC" strokeWidth="1" />
        <circle cx="20" cy="22" r="2.4" fill="#8A8378" />
      </svg>
    ),
  },
  {
    id: 'Straight',
    label: 'Straight',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={36} height={36}>
        <rect x="14" y="8" width="6" height="24" rx="1" fill={hex} stroke="#E6E2DC" strokeWidth="1" />
        <rect x="22" y="8" width="6" height="24" rx="1" fill={hex} stroke="#E6E2DC" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'Zipper',
    label: 'Zipper',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={36} height={36}>
        <rect x="17" y="9" width="6" height="22" rx="3" fill={hex} stroke="#E6E2DC" strokeWidth="1" transform="rotate(-20 20 20)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1="15" y1={12 + i * 3.4} x2="25" y2={10 + i * 3.4} stroke="#3a3a3a" strokeWidth="1" />
        ))}
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────
// KNIT STYLE VISUAL CARDS
// ─────────────────────────────────────────────

const KNIT_STYLES = [
  {
    id: 'Plain Knit',
    label: 'Solid',
    preview: (baseHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 3 }} />
    ),
  },
  {
    id: 'Single Stripe',
    label: '1 Stripe',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 6, background: lineHex || '#d4af37', transform: 'translateY(-50%)' }} />
      </div>
    ),
  },
  {
    id: 'Double Stripe',
    label: '2 Stripes',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div style={{ height: 5, background: lineHex || '#d4af37' }} />
        <div style={{ height: 5, background: lineHex || '#d4af37' }} />
      </div>
    ),
  },
  {
    id: 'Single Stripe Border',
    label: '1 Stripe + Border',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3px 0' }}>
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
        <div style={{ height: 5, background: lineHex || '#d4af37', margin: '0 4px' }} />
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
      </div>
    ),
  },
  {
    id: 'Double Stripe Border',
    label: '2 Stripes + Border',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3px 0' }}>
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '0 4px' }}>
          <div style={{ height: 4, background: lineHex || '#d4af37' }} />
          <div style={{ height: 4, background: lineHex || '#d4af37' }} />
        </div>
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
      </div>
    ),
  },
  {
    id: 'Rainbow',
    label: 'Rainbow',
    preview: () => (
      <div style={{ width: 40, height: 30, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {['#dc2626', '#d4af37', '#2563eb', '#7c3aed'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
    ),
  },
];

// ─────────────────────────────────────────────
// SMALL PRICE BADGE
// ─────────────────────────────────────────────

const PriceTag = ({ amount, showZero = true }) => {
  const v = Number(amount) || 0;
  if (v === 0 && !showZero) return null;
  const tone = v > 0 ? 'leather-price-tag-plus' : v < 0 ? 'leather-price-tag-minus' : 'leather-price-tag-free';
  return <span className={`leather-price-tag ${tone}`}>{fmtDelta(v)}</span>;
};

PriceTag.propTypes = { amount: PropTypes.number, showZero: PropTypes.bool };

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function MaterialsColorsPanel({ state, onChangeState, completedSections, setCompletedSections, onNext, onChangeView }) {
  // Body section pehle se khula — user ko skin picker turant dikhe.
  const [activeSection, setActiveSection] = useState('body');

  // Default skin = Ostrich. State mein skin na ho to bhi UI Ostrich hi dikhata hai.
  const currentSkin = getSkin(state) || DEFAULT_SKIN;
  const skinSelected = true;

  // ── commit — har update ke saath price fold + valid skin guarantee ──
  const commit = React.useCallback((updater) => {
    onChangeState((p) => {
      const prev = withDefaultSkin(p || {});
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const base = withDefaultSkin(next);
      const { lines: _pl, total: _pt } = getPriceBreakdown(base);
      return { ...base, totalPrice: _pt, priceBreakdown: _pl };
    });
    return true;
  }, [onChangeState]);

  const safeChangeView = (v) => {
    if (typeof onChangeView === 'function') onChangeView(v);
  };

  // Mount par: skin na ho to Ostrich select karo (+ collar default).
  useEffect(() => {
    const needsSkin = !isSkinSelected(state);
    const needsCollar = !completedSections.collar && state.collarColor?.name !== 'White';
    if (needsSkin || needsCollar) {
      commit(prev => ({
        ...prev,
        ...(needsCollar ? { collarColor: { name: 'Black', hex: '#000' } } : {}),
      }));
    }
    if (needsSkin) markDone('style');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── live price ──
  const { lines, total } = useMemo(() => getPriceBreakdown(state), [state]);
  const groupTotal = (g) => lines.filter((l) => l.group === g).reduce((s, l) => s + l.amount, 0);

  const toggleSection = (section) => setActiveSection(activeSection === section ? '' : section);

  const markDone = (key) =>
    setCompletedSections(prev => prev[key] ? prev : { ...prev, [key]: true });

  // Skin select karna — ye hamesha allowed hai.
  const setJacketStyle = (skin) => {
    commit(prev => ({
      ...prev,
      style: skin,
      bodyMaterial: skin,
      // Agar purani sleeve material is skin ke saath valid nahi to default lo
      sleeveMaterial: getSleeveMaterials(skin).includes(prev.sleeveMaterial)
        ? prev.sleeveMaterial
        : 'Cowhide Leather',
    }));
    markDone('style');
    markDone('body');
    // Nayi skin → Front view se dikhao (preview bhi khud karta hai).
    if (typeof onChangeView === 'function') onChangeView('Front');
  };

  // ── Section header (now shows the section subtotal) ──
  const sectionHeader = (key, number, title) => {
    const sub = groupTotal(key);
    return (
      <button onClick={() => toggleSection(key)} className="leather-section-header" type="button">
        <div className="leather-section-header-left">
          <div>
            <h3 className="leather-section-title">{title}</h3>
          </div>
        </div>
        <div className="leather-section-header-right">
          {sub !== 0 && <span className="leather-section-subtotal">{fmtMoney(sub)}</span>}
          <ChevronDown size={16} className={`leather-section-chevron ${activeSection === key ? 'leather-section-chevron-active' : ''}`} />
        </div>
      </button>
    );
  };

  // ── Color grid (premium colours show a fee dot + tooltip) ──
  const ColorGrid = ({ colors, currentName, onSelect, small = false }) => (
    <div className={small ? 'leather-color-grid-small' : 'leather-color-grid'}>
      {colors.map((color) => {
        const fee = colorFee(color);
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onSelect(color)}
            className={`${small ? 'leather-color-btn-small' : 'leather-color-btn'}${fee ? ' leather-color-btn-premium' : ''}`}
            style={{ backgroundColor: color.hex }}
            title={fee ? `${color.name} — ${fmtDelta(fee)}` : `${color.name} — Included`}
            aria-label={fee ? `${color.name}, extra ${fmtMoney(fee)}` : color.name}
          >
            {currentName === color.name && (
              <span className={small ? 'leather-color-check-small' : 'leather-color-check-inner'}>
                <Check size={small ? 8 : 10} className={small ? 'leather-color-check-icon-small' : 'leather-color-check-icon-inner'} />
              </span>
            )}
            {fee > 0 && <span className="leather-color-fee-dot" aria-hidden="true">{CURRENCY}</span>}
          </button>
        );
      })}
    </div>
  );

  // ── Material buttons (price aware) ──
  const MaterialBtns = ({ materials, current, onChange, priceMap }) => (
    <div className="leather-material-btns">
      {materials.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`leather-material-btn ${current === m ? 'leather-material-btn-active' : 'leather-material-btn-inactive'}`}
        >
          <span className="leather-btn-label">{m}</span>
          {priceMap && <PriceTag amount={priceMap[m] ?? 0} />}
        </button>
      ))}
    </div>
  );

  // Convenience values for previews
  const pocketPreviewHex = state.pocketColor?.hex || '#8A8378';
  const pocketStyle = state.pocketStyle || 'Slash';

  function getSleeveMaterials(bodyMaterial) {
    switch (bodyMaterial) {
      case 'Ostrich':
      case 'Snake':
      case 'Crocodile':
        return ['Faux Leather', 'Sheep Leather', 'Cowhide Leather'];
      default:
        return [];
    }
  }

  return (
    <div className="leather-materials-container">

      {/* ── 2. JACKET BODY (SKIN) ── */}
      <div className="leather-section-card">
        {sectionHeader('body', 2, 'Jacket Body')}
        {activeSection === 'body' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Material (Skin)</h4>
              <div className="leather-style-grid">
                {SKIN_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setJacketStyle(item.key)}
                    className={`leather-style-card ${currentSkin === item.key ? 'leather-style-card-active' : 'leather-style-card-inactive'}`}
                  >
                    <div className="leather-style-info">
                      <h4 className="leather-style-name">{item.key}</h4>
                      <p className="leather-style-desc">{item.desc}</p>
                    </div>
                    <PriceTag amount={PRICING.style[item.key] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="leather-sub-label">Color — {state.bodyColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(currentSkin)}
                currentName={state.bodyColor?.name}
                onSelect={(c) => { if (commit(prev => ({ ...prev, bodyColor: c }))) markDone('body'); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. JACKET SLEEVES ── */}
      <div className="leather-section-card">
        {sectionHeader('sleeves', 3, 'Jacket Sleeves')}
        {activeSection === 'sleeves' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Sleeve Material</h4>
              <MaterialBtns
                materials={getSleeveMaterials(currentSkin)}
                current={state.sleeveMaterial}
                priceMap={PRICING.sleeveMaterial}
                onChange={(m) => {
                  if (commit(prev => ({ ...prev, sleeveMaterial: m, sleeveColor: prev.sleeveColor || getColorsForMaterial(m)[0] }))) markDone('sleeves');
                }}
              />
            </div>

            <div>
              <h4 className="leather-sub-label">Color — {state.sleeveColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(state.sleeveMaterial)}
                currentName={state.sleeveColor?.name}
                onSelect={(c) => { if (commit(prev => ({ ...prev, sleeveColor: c }))) markDone('sleeves'); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 8. COLLAR STYLE ── */}
      <div className="leather-section-card">
        {sectionHeader('collar', 8, 'Collar Style')}
        {activeSection === 'collar' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Collar Style</h4>
              <select
                className="leather-field-select"
                value={state.collarStyle || 'classic_standup'}
                onChange={(e) => { if (commit(prev => ({ ...prev, collarStyle: e.target.value }))) markDone('collar'); }}
              >
                {COLLAR_STYLES?.map((collar) => {
                  const fee = PRICING.collarStyle[collar.id] ?? 0;
                  return (
                    <option key={collar.id} value={collar.id}>
                      {collar.name}{fee ? ` (${fmtDelta(fee)})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. SHOULDER INSERTS ── */}
      <div className="leather-section-card">
        {sectionHeader('inserts', 4, 'Shoulder Inserts')}
        {activeSection === 'inserts' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Number of Inserts</h4>
              <div className="leather-material-btns">
                {[
                  { count: 0, label: 'None' },
                  { count: 1, label: 'Single' },
                  { count: 2, label: 'Double' },
                ].map(({ count, label }) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      const ok = commit(prev => ({
                        ...prev,
                        shoulderInsertCount: count,
                        hasShoulderInserts: count > 0,
                        shoulderMaterial: prev.shoulderMaterial || 'Leather',
                        shoulderColor: prev.shoulderColor || { name: 'Silver', hex: '#c0c0c0' },
                      }));
                      if (ok) markDone('inserts');
                    }}
                    className={`leather-material-btn ${(state.shoulderInsertCount ?? 0) === count ? 'leather-material-btn-active' : 'leather-material-btn-inactive'}`}
                  >
                    <span className="leather-btn-label">{label}</span>
                    <PriceTag amount={PRICING.shoulderInsertCount[count] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            {(state.shoulderInsertCount || 0) > 0 && (
              <>
                <div>
                  <h4 className="leather-sub-label">Insert Material</h4>
                  <MaterialBtns
                    materials={['Wool', 'Leather', 'Vinyl']}
                    current={state.shoulderMaterial}
                    priceMap={PRICING.shoulderMaterial}
                    onChange={(m) => {
                      if (commit(prev => ({ ...prev, shoulderMaterial: m, shoulderColor: prev.shoulderColor || getColorsForMaterial(m)[0] }))) markDone('inserts');
                    }}
                  />
                </div>

                <div>
                  <h4 className="leather-sub-label">Insert 1 Color — {state.shoulderColor?.name || 'Silver'}</h4>
                  <ColorGrid
                    colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                    currentName={state.shoulderColor?.name}
                    onSelect={(c) => { if (commit(prev => ({ ...prev, shoulderColor: c }))) markDone('inserts'); }}
                    small
                  />
                </div>

                {(state.shoulderInsertCount || 0) >= 2 && (
                  <div>
                    <h4 className="leather-sub-label">Insert 2 Color — {state.shoulderColor2?.name || state.shoulderColor?.name || 'Silver'}</h4>
                    <ColorGrid
                      colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                      currentName={state.shoulderColor2?.name || state.shoulderColor?.name}
                      onSelect={(c) => { if (commit(prev => ({ ...prev, shoulderColor2: c }))) markDone('inserts'); }}
                      small
                    />
                  </div>
                )}

                {(state.shoulderInsertCount || 0) >= 3 && (
                  <div>
                    <h4 className="leather-sub-label">Insert 3 (Yoke) Color — {state.shoulderColor3?.name || state.shoulderColor?.name || 'Silver'}</h4>
                    <ColorGrid
                      colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                      currentName={state.shoulderColor3?.name || state.shoulderColor?.name}
                      onSelect={(c) => { if (commit(prev => ({ ...prev, shoulderColor3: c }))) markDone('inserts'); }}
                      small
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 5. JACKET POCKETS ── */}
      <div className="leather-section-card">
        {sectionHeader('pockets', 5, 'Jacket Pockets')}
        {activeSection === 'pockets' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Pocket Style</h4>
              <div className="leather-picker-row">
                {POCKET_STYLES.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => { if (commit(prev => ({ ...prev, pocketStyle: ps.id }))) markDone('pockets'); }}
                    className={`leather-picker-card ${pocketStyle === ps.id ? 'leather-picker-card-active' : ''}`}
                  >
                    {ps.preview(pocketPreviewHex)}
                    <span className="leather-picker-label">{ps.label}</span>
                    <PriceTag amount={PRICING.pocketStyle[ps.id] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="leather-sub-label">Material</h4>
              <MaterialBtns
                materials={['Wool', 'Leather', 'Vinyl']}
                current={state.pocketMaterial}
                priceMap={PRICING.pocketMaterial}
                onChange={(m) => {
                  if (commit(prev => ({ ...prev, pocketMaterial: m, pocketColor: prev.pocketColor || getColorsForMaterial(m)[1] || getColorsForMaterial(m)[0] }))) markDone('pockets');
                }}
              />
            </div>

            <div>
              <h4 className="leather-sub-label">Pocket Color — {state.pocketColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(state.pocketMaterial)}
                currentName={state.pocketColor?.name}
                onSelect={(c) => { if (commit(prev => ({ ...prev, pocketColor: c }))) markDone('pockets'); }}
                small
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 6. KNIT TRIM STYLE ── */}
      <div className="leather-section-card">
        {sectionHeader('knit', 6, 'Knit Trim')}
        {activeSection === 'knit' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Pattern</h4>
              <div className="leather-material-btns">
                {KNIT_STYLES.map((ks) => (
                  <button
                    key={ks.id}
                    type="button"
                    onClick={() => { if (commit(prev => ({ ...prev, knitStyle: ks.id }))) markDone('knit'); }}
                    className={`leather-material-btn ${state.knitStyle === ks.id ? 'leather-material-btn-active' : 'leather-material-btn-inactive'}`}
                  >
                    <span className="leather-btn-label">{ks.label}</span>
                    <PriceTag amount={PRICING.knitStyle[ks.id] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="leather-sub-label">Base Color — {state.knitBaseColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={WOOL_COLORS}
                currentName={state.knitBaseColor?.name}
                onSelect={(c) => {
                  const ok = commit(prev => ({
                    ...prev,
                    knitBaseColor: c,
                    collarColor: { name: c.name, hex: c.hex },
                  }));
                  if (ok) { markDone('knit'); markDone('collar'); }
                }}
                small
              />
            </div>

            {state.knitStyle && state.knitStyle !== 'Plain Knit' && state.knitStyle !== 'Rainbow' && (
              <div>
                <h4 className="leather-sub-label">
                  {state.knitStyle === 'Border Knit' ? 'Border Color' : 'Stripe Color'} — {state.knitLineColor?.name || 'Gold'}
                </h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitLineColor?.name}
                  onSelect={(c) => { if (commit(prev => ({ ...prev, knitLineColor: c }))) markDone('knit'); }}
                  small
                />
              </div>
            )}

            {state.knitStyle && state.knitStyle.includes('Border') && (
              <div>
                <h4 className="leather-sub-label">Border Color — {state.knitBorderColor?.name || 'Gold'}</h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitBorderColor?.name}
                  onSelect={(c) => { if (commit(prev => ({ ...prev, knitBorderColor: c }))) markDone('knit'); }}
                  small
                />
              </div>
            )}

            {state.knitStyle === 'Two Stripes With Feathering' && (
              <div>
                <h4 className="leather-sub-label">Feathering Accent — {state.knitFeatheringColor?.name || 'White'}</h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitFeatheringColor?.name}
                  onSelect={(c) => { if (commit(prev => ({ ...prev, knitFeatheringColor: c }))) markDone('knit'); }}
                  small
                />
              </div>
            )}

            <div>
              <h4 className="leather-sub-label">Collar Color — {state.collarColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={WOOL_COLORS}
                currentName={state.collarColor?.name}
                onSelect={(c) => { if (commit(prev => ({ ...prev, collarColor: { name: c.name, hex: c.hex } }))) markDone('collar'); }}
                small
              />
              {state.knitStyle && state.knitStyle !== 'Plain Knit' && (
                <p className="leather-hint-text">
                  The collar renders with the same “{KNIT_STYLES.find(k => k.id === state.knitStyle)?.label}” knit pattern shown above.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 7. FRONT CLOSURE ── */}
      <div className="leather-section-card">
        {sectionHeader('fasteners', 7, 'Snaps or Zipper')}
        {activeSection === 'fasteners' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Closure</h4>
              <div className="leather-fasteners-btns">
                <button
                  type="button"
                  onClick={() => { if (commit(prev => ({ ...prev, snapsOrZipper: 'Snap', addZipperFlap: false }))) markDone('fasteners'); }}
                  className={`leather-fasteners-btn ${state.snapsOrZipper !== 'Zipper' ? 'leather-fasteners-btn-active' : 'leather-fasteners-btn-inactive'}`}
                >
                  <span className="leather-btn-label">Button (Snaps)</span>
                  <PriceTag amount={PRICING.snapsOrZipper.Snap} />
                </button>
                <button
                  type="button"
                  onClick={() => { if (commit(prev => ({ ...prev, snapsOrZipper: 'Zipper' }))) markDone('fasteners'); }}
                  className={`leather-fasteners-btn ${state.snapsOrZipper === 'Zipper' ? 'leather-fasteners-btn-active' : 'leather-fasteners-btn-inactive'}`}
                >
                  <span className="leather-btn-label">Zipper</span>
                  <PriceTag amount={PRICING.snapsOrZipper.Zipper} />
                </button>
              </div>
            </div>

            {state.snapsOrZipper !== 'Zipper' && (
              <div>
                <h4 className="leather-sub-label">Snap Colour — {state.snapColor?.name || 'Silver'}</h4>
                <ColorGrid
                  colors={LEATHER_COLORS}
                  currentName={state.snapColor?.name}
                  onSelect={(c) => { if (commit(prev => ({ ...prev, snapColor: c }))) markDone('fasteners'); }}
                  small
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 9. INSIDE LINING ── */}
      <div className="leather-section-card">
        {sectionHeader('lining', 9, 'Inside Lining')}
        {activeSection === 'lining' && (
          <div className="leather-section-content">
            <div>
              <h4 className="leather-sub-label">Lining Type</h4>
              <select
                className="leather-field-select"
                value={state.innerLining || 'Quilted'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!commit(prev => ({ ...prev, innerLining: val }))) return;
                  markDone('lining');
                  if (val !== 'None') safeChangeView('Lining');
                }}
              >
                <option value="Quilted">Quilted — {fmtDelta(PRICING.innerLining.Quilted)}</option>
                <option value="Lightweight">Plane — {fmtDelta(PRICING.innerLining.Lightweight)}</option>
              </select>
            </div>

            {state.innerLining !== 'None' && (
              <div>
                <h4 className="leather-sub-label">Lining Colour — {state.innerLiningColor?.name || 'Red'}</h4>
                <ColorGrid
                  colors={SATIN_COLORS}
                  currentName={state.innerLiningColor?.name}
                  onSelect={(c) => {
                    if (!commit(prev => ({ ...prev, innerLiningColor: c }))) return;
                    markDone('lining');
                    safeChangeView('Lining');
                  }}
                  small
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 10. ADVANCED OPTIONS ── */}
      <div className="leather-section-card">
        {sectionHeader('advanced', 10, 'Advanced Options')}
        {activeSection === 'advanced' && (
          <div className="leather-section-content">
            {[
              { key: 'addChestPocket',    label: 'Add Chest Pocket',    colorKey: 'chestPocketColor',    defName: 'Silver' },
              { key: 'addSleeveStripe',   label: 'Add Sleeve Stripe',   colorKey: 'sleeveStripeColor',   defName: 'Gold' },
              { key: 'addPocketPiping',   label: 'Add Pocket Piping',   colorKey: 'pocketPipingColor',   defName: 'Gold' },
              { key: 'addShoulderPiping', label: 'Add Shoulder Piping', colorKey: 'shoulderPipingColor', defName: 'Gold' },
              { key: 'addStripePiping',   label: 'Add Stripe Piping',   colorKey: 'stripePipingColor',   defName: 'Gold' },
            ].map(({ key, label, colorKey, defName }) => (
              <div key={key} className="leather-option-block">
                <h4 className="leather-sub-label">
                  {label} <PriceTag amount={PRICING.toggles[key]} />
                </h4>
                <div className="leather-fasteners-btns">
                  <button
                    type="button"
                    onClick={() => { if (commit(prev => ({ ...prev, [key]: true }))) markDone('advanced'); }}
                    className={`leather-fasteners-btn ${state[key] ? 'leather-fasteners-btn-active' : 'leather-fasteners-btn-inactive'}`}
                  >
                    <span className="leather-btn-label">Yes</span>
                    <PriceTag amount={PRICING.toggles[key]} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (commit(prev => ({ ...prev, [key]: false }))) markDone('advanced'); }}
                    className={`leather-fasteners-btn ${!state[key] ? 'leather-fasteners-btn-active' : 'leather-fasteners-btn-inactive'}`}
                  >
                    <span className="leather-btn-label">No</span>
                    <PriceTag amount={0} />
                  </button>
                </div>

                {state[key] && (
                  <div className="leather-option-block">
                    <h4 className="leather-sub-label">{label.replace('Add ', '')} Color — {state[colorKey]?.name || defName}</h4>
                    <ColorGrid
                      colors={WOOL_COLORS}
                      currentName={state[colorKey]?.name}
                      onSelect={(c) => { if (commit(prev => ({ ...prev, [colorKey]: c }))) markDone('advanced'); }}
                      small
                    />
                  </div>
                )}
              </div>
            ))}

            <p className="leather-hint-text">
              Each option has its own colour and shows on the front view. Turn an option on to reveal its colour picker.
            </p>
          </div>
        )}
      </div>

      {/* ── PRICE SUMMARY + NEXT ── */}
      <div className="leather-lock-section">
        <button
          type="button"
          onClick={() => {
            if (!skinSelected) { requestSkinWarning(); return; }
            onNext();
          }}
          className="leather-next-btn leather-next-btn-active"
        >
          <span>Continue to design &amp; patches</span>
          <span className="leather-next-btn-price">{fmtMoney(total)}</span>
        </button>
      </div>
    </div>
  );
}

MaterialsColorsPanel.propTypes = {
  state: PropTypes.object.isRequired,
  onChangeState: PropTypes.func.isRequired,
  completedSections: PropTypes.object.isRequired,
  setCompletedSections: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onChangeView: PropTypes.func,
};