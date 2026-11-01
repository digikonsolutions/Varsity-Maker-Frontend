/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JacketVisualPreview.jsx — FULLY FIXED
 *
 * FIXES APPLIED:
 *  1. @font-face rules injected into document <head> ONCE with ABSOLUTE urls
 *     (SVG-internal @font-face is unreliable across browsers).
 *  2. document.fonts.load() uses the real FAMILY NAME (not a font stack).
 *  3. PatchGraphic no longer references undefined vars.
 *  4. Collar id mismatch fixed ('overlap_standup').
 *  5. Right view no longer draws two collars.
 *  6. No stray console.log during render (SSR-safe).
 *  7. defaultProps replaced with default parameters (React 19 safe).
 *  8-11. Staggered font / back-line direction fixes.
 *
 *  ── SKIN / BODY MATERIAL ───────────────────────────────────────────────────
 * 12. 3 skins: Ostrich, Snake, Crocodile. Har skin ki apni poori jacket:
 *       /leather/ostritch/{front,back,left,right}/<side>-base.svg
 *       /leather/snake/...
 *       /leather/crocodile/...
 * 13. DEFAULT SKIN = Ostrich. Agar state mein koi skin nahi (ya purana saved
 *     design 'Wool' / 'Melton Wool' wala hai) to preview Ostrich hi dikhata hai.
 * 14. SKIN SWITCH FIX: har SVG ke andar ke ids (pattern/gradient/clipPath) aur
 *     <style> wali classes (CorelDraw ki .fil0, .str0 …) ab us file ke apne
 *     prefix ke saath "scope" hoti hain (scopeSvg). Pehle sab skins ki files
 *     ek jaise ids/classes use karti thi → document mein pehli (Ostrich) wali
 *     texture hi lagti rehti thi, chahe Snake/Crocodile select ho.
 * 15. SVG cache version 'v2' — purana localStorage cache khud ignore ho jayega.
 * 16. Agar kisi skin ki file server par nahi milti, to jacket ke upar ek
 *     notice aata hai jo bata deta hai kaunsi file missing hai (aur us side ke
 *     liye Ostrich fallback dikhta hai).
 */

import React, { useState, useEffect, useId, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './JacketVisualPreview.css';
import { COLLAR_STYLES, FONT_OPTIONS, SPORT_TOUCH_TEXTURES } from './DesignPatchesPanel.jsx';
import './DesignPatchesPanel.css';
import JacketPriceBadge from './JacketPriceBadge.jsx';

// ─── SKIN (BODY MATERIAL) → JACKET SVG SET ───────────────────────────────────
const JACKET_SIDES = ['Front', 'Left', 'Right', 'Back'];

// Ek folder se 4 sides ke paths:
//   <folder>/front/front-base.svg
//   <folder>/back/back-base.svg
//   <folder>/left/left-base.svg
//   <folder>/right/right-base.svg
const buildSkinSvgSet = (folder) => ({
  Front: `${folder}/front/front-base.svg`,
  Back:  `${folder}/back/back-base.svg`,
  Left:  `${folder}/left/left-base.svg`,
  Right: `${folder}/right/right-base.svg`,
});

// ⚠️ Folder ke naam bilkul wahi likho jo /public/leather/ mein hain
// (live server case-sensitive hota hai). "ostritch" spelling folder wali hai.
const SKIN_SVG_SETS = {
  Ostrich:   buildSkinSvgSet('/leather/ostritch'),
  Snake:     buildSkinSvgSet('/leather/snake'),
  Crocodile: buildSkinSvgSet('/leather/crocodile'),
};
const SKIN_NAMES = Object.keys(SKIN_SVG_SETS);

// Default skin — kuch bhi select na ho to yahi dikhegi.
export const DEFAULT_SKIN = 'Ostrich';

// FALLBACK: agar kisi skin ki koi side abhi upload nahi hui to yahi file.
const DEFAULT_SVG_SET = SKIN_SVG_SETS[DEFAULT_SKIN];

// Warning / placeholder ka text
const SKIN_WARNING_TEXT = 'Please select a skin first';
const SKIN_WARNING_HINT = 'Choose a material under Jacket Body, then customize your jacket.';
const SKIN_EMPTY_TITLE  = 'Select a skin to start';
const SKIN_EMPTY_HINT   = 'Pick Ostrich, Snake or Crocodile under Jacket Body. The full jacket loads for that skin.';
const SKIN_WARNING_MS   = 4000;
const SKIN_WARNING_EVENT = 'jacket:skin-required';

// state.bodyMaterial → valid skin name. Khaali / unknown → DEFAULT_SKIN.
const getSkinName = (state) => {
  if (!state || typeof state !== 'object') return '';
  const m = state.bodyMaterial;
  const raw = m && typeof m === 'object' ? (m.id || m.name || m.value || '') : m;
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (v === 'ostritch') return 'Ostrich';
  return SKIN_NAMES.find((n) => n.toLowerCase() === v) || DEFAULT_SKIN;
};

const resolveSkinSvgSet = (skinName) => SKIN_SVG_SETS[skinName] || DEFAULT_SVG_SET;

export const isSkinSelected = (state) => getSkinName(state) !== '';

export function requestSkinWarning() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SKIN_WARNING_EVENT));
}

export function guardSkinChange(state, patch) {
  if (isSkinSelected(state)) return true;
  const next = typeof patch === 'function' ? patch(state) : patch;
  if (next && typeof next === 'object' && isSkinSelected(next)) return true;
  requestSkinWarning();
  return false;
}

// ─── FONT DEFINITIONS ────────────────────────────────────────────────────────
const FONT_DEFS = [
  { family: 'Jacketshop',         url: '/font/BRUSHSCI.TTF' },
  { family: 'Stahls Athletic',    url: '/font/Athletic-Regular-5.ttf' },
  { family: 'Stahls Pro Block',   url: '/font/Block.ttf' },
  { family: 'Stahls Old English', url: '/font/PirataOne-Regular.ttf' },
  { family: 'Stahls Vintage',     url: '/font/stahls-tiffany-2000.ttf' },
];

const FONT_STYLE_TAG_ID = 'jacket-font-faces';

// ─── INLINE SVG LOADER ───────────────────────────────────────────────────────
// Artwork update karo to version badal do — purana localStorage cache ignore.
const SVG_CACHE_VERSION = 'v2';
const svgStorageKey = (url) => `jacket_svg_cache_${SVG_CACHE_VERSION}::${url}`;

const isSvgMarkup = (t) =>
  typeof t === 'string' &&
  /<svg[\s>]/i.test(t) &&
  !/<!doctype\s+html/i.test(t) &&
  !/<html[\s>]/i.test(t);

const readSvgFromStorage = (url) => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(svgStorageKey(url));
  } catch (e) {
    return null;
  }
};

const writeSvgToStorage = (url, markup) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(svgStorageKey(url), markup);
  } catch (e) {
    // quota exceeded / storage disabled — in-memory cache still works.
  }
};

const svgMarkupCache = new Map();
const svgInflight = new Map();
const svgMissing = new Set();

function getCachedSvg(url) {
  if (!url) return null;
  if (svgMarkupCache.has(url)) return svgMarkupCache.get(url);
  const stored = readSvgFromStorage(url);
  if (isSvgMarkup(stored)) {
    svgMarkupCache.set(url, stored);
    return stored;
  }
  return null;
}

function loadSvg(url) {
  if (!url || typeof window === 'undefined') return Promise.resolve(null);

  const cached = getCachedSvg(url);
  if (cached) return Promise.resolve(cached);
  if (svgMissing.has(url)) return Promise.resolve(null);
  if (svgInflight.has(url)) return svgInflight.get(url);

  const baseDir = new URL(url, window.location.href).href.replace(/[^/]*$/, '');
  const toAbs = (p) => {
    const norm = p.replace(/\\/g, '/');
    const abs = /^(data:|https?:|\/)/i.test(norm) ? norm : baseDir + norm.replace(/^\.\//, '');
    return abs.replace(/ /g, '%20');
  };

  const fixHrefs = (svg) =>
    svg.replace(
      /(<image[^>]*?\s(?:xlink:href|href)=)(["'])(.*?)\2/gi,
      (m, pre, q, path) => `${pre}${q}${toAbs(path)}${q}`
    );

  const request = fetch(url, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : null))
    .then((t) => {
      if (!isSvgMarkup(t)) {
        svgMissing.add(url);
        return null;
      }
      const fixed = fixHrefs(t);
      svgMarkupCache.set(url, fixed);
      writeSvgToStorage(url, fixed);
      return fixed;
    })
    .catch(() => null)
    .finally(() => { svgInflight.delete(url); });

  svgInflight.set(url, request);
  return request;
}

function loadSvgWithFallback(url, fallbackUrl) {
  return loadSvg(url).then((markup) => {
    if (markup) return markup;
    if (fallbackUrl && fallbackUrl !== url) {
      if (typeof console !== 'undefined') {
        console.warn(`[JacketVisualPreview] "${url}" nahi mili — fallback "${fallbackUrl}" use ho rahi hai.`);
      }
      return loadSvg(fallbackUrl);
    }
    return null;
  });
}

function peekSvgWithFallback(url, fallbackUrl) {
  const direct = getCachedSvg(url);
  if (direct) return direct;
  if (fallbackUrl && fallbackUrl !== url && svgMissing.has(url)) return getCachedSvg(fallbackUrl);
  return null;
}

function useInlineSvg(url, fallbackUrl) {
  const [entry, setEntry] = useState(() => ({ url, markup: peekSvgWithFallback(url, fallbackUrl) }));

  useEffect(() => {
    if (!url) {
      setEntry({ url, markup: null });
      return undefined;
    }

    const cached = peekSvgWithFallback(url, fallbackUrl);
    if (cached) {
      setEntry({ url, markup: cached });
      return undefined;
    }

    let cancelled = false;
    setEntry({ url, markup: null }); // purani skin ka art mat dikhao
    loadSvgWithFallback(url, fallbackUrl).then((markup) => {
      if (!cancelled) setEntry({ url, markup });
    });
    return () => { cancelled = true; };
  }, [url, fallbackUrl]);

  // url badla hai → purani skin ka markup KABHI return mat karo.
  if (entry.url !== url) return peekSvgWithFallback(url, fallbackUrl);
  return entry.markup;
}

// ─── SKIN PRELOADER — charon sides ek saath ─────────────────────────────────
function useSkinPreload(svgSet) {
  const key = svgSet ? JACKET_SIDES.map((side) => svgSet[side]).join('|') : '';
  const [loadedKey, setLoadedKey] = useState('');

  useEffect(() => {
    if (!key || !svgSet) return undefined;
    let cancelled = false;
    Promise.all(
      JACKET_SIDES.map((side) => loadSvgWithFallback(svgSet[side], DEFAULT_SVG_SET[side]))
    ).then(() => {
      if (!cancelled) setLoadedKey(key);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = !!key && loadedKey !== key &&
    !JACKET_SIDES.every((side) => peekSvgWithFallback(svgSet[side], DEFAULT_SVG_SET[side]));
  return { loading, loadedKey };
}

// ─── SVG SCOPING (skin switch fix) ───────────────────────────────────────────
// Inline SVG ke ids aur <style> classes POORE document ke liye global hote hain.
// Har skin ki file ke ids/classes ko us file ke URL ke hash se prefix karte hain,
// taake Snake / Crocodile ki texture Ostrich wali se kabhi na takraye.
// `.jk-*` aur `.leather-*` classes ko haath NAHI lagate (painter unhi par chalta hai).
const hashStr = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

function scopeSvg(markup, scopeKey) {
  if (!markup || !scopeKey) return markup;
  const p = `sk${hashStr(scopeKey)}-`;
  let m = markup;

  // 1) IDs + unke references
  const ids = new Set();
  m.replace(/\sid\s*=\s*"([^"]+)"/g, (whole, id) => { ids.add(id); return whole; });
  if (ids.size) {
    m = m.replace(/(\sid\s*=\s*")([^"]+)(")/g, (whole, a, id, b) => `${a}${p}${id}${b}`);
    m = m.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, (whole, q, id) =>
      (ids.has(id) ? `url(#${p}${id})` : whole));
    m = m.replace(/((?:xlink:)?href\s*=\s*")#([^"]+)(")/g, (whole, a, id, b) =>
      (ids.has(id) ? `${a}#${p}${id}${b}` : whole));
  }

  // 2) <style> mein defined classes (sirf selector wale hisse mein)
  const classes = new Set();
  const isOwn = (c) => !/^(jk-|leather-)/.test(c);
  m = m.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (whole, open, css, close) => {
    const scoped = css.replace(/([^{}]*)(\{[^{}]*\})/g, (rule, sel, body) => {
      const newSel = sel.replace(/\.(-?[_a-zA-Z][\w-]*)/g, (cm, c) => {
        if (!isOwn(c)) return cm;
        classes.add(c);
        return `.${p}${c}`;
      });
      return newSel + body;
    });
    return open + scoped + close;
  });
  if (classes.size) {
    m = m.replace(/(\sclass\s*=\s*")([^"]*)(")/g, (whole, a, v, b) =>
      a + v.split(/\s+/).map((c) => (classes.has(c) ? p + c : c)).join(' ') + b);
  }
  return m;
}

// front-base.svg me jo classes tumne di hain, un ko color se map karo
const FRONT_CLASS_MAP = {
  '.jk-body':   'bodyHex',
  '.jk-sleeve': 'sleeveHex',
  '.jk-pocket': 'pocketHex',
  '.jk-knit':   'knitHex',
  '.jk-cuff':   'knitHex',
  '.jk-knit-line':   'knitLineHex',
  '.jk-knit-border': 'knitBorderHex',
  '.jk-knit-base':   'knitHex',
  '.jk-rib':    'knitLineHex',
  '.jk-collar-group': 'collarHex',
  '.jk-insert':        'insertHex',
  '.jk-insert-1':      'insertHex1',
  '.jk-insert-2':      'insertHex2',
  '.jk-insert-3':      'insertHex3',
  '.jk-snap':          'snapHex',
  '.jk-zip':           'snapHex',
};

// 5th view — "Lining"
const LINING_SVG = {
  Quilted:     '/jacket/lining/lining-quilted.svg',
  Lightweight: '/jacket/lining/lining-lightweight.svg',
};

const LINING_CLASS_MAP = {
  '.jk-lining': 'liningHex',
};

const SIDE_CLASS_MAP = {
  '.jk-body':        'bodyHex',
  '.jk-sleeve':      'sleeveHex',
  '.jk-knit':        'knitHex',
  '.jk-cuff':        'knitHex',
  '.jk-knit-line':   'knitLineHex',
  '.jk-knit-border': 'knitBorderHex',
  '.jk-knit-base':   'knitHex',
  '.jk-rib':         'knitLineHex',
  '.jk-pocket':      'pocketHex',
  '.jk-insert':        'insertHex',
  '.jk-insert-1':      'insertHex1',
  '.jk-insert-2':      'insertHex2',
  '.jk-insert-3':      'insertHex3',
  '.jk-snap':        'snapHex',
  '.jk-collar-group':'collarHex',
};

// ─── SHARED SVG FIT HELPER ───────────────────────────────────────────────────
function fitSvgMarkup(markup) {
  if (!markup) return null;
  let m = markup
    .replace(/<\?xml[\s\S]*?\?>/i, '')
    .replace(/<!DOCTYPE[\s\S]*?>/i, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  m = m.replace(/<svg\b[^>]*>/i, (tag) => {
    let t = tag;
    const hasViewBox = /viewBox\s*=/i.test(t);
    const wMatch = t.match(/\swidth\s*=\s*"([\d.]+)/i);
    const hMatch = t.match(/\sheight\s*=\s*"([\d.]+)/i);

    t = t.replace(/\s(width|height)\s*=\s*"[^"]*"/gi, '');

    if (!hasViewBox && wMatch && hMatch) {
      t = t.replace(/<svg\b/i, `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`);
    }

    if (!/preserveAspectRatio\s*=/i.test(t))
      t = t.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet"');
    t = t.replace(/<svg\b/i, '<svg width="600" height="600"');
    return t;
  });
  return m;
}

const COLOR_LAYER_OPACITY = '0.8';

// ─── PAINT SVG MARKUP (string-level, no DOM mutation) ───────────────────────
function paintSvgMarkup(markup, colors, classMap, { pocketStyle, collarStyle, showPockets = true, fastener, knitStyle, insertCount = 0, decorations = [] } = {}) {
  if (!markup) return null;
  if (typeof window === 'undefined' || !window.DOMParser) return markup;

  try {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName === 'parsererror' || root.querySelector('parsererror')) {
      return markup;
    }

    root.querySelectorAll('.jk-collar-group').forEach((el) => {
      el.style.display = el.getAttribute('data-collar') === collarStyle ? '' : 'none';
    });

    if (fastener) {
      root.querySelectorAll('.jk-fastener-group').forEach((el) => {
        el.style.display = el.getAttribute('data-fastener') === fastener ? '' : 'none';
      });
    }

    if (knitStyle) {
      root.querySelectorAll('.jk-knit-group').forEach((el) => {
        const list = (el.getAttribute('data-knit') || '')
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean);
        const knitMatch = list.includes(knitStyle);

        let collarOk = true;
        if (el.classList.contains('jk-collar-group')) {
          collarOk = el.getAttribute('data-collar') === collarStyle;
        }

        const isStripeish =
          el.classList.contains('jk-rib') ||
          el.classList.contains('jk-knit-line') ||
          el.classList.contains('jk-knit-border');

        el.removeAttribute('data-knit-inactive');

        if (collarOk && knitMatch) {
          el.style.display = '';
        } else if (collarOk && isStripeish) {
          el.style.display = '';
          el.setAttribute('data-knit-inactive', '1');
        } else {
          el.style.display = 'none';
        }
      });
    }

    root.querySelectorAll('.jk-insert-group').forEach((el) => {
      const list = (el.getAttribute('data-inserts') || '')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      el.style.display = list.includes(String(insertCount)) ? '' : 'none';
    });

    const pocketGroups = root.querySelectorAll('.jk-pocket-group');
    if (pocketGroups.length) {
      pocketGroups.forEach((el) => {
        el.style.display = (showPockets && el.getAttribute('data-pocket') === pocketStyle) ? '' : 'none';
      });
    } else {
      root.querySelectorAll('.jk-pocket').forEach((el) => {
        el.style.display = showPockets ? '' : 'none';
      });
    }

    const isValidHex = (h) => typeof h === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h.trim());
    const FLAT = new Set(['.jk-snap', '.jk-zip', '.jk-knit-line', '.jk-knit-border', '.jk-rib, .jk-knit-base', '.jk-insert', '.jk-insert-1', '.jk-insert-2', '.jk-insert-3']);

    const paint = (el, hex, flat) => {
      el.setAttribute('fill', hex);
      el.style.fill = hex;
      if (flat) {
        el.style.mixBlendMode = 'normal';
        el.style.fillOpacity = '1';
      } else {
        el.style.mixBlendMode = 'multiply';
        el.style.fillOpacity = COLOR_LAYER_OPACITY;
        el.style.strokeOpacity = COLOR_LAYER_OPACITY;
        el.setAttribute('stroke', hex);
        el.style.stroke = hex;
        el.style.strokeWidth = '5';
      }
    };

    const paintStroke = (el, hex, width) => {
      el.setAttribute('fill', 'none');
      el.style.fill = 'none';
      el.style.fillOpacity = '0';
      el.setAttribute('stroke', hex);
      el.style.stroke = hex;
      el.style.strokeOpacity = '1';
      el.style.mixBlendMode = 'normal';
      if (width != null) {
        el.setAttribute('stroke-width', String(width));
        el.style.strokeWidth = String(width);
      }
    };

    const paintBorderOutline = (el, hex, width = 15) => {
      el.setAttribute('stroke', hex);
      el.style.stroke = hex;
      el.style.strokeOpacity = '1';
      el.setAttribute('stroke-width', String(width));
      el.style.strokeWidth = String(width);
      el.style.mixBlendMode = 'normal';
    };

    const allEntries = Object.entries(classMap);
    const borderPass = allEntries.filter(([sel]) => sel === '.jk-knit-border');
    const normalPass = allEntries.filter(([sel]) => sel !== '.jk-knit-border');

    normalPass.forEach(([sel, key]) => {
      const hex = colors[key];
      if (!isValidHex(hex)) return;
      const isFlat = FLAT.has(sel);
      root.querySelectorAll(sel).forEach((el) => {
        if (sel === '.jk-collar-group' &&
            (el.classList.contains('jk-rib') ||
             el.classList.contains('jk-knit') ||
             el.classList.contains('jk-knit-base') ||
             el.classList.contains('jk-knit-line') ||
             el.classList.contains('jk-knit-border'))) {
          return;
        }

        let useHex = hex;
        let useFlat = isFlat;
        if ((sel === '.jk-rib' || sel === '.jk-knit-line') &&
            el.getAttribute('data-knit-inactive') === '1') {
          if (!isValidHex(colors.knitHex)) return;
          useHex = colors.knitHex;
          useFlat = false;
        }

        const targets = el.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
        const list = targets.length ? Array.from(targets) : [el];
        list.forEach((t) => paint(t, useHex, useFlat));
      });
    });

    const knitIsBorder = typeof knitStyle === 'string' && /border/i.test(knitStyle);

    if (knitIsBorder) {
      borderPass.forEach(([sel, key]) => {
        const hex = colors[key];
        if (!isValidHex(hex)) return;
        root.querySelectorAll(sel).forEach((el) => {
          if (el.getAttribute('data-knit-inactive') === '1') return;
          const targets = el.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
          const list = targets.length ? Array.from(targets) : [el];
          list.forEach((t) => paintBorderOutline(t, hex));
        });
      });
    }

    decorations.forEach(({ selector, on, hex, mode = 'stroke', strokeWidth }) => {
      if (!selector) return;
      root.querySelectorAll(selector).forEach((el) => {
        el.style.display = on ? '' : 'none';
        if (on && mode !== 'none' && isValidHex(hex)) {
          const targets = el.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
          const list = targets.length ? Array.from(targets) : [el];
          list.forEach((t) => (mode === 'fill'
            ? paint(t, hex, true)
            : paintStroke(t, hex, strokeWidth)));
        }
      });
    });

    root.querySelectorAll('[id$="_2981436446544"]').forEach((g) => {
      g.parentNode?.appendChild(g);
    });

    root.querySelectorAll('.jk-collar-group').forEach((collar) => {
      collar.parentNode?.appendChild(collar);
    });

    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return markup;
  }
}

// inline SVG ko recolor karne wala component
function FrontBaseSvg({ url, fallbackUrl, colors, pocketStyle, collarStyle, fastener, knitStyle, insertCount = 0, decorations }) {
  const markup = useInlineSvg(url, fallbackUrl);

  // fit + har file ke ids/classes ko us URL ke prefix se scope karo
  const fitted = React.useMemo(() => scopeSvg(fitSvgMarkup(markup), url), [markup, url]);

  const colorKey = JSON.stringify(colors);
  const decoKey = JSON.stringify(decorations || []);
  const painted = React.useMemo(
    () => paintSvgMarkup(fitted, colors, FRONT_CLASS_MAP, { pocketStyle, collarStyle, fastener, knitStyle, insertCount, decorations: decorations || [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitted, colorKey, pocketStyle, collarStyle, fastener, knitStyle, insertCount, decoKey]
  );

  if (!painted) return null;
  return <g key={url} dangerouslySetInnerHTML={{ __html: painted }} />;
}

// ─── SHARED BACK / LEFT / RIGHT / LINING SVG ─────────────────────────────────
function SideBaseSvg({ url, fallbackUrl, colors, collarStyle, showPockets = true, pocketStyle, knitStyle, insertCount = 0, decorations, classMap = SIDE_CLASS_MAP }) {
  const markup = useInlineSvg(url, fallbackUrl);

  const fitted = React.useMemo(() => scopeSvg(fitSvgMarkup(markup), url), [markup, url]);

  const colorKey = JSON.stringify(colors);
  const decoKey = JSON.stringify(decorations || []);
  const painted = React.useMemo(
    () => paintSvgMarkup(fitted, colors, classMap, { pocketStyle, collarStyle, showPockets, knitStyle, insertCount, decorations: decorations || [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitted, colorKey, pocketStyle, collarStyle, showPockets, knitStyle, insertCount, decoKey, classMap]
  );

  if (!painted) return null;
  return <g key={url} dangerouslySetInnerHTML={{ __html: painted }} />;
}

// Inject @font-face into the document <head> exactly once, with absolute URLs.
export function injectJacketFontFaces() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_STYLE_TAG_ID)) return;

  const origin = window.location.origin;
  const css = FONT_DEFS.map((f) => `
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

const GOOGLE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Great+Vibes&family=Old+Standard+TT&display=swap';

if (typeof document !== 'undefined' && !document.querySelector(`link[href="${GOOGLE_FONT_HREF}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONT_HREF;
  document.head.appendChild(link);
}

const getSvgFontFaces = () => `
.leather-jf-Script     { font-family: 'Jacketshop', 'Brush Script MT', cursive !important; }
.leather-jf-Athletic   { font-family: 'Stahls Athletic', 'Arial Black', Impact, sans-serif !important; }
.leather-jf-ProBlock   { font-family: 'Stahls Pro Block', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }
.leather-jf-OldEnglish { font-family: 'Stahls Old English', 'Old English Text MT', serif !important; }
.leather-jf-Vintage    { font-family: 'Stahls Vintage', Georgia, 'Times New Roman', serif !important; }
`;

// ─── Font loading hook ───────────────────────────────────────────────────────
function useFontsReady() {
  const [isReady, setIsReady] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    injectJacketFontFaces();

    if (typeof document === 'undefined' || !document.fonts) {
      setIsReady(true);
      return undefined;
    }

    const run = async () => {
      await Promise.all(
        FONT_DEFS.map((f) => document.fonts.load(`400 32px "${f.family}"`).catch(() => {}))
      );
      try {
        await document.fonts.ready;
      } catch (e) {
        /* ignore */
      }
      if (!cancelled) {
        setIsReady(true);
        setLoadKey((k) => k + 1);
      }
    };
    run();

    const onLoadingDone = () => {
      if (!cancelled) setLoadKey((k) => k + 1);
    };
    document.fonts.addEventListener?.('loadingdone', onLoadingDone);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener?.('loadingdone', onLoadingDone);
    };
  }, []);

  return { isReady, loadKey };
}

// ─── Font resolver ────────────────────────────────────────────────────────────
const DEFAULT_FONT_STYLE = {
  id: 'Script',
  fontFamily: '"Jacketshop", "Brush Script MT", cursive',
  fontWeight: 400,
  fontStyle: 'normal',
  textTransform: 'none',
  extraSpacing: '0.01em',
  transform: 'none',
  syntheticBold: false,
};

const resolveFontStyle = (fontId) => {
  const found = FONT_OPTIONS.find((f) => f.id === fontId);
  return found || DEFAULT_FONT_STYLE;
};

const buildFontTransform = (fontStyleDef, cx, cy) => {
  const t = fontStyleDef && fontStyleDef.transform;
  if (!t || t === 'none') return undefined;
  return `translate(${cx} ${cy}) ${t} translate(${-cx} ${-cy})`;
};

const resolveSportTouchHex = (textureId) => {
  const found = SPORT_TOUCH_TEXTURES.find((t) => t.id === textureId);
  return found ? found.hex : '#c9b577';
};

const resolveFontSize = (height, fallback) => {
  if (!height) return fallback;
  const num = parseFloat(height);
  if (Number.isNaN(num)) return fallback;
  return num * 16;
};

const resolveTextDirection = (obj = {}, prefix) =>
  obj[`${prefix}TextDirection`] || obj[`${prefix}Direction`] || 'straight';

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 26, g: 26, b: 26 };
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return { r: 26, g: 26, b: 26 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};
const lightenColor = (hex, amount = 35) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
};
const darkenColor = (hex, amount = 35) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
};

// ─── EMBLEMS ─────────────────────────────────────────────────────────────────
const renderEmblem = (emblemId, color, size = 73) => {
  if (emblemId === 'basketball') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={color} strokeWidth="6">
        <circle cx="50" cy="50" r="45" />
        <path d="M15 50h70M50 15v70" />
        <path d="M22 22c15 15 15 41 0 56M78 22c-15 15-15 41 0 56" />
      </svg>
    );
  }
  if (emblemId === 'star_shield') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} fill={color}>
        <path d="M50 5 L90 25 V65 C90 80 50 95 50 95 C50 95 10 80 10 65 V25 Z" fill="none" stroke={color} strokeWidth="6" />
        <polygon points="50,25 57,40 73,42 61,54 65,70 50,62 35,70 39,54 27,42 43,40" />
      </svg>
    );
  }
  if (emblemId === 'lightning') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} fill={color}>
        <polygon points="60,5 25,55 50,55 40,95 75,45 50,45" />
      </svg>
    );
  }
  if (emblemId === 'music_note') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} fill={color}>
        <path d="M35 75 A12 12 0 1 1 23 63 L23 20 L75 10 L75 55 A12 12 0 1 1 63 43 L63 25 L35 30 L35 75 Z" />
      </svg>
    );
  }
  return <HelpCircle size={size} style={{ color }} />;
};

const quadPoint = (t, p0, p1, p2) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

// ─── StaggeredText ───────────────────────────────────────────────────────────
const StaggeredText = ({
  text, cx, cy, fontId, fillColor, strokeColor, fontSize = 32,
  letterSpacing, uppercase = false, material, sportTouchTexture,
  fontLoadKey = 0,
}) => {
  if (!text) return null;

  const fontStyleDef   = resolveFontStyle(fontId);
  const resolvedFontId = fontStyleDef.id || 'Script';
  const fontFamilyStr  = fontStyleDef.fontFamily;

  const shouldUppercase = uppercase || fontStyleDef.textTransform === 'uppercase';
  const displayText = shouldUppercase ? String(text).toUpperCase() : String(text);
  const chars = displayText.split('');

  let fill = fillColor || '#ffffff';
  if (material === 'SportTouch') fill = resolveSportTouchHex(sportTouchTexture) || fill;

  const resolvedLetterSpacing = '-0.2em';

  const fontTransform = buildFontTransform(fontStyleDef, cx, cy);

  const fontProps = {
    className: `leather-jf-${resolvedFontId}`,
    fontFamily: fontFamilyStr,
    fontWeight: fontStyleDef.fontWeight || 400,
    fontStyle: fontStyleDef.fontStyle || 'normal',
    style: {
      fontFamily: fontFamilyStr,
      fontWeight: fontStyleDef.fontWeight || 400,
      fontStyle: fontStyleDef.fontStyle || 'normal',
    },
  };

  const stepY = fontSize * 0.35;
  const stepX = fontSize * 0.12;

  const renderChars = () => chars.map((ch, i) => (
    <tspan
      key={i}
      dx={i === 0 ? 0 : stepX}
      dy={i === 0 ? -stepY : stepY}
      {...fontProps}
    >
      {ch}
    </tspan>
  ));

  return (
    <g key={`${resolvedFontId}-${fontLoadKey}-${displayText}`} transform={fontTransform}>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="none"
        stroke={strokeColor || 'none'}
        strokeWidth={strokeColor ? fontSize * 0.22 : 0}
        strokeLinejoin="round"
        fontSize={fontSize}
        letterSpacing={resolvedLetterSpacing}
        {...fontProps}
      >
        {renderChars()}
      </text>

      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fill}
        fontSize={fontSize}
        letterSpacing={resolvedLetterSpacing}
        {...fontProps}
      >
        {renderChars()}
      </text>
    </g>
  );
};

StaggeredText.propTypes = {
  text: PropTypes.string,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  fontId: PropTypes.string,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  fontSize: PropTypes.number,
  letterSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  uppercase: PropTypes.bool,
  material: PropTypes.string,
  sportTouchTexture: PropTypes.string,
  fontLoadKey: PropTypes.number,
};

// ─── ArcText ─────────────────────────────────────────────────────────────────
const ArcText = ({
  text, cx, cy, fontId, fillColor, strokeColor, fontSize = 32,
  arc = 0, material, sportTouchTexture, rhinestones, letterSpacing,
  textDirection = 'straight', uppercase = false, fontLoadKey = 0,
}) => {
  const reactId = useId();
  const safeId = String(reactId).replace(/[^a-zA-Z0-9_-]/g, '');
  const pathId = `arc-${safeId}`;
  const glitterId = `glitter-${safeId}`;

  if (!text) return null;

  const fontStyleDef = resolveFontStyle(fontId);
  const resolvedFontId = fontStyleDef.id || 'Script';
  const shouldUppercase = uppercase || fontStyleDef.textTransform === 'uppercase';
  const displayText = shouldUppercase ? String(text).toUpperCase() : String(text);
  const chars = displayText.split('');

  const resolvedLetterSpacing =
    letterSpacing !== undefined ? letterSpacing : (fontStyleDef.extraSpacing || '1');

  let fill = fillColor || '#ffffff';
  if (material === 'SportTouch') {
    fill = resolveSportTouchHex(sportTouchTexture) || fill;
  }

  const hasUserStroke = strokeColor && strokeColor !== fill;
  const stroke = hasUserStroke ? strokeColor : (fontStyleDef.syntheticBold ? fill : 'none');
  let strokeWidth = stroke !== 'none'
    ? Math.max(1.5, fontSize * (hasUserStroke ? 0.06 : (fontStyleDef.syntheticBold ? 0.1 : 0)))
    : 0;

  let dashArray;
  let extraOpacity = 1;
  if (material === 'Chenille') {
    strokeWidth = Math.max(strokeWidth, fontSize * 0.1);
    dashArray = '1.5 1.5';
  } else if (material === 'Embroidery') {
    strokeWidth = Math.max(strokeWidth || 1, 1.2);
  } else if (material === 'GlitterVinyl') {
    extraOpacity = 0.95;
  }

  const halfWidth = Math.max(36, displayText.length * fontSize * 0.32);
  const curveAmt = (arc / 100) * (fontSize * 1.6);
  const p0 = { x: cx - halfWidth, y: cy };
  const p1 = { x: cx, y: cy - curveAmt };
  const p2 = { x: cx + halfWidth, y: cy };

  const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  const rhinestonePoints = [];
  if (rhinestones && displayText.trim().length > 0) {
    const rChars = displayText.split('');
    const nonSpace = rChars.filter((c) => c !== ' ').length || 1;
    let seen = 0;
    rChars.forEach((ch, idx) => {
      if (ch === ' ') return;
      seen += 1;
      const t = (seen - 0.5) / nonSpace;
      const base = quadPoint(t, p0, p1, p2);
      const seed = Math.sin((ch.charCodeAt(0) + idx * 7.13) * 12.9898) * 43758.5453;
      const jitter = (seed - Math.floor(seed)) - 0.5;
      rhinestonePoints.push({ ...base, jitter });
    });
  }
  const rhinestoneCenterOffset = fontSize * 0.32;
  const rhinestoneSpread = fontSize * 0.34;
  const rhinestoneRadius = Math.min(4, Math.max(1.6, fontSize * 0.055));

  const fontTransform = buildFontTransform(fontStyleDef, cx, cy);
  const fontFamilyStr = fontStyleDef.fontFamily;

  const fontProps = {
    className: `leather-jf-${resolvedFontId}`,
    fontFamily: fontFamilyStr,
    fontWeight: fontStyleDef.fontWeight || 400,
    fontStyle: fontStyleDef.fontStyle || 'normal',
    style: {
      fontFamily: fontFamilyStr,
      fontWeight: fontStyleDef.fontWeight || 400,
      fontStyle: fontStyleDef.fontStyle || 'normal',
    },
  };

  return (
    <g opacity={extraOpacity}>
      <defs>
        <path id={pathId} d={d} />
        {material === 'GlitterVinyl' && (
          <radialGradient id={glitterId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={lightenColor(fill, 60)} />
            <stop offset="45%" stopColor={lightenColor(fill, 15)} />
            <stop offset="100%" stopColor={fill} />
          </radialGradient>
        )}
      </defs>

      <g key={`${resolvedFontId}-${fontLoadKey}-${displayText}`} transform={fontTransform}>
        {textDirection === 'staggered' ? (
          <text
            fill={material === 'GlitterVinyl' ? `url(#${glitterId})` : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            paintOrder="stroke fill"
            fontSize={fontSize}
            letterSpacing="-0.2em"
            textAnchor="middle"
            dominantBaseline="middle"
            x={cx}
            y={cy}
            {...fontProps}
          >
            {chars.map((ch, i) => (
              <tspan
                key={i}
                dx={i === 0 ? 0 : fontSize * 0.12}
                dy={i === 0 ? -fontSize * 0.35 : fontSize * 0.35}
                {...fontProps}
              >
                {ch}
              </tspan>
            ))}
          </text>
        ) : (
          <text
            fill={material === 'GlitterVinyl' ? `url(#${glitterId})` : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            paintOrder="stroke fill"
            fontSize={fontSize}
            letterSpacing={resolvedLetterSpacing}
            {...fontProps}
          >
            <textPath
              href={`#${pathId}`}
              xlinkHref={`#${pathId}`}
              startOffset="50%"
              textAnchor="middle"
              className={`leather-jf-${resolvedFontId}`}
              style={{
                fontFamily: fontFamilyStr,
                fontWeight: fontStyleDef.fontWeight || 400,
                fontStyle: fontStyleDef.fontStyle || 'normal',
              }}
            >
              {displayText}
            </textPath>
          </text>
        )}
      </g>

      {rhinestones && (
        <g>
          {rhinestonePoints.map((pt, i) => {
            const yPos = pt.y - rhinestoneCenterOffset + pt.jitter * rhinestoneSpread;
            return (
              <g key={i} transform={`translate(${pt.x} ${yPos})`}>
                <circle r={rhinestoneRadius} fill="#cfe3f7" stroke="#3b5a78" strokeWidth="0.5" />
                <circle cx={-rhinestoneRadius * 0.3} cy={-rhinestoneRadius * 0.3} r={rhinestoneRadius * 0.35} fill="#ffffff" />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

ArcText.propTypes = {
  text: PropTypes.string,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  fontId: PropTypes.string,
  fillColor: PropTypes.string,
  strokeColor: PropTypes.string,
  fontSize: PropTypes.number,
  arc: PropTypes.number,
  material: PropTypes.string,
  sportTouchTexture: PropTypes.string,
  rhinestones: PropTypes.bool,
  letterSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textDirection: PropTypes.string,
  uppercase: PropTypes.bool,
  fontLoadKey: PropTypes.number,
};

// ─── SVG Patch Image ──────────────────────────────────────────────────────────
const SvgPatch = ({ url, x, y, size = 80 }) => {
  if (!url) return null;
  return (
    <image
      href={url}
      x={x - size / 1.8}
      y={y - size / 1.2}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      crossOrigin="anonymous"
    />
  );
};

SvgPatch.propTypes = {
  url: PropTypes.string,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  size: PropTypes.number,
};

// ─── Patch Graphic ────────────────────────────────────────────────────────────
const PATCH_FONT_STYLES = {
  Classic: {
    fontFamily: '"Stahls Pro Block", "Helvetica Neue", Helvetica, Arial, sans-serif',
    className: 'leather-jf-ProBlock',
    fontWeight: 400,
    fontStyle: 'normal',
    transform: undefined,
  },
  Crazy: {
    fontFamily: '"Stahls Vintage", Georgia, "Times New Roman", serif',
    className: 'leather-jf-Vintage',
    fontWeight: 400,
    fontStyle: 'normal',
    transform: undefined,
  },
};

const PATCH_CATEGORY_LABELS = {
  Year: 'YEAR',
  PositionNumber: 'POS',
  Academics: 'ACADEMICS',
  Athletics: 'ATHLETICS',
  BandMusic: 'BAND',
  CheerDanceDrill: 'CHEER',
  CrazyWord: 'CRAZY',
  CustomFlags: 'FLAG',
  FFAAnimalsRodeo: 'FFA',
  ROTC: 'ROTC',
  WalkingPatches: 'WALK',
};

const PatchGraphic = ({ segment, cx, cy, size = 70 }) => {
  if (!segment) return null;
  const category = segment.patchCategory;
  if (!category || category === 'None') return null;

  let label = PATCH_CATEGORY_LABELS[category] || category;
  if (category === 'Year') {
    label = segment.patchYearText || '26';
  }
  if (category === 'PositionNumber') {
    label = segment.patchPositionText || '6';
  }

  const outlineColor = segment.patchOutlineColor || '#f3ead9';
  const patchStyle = segment.patchStyle || 'Chenille';
  const rhinestones = !!segment.patchRhinestones;
  const classBadge = !!segment.patchClassBadge;

  let textColor = segment.patchChenilleColor || '#c9a24b';
  if (patchStyle === 'SportTouch') textColor = resolveSportTouchHex(segment.patchSportTouchTexture);
  if (patchStyle === 'GlitterVinyl') textColor = lightenColor(textColor, 15);

  const patchFontKey = segment.patchFontStyle === 'Crazy' ? 'Crazy' : 'Classic';
  const fontStyleDef = PATCH_FONT_STYLES[patchFontKey];
  const displayLabel = String(label).toUpperCase();

  const fontSize = Math.min(size * 1.25, (size * 2.1) / Math.max(displayLabel.length, 1) * 1.6);
  const strokeWidth = Math.max(fontSize * 0.16, 3);

  const fontTransform = buildFontTransform(fontStyleDef, cx, cy);
  const textWidth = displayLabel.length * fontSize * 0.62;

  const rhinestoneDots = (yPos, keyPrefix) =>
    Array.from({ length: 5 }).map((_, i) => {
      const t = i / 4;
      const px = cx - textWidth / 2 + t * textWidth;
      return (
        <g key={`${keyPrefix}-${i}`} transform={`translate(${px} ${yPos})`}>
          <circle r="1.6" fill="#cfe3f7" stroke="#3b5a78" strokeWidth="0.4" />
          <circle cx="-0.4" cy="-0.4" r="0.6" fill="#ffffff" />
        </g>
      );
    });

  return (
    <g filter="url(#overlayDropShadow)">
      <g transform={fontTransform}>
        <text
          className={fontStyleDef.className}
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          stroke={outlineColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke fill"
          style={{
            fontFamily: fontStyleDef.fontFamily,
            fontWeight: fontStyleDef.fontWeight,
            fontStyle: fontStyleDef.fontStyle,
          }}
          fontWeight={fontStyleDef.fontWeight}
          fontStyle={fontStyleDef.fontStyle}
          fontSize="55"
          letterSpacing="0.01em"
        >
          {displayLabel}
        </text>
      </g>

      {classBadge && (
        <g transform={`translate(${cx + textWidth / 2 - 4}, ${cy - fontSize / 2 - 6})`}>
          <polygon
            points="6,0 7.8,4.6 12.6,4.9 8.8,7.8 10.1,12.5 6,9.7 1.9,12.5 3.2,7.8 -0.6,4.9 4.2,4.6"
            fill={outlineColor}
            opacity={0.9}
          />
        </g>
      )}

      {rhinestones && (
        <g>
          {rhinestoneDots(cy - fontSize / 2 - 4, 'rt')}
          {rhinestoneDots(cy + fontSize / 2 + 4, 'rb')}
        </g>
      )}
    </g>
  );
};

PatchGraphic.propTypes = {
  segment: PropTypes.object,
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  size: PropTypes.number,
};

// ─── CHEST POCKET GRAPHIC ────────────────────────────────────────────────────
const CHEST_POCKET_STITCH_Y = [183.6, 185.3, 187, 188.6, 190.3, 191.9, 193.6, 195.3, 196.9, 198.6, 200.2, 201.9, 203.5, 205.2, 206.9, 208.5, 210.2, 211.8, 213.5, 215.1, 216.8, 218.5, 220.1, 221.8, 223.4, 225.1, 226.7, 228.4, 230.1, 231.7, 233.4, 235];

const ChestPocketGraphic = ({ x = 0, y = 0, scale = 1, hex = '#9ca1a4' }) => {
  const shadeHex = darkenColor(hex, 25);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g>
        {CHEST_POCKET_STITCH_Y.map((sy, i) => (
          <rect key={sy} x={i % 2 === 0 ? 333.1 : 331.8} y={sy} width="1.7" height="0.8" fill={hex} />
        ))}
      </g>
      <path
        d="M334.9,167.8h-3.3c0,0-1.2,9.4-1.2,10.3c0,1.5,1.3,2.8,2.8,2.8c1.5,0,2.8-1.3,2.8-2.8    C336.1,177.2,334.9,167.8,334.9,167.8z M333.3,179.6c-0.9,0-1.7-0.7-1.7-1.7c0-0.9,0.8-1.7,1.7-1.7c0.9,0,1.7,0.7,1.7,1.7    C335,178.9,334.2,179.6,333.3,179.6z"
        fill={shadeHex}
      />
      <path
        d="M331.4,182v54.5v0.6h0.5h2.7h0.5v-0.6V182H331.4z M332,236.5v-53.6h2.7v53.6H332z"
        fill={hex}
      />
      <path
        d="M335.3,238.7h-3.9c-1,0-1.8-0.8-1.8-1.8v-69c0-1,0.8-1.8,1.8-1.8h3.9c1,0,1.8,0.8,1.8,1.8   v69C337,237.9,336.2,238.7,335.3,238.7z"
        style={{ opacity: 0.25, fill: 'none', stroke: '#000000', strokeMiterlimit: 10 }}
      />
    </g>
  );
};

ChestPocketGraphic.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  scale: PropTypes.number,
  hex: PropTypes.string,
};

// ─── ZIP FLAP GRAPHIC ────────────────────────────────────────────────────────
const ZIP_FLAP_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAADFCAYAAAAVH684AAAACXBIWXMAAAsSAAALEgHS3X78AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABZdJREFUeNrsndtu4zAMROXV///J5mIfCriGLpSsC0WOgCJpG2wXJzMcirbjELCwsA5bpPz/w5rhXcreuJY3kz0qjwTPa6BYA0za9Pfo9bwFHhd+thQkLQaX+qoB5M7H6RCvjeBiBmQLvNrzqRCvxep+gosJgM/XcwUgZ77nVQB3KC8mvnLqywHMgbtXQrw21bxfaD8veG+lluClFEcZkPfj9TQK4I4+r2Td0KC+Gjx6AAwZJfIpti0lbhQ2zrXwiA9g9AAYXgocosJrkcpqAEMlcZ//HidChROKe/+NX3DDAF4bLFtK4SBoWagAtQYwJFTYDXDX3janNmocGlAB4hPg+zVvFXYB3DkYGKniHMi3YlNvTjfAk+HlQNEDQhTCuHvS1wq8HMTfFSt75645ojV4uVQOBRVyr32twiuFz7Ov5IR9ybvyShBjYctHhe2hS3g1gKkx1i0B6AVeyLQy9KiFnEjrAOWlIT7rXg5gUX3RKTh6hUdpypNd0bHyaocEqgA92jYIpjxU2Oa5Vl5uotOsvBh8L6n6AE8QHhTyc0bAawAL5TXCohaYgPd3e8aV3wNeA0zYtgDo/Zg6rsuAJwMosbB7eDlYqXNdAK9S11LgqtaNzlUXQv70NChP0Jrcj8f7pUDUPIHq7h71Rajuj+rESesNnkR1TQAjVFdUHQJjhuo82naY6rzAm6I6b7YdqjrPgfFZdR7g1a4Q+nR5gaeaV9uKNZ/QHR1Ay9W8zxe1eLAtN9rWPTwWpO3nC/qiI9Xdr5r3SXVW4fUMO2FbYVN8f1WcVXhDh51ebTtk2OkJ3rQBgCfbDh8AWIe3XHUWbbtMdVbgbVGdNdsuVZ0FeNtUZ8m2y1VnNTCWqO50eFNH7J5q3vARu2V400fsHmw7bcRuFd6SEbtl204dsVuEt2zEbtm200fsWuHRYIhTRuya4PV80OCIptiF8qgD4PKmeCe8lNqkClTRFGsJjBxI1U3xDngtH22puinWaNtjmuKV8Jqv2dfeFJ/Y56lpik/eYWxvik+Cp64pPk15qpriU+CpbIpPsy3DtnNAhp2q0wqvFBQqat0pNY8LOwneqbr/61IIrDUooLzOoIBtGyGqWfEAYGqa4pMCo3YTuO0AL0WwVO9jTw2MWyvE1fDoI7jgTXnSY7ZcqXfBu21pgFXZGzzpwZ8jgmJnYFAHOJdpKzlmy6cpToNtw+m2vTbAIkFznDqsyF6VJ7Ht9jMATt1hlM49cWdbieqk+1m3ypPcEuZIcKttSxn18anqi5ughUSSHqO4lbY11dvNDozSXZ3eN6F8j9nV93YrlNd7xidsW1BcDZz63k5Dk3xsb7e7z2MLlp1d86gyEChNitkjvNy9EiXj9wDl1ROXLVh2RauSq3m1s9qhPIH67hMVNwMeFeqeqRZlZmBIBwKqj8nusm3qDAET27EdgWFmOzYLXqretVoWgdGovGPBzd5hUMaWZiDODAzJdix4V97X/s69bUv9nZrL2rUHRsvxWdhWANFUbzcSXml6YrbWzQiM4MmyowODGsOCAa+sNrOq+wqPCtuykl1h20qDnEtTUwDjZMsGq5YdmbbHX5DSs0aeJUVeguKr8kjY45kMillpm6tzJgFekywbLCtuVdqaBhg/qExiWdM17/pgU6pY1qxdZ9oWrUqHhYN1WDNalRDKH6IFeK9aJ+ntAlqV74MBKE8I7MgTs3fuMFyo7KvyWj/KCPCgyDlpS96tOzMwAK/Tnqh5jWHhbrW0KlQBxt4g9gQG+r4PNY9gWTk8qG1RqwJ4DepjzwBH7m1h2w6ACIyPakNgAOC6wHBr11GtCgOeTG0EgPOaZMBDc7xGeQiMjqRlAJTDqx3ERmDAsu3rR2BXtCidWy+q1D0GvL7fQ3kdr0O9w8LCwsLCwsLSv/4JMADqtM1FJGZo5wAAAABJRU5ErkJggg==';

const ZipFlapGraphic = ({ x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g>
      <path
        d="M306.621,235.121
          c-9.12,25.462-15.807,40.539-19.644,56.266c-2.193,9.741-3.755,16.357-3.755,16.357V517.69h34.667V206.862
          C313.932,216.005,310.021,225.629,306.621,235.121z"
        style={{ opacity: 0.05, fill: 'rgb(255, 255, 255)', stroke: 'rgb(0, 0, 0)', strokeMiterlimit: 10 }}
      />
      <image
        width="79"
        height="197"
        href={ZIP_FLAP_TEXTURE}
        xlinkHref={ZIP_FLAP_TEXTURE}
        transform="matrix(1 0 0 1 275 122)"
        style={{ overflow: 'visible', opacity: 0.72 }}
      />
      <g>
        <g>
          <path
            d="M286.977,291.389
              c-2.466,10.108-3.755,16.354-3.755,16.354S284.784,301.129,286.977,291.389z"
            style={{ opacity: 0.1, fill: 'rgb(255, 255, 255)', stroke: 'rgb(0, 0, 0)', strokeMiterlimit: 10 }}
          />
          <path
            d="M340.789,149.015
              c-12.103-24.941-37.977-18.713-37.977-18.713s0.075,77.303-2.256,100.556c-1.59,15.866-8.976,40.09-13.579,60.53
              c3.837-15.727,10.524-30.805,19.644-56.269c10.975-30.641,27.269-62.669,33.295-75.383
              C342.472,154.345,342.396,152.329,340.789,149.015z"
            style={{ opacity: 0.1, fill: 'rgb(255, 255, 255)', stroke: 'rgb(0, 0, 0)', strokeMiterlimit: 10 }}
          />
        </g>
      </g>
    </g>
    <path
      d="M319.889,202.292V517.69h1V200.039
        C320.556,200.786,320.223,201.536,319.889,202.292z"
      style={{ opacity: 0.1 }}
    />
  </g>
);

ZipFlapGraphic.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  scale: PropTypes.number,
};

// ─── FRONT VIEW ──────────────────────────────────────────────────────────────
const FrontView = ({
  url, fallbackUrl,
  bodyHex, sleeveHex, pocketHex, knitHex, knitLineHex, knitBorderHex,
  pocketStyle, collarStyle, collarHex, snapHex, fastener, knitStyle, insertCount = 0,
  insertHex1 = '#9ca1a4', insertHex2 = '#9ca1a4', insertHex3 = '#9ca1a4',
  addSleeveStripe = false,   sleeveStripeHex   = '#000000',
  addPocketPiping = false,   pocketPipingHex   = '#000000',
  addShoulderPiping = false, shoulderPipingHex = '#000000',
  addStripePiping = false,   stripePipingHex   = '#000000',
}) => (
  <FrontBaseSvg
    url={url}
    fallbackUrl={fallbackUrl}
    colors={{ bodyHex, sleeveHex, pocketHex, knitHex, knitLineHex, knitBorderHex, collarHex, snapHex,
      insertHex: insertHex1, insertHex1, insertHex2, insertHex3 }}
    pocketStyle={pocketStyle}
    collarStyle={collarStyle}
    fastener={fastener}
    knitStyle={knitStyle}
    insertCount={insertCount}
    decorations={[
      { selector: '.jk-sleeve-stripe',   on: addSleeveStripe,   hex: sleeveStripeHex,   mode: 'stroke', strokeWidth: 40 },
      { selector: '.jk-pocket-piping',   on: addPocketPiping,   hex: pocketPipingHex,   mode: 'stroke', strokeWidth: 24 },
      { selector: '.jk-shoulder-piping', on: addShoulderPiping, hex: shoulderPipingHex, mode: 'stroke', strokeWidth: 30 },
      { selector: '.jk-stripe-piping',   on: addStripePiping,   hex: stripePipingHex,   mode: 'stroke', strokeWidth: 24 },
    ]}
  />
);

FrontView.propTypes = {
  url: PropTypes.string.isRequired,
  fallbackUrl: PropTypes.string,
  bodyHex: PropTypes.string,
  sleeveHex: PropTypes.string,
  knitHex: PropTypes.string,
  knitStyle: PropTypes.string,
  pocketHex: PropTypes.string,
  pocketStyle: PropTypes.string,
  knitLineHex: PropTypes.string,
  knitBorderHex: PropTypes.string,
  collarStyle: PropTypes.string,
  collarHex: PropTypes.string,
  snapHex: PropTypes.string,
  fastener: PropTypes.string,
  insertCount: PropTypes.number,
  insertHex1: PropTypes.string,
  insertHex2: PropTypes.string,
  insertHex3: PropTypes.string,
  addSleeveStripe: PropTypes.bool,
  sleeveStripeHex: PropTypes.string,
  addPocketPiping: PropTypes.bool,
  pocketPipingHex: PropTypes.string,
  addShoulderPiping: PropTypes.bool,
  shoulderPipingHex: PropTypes.string,
  addStripePiping: PropTypes.bool,
  stripePipingHex: PropTypes.string,
};

// ─── DECORATION RENDERER ─────────────────────────────────────────────────────
const SegmentDecoration = ({ segment, x, y, size = 80, fontSize = 34, fontLoadKey = 0 }) => {
  if (!segment || segment.type === 'None') return null;

  if (segment.type === 'Text' && segment.text) {
    const resolvedSize = segment.height
      ? resolveFontSize(segment.height, fontSize) * (fontSize / 48)
      : fontSize;
    return (
      <ArcText
        text={segment.text}
        cx={x}
        cy={y}
        fontId={segment.font}
        fillColor={segment.fillColor || segment.color}
        strokeColor={segment.strokeColor}
        fontSize={resolvedSize}
        arc={segment.arc}
        material={segment.material}
        sportTouchTexture={segment.sportTouchTexture}
        rhinestones={segment.rhinestones}
        letterSpacing={segment.letterSpacing}
        uppercase={segment.uppercase}
        textDirection={segment.textDirection || 'straight'}
        fontLoadKey={fontLoadKey}
      />
    );
  }

  if (segment.type === 'Emblem' && segment.patchId) {
    return (
      <g transform={`translate(${x - size / 2}, ${y - size / 2})`}>
        {renderEmblem(segment.patchId, segment.color || '#ffffff', size)}
      </g>
    );
  }

  if (segment.type === 'Patch') {
    if (segment.patchImageUrl) {
      return <SvgPatch url={segment.patchImageUrl} x={x} y={y} size={size} />;
    }
    if (segment.patchCategory && segment.patchCategory !== 'None') {
      return <PatchGraphic segment={segment} cx={x} cy={y} size={size} />;
    }
    if (segment.patchUrl) {
      return <SvgPatch url={segment.patchUrl} x={x} y={y} size={size} />;
    }
    return null;
  }

  return null;
};

SegmentDecoration.propTypes = {
  segment: PropTypes.object,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  size: PropTypes.number,
  fontSize: PropTypes.number,
  fontLoadKey: PropTypes.number,
};

// ─── BACK LINE RENDERER ──────────────────────────────────────────────────────
const BackLine = ({ back, prefix, cy, fontLoadKey }) => {
  const text = back[`${prefix}Text`];
  if (!text) return null;

  const direction = resolveTextDirection(back, prefix);
  const fontId = back[`${prefix}Font`];
  const fillColor = back[`${prefix}Color`] || '#ffffff';
  const strokeColor = back[`${prefix}StrokeColor`];
  const fontSize = resolveFontSize(back[`${prefix}Height`], 34) * (40 / 48);
  const material = back[`${prefix}Material`];
  const sportTouchTexture = back[`${prefix}SportTouchTexture`];

  return (
    <g filter="url(#overlayDropShadow)">
      {direction === 'staggered' ? (
        <StaggeredText
          text={text}
          cx={300}
          cy={cy}
          fontId={fontId}
          fillColor={fillColor}
          strokeColor={strokeColor}
          fontSize={fontSize}
          material={material}
          sportTouchTexture={sportTouchTexture}
          letterSpacing="2"
          fontLoadKey={fontLoadKey}
        />
      ) : (
        <ArcText
          text={text}
          cx={300}
          cy={cy}
          fontId={fontId}
          fillColor={fillColor}
          strokeColor={strokeColor}
          fontSize={fontSize}
          arc={back[`${prefix}Arc`] ?? 0}
          material={material}
          sportTouchTexture={sportTouchTexture}
          rhinestones={back[`${prefix}Rhinestones`]}
          letterSpacing="2"
          fontLoadKey={fontLoadKey}
        />
      )}
    </g>
  );
};

BackLine.propTypes = {
  back: PropTypes.object.isRequired,
  prefix: PropTypes.string.isRequired,
  cy: PropTypes.number.isRequired,
  fontLoadKey: PropTypes.number,
};

// ─── DEFAULT STATE ───────────────────────────────────────────────────────────
// ⚠️ Parent (LettermanJackets.jsx) mein bhi initial state yahi use karo.
export const DEFAULT_JACKET_STATE = {
  style: DEFAULT_SKIN,
  bodyMaterial: DEFAULT_SKIN,   // default skin = Ostrich
  sleeveMaterial: 'Cowhide Leather',
  snapsOrZipper: 'Snap',
  addZipperFlap: false,
  showPockets: true,
  pocketStyle: 'Slash',
  cuffStyle: 'Classic',
  addChestPocket: false,
  addSleeveStripe: false,
  addPocketPiping: false,
  addShoulderPiping: false,
  addStripePiping: false,
  proCuffColor:        { hex: '#000000', name: 'Black' },
  chestPocketColor:    { hex: '#9ca1a4', name: 'Silver' },
  sleeveStripeColor:   { hex: '#d4af37', name: 'Gold' },
  pocketPipingColor:   { hex: '#d4af37', name: 'Gold' },
  shoulderPipingColor: { hex: '#d4af37', name: 'Gold' },
  stripePipingColor:   { hex: '#d4af37', name: 'Gold' },
  bodyColor:           { hex: '#1a1a2e' },
  sleeveColor:         { hex: '#000000' },
  pocketColor:         { hex: '#1a1a2e' },
  shoulderColor:       { hex: '#9ca1a4' },
  knitBaseColor:       { hex: '#1a1a2e' },
  knitLineColor:       { hex: '#d4af37' },
  knitBorderColor:     { hex: '#d4af37' },
  knitFeatheringColor: { hex: '#000000' },
  knitStyle: 'Plain Knit',
  snapColor:           { hex: '#c0c0c0' },
  innerLiningColor:    { hex: '#dc2626' },
  innerLining: 'Quilted',
  hasShoulderInserts: false,
  shoulderInsertCount: 0,
  collarStyle: 'classic_standup',
  collarColor: { hex: '#000', name: 'Black' },
  leftChest:   { type: 'None', text: '', color: '#ffffff', font: 'Script', material: 'Embroidery', height: '3"', arc: 0, textDirection: 'straight', rhinestones: false },
  rightChest:  { type: 'None', text: '', color: '#ffffff', font: 'Script', material: 'Embroidery', height: '3"', arc: 0, textDirection: 'straight', rhinestones: false },
  leftSleeve:  { type: 'None', text: '', color: '#000000', font: 'Script', material: 'Embroidery', height: '2"', arc: 0, textDirection: 'straight', rhinestones: false },
  rightSleeve: { type: 'None', text: '', color: '#000000', font: 'Script', material: 'Embroidery', height: '2"', arc: 0, textDirection: 'straight', rhinestones: false },
  back: { type: 'None' },
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function JacketVisualPreview({ state = DEFAULT_JACKET_STATE, view, onChangeView }) {
  const { isReady, loadKey } = useFontsReady();

  const safeState = state && typeof state === 'object' ? state : null;

  // ── SKIN ──────────────────────────────────────────────────────────────────
  const skinName     = getSkinName(safeState);       // hamesha valid (default Ostrich)
  const skinSelected = skinName !== '';

  const svgSet = useMemo(
    () => (skinSelected ? resolveSkinSvgSet(skinName) : null),
    [skinSelected, skinName]
  );

  const { loading: skinLoading, loadedKey } = useSkinPreload(svgSet);

  // Is skin ki kaunsi files server par nahi mili (→ Ostrich fallback dikh raha hai)
  const missingFiles = useMemo(() => {
    if (!svgSet || skinName === DEFAULT_SKIN) return [];
    return JACKET_SIDES.map((s) => svgSet[s]).filter((u) => svgMissing.has(u));
    // loadedKey: preload khatam hone par dobara check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgSet, skinName, loadedKey]);

  // ── warning (sirf safety ke liye — default skin hamesha hoti hai) ──
  const [warning, setWarning] = useState({ tick: 0, visible: false });

  const showSkinWarning = useCallback(() => {
    setWarning((w) => ({ tick: w.tick + 1, visible: true }));
  }, []);

  useEffect(() => {
    if (!warning.visible) return undefined;
    const id = setTimeout(() => {
      setWarning((w) => ({ ...w, visible: false }));
    }, SKIN_WARNING_MS);
    return () => clearTimeout(id);
  }, [warning.tick, warning.visible]);

  useEffect(() => {
    if (skinSelected) setWarning((w) => (w.visible ? { ...w, visible: false } : w));
  }, [skinSelected]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.addEventListener(SKIN_WARNING_EVENT, showSkinWarning);
    return () => window.removeEventListener(SKIN_WARNING_EVENT, showSkinWarning);
  }, [showSkinWarning]);

  // Nayi skin select hui → nayi jacket Front se dikhao.
  const prevSkinRef = useRef(skinName);
  useEffect(() => {
    if (prevSkinRef.current === skinName) return;
    prevSkinRef.current = skinName;
    if (skinName && view !== 'Front' && typeof onChangeView === 'function') {
      onChangeView('Front');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skinName]);

  if (!safeState) {
    return (
      <div className="leather-jacket-preview-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p>Loading jacket preview...</p>
        </div>
      </div>
    );
  }

  const bodyHex         = safeState.bodyColor?.hex          || '#1a1a2e';
  const sleeveHex       = safeState.sleeveColor?.hex        || '#000000';
  const pocketHex       = safeState.pocketColor?.hex        || '#1a1a2e';
  const pocketStyle     = safeState.pocketStyle             || 'Slash';
  const knitHex         = safeState.knitBaseColor?.hex      || '#1a1a2e';
  const knitLineHex     = safeState.knitLineColor?.hex      || '#d4af37';
  const knitBorderHex   = safeState.knitBorderColor?.hex    || knitLineHex;
  const knitStyle       = safeState.knitStyle               || 'Plain Knit';
  const snapsOrZipper   = safeState.snapsOrZipper           || 'Snap';
  const addZipperFlap   = safeState.addZipperFlap === true;
  const showPockets     = safeState.showPockets !== false;
  const addChestPocket    = safeState.addChestPocket === true;
  const addSleeveStripe   = safeState.addSleeveStripe === true;
  const addPocketPiping   = safeState.addPocketPiping === true;
  const addShoulderPiping = safeState.addShoulderPiping === true;
  const addStripePiping   = safeState.addStripePiping === true;
  const chestPocketHex    = safeState.chestPocketColor?.hex    || '#9ca1a4';
  const sleeveStripeHex   = safeState.sleeveStripeColor?.hex   || '#d4af37';
  const pocketPipingHex   = safeState.pocketPipingColor?.hex   || '#d4af37';
  const shoulderPipingHex = safeState.shoulderPipingColor?.hex || '#d4af37';
  const stripePipingHex   = safeState.stripePipingColor?.hex   || '#d4af37';
  const liningHex         = safeState.innerLiningColor?.hex    || '#dc2626';
  const liningType        = safeState.innerLining === 'Lightweight' ? 'Lightweight' : 'Quilted';
  const snapHex           = safeState.snapColor?.hex           || '#c0c0c0';

  const insertCount = typeof safeState.shoulderInsertCount === 'number'
    ? safeState.shoulderInsertCount
    : (safeState.hasShoulderInserts ? 2 : 0);

  const insertColors = [
    safeState.shoulderColor?.hex  || '#9ca1a4',
    safeState.shoulderColor2?.hex || safeState.shoulderColor?.hex || '#9ca1a4',
    safeState.shoulderColor3?.hex || safeState.shoulderColor?.hex || '#9ca1a4',
  ];

  const getCollarHex = () => {
    if (safeState.collarColor && typeof safeState.collarColor === 'object') {
      return safeState.collarColor.hex || '#ffffff';
    }
    if (typeof safeState.collarColor === 'string') return safeState.collarColor;
    return '#ffffff';
  };
  const collarHex = getCollarHex();

  const sideColors = {
    bodyHex, sleeveHex, knitHex, knitLineHex, knitBorderHex, pocketHex, snapHex,
    insertHex: insertColors[0] || sleeveHex,
    insertHex1: insertColors[0], insertHex2: insertColors[1], insertHex3: insertColors[2],
    collarHex,
  };
  const sideDecorations = [
    { selector: '.jk-sleeve-stripe',   on: addSleeveStripe,   hex: sleeveStripeHex,   mode: 'stroke', strokeWidth: 40 },
    { selector: '.jk-shoulder-piping', on: addShoulderPiping, hex: shoulderPipingHex, mode: 'stroke', strokeWidth: 30 },
  ];

  const renderViewPaths = () => {
    if (!svgSet) return null;
    switch (view) {
      case 'Front':
        return (
          <FrontView
            key={svgSet.Front}
            url={svgSet.Front}
            fallbackUrl={DEFAULT_SVG_SET.Front}
            bodyHex={bodyHex} sleeveHex={sleeveHex} knitHex={knitHex} pocketHex={pocketHex}
            knitLineHex={knitLineHex} knitBorderHex={knitBorderHex}
            pocketStyle={pocketStyle}
            collarStyle={safeState.collarStyle}
            collarHex={collarHex}
            snapHex={snapHex}
            fastener={snapsOrZipper}
            knitStyle={knitStyle}
            insertCount={insertCount}
            insertHex1={insertColors[0]} insertHex2={insertColors[1]} insertHex3={insertColors[2]}
            addSleeveStripe={addSleeveStripe}     sleeveStripeHex={sleeveStripeHex}
            addPocketPiping={addPocketPiping}     pocketPipingHex={pocketPipingHex}
            addShoulderPiping={addShoulderPiping} shoulderPipingHex={shoulderPipingHex}
            addStripePiping={addStripePiping}     stripePipingHex={stripePipingHex}
          />
        );
      case 'Back':
      case 'Left':
      case 'Right':
        return (
          <SideBaseSvg
            key={svgSet[view]}
            url={svgSet[view]}
            fallbackUrl={DEFAULT_SVG_SET[view]}
            collarStyle={safeState.collarStyle}
            showPockets={showPockets}
            pocketStyle={pocketStyle}
            knitStyle={knitStyle}
            insertCount={insertCount}
            decorations={sideDecorations}
            colors={sideColors}
          />
        );
      case 'Lining':
        return (
          <SideBaseSvg
            key={LINING_SVG[liningType]}
            url={LINING_SVG[liningType] || LINING_SVG.Quilted}
            classMap={LINING_CLASS_MAP}
            colors={{ liningHex }}
          />
        );
      default:
        return null;
    }
  };

  const back = safeState.back || {};

  const handleChangeView = (v) => {
    if (!skinSelected) {
      showSkinWarning();
      return;
    }
    if (typeof onChangeView === 'function') onChangeView(v);
  };

  return (
    <div
      className="leather-jacket-preview-container"
      data-fonts-ready={isReady ? 'true' : 'false'}
      data-skin={skinSelected ? skinName : 'none'}
    >
      <AnimatePresence>
        {warning.visible && !skinSelected && (
          <motion.div
            key={warning.tick}
            role="alert"
            aria-live="assertive"
            className="leather-skin-warning"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0, x: [0, -7, 7, -4, 4, 0] }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <span className="leather-skin-warning-icon" aria-hidden="true">!</span>
            <span className="leather-skin-warning-text">
              <strong>{SKIN_WARNING_TEXT}</strong>
              <span>{SKIN_WARNING_HINT}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="leather-viewport-frame">
        {skinSelected && <JacketPriceBadge state={safeState} />}

        {/* Skin ki files server par nahi mili → saaf batao */}
        {missingFiles.length > 0 && (
          <div
            role="status"
            style={{
              position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 5,
              padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.4,
              background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74',
            }}
          >
            <strong>{skinName} files not found</strong> — Ostrich dikh rahi hai. Missing:
            {missingFiles.map((f) => <div key={f}><code>public{f}</code></div>)}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!skinSelected ? (
            <motion.div
              key="no-skin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`leather-viewport-content leather-skin-empty ${warning.visible ? 'leather-skin-empty-alert' : ''}`}
            >
              <svg className="leather-skin-empty-art" viewBox="0 0 120 120" aria-hidden="true">
                <path
                  d="M44 16 L60 26 L76 16 L98 28 L110 62 L94 68 L88 50 L88 104 L32 104 L32 50 L26 68 L10 62 L22 28 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeDasharray="5 5"
                />
                <path d="M60 26 L60 104" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" />
              </svg>
              <p className="leather-skin-empty-title">{SKIN_EMPTY_TITLE}</p>
              <p className="leather-skin-empty-hint">{SKIN_EMPTY_HINT}</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${skinName}::${view}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="leather-viewport-content"
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              <svg viewBox="0 0 600 600" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <style type="text/css">
                    {getSvgFontFaces()}
                  </style>
                </defs>

                {renderViewPaths()}

                <defs>
                  <filter id="overlayDropShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
                  </filter>
                </defs>

                {view === 'Front' && (
                  <g id="front-decorations">
                    {addChestPocket && (
                      <ChestPocketGraphic hex={chestPocketHex} x={0} y={0} scale={1} />
                    )}
                    {addZipperFlap && (
                      <ZipFlapGraphic x={0} y={0} scale={1} />
                    )}
                    <SegmentDecoration segment={safeState.leftChest} x={372} y={200} fontSize={34} size={65} fontLoadKey={loadKey} />
                    <SegmentDecoration segment={safeState.rightChest} x={215} y={205} fontSize={34} size={65} fontLoadKey={loadKey} />
                  </g>
                )}

                {view === 'Left' && (
                  <g id="left-sleeve-decorations">
                    <SegmentDecoration segment={safeState.leftSleeve} x={350} y={270} fontSize={28} size={58} fontLoadKey={loadKey} />
                  </g>
                )}
                {view === 'Right' && (
                  <g id="right-sleeve-decorations">
                    <SegmentDecoration segment={safeState.rightSleeve} x={255} y={270} fontSize={28} size={58} fontLoadKey={loadKey} />
                  </g>
                )}

                {view === 'Back' && back.type !== 'None' && (
                  <g id="back-decorations">
                    <BackLine back={back} prefix="line1" cy={260} fontLoadKey={loadKey} />
                    <BackLine back={back} prefix="line3" cy={360} fontLoadKey={loadKey} />
                    <BackLine back={back} prefix="line2" cy={310} fontLoadKey={loadKey} />

                    {back.type === 'Patch' && (
                      back.patchImageUrl ? (
                        <g filter="url(#overlayDropShadow)">
                          <SvgPatch url={back.patchImageUrl} x={300} y={310} size={150} />
                        </g>
                      ) : back.patchCategory && back.patchCategory !== 'None' ? (
                        <PatchGraphic segment={back} cx={300} cy={310} size={110} />
                      ) : back.patchUrl ? (
                        <g filter="url(#overlayDropShadow)">
                          <SvgPatch url={back.patchUrl} x={300} y={310} size={140} />
                        </g>
                      ) : null
                    )}
                  </g>
                )}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {skinSelected && skinLoading && (
          <div className="leather-skin-loading" role="status" aria-live="polite">
            <span className="leather-skin-spinner" aria-hidden="true" />
            <span>Loading {skinName} jacket…</span>
          </div>
        )}
      </div>

      <div className="leather-view-selectors">
        {['Front', 'Left', 'Right', 'Back', 'Lining'].map((v) => {
          const isActive = skinSelected && view === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => handleChangeView(v)}
              aria-disabled={!skinSelected}
              className={[
                'leather-view-btn',
                isActive ? 'leather-view-btn-active' : 'leather-view-btn-inactive',
                skinSelected ? '' : 'leather-view-btn-locked',
              ].join(' ').trim()}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

JacketVisualPreview.propTypes = {
  state: PropTypes.object,
  view: PropTypes.oneOf(['Front', 'Left', 'Right', 'Back', 'Lining']).isRequired,
  onChangeView: PropTypes.func.isRequired,
};