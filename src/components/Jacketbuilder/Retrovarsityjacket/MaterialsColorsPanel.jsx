/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MaterialsColorsPanel.jsx — Updated:
 * 1. Knit Style visual selector (Simple Knit / Single Knit Line / Two Line Knit / Feathering / Border Knit / Rainbow)
 * 2. Front Closure: Button (Snaps) vs Zipper
 * 3. Add Flap toggle — only when Zipper selected
 * 4. Inside Lining dropdown (Quilted / Lightweight / None)
 * 5. Add 1/2 Zipout Lining checkbox
 * 6. Shoulder Inserts: 0 / 1 / 2 / 3 count selector
 * 7. 'Border Knit' style ...
 * 8. NEW: Pocket STYLE visual selector (Slash / Flap / Snap / Straight / Welt / Zipper).
 *    Writes `state.pocketStyle`. The chosen style renders on the Front view in
 *    JacketVisualPreview.jsx and is recolored live with `state.pocketColor`.
 *
 * STATE KEYS (match JacketVisualPreview exactly):
 *   pocketStyle          — 'Slash' | 'Flap' | 'Snap' | 'Straight' | 'Welt' | 'Zipper'
 *   pocketMaterial       — 'Wool' | 'Leather' | 'Vinyl' | 'Satin'
 *   pocketColor          — { name, hex }
 *   shoulderInsertCount  — number 0|1|2|3
 *   knitStyle            — string id
 *   knitBaseColor        — { name, hex }
 *   knitLineColor        — { name, hex }
 *   knitFeatheringColor  — { name, hex }
 *   snapsOrZipper        — 'Snap' | 'Zipper'
 *   snapColor            — { name, hex }
 *   addZipperFlap        — boolean
 */

import React, { useState } from 'react';
import { ChevronDown, Check, Lock, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';
import './MaterialsColorsPanel.css';
import { COLLAR_STYLES } from './DesignPatchesPanel.jsx';

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
// `id` matches the pocketStyle keys read by JacketVisualPreview.jsx.
// `preview` draws a tiny illustration of the pocket in the chosen pocket color.

const POCKET_STYLES = [
  {
    id: 'Slash',
    label: 'Slash',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <line x1="12" y1="10" x2="20" y2="30" stroke={hex} strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="10" x2="20" y2="30" stroke={hex} strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'Flap',
    label: 'Flap',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <polygon points="10,12 30,12 26,24 14,24" fill={hex} stroke="#cacae8" strokeWidth="1" />
        <circle cx="20" cy="22" r="2.4" fill="#9ca1a4" />
      </svg>
    ),
  },
  {
    id: 'Snap',
    label: 'Snap',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <polygon points="12,10 28,26 24,30 8,14" fill={hex} stroke="#cacae8" strokeWidth="1" />
        <circle cx="18" cy="20" r="2.6" fill="#9ca1a4" />
      </svg>
    ),
  },
  {
    id: 'Straight',
    label: 'Straight',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <rect x="14" y="8" width="6" height="24" rx="1" fill={hex} stroke="#cacae8" strokeWidth="1" />
        <rect x="22" y="8" width="6" height="24" rx="1" fill={hex} stroke="#cacae8" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'Welt',
    label: 'Welt',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <rect x="10" y="17" width="20" height="6" rx="2" fill={hex} stroke="#cacae8" strokeWidth="1" transform="rotate(-18 20 20)" />
      </svg>
    ),
  },
  {
    id: 'Zipper',
    label: 'Zipper',
    preview: (hex) => (
      <svg viewBox="0 0 40 40" width={38} height={38}>
        <rect x="17" y="9" width="6" height="22" rx="3" fill={hex} stroke="#cacae8" strokeWidth="1" transform="rotate(-20 20 20)" />
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
    label: 'Simple Knit',
    preview: (baseHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 4 }} />
    ),
  },
  {
    id: 'Single Stripe',
    label: 'Single Knit Line',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 6, background: lineHex || '#d4af37', transform: 'translateY(-50%)' }} />
      </div>
    ),
  },
  {
    id: 'Double Stripe',
    label: 'Two Line Knit',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div style={{ height: 5, background: lineHex || '#d4af37' }} />
        <div style={{ height: 5, background: lineHex || '#d4af37' }} />
      </div>
    ),
  },

  {
    id: 'Single Stripe Border',
    label: 'Single Line with Border Knit',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3px 0' }}>
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
        <div style={{ height: 5, background: lineHex || '#d4af37', margin: '0 4px' }} />
        <div style={{ height: 3, background: lineHex || '#d4af37' }} />
      </div>
    ),
  },

  {
    id: 'Double Stripe Border',
    label: 'Two Lines with Border Knit',
    preview: (baseHex, lineHex) => (
      <div style={{ width: 40, height: 30, background: baseHex || '#374151', borderRadius: 4, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3px 0' }}>
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
      <div style={{ width: 40, height: 30, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {['#dc2626', '#d4af37', '#2563eb', '#7c3aed'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
    ),
  },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function MaterialsColorsPanel({ state, onChangeState, completedSections, setCompletedSections, onNext }) {
  const [activeSection, setActiveSection] = useState('style');

  const toggleSection = (section) => setActiveSection(activeSection === section ? '' : section);

  const markDone = (key) =>
    setCompletedSections(prev => prev[key] ? prev : { ...prev, [key]: true });

const setJacketStyle = (style) => {
  const sleeveMap = {
    'Melton Wool': 'Melton Wool',
    'Cotton Fleece': 'Cotton Fleece',
    'Polyster Satin': 'Polyster Satin',
    'Cotton Twill': 'Cotton Twill',
    'Softshell': 'Softshell',
    'Nylon': 'Nylon',
  };

  onChangeState(prev => ({
    ...prev,
    style,

    bodyMaterial: style,
    sleeveMaterial: sleeveMap[style]
  }));

  markDone('style');
};

  // ── Section header ──
  const sectionHeader = (key, number, title, summary) => (
    <button onClick={() => toggleSection(key)} className="matcol-section-header" type="button">
      <div className="matcol-section-header-left">
        <div className={`matcol-section-number ${completedSections[key] ? 'matcol-section-number-completed' : 'matcol-section-number-pending'}`}>
          {completedSections[key]
            ? <Check size={12} className="matcol-check-icon" />
            : <span className="matcol-number-text">{number}</span>}
        </div>
        <div>
          <h3 className="matcol-section-title">{title}</h3>
          <p className="matcol-section-status">
            {completedSections[key]
              ? <span className="matcol-status-completed">✓ {summary}</span>
              : <span className="matcol-status-pending">● Pending</span>}
          </p>
        </div>
      </div>
      <ChevronDown size={18} className={`matcol-section-chevron ${activeSection === key ? 'matcol-section-chevron-active' : ''}`} />
    </button>
  );

  // ── Color grid ──
  const ColorGrid = ({ colors, currentName, onSelect, small = false }) => (
    <div className={small ? 'matcol-color-grid-small' : 'matcol-color-grid'}>
      {colors.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onSelect(color)}
          className={small ? 'matcol-color-btn-small' : 'matcol-color-btn'}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        >
          {currentName === color.name && (
            <div className={small ? 'matcol-color-check-small' : 'matcol-color-check-inner'}>
              <Check size={small ? 8 : 10} className={small ? 'matcol-color-check-icon-small' : 'matcol-color-check-icon-inner'} />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  // ── Material buttons ──
  const MaterialBtns = ({ materials, current, onChange }) => (
    <div className="matcol-material-btns">
      {materials.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`matcol-material-btn ${current === m ? 'matcol-material-btn-active' : 'matcol-material-btn-inactive'}`}
        >
          {m}
        </button>
      ))}
    </div>
  );

  // Convenience values for previews
  const baseHex    = state.knitBaseColor?.hex    || '#374151';
  const lineHex    = state.knitLineColor?.hex    || '#d4af37';
  const featherHex = state.knitFeatheringColor?.hex || '#ffffff';
  const pocketPreviewHex = state.pocketColor?.hex || '#9ca1a4';
  const pocketStyle = state.pocketStyle || 'Slash';

  const getSleeveMaterials = (bodyMaterial) => {
  switch (bodyMaterial) {
    case 'Melton Wool':
      return [
        'Melton Wool',
        'Faux Leather',
        'Cowhide Leather',
        'Sheep Leather'
      ];

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
    <div className="matcol-container">


      {/* ── 2. JACKET BODY ── */}
      <div className="matcol-section-card">
        {sectionHeader('body', 2, 'Jacket Body', `${state.bodyMaterial} • ${state.bodyColor?.name || 'Black'}`)}
        {activeSection === 'body' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Material</h4>
            <div className="matcol-section-content matcol-style-grid">
            {[
              { key: 'Melton Wool',     desc: 'Standard collar jacket' },
              { key: 'Cotton Fleece',   desc: 'Soft fleece interior' },
              { key: 'Polyster Satin',  desc: 'Lightweight & durable' },
              { key: 'Cotton Twill',    desc: 'Comes with active hood' },
              { key: 'Softshell',       desc: 'Weather-resistant shell' },
              { key: 'Nylon',           desc: 'Lightweight & durable' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setJacketStyle(item.key)}
                className={`matcol-style-card ${state.style === item.key ? 'matcol-style-card-active' : 'matcol-style-card-inactive'}`}
              >
                <div className="matcol-style-info">
                  <h4 className="matcol-style-name">{item.key}</h4>
                  <p className="matcol-style-desc">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
            <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>Color ({state.bodyColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={getColorsForMaterial(state.bodyMaterial)}
              currentName={state.bodyColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, bodyColor: c })); markDone('body'); }}
            />
          </div>
        )}
      </div>

      {/* ── 3. JACKET SLEEVES ── */}
      <div className="matcol-section-card">
        {sectionHeader('sleeves', 3, 'Jacket Sleeves', `${state.sleeveMaterial} • ${state.sleeveColor?.name || 'Black'}`)}
        {activeSection === 'sleeves' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Sleeve Material</h4>
            {state.style === 'Satin'
              ? <button className="matcol-material-btn-disabled">Satin Only</button>
              : <MaterialBtns materials={getSleeveMaterials(state.style)} current={state.sleeveMaterial} onChange={(m) => {
                  onChangeState(prev => ({ ...prev, sleeveMaterial: m, sleeveColor: getColorsForMaterial(m)[1] || getColorsForMaterial(m)[0] }));
                  markDone('sleeves');
                }} />
            }
            <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>Color ({state.sleeveColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={getColorsForMaterial(state.sleeveMaterial)}
              currentName={state.sleeveColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, sleeveColor: c })); markDone('sleeves'); }}
            />
          </div>
        )}
      </div>

       {/* ── 8. COLLAR STYLE ── */}
      <div className="matcol-section-card">
        {sectionHeader('collar', 8, 'Collar Style',
          `${COLLAR_STYLES?.find(c => c.id === state.collarStyle)?.name || 'Classic'} • ${state.collarColor?.name || 'Black'}`
        )}
        {activeSection === 'collar' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Collar Style</h4>
            <select
              value={state.collarStyle || 'classic_standup'}
              onChange={(e) => { onChangeState(prev => ({ ...prev, collarStyle: e.target.value })); markDone('collar'); }}
              style={{
                width: '100%', padding: '12px 14px', backgroundColor: 'white',
                border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13,
                fontWeight: 500, color: '#0f172a', cursor: 'pointer', marginBottom: 16,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
              }}
            >
              {COLLAR_STYLES?.map((collar) => (
                <option key={collar.id} value={collar.id}>{collar.name}</option>
              ))}
            </select>

            <h4 className="matcol-sub-label">Collar Color ({state.collarColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={WOOL_COLORS}
              currentName={state.collarColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, collarColor: { name: c.name, hex: c.hex } })); markDone('collar'); }}
              small
            />
          </div>
        )}
      </div>

      {/* ── 4. SHOULDER INSERTS ── */}
      <div className="matcol-section-card">
        {sectionHeader('inserts', 4, 'Shoulder Inserts',
  (state.shoulderInsertCount || 0) > 0
    ? `${['', 'Single', 'Double', 'Triple'][state.shoulderInsertCount] || state.shoulderInsertCount} • ${state.shoulderMaterial || 'Leather'}`
    : 'No inserts'
)}
        {activeSection === 'inserts' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Number of Inserts</h4>
            <div className="matcol-material-btns">
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
                    onChangeState(prev => ({
                      ...prev,
                      shoulderInsertCount: count,           // ← exact key the preview reads
                      hasShoulderInserts: count > 0,
                      shoulderMaterial: prev.shoulderMaterial || 'Leather',
                      shoulderColor: prev.shoulderColor || { name: 'Silver', hex: '#9ca1a4' },
                    }));
                    markDone('inserts');
                  }}
                  className={`matcol-material-btn ${(state.shoulderInsertCount ?? 0) === count ? 'matcol-material-btn-active' : 'matcol-material-btn-inactive'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(state.shoulderInsertCount || 0) > 0 && (
  <>
    <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>Insert Material</h4>
    <MaterialBtns
      materials={state.style === 'Satin' ? ['Satin'] : ['Wool', 'Leather', 'Vinyl']}
      current={state.shoulderMaterial}
      onChange={(m) => {
        onChangeState(prev => ({ ...prev, shoulderMaterial: m, shoulderColor: getColorsForMaterial(m)[0] }));
        markDone('inserts');
      }}
    />

    {/* Insert 1 color — always shown when count >= 1 */}
    <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>
      Insert 1 Color ({state.shoulderColor?.name || 'Silver'})
    </h4>
    <ColorGrid
      colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
      currentName={state.shoulderColor?.name}
      onSelect={(c) => { onChangeState(prev => ({ ...prev, shoulderColor: c })); markDone('inserts'); }}
      small
    />

    {/* Insert 2 color — only when count >= 2 */}
    {(state.shoulderInsertCount || 0) >= 2 && (
      <>
        <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>
          Insert 2 Color ({state.shoulderColor2?.name || state.shoulderColor?.name || 'Silver'})
        </h4>
        <ColorGrid
          colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
          currentName={state.shoulderColor2?.name || state.shoulderColor?.name}
          onSelect={(c) => { onChangeState(prev => ({ ...prev, shoulderColor2: c })); markDone('inserts'); }}
          small
        />
      </>
    )}

    {/* Insert 3 color — only when count >= 3 */}
    {(state.shoulderInsertCount || 0) >= 3 && (
      <>
        <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>
          Insert 3 (Yoke) Color ({state.shoulderColor3?.name || state.shoulderColor?.name || 'Silver'})
        </h4>
        <ColorGrid
          colors={getColorsForMaterial(state.shoulderMaterial || 'Leather')}
          currentName={state.shoulderColor3?.name || state.shoulderColor?.name}
          onSelect={(c) => { onChangeState(prev => ({ ...prev, shoulderColor3: c })); markDone('inserts'); }}
          small
        />
      </>
    )}
  </>
)}
          </div>
        )}
      </div>

      {/* ── 5. JACKET POCKETS ── */}
      <div className="matcol-section-card">
        {sectionHeader('pockets', 5, 'Jacket Pockets',
          `${POCKET_STYLES.find(p => p.id === pocketStyle)?.label || 'Slash'} • ${state.pocketMaterial || 'Leather'} • ${state.pocketColor?.name || 'Black'}`
        )}
        {activeSection === 'pockets' && (
          <div className="matcol-section-content">
            {/* Pocket style visual cards — the chosen style renders on the Front
                view of the preview and is recolored with the pocket color below. */}
            <h4 className="matcol-sub-label">Pocket Style</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {POCKET_STYLES.map((ps) => (
                <button
                  key={ps.id}
                  type="button"
                  onClick={() => {
                    onChangeState(prev => ({ ...prev, pocketStyle: ps.id }));
                    markDone('pockets');
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 8px',
                    border: pocketStyle === ps.id ? '2px solid #7c5cbf' : '2px solid #e2e8f0',
                    borderRadius: 10,
                    background: pocketStyle === ps.id ? '#f3f0ff' : '#fff',
                    cursor: 'pointer', minWidth: 62,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ps.preview(pocketPreviewHex)}
                  <span style={{ fontSize: 10, color: '#374151', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                    {ps.label}
                  </span>
                </button>
              ))}
            </div>

            <h4 className="matcol-sub-label">Material</h4>
            {state.style === 'Satin'
              ? <button className="matcol-material-btn-disabled">Satin Only</button>
              : <MaterialBtns materials={['Wool', 'Leather', 'Vinyl']} current={state.pocketMaterial} onChange={(m) => {
                  onChangeState(prev => ({ ...prev, pocketMaterial: m, pocketColor: getColorsForMaterial(m)[1] || getColorsForMaterial(m)[0] }));
                  markDone('pockets');
                }} />
            }
            <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>Pocket Color ({state.pocketColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={getColorsForMaterial(state.pocketMaterial)}
              currentName={state.pocketColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, pocketColor: c })); markDone('pockets'); }}
              small
            />
          </div>
        )}
      </div>

      {/* ── 6. KNIT TRIM STYLE ── */}
      <div className="matcol-section-card">
        {sectionHeader('knit', 6, 'Knit Trim Pattern',
          `${KNIT_STYLES.find(k => k.id === state.knitStyle)?.label || 'Simple Knit'} • ${state.knitBaseColor?.name || 'Black'}`
        )}
        {activeSection === 'knit' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Knit Style</h4>

            {/* Visual style cards — live preview with current colors.
                This also drives the collar overlay in JacketVisualPreview.jsx,
                so picking a rib style here changes the collar to match. */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {KNIT_STYLES.map((ks) => (
                <button
                  key={ks.id}
                  type="button"
                  onClick={() => {
                    onChangeState(prev => ({ ...prev, knitStyle: ks.id }));
                    markDone('knit');
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 10px',
                    border: state.knitStyle === ks.id ? '2px solid #7c5cbf' : '2px solid #e2e8f0',
                    borderRadius: 10,
                    background: state.knitStyle === ks.id ? '#f3f0ff' : '#fff',
                    cursor: 'pointer', minWidth: 60,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ks.preview(baseHex, lineHex, featherHex)}
                  <span style={{ fontSize: 10, color: '#374151', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                    {ks.label}
                  </span>
                </button>
              ))}
            </div>

            {state.knitStyle && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#7c5cbf', fontWeight: 600 }}>
                  {KNIT_STYLES.find(k => k.id === state.knitStyle)?.label || state.knitStyle}
                </span>
              </div>
            )}

            {/* Base color — always shown */}
            <h4 className="matcol-sub-label">Base Color ({state.knitBaseColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={WOOL_COLORS}
              currentName={state.knitBaseColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, knitBaseColor: c })); markDone('knit'); }}
              small
            />

            {/* Stripe / rib / border color — shown for every non-plain, non-rainbow style,
                which now includes Border Knit. This single color also feeds the collar
                overlay automatically. */}
            {state.knitStyle && state.knitStyle !== 'Plain Knit' && state.knitStyle !== 'Rainbow' && (
              <>
                <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>
                  {state.knitStyle === 'Border Knit' ? 'Border Color' : 'Stripe Color'} ({state.knitLineColor?.name || 'Gold'})
                </h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitLineColor?.name}
                  onSelect={(c) => { onChangeState(prev => ({ ...prev, knitLineColor: c })); markDone('knit'); }}
                  small
                />
              </>
            )}

            {/* Feathering accent — only for feathering */}
            {state.knitStyle === 'Two Stripes With Feathering' && (
              <>
                <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>
                  Feathering Accent ({state.knitFeatheringColor?.name || 'White'})
                </h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.knitFeatheringColor?.name}
                  onSelect={(c) => { onChangeState(prev => ({ ...prev, knitFeatheringColor: c })); markDone('knit'); }}
                  small
                />
              </>
            )}

            {/* Collar color in knit section */}
            <h4 className="matcol-sub-label" style={{ marginTop: 12 }}>Collar Color ({state.collarColor?.name || 'Black'})</h4>
            <ColorGrid
              colors={WOOL_COLORS}
              currentName={state.collarColor?.name}
              onSelect={(c) => { onChangeState(prev => ({ ...prev, collarColor: { name: c.name, hex: c.hex } })); markDone('collar'); }}
              small
            />
            {state.knitStyle && state.knitStyle !== 'Plain Knit' && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                The collar now renders with the same "{KNIT_STYLES.find(k => k.id === state.knitStyle)?.label}" knit pattern shown above.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 7. FRONT CLOSURE ── */}
      <div className="matcol-section-card">
        {sectionHeader('fasteners', 7, 'Front Closure',
          state.snapsOrZipper === 'Zipper'
            ? `Zipper${state.addZipperFlap ? ' + Flap' : ''}`
            : `Button Snaps (${state.snapColor?.name || 'Silver'})`
        )}
        {activeSection === 'fasteners' && (
          <div className="matcol-section-content">
            {/* Button vs Zipper toggle */}
            <div className="matcol-fasteners-btns" style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { onChangeState(prev => ({ ...prev, snapsOrZipper: 'Snap', addZipperFlap: false })); markDone('fasteners'); }}
                className={`matcol-fasteners-btn ${state.snapsOrZipper !== 'Zipper' ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
              >
                Button (Snaps)
              </button>
              <button
                type="button"
                onClick={() => { onChangeState(prev => ({ ...prev, snapsOrZipper: 'Zipper' })); markDone('fasteners'); }}
                className={`matcol-fasteners-btn ${state.snapsOrZipper === 'Zipper' ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
              >
                Zipper
              </button>
            </div>

            {/* Snap colour — only for Snaps */}
            {state.snapsOrZipper !== 'Zipper' && (
              <>
                <h4 className="matcol-sub-label">Snap Colour ({state.snapColor?.name || 'Silver'})</h4>
                <ColorGrid
                  colors={LEATHER_COLORS}
                  currentName={state.snapColor?.name}
                  onSelect={(c) => { onChangeState(prev => ({ ...prev, snapColor: c })); markDone('fasteners'); }}
                  small
                />
              </>
            )}

            {/* Add Flap — only for Zipper */}
            {state.snapsOrZipper === 'Zipper' && (
              <div style={{ marginTop: 8 }}>
                <h4 className="matcol-sub-label">Add Flap (Zip + Buttons)?</h4>
                <div className="matcol-fasteners-btns">
                  <button
                    type="button"
                    onClick={() => { onChangeState(prev => ({ ...prev, addZipperFlap: true })); markDone('fasteners'); }}
                    className={`matcol-fasteners-btn ${state.addZipperFlap ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
                  >
                    Yes — Add Flap
                  </button>
                  <button
                    type="button"
                    onClick={() => { onChangeState(prev => ({ ...prev, addZipperFlap: false })); markDone('fasteners'); }}
                    className={`matcol-fasteners-btn ${!state.addZipperFlap ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
                  >
                    No Flap
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      

      {/* ── 9. INSIDE LINING ── */}
      <div className="matcol-section-card">
        {sectionHeader('lining', 9, 'Inside Lining',
          `${state.innerLining === 'Quilted' ? 'Quilted (Warm)' : state.innerLining === 'Lightweight' ? 'Lightweight' : 'None'} • ${state.innerLiningColor?.name || 'Red'} Satin`
        )}
        {activeSection === 'lining' && (
          <div className="matcol-section-content">
            <h4 className="matcol-sub-label">Lining Type</h4>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <select
                value={state.innerLining || 'Quilted'}
                onChange={(e) => { onChangeState(prev => ({ ...prev, innerLining: e.target.value })); markDone('lining'); }}
                style={{
                  width: '100%', padding: '12px 14px', backgroundColor: 'white',
                  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13,
                  fontWeight: 500, color: '#0f172a', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                }}
              >
                <option value="Quilted">Quilted (Warm)</option>
                <option value="Lightweight">Lightweight Satin</option>
                <option value="None">No Lining</option>
              </select>
            </div>

            {/* ½ Zipout Lining */}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 14px', border: '1px solid',
                borderColor: state.addZipoutLining ? '#7c5cbf' : '#e2e8f0',
                borderRadius: 10, marginBottom: 16,
                background: state.addZipoutLining ? '#f3f0ff' : '#fff',
              }}
            >
              <div
                style={{
                  width: 18, height: 18, borderRadius: 4, border: '2px solid',
                  borderColor: state.addZipoutLining ? '#7c5cbf' : '#9ca3af',
                  background: state.addZipoutLining ? '#7c5cbf' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
                onClick={() => { onChangeState(prev => ({ ...prev, addZipoutLining: !prev.addZipoutLining })); markDone('lining'); }}
              >
                {state.addZipoutLining && <Check size={11} color="#fff" />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Add ½ Zipout Lining</span>
              <span
                style={{
                  width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #9ca3af',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#6b7280', cursor: 'help', marginLeft: 'auto',
                }}
                title="A zipout lining lets you remove the inner lining for warmer weather."
              >?</span>
            </label>

            {state.innerLining !== 'None' && (
              <>
                <h4 className="matcol-sub-label">Lining Colour ({state.innerLiningColor?.name || 'Red'})</h4>
                <ColorGrid
                  colors={SATIN_COLORS}
                  currentName={state.innerLiningColor?.name}
                  onSelect={(c) => { onChangeState(prev => ({ ...prev, innerLiningColor: c })); markDone('lining'); }}
                  small
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 10. ADVANCED OPTIONS ── */}
      <div className="matcol-section-card">
        {sectionHeader('advanced', 10, 'Advanced Options',
          ([
            state.cuffStyle === 'Pro' ? 'Pro Cuff' : 'Knit Cuff',
            state.addChestPocket ? 'Chest Pkt' : null,
            state.addSleeveStripe ? 'Sleeve Stripe' : null,
            state.addPocketPiping ? 'Pkt Piping' : null,
            state.addShoulderPiping ? 'Shldr Piping' : null,
            state.addStripePiping ? 'Stripe Piping' : null,
          ].filter(Boolean).join(' • ')) || 'None'
        )}
        {activeSection === 'advanced' && (
          <div className="matcol-section-content">
            {/* Cuff style */}
            <h4 className="matcol-sub-label">Cuff Style</h4>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <select
                value={state.cuffStyle || 'Classic'}
                onChange={(e) => { onChangeState(prev => ({ ...prev, cuffStyle: e.target.value })); markDone('advanced'); }}
                style={{
                  width: '100%', padding: '12px 14px', backgroundColor: 'white',
                  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13,
                  fontWeight: 500, color: '#0f172a', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                }}
              >
                <option value="Classic">Classic Knit Cuff</option>
                <option value="Pro">Pro Cuff</option>
              </select>
            </div>

            {/* Pro cuff color — only when Pro selected */}
            {state.cuffStyle === 'Pro' && (
              <>
                <h4 className="matcol-sub-label">Pro Cuff Color ({state.proCuffColor?.name || 'Black'})</h4>
                <ColorGrid
                  colors={WOOL_COLORS}
                  currentName={state.proCuffColor?.name}
                  onSelect={(c) => { onChangeState(prev => ({ ...prev, proCuffColor: c })); markDone('advanced'); }}
                  small
                />
              </>
            )}

            {/* Yes/No toggles — each renders on the Front preview, each with its own color */}
            {[
              { key: 'addChestPocket',    label: 'Add Chest Pocket',    colorKey: 'chestPocketColor',    defName: 'Silver' },
              { key: 'addSleeveStripe',   label: 'Add Sleeve Stripe',   colorKey: 'sleeveStripeColor',   defName: 'Gold' },
              { key: 'addPocketPiping',   label: 'Add Pocket Piping',   colorKey: 'pocketPipingColor',   defName: 'Gold' },
              { key: 'addShoulderPiping', label: 'Add Shoulder Piping', colorKey: 'shoulderPipingColor', defName: 'Gold' },
              { key: 'addStripePiping',   label: 'Add Stripe Piping',   colorKey: 'stripePipingColor',   defName: 'Gold' },
            ].map(({ key, label, colorKey, defName }) => (
              <div key={key} style={{ marginTop: 12 }}>
                <h4 className="matcol-sub-label">{label}</h4>
                <div className="matcol-fasteners-btns">
                  <button
                    type="button"
                    onClick={() => { onChangeState(prev => ({ ...prev, [key]: true })); markDone('advanced'); }}
                    className={`matcol-fasteners-btn ${state[key] ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => { onChangeState(prev => ({ ...prev, [key]: false })); markDone('advanced'); }}
                    className={`matcol-fasteners-btn ${!state[key] ? 'matcol-fasteners-btn-active' : 'matcol-fasteners-btn-inactive'}`}
                  >
                    No
                  </button>
                </div>

                {/* Color picker — shown only when this option is enabled */}
                {state[key] && (
                  <div style={{ marginTop: 8 }}>
                    <h4 className="matcol-sub-label">{label.replace('Add ', '')} Color ({state[colorKey]?.name || defName})</h4>
                    <ColorGrid
                      colors={WOOL_COLORS}
                      currentName={state[colorKey]?.name}
                      onSelect={(c) => { onChangeState(prev => ({ ...prev, [colorKey]: c })); markDone('advanced'); }}
                      small
                    />
                  </div>
                )}
              </div>
            ))}

            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
              Each option has its own color and shows on the Front view. Turn an option on to reveal its color picker.
            </p>
          </div>
        )}
      </div>

      {/* ── LOCK / NEXT ── */}
      {(() => {
        const required = ['style', 'body', 'sleeves', 'fasteners', 'knit', 'lining'];
        const pending = required.filter(k => !completedSections[k]);
        const isLocked = pending.length > 0;
        const stepMap = {
          style: '1 (Style)', body: '2 (Body)', sleeves: '3 (Sleeves)',
          fasteners: '7 (Closure)', knit: '6 (Knit Trim)', lining: '9 (Lining)',
        };
        return (
          <div className="matcol-lock-section">
            {isLocked && (
              <div className="matcol-lock-alert">
                <AlertTriangle size={16} className="matcol-lock-alert-icon" />
                <div>
                  <h4 className="matcol-lock-alert-title">Configuration Lock Alert</h4>
                  <p className="matcol-lock-alert-text">
                    Complete required sections: <span className="matcol-lock-alert-highlight">{pending.map(k => stepMap[k]).join(', ')}</span>
                  </p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => { if (!isLocked) onNext(); }}
              disabled={isLocked}
              className={`matcol-next-btn ${isLocked ? 'matcol-next-btn-locked' : 'matcol-next-btn-active'}`}
            >
              {isLocked
                ? <><Lock size={12} className="matcol-lock-icon" /><span>Chassis Configuration Locked</span></>
                : <span>Personalize Your Jacket Now</span>
              }
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
};