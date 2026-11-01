/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JacketVisualPreview.jsx — FULLY FIXED
 *
 * ── CLASS PREFIX (this pass) ───────────────────────────────────────────────
 * JacketVisualPreview.css ki saari classes ab `sailor-` prefix ke saath hain
 * (sailor-jacket-preview-container, sailor-viewport-frame, sailor-view-btn …)
 * aur `fadeIn` keyframe ab `sailor-fadeIn` hai.
 *
 * ⚠️ JAAN-BOOJH KAR NAHI BADLI GAYI:
 *  • `.jk-*` classes (jk-body, jk-sleeve, jk-collar-group, jk-knit-line …)
 *    — ye SVG asset files ke andar likhi hui hain (front-base.svg, back-base.svg,
 *    lining-*.svg). Inko rename karne ka matlab hai painter querySelectorAll se
 *    kuch bhi na mile → poori jacket unpainted/black. Agar prefix chahiye to
 *    PEHLE saari .svg files ke andar class names badalni padengi, phir
 *    FRONT_CLASS_MAP / SIDE_CLASS_MAP / LINING_CLASS_MAP yahan.
 *  • `jf-*` font helper classes — ye getSvgFontFaces() se SVG ke andar inject
 *    hoti hain aur DesignPatchesPanel.css bhi inhe use kar sakti hai.
 *
 * FIXES APPLIED (pehle se):
 *  1. @font-face rules injected into document <head> ONCE with ABSOLUTE urls
 *     (SVG-internal @font-face is unreliable across browsers).
 *  2. document.fonts.load() uses the real FAMILY NAME (not a font stack) —
 *     passing a stack made every load() call reject silently.
 *  3. PatchGraphic no longer references undefined vars.
 *  4. Collar id mismatch fixed ('overlap_standup').
 *  5. Right view no longer draws two collars.
 *  6. No stray console.log during render (SSR-safe).
 *  7. defaultProps replaced with default parameters (React 19 safe).
 *  8. StaggeredText rewritten: font family / weight / style / class applied to
 *     BOTH the <text> and every <tspan>.
 *  9. StaggeredText honours uppercase / letterSpacing / material (SportTouch).
 * 10. Back lines ka direction ab sahi state key se padha jaata hai
 *     (`line1TextDirection`), helper `resolveTextDirection()` dono keys support
 *     karta hai (backwards compatible).
 * 11. ArcText ke staggered tspans par bhi `jf-*` class lag gayi.
 *
 *  ⚠️ SAATH MEIN DesignPatchesPanel.jsx ka backLineValue() bhi update karna hai:
 *     textDirection: back[`${prefix}TextDirection`] || 'straight',
 *     warna panel ka pill selected nahi rehta (render phir bhi theek chalega).
 */

import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './JacketVisualPreview.css';
import { COLLAR_STYLES, FONT_OPTIONS, SPORT_TOUCH_TEXTURES } from './DesignPatchesPanel.jsx';
import './DesignPatchesPanel.css';
import JacketPriceBadge from './JacketPriceBadge.jsx';

const FRONT_SVG = '/sailor/front/front-base.svg';

// ─── FONT DEFINITIONS ────────────────────────────────────────────────────────
const FONT_DEFS = [
  { family: 'Jacketshop',         url: '/font/BRUSHSCI.TTF' },
  { family: 'Stahls Athletic',    url: '/font/Athletic-Regular-5.ttf' },
  { family: 'Stahls Pro Block',   url: '/font/Block.ttf' },
  { family: 'Stahls Old English', url: '/font/PirataOne-Regular.ttf' },
  { family: 'Stahls Vintage',     url: '/font/stahls-tiffany-2000.ttf' },
];

const FONT_STYLE_TAG_ID = 'jacket-font-faces';

// ─── INLINE SVG LOADER (front base ko DOM me inline karta hai) ──────────────
// ⚠️ FIX: har view-switch par (svgKey = view) FrontBaseSvg/SideBaseSvg poori
// tarah remount hota hai. Pehle ye har remount par SVG file dobara fetch()
// karta tha — jab tak fetch poora na ho, markup null rehta hai aur component
// null return karta hai → jacket art gayab. Fetch complete hone ke baad bhi,
// raw SVG mein koi fill specify nahi hai (colors sirf JS paint karta hai),
// is liye pehla frame black dikhta hai jab tak paint wala useEffect na chale.
//
// ⚠️ NEW: SVG markup ab sirf memory mein nahi (jo page refresh par khatam ho
// jaata), balke localStorage mein bhi cache hota hai. Matlab:
//  - Pehli baar koi view khulti hai → file se fetch hoti hai, localStorage
//    mein save ho jaati hai.
//  - Uske baad — chahe usi session mein view switch karo, ya page refresh
//    karo, ya browser dobara kholo — SVG seedha localStorage se aati hai,
//    dobara /jacket/front/front-base.svg waghera path se fetch NAHI hoti.
// Agar file khud kabhi update ho (naya artwork upload karo), SVG_CACHE_VERSION
// badal dena — purana localStorage cache automatically ignore ho jayega.
const SVG_CACHE_VERSION = 'v10';
const svgStorageKey = (url) => `jacket_svg_cache_${SVG_CACHE_VERSION}::${url}`;

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
    // quota exceeded / private-browsing storage disabled — ignore,
    // in-memory cache (svgMarkupCache) still works for this session.
  }
};

// In-memory cache — avoids even reading localStorage repeatedly while
// switching views within the same session (fastest path).
const svgMarkupCache = new Map();

function useInlineSvg(url) {
  const [markup, setMarkup] = useState(() => {
    if (!url) return null;
    if (svgMarkupCache.has(url)) return svgMarkupCache.get(url);
    const stored = readSvgFromStorage(url);
    if (stored) {
      svgMarkupCache.set(url, stored);
      return stored;
    }
    return null;
  });

  useEffect(() => {
    if (!url) return undefined;

    if (svgMarkupCache.has(url)) {
      setMarkup(svgMarkupCache.get(url));
      return undefined;
    }

    const stored = readSvgFromStorage(url);
    if (stored) {
      svgMarkupCache.set(url, stored);
      setMarkup(stored);
      return undefined;
    }

    let cancelled = false;

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

    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        const fixed = fixHrefs(t);
        svgMarkupCache.set(url, fixed);
        writeSvgToStorage(url, fixed);
        if (!cancelled) setMarkup(fixed);
      })
      .catch(() => { if (!cancelled) setMarkup(null); });

    return () => { cancelled = true; };
  }, [url]);

  return markup;
}

// front-base.svg me jo classes tumne di hain, un ko color se map karo
// ⚠️ Ye `.jk-*` selectors SVG FILES ke andar hain — inko `sailor-` prefix
// NAHI diya ja sakta jab tak SVG files khud update na ho jaayein.
const FRONT_CLASS_MAP = {
  '.jk-body':   'bodyHex',
  '.jk-sleeve': 'sleeveHex',
  '.jk-pocket': 'pocketHex',
  '.jk-knit':   'knitHex',
  '.jk-cuff':   'knitHex',   // cuffs bhi knit color lein
  '.jk-knit-line':   'knitLineHex',    // NEW — stripe / line ka color
  '.jk-knit-border': 'knitBorderHex',
  '.jk-knit-base':   'knitHex',        // NEW — base knit color (stripe/border se alag)
  '.jk-rib':    'knitLineHex',         // jk-rib ab STRIPE color (user isse stripe control karta hai)
  '.jk-collar-group': 'collarHex',
  '.jk-insert':        'insertHex',   // saare inserts ka default color
  '.jk-insert-1':      'insertHex1',  // pehla insert (specific — default ko override kare)
  '.jk-insert-2':      'insertHex2',  // doosra insert
  '.jk-insert-3':      'insertHex3',  // teesra insert
  '.jk-snap':          'snapHex',
  '.jk-zip':           'snapHex',   // NEW — zip ke daant bhi snap jaisa metal color lein
};

const SIDE_SVG = {
  Back:  '/sailor/back/back-base.svg',
  Left:  '/sailor/left/left-base.svg',
  Right: '/sailor/right/right-base.svg',
};

// ⚠️ NEW: 5th view — "Lining". Do SVG files, ek har lining type ke liye
// (Materials panel ke "Lining Type" dropdown se match — Quilted / Lightweight).
// Agar sirf ek hi file abhi tumhare paas hai, dono keys usi ek file par point
// kar sakte ho — jab dusri file mile, alag path daal dena.
const LINING_SVG = {
  Quilted:     '/jacket/lining/lining-quilted.svg',
  Lightweight: '/jacket/lining/lining-lightweight.svg',
};

// Lining SVG ke andar jo class color-changeable rakhi ho (jaise `.jk-lining`),
// usko `liningHex` (state.innerLiningColor.hex) se map karte hain.
const LINING_CLASS_MAP = {
  '.jk-lining': 'liningHex',
};

// ⚠️ FIX (back/side collar knit trim + rib color):
// In ek combined collar path par ek saath jk-knit-base + jk-rib + jk-knit-line
// classes hoti hain. Painter class-map ko ORDER mein chalta hai aur JO CLASS
// BAAD MEIN aati hai uska fill FINAL hota hai (last wins).
// Pehle yahan '.jk-rib' (stripe = knitLineHex) '.jk-knit-base' (base = knitHex)
// se PEHLE tha → base color baad mein paint ho kar stripe/rib color ko overwrite
// kar deta tha → isi liye back par knit trim / rib ka color change nahi dikhta tha.
// Front (FRONT_CLASS_MAP) mein base PEHLE aur rib BAAD mein hai — is liye front
// theek chal raha tha. Ab side/back ki ordering ko front jaisa kar diya:
// base -> phir line/rib, taake stripe (knitLineHex) HAMESHA base ke upar aaye
// aur back bhi bilkul front jaisa recolor ho. Front map ko haath NAHI lagaya.
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
// Front/Left/Right/Back base SVGs ka native coordinate space (~6000 units)
// outer <svg viewBox="0 0 600 600"> se match nahi karta. Sirf width/height
// hata ke 600x600 force karna KAAFI NAHI hai — agar asli file mein pehle se
// viewBox nahi hai, to browser content ko 1:1 pixel scale par rakhta hai
// (6000-unit art ek 600px box mein) → sirf ek zoomed corner dikhta hai,
// baaki sab clip ho jata hai. Isi liye hood/collar zoomed-in aur cropped
// dikh raha tha.
// Fix: agar viewBox missing hai, to original width/height se ek viewBox
// banao ("0 0 origWidth origHeight") — TAB jaake width/height=600 daalna
// content ko sahi se 600x600 ke andar scale-down karta hai.
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

    // width/height attributes hata do (hum khud 600x600 set karenge)
    t = t.replace(/\s(width|height)\s*=\s*"[^"]*"/gi, '');

    // ── viewBox missing hai to original width/height se synthesize karo ──
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

// ─── PAINT SVG MARKUP (string-level, no DOM mutation) ───────────────────────
// ⚠️ FIX (root cause of the "sab black + saare collar overlap ho jaate hain"
// bug): pehle colors aur collar/pocket show-hide DOM ko useLayoutEffect se
// BAAD mein mutate karke lagaye jaate thay. Ye kaam usually theek chalta tha,
// lekin async fetch (fresh/incognito session, cache miss) ke baad kabhi
// kabhi ye "baad ka mutation" step apply nahi hota tha ya kisi aur render se
// overwrite ho jaata — is se RAW SVG (koi fill nahi, SAARE collar groups ek
// saath visible) dikhne lagti thi.
// Fix: colors aur toggles ab SEEDHA SVG STRING ke andar "bake" karte hain
// (DOMParser se offscreen parse karke, fill/display set karke, wapas string
// bana kar) — is function ka result hamesha 100% final/sahi hota hai, isko
// dangerouslySetInnerHTML mein daalne se pehle hi. Koi separate DOM-mutation
// step ab zaroori nahi, is liye koi race/timing bug ho hi nahi sakta.
function paintSvgMarkup(markup, colors, classMap, { pocketStyle, collarStyle, showPockets = true, fastener, knitStyle, insertCount = 0, decorations = [] } = {}) {
  if (!markup) return null;
  if (typeof window === 'undefined' || !window.DOMParser) return markup;

  try {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName === 'parsererror' || root.querySelector('parsererror')) {
      return markup;
    }

    // collar: sirf jiska data-collar current collarStyle se match kare wo dikhega
    root.querySelectorAll('.jk-collar-group').forEach((el) => {
      el.style.display = el.getAttribute('data-collar') === collarStyle ? '' : 'none';
    });

    // ⚠️ NEW: fastener (Snap buttons vs Zipper teeth) toggle — bilkul collar
    // ke jaisa pattern. Apni SVG (front-base.svg) mein snap-buttons group ko
    // <g class="jk-fastener-group" data-fastener="Snap"> ... </g> aur zip
    // waale group (ye jo tumne bheja) ko
    // <g class="jk-fastener-group" data-fastener="Zipper"> ... </g>
    // mein wrap kar dena — bas itna karne se ye code khud sahi wala dikha
    // dega aur doosra chhupa dega.
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

        // Collar bhi (agar element collar-group hai) match hona zaroori hai.
        let collarOk = true;
        if (el.classList.contains('jk-collar-group')) {
          collarOk = el.getAttribute('data-collar') === collarStyle;
        }

        // Ye path stripe/rib/border wala hai? (base rib nahi)
        const isStripeish =
          el.classList.contains('jk-rib') ||
          el.classList.contains('jk-knit-line') ||
          el.classList.contains('jk-knit-border');

        el.removeAttribute('data-knit-inactive');

        if (collarOk && knitMatch) {
          // Active style: dikhao, apne rang mein.
          el.style.display = '';
        } else if (collarOk && isStripeish) {
          // Collar sahi hai lekin ye stripe/border iss style ka nahi —
          // HIDE mat karo, BASE color se bhar do (marker laga do).
          el.style.display = '';
          el.setAttribute('data-knit-inactive', '1');
        } else {
          // Collar match nahi (doosra collar) — poora hide.
          el.style.display = 'none';
        }
      });
    }

    // shoulder inserts: jitne count select hain utne hi inserts dikhao
    root.querySelectorAll('.jk-insert-group').forEach((el) => {
      const list = (el.getAttribute('data-inserts') || '')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      el.style.display = list.includes(String(insertCount)) ? '' : 'none';
    });

    // pocket: style-groups hain to matching wala dikhao, warna plain on/off
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
        el.style.fillOpacity = '0.8';
        el.style.strokeOpacity = "0.8";
        el.setAttribute('stroke', hex);
        el.style.stroke = hex;
        el.style.strokeWidth = '5';
      }
    };

    // stroke-only paint (fill none, sirf outline colour) — sleeve stripe / piping ke liye
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

    // border-outline paint: fill ko haath nahi lagata (wo jk-rib/base se aata
    // hai), sirf shape ke around stroke laga deta hai border color se.
    const paintBorderOutline = (el, hex, width = 15) => {
      el.setAttribute('stroke', hex);
      el.style.stroke = hex;
      el.style.strokeOpacity = '1';
      el.setAttribute('stroke-width', String(width));
      el.style.strokeWidth = String(width);
      el.style.mixBlendMode = 'normal';
    };

    // Border ko HAMESHA aakhir mein. Kyun? Combined path par jk-rib bhi hai,
    // aur jk-rib ka paint() base-color ka STROKE bhi laga deta hai — agar rib
    // border ke baad chale to border ka stroke overwrite ho jata hai (isi liye
    // border color nahi dikh raha tha). Isliye normal classes pehle, border last.
    const allEntries = Object.entries(classMap);
    const borderPass = allEntries.filter(([sel]) => sel === '.jk-knit-border');
    const normalPass = allEntries.filter(([sel]) => sel !== '.jk-knit-border');

    normalPass.forEach(([sel, key]) => {
      const hex = colors[key];
      if (!isValidHex(hex)) return;
      const isFlat = FLAT.has(sel);
      root.querySelectorAll(sel).forEach((el) => {
        // Agar jk-collar-group ka element khud rib/knit/border bhi hai, to use
        // collar color se MAT bharo — usko uski apni knit/rib class ka color
        // lene do. jk-collar-group sirf show/hide ke liye.
        if (sel === '.jk-collar-group' &&
            (el.classList.contains('jk-rib') ||
             el.classList.contains('jk-knit') ||
             el.classList.contains('jk-knit-base') ||
             el.classList.contains('jk-knit-line') ||
             el.classList.contains('jk-knit-border'))) {
          return;
        }



        // Off-style stripe/rib: ye path current knit style ka nahi hai
        // (data-knit-inactive laga hai) — stripe color ki jagah BASE color
        // (knitHex) se bharo, taake base rib ka hissa lage (hide na ho).
        let useHex = hex;
        let useFlat = isFlat;
        if ((sel === '.jk-rib' || sel === '.jk-knit-line') &&
            el.getAttribute('data-knit-inactive') === '1') {
          if (!isValidHex(colors.knitHex)) return;
          useHex = colors.knitHex;
          useFlat = false; // base rib jaisa (multiply blend)
        }

        const targets = el.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
        const list = targets.length ? Array.from(targets) : [el];
        list.forEach((t) => paint(t, useHex, useFlat));
      });


    });

    // ── BORDER OUTLINE (sabse aakhir) — sirf stroke, border color se ──
    // Border SIRF tab lagao jab current selected knit style border wala ho
    // (naam mein "Border"). Agar bina-border style (jaise "Double Stripe")
    // select hai, to border bilkul mat lagao — chahe path ki data-knit mein
    // border style listed ho. Isse ek hi combined path (jk-rib + jk-knit-border)
    // par bhi bina-border option choose karne par border gayab ho jata hai.
    const knitIsBorder = typeof knitStyle === 'string' && /border/i.test(knitStyle);

    if (knitIsBorder) {
      borderPass.forEach(([sel, key]) => {
        const hex = colors[key];
        if (!isValidHex(hex)) return;
        root.querySelectorAll(sel).forEach((el) => {
          // Off-style border path: border mat lagao (base fill kaafi hai).
          if (el.getAttribute('data-knit-inactive') === '1') return;
          const targets = el.querySelectorAll('path, polygon, rect, circle, ellipse, line, polyline');
          const list = targets.length ? Array.from(targets) : [el];
          list.forEach((t) => paintBorderOutline(t, hex));
        });
      });
    }

    // ── ADVANCED ADD-ON DECORATIONS (sleeve stripe, chest pocket, piping…) ──
    // Har decoration front-base.svg mein ek group hai, jaise:
    //   <g class="jk-sleeve-stripe"> …stripe ka artwork… </g>
    // Default hidden rakho (style="display:none") — ye code `on` true hone par
    // usay dikha kar uske apne hex se paint karta hai, `on` false hone par hide.
    //   mode:'stroke' (default) → fill:none + stroke=colour  (sleeve stripe / piping)
    //   mode:'fill'            → solid fill                  (jaise chest pocket)
    //   strokeWidth            → optional; na do to SVG ki apni width chalti hai
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

    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return markup;
  }
}

// inline SVG ko recolor karne wala component
function FrontBaseSvg({ url, colors, pocketStyle, collarStyle, fastener, knitStyle, insertCount = 0, decorations }) {
  const markup = useInlineSvg(url);

  const fitted = React.useMemo(() => fitSvgMarkup(markup), [markup]);

  const colorKey = JSON.stringify(colors);
  const decoKey = JSON.stringify(decorations || []);
  const painted = React.useMemo(
    () => paintSvgMarkup(fitted, colors, FRONT_CLASS_MAP, { pocketStyle, collarStyle, fastener, knitStyle, insertCount, decorations }),
    [fitted, colorKey, pocketStyle, collarStyle, fastener, knitStyle, insertCount, decoKey]
  );

  if (!painted) return null;
  return <g dangerouslySetInnerHTML={{ __html: painted }} />;
}

// ─── SHARED BACK / LEFT / RIGHT / LINING SVG (load + fit + pocket/collar toggle + recolor) ───
function SideBaseSvg({ url, colors, collarStyle, showPockets = true, pocketStyle, knitStyle, insertCount = 0, decorations = [], classMap = SIDE_CLASS_MAP }) {
  const markup = useInlineSvg(url);

  const fitted = React.useMemo(() => fitSvgMarkup(markup), [markup]);

  const colorKey = JSON.stringify(colors);
  const painted = React.useMemo(
    () => paintSvgMarkup(fitted, colors, classMap, { pocketStyle, collarStyle, showPockets, knitStyle, insertCount, decorations }),
    [fitted, colorKey, pocketStyle, collarStyle, showPockets, knitStyle, insertCount, JSON.stringify(decorations), classMap]
  );

  if (!painted) return null;
  return <g dangerouslySetInnerHTML={{ __html: painted }} />;
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

// Google fallback faces, loaded via <link> once.
const GOOGLE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Great+Vibes&family=Old+Standard+TT&display=swap';

if (typeof document !== 'undefined' && !document.querySelector(`link[href="${GOOGLE_FONT_HREF}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONT_HREF;
  document.head.appendChild(link);
}

// ─── FONT HELPER CLASSES MIRRORED INSIDE THE SVG ─────────────────────────────
// SVG ke andar sirf helper classes. @font-face yahan NAHI — document-level
// faces pehle se kaam kar rahe hain, yahan dohrane se wo override ho kar tootte hain.
// ⚠️ `jf-*` naam jaan-boojh kar unchanged hai (DesignPatchesPanel bhi inhe use
// karta hai) — sirf JacketVisualPreview.css waali classes prefixed hui hain.
const getSvgFontFaces = () => `
.jf-Script     { font-family: 'Jacketshop', 'Brush Script MT', cursive !important; }
.jf-Athletic   { font-family: 'Stahls Athletic', 'Arial Black', Impact, sans-serif !important; }
.jf-ProBlock   { font-family: 'Stahls Pro Block', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }
.jf-OldEnglish { font-family: 'Stahls Old English', 'Old English Text MT', serif !important; }
.jf-Vintage    { font-family: 'Stahls Vintage', Georgia, 'Times New Roman', serif !important; }
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
      // Always pass a single family name — a full font stack makes load() fail.
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

// Build a valid SVG transform, or undefined. 'none' is a CSS keyword and is
// ILLEGAL inside an SVG transform list.
const buildFontTransform = (fontStyleDef, cx, cy) => {
  const t = fontStyleDef && fontStyleDef.transform;
  if (!t || t === 'none') return undefined;
  return `translate(${cx} ${cy}) ${t} translate(${-cx} ${-cy})`;
};

// ─── Sport Touch texture resolver ────────────────────────────────────────────
const resolveSportTouchHex = (textureId) => {
  const found = SPORT_TOUCH_TEXTURES.find((t) => t.id === textureId);
  return found ? found.hex : '#c9b577';
};

// ─── Text height -> px font size ─────────────────────────────────────────────
const resolveFontSize = (height, fallback) => {
  if (!height) return fallback;
  const num = parseFloat(height);
  if (Number.isNaN(num)) return fallback;
  return num * 16;
};

// ─── Back-line text direction resolver ───────────────────────────────────────
// Panel `textDirection` likhta hai; BackLineRow prefix lagata hai →
// asli key `line1TextDirection` banti hai. Purani `line1Direction` key bhi
// support ki hui hai taake koi purana saved design na toote.
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

// ─── Quadratic bezier point helper ──────────────────────────────────────────
const quadPoint = (t, p0, p1, p2) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

// ─── StaggeredText: descending / stepped lettering ──────────────────────────
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

  // Staggered mode letter-spacing fix rahe: 0.12em.
  const resolvedLetterSpacing = '-0.2em';

  const fontTransform = buildFontTransform(fontStyleDef, cx, cy);

  // EK jagah font — <text> aur har <tspan> dono par:
  // class (CSS !important fallback) + attribute + inline style.
  const fontProps = {
    className: `jf-${resolvedFontId}`,
    fontFamily: fontFamilyStr,
    fontWeight: fontStyleDef.fontWeight || 400,
    fontStyle: fontStyleDef.fontStyle || 'normal',
    style: {
      fontFamily: fontFamilyStr,
      fontWeight: fontStyleDef.fontWeight || 400,
      fontStyle: fontStyleDef.fontStyle || 'normal',
    },
  };

  // Staggered vertical step — font size ke saath scale hota hai, is liye bada
  // font choose karne par step bhi proportionally bada hota hai.
  const stepY = fontSize * 0.35;
  // Positive horizontal gap — pehle -0.18 tha jo letters ko peeche kheench kar
  // overlap kar deta tha. Ab har letter thoda aage jaata hai → beech mein space.
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
      {/* Outline */}
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

      {/* Fill */}
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

// ─── ArcText: curved/straight text with material treatment + rhinestones ────
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

  // Shared font props — class + attribute + inline style, taake koi bhi engine
  // fallback font par na jaaye.
  const fontProps = {
    className: `jf-${resolvedFontId}`,
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
              className={`jf-${resolvedFontId}`}
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
    className: 'jf-ProBlock',
    fontWeight: 400,
    fontStyle: 'normal',
    transform: undefined,
  },
  Crazy: {
    fontFamily: '"Stahls Vintage", Georgia, "Times New Roman", serif',
    className: 'jf-Vintage',
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


// ─── CHEST POCKET GRAPHIC (inline JSX version — koi external SVG file nahi) ──
// Yeh tumhare pasted raw SVG snippet ka hi JSX-safe version hai (class→className
// nahi rakha, seedha fill prop use kiya; style="..." string ki jagah style
// object). `.st2` class ka original definition tumhare paas nahi tha, is liye
// wo saare rects/paths ab `hex` prop (chestPocketColor) se paint hote hain —
// isse pocket panel se rang change karne par yeh graphic bhi rang badlega.
// Agar tum chahte ho yeh HAMESHA ek fixed grey/silver rahe (color-picker se na
// badle), to neeche `hex` ki jagah seedha '#9ca1a4' likh dena.
//
// POSITIONING: original coordinates (x≈330-337, y≈167-238) waise ke waise
// rakhe hain. Agar jacket ke chest area se match nahi karti, to neeche
// <ChestPocketGraphic x={...} y={...} scale={...} /> call mein x/y/scale
// tweak karo — x/y ek translate offset hai, scale poori graphic ko bada/chhota
// karta hai.
const ChestPocketGraphic = ({ x = 0, y = 0, scale = 1, hex = '#9ca1a4' }) => {
  const shadeHex = darkenColor(hex, 25); // snap-button jaisi detail thodi darker
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g>
        <rect x="333.1" y="183.6" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="185.3" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="187" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="188.6" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="190.3" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="191.9" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="193.6" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="195.3" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="196.9" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="198.6" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="200.2" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="201.9" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="203.5" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="205.2" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="206.9" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="208.5" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="210.2" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="211.8" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="213.5" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="215.1" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="216.8" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="218.5" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="220.1" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="221.8" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="223.4" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="225.1" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="226.7" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="228.4" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="230.1" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="231.7" width="1.7" height="0.8" fill={hex} />
        <rect x="333.1" y="233.4" width="1.7" height="0.8" fill={hex} />
        <rect x="331.8" y="235" width="1.7" height="0.8" fill={hex} />
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

// ─── ZIP FLAP GRAPHIC (inline JSX version — koi external SVG file nahi) ─────
// Yeh tumhare 2nd pasted snippet ka JSX-safe version hai: xlink:href →
// xlinkHref, class → className (yahan use hi nahi hui), aur har style="..."
// string ko style={{ ... }} object mein convert kiya hai. Baaki sab (base64
// texture image + shading paths) hooba-hoo waisa hi hai — isay solid color se
// paint NAHI karte kyunki yeh khud ek photo-texture + opacity-shading flap
// hai, flat fill isay bigaad degi.
//
// POSITIONING: coordinates waise hi rakhe hain jaise tumne diye (already
// jacket ke zip/chest area ke coordinate space mein hain). Agar upar-neeche
// ya idhar-udhar karna ho to neeche call mein x/y/scale adjust karo.
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
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAADFCAYAAAAVH684AAAACXBIWXMAAAsSAAALEgHS3X78AAAA
	GXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABZdJREFUeNrsndtu4zAMREXV///J
	5mIfCriGLpSsC0WOgCJpG2wXJzMcirbjELCwsA5bpPz/w5rhXcreuJY3kz0qjwTPa6BYA0za9Pfo
	9bwFHhd+thQkLQaX+qoB5M7H6RCvjeBiBmQLvNrzqRCvxep+gosJgM/XcwUgZ77nVQB3KC8mvnLq
	ywHMgbtXQrw21bxfaD8veG+lluClFEcZkPfj9TQK4I4+r2Td0KC+Gjx6AAwZJfIpti0lbhQ2zrXw
	iA9g9AAYXgocosJrkcpqAEMlcZ//HidChROKe/+NX3DDAF4bLFtK4SBoWagAtQYwJFTYDXDX3jan
	NmocGlAB4hPg+zVvFXYB3DkYGKniHMi3YlNvTjfAk+HlQNEDQhTCuHvS1wq8HMTfFSt75645ojV4
	uVQOBRVyr32twiuFz7Ov5IR9ybvyShBjYctHhe2hS3g1gKkx1i0B6AVeyLQy9KiFnEjrAOWlIT7r
	Xg5gUX3RKTh6hUdpypNd0bHyaocEqgA92jYIpjxU2Oa5Vl5uotOsvBh8L6n6AE8QHhTyc0bAawAL
	5TXCohaYgPd3e8aV3wNeA0zYtgDo/Zg6rsuAJwMosbB7eDlYqXNdAK9S11LgqtaNzlUXQv70NChP
	0Jrcj8f7pUDUPIHq7h71Rajuj+rESesNnkR1TQAjVFdUHQJjhuo82naY6rzAm6I6b7YdqjrPgfFZ
	dR7g1a4Q+nR5gaeaV9uKNZ/QHR1Ay9W8zxe1eLAtN9rWPTwWpO3nC/qiI9Xdr5r3SXVW4fUMO2Fb
	YVN8f1WcVXhDh51ebTtk2OkJ3rQBgCfbDh8AWIe3XHUWbbtMdVbgbVGdNdsuVZ0FeNtUZ8m2y1Vn
	NTCWqO50eFNH7J5q3vARu2V400fsHmw7bcRuFd6SEbt1204dsVuEt2zEbtm200fsWuHRYIhTRuya
	4PV80OCIptiF8qgD4PKmeCe8lNqkClTRFGsJjBxI1U3xDngtH22puinWaNtjmuKV8Jqv2dfeFJ/Y
	56lpik/eYWxvik+Cp64pPk15qpriU+CpbIpPsy3DtnNAhp2q0wqvFBQqat0pNY8LOwneqbr/61II
	rDUooLzOoIBtGyGqWfEAYGqa4pMCo3YTuO0AL0WwVO9jTw2MWyvE1fDoI7jgTXnSY7ZcqXfBu21p
	gFXZGzzpwZ8jgmJnYFAHOJdpKzlmy6cpToNtw+m2vTbAIkFznDqsyF6VJ7Ht9jMATt1hlM49cWdb
	ieqk+1m3ypPcEuZIcKttSxn18anqi5ughUSSHqO4lbY11dvNDozSXZ3eN6F8j9nV93YrlNd7xids
	W1BcDZz63k5Dk3xsb7e7z2MLlp1d86gyEChNitkjvNy9EiXj9wDl1ROXLVh2RauSq3m1s9qhPIH6
	7hMVNwMeFeqeqRZlZmBIBwKqj8nusm3qDAET27EdgWFmOzYLXqretVoWgdGovGPBzd5hUMaWZiDO
	DAzJdix4V97X/s69bUv9nZrL2rUHRsvxWdhWANFUbzcSXml6YrbWzQiM4MmyowODGsOCAa+sNrOq
	+wqPCtuykl1h20qDnEtTUwDjZMsGq5YdmbbHX5DSs0aeJUVeguKr8kjY45kMillpm6tzJgFekywb
	LCtuVdqaBhg/qExiWdM17/pgU6pY1qxdZ9oWrUqHhYN1WDNalRDKH6IFeK9aJ+ntAlqV74MBKE8I
	7MgTs3fuMFyo7KvyWj/KCPCgyDlpS96tOzMwAK/Tnqh5jWHhbrW0KlQBxt4g9gQG+r4PNY9gWTk8
	qG1RqwJ4DepjzwBH7m1h2w6ACIyPakNgAOC6wHBr11GtCgOeTG0EgPOaZMBDc7xGeQiMjqRlAJTD
	qx3ERmDAsu3rR2BXtCidWy+q1D0GvL7fQ3kdr0O9w8LCwsLCwsLSv/4JMADqtM1FJGZo5wAAAABJ
	RU5ErkJggg=="
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
// Front ka asli art `front-base.svg` se aata hai (FrontBaseSvg component,
// jo file ko fetch/cache karke `.jk-*` classes ke through recolor karta hai).
// Ye FrontView sirf ek thin wrapper hai taake props ek jagah collect ho kar
// FrontBaseSvg ko forward ho jayein.
const FrontView = ({
  bodyHex, sleeveHex, pocketHex, knitHex, knitLineHex, knitBorderHex,
  pocketStyle, collarStyle, collarHex, snapHex, fastener, knitStyle, insertCount = 0,
  insertHex1 = '#9ca1a4', insertHex2 = '#9ca1a4', insertHex3 = '#9ca1a4',
  // ── advanced add-ons (front view only) ──
  addSleeveStripe = false,   sleeveStripeHex   = '#000000',
  addChestPocket = false,    chestPocketHex    = '#9ca1a4',
  addPocketPiping = false,   pocketPipingHex   = '#000000',
  addShoulderPiping = false, shoulderPipingHex = '#000000',
  addStripePiping = false,   stripePipingHex   = '#000000',
}) => (
  <FrontBaseSvg
    url={FRONT_SVG}
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
  addSleeveStripe: PropTypes.bool,
  sleeveStripeHex: PropTypes.string,
  addChestPocket: PropTypes.bool,
  chestPocketHex: PropTypes.string,
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
    // Text Height selector ko honour karo. Panel `2"`..`4"` deta hai; use
    // yahan px mein badalte hain. `fontSize` (34/28) sirf tab use hota hai jab
    // koi height select na ho — is se chest chhota aur sleeve bada rehta hai.
    // Height presets bade hote hain (3" → 48px) is liye ek scale factor laga
    // kar unhe placement box ke andar rakhte hain.
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
// Ek hi jagah se teeno back lines render hoti hain — direction, font, colour,
// material sab ek jaise resolve hote hain, is liye ab koi line peeche nahi rehti.
const BackLine = ({ back, prefix, cy, fontLoadKey }) => {
  const text = back[`${prefix}Text`];
  if (!text) return null;

  const direction = resolveTextDirection(back, prefix);
  const fontId = back[`${prefix}Font`];
  const fillColor = back[`${prefix}Color`] || '#ffffff';
  const strokeColor = back[`${prefix}StrokeColor`];
  // Height selector honour karo. 3" (default) ≈ 40px back par theek baithta hai,
  // aur 2"→4" ka farak clearly dikhta hai.
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
export const DEFAULT_JACKET_STATE = {
  style: 'Classic',
  bodyMaterial: 'Wool',
  sleeveMaterial: 'Leather',
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
  collarColor: { hex: '#ffffff', name: 'White' },
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

  if (!safeState) {
    return (
      <div className="sailor-jacket-preview-container">
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
  const cuffStyle       = safeState.cuffStyle === 'Pro' ? 'Pro' : 'Classic';
  const addChestPocket    = safeState.addChestPocket === true;
  const addSleeveStripe   = safeState.addSleeveStripe === true;
  const addPocketPiping   = safeState.addPocketPiping === true;
  const addShoulderPiping = safeState.addShoulderPiping === true;
  const addStripePiping   = safeState.addStripePiping === true;
  const proCuffHex        = safeState.proCuffColor?.hex        || sleeveHex;
  const chestPocketHex    = safeState.chestPocketColor?.hex    || '#9ca1a4';
  const sleeveStripeHex   = safeState.sleeveStripeColor?.hex   || '#000000';
  const pocketPipingHex   = safeState.pocketPipingColor?.hex   || '#000000';
  const shoulderPipingHex = safeState.shoulderPipingColor?.hex || '#000000';
  const stripePipingHex   = safeState.stripePipingColor?.hex   || '#000000';
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
      return safeState.collarColor.hex || '#000';
    }
    if (typeof safeState.collarColor === 'string') return safeState.collarColor;
    return '#ffffff';
  };
  const collarHex = getCollarHex();


  const commonKnitProps = { knitStyle, knitLineHex, knitBorderHex };

  const renderViewPaths = () => {
    switch (view) {
      case 'Front':
        return (
          <FrontView
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
            addChestPocket={addChestPocket}       chestPocketHex={chestPocketHex}
            addPocketPiping={addPocketPiping}     pocketPipingHex={pocketPipingHex}
            addShoulderPiping={addShoulderPiping} shoulderPipingHex={shoulderPipingHex}
            addStripePiping={addStripePiping}     stripePipingHex={stripePipingHex}
          />
        );
      case 'Back':
        return (
          <SideBaseSvg
            url={SIDE_SVG.Back}
            collarStyle={safeState.collarStyle}
            showPockets={showPockets}
            pocketStyle={pocketStyle}
            knitStyle={knitStyle}
            insertCount={insertCount}
            decorations={[
              { selector: '.jk-sleeve-stripe', on: addSleeveStripe, hex: sleeveStripeHex, mode: 'stroke', strokeWidth: 40 },
              { selector: '.jk-shoulder-piping', on: addShoulderPiping, hex: shoulderPipingHex, mode: 'stroke', strokeWidth: 30 },
            ]}
            colors={{
              bodyHex, sleeveHex, knitHex, knitLineHex, knitBorderHex, pocketHex, snapHex,
              insertHex: (insertColors && insertColors[0]) || sleeveHex,
              insertHex1: insertColors[0], insertHex2: insertColors[1], insertHex3: insertColors[2],
              collarHex,
            }}
          />
        );
      case 'Left':
        return (
          <SideBaseSvg
            url={SIDE_SVG.Left}
            collarStyle={safeState.collarStyle}
            showPockets={showPockets}
            pocketStyle={pocketStyle}
            knitStyle={knitStyle}
            insertCount={insertCount}
            decorations={[
              { selector: '.jk-sleeve-stripe', on: addSleeveStripe, hex: sleeveStripeHex, mode: 'stroke', strokeWidth: 40 },
              { selector: '.jk-shoulder-piping', on: addShoulderPiping, hex: shoulderPipingHex, mode: 'stroke', strokeWidth: 30 },
            ]}
            colors={{ bodyHex, sleeveHex, knitHex, knitLineHex, knitBorderHex, pocketHex, snapHex,
            insertHex: (insertColors && insertColors[0]) || sleeveHex,
            insertHex1: insertColors[0], insertHex2: insertColors[1], insertHex3: insertColors[2],
            collarHex }}
          />
        );
      case 'Right':
        return (
          <SideBaseSvg
            url={SIDE_SVG.Right}
            collarStyle={safeState.collarStyle}
            showPockets={showPockets}
            pocketStyle={pocketStyle}
            knitStyle={knitStyle}
            insertCount={insertCount}
            decorations={[
              { selector: '.jk-sleeve-stripe', on: addSleeveStripe, hex: sleeveStripeHex, mode: 'stroke', strokeWidth: 40 },
              { selector: '.jk-shoulder-piping', on: addShoulderPiping, hex: shoulderPipingHex, mode: 'stroke', strokeWidth: 30 },
            ]}
            colors={{ bodyHex, sleeveHex, knitHex, knitLineHex, knitBorderHex, pocketHex, snapHex,
            insertHex: (insertColors && insertColors[0]) || sleeveHex,
            insertHex1: insertColors[0], insertHex2: insertColors[1], insertHex3: insertColors[2],
            collarHex }}
          />
        );
      case 'Lining':
        return (
          <SideBaseSvg
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
  // ⚠️ FIX: pehle yahan svgKey (= view) poore <svg> par laga hua tha, jo har
  // view switch par <svg> aur andar FrontBaseSvg/SideBaseSvg ko poori tarah
  // unmount+remount karta tha — chahe SVG cache (memory/localStorage) mein
  // mojood ho, remount ka matlab hai component dobara "mount" hota hai
  // (naya useState/useLayoutEffect cycle), jo halka sa flicker/delay deta
  // tha. Ab is key ki zaroorat nahi: text ka font-refresh already apne chhote
  // fontLoadKey se ho raha hai (sirf us <g> ka remount), aur base jacket art
  // ab React ke normal reconciliation se hi Front↔Left↔Right↔Back switch
  // karta hai — cached SVG turant, bina remount ke dikhti hai.

  const handleChangeView = (v) => {
    if (typeof onChangeView === 'function') onChangeView(v);
  };

  return (
    <div className="sailor-jacket-preview-container" data-fonts-ready={isReady ? 'true' : 'false'}>
      <div className="sailor-viewport-frame">
        <JacketPriceBadge state={safeState} />
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="sailor-viewport-content"
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            <svg viewBox="0 0 600 600" style={{ width: '100%', height: '100%', display: 'block' }}>
              {/* Font helper classes mirrored inside the SVG */}
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

              {/* ── COLLAR ──────────────────────────────────────────────────
                  Collar color/style already lagti hai FrontBaseSvg/SideBaseSvg
                  ke andar — wahan `.jk-collar-group[data-collar="..."]` ko
                  directly paint kiya jaata hai (dekho useLayoutEffect andar
                  FrontBaseSvg/SideBaseSvg). Yahan pehle SideCollarOverlay aur
                  ek khaali Front IIFE call ho rahe thay jo kuch render nahi
                  karte thay (SideCollarOverlay hamesha `return null` karta
                  tha) — dead code tha, hata diya. */}

              {/* ── FRONT DECORATIONS ── */}
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

              {/* ── SLEEVE DECORATIONS ── */}
              {view === 'Left' && (
                <g id="left-sleeve-decorations">
                  <SegmentDecoration segment={safeState.leftSleeve} x={275} y={210} fontSize={28} size={58} fontLoadKey={loadKey} />
                </g>
              )}
              {view === 'Right' && (
                <g id="right-sleeve-decorations">
                  <SegmentDecoration segment={safeState.rightSleeve} x={325} y={210} fontSize={28} size={58} fontLoadKey={loadKey} />
                </g>
              )}

              {/* ── BACK DECORATIONS ── */}
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
        </AnimatePresence>
      </div>

      {/* View selector tabs */}
      <div className="sailor-view-selectors">
        {['Front', 'Left', 'Right', 'Back', 'Lining'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => handleChangeView(v)}
            className={`sailor-view-btn ${view === v ? 'sailor-view-btn-active' : 'sailor-view-btn-inactive'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

JacketVisualPreview.propTypes = {
  state: PropTypes.object,
  view: PropTypes.oneOf(['Front', 'Left', 'Right', 'Back', 'Lining']).isRequired,
  onChangeView: PropTypes.func.isRequired,
};