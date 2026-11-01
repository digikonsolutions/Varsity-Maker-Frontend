import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Lock, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';
import './MaterialsColorsPanel.css';
import { COLLAR_STYLES } from './DesignPatchesPanel.jsx';

// ─────────────────────────────────────────────
// PRICING TABLE  — change the numbers here only
// ─────────────────────────────────────────────

export const CURRENCY = '$';

export const PRICING = {
  BASE: 149,
  // 6. Knit trim
  knitLineMaterial: { Knit: 0, Chenille: 8, Embroidery: 6, Satin: 5 },

  // 2. Jacket body
  style: {
    'Melton Wool': 0,
    'Satin': -15,
    'Leather': 89,
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
 * Adding an option pushes a line in; removing it drops the line out.
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
  add('body', `Body — ${state.style || 'Melton Wool'}`, PRICING.style[state.style] ?? 0);
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
  if (state.addZipperFlap) {
    add('fasteners', 'Flap', PRICING.addZipperFlap);
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
  const map = { Wool: WOOL_COLORS, Leather: LEATHER_COLORS, Vinyl: LEATHER_COLORS, Satin: SATIN_COLORS };
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
  
];

// ─────────────────────────────────────────────
// SMALL PRICE BADGE
// ─────────────────────────────────────────────

const PriceTag = ({ amount, showZero = true }) => {
  const v = Number(amount) || 0;
  if (v === 0 && !showZero) return null;
  const tone = v > 0 ? 'cropped-price-tag-plus' : v < 0 ? 'cropped-price-tag-minus' : 'cropped-price-tag-free';
  return <span className={`cropped-price-tag ${tone}`}>{fmtDelta(v)}</span>;
};

PriceTag.propTypes = { amount: PropTypes.number, showZero: PropTypes.bool };

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function MaterialsColorsPanel({ state, onChangeState, completedSections, setCompletedSections, onNext, onChangeView }) {
  const [activeSection, setActiveSection] = useState('style');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ── SINGLE-COMMIT price folding ──────────────────────────────────────────
  // Har change ke saath price USI update me recompute hoti hai — priced aur
  // non-priced option ab bilkul ek jaise (ek hi update), koi double-update nahi.
  const commit = React.useCallback((updater) => {
    onChangeState((p) => {
      const base = typeof updater === 'function' ? updater(p) : { ...p, ...updater };
      const { lines: _pl, total: _pt } = getPriceBreakdown(base);
      return { ...base, totalPrice: _pt, priceBreakdown: _pl };
    });
  }, [onChangeState]);


  useEffect(() => {
    if (!completedSections.collar && state.collarColor?.name !== 'White') {
      commit(prev => ({ ...prev, collarColor: { name: 'White', hex: '#ffffff' } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── live price ──
  const { lines, total } = useMemo(() => getPriceBreakdown(state), [state]);
  const groupTotal = (g) => lines.filter((l) => l.group === g).reduce((s, l) => s + l.amount, 0);

  // price ab har commit() me fold hoti hai — koi alag write-back effect nahi.

  const toggleSection = (section) => setActiveSection(activeSection === section ? '' : section);

  const markDone = (key) =>
    setCompletedSections(prev => prev[key] ? prev : { ...prev, [key]: true });

  const setJacketStyle = (style) => {
    const sleeveMap = {
      'Melton Wool': 'Melton Wool',
      'Satin': 'Satin',
      'Leather': 'Cowhide Leather',
      'Cotton Fleece': 'Cotton Fleece',
      'Polyster Satin': 'Polyster Satin',
      'Cotton Twill': 'Cotton Twill',
      'Softshell': 'Softshell',
      'Nylon': 'Nylon',
    };

    commit(prev => ({
      ...prev,
      style,
      bodyMaterial: style,
      sleeveMaterial: sleeveMap[style],
    }));

    markDone('style');
  };

  // ── Section header (now shows the section subtotal) ──
  const sectionHeader = (key, number, title, summary) => {
    const sub = groupTotal(key);
    return (
      <button onClick={() => toggleSection(key)} className="cropped-section-header" type="button">
        <div className="cropped-section-header-left">
          {/* <div className={`cropped-section-number ${completedSections[key] ? 'cropped-section-number-completed' : 'cropped-section-number-pending'}`}>
            {completedSections[key]
              ? <Check size={10} className="cropped-check-icon" />
              : <span className="cropped-number-text">{number}</span>}
          </div> */}
          <div>
            <h3 className="cropped-section-title">{title}</h3>
            {/* <p className="cropped-section-status">
              {completedSections[key]
                ? <span className="cropped-status-completed">{summary}</span>
                : <span className="cropped-status-pending">Pending</span>}
            </p> */}
          </div>
        </div>
        <div className="cropped-section-header-right">
          {sub !== 0 && <span className="cropped-section-subtotal">{fmtMoney(sub)}</span>}
          <ChevronDown size={16} className={`cropped-section-chevron ${activeSection === key ? 'cropped-section-chevron-active' : ''}`} />
        </div>
      </button>
    );
  };

  // ── Color grid (premium colours show a fee dot + tooltip) ──
  const ColorGrid = ({ colors, currentName, onSelect, small = false }) => (
    <div className={small ? 'cropped-color-grid-small' : 'cropped-color-grid'}>
      {colors.map((color) => {
        const fee = colorFee(color);
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => onSelect(color)}
            className={`${small ? 'cropped-color-btn-small' : 'cropped-color-btn'}${fee ? ' cropped-color-btn-premium' : ''}`}
            style={{ backgroundColor: color.hex }}
            title={fee ? `${color.name} — ${fmtDelta(fee)}` : `${color.name} — Included`}
            aria-label={fee ? `${color.name}, extra ${fmtMoney(fee)}` : color.name}
          >
            {currentName === color.name && (
              <span className={small ? 'cropped-color-check-small' : 'cropped-color-check-inner'}>
                <Check size={small ? 8 : 10} className={small ? 'cropped-color-check-icon-small' : 'cropped-color-check-icon-inner'} />
              </span>
            )}
            {fee > 0 && <span className="cropped-color-fee-dot" aria-hidden="true">{CURRENCY}</span>}
          </button>
        );
      })}
    </div>
  );

  // ── Material buttons (price aware) ──
  const MaterialBtns = ({ materials, current, onChange, priceMap }) => (
    <div className="cropped-material-btns">
      {materials.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`cropped-material-btn ${current === m ? 'cropped-material-btn-active' : 'cropped-material-btn-inactive'}`}
        >
          <span className="cropped-btn-label">{m}</span>
          {priceMap && <PriceTag amount={priceMap[m] ?? 0} />}
        </button>
      ))}
    </div>
  );

  // Convenience values for previews
  const pocketPreviewHex = state.pocketColor?.hex || '#8A8378';
  const pocketStyle = state.pocketStyle || 'Slash';

  const getSleeveMaterials = (bodyMaterial) => {
    switch (bodyMaterial) {
      case 'Melton Wool':
        return ['Melton Wool', 'Faux Leather', 'Cowhide Leather', 'Sheep Leather'];
      case 'Leather':
        return ['Faux Leather', 'Sheep Leather', 'Cowhide Leather'];
      case 'Satin':
        return ['Satin'];
      case 'Cotton Fleece':
        return ['Cotton Fleece'];
      case 'Polyster Satin':
        return ['Polyster Satin'];
      case 'Cotton Twill':
        return ['Cotton Twill'];
      case 'Softshell':
        return ['Softshell'];
      case 'Nylon':
        return ['Nylon'];
      default:
        return [];
    }
  };

  return (
    <div className="cropped-materials-container">

      {/* ── 2. JACKET BODY ── */}
      <div className="cropped-section-card">
        {sectionHeader('body', 2, 'Jacket Body', `${state.bodyMaterial} — ${state.bodyColor?.name || 'Black'}`)}
        {activeSection === 'body' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Material</h4>
              <div className="cropped-style-grid">
                {[
                  { key: 'Melton Wool', desc: 'Standard collar jacket' },
                  { key: 'Satin',       desc: 'Lightweight & durable' },
                  { key: 'Leather',     desc: 'Lightweight & durable' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setJacketStyle(item.key)}
                    className={`cropped-style-card ${state.style === item.key ? 'cropped-style-card-active' : 'cropped-style-card-inactive'}`}
                  >
                    <div className="cropped-style-info">
                      <h4 className="cropped-style-name">{item.key}</h4>
                      <p className="cropped-style-desc">{item.desc}</p>
                    </div>
                    <PriceTag amount={PRICING.style[item.key] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="cropped-sub-label">Color — {state.bodyColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(state.bodyMaterial)}
                currentName={state.bodyColor?.name}
                onSelect={(c) => { commit(prev => ({ ...prev, bodyColor: c })); markDone('body'); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. JACKET SLEEVES ── */}
      <div className="cropped-section-card">
        {sectionHeader('sleeves', 3, 'Jacket Sleeves', `${state.sleeveMaterial} — ${state.sleeveColor?.name || 'Black'}`)}
        {activeSection === 'sleeves' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Sleeve Material</h4>
              {state.style === 'Satin'
                ? <button className="cropped-material-btn-disabled" type="button">Satin Only<PriceTag amount={0} /></button>
                : <MaterialBtns
                    materials={getSleeveMaterials(state.style)}
                    current={state.sleeveMaterial}
                    priceMap={PRICING.sleeveMaterial}
                    onChange={(m) => {
                      commit(prev => ({ ...prev, sleeveMaterial: m, sleeveColor: prev.sleeveColor || getColorsForMaterial(m)[1] || getColorsForMaterial(m)[0] }));
                      markDone('sleeves');
                    }}
                  />
              }
            </div>

            <div>
              <h4 className="cropped-sub-label">Color — {state.sleeveColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(state.sleeveMaterial)}
                currentName={state.sleeveColor?.name}
                onSelect={(c) => { commit(prev => ({ ...prev, sleeveColor: c })); markDone('sleeves'); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 8. COLLAR STYLE ── */}
      <div className="cropped-section-card">
        {sectionHeader('collar', 8, 'Collar Style',
          `${COLLAR_STYLES?.find(c => c.id === state.collarStyle)?.name || 'Classic'} — ${state.collarColor?.name || 'white'}`
        )}
        {activeSection === 'collar' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Collar Style</h4>
              <select
                className="cropped-field-select"
                value={state.collarStyle || 'classic_standup'}
                onChange={(e) => { commit(prev => ({ ...prev, collarStyle: e.target.value })); markDone('collar'); }}
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
      <div className="cropped-section-card">
        {sectionHeader('inserts', 4, 'Shoulder Inserts',
          (state.shoulderInsertCount || 0) > 0
            ? `${['', 'Single', 'Double', 'Triple'][state.shoulderInsertCount] || state.shoulderInsertCount} — ${state.shoulderMaterial || 'Leather'}`
            : 'No inserts'
        )}
        {activeSection === 'inserts' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Number of Inserts</h4>
              <div className="cropped-material-btns">
                {[
                  { count: 0, label: 'None' },
                  { count: 1, label: 'Single' },
                  { count: 2, label: 'Double' },
                  { count: 3, label: 'Triple' },
                ].map(({ count, label }) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      commit(prev => ({
                        ...prev,
                        shoulderInsertCount: count,
                        hasShoulderInserts: count > 0,
                        shoulderMaterial: prev.shoulderMaterial || 'Leather',
                        shoulderColor: prev.shoulderColor || { name: 'Silver', hex: '#c0c0c0' },
                      }));
                      markDone('inserts');
                    }}
                    className={`cropped-material-btn ${(state.shoulderInsertCount ?? 0) === count ? 'cropped-material-btn-active' : 'cropped-material-btn-inactive'}`}
                  >
                    <span className="cropped-btn-label">{label}</span>
                    <PriceTag amount={PRICING.shoulderInsertCount[count] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            {(state.shoulderInsertCount || 0) > 0 && (
              <>


                <div>
                  <h4 className="cropped-sub-label">Insert 1 Color — {state.shoulderColor?.name || 'Silver'}</h4>
                  <ColorGrid
                    colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                    currentName={state.shoulderColor?.name}
                    onSelect={(c) => { commit(prev => ({ ...prev, shoulderColor: c })); markDone('inserts'); }}
                    small
                  />
                </div>

                {(state.shoulderInsertCount || 0) >= 2 && (
                  <div>
                    <h4 className="cropped-sub-label">Insert 2 Color — {state.shoulderColor2?.name || state.shoulderColor?.name || 'Silver'}</h4>
                    <ColorGrid
                      colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                      currentName={state.shoulderColor2?.name || state.shoulderColor?.name}
                      onSelect={(c) => { commit(prev => ({ ...prev, shoulderColor2: c })); markDone('inserts'); }}
                      small
                    />
                  </div>
                )}

                {(state.shoulderInsertCount || 0) >= 3 && (
                  <div>
                    <h4 className="cropped-sub-label">Insert 3 (Yoke) Color — {state.shoulderColor3?.name || state.shoulderColor?.name || 'Silver'}</h4>
                    <ColorGrid
                      colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
                      currentName={state.shoulderColor3?.name || state.shoulderColor?.name}
                      onSelect={(c) => { commit(prev => ({ ...prev, shoulderColor3: c })); markDone('inserts'); }}
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
      <div className="cropped-section-card">
        {sectionHeader('pockets', 5, 'Jacket Pockets',
          `${POCKET_STYLES.find(p => p.id === pocketStyle)?.label || 'Slash'} — ${state.pocketMaterial || 'Leather'} — ${state.pocketColor?.name || 'Black'}`
        )}
        {activeSection === 'pockets' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Pocket Style</h4>
              <div className="cropped-picker-row">
                {POCKET_STYLES.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => {
                      commit(prev => ({ ...prev, pocketStyle: ps.id }));
                      markDone('pockets');
                    }}
                    className={`cropped-picker-card ${pocketStyle === ps.id ? 'cropped-picker-card-active' : ''}`}
                  >
                    {ps.preview(pocketPreviewHex)}
                    <span className="cropped-picker-label">{ps.label}</span>
                    <PriceTag amount={PRICING.pocketStyle[ps.id] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="cropped-sub-label">Material</h4>
              {state.style === 'Satin'
                ? <button className="cropped-material-btn-disabled" type="button">Satin Only<PriceTag amount={0} /></button>
                : <MaterialBtns
                    materials={['Wool', 'Leather', 'Vinyl']}
                    current={state.pocketMaterial}
                    priceMap={PRICING.pocketMaterial}
                    onChange={(m) => {
                      commit(prev => ({ ...prev, pocketMaterial: m, pocketColor: prev.pocketColor || getColorsForMaterial(m)[1] || getColorsForMaterial(m)[0] }));
                      markDone('pockets');
                    }}
                  />
              }
            </div>

            <div>
              <h4 className="cropped-sub-label">Pocket Color — {state.pocketColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={getColorsForMaterial(state.pocketMaterial)}
                currentName={state.pocketColor?.name}
                onSelect={(c) => { commit(prev => ({ ...prev, pocketColor: c })); markDone('pockets'); }}
                small
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 6. KNIT TRIM STYLE ── */}
      <div className="cropped-section-card">
        {sectionHeader('knit', 6, 'Knit Trim',
          `${KNIT_STYLES.find(k => k.id === state.knitStyle)?.label || 'Simple Knit'} — ${state.knitBaseColor?.name || 'Black'}`
        )}
        {activeSection === 'knit' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Pattern</h4>
              <div className="cropped-material-btns">
                {KNIT_STYLES.map((ks) => (
                  <button
                    key={ks.id}
                    type="button"
                    onClick={() => {
                      commit(prev => ({ ...prev, knitStyle: ks.id }));
                      markDone('knit');
                    }}
                    className={`cropped-material-btn ${state.knitStyle === ks.id ? 'cropped-material-btn-active' : 'cropped-material-btn-inactive'}`}
                  >
                    <span className="cropped-btn-label">{ks.label}</span>
                    <PriceTag amount={PRICING.knitStyle[ks.id] ?? 0} />
                  </button>
                ))}
              </div>
            </div>

            {/* Base Color — knitBaseColor (jk-knit-base) */}
            <div>
              <h4 className="cropped-sub-label">Base Color — {state.knitBaseColor?.name || 'Black'}</h4>
              <ColorGrid
                colors={WOOL_COLORS}
                currentName={state.knitBaseColor?.name}
                onSelect={(c) => {
                  commit(prev => ({ ...prev, knitBaseColor: c }));
                  markDone('knit');
                }}
                small
              />
            </div>

            {/* Stripe Color — knitLineColor (jk-knit-line) */}
            {state.knitStyle && state.knitStyle !== 'Plain Knit' && state.knitStyle !== 'Rainbow' && (
              <div>
                <h4 className="cropped-sub-label">Stripe Color — {state.knitLineColor?.name || 'Gold'}</h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitLineColor?.name}
                  onSelect={(c) => { commit(prev => ({ ...prev, knitLineColor: c })); markDone('knit'); }}
                  small
                />
              </div>
            )}

            {state.knitStyle && state.knitStyle.includes('Border') && (
              <div>
                <h4 className="cropped-sub-label">Border Color — {state.knitBorderColor?.name || 'Gold'}</h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitBorderColor?.name}
                  onSelect={(c) => { commit(prev => ({ ...prev, knitBorderColor: c })); markDone('knit'); }}
                  small
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 7. FRONT CLOSURE ── */}
      <div className="cropped-section-card">
        {sectionHeader('fasteners', 7, 'Snaps or Zipper',
          (state.snapsOrZipper === 'Zipper' ? 'Zipper' : `Snaps — ${state.snapColor?.name || 'Silver'}`)
            + (state.addZipperFlap ? ' + Flap' : '')
        )}
        {activeSection === 'fasteners' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Closure</h4>
              <div className="cropped-fasteners-btns">
                <button
                  type="button"
                  onClick={() => { commit(prev => ({ ...prev, snapsOrZipper: 'Snap' })); markDone('fasteners'); }}
                  className={`cropped-fasteners-btn ${state.snapsOrZipper !== 'Zipper' ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                >
                  <span className="cropped-btn-label">Button (Snaps)</span>
                  <PriceTag amount={PRICING.snapsOrZipper.Snap} />
                </button>
                <button
                  type="button"
                  onClick={() => { commit(prev => ({ ...prev, snapsOrZipper: 'Zipper' })); markDone('fasteners'); }}
                  className={`cropped-fasteners-btn ${state.snapsOrZipper === 'Zipper' ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                >
                  <span className="cropped-btn-label">Zipper</span>
                  <PriceTag amount={PRICING.snapsOrZipper.Zipper} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="cropped-sub-label">
                Add Flap <PriceTag amount={PRICING.addZipperFlap} />
              </h4>
              <div className="cropped-fasteners-btns">
                <button
                  type="button"
                  onClick={() => { commit(prev => ({ ...prev, addZipperFlap: true })); markDone('fasteners'); }}
                  className={`cropped-fasteners-btn ${state.addZipperFlap ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                >
                  <span className="cropped-btn-label">Yes</span>
                  <PriceTag amount={PRICING.addZipperFlap} />
                </button>
                <button
                  type="button"
                  onClick={() => { commit(prev => ({ ...prev, addZipperFlap: false })); markDone('fasteners'); }}
                  className={`cropped-fasteners-btn ${!state.addZipperFlap ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                >
                  <span className="cropped-btn-label">No</span>
                  <PriceTag amount={0} />
                </button>
              </div>

              {state.addZipperFlap && (
                <>
                  <div className="cropped-option-block">
                    <h4 className="cropped-sub-label">Flap Colour — {state.flapColor?.name || 'White'}</h4>
                    <ColorGrid
                      colors={WOOL_COLORS}
                      currentName={state.flapColor?.name}
                      onSelect={(c) => { commit(prev => ({ ...prev, flapColor: c })); markDone('fasteners'); }}
                      small
                    />
                  </div>

                  <div className="cropped-option-block">
                    <h4 className="cropped-sub-label">Flap Height</h4>
                    <div className="cropped-material-btns">
                      {[
                        { label: 'Short',    value: 0.85 },
                        { label: 'Standard', value: 1 },
                        { label: 'Tall',     value: 1.25 },
                      ].map(({ label, value }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { commit(prev => ({ ...prev, flapHeightScale: value })); markDone('fasteners'); }}
                          className={`cropped-material-btn ${(state.flapHeightScale || 1) === value ? 'cropped-material-btn-active' : 'cropped-material-btn-inactive'}`}
                        >
                          <span className="cropped-btn-label">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {state.snapsOrZipper !== 'Zipper' && (
              <div>
                <h4 className="cropped-sub-label">Snap Colour — {state.snapColor?.name || 'Silver'}</h4>
                <ColorGrid
                  colors={LEATHER_COLORS}
                  currentName={state.snapColor?.name}
                  onSelect={(c) => { commit(prev => ({ ...prev, snapColor: c })); markDone('fasteners'); }}
                  small
                />
              </div>
            )}


          </div>
        )}
      </div>

      {/* ── 9. INSIDE LINING ── */}
      <div className="cropped-section-card">
        {sectionHeader('lining', 9, 'Inside Lining',
          `${state.innerLining === 'Quilted' ? 'Quilted' : state.innerLining === 'Lightweight' ? 'Lightweight' : 'None'} — ${state.innerLiningColor?.name || 'Red'} Satin`
        )}
        {activeSection === 'lining' && (
          <div className="cropped-section-content">
            <div>
              <h4 className="cropped-sub-label">Lining Type</h4>
              <select
                className="cropped-field-select"
                value={state.innerLining || 'Quilted'}
                onChange={(e) => {
                  commit(prev => ({ ...prev, innerLining: e.target.value }));
                  markDone('lining');
                  // ⚠️ NEW: lining type choose karte hi preview seedha "Lining"
                  // view par switch ho jaati hai (agar "No Lining" na chuna ho).
                  if (e.target.value !== 'None' && typeof onChangeView === 'function') {
                    onChangeView('Lining');
                  }
                }}
              >
                <option value="Quilted">Quilted — {fmtDelta(PRICING.innerLining.Quilted)}</option>
                <option value="Lightweight">Plane — {fmtDelta(PRICING.innerLining.Lightweight)}</option>
              </select>


            </div>

            {state.innerLining !== 'None' && (
              <div>
                <h4 className="cropped-sub-label">Lining Colour — {state.innerLiningColor?.name || 'Red'}</h4>
                <ColorGrid
                  colors={SATIN_COLORS}
                  currentName={state.innerLiningColor?.name}
                  onSelect={(c) => {
                    commit(prev => ({ ...prev, innerLiningColor: c }));
                    markDone('lining');
                    // Color badalte hi bhi preview "Lining" view par le aao,
                    // taake naya rang turant dikhe.
                    if (typeof onChangeView === 'function') onChangeView('Lining');
                  }}
                  small
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 10. ADVANCED OPTIONS ── */}
      <div className="cropped-section-card">
        {sectionHeader('advanced', 10, 'Advanced Options',
          ([
            state.cuffStyle === 'Pro' ? 'Pro Cuff' : 'Knit Cuff',
            state.addChestPocket ? 'Chest Pkt' : null,
            state.addSleeveStripe ? 'Sleeve Stripe' : null,
            state.addPocketPiping ? 'Pkt Piping' : null,
            state.addShoulderPiping ? 'Shldr Piping' : null,
            state.addStripePiping ? 'Stripe Piping' : null,
          ].filter(Boolean).join(' — ')) || 'None'
        )}
        {activeSection === 'advanced' && (
          <div className="cropped-section-content">


            {[
              { key: 'addChestPocket',    label: 'Add Chest Pocket',    colorKey: 'chestPocketColor',    defName: 'Silver' },
              { key: 'addSleeveStripe',   label: 'Add Sleeve Stripe',   colorKey: 'sleeveStripeColor',   defName: 'Gold' },
              // { key: 'addPocketPiping',   label: 'Add Pocket Piping',   colorKey: 'pocketPipingColor',   defName: 'Gold' },
              { key: 'addShoulderPiping', label: 'Add Shoulder Piping', colorKey: 'shoulderPipingColor', defName: 'Gold' },

            ].map(({ key, label, colorKey, defName }) => (
              <div key={key} className="cropped-option-block">
                <h4 className="cropped-sub-label">
                  {label} <PriceTag amount={PRICING.toggles[key]} />
                </h4>
                <div className="cropped-fasteners-btns">
                  <button
                    type="button"
                    onClick={() => { commit(prev => ({ ...prev, [key]: true })); markDone('advanced'); }}
                    className={`cropped-fasteners-btn ${state[key] ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                  >
                    <span className="cropped-btn-label">Yes</span>
                    <PriceTag amount={PRICING.toggles[key]} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { commit(prev => ({ ...prev, [key]: false })); markDone('advanced'); }}
                    className={`cropped-fasteners-btn ${!state[key] ? 'cropped-fasteners-btn-active' : 'cropped-fasteners-btn-inactive'}`}
                  >
                    <span className="cropped-btn-label">No</span>
                    <PriceTag amount={0} />
                  </button>
                </div>

                {state[key] && (
                  <div className="cropped-option-block">
                    <h4 className="cropped-sub-label">{label.replace('Add ', '')} Color — {state[colorKey]?.name || defName}</h4>
                    <ColorGrid
                      colors={WOOL_COLORS}
                      currentName={state[colorKey]?.name}
                      onSelect={(c) => { commit(prev => ({ ...prev, [colorKey]: c })); markDone('advanced'); }}
                      small
                    />
                  </div>
                )}
              </div>
            ))}

            <p className="cropped-hint-text">
              Each option has its own colour and shows on the front view. Turn an option on to reveal its colour picker.
            </p>
          </div>
        )}
      </div>

      {/* ── PRICE SUMMARY + NEXT ── */}
      {(() => {
        const required = ['style', 'body', 'sleeves', 'fasteners', 'knit', 'lining'];
        const pending = required.filter(k => !completedSections[k]);
        const isLocked = pending.length > 0;
        const stepMap = {
          style: 'Style', body: 'Jacket Body', sleeves: 'Jacket Sleeves',
          fasteners: 'Snaps or Zipper', knit: 'Knit Trim', lining: 'Inside Lining',
        };
        return (
          <div className="cropped-lock-section">
            <button
              type="button"
              onClick={onNext}
              className="cropped-next-btn cropped-next-btn-active"
            >
              <span>Continue to design &amp; patches</span>
              <span className="cropped-next-btn-price">{fmtMoney(total)}</span>
            </button>
          </div>
        );
      })()}
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