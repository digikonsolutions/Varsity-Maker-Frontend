/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DesignPatchesPanel.jsx — RESTYLED to match the Materials & Colors panel
 *
 * ── CLASS PREFIX ────────────────────────────────────────────────────────────
 * DesignPatchesPanel.css ki saari classes ab `cropped-` prefix ke saath hain
 * (cropped-design-container, cropped-segment-header, cropped-color-btn …).
 * Keyframes bhi unique kar diye: cropped-design-rowOpen / cropped-design-fadeIn.
 *
 * ⚠️ NAHI badla gaya: collar SVG strings ke andar `element_select`, `st7`
 * waghera — wo raw SVG markup hai, CSS classes nahi jo is stylesheet se aati
 * hon. CSS variables (--ink, --line, --accent …) bhi waise hi hain kyunki wo
 * .cropped-design-container par scoped hain.
 *
 * Visual changes only (no logic changes):
 *  1. All inline "blue theme" styles replaced with the editorial theme used by
 *     cropped-materials-container: ink (#111111) / gold accent /
 *     Montserrat display font / Poppins body font / thin hairline borders.
 *  2. pillStyle(), FontSelector, LiveTextPreview, ColorPickerRow's selection
 *     ring, the patch-image picker, and BackLineRow now all pull their colors
 *     from the CSS custom properties defined on .cropped-design-container in
 *     DesignPatchesPanel.css, so the two panels share one visual language.
 *  3. Everything else (state shape, handlers, prop-types, font loading logic)
 *     is unchanged from the previous version.
 *
 * ── PRICING ─────────────────────────────────────────────────────────────────
 *  Every option now carries a price. Turning something on adds a line, turning
 *  it off removes it — the breakdown is derived from state, so nothing can
 *  double-count or get stuck.
 *
 *  Edit DESIGN_PRICING below to change any number. Nothing else needs touching.
 *
 *  Pushed back up through onChangeState:
 *    state.designTotalPrice      — number
 *    state.designPriceBreakdown  — [{ group, label, amount }]
 *  Per-segment `price` is still written (backwards compatible).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Check, Type, Award, Image as ImageIcon, CircleSlash2,
} from 'lucide-react';
import PropTypes from 'prop-types';
import './DesignPatchesPanel.css';

// ─── FONT FACES ───────────────────────────────────────────────────────────────
// Keep these paths in sync with /public/font/*
export const JACKET_FONT_DEFS = [
  { family: 'Jacketshop',         url: '/font/BRUSHSCI.TTF' },
  { family: 'Stahls Athletic',    url: '/font/Athletic-Regular-5.ttf' },
  { family: 'Stahls Pro Block',   url: '/font/Block.ttf' },
  { family: 'Stahls Old English', url: '/font/PirataOne-Regular.ttf' },
  { family: 'Stahls Vintage',     url: '/font/stahls-tiffany-2000.ttf' },
];

export const JACKET_FONT_FAMILIES = JACKET_FONT_DEFS.map((f) => f.family);

const FONT_STYLE_TAG_ID = 'jacket-font-faces';

// Inject once. Shares the id with JacketVisualPreview so it is never duplicated.
function injectJacketFontFaces() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_STYLE_TAG_ID)) return;

  const origin = window.location.origin;
  const css = JACKET_FONT_DEFS.map((f) => `
@font-face {
  font-family: '${f.family}';
  src: url('${origin}${f.url}') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`).join('\n');

  const style = document.createElement('style');
  style.id = FONT_STYLE_TAG_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
injectJacketFontFaces();

// Google fallback faces
const GOOGLE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Great+Vibes&family=Old+Standard+TT&display=swap';

if (typeof document !== 'undefined' && !document.querySelector(`link[href="${GOOGLE_FONT_HREF}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONT_HREF;
  document.head.appendChild(link);
}

// ─── Wait for webfonts to finish loading, then force a re-render so the small
// in-panel previews don't stay stuck on the fallback font ────────────────────
function useFontsReady(fontFamilies = JACKET_FONT_FAMILIES) {
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    injectJacketFontFaces();

    if (typeof document === 'undefined' || !document.fonts) return undefined;

    // IMPORTANT: pass ONE family name, never a full font stack.
    const safeLoad = (family) =>
      document.fonts.load(`400 32px "${family}"`).catch(() => {});

    const run = async () => {
      await Promise.all(fontFamilies.map(safeLoad));
      try {
        await document.fonts.ready;
      } catch (e) {
        /* ignore */
      }
      if (!cancelled) setGeneration((g) => g + 1);
    };
    run();

    const onLoadingDone = () => {
      if (!cancelled) setGeneration((g) => g + 1);
    };
    document.fonts.addEventListener?.('loadingdone', onLoadingDone);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener?.('loadingdone', onLoadingDone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return generation;
}

// ─── Font Config ─────────────────────────────────────────────────────────────
// `id` is the value stored in state and read back by JacketVisualPreview.
export const FONT_OPTIONS = [
  {
    id: 'Athletic', label: 'Athletic', preview: 'Athletic',
    fontFamily: '"Stahls Athletic", "Arial Black", Impact, sans-serif',
    fontWeight: 400, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0.02em',
    transform: 'none', syntheticBold: false,
  },
  {
    id: 'ProBlock', label: 'Pro Block', preview: 'PRO BLOCK',
    fontFamily: '"Stahls Pro Block", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 400, fontStyle: 'normal', textTransform: 'uppercase', extraSpacing: '0.02em',
    transform: 'none', syntheticBold: false,
  },
  {
    id: 'Script', label: 'Script', preview: 'Champions',
    fontFamily: '"Jacketshop", "Brush Script MT", cursive',
    fontWeight: 400, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0.01em',
    transform: 'none', syntheticBold: false,
  },
  {
    id: 'OldEnglish', label: 'Old English', preview: 'Old English',
    fontFamily: '"Stahls Old English", "Old English Text MT", serif',
    fontWeight: 400, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0em',
    transform: 'none', syntheticBold: false,
  },
  {
    id: 'Vintage', label: 'Vintage', preview: 'Vintage',
    fontFamily: '"Stahls Vintage", Georgia, "Times New Roman", serif',
    fontWeight: 400, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0.01em',
    transform: 'none', syntheticBold: false,
  },
];

export const DEFAULT_FONT_ID = 'Script';

// ─── Materials ───────────────────────────────────────────────────────────────
export const MATERIALS = [
  { id: 'Embroidery',   name: 'Embroidery' },
  { id: 'Chenille',     name: 'Chenille Patch' },
  { id: 'GlitterVinyl', name: 'Glitter Vinyl Patch' },
  { id: 'SportTouch',   name: 'Sport Touch Patch' },
];

// ─── Sport Touch textured swatches ───────────────────────────────────────────
export const SPORT_TOUCH_TEXTURES = [
  { id: 'softball_red',    name: 'Softball Red',    hex: '#b5451b' },
  { id: 'baseball_brown',  name: 'Baseball Brown',  hex: '#7a3b1e' },
  { id: 'white',           name: 'White',           hex: '#f4f4f4' },
  { id: 'softball_yellow', name: 'Softball Yellow', hex: '#c4d72e' },
  { id: 'olive',           name: 'Olive',           hex: '#9aa62a' },
  { id: 'mesh_white',      name: 'Mesh White',      hex: '#eeeeee' },
];

// ─── Text height presets ──────────────────────────────────────────────────────
export const TEXT_HEIGHTS = ['2"', '2.5"', '3"', '3.5"', '4"'];

// ─── Emblems ──────────────────────────────────────────────────────────────────
export const EMBLEMS = [
  { id: 'basketball',  name: 'Basketball' },
  { id: 'star_shield', name: 'Star Shield' },
  { id: 'lightning',   name: 'Lightning' },
  { id: 'music_note',  name: 'Music Note' },
];

// ─── Leather / Felt / Outline Colors ─────────────────────────────────────────
export const LEATHER_COLORS = [
  { name: 'White',         hex: '#ffffff' },
  { name: 'Champagne',     hex: '#b5a581' },
  { name: 'Silver Grey',   hex: '#949191' },
  { name: 'Vegas Gold',    hex: '#bbae7b' },
  { name: 'Bright Gold',   hex: '#e89e27' },
  { name: 'Burnt Orange',  hex: '#cb4c05' },
  { name: 'Texas Orange',  hex: '#a64011' },
  { name: 'Scarlet',       hex: '#c50202' },
  { name: 'Cardinal',      hex: '#790d0d' },
  { name: 'Old Gold',      hex: '#7b580d' },
  { name: 'Maroon',        hex: '#200000' },
  { name: 'Brown',         hex: '#241304' },
  { name: 'Light Pink',    hex: '#ce8e9b' },
  { name: 'Purple',        hex: '#36247d' },
  { name: 'Columbia Blue', hex: '#35608c' },
  { name: 'Royal',         hex: '#0730aa' },
  { name: 'Navy',          hex: '#041637' },
  { name: 'Forest Green',  hex: '#1d2921' },
  { name: 'Teal',          hex: '#023b3b' },
  { name: 'Kelly Green',   hex: '#175626' },
  { name: 'Black',         hex: '#000000' },
];

export const OUTLINE_COLORS = LEATHER_COLORS;
export const FELT_COLORS = LEATHER_COLORS;

// ═════════════════════════════════════════════════════════════════════════════
// PRICING TABLE — change the numbers here only
// ═════════════════════════════════════════════════════════════════════════════

export const CURRENCY = '$';

export const DESIGN_PRICING = {
  // Placement fee for a chest / sleeve decoration
  decorType: { None: 0, Text: 15, Emblem: 20, Patch: 25 },

  // Back panel
  backType: { None: 0, Text: 0, Patch: 35 },
  backLine: { line1: 20, line3: 15, line2: 15 },   // charged per line that has text

  // Text add-ons (apply to every text block, incl. each back line)
  font: { Athletic: 0, ProBlock: 0, Script: 6, OldEnglish: 8, Vintage: 6 },
  textHeight: { '2"': 0, '2.5"': 4, '3"': 8, '3.5"': 12, '4"': 16 },
  material: { Embroidery: 0, Chenille: 8, GlitterVinyl: 10, SportTouch: 12 },
  sportTouchTexture: 4,     // any textured swatch
  outline: 5,               // charged once an outline colour is picked
  arc: 6,                   // charged when arc is not 0
  rhinestones: 18,

  // Patch add-ons
  patchCategory: {
    None: 0,
    Year: 12,
    PositionNumber: 12,
    Academics: 18,
    Athletics: 18,
    BandMusic: 18,
    CheerDanceDrill: 18,
    CrazyWord: 16,
    CustomFlags: 22,
    FFAAnimalsRodeo: 20,
    ROTC: 20,
    WalkingPatches: 14,
  },
  patchStyle: { Chenille: 0, GlitterVinyl: 6, SportTouch: 9 },
  patchFontStyle: { Classic: 0, Crazy: 5 },
  patchClassBadge: 7,
  patchOutline: 5,
  patchRhinestones: 18,
  patchSportTouchTexture: 4,

  // Upload your own artwork
  uploadDesign: 25,
  designerNotes: 0,

  // Premium colours — charged once per place they're used
  colorSurcharge: {
    'Bright Gold': 4,
    'Vegas Gold': 4,
    'Old Gold': 4,
    Champagne: 4,
    'Silver Grey': 3,
  },
};

// ─── money helpers ───────────────────────────────────────────────────────────
export const fmtMoney = (n) =>
  `${n < 0 ? '-' : ''}${CURRENCY}${Math.abs(Number(n) || 0).toLocaleString()}`;

export const fmtDelta = (n) => {
  const v = Number(n) || 0;
  if (v === 0) return 'Included';
  return `${v > 0 ? '+' : '−'}${CURRENCY}${Math.abs(v).toLocaleString()}`;
};

const nameForHex = (hex) => LEATHER_COLORS.find((c) => c.hex === hex)?.name;
const colorFee = (hex) => DESIGN_PRICING.colorSurcharge[nameForHex(hex)] || 0;

/** Line items for one text block (chest / sleeve text, or one back line). */
function textBlockLines(v = {}, prefix = '') {
  const out = [];
  const push = (label, amount) => {
    const n = Number(amount) || 0;
    if (n !== 0) out.push({ label: `${prefix}${label}`, amount: n });
  };

  const fontId = v.font || DEFAULT_FONT_ID;
  push(`Font — ${FONT_OPTIONS.find((f) => f.id === fontId)?.label || fontId}`, DESIGN_PRICING.font[fontId] ?? 0);
  if (v.height) push(`Height — ${v.height}`, DESIGN_PRICING.textHeight[v.height] ?? 0);
  if (v.material) push(`Material — ${MATERIALS.find((m) => m.id === v.material)?.name || v.material}`, DESIGN_PRICING.material[v.material] ?? 0);
  if (v.material === 'SportTouch' && v.sportTouchTexture) push('Sport Touch texture', DESIGN_PRICING.sportTouchTexture);
  if (v.strokeColor) {
    push(`Outline — ${v.strokeColorName || nameForHex(v.strokeColor) || 'colour'}`, DESIGN_PRICING.outline);
    push('Outline premium colour', colorFee(v.strokeColor));
  }
  if (v.color) push(`Felt colour — ${v.colorName || nameForHex(v.color) || ''}`, colorFee(v.color));
  if (v.arc) push(`Arc shaping (${v.arc})`, DESIGN_PRICING.arc);
  if (v.rhinestones) push('Rhinestones', DESIGN_PRICING.rhinestones);

  return out;
}

/** Line items for one patch block. */
function patchBlockLines(v = {}, prefix = '') {
  const out = [];
  const push = (label, amount) => {
    const n = Number(amount) || 0;
    if (n !== 0) out.push({ label: `${prefix}${label}`, amount: n });
  };

  const cat = v.patchCategory || 'None';
  if (cat === 'None') return out;

  const catLabel = PATCH_CATEGORIES.find((c) => c.id === cat)?.label || cat;
  push(`Patch — ${catLabel}`, DESIGN_PRICING.patchCategory[cat] ?? 0);

  const isText = cat === 'Year' || cat === 'PositionNumber';
  if (isText) {
    const style = v.patchStyle || 'Chenille';
    push(`Patch style — ${PATCH_STYLES.find((s) => s.id === style)?.name || style}`, DESIGN_PRICING.patchStyle[style] ?? 0);
    const pf = v.patchFontStyle || 'Classic';
    push(`Patch font — ${pf}`, DESIGN_PRICING.patchFontStyle[pf] ?? 0);
    if (v.patchClassBadge) push('“Class of” badge', DESIGN_PRICING.patchClassBadge);
    if (style === 'SportTouch' && v.patchSportTouchTexture) push('Patch texture', DESIGN_PRICING.patchSportTouchTexture);
    if (v.patchOutlineColor) {
      push('Patch outline', DESIGN_PRICING.patchOutline);
      push('Patch outline premium colour', colorFee(v.patchOutlineColor));
    }
    if (v.patchFeltColor) push('Patch felt colour', colorFee(v.patchFeltColor));
    if (v.patchRhinestones) push('Patch rhinestones', DESIGN_PRICING.patchRhinestones);
  }

  return out;
}

/** Price of one chest / sleeve segment (also written to segment.price). */
export function segmentPrice(data = {}) {
  return segmentLines(data).reduce((s, l) => s + l.amount, 0);
}

function segmentLines(data = {}) {
  const type = data.type || 'None';
  if (type === 'None') return [];

  const out = [];
  if (type === 'Text') {
    if (!data.text) return [];
    out.push({ label: `Text — “${data.text}”`, amount: DESIGN_PRICING.decorType.Text });
    out.push(...textBlockLines(data));
  } else if (type === 'Emblem') {
    out.push({ label: `Emblem — ${data.patchName || 'insignia'}`, amount: DESIGN_PRICING.decorType.Emblem });
    const fee = colorFee(data.color);
    if (fee) out.push({ label: 'Emblem premium colour', amount: fee });
  } else if (type === 'Patch') {
    if (!data.patchCategory || data.patchCategory === 'None') return [];
    out.push({ label: 'Patch application', amount: DESIGN_PRICING.decorType.Patch });
    out.push(...patchBlockLines(data));
  }
  return out;
}

/** Reads the prefixed back-line keys into a normal text-value object. */
function backLineValue(back = {}, prefix) {
  return {
    text: back[`${prefix}Text`] || '',
    font: back[`${prefix}Font`],
    // ↓ ye line missing thi — isi liye pill selection reset ho jata tha
    textDirection: back[`${prefix}TextDirection`] || 'straight',
    material: back[`${prefix}Material`],
    sportTouchTexture: back[`${prefix}SportTouchTexture`],
    color: back[`${prefix}Color`] || '',
    colorName: back[`${prefix}ColorName`],
    strokeColor: back[`${prefix}StrokeColor`] || '',
    strokeColorName: back[`${prefix}StrokeColorName`],
    height: back[`${prefix}Height`],
    arc: back[`${prefix}Arc`],
    rhinestones: back[`${prefix}Rhinestones`],
  };
}

const BACK_LINES = [
  { prefix: 'line1', label: 'Line 1 (arched top)' },
  { prefix: 'line3', label: 'Line 2 (centre script)' },
  { prefix: 'line2', label: 'Line 3 (arched bottom)' },
];

/** Price of the whole back panel (also written to back.price). */
export function backPrice(back = {}) {
  return backLines(back).reduce((s, l) => s + l.amount, 0);
}

function backLines(back = {}) {
  const type = back.type || 'None';
  if (type === 'None') return [];

  const out = [];
  if (type === 'Text') {
    BACK_LINES.forEach(({ prefix, label }) => {
      const v = backLineValue(back, prefix);
      if (!v.text) return;
      out.push({ label: `${label} — “${v.text}”`, amount: DESIGN_PRICING.backLine[prefix] ?? 0 });
      out.push(...textBlockLines(v, `${label}: `));
    });
  } else if (type === 'Patch') {
    if (!back.patchCategory || back.patchCategory === 'None') return [];
    out.push({ label: 'Back patch application', amount: DESIGN_PRICING.backType.Patch });
    out.push(...patchBlockLines(back));
  }
  return out;
}

const SEGMENT_DEFS = [
  { key: 'leftChest',   label: 'Left chest' },
  { key: 'rightChest',  label: 'Right chest' },
  { key: 'leftSleeve',  label: 'Left sleeve' },
  { key: 'rightSleeve', label: 'Right sleeve' },
];

// ─── Segment → Preview view mapping ──────────────────────────────────────────
// Jab koi dropdown khulay, preview ko batata hai kaunsi view dikhani hai.
// leftChest / rightChest dono Front pe hote hain, is liye dono 'Front'.
const SEGMENT_VIEW_MAP = {
  leftChest:   'Front',
  rightChest:  'Front',
  leftSleeve:  'Left',
  rightSleeve: 'Right',
  back:        'Back',
};

/** Full breakdown for the whole design step. */
export function getDesignPriceBreakdown(state = {}) {
  const lines = [];

  SEGMENT_DEFS.forEach(({ key, label }) => {
    segmentLines(state[key]).forEach((l) => lines.push({ group: key, label: `${label}: ${l.label}`, amount: l.amount }));
  });

  backLines(state.back).forEach((l) => lines.push({ group: 'back', label: `Back: ${l.label}`, amount: l.amount }));

  if (state.uploadDesign?.file) {
    lines.push({ group: 'uploadDesign', label: 'Custom artwork setup', amount: DESIGN_PRICING.uploadDesign });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total };
}

// ─── Collar SVGs ──────────────────────────────────────────────────────────────
// ⚠️ In strings ke andar `element_select` / `st7` raw SVG classes hain — inhe
// prefix NAHI kiya, kyunki ye SVG markup ka hissa hain, hamari stylesheet ka nahi.
const CLASSIC_STANDUP_SVG = `<g><path d="M302.2,130c-0.1-0.5-0.1-1.1-0.1-1.7c0.4-13.1,28.1-34.8,40.2-43.9c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0c-9.8,6.5,0.3,12,4,14.8c12.1,9.2,39.6,30.8,40.2,43.8c0,0.6,0,1.2-0.1,1.8L302.2,130z" style="fill: rgb(0, 0, 0);" data-color-control="lining" id="XMLID_416_" class="element_select"></path> <g data-color-control="knit_base" class="element_select"><path d="M257.8,84.4c4.1,3.1,10.1,7.8,16.2,13H326c6.1-5.2,12.1-9.9,16.2-13c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0C244,76.2,254,81.6,257.8,84.4z" style="fill: rgb(255, 255, 255);"></path> <path d="M253.728,69.622 c-9.761,6.528,0.26,11.962,4.025,14.819c12.621,9.575,42.253,32.809,40.088,45.599c0,0-22.47,0.498-39.247-6.777 c-16.777-7.272-22.178-15.302-23.475-17.602c0,0,2.798-15.006,6.027-24.197c3.799-10.812,9.336-17.111,22.889-20.417 c16.341-3.992,55.591-4.023,71.934-0.031c13.551,3.304,19.089,9.605,22.889,20.418c3.228,9.188,6.06,24.226,6.06,24.226 c-1.298,2.297-6.73,10.298-23.509,17.569c-16.776,7.275-39.219,6.781-39.219,6.781c-2.167-12.79,27.441-36.024,40.062-45.603 c3.764-2.853,13.786-8.288,4.025-14.817C328.873,59.526,271.13,59.557,253.728,69.622z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g></g>`;
const OVERLAP_STANDUP_SVG = `<g><path d="M302.2,130c-0.1-0.5-0.1-1.1-0.1-1.7c0.4-13.1,28.1-34.8,40.2-43.9c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0c-9.8,6.5,0.3,12,4,14.8c12.1,9.2,39.6,30.8,40.2,43.8c0,0.6,0,1.2-0.1,1.8L302.2,130z" style="fill: rgb(0, 0, 0);" data-color-control="lining" id="XMLID_416_" class="element_select"></path> <g data-color-control="knit_base" class="element_select"><path d="M350.4,75.5c-0.1-1.7-1.2-3.6-4.1-5.5c-17.4-10.1-75.1-10-92.5,0c-2.9,1.9-4.1,3.8-4.1,5.5 c0.2,3.8,5.6,7,8.2,8.9c2,1.5,4.4,3.4,7.1,5.5c3.2,2.2,6.9,4.8,10.8,7.5h47.9c4.6-3.1,9.1-6,12.9-8.5c2.2-1.7,4.2-3.2,5.8-4.5 C344.8,82.5,350.2,79.4,350.4,75.5z" style="fill: rgb(255, 255, 255);"></path> <path d="M253.7,70c-9.8,6.5,0.3,12,4,14.8c8.9,6.8,30.8,20.4,42.2,32.3c-2.5,2.8-5.4,8.1-5.8,13 c-10.6-0.6-25.6-2.2-35.5-6.5c-16.8-7.3-22.2-15.3-23.5-17.6c0,0,2.8-15,6-24.2c3.8-10.8,9.3-17.1,22.9-20.4c16.3-4,55.6-4,71.9,0 c13.6,3.3,19.1,9.6,22.9,20.4c3.2,9.2,6.1,24.2,6.1,24.2c-1.3,2.3-6.7,10.3-23.5,17.6c-16.8,7.3-47.2,6.8-47.2,6.8 c0-17.7,35.4-36,48.1-45.6c3.8-2.9,13.8-8.3,4-14.8C328.9,59.9,271.1,60,253.7,70z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);" id="XMLID_1791_" class="st7"></path></g></g>`;
const PRO_SHIRT_COLLAR_SVG = `<g data-color-control="collar_outside" class="element_select"><path d="M341.2,100.9c0.2-0.3,0.7-0.8,1.3-1.7c3.1-7.2,4.6-14.6,3-21.9c-0.8-2.4-2-3.8-3.1-4.1 c-1.7-0.5-8.7,1-16.5,1.4c-11.9,0.5-39.5,0.5-51.4,0c-7.9-0.3-14.9-1.9-16.5-1.4c-1.1,0.3-2.3,1.7-3.1,4.1 c-0.2,0.6-0.4,1.1-0.5,1.7c-1.2,7.7,0.9,15.7,4.7,23.2C272.7,105,339.3,104.3,341.2,100.9z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M254.6,77.3c0-0.1,0.2-0.9-0.2-0.4c-1.9,2.3-4.7,5.9-8.2,11c-7.5,11-10.7,16.1-10.7,16.1 s0.1,33.8,4.5,48.3c16.6-1.6,39.8-27.9,51.7-22.5C287.9,125.4,248.4,105.2,254.6,77.3z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M345.4,77.3c0-0.1-0.2-0.9,0.2-0.4c1.9,2.3,4.7,5.9,8.2,11c7.5,11,10.7,16.1,10.7,16.1 s-0.1,33.8-4.5,48.3c-16.6-1.6-39.8-27.9-51.7-22.5C312.2,125.4,351.7,105.2,345.4,77.3z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const HOOD_SVG = `<g><linearGradient id="XMLID_8_" gradientUnits="userSpaceOnUse" x1="300.0184" y1="120.8423" x2="300.0184" y2="64.1338"><stop offset="0" style="stop-color: rgb(182, 184, 186);"></stop> <stop offset="1" style="stop-color: rgb(243, 245, 248);"></stop></linearGradient> <path id="XMLID_1640_" data-color-control="hood_inside" d="M300.018,120.842c0,0,4.304-4.798,13.16-9.254 c6.221-3.13,35.507-8.74,47.166-19.278c8.623-7.076,12.694-14.173,18.809-19.112c0,0,18.609-10.904-30.672-8.793 c-6.792,0.291-90.133,0.291-96.925,0c-49.281-2.112-30.672,8.793-30.672,8.793c6.115,4.939,10.186,12.036,18.809,19.112 c11.659,10.538,40.945,16.148,47.166,19.278C295.715,116.045,300.018,120.842,300.018,120.842" class="element_select" style="fill: url(&quot;#XMLID_8_&quot;);"></path> <path id="XMLID_1641_" data-color-control="hood_outside" d="M374.654,59.498 c6.952,0.613,17.994,2.249,18.608,19.221c0,0-1.019,8.698,0,17.177c1.671,13.905,11.45,18.288-56.233,21.266 c-7.802,0.343-16.607,3.66-26.583,3.681h-10.429c0,0,4.304-4.798,13.16-9.254c6.221-3.13,35.507-8.74,47.166-19.278 c8.623-7.076,12.694-14.173,18.809-19.112c0,0,18.609-10.904-30.672-8.793c-6.792,0.291-90.133,0.291-96.925,0 c-49.281-2.112-30.672,8.793-30.672,8.793c6.115,4.939,10.186,12.036,18.809,19.112c11.659,10.538,40.945,16.148,47.166,19.278 c8.856,4.456,13.16,9.254,13.16,9.254H289.59c-9.976-0.021-18.781-3.337-26.583-3.681c-67.682-2.978-57.904-7.361-56.233-21.266 c1.019-8.478,0-17.177,0-17.177c0.613-16.972,11.656-18.608,18.608-19.221C232.335,58.884,367.702,58.884,374.654,59.498z" class="element_select" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M300.018,96.44c-31.241,0-62.482-5.899-60.326-4.13 c11.659,10.538,40.945,16.148,47.166,19.278c8.856,4.457,13.16,9.254,13.16,9.254s4.304-4.798,13.16-9.254 c6.221-3.13,35.507-8.74,47.166-19.278C362.5,90.541,331.259,96.44,300.018,96.44z" style="fill: rgb(202, 202, 232);" id="XMLID_1639_"></path></g>`;
const ZIPPERED_HOOD_SVG = `<g data-color-control="hood_inside" class="element_select"><path d="M342.3,84.4c3.8-2.9,13.8-8.3,4-14.8c-6.9-4-20.1-7-34.7-8.1c-7.6-0.4-15.5-0.4-23.1,0 c-14.6,1.1-27.8,4.1-34.7,8.1c-9.8,6.5,0.3,12,4,14.8c4.5,3.4,11.1,8.5,17.7,14.3h49.1C331.1,92.9,337.8,87.8,342.3,84.4z" style="fill: rgb(255, 255, 255);"></path> <path d="M438.6,115c-3.1-1.9-44.5-41.1-71.4-40.7c0,0-4-0.2-11.2-7.7c-6-6.1-19.3-14.5-55.9-14.5 c-36.7,0-50,8.4-55.9,14.5c-7.3,7.5-11.2,7.7-11.2,7.7c-26.8-0.4-68.2,38.8-71.4,40.7c-3.1,1.9-7.1,8.3,4,5.6 c11.1-2.7,31-10.6,54.7-11.9c23.7-1.2,37,1.3,53.1,10.9c13,7.7,19,7.7,24.7,9.7c0-0.3,0-0.7,0-1c-0.5-13.1-28.1-34.7-40.2-43.8 c-3.8-2.9-13.8-8.3-4-14.8c8.7-5,27.5-8.6,46.3-8.6c18.8,0,37.6,3.5,46.3,8.5c9.8,6.5-0.3,12-4,14.8 c-12.1,9.2-39.8,30.9-40.2,43.9c0,0.3,0,0.6,0,1c5.6-2,11.7-1.9,24.7-9.7c16-9.6,29.3-12.1,53.1-10.9c23.7,1.2,43.6,9.1,54.7,11.9 C445.6,123.3,441.7,116.9,438.6,115z" style="stroke: rgb(156, 161, 164); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const CLASSIC_BAND_COLLAR_SVG = `<g data-color-control="knit_base" class="element_select"><path d="M335.5,88.1c8-3.7,13.4-7.7,14.6-9.5c1.6-2.5,1.5-5.4-3.2-8.5c-8.8-5.1-27.8-7.6-46.8-7.5h0 c-19-0.1-38,2.5-46.8,7.5c-4.7,3.2-4.8,6.1-3.2,8.5c1.1,1.8,6.6,5.9,14.6,9.5C268.3,89.8,331.7,89.8,335.5,88.1z" style="fill: rgb(255, 255, 255);"></path> <path d="M300,62.5c-19-0.1-38,2.5-46.8,7.5 c-4.7,3.2-4.8,6.1-3.2,8.5c1.1,1.8,6.6,5.9,14.6,9.5c3.8,1.7,16,6.1,24.6,7c3.8,0.5,6,0.7,6.6,1.7c1.6,2.7,2.7,27.1,1.6,33.6 c0,0-22.4,0.5-39.2-6.8c-16.8-7.3-22.2-15.3-23.5-17.6c0,0,2.8-15,6.1-24.2c3.8-10.8,9.3-17.1,22.9-20.4c8.2-2,22.3-3,36.3-3h0.4 c14,0,28.1,1,36.3,3c13.6,3.3,19.1,9.6,22.9,20.4c3.2,9.2,6.1,24.2,6.1,24.2c-1.3,2.3-6.7,10.3-23.5,17.6 c-16.8,7.3-39.2,6.8-39.2,6.8c-1.1-6.5,0-30.9,1.6-33.6c0.6-1,2.8-1.2,6.6-1.7c8.6-0.9,20.8-5.3,24.6-7c8-3.7,13.4-7.7,14.6-9.5 c1.6-2.5,1.5-5.4-3.2-8.5C338.1,64.9,319,62.4,300,62.5L300,62.5z" style="stroke: rgb(156, 161, 164); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const BAND_COLLAR_SVG = `<g data-color-control="collar_base" class="element_select"><path d="M301.9,127.5h-2.9c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2 c0,0,2.6-4.1,5.5-11.5c1.7-4.4,3.9-15.9,7.1-18.6c3.3-2.7,22.5-8.8,54.7-8.8h1.3c32.3,0,51.5,6.1,54.7,8.8 c3.2,2.7,5.4,14.3,7.1,18.6c3,7.4,5.5,11.5,5.5,11.5c-1.2,1.9-6.2,8.3-21.5,14.2c-12.6,4.8-38.8,7.4-45.6,7.5h-2.9" style="fill: rgb(255, 255, 255); stroke: rgb(202, 202, 232); stroke-miterlimit: 10;"></path> <path d="M237.5,94.2c1.7-4.4,3.9-15.9,7.1-18.6c1.2-1,2.6,20.2,47.8,20.2c1,0,6.7,0.1,6.7,3.9 v27.8c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2C232,105.7,234.6,101.7,237.5,94.2z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M362.5,94.2c-1.7-4.4-3.9-15.9-7.1-18.6c-1.2-1-2.6,20.2-47.8,20.2 c-1,0-6.7,0.1-6.7,3.9v27.8c6.8-0.1,33-2.6,45.6-7.5c15.4-5.9,20.3-12.4,21.5-14.2C368.1,105.7,365.5,101.7,362.5,94.2z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const SAILOR_COLLAR_SVG = `<g><g data-color-control="collar_base" class="element_select"><path d="M301.9,127.5h-2.9c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2 c0,0,2.6-4.1,5.5-11.5c1.7-4.4,3.9-15.9,7.1-18.6c3.3-2.7,22.5-8.8,54.7-8.8h1.3c32.3,0,51.5,6.1,54.7,8.8 c3.2,2.7,5.4,14.3,7.1,18.6c3,7.4,5.5,11.5,5.5,11.5c-1.2,1.9-6.2,8.3-21.5,14.2c-12.6,4.8-38.8,7.4-45.6,7.5h-2.9" style="fill: rgb(255, 255, 255); stroke: rgb(202, 202, 232); stroke-miterlimit: 10;"></path></g></g>`;

export const COLLAR_STYLES = [
  { id: 'classic_standup', name: 'Classic Standup Collar',   svg: CLASSIC_STANDUP_SVG },
  { id: 'overlap_standup', name: 'Overlap Standup Collar',   svg: OVERLAP_STANDUP_SVG },
  { id: 'pro_shirt',       name: 'Pro (Shirt) Collar',       svg: PRO_SHIRT_COLLAR_SVG },
  { id: 'hood',            name: 'Hood',                     svg: HOOD_SVG },
  { id: 'zippered_hood',   name: 'Zippered Hood',            svg: ZIPPERED_HOOD_SVG },
  { id: 'classic_band',    name: 'Classic Band Collar',      svg: CLASSIC_BAND_COLLAR_SVG },
  { id: 'band',            name: 'Band Collar',              svg: BAND_COLLAR_SVG },
  { id: 'sailor',            name: 'Sailor Collar',              svg: SAILOR_COLLAR_SVG },
];

// ─── PATCH CATEGORIES ────────────────────────────────────────────────────────
export const PATCH_CATEGORIES = [
  { id: 'None',            label: 'None' },
  { id: 'Year',            label: 'Year' },
  { id: 'PositionNumber',  label: 'Position/Number' },
  { id: 'Academics',       label: 'ACADEMICS' },
  { id: 'Athletics',       label: 'ATHLETICS' },
  { id: 'BandMusic',       label: 'BAND/MUSIC' },
  { id: 'CheerDanceDrill', label: 'CHEER-DANCE-DRILL' },
  { id: 'CrazyWord',       label: 'CRAZY WORD' },
  { id: 'CustomFlags',     label: 'CUSTOM FLAGS' },
  { id: 'FFAAnimalsRodeo', label: 'FFA-ANIMALS-RODEO' },
  { id: 'ROTC',            label: 'ROTC' },
  { id: 'WalkingPatches',  label: 'WALKING PATCHES' },
];

// ─── PATCH STYLE ─────────────────────────────────────────────────────────────
export const PATCH_STYLES = [
  { id: 'Chenille',     name: 'Chenille Patch' },
  { id: 'GlitterVinyl', name: 'Glitter Vinyl Patch' },
  { id: 'SportTouch',   name: 'Sport Touch Patch' },
];

// ─── PATCH FONT ──────────────────────────────────────────────────────────────
export const PATCH_FONT_OPTIONS = [
  { id: 'Classic', label: 'Classic' },
  { id: 'Crazy',   label: 'Crazy' },
];

// ─── IMAGE PATCH CATEGORIES ──────────────────────────────────────────────────
export const IMAGE_PATCH_CATEGORIES = [
  'Academics', 'Athletics', 'BandMusic', 'CheerDanceDrill', 'CrazyWord',
  'CustomFlags', 'FFAAnimalsRodeo', 'ROTC', 'WalkingPatches',
];

// ─── PATCH IMAGES ─────────────────────────────────────────────────────────────
const makeImageSet = (prefix, label, urls = []) =>
  urls.map((url, i) => ({
    id: `${prefix}-${i + 1}`,
    url,
    name: `${label} ${i + 1}`,
  }));

export const PATCH_IMAGES = {
  Academics: makeImageSet('ACD', 'Academics', [
    '/patches/academics/asl.svg',
    '/patches/academics/art-palette.svg',
    '/patches/academics/culinary-arts.svg',
    '/patches/academics/Caduces.svg',
    '/patches/academics/Clover.svg',
    '/patches/academics/Cosmetology.svg',
    '/patches/academics/DECA.svg',
    '/patches/academics/Diamond.svg',
    '/patches/academics/Drama-Club.svg',
    '/patches/academics/FCA-Official.svg',
    '/patches/academics/FCA-cross.svg',
    '/patches/academics/FCCLA-Official.svg',
    '/patches/academics/Gavel.svg',
    '/patches/academics/HOSA-CADUCEUS.svg',
    '/patches/academics/HOSA.svg',
    '/patches/academics/International-Baccalaureate.svg',
    '/patches/academics/Christian-Fish.svg',
    '/patches/academics/Interact-Club.svg',
    '/patches/academics/Key-Club.svg',
    '/patches/academics/Math-Club.svg',
    '/patches/academics/national-art.svg',
    '/patches/academics/science-NHS.svg',
    '/patches/academics/honor-society.svg',
    '/patches/academics/pi-symbol.svg',
    '/patches/academics/book-apple.svg',
    '/patches/academics/skills-usa.svg',
    '/patches/academics/stem.svg',
    '/patches/academics/student-council.svg',
    '/patches/academics/paper-patch.svg',
    '/patches/academics/emoji-patch.svg',
    '/patches/academics/sociedad.svg',
    '/patches/academics/uil.svg',
    '/patches/academics/marshal.svg',
    '/patches/academics/academic-excellence.svg',
    '/patches/academics/xavid.svg',
    '/patches/academics/movie-camera.svg',
    '/patches/academics/camera.svg',
    '/patches/academics/pillars.svg',
    '/patches/academics/cross.svg',
    '/patches/academics/masks.svg',
    '/patches/academics/fire-dept.svg',
    '/patches/academics/francias-flag.svg',
    '/patches/academics/red-b-flag.svg',
    '/patches/academics/buff-horn.svg',
    '/patches/academics/chiraag.svg',
    '/patches/academics/NHS.svg',
    '/patches/academics/eiffel.svg',
    '/patches/academics/text-book.svg',
    '/patches/academics/paw.svg',
    '/patches/academics/brushes.svg',
    '/patches/academics/balance.svg',
    '/patches/academics/spanish-club.svg',
    '/patches/academics/star.svg',
    '/patches/academics/tafe.svg',
    '/patches/academics/texas-acadmy.svg',
    '/patches/academics/map.svg',
  ]),
  Athletics: makeImageSet('ATH', 'Athletics', [
    '/patches/athletics/arrow-fish.svg',
    '/patches/athletics/arrow-symb.svg',
    '/patches/athletics/athletic-man.svg',
    '/patches/athletics/basketball.svg',
    '/patches/athletics/basket-ball.svg',
    '/patches/athletics/bear.svg',
    '/patches/athletics/blue-hoackey.svg',
    '/patches/athletics/boxer.svg',
    '/patches/athletics/captain.svg',
    '/patches/athletics/fire-basket-ball.svg',
    '/patches/athletics/fire-football.svg',
    '/patches/athletics/footbal.svg',
    '/patches/athletics/funny-emoji.svg',
    '/patches/athletics/green-tennis.svg',
    '/patches/athletics/hand-glove.svg',
    '/patches/athletics/hockey.svg',
    '/patches/athletics/inches-tape.svg',
    '/patches/athletics/yellow-hockey.svg',
    '/patches/athletics/orange-ball.svg',
    '/patches/athletics/orange-blue-hoackey.svg',
    '/patches/athletics/orange-fire-football.svg',
    '/patches/athletics/orange-hockey.svg',
    '/patches/athletics/pink-helmet.svg',
    '/patches/athletics/red-athlete.svg',
    '/patches/athletics/red-basketball.svg',
    '/patches/athletics/red-helmet.svg',
    '/patches/athletics/red-jug.svg',
    '/patches/athletics/red-tennis.svg',
    '/patches/athletics/sky-tennis.svg',
    '/patches/athletics/tennis.svg',
    '/patches/athletics/tennis-ground.svg',
    '/patches/athletics/throw-ball.svg',
    '/patches/athletics/yellow-hockey.svg',

  ]),
  BandMusic: makeImageSet('BND', 'Band/Music', [
    '/patches/band/bell.svg',
    '/patches/band/blue-horn.svg',
    '/patches/band/cnorus.svg',
    '/patches/band/disks.svg',
    '/patches/band/drum.svg',
    '/patches/band/horn.svg',
    '/patches/band/mono.svg',
    '/patches/band/music.svg',
    '/patches/band/red-drums.svg',
    '/patches/band/sky-blue-hockey.svg',
    '/patches/band/soldier.svg',
    '/patches/band/straight-horn.svg',
    '/patches/band/yellow-horn.svg',
    '/patches/band/yelow-mask.svg',
  ]),
  CheerDanceDrill: makeImageSet('CHR', 'Cheer', [
    '/patches/cheerdance/athlete.svg',
    '/patches/cheerdance/basket-cheer.svg',
    '/patches/cheerdance/belly-dance.svg',
    '/patches/cheerdance/cheer.svg',
    '/patches/cheerdance/cheer-lady.svg',
    '/patches/cheerdance/double-dance.svg',
    '/patches/cheerdance/down-arrow.svg',
    '/patches/cheerdance/excercise.svg',
    '/patches/cheerdance/female-star.svg',
    '/patches/cheerdance/flower.svg',
    '/patches/cheerdance/gril.svg',
    '/patches/cheerdance/hat.svg',
    '/patches/cheerdance/lady-cheer.svg',
    '/patches/cheerdance/red-mic.svg',
    '/patches/cheerdance/shoe.svg',
    '/patches/cheerdance/shoe-cap.svg',
    '/patches/cheerdance/star-mic.svg',
    '/patches/cheerdance/stick.svg',
    '/patches/cheerdance/sunny-flower.svg',
    '/patches/cheerdance/twiller.svg',
    '/patches/cheerdance/two-stars.svg',
  ]),
  CrazyWord: makeImageSet('CRZ', 'Crazy Word', [
    '/patches/crazyword/band.svg',
    '/patches/crazyword/beta.svg',
    '/patches/crazyword/bpa.svg',
    '/patches/crazyword/deca.svg',
    '/patches/crazyword/ffa.svg',
    '/patches/crazyword/jrotc.svg',
    '/patches/crazyword/nhs.svg',
    '/patches/crazyword/pals.svg',
    '/patches/crazyword/swin.svg',
    '/patches/crazyword/uil.svg',
  ]),
  CustomFlags: makeImageSet('FLG', 'Custom Flag', [
    '/patches/customflags/america-flag.svg',
    '/patches/customflags/blueflag.svg',
    '/patches/customflags/blue-redflag.svg',
    '/patches/customflags/british-flag.svg',
    '/patches/customflags/california.svg',
    '/patches/customflags/canada.svg',
    '/patches/customflags/flowerflag.svg',
    '/patches/customflags/mapflag.svg',
    '/patches/customflags/starmap.svg',
    '/patches/customflags/textflag.svg',
    '/patches/customflags/trio-flag.svg',
    '/patches/customflags/two-flags.svg',
    '/patches/customflags/usaflag.svg',
  ]),
  FFAAnimalsRodeo: makeImageSet('FFA', 'FFA', [
    '/patches/ffa/buffalojump.svg',
    '/patches/ffa/ffamap.svg',
    '/patches/ffa/ffapatch.svg',
    '/patches/ffa/greenhorse.svg',
    '/patches/ffa/greyhorse.svg',
    '/patches/ffa/hen.svg',
    '/patches/ffa/horse.svg',
    '/patches/ffa/horsejump.svg',
    '/patches/ffa/ladyhorse.svg',
    '/patches/ffa/peacock.svg',
    '/patches/ffa/piggy.svg',
    '/patches/ffa/rabbit.svg',
    '/patches/ffa/redbufallo.svg',
    '/patches/ffa/redgoat.svg',
    '/patches/ffa/redhorsemen.svg',
    '/patches/ffa/sheep.svg',
    '/patches/ffa/shoemap.svg',
    '/patches/ffa/toy.svg',
    '/patches/ffa/whitegoat.svg',
    '/patches/ffa/yelowgost.svg',
  ]),
  ROTC: makeImageSet('RTC', 'ROTC', [
    '/patches/rotc/army.svg',
    '/patches/rotc/greenshield.svg',
    '/patches/rotc/guns.svg',
    '/patches/rotc/jrotc.svg',
    '/patches/rotc/rotc.svg',
    '/patches/rotc/sabreteam.svg',
    '/patches/rotc/shield.svg',
    '/patches/rotc/shoes.svg',
    '/patches/rotc/swords.svg',
    '/patches/rotc/twoflags.svg',
    '/patches/rotc/usairforce.svg',
    '/patches/rotc/usarmy.svg',
    '/patches/rotc/usemarine.svg',
    '/patches/rotc/usnavy.svg',
  ]),
  WalkingPatches: makeImageSet('WLK', 'Walking', [
    '/patches/walking/hearts.svg',
    '/patches/walking/stars.svg',
    '/patches/walking/paws.svg',
    '/patches/walking/symbols.svg',
  ]),
};

// ─── Legacy image patches (kept for backward compatibility) ──────────────────
export const PATCH_DESIGNS = [
  { id: 'eagle',  name: 'Eagle',  category: 'Classic',  url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/eagle.webp' },
  { id: 'wolf',   name: 'Wolf',   category: 'Wild',     url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/wolf.webp' },
  { id: 'lion',   name: 'Lion',   category: 'Royal',    url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/lion.webp' },
  { id: 'shield', name: 'Shield', category: 'Heraldic', url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/shield.webp' },
  { id: 'crown',  name: 'Crown',  category: 'Royal',    url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/crown.webp' },
  { id: 'skull',  name: 'Skull',  category: 'Edgy',     url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/skull.webp' },
];

// ─── Small style helpers ──────────────────────────────────────────────────────
// Editorial pill: matches .cropped-material-btn in the Materials & Colors panel —
// hairline border, small caps Montserrat label, ink fill when active.
const pillStyle = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 12px',
  borderRadius: 3,
  border: active ? '1px solid var(--ink)' : '1px solid var(--line)',
  background: active ? 'var(--ink)' : 'transparent',
  fontFamily: 'var(--display)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  color: active ? '#ffffff' : 'var(--ink-soft)',
  transition: 'border-color .18s ease, color .18s ease, background-color .18s ease',
});

// ─── Price badge ──────────────────────────────────────────────────────────────
function PriceTag({ amount, active = false, showZero = true }) {
  const v = Number(amount) || 0;
  if (v === 0 && !showZero) return null;

  const palette = active
    ? { bg: 'rgba(255,255,255,0.18)', fg: '#ffffff' }
    : v > 0
      ? { bg: '#F1EDE5', fg: '#6B5B3E' }
      : v < 0
        ? { bg: '#E7F2EA', fg: '#2F6B44' }
        : { bg: '#F3F3F1', fg: '#8A8378' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1,
        padding: '3px 6px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        textTransform: 'none',
        background: palette.bg,
        color: palette.fg,
      }}
    >
      {fmtDelta(v)}
    </span>
  );
}

PriceTag.propTypes = { amount: PropTypes.number, active: PropTypes.bool, showZero: PropTypes.bool };

// Pill button with a built-in price badge
function Pill({ active, onClick, price, children }) {
  return (
    <button type="button" onClick={onClick} style={pillStyle(active)}>
      <span>{children}</span>
      {price !== undefined && price !== null && <PriceTag amount={price} active={active} />}
    </button>
  );
}

Pill.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  price: PropTypes.number,
  children: PropTypes.node,
};

// ─── Color Picker Row ─────────────────────────────────────────────────────────
function ColorPickerRow({ label, selectedHex, onChange, baseFee = 0 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {label}
        {baseFee > 0 && <PriceTag amount={baseFee} />}
      </label>
      <div className="cropped-color-grid">
        {LEATHER_COLORS.map((col) => {
          const fee = colorFee(col.hex);
          return (
            <button
              key={col.name}
              type="button"
              onClick={() => onChange(col.hex, col.name)}
              className="cropped-color-btn"
              style={{
                position: 'relative',
                backgroundColor: col.hex,
                border: col.hex === '#ffffff' ? '1px solid rgba(17,17,17,.14)' : 'none',
              }}
              title={fee ? `${col.name} — ${fmtDelta(fee)}` : `${col.name} — Included`}
            >
              {selectedHex === col.hex && (
                <div className="cropped-color-check">
                  <Check size={8} className="cropped-color-check-icon" />
                </div>
              )}
              {fee > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#1F1D1A',
                    color: '#F5D07A',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 8,
                    fontWeight: 700,
                    lineHeight: '12px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {CURRENCY}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

ColorPickerRow.propTypes = {
  label: PropTypes.string.isRequired,
  selectedHex: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  baseFee: PropTypes.number,
};

// ─── Font Selector + Live Preview ────────────────────────────────────────────
function FontSelector({ selectedFont, fillColor, strokeColor, onSelectFont }) {
  const fontsReady = useFontsReady();
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="cropped-text-options-label">Font Style</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FONT_OPTIONS.map((f) => {
          const isActive = selectedFont === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFont(f.id)}
              style={{
                padding: '9px 12px',
                borderRadius: 4,
                border: isActive ? '1px solid var(--ink)' : '1px solid var(--line)',
                background: isActive ? 'var(--stage)' : 'transparent',
                boxShadow: isActive ? 'inset 0 -3px 0 var(--accent)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                minWidth: 86,
              }}
            >
              <span style={{ fontFamily: 'var(--display)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: isActive ? 'var(--ink)' : 'var(--muted)' }}>
                {f.label}
              </span>
              <span
                key={`${f.id}-${fontsReady}`}
                style={{
                  fontFamily: f.fontFamily,
                  fontWeight: f.fontWeight,
                  fontStyle: f.fontStyle,
                  textTransform: f.textTransform,
                  fontSize: 16,
                  color: fillColor || '#1a1a1a',
                  WebkitTextStroke: strokeColor && strokeColor !== fillColor ? `1px ${strokeColor}` : 'none',
                  letterSpacing: f.extraSpacing || '0.02em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  transform: f.transform,
                  textShadow: f.syntheticBold ? '0.4px 0 currentColor, -0.4px 0 currentColor' : 'none',
                }}
              >
                {f.preview}
              </span>
              <PriceTag amount={DESIGN_PRICING.font[f.id] ?? 0} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

FontSelector.propTypes = {
  selectedFont: PropTypes.string,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  onSelectFont: PropTypes.func.isRequired,
};

// ─── Live Text Preview Box ────────────────────────────────────────────────────
function LiveTextPreview({ text, font, fillColor, strokeColor }) {
  const fontsReady = useFontsReady();
  if (!text) return null;
  const fontObj = FONT_OPTIONS.find((f) => f.id === font) || FONT_OPTIONS[0];
  return (
    <div style={{
      margin: '12px 0',
      padding: '16px 12px',
      background: 'var(--ink)',
      borderRadius: 6,
      border: '1px solid var(--line)',
      textAlign: 'center',
      minHeight: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    >
      <span
        key={`${font}-${fontsReady}`}
        style={{
          fontFamily: fontObj.fontFamily,
          fontWeight: fontObj.fontWeight,
          fontStyle: fontObj.fontStyle,
          textTransform: fontObj.textTransform,
          fontSize: 32,
          color: fillColor || '#ffffff',
          WebkitTextStroke: strokeColor ? `2px ${strokeColor}` : 'none',
          letterSpacing: fontObj.extraSpacing || '0.05em',
          lineHeight: 1.1,
          wordBreak: 'break-all',
          display: 'inline-block',
          transform: fontObj.transform,
          textShadow: fontObj.syntheticBold ? '0.6px 0 currentColor, -0.6px 0 currentColor' : 'none',
        }}
      >
        {text}
      </span>
    </div>
  );
}

LiveTextPreview.propTypes = {
  text: PropTypes.string,
  font: PropTypes.string,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
};

// ─── FULL TEXT OPTIONS (shared by chest, sleeve, and back lines) ─────────────
export function FullTextOptions({ value, onChange, maxLength = 14 }) {
  const v = value || {};
  const blockTotal = textBlockLines(v).reduce((s, l) => s + l.amount, 0);

  return (
    <div className="cropped-text-options">
      {/* Inscription */}
      <div style={{ marginBottom: 12 }}>
        <label className="cropped-text-options-label">Input Inscription</label>
        <input
          type="text"
          maxLength={maxLength}
          value={v.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="e.g. 23, VARSITY"
          className="cropped-text-input"
        />
      </div>

      {/* Live preview */}
      <LiveTextPreview
        text={v.text}
        font={v.font || DEFAULT_FONT_ID}
        fillColor={v.color}
        strokeColor={v.strokeColor}
      />

      {/* Font */}
      <FontSelector
        selectedFont={v.font || DEFAULT_FONT_ID}
        fillColor={v.color || '#d4af37'}
        strokeColor={v.strokeColor}
        onSelectFont={(fontId) => onChange({ font: fontId })}
      />


      {/* Text Height */}
      <div style={{ marginBottom: 12 }}>
        <label className="cropped-text-options-label">Text Height</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEXT_HEIGHTS.map((h) => (
            <Pill key={h} active={v.height === h} price={DESIGN_PRICING.textHeight[h] ?? 0} onClick={() => onChange({ height: h })}>
              {h}
            </Pill>
          ))}
        </div>
      </div>

      {/* Text Direction */}
      <div style={{ marginBottom: 12 }}>
        <label className="cropped-text-options-label">Text Direction</label>

        <div style={{ display: 'flex', gap: 8 }}>
          <Pill
            active={(v.textDirection || 'straight') === 'straight'}
            onClick={() => onChange({ textDirection: 'straight' })}
          >
            Straight
          </Pill>

          <Pill
            active={v.textDirection === 'staggered'}
            onClick={() => onChange({ textDirection: 'staggered' })}
          >
            Staggered
          </Pill>
        </div>
      </div>

      {/* Material */}
      {/* <div style={{ marginBottom: 12 }}>
        <label className="cropped-text-options-label">Material</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MATERIALS.map((m) => (
            <Pill key={m.id} active={v.material === m.id} price={DESIGN_PRICING.material[m.id] ?? 0} onClick={() => onChange({ material: m.id })}>
              {m.name}
            </Pill>
          ))}
        </div>
      </div> */}

      {/* Sport Touch texture */}
      {v.material === 'SportTouch' && (
        <div style={{ marginBottom: 12 }}>
          <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Sport Touch Texture
            <PriceTag amount={DESIGN_PRICING.sportTouchTexture} />
          </label>
          <div className="cropped-color-grid">
            {SPORT_TOUCH_TEXTURES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ sportTouchTexture: t.id })}
                className="cropped-color-btn"
                style={{ backgroundColor: t.hex }}
                title={`${t.name} — ${fmtDelta(DESIGN_PRICING.sportTouchTexture)}`}
              >
                {v.sportTouchTexture === t.id && (
                  <div className="cropped-color-check">
                    <Check size={8} className="cropped-color-check-icon" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Outline Color */}
      <ColorPickerRow
        label="Outline Color"
        baseFee={DESIGN_PRICING.outline}
        selectedHex={v.strokeColor || ''}
        onChange={(hex, name) => onChange({ strokeColor: hex, strokeColorName: name })}
      />
      {v.strokeColor && (
        <button
          type="button"
          onClick={() => onChange({ strokeColor: '', strokeColorName: '' })}
          style={{
            marginTop: -6,
            marginBottom: 12,
            fontFamily: 'var(--display)',
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Remove outline ({fmtDelta(-DESIGN_PRICING.outline)})
        </button>
      )}

      {/* Felt (Fill) Color */}
      <ColorPickerRow
        label="Felt Color"
        selectedHex={v.color || ''}
        onChange={(hex, name) => onChange({ color: hex, colorName: name })}
      />

      {/* Arc */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="cropped-text-options-label" style={{ marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Arc: <span style={{ color: 'var(--accent)' }}>{v.arc ?? 0}</span>
            <PriceTag amount={DESIGN_PRICING.arc} />
          </label>
          <button
            type="button"
            onClick={() => onChange({ arc: 0 })}
            style={{
              fontSize: 10,
              fontFamily: 'var(--display)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={v.arc ?? 0}
          onChange={(e) => onChange({ arc: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#111111' }}
        />
      </div>

      {/* Rhinestones */}
      {/* <div style={{ marginBottom: 4 }}>
        <label className="cropped-text-options-label">Rhinestones</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill active={!v.rhinestones} price={0} onClick={() => onChange({ rhinestones: false })}>No</Pill>
          <Pill active={!!v.rhinestones} price={DESIGN_PRICING.rhinestones} onClick={() => onChange({ rhinestones: true })}>Yes</Pill>
        </div>
      </div> */}

      {/* Running subtotal for this text block */}
      {!!v.text && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '9px 0 2px',
          borderTop: '1px solid var(--line-soft)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: 11,
          color: 'var(--muted)',
        }}
        >
          <span>Add-ons for this text</span>
          <strong style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(blockTotal)}</strong>
        </div>
      )}
    </div>
  );
}

FullTextOptions.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
};

// ─── PATCH DESIGN OPTIONS ─────────────────────────────────────────────────────
export function PatchDesignOptions({ value, onChange }) {
  const v = value || {};
  const category = v.patchCategory || 'None';
  const patchStyle = v.patchStyle || 'Chenille';
  const isImageCategory = IMAGE_PATCH_CATEGORIES.includes(category);
  const isTextCategory = category === 'Year' || category === 'PositionNumber';
  const patchTotal = patchBlockLines(v).reduce((s, l) => s + l.amount, 0);

  return (
    <div className="cropped-patch-design-options" style={{ width: '100%', minWidth: 0 }}>
      {/* Patch category */}
      <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
        <label className="cropped-text-options-label">Patch</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PATCH_CATEGORIES.map((c) => (
            <Pill
              key={c.id}
              active={category === c.id}
              price={DESIGN_PRICING.patchCategory[c.id] ?? 0}
              // switching category clears any previously-selected image
              onClick={() => {
                const firstImage = PATCH_IMAGES[c.id]?.[0];
                onChange({
                  patchCategory: c.id,
                  patchImageUrl: firstImage?.url || '',
                  patchImageId: firstImage?.id || '',
                  patchImageName: firstImage?.name || '',
                });
              }}
            >
              {c.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Year */}
      {category === 'Year' && (
        <div style={{ marginBottom: 14 }}>
          <label className="cropped-text-options-label">Year</label>
          <input
            type="text"
            maxLength={4}
            value={v.patchYearText || ''}
            onChange={(e) => onChange({ patchYearText: e.target.value })}
            placeholder="_ _ _ _"
            className="cropped-text-input"
          />
        </div>
      )}

      {/* Position / Number */}
      {category === 'PositionNumber' && (
        <div style={{ marginBottom: 14 }}>
          <label className="cropped-text-options-label">Position / Number</label>
          <input
            type="text"
            maxLength={8}
            value={v.patchPositionText || ''}
            onChange={(e) => onChange({ patchPositionText: e.target.value })}
            placeholder="e.g. QB, 23"
            className="cropped-text-input"
          />
        </div>
      )}

      {/* IMAGE CATEGORIES */}
      {isImageCategory && (
        <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
          <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Select Patch Image
            <PriceTag amount={0} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
            {(PATCH_IMAGES[category] || []).map((img) => {
              const selected = !!img.url && v.patchImageUrl === img.url;
              return (
                <button
                  key={img.id}
                  type="button"
                  disabled={!img.url}
                  onClick={() => img.url && onChange({ patchImageUrl: img.url, patchImageId: img.id, patchImageName: img.name })}
                  title={img.name}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    border: selected ? '1px solid var(--ink)' : '1px dashed var(--line)',
                    borderRadius: 4,
                    background: selected ? 'var(--stage)' : (img.url ? 'transparent' : 'var(--paper)'),
                    cursor: img.url ? 'pointer' : 'not-allowed',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>{img.name}</span>
                  )}
                  {selected && (
                    <div style={{
                      position: 'absolute', top: 2, right: 2, background: 'var(--accent)', borderRadius: '50%',
                      width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    >
                      <Check size={9} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TEXT-patch builder — Year / Position-Number only */}
      {isTextCategory && (
        <>
          {/* Class of badge */}
          <div style={{ marginBottom: 14 }}>
            <label className="cropped-text-options-label">Class of badge</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Pill active={!v.patchClassBadge} price={0} onClick={() => onChange({ patchClassBadge: false })}>No</Pill>
              <Pill active={!!v.patchClassBadge} price={DESIGN_PRICING.patchClassBadge} onClick={() => onChange({ patchClassBadge: true })}>Yes</Pill>
            </div>
          </div>

          {/* Font: Classic / Crazy */}
          <div style={{ marginBottom: 14 }}>
            <label className="cropped-text-options-label">Font</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PATCH_FONT_OPTIONS.map((f) => (
                <Pill
                  key={f.id}
                  active={(v.patchFontStyle || 'Classic') === f.id}
                  price={DESIGN_PRICING.patchFontStyle[f.id] ?? 0}
                  onClick={() => onChange({ patchFontStyle: f.id })}
                >
                  {f.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Patch style */}
          {/* <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
            <label className="cropped-text-options-label">Patch style</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PATCH_STYLES.map((s) => (
                <Pill key={s.id} active={patchStyle === s.id} price={DESIGN_PRICING.patchStyle[s.id] ?? 0} onClick={() => onChange({ patchStyle: s.id })}>
                  {s.name}
                </Pill>
              ))}
            </div>
          </div> */}

          {/* Chenille Color */}
          {/* {patchStyle === 'Chenille' && (
            <ColorPickerRow
              label="Chenille Color"
              selectedHex={v.patchChenilleColor || ''}
              onChange={(hex, name) => onChange({ patchChenilleColor: hex, patchChenilleColorName: name })}
            />
          )} */}

          {/* Sport Touch Texture */}
          {patchStyle === 'SportTouch' && (
            <div style={{ marginBottom: 12 }}>
              <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Sport Touch Texture
                <PriceTag amount={DESIGN_PRICING.patchSportTouchTexture} />
              </label>
              <div className="cropped-color-grid">
                {SPORT_TOUCH_TEXTURES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ patchSportTouchTexture: t.id })}
                    className="cropped-color-btn"
                    style={{ backgroundColor: t.hex }}
                    title={`${t.name} — ${fmtDelta(DESIGN_PRICING.patchSportTouchTexture)}`}
                  >
                    {v.patchSportTouchTexture === t.id && (
                      <div className="cropped-color-check">
                        <Check size={8} className="cropped-color-check-icon" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Outline Color */}
          <ColorPickerRow
            label="Outline Color"
            baseFee={DESIGN_PRICING.patchOutline}
            selectedHex={v.patchOutlineColor || ''}
            onChange={(hex, name) => onChange({ patchOutlineColor: hex, patchOutlineColorName: name })}
          />

          {/* Felt Color */}
          <ColorPickerRow
            label="Felt Color"
            selectedHex={v.patchFeltColor || ''}
            onChange={(hex, name) => onChange({ patchFeltColor: hex, patchFeltColorName: name })}
          />

          {/* Rhinestones */}
          {/* <div style={{ marginBottom: 4 }}>
            <label className="cropped-text-options-label">Rhinestones</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Pill active={!v.patchRhinestones} price={0} onClick={() => onChange({ patchRhinestones: false })}>No</Pill>
              <Pill active={!!v.patchRhinestones} price={DESIGN_PRICING.patchRhinestones} onClick={() => onChange({ patchRhinestones: true })}>Yes</Pill>
            </div>
          </div> */}
        </>
      )}

      {/* Running subtotal for this patch */}
      {category !== 'None' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '9px 0 2px',
          borderTop: '1px solid var(--line-soft)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: 11,
          color: 'var(--muted)',
        }}
        >
          <span>Add-ons for this patch</span>
          <strong style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(patchTotal)}</strong>
        </div>
      )}
    </div>
  );
}

PatchDesignOptions.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DesignPatchesPanel({ state, onChangeState, completedSections, setCompletedSections, onNext, onChangeView }) {
  const [activeSegment, setActiveSegment] = useState('leftChest');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ── SINGLE-COMMIT price folding ──────────────────────────────────────────
  // Har design change ke saath price USI update me recompute hoti hai, is se
  // "is panel pe aate hi / option click karte hi preview kharaab" wala race
  // khatam — ab change + price EK hi update hai, do alag updates nahi.
  const commit = React.useCallback((updater) => {
    onChangeState((p) => {
      const base = typeof updater === 'function' ? updater(p) : { ...p, ...updater };
      const { lines: _dl, total: _dt } = getDesignPriceBreakdown(base);
      return { ...base, designTotalPrice: _dt, designPriceBreakdown: _dl };
    });
  }, [onChangeState]);


  // ── live price ──
  const { lines, total } = useMemo(() => getDesignPriceBreakdown(state), [state]);
  const groupTotal = (g) => lines.filter((l) => l.group === g).reduce((s, l) => s + l.amount, 0);

  // price ab har commit() me fold hoti hai — koi alag write-back effect nahi.

  const toggleSegment = (segment) => {
    setActiveSegment((prev) => {
      const next = prev === segment ? '' : segment;
      // Sirf tab view badlo jab dropdown KHUL raha ho (band karte waqt nahi).
      if (next && typeof onChangeView === 'function') {
        const targetView = SEGMENT_VIEW_MAP[next];
        if (targetView) onChangeView(targetView);
      }
      return next;
    });
  };

  const updateSegment = (key, value) => {
    commit((prev) => {
      const original = prev[key] || {};

      // ⚠️ FIX: selecting "None" used to just merge { type: 'None' } on top
      // of whatever was already there (text, font, patchCategory, patchId,
      // patchImageUrl, colors, etc). The preview happened to hide those
      // fields because it checks `type === 'None'` first, but the leftover
      // data stayed in state — so switching back to a type, or reading the
      // state elsewhere (price, order summary, saved design), could still
      // see stale values. Now, choosing "None" starts the segment fresh
      // instead of merging.
      const updated = value.type === 'None'
        ? { type: 'None' }
        : { ...original, ...value };

      updated.price = segmentPrice(updated);

      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  const updateBackSegment = (changes) => {
    commit((prev) => {
      const original = prev.back || {};

      // Same fix as updateSegment: picking "None" resets the back panel
      // instead of leaving line1/line2/line3 text + patch fields sitting
      // in state underneath the 'None' type.
      const updated = changes.type === 'None'
        ? { type: 'None' }
        : { ...original, ...changes };

      updated.price = backPrice(updated);

      return {
        ...prev,
        back: updated,
      };
    });
  };

  const patchSubtitle = (data) => {
    if (!data || !data.patchCategory || data.patchCategory === 'None') return 'Patch: None';
    const label = PATCH_CATEGORIES.find((c) => c.id === data.patchCategory)?.label || data.patchCategory;
    if (IMAGE_PATCH_CATEGORIES.includes(data.patchCategory) && data.patchImageUrl) {
      return `Patch: ${label} (image)`;
    }
    return `Patch: ${label}`;
  };

  // Small right-hand price + chevron cluster for every segment header
  const headerRight = (key) => {
    const sub = groupTotal(key);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {sub !== 0 && (
          <span style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ink)',
            fontVariantNumeric: 'tabular-nums',
          }}
          >
            {fmtMoney(sub)}
          </span>
        )}
        <ChevronDown
          size={18}
          className={`cropped-segment-chevron ${activeSegment === key ? 'cropped-segment-chevron-active' : ''}`}
        />
      </div>
    );
  };

  const renderSegmentEditor = (key, label) => {
    const data = state[key] || { type: 'None' };

    return (
      <div className="cropped-design-segment" key={key}>
        <button type="button" onClick={() => toggleSegment(key)} className="cropped-segment-header">
          <div className="cropped-segment-header-left">
            {/* <div className="cropped-segment-check">
              <Check size={12} className="cropped-segment-check-icon" />
            </div> */}
            <div>
              <h3 className="cropped-segment-title">{label} Personalization</h3>
              {/* <p className="cropped-segment-subtitle">
                {data.type === 'None'
                  ? 'None'
                  : data.type === 'Text'
                    ? `Text: "${data.text || ''}"`
                    : data.type === 'Emblem'
                      ? 'Insignia Emblem'
                      : patchSubtitle(data)}
                {data.price > 0 ? ` (+$${data.price})` : ''}
              </p> */}
            </div>
          </div>
          {headerRight(key)}
        </button>

        {activeSegment === key && (
          <div className="cropped-segment-content" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>

            {/* ── Decor Type Selector ── */}
            <div>
              <h4 className="cropped-segment-label">Select Decor Type</h4>
              <div className="cropped-decor-grid">
                {[
                  { type: 'None',   label: 'None',     icon: CircleSlash2 },
                  { type: 'Text',   label: 'Text/No.', icon: Type },
                  { type: 'Emblem', label: 'Emblem',   icon: Award },
                  { type: 'Patch',  label: 'Patch',    icon: ImageIcon },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isActive = data.type === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => updateSegment(key, { type: opt.type })}
                      className={`cropped-decor-btn ${isActive ? 'cropped-decor-btn-active' : 'cropped-decor-btn-inactive'}`}
                    >
                      <Icon
                        size={16}
                        className={isActive ? 'cropped-decor-icon-active' : 'cropped-decor-icon-inactive'}
                      />
                      <span className="cropped-decor-label">{opt.label}</span>
                      <PriceTag amount={DESIGN_PRICING.decorType[opt.type] ?? 0} active={isActive} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TEXT OPTIONS ── */}
            {data.type === 'Text' && (
              <FullTextOptions value={data} onChange={(changes) => updateSegment(key, changes)} maxLength={12} />
            )}

            {/* ── EMBLEM OPTIONS ── */}
            {data.type === 'Emblem' && (
              <div className="cropped-emblem-options">
                <div>
                  <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Select Insignia Emblem
                    <PriceTag amount={DESIGN_PRICING.decorType.Emblem} />
                  </label>
                  <div className="cropped-emblem-grid">
                    {EMBLEMS.map((emb) => (
                      <button
                        key={emb.id}
                        type="button"
                        onClick={() => updateSegment(key, { patchId: emb.id, patchName: emb.name })}
                        className={`cropped-emblem-btn ${data.patchId === emb.id ? 'cropped-emblem-btn-active' : 'cropped-emblem-btn-inactive'}`}
                      >
                        <div className="cropped-emblem-icon">{emb.name.charAt(0)}</div>
                        <div className="cropped-emblem-name">{emb.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <ColorPickerRow
                  label="Emblem Theme Color"
                  selectedHex={data.color || ''}
                  onChange={(hex, name) => updateSegment(key, { color: hex, colorName: name })}
                />
              </div>
            )}

            {/* ── PATCH OPTIONS ── */}
            {data.type === 'Patch' && (
              <PatchDesignOptions
                value={data}
                onChange={(changes) => updateSegment(key, changes)}
              />
            )}

            {/* Segment subtotal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--line)',
              fontFamily: 'var(--display)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
            }}
            >
              <span>{label} subtotal</span>
              <strong style={{ fontSize: 13, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {fmtMoney(groupTotal(key))}
              </strong>
            </div>
          </div>
        )}
      </div>
    );
  };

  const back = state.back || { type: 'None' };

  return (
    <div className="cropped-design-container">
      {renderSegmentEditor('leftChest', 'Left Chest')}
      {renderSegmentEditor('rightChest', 'Right Chest')}
      {renderSegmentEditor('leftSleeve', 'Left Sleeve')}
      {renderSegmentEditor('rightSleeve', 'Right Sleeve')}

      {/* ── BACK PANEL ── */}
      <div className="cropped-design-segment">
        <button type="button" onClick={() => toggleSegment('back')} className="cropped-segment-header">
          <div className="cropped-segment-header-left">
            {/* <div className="cropped-segment-check">
              <Check size={12} className="cropped-segment-check-icon" />
            </div> */}
            <div>
              <h3 className="cropped-segment-title">Back Personalization</h3>
              {/* <p className="cropped-segment-subtitle">
                {back.type === 'None'
                  ? 'None'
                  : back.type === 'Text'
                    ? 'Custom Arched Script Text'
                    : patchSubtitle(back)}
                {back.price > 0 ? ` (+$${back.price})` : ''}
              </p> */}
            </div>
          </div>
          {headerRight('back')}
        </button>

        {activeSegment === 'back' && (
          <div className="cropped-segment-content" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <div>
              <h4 className="cropped-segment-label">Select Back Style</h4>
              <div className="cropped-back-style-grid">
                {[
                  { type: 'None',  label: 'None',              price: 0 },
                  { type: 'Text',  label: 'Arched Typography', price: DESIGN_PRICING.backLine.line1 },
                  { type: 'Patch', label: 'Center Patch',      price: DESIGN_PRICING.backType.Patch },
                ].map((opt) => {
                  const isActive = back.type === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => updateBackSegment({ type: opt.type })}
                      className={`cropped-back-style-btn ${isActive ? 'cropped-back-style-btn-active' : 'cropped-back-style-btn-inactive'}`}
                    >
                      <span className="cropped-back-style-label">{opt.label}</span>
                      <PriceTag
                        amount={opt.price}
                        active={isActive}
                      />
                    </button>
                  );
                })}
              </div>
              {back.type === 'Text' && (
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                  Each line is charged only when it has text in it.
                </p>
              )}
            </div>

            {back.type === 'Text' && (
              <div className="cropped-back-text-options">
                <BackLineRow
                  label="Line 1: Arched Top Text"
                  prefix="line1"
                  backState={back}
                  onChange={updateBackSegment}
                />
                <BackLineRow
                  label="Line 2: Center Script Tail"
                  prefix="line3"
                  backState={back}
                  onChange={updateBackSegment}
                />
                <BackLineRow
                  label="Line 3: Arched Bottom Text"
                  prefix="line2"
                  backState={back}
                  onChange={updateBackSegment}
                />
              </div>
            )}

            {back.type === 'Patch' && (
              <PatchDesignOptions value={back} onChange={updateBackSegment} />
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--line)',
              fontFamily: 'var(--display)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
            }}
            >
              <span>Back subtotal</span>
              <strong style={{ fontSize: 13, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {fmtMoney(groupTotal('back'))}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* ── UPLOAD DESIGN ── */}
      <div className="cropped-design-segment">
        <button type="button" onClick={() => toggleSegment('uploadDesign')} className="cropped-segment-header">
          <div className="cropped-segment-header-left">
            {/* <div className="cropped-segment-check">
              <Check size={12} className="cropped-segment-check-icon" />
            </div> */}
            <div>
              <h3 className="cropped-segment-title">Upload Design</h3>
              {/* <p className="cropped-segment-subtitle">
                {state.uploadDesign?.file
                  ? state.uploadDesign.file.name
                  : 'Upload your own artwork'}
              </p> */}
            </div>
          </div>
          {headerRight('uploadDesign')}
        </button>

        {activeSegment === 'uploadDesign' && (
          <div className="cropped-segment-content">
            <div style={{ marginBottom: 16 }}>
              <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Upload Artwork
                <PriceTag amount={DESIGN_PRICING.uploadDesign} />
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.pdf,.ai,.eps"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  commit((prev) => ({
                    ...prev,
                    uploadDesign: { ...prev.uploadDesign, file },
                  }));
                }}
              />
              {state.uploadDesign?.file && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--muted)' }}>
                    {state.uploadDesign.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => commit((prev) => ({
                      ...prev,
                      uploadDesign: { ...prev.uploadDesign, file: null },
                    }))}
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Remove ({fmtDelta(-DESIGN_PRICING.uploadDesign)})
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="cropped-text-options-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Designer Notes
                <PriceTag amount={DESIGN_PRICING.designerNotes} />
              </label>
              <textarea
                className="cropped-text-input"
                rows={4}
                placeholder="Add instructions for our designer..."
                value={state.uploadDesign?.notes || ''}
                onChange={(e) => commit((prev) => ({
                  ...prev,
                  uploadDesign: { ...prev.uploadDesign, notes: e.target.value },
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── PRICE SUMMARY ── */}
      {/* <div style={{
        border: '1px solid var(--line)',
        borderRadius: 8,
        background: 'var(--paper, #FBFAF8)',
        overflow: 'hidden',
        margin: '14px 0 12px',
      }}
      >
        <button
          type="button"
          onClick={() => setShowBreakdown((s) => !s)}
          aria-expanded={showBreakdown}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontFamily: 'var(--display)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
            >
              Design &amp; patches
            </span>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, color: 'var(--muted)' }}>
              {lines.length === 0
                ? 'Nothing added yet'
                : (showBreakdown ? 'Hide breakdown' : `${lines.length} item${lines.length === 1 ? '' : 's'} — see breakdown`)}
            </span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
            >
              {fmtMoney(total)}
            </span>
            <ChevronDown
              size={16}
              style={{
                color: 'var(--muted)',
                transform: showBreakdown ? 'rotate(180deg)' : 'none',
                transition: 'transform .18s ease',
              }}
            />
          </span>
        </button>

        {showBreakdown && lines.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px 14px', borderTop: '1px solid var(--line-soft)' }}>
            {lines.map((l, i) => (
              <li
                key={`${l.label}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '7px 0',
                  borderBottom: '1px dashed var(--line-soft)',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                }}
              >
                <span style={{ flex: 1 }}>{l.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtMoney(l.amount)}
                </span>
              </li>
            ))}
            <li style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 10,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ink)',
            }}
            >
              <span>Design total</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(total)}</span>
            </li>
          </ul>
        )}
      </div> */}

      <button type="button" onClick={onNext} className="cropped-next-btn">
        <span>Proceed To Size Selection</span>
        <span style={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          paddingLeft: 10,
          marginLeft: 10,
          borderLeft: '1px solid rgba(255,255,255,0.25)',
        }}
        >
          {fmtMoney(total)}
        </span>
      </button>
    </div>
  );
}

// ─── BackLineRow helper ───────────────────────────────────────────────────────
function BackLineRow({ label, prefix, backState, onChange }) {
  const [open, setOpen] = useState(false);

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const value = backLineValue(backState, prefix);

  const lineTotal = value.text
    ? (DESIGN_PRICING.backLine[prefix] ?? 0) + textBlockLines(value).reduce((s, l) => s + l.amount, 0)
    : 0;

  const handleChange = (update) => {
    const partial = typeof update === 'function' ? update(value) : update;
    const prefixed = {};
    Object.entries(partial).forEach(([k, val]) => {
      prefixed[`${prefix}${cap(k)}`] = val;
    });
    onChange(prefixed); // yeh onChange prop hai jo parent se aaya (updateBackSegment)
  };

  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 6,
      marginBottom: 12,
      overflow: 'hidden',
    }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '11px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PriceTag amount={lineTotal || (DESIGN_PRICING.backLine[prefix] ?? 0)} />
          <ChevronDown
            size={15}
            style={{ color: '#B9B2A6', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
          />
        </span>
      </button>

      {open && (
        <div style={{ padding: '4px 14px 14px', borderTop: '1px solid var(--line-soft)' }}>
          <FullTextOptions value={value} onChange={handleChange} maxLength={15} />
        </div>
      )}
    </div>
  );
}

BackLineRow.propTypes = {
  label: PropTypes.string.isRequired,
  prefix: PropTypes.string.isRequired,
  backState: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

// ─── PropTypes ────────────────────────────────────────────────────────────────
DesignPatchesPanel.propTypes = {
  state: PropTypes.shape({
    collarStyle: PropTypes.string,
    collarColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    collarColorName: PropTypes.string,
    leftChest: PropTypes.object,
    rightChest: PropTypes.object,
    leftSleeve: PropTypes.object,
    rightSleeve: PropTypes.object,
    back: PropTypes.object,
    uploadDesign: PropTypes.object,
  }).isRequired,
  onChangeState: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onChangeView: PropTypes.func, // optional: dropdown khulne par preview view switch karta hai
};