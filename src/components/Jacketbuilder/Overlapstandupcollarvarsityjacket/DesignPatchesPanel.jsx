/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * UPDATED (v4 — image patches per category):
 * - "Year" and "Position/Number" patch categories keep the original text-based
 *   builder (Class-of-badge / Font / Patch style / colors / rhinestones).
 * - EVERY OTHER patch category (Academics, Athletics, Band/Music, Cheer, Crazy
 *   Word, Custom Flags, FFA, ROTC, Walking Patches) now shows an IMAGE GRID.
 *   Pick an image (or paste an image URL) and it renders on the jacket preview
 *   as a patch (via `state[...].patchImageUrl`, read by JacketVisualPreview).
 * - Add / change the images for each category in the PATCH_IMAGES map below.
 *
 * (v3 history: full text customization; category-driven text patch builder;
 *  carousel layout fix — pills wrap into rows instead of horizontal scroll.)
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Check, Type, Award, Image as ImageIcon, CircleSlash2,
} from 'lucide-react';
import PropTypes from 'prop-types';
import './DesignPatchesPanel.css';

// ─── Google Fonts Loader ──────────────────────────────────────────────────────
const FONT_IMPORTS = [
  'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',          // Script
  'https://fonts.googleapis.com/css2?family=Yellowtail&display=swap',             // Script With Tail
  'https://fonts.googleapis.com/css2?family=Anton&display=swap',                  // Block
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap',       // (unused fallback)
  'https://fonts.googleapis.com/css2?family=Jersey+15&display=swap',              // Patch "Classic" numeral font
  'https://fonts.googleapis.com/css2?family=Bangers&display=swap',                // Crazy
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600&display=swap',        // Bridge
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&display=swap',       // Bookend
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap',// Old English
];

// Inject fonts into document head once
if (typeof document !== 'undefined') {
  FONT_IMPORTS.forEach((href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  });
}

// ─── Wait for webfonts to actually finish loading (forces a re-render so the
// small in-panel previews don't get stuck showing the fallback font) ────────
function useFontsReady(fontFamilies) {
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await Promise.all(fontFamilies.map((ff) => document.fonts.load(`700 16px ${ff}`).catch(() => {})));
          await document.fonts.ready;
        }
      } catch (e) { /* ignore */ }
      if (!cancelled) setGeneration((g) => g + 1);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return generation;
}

// ─── Font Config (matches reference: Script / Script With Tail / Block / Crazy / Bridge / Bookend / Old English) ──
export const FONT_OPTIONS = [
  {
    id: 'Script', label: 'Script', preview: 'Champions',
    fontFamily: '"Pinyon Script", "Brush Script MT", "Segoe Script", cursive',
    fontWeight: 400, fontStyle: 'italic', textTransform: 'none', extraSpacing: '0.01em',
    transform: 'skewX(-12)', syntheticBold: false,
  },
  {
    id: 'ScriptTail', label: 'Script W/ Tail', preview: 'Champions',
    fontFamily: '"Yellowtail", "Segoe Script", "Brush Script MT", cursive',
    fontWeight: 400, fontStyle: 'italic', textTransform: 'none', extraSpacing: '0.06em',
    transform: 'skewX(-18)', syntheticBold: false,
  },
  {
    id: 'Block', label: 'Block', preview: 'BLOCK',
    fontFamily: '"Anton", Impact, "Arial Black", "Haettenschweiler", sans-serif',
    fontWeight: 900, fontStyle: 'normal', textTransform: 'uppercase', extraSpacing: '0.04em',
    transform: 'scale(1,1.12)', syntheticBold: true,
  },
  {
    id: 'Crazy', label: 'Crazy', preview: 'Crazy',
    fontFamily: '"Bangers", "Comic Sans MS", "Marker Felt", cursive',
    fontWeight: 700, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0.03em',
    transform: 'skewX(6) rotate(-2)', syntheticBold: true,
  },
  {
    id: 'Bridge', label: 'Bridge', preview: 'BRIDGE',
    fontFamily: '"Oswald", "Arial Narrow", "Helvetica Neue Condensed", sans-serif',
    fontWeight: 700, fontStyle: 'normal', textTransform: 'uppercase', extraSpacing: '0.18em',
    transform: 'scale(0.82,1)', syntheticBold: true,
  },
  {
    id: 'Bookend', label: 'Bookend', preview: 'Bookend',
    fontFamily: '"Baloo 2", "Trebuchet MS", Verdana, sans-serif',
    fontWeight: 700, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0.01em',
    transform: 'scale(1,1.08)', syntheticBold: true,
  },
  {
    id: 'OldEnglish', label: 'Old English', preview: 'Old English',
    fontFamily: '"UnifrakturCook", "Old English Text MT", "Blackletter686 BT", fantasy, serif',
    fontWeight: 700, fontStyle: 'normal', textTransform: 'none', extraSpacing: '0em',
    transform: 'skewX(-5)', syntheticBold: true,
  },
];

// ─── Materials (Embroidery / Chenille / Glitter Vinyl / Sport Touch) ─────────
export const MATERIALS = [
  { id: 'Embroidery',    name: 'Embroidery' },
  { id: 'Chenille',      name: 'Chenille Patch' },
  { id: 'GlitterVinyl',  name: 'Glitter Vinyl Patch' },
  { id: 'SportTouch',    name: 'Sport Touch Patch' },
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
  { id: 'basketball', name: 'Basketball' },
  { id: 'star_shield', name: 'Star Shield' },
  { id: 'lightning', name: 'Lightning' },
  { id: 'music_note', name: 'Music Note' },
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

// Used for both "Outline Color" and "Felt Color" pickers (matches reference panel)
export const OUTLINE_COLORS = LEATHER_COLORS;
export const FELT_COLORS = LEATHER_COLORS;

// ─── Collar SVGs ──────────────────────────────────────────────────────────────
const CLASSIC_STANDUP_SVG = `<g><path d="M302.2,130c-0.1-0.5-0.1-1.1-0.1-1.7c0.4-13.1,28.1-34.8,40.2-43.9c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0c-9.8,6.5,0.3,12,4,14.8c12.1,9.2,39.6,30.8,40.2,43.8c0,0.6,0,1.2-0.1,1.8L302.2,130z" style="fill: rgb(0, 0, 0);" data-color-control="lining" id="XMLID_416_" class="element_select"></path> <g data-color-control="knit_base" class="element_select"><path d="M257.8,84.4c4.1,3.1,10.1,7.8,16.2,13H326c6.1-5.2,12.1-9.9,16.2-13c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0C244,76.2,254,81.6,257.8,84.4z" style="fill: rgb(255, 255, 255);"></path> <path d="M253.728,69.622 c-9.761,6.528,0.26,11.962,4.025,14.819c12.621,9.575,42.253,32.809,40.088,45.599c0,0-22.47,0.498-39.247-6.777 c-16.777-7.272-22.178-15.302-23.475-17.602c0,0,2.798-15.006,6.027-24.197c3.799-10.812,9.336-17.111,22.889-20.417 c16.341-3.992,55.591-4.023,71.934-0.031c13.551,3.304,19.089,9.605,22.889,20.418c3.228,9.188,6.06,24.226,6.06,24.226 c-1.298,2.297-6.73,10.298-23.509,17.569c-16.776,7.275-39.219,6.781-39.219,6.781c-2.167-12.79,27.441-36.024,40.062-45.603 c3.764-2.853,13.786-8.288,4.025-14.817C328.873,59.526,271.13,59.557,253.728,69.622z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g></g>`;
const OVERLAP_STANDUP_SVG = `<g><path d="M302.2,130c-0.1-0.5-0.1-1.1-0.1-1.7c0.4-13.1,28.1-34.8,40.2-43.9c3.8-2.9,13.8-8.3,4-14.8 c-17.4-10.1-75.1-10-92.5,0c-9.8,6.5,0.3,12,4,14.8c12.1,9.2,39.6,30.8,40.2,43.8c0,0.6,0,1.2-0.1,1.8L302.2,130z" style="fill: rgb(0, 0, 0);" data-color-control="lining" id="XMLID_416_" class="element_select"></path> <g data-color-control="knit_base" class="element_select"><path d="M350.4,75.5c-0.1-1.7-1.2-3.6-4.1-5.5c-17.4-10.1-75.1-10-92.5,0c-2.9,1.9-4.1,3.8-4.1,5.5 c0.2,3.8,5.6,7,8.2,8.9c2,1.5,4.4,3.4,7.1,5.5c3.2,2.2,6.9,4.8,10.8,7.5h47.9c4.6-3.1,9.1-6,12.9-8.5c2.2-1.7,4.2-3.2,5.8-4.5 C344.8,82.5,350.2,79.4,350.4,75.5z" style="fill: rgb(255, 255, 255);"></path> <path d="M253.7,70c-9.8,6.5,0.3,12,4,14.8c8.9,6.8,30.8,20.4,42.2,32.3c-2.5,2.8-5.4,8.1-5.8,13 c-10.6-0.6-25.6-2.2-35.5-6.5c-16.8-7.3-22.2-15.3-23.5-17.6c0,0,2.8-15,6-24.2c3.8-10.8,9.3-17.1,22.9-20.4c16.3-4,55.6-4,71.9,0 c13.6,3.3,19.1,9.6,22.9,20.4c3.2,9.2,6.1,24.2,6.1,24.2c-1.3,2.3-6.7,10.3-23.5,17.6c-16.8,7.3-47.2,6.8-47.2,6.8 c0-17.7,35.4-36,48.1-45.6c3.8-2.9,13.8-8.3,4-14.8C328.9,59.9,271.1,60,253.7,70z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);" id="XMLID_1791_" class="st7"></path></g></g>`;
const PRO_SHIRT_COLLAR_SVG = `<g data-color-control="collar_outside" class="element_select"><path d="M341.2,100.9c0.2-0.3,0.7-0.8,1.3-1.7c3.1-7.2,4.6-14.6,3-21.9c-0.8-2.4-2-3.8-3.1-4.1 c-1.7-0.5-8.7,1-16.5,1.4c-11.9,0.5-39.5,0.5-51.4,0c-7.9-0.3-14.9-1.9-16.5-1.4c-1.1,0.3-2.3,1.7-3.1,4.1 c-0.2,0.6-0.4,1.1-0.5,1.7c-1.2,7.7,0.9,15.7,4.7,23.2C272.7,105,339.3,104.3,341.2,100.9z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M254.6,77.3c0-0.1,0.2-0.9-0.2-0.4c-1.9,2.3-4.7,5.9-8.2,11c-7.5,11-10.7,16.1-10.7,16.1 s0.1,33.8,4.5,48.3c16.6-1.6,39.8-27.9,51.7-22.5C287.9,125.4,248.4,105.2,254.6,77.3z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M345.4,77.3c0-0.1-0.2-0.9,0.2-0.4c1.9,2.3,4.7,5.9,8.2,11c7.5,11,10.7,16.1,10.7,16.1 s-0.1,33.8-4.5,48.3c-16.6-1.6-39.8-27.9-51.7-22.5C312.2,125.4,351.7,105.2,345.4,77.3z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const HOOD_SVG = `<g><linearGradient id="XMLID_8_" gradientUnits="userSpaceOnUse" x1="300.0184" y1="120.8423" x2="300.0184" y2="64.1338"><stop offset="0" style="stop-color: rgb(182, 184, 186);"></stop> <stop offset="1" style="stop-color: rgb(243, 245, 248);"></stop></linearGradient> <path id="XMLID_1640_" data-color-control="hood_inside" d="M300.018,120.842c0,0,4.304-4.798,13.16-9.254 c6.221-3.13,35.507-8.74,47.166-19.278c8.623-7.076,12.694-14.173,18.809-19.112c0,0,18.609-10.904-30.672-8.793 c-6.792,0.291-90.133,0.291-96.925,0c-49.281-2.112-30.672,8.793-30.672,8.793c6.115,4.939,10.186,12.036,18.809,19.112 c11.659,10.538,40.945,16.148,47.166,19.278C295.715,116.045,300.018,120.842,300.018,120.842" class="element_select" style="fill: url(&quot;#XMLID_8_&quot;);"></path> <path id="XMLID_1641_" data-color-control="hood_outside" d="M374.654,59.498 c6.952,0.613,17.994,2.249,18.608,19.221c0,0-1.019,8.698,0,17.177c1.671,13.905,11.45,18.288-56.233,21.266 c-7.802,0.343-16.607,3.66-26.583,3.681h-10.429c0,0,4.304-4.798,13.16-9.254c6.221-3.13,35.507-8.74,47.166-19.278 c8.623-7.076,12.694-14.173,18.809-19.112c0,0,18.609-10.904-30.672-8.793c-6.792,0.291-90.133,0.291-96.925,0 c-49.281-2.112-30.672,8.793-30.672,8.793c6.115,4.939,10.186,12.036,18.809,19.112c11.659,10.538,40.945,16.148,47.166,19.278 c8.856,4.456,13.16,9.254,13.16,9.254H289.59c-9.976-0.021-18.781-3.337-26.583-3.681c-67.682-2.978-57.904-7.361-56.233-21.266 c1.019-8.478,0-17.177,0-17.177c0.613-16.972,11.656-18.608,18.608-19.221C232.335,58.884,367.702,58.884,374.654,59.498z" class="element_select" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M300.018,96.44c-31.241,0-62.482-5.899-60.326-4.13 c11.659,10.538,40.945,16.148,47.166,19.278c8.856,4.457,13.16,9.254,13.16,9.254s4.304-4.798,13.16-9.254 c6.221-3.13,35.507-8.74,47.166-19.278C362.5,90.541,331.259,96.44,300.018,96.44z" style="fill: rgb(202, 202, 232);" id="XMLID_1639_"></path></g>`;
const ZIPPERED_HOOD_SVG = `<g data-color-control="hood_inside" class="element_select"><path d="M342.3,84.4c3.8-2.9,13.8-8.3,4-14.8c-6.9-4-20.1-7-34.7-8.1c-7.6-0.4-15.5-0.4-23.1,0 c-14.6,1.1-27.8,4.1-34.7,8.1c-9.8,6.5,0.3,12,4,14.8c4.5,3.4,11.1,8.5,17.7,14.3h49.1C331.1,92.9,337.8,87.8,342.3,84.4z" style="fill: rgb(255, 255, 255);"></path> <path d="M438.6,115c-3.1-1.9-44.5-41.1-71.4-40.7c0,0-4-0.2-11.2-7.7c-6-6.1-19.3-14.5-55.9-14.5 c-36.7,0-50,8.4-55.9,14.5c-7.3,7.5-11.2,7.7-11.2,7.7c-26.8-0.4-68.2,38.8-71.4,40.7c-3.1,1.9-7.1,8.3,4,5.6 c11.1-2.7,31-10.6,54.7-11.9c23.7-1.2,37,1.3,53.1,10.9c13,7.7,19,7.7,24.7,9.7c0-0.3,0-0.7,0-1c-0.5-13.1-28.1-34.7-40.2-43.8 c-3.8-2.9-13.8-8.3-4-14.8c8.7-5,27.5-8.6,46.3-8.6c18.8,0,37.6,3.5,46.3,8.5c9.8,6.5-0.3,12-4,14.8 c-12.1,9.2-39.8,30.9-40.2,43.9c0,0.3,0,0.6,0,1c5.6-2,11.7-1.9,24.7-9.7c16-9.6,29.3-12.1,53.1-10.9c23.7,1.2,43.6,9.1,54.7,11.9 C445.6,123.3,441.7,116.9,438.6,115z" style="stroke: rgb(156, 161, 164); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const CLASSIC_BAND_COLLAR_SVG = `<g data-color-control="knit_base" class="element_select"><path d="M335.5,88.1c8-3.7,13.4-7.7,14.6-9.5c1.6-2.5,1.5-5.4-3.2-8.5c-8.8-5.1-27.8-7.6-46.8-7.5h0 c-19-0.1-38,2.5-46.8,7.5c-4.7,3.2-4.8,6.1-3.2,8.5c1.1,1.8,6.6,5.9,14.6,9.5C268.3,89.8,331.7,89.8,335.5,88.1z" style="fill: rgb(255, 255, 255);"></path> <path d="M300,62.5c-19-0.1-38,2.5-46.8,7.5 c-4.7,3.2-4.8,6.1-3.2,8.5c1.1,1.8,6.6,5.9,14.6,9.5c3.8,1.7,16,6.1,24.6,7c3.8,0.5,6,0.7,6.6,1.7c1.6,2.7,2.7,27.1,1.6,33.6 c0,0-22.4,0.5-39.2-6.8c-16.8-7.3-22.2-15.3-23.5-17.6c0,0,2.8-15,6.1-24.2c3.8-10.8,9.3-17.1,22.9-20.4c8.2-2,22.3-3,36.3-3h0.4 c14,0,28.1,1,36.3,3c13.6,3.3,19.1,9.6,22.9,20.4c3.2,9.2,6.1,24.2,6.1,24.2c-1.3,2.3-6.7,10.3-23.5,17.6 c-16.8,7.3-39.2,6.8-39.2,6.8c-1.1-6.5,0-30.9,1.6-33.6c0.6-1,2.8-1.2,6.6-1.7c8.6-0.9,20.8-5.3,24.6-7c8-3.7,13.4-7.7,14.6-9.5 c1.6-2.5,1.5-5.4-3.2-8.5C338.1,64.9,319,62.4,300,62.5L300,62.5z" style="stroke: rgb(156, 161, 164); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const BAND_COLLAR_SVG = `<g data-color-control="collar_base" class="element_select"><path d="M301.9,127.5h-2.9c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2 c0,0,2.6-4.1,5.5-11.5c1.7-4.4,3.9-15.9,7.1-18.6c3.3-2.7,22.5-8.8,54.7-8.8h1.3c32.3,0,51.5,6.1,54.7,8.8 c3.2,2.7,5.4,14.3,7.1,18.6c3,7.4,5.5,11.5,5.5,11.5c-1.2,1.9-6.2,8.3-21.5,14.2c-12.6,4.8-38.8,7.4-45.6,7.5h-2.9" style="fill: rgb(255, 255, 255); stroke: rgb(202, 202, 232); stroke-miterlimit: 10;"></path> <path d="M237.5,94.2c1.7-4.4,3.9-15.9,7.1-18.6c1.2-1,2.6,20.2,47.8,20.2c1,0,6.7,0.1,6.7,3.9 v27.8c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2C232,105.7,234.6,101.7,237.5,94.2z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path> <path d="M362.5,94.2c-1.7-4.4-3.9-15.9-7.1-18.6c-1.2-1-2.6,20.2-47.8,20.2 c-1,0-6.7,0.1-6.7,3.9v27.8c6.8-0.1,33-2.6,45.6-7.5c15.4-5.9,20.3-12.4,21.5-14.2C368.1,105.7,365.5,101.7,362.5,94.2z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: rgb(255, 255, 255);"></path></g>`;
const BAND_COLLAR_STRIPE_SVG = `<g><g data-color-control="collar_base" class="element_select"><path d="M301.9,127.5h-2.9c-6.8-0.1-33-2.6-45.6-7.5c-15.4-5.9-20.3-12.4-21.5-14.2 c0,0,2.6-4.1,5.5-11.5c1.7-4.4,3.9-15.9,7.1-18.6c3.3-2.7,22.5-8.8,54.7-8.8h1.3c32.3,0,51.5,6.1,54.7,8.8 c3.2,2.7,5.4,14.3,7.1,18.6c3,7.4,5.5,11.5,5.5,11.5c-1.2,1.9-6.2,8.3-21.5,14.2c-12.6,4.8-38.8,7.4-45.6,7.5h-2.9" style="fill: rgb(255, 255, 255); stroke: rgb(202, 202, 232); stroke-miterlimit: 10;"></path></g></g>`;

export const COLLAR_STYLES = [
  { id: 'classic_standup', name: 'Classic Standup Collar', svg: CLASSIC_STANDUP_SVG },
  { id: 'overlap_standup', name: 'Overlap Standup Collar', svg: OVERLAP_STANDUP_SVG },
  { id: 'pro_shirt',       name: 'Pro (Shirt) Collar',    svg: PRO_SHIRT_COLLAR_SVG },
  { id: 'hood',            name: 'Hood',                  svg: HOOD_SVG },
  { id: 'zippered_hood',   name: 'Zippered Hood',         svg: ZIPPERED_HOOD_SVG },
  { id: 'classic_band',    name: 'Classic Band Collar',   svg: CLASSIC_BAND_COLLAR_SVG },
  { id: 'band',            name: 'Band Collar',           svg: BAND_COLLAR_SVG },
  { id: 'band_stripe',     name: 'Band Collar With Stripe', svg: BAND_COLLAR_STRIPE_SVG },
];

// ─── PATCH CATEGORIES (matches reference "Patch:" carousel exactly) ─────────
export const PATCH_CATEGORIES = [
  { id: 'None',             label: 'None' },
  { id: 'Year',              label: 'Year' },
  { id: 'PositionNumber',    label: 'Position/Number' },
  { id: 'Academics',         label: 'ACADEMICS' },
  { id: 'Athletics',         label: 'ATHLETICS' },
  { id: 'BandMusic',         label: 'BAND/MUSIC' },
  { id: 'CheerDanceDrill',   label: 'CHEER-DANCE-DRILL' },
  { id: 'CrazyWord',         label: 'CRAZY WORD' },
  { id: 'CustomFlags',       label: 'CUSTOM FLAGS' },
  { id: 'FFAAnimalsRodeo',   label: 'FFA-ANIMALS-RODEO' },
  { id: 'ROTC',              label: 'ROTC' },
  { id: 'WalkingPatches',    label: 'WALKING PATCHES' },
];

// ─── PATCH STYLE (matches reference "Patch style:" carousel) ────────────────
export const PATCH_STYLES = [
  { id: 'Chenille',      name: 'Chenille Patch' },
  { id: 'GlitterVinyl',  name: 'Glitter Vinyl Patch' },
  { id: 'SportTouch',    name: 'Sport Touch Patch' },
];

// ─── PATCH FONT (matches reference "Font:" Classic/Crazy toggle) ────────────
export const PATCH_FONT_OPTIONS = [
  { id: 'Classic', label: 'Classic' },
  { id: 'Crazy',   label: 'Crazy' },
];

// ─── IMAGE PATCH CATEGORIES ──────────────────────────────────────────────────
// These categories show an IMAGE grid instead of the text-patch builder.
// (Year and Position/Number stay text-based.)
export const IMAGE_PATCH_CATEGORIES = [
  'Academics', 'Athletics', 'BandMusic', 'CheerDanceDrill', 'CrazyWord',
  'CustomFlags', 'FFAAnimalsRodeo', 'ROTC', 'WalkingPatches',
];

// ─── PATCH IMAGES ─────────────────────────────────────────────────────────────
// Each image category shows its own grid. Selecting an image (or pasting a URL)
// sets state.patchImageUrl, which JacketVisualPreview renders as a patch.
//
// NOTE: the URLs below are DUMMY placeholder badges (inline SVG) just so the
// grids work out of the box. Replace them with your own project images — e.g.
//   import athletics1 from '../assets/patches/athletics-1.png';
//   Athletics: [{ id: 'ath_1', name: 'Football', url: athletics1 }, ...]
const dummyPatch = (label, bg, fg = '#ffffff') => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
      `<circle cx="60" cy="60" r="54" fill="${bg}" stroke="${fg}" stroke-width="4"/>` +
      `<circle cx="60" cy="60" r="45" fill="none" stroke="${fg}" stroke-width="2" stroke-dasharray="4 4" opacity="0.65"/>` +
      `<text x="60" y="63" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="${fg}">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

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
     '/patches/academics/arrow-symb.svg',
    '/patches/academics/basket-ball.svg',
   '/patches/academics/boxer.svg',
'/patches/academics/footbal.svg',
'/patches/academics/bear.svg',
'/patches/academics/hand-glove.svg',
'/patches/academics/fire-football.svg',
'/patches/academics/basketball.svg',
'/patches/academics/tennis-ground.svg',
'/patches/academics/orange-fire-football.svg',
'/patches/academics/hockey.svg',
'/patches/academics/funny-emoji.svg',
'/patches/academics/throw-ball.svg',
'/patches/academics/captain.svg',
'/patches/academics/arrow-fish.svg',
'/patches/academics/orange-hockey.svg',
'/patches/academics/blue-hoackey.svg',
'/patches/academics/yellow-hockey.svg',
'/patches/academics/tennis.svg',
'/patches/academics/sky-tennis.svg',
'/patches/academics/red-tennis.svg',
'/patches/academics/green-tennis.svg',
'/patches/academics/athletic-man.svg',
'/patches/academics/red-athlete.svg',
'/patches/academics/orange-blue-hoackey.svg',
'/patches/academics/red-basketball.svg',
'/patches/academics/inches-tape.svg',
'/patches/academics/red-helmet.svg',
'/patches/academics/pink-helmet.svg',
'/patches/academics/fire-basket-ball.svg',
'/patches/academics/red-jug.svg',
'/patches/academics/orange-ball.svg',
   
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

// ─── Patch Designs (legacy image patches — kept exported for backward
// compatibility with any code that may still reference it, but no longer
// used by the Patch decor-type UI below). ─────────────────────────────────
export const PATCH_DESIGNS = [
  { id: 'eagle',  name: 'Eagle',  category: 'Classic',  url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/eagle.webp' },
  { id: 'wolf',   name: 'Wolf',   category: 'Wild',     url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/wolf.webp' },
  { id: 'lion',   name: 'Lion',   category: 'Royal',    url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/lion.webp' },
  { id: 'shield', name: 'Shield', category: 'Heraldic', url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/shield.webp' },
  { id: 'crown',  name: 'Crown',  category: 'Royal',    url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/crown.webp' },
  { id: 'skull',  name: 'Skull',  category: 'Edgy',     url: 'https://jacketshop.com/wp-content/themes/wpb/assets/img/patches/skull.webp' },
];

// ─── Small style helpers ──────────────────────────────────────────────────────
const pillStyle = (active) => ({
  padding: '7px 12px',
  borderRadius: 8,
  border: active ? '2px solid #2563eb' : '2px solid #e5e7eb',
  background: active ? '#eff6ff' : '#ffffff',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  color: active ? '#1d4ed8' : '#374151',
});

// ─── Color Picker Row ─────────────────────────────────────────────────────────
function ColorPickerRow({ label, selectedHex, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="vdp-text-options-label">{label}</label>
      <div className="vdp-color-grid">
        {LEATHER_COLORS.map((col) => (
          <button
            key={col.name}
            type="button"
            onClick={() => onChange(col.hex, col.name)}
            className="vdp-color-btn"
            style={{ backgroundColor: col.hex, border: col.hex === '#ffffff' ? '1px solid #d1d5db' : 'none' }}
            title={col.name}
          >
            {selectedHex === col.hex && (
              <div className="vdp-color-check">
                <Check size={8} className="vdp-color-check-icon" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Font Selector + Live Preview (used by FullTextOptions / Text decor type) ─
function FontSelector({ selectedFont, fillColor, strokeColor, onSelectFont }) {
  const fontsReady = useFontsReady(FONT_OPTIONS.map((f) => f.fontFamily));
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="vdp-text-options-label">Font Style</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FONT_OPTIONS.map((f) => {
          const isActive = selectedFont === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFont(f.id)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: isActive ? '2px solid #2563eb' : '2px solid #e5e7eb',
                background: isActive ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minWidth: 86,
              }}
            >
              <span style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, color: isActive ? '#1d4ed8' : '#6b7280' }}>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Text Preview Box ────────────────────────────────────────────────────
function LiveTextPreview({ text, font, fillColor, strokeColor }) {
  const fontsReady = useFontsReady(FONT_OPTIONS.map((f) => f.fontFamily));
  if (!text) return null;
  const fontObj = FONT_OPTIONS.find((f) => f.id === font) || FONT_OPTIONS[0];
  return (
    <div style={{
      margin: '12px 0',
      padding: '16px 12px',
      background: '#111827',
      borderRadius: 10,
      textAlign: 'center',
      minHeight: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
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

// ─── FULL TEXT OPTIONS (shared by chest, sleeve, and back lines) ─────────────
export function FullTextOptions({ value, onChange, maxLength = 14 }) {
  const v = value || {};

  return (
    <div className="vdp-text-options">
      {/* Inscription */}
      <div style={{ marginBottom: 12 }}>
        <label className="vdp-text-options-label">Input Inscription</label>
        <input
          type="text"
          maxLength={maxLength}
          value={v.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="e.g. 23, VARSITY"
          className="vdp-text-input"
        />
      </div>

      {/* Live preview */}
      <LiveTextPreview text={v.text} font={v.font || 'Script'} fillColor={v.color} strokeColor={v.strokeColor} />

      {/* Font */}
      <FontSelector
        selectedFont={v.font || 'Script'}
        fillColor={v.color || '#d4af37'}
        strokeColor={v.strokeColor}
        onSelectFont={(fontId) => onChange({ font: fontId })}
      />

      {/* Material */}
      <div style={{ marginBottom: 12 }}>
        <label className="vdp-text-options-label">Material</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MATERIALS.map((m) => (
            <button key={m.id} type="button" onClick={() => onChange({ material: m.id })} style={pillStyle(v.material === m.id)}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sport Touch texture (only when material is Sport Touch Patch) */}
      {v.material === 'SportTouch' && (
        <div style={{ marginBottom: 12 }}>
          <label className="vdp-text-options-label">Sport Touch Texture</label>
          <div className="vdp-color-grid">
            {SPORT_TOUCH_TEXTURES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange({ sportTouchTexture: t.id })}
                className="vdp-color-btn"
                style={{ backgroundColor: t.hex }}
                title={t.name}
              >
                {v.sportTouchTexture === t.id && (
                  <div className="vdp-color-check">
                    <Check size={8} className="vdp-color-check-icon" />
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
        selectedHex={v.strokeColor || ''}
        onChange={(hex, name) => onChange({ strokeColor: hex, strokeColorName: name })}
      />

      {/* Felt (Fill) Color */}
      <ColorPickerRow
        label="Felt Color"
        selectedHex={v.color || ''}
        onChange={(hex, name) => onChange({ color: hex, colorName: name })}
      />

      {/* Text Height */}
      <div style={{ marginBottom: 12 }}>
        <label className="vdp-text-options-label">Text Height</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEXT_HEIGHTS.map((h) => (
            <button key={h} type="button" onClick={() => onChange({ height: h })} style={pillStyle(v.height === h)}>
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Arc */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="vdp-text-options-label" style={{ marginBottom: 0 }}>
            Arc: <span style={{ color: '#dc2626' }}>{v.arc ?? 0}</span>
          </label>
          <button
            type="button"
            onClick={() => onChange({ arc: 0 })}
            style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
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
          style={{ width: '100%' }}
        />
      </div>

      {/* Rhinestones */}
      <div style={{ marginBottom: 4 }}>
        <label className="vdp-text-options-label">Rhinestones</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => onChange({ rhinestones: false })} style={pillStyle(!v.rhinestones)}>No</button>
          <button type="button" onClick={() => onChange({ rhinestones: true })} style={pillStyle(!!v.rhinestones)}>Yes</button>
        </div>
      </div>
    </div>
  );
}

// ─── PATCH DESIGN OPTIONS ─────────────────────────────────────────────────────
// Year / Position-Number  -> original text-patch builder (unchanged)
// Every other category     -> image grid (pick an image; shows on preview)
export function PatchDesignOptions({ value, onChange }) {
  const v = value || {};
  const category = v.patchCategory || 'None';
  const patchStyle = v.patchStyle || 'Chenille';
  const isImageCategory = IMAGE_PATCH_CATEGORIES.includes(category);
  const isTextCategory = category === 'Year' || category === 'PositionNumber';

  return (
    <div className="vdp-patch-design-options" style={{ width: '100%', minWidth: 0 }}>
      {/* Patch category */}
      <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
        <label className="vdp-text-options-label">Patch</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PATCH_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              // switching category clears any previously-selected image
              onClick={() => onChange({ patchCategory: c.id, patchImageUrl: '', patchImageId: '', patchImageName: '' })}
              style={pillStyle(category === c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year — only for the Year category */}
      {category === 'Year' && (
        <div style={{ marginBottom: 14 }}>
          <label className="vdp-text-options-label">Year</label>
          <input
            type="text"
            maxLength={4}
            value={v.patchYearText || ''}
            onChange={(e) => onChange({ patchYearText: e.target.value })}
            placeholder="_ _ _ _"
            className="vdp-text-input"
          />
        </div>
      )}

      {/* Position/Number — only for that category */}
      {category === 'PositionNumber' && (
        <div style={{ marginBottom: 14 }}>
          <label className="vdp-text-options-label">Position / Number</label>
          <input
            type="text"
            maxLength={8}
            value={v.patchPositionText || ''}
            onChange={(e) => onChange({ patchPositionText: e.target.value })}
            placeholder="e.g. QB, 23"
            className="vdp-text-input"
          />
        </div>
      )}

      {/* IMAGE CATEGORIES — pick an image (renders on the jacket preview) */}
      {isImageCategory && (
        <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
          <label className="vdp-text-options-label">Select Patch Image</label>
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
                    border: selected ? '2px solid #2563eb' : '2px dashed #d1d5db',
                    borderRadius: 8,
                    background: img.url ? '#ffffff' : '#f9fafb',
                    cursor: img.url ? 'pointer' : 'not-allowed',
                    padding: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{img.name}</span>
                  )}
                  {selected && (
                    <div style={{ position: 'absolute', top: 2, right: 2, background: '#2563eb', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={9} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Or paste any image URL directly */}
         
         
        </div>
      )}

      {/* TEXT-patch builder — ONLY for Year / Position-Number (unchanged) */}
      {isTextCategory && (
        <>
          {/* Class of badge */}
          <div style={{ marginBottom: 14 }}>
            <label className="vdp-text-options-label">Class of badge</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => onChange({ patchClassBadge: false })} style={pillStyle(!v.patchClassBadge)}>No</button>
              <button type="button" onClick={() => onChange({ patchClassBadge: true })} style={pillStyle(!!v.patchClassBadge)}>Yes</button>
            </div>
          </div>

          {/* Font: Classic / Crazy */}
          <div style={{ marginBottom: 14 }}>
            <label className="vdp-text-options-label">Font</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PATCH_FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ patchFontStyle: f.id })}
                  style={pillStyle((v.patchFontStyle || 'Classic') === f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patch style: Chenille / Glitter Vinyl / Sport Touch */}
          <div style={{ marginBottom: 14, width: '100%', minWidth: 0 }}>
            <label className="vdp-text-options-label">Patch style</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PATCH_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChange({ patchStyle: s.id })}
                  style={pillStyle(patchStyle === s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chenille Color — only when patch style is Chenille */}
          {patchStyle === 'Chenille' && (
            <ColorPickerRow
              label="Chenille Color"
              selectedHex={v.patchChenilleColor || ''}
              onChange={(hex, name) => onChange({ patchChenilleColor: hex, patchChenilleColorName: name })}
            />
          )}

          {/* Sport Touch Texture — only when patch style is Sport Touch */}
          {patchStyle === 'SportTouch' && (
            <div style={{ marginBottom: 12 }}>
              <label className="vdp-text-options-label">Sport Touch Texture</label>
              <div className="vdp-color-grid">
                {SPORT_TOUCH_TEXTURES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ patchSportTouchTexture: t.id })}
                    className="vdp-color-btn"
                    style={{ backgroundColor: t.hex }}
                    title={t.name}
                  >
                    {v.patchSportTouchTexture === t.id && (
                      <div className="vdp-color-check">
                        <Check size={8} className="vdp-color-check-icon" />
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
          <div style={{ marginBottom: 4 }}>
            <label className="vdp-text-options-label">Rhinestones</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => onChange({ patchRhinestones: false })} style={pillStyle(!v.patchRhinestones)}>No</button>
              <button type="button" onClick={() => onChange({ patchRhinestones: true })} style={pillStyle(!!v.patchRhinestones)}>Yes</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DesignPatchesPanel({ state, onChangeState, onNext }) {
  const [activeSegment, setActiveSegment] = useState('leftChest');

  const toggleSegment = (segment) => {
    setActiveSegment((prev) => (prev === segment ? '' : segment));
  };

  const updateSegment = (key, changes) => {
    onChangeState((prev) => {
      const original = prev[key];
      const updated = { ...original, ...changes };
      let price = 0;
      if (updated.type === 'Text' && updated.text) price = 15;
      else if (updated.type === 'Emblem') price = 20;
      else if (updated.type === 'Patch' && updated.patchCategory && updated.patchCategory !== 'None') price = 25;
      updated.price = price;
      return { ...prev, [key]: updated };
    });
  };

  const updateBackSegment = (changes) => {
    onChangeState((prev) => {
      const original = prev.back;
      const updated = { ...original, ...changes };
      let price = 0;
      if (updated.type === 'Text') {
        if (updated.line1Text) price += 20;
        if (updated.line2Text) price += 15;
        if (updated.line3Text) price += 15;
      } else if (updated.type === 'Patch' && updated.patchCategory && updated.patchCategory !== 'None') {
        price = 35;
      }
      updated.price = price;
      return { ...prev, back: updated };
    });
  };

  const patchSubtitle = (data) => {
    if (!data.patchCategory || data.patchCategory === 'None') return 'Patch: None';
    const label = PATCH_CATEGORIES.find((c) => c.id === data.patchCategory)?.label || data.patchCategory;
    if (IMAGE_PATCH_CATEGORIES.includes(data.patchCategory) && data.patchImageUrl) {
      return `Patch: ${label} (image)`;
    }
    return `Patch: ${label}`;
  };

  const renderSegmentEditor = (key, label) => {
    const data = state[key];

    return (
      <div className="vdp-design-segment" key={key}>
        <button onClick={() => toggleSegment(key)} className="vdp-segment-header">
          <div className="vdp-segment-header-left">
            <div className="vdp-segment-check">
              <Check size={12} className="vdp-segment-check-icon" />
            </div>
            <div>
              <h3 className="vdp-segment-title">{label} Personalization</h3>
              <p className="vdp-segment-subtitle">
                {data.type === 'None'
                  ? 'None'
                  : data.type === 'Text'
                  ? `Text: "${data.text || ''}"`
                  : data.type === 'Emblem'
                  ? 'Insignia Emblem'
                  : patchSubtitle(data)}
                {data.price > 0 ? ` (+$${data.price})` : ''}
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`vdp-segment-chevron ${activeSegment === key ? 'vdp-segment-chevron-active' : ''}`}
          />
        </button>

        {activeSegment === key && (
          <div className="vdp-segment-content" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>

            {/* ── Decor Type Selector ── */}
            <div>
              <h4 className="vdp-segment-label">Select Decor Type</h4>
              <div className="vdp-decor-grid">
                {[
                  { type: 'None',   label: 'None',   icon: CircleSlash2 },
                  { type: 'Text',   label: 'Text/No.', icon: Type },
                  { type: 'Emblem', label: 'Emblem', icon: Award },
                  { type: 'Patch',  label: 'Patch',  icon: ImageIcon },
                  
                ].map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => updateSegment(key, { type: opt.type })}
                      className={`vdp-decor-btn ${
                        data.type === opt.type ? 'vdp-decor-btn-active' : 'vdp-decor-btn-inactive'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          data.type === opt.type ? 'vdp-decor-icon-active' : 'vdp-decor-icon-inactive'
                        }
                      />
                      <span className="vdp-decor-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TEXT OPTIONS (full set: font/material/sport-touch/outline/felt/height/arc/rhinestones) ── */}
            {data.type === 'Text' && (
              <FullTextOptions value={data} onChange={(changes) => updateSegment(key, changes)} maxLength={12} />
            )}

            {/* ── EMBLEM OPTIONS ── */}
            {data.type === 'Emblem' && (
              <div className="vdp-emblem-options">
                <div>
                  <label className="vdp-text-options-label">Select Insignia Emblem (+$20)</label>
                  <div className="vdp-emblem-grid">
                    {EMBLEMS.map((emb) => (
                      <button
                        key={emb.id}
                        onClick={() =>
                          updateSegment(key, { patchId: emb.id, patchName: emb.name })
                        }
                        className={`vdp-emblem-btn ${
                          data.patchId === emb.id ? 'vdp-emblem-btn-active' : 'vdp-emblem-btn-inactive'
                        }`}
                      >
                        <div className="vdp-emblem-icon">{emb.name.charAt(0)}</div>
                        <div className="vdp-emblem-name">{emb.name}</div>
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

            {/* ── PATCH OPTIONS (category-driven builder — see PatchDesignOptions) ── */}
            {data.type === 'Patch' && (
              <PatchDesignOptions
                value={data}
                onChange={(changes) => updateSegment(key, changes)}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vdp-design-container">
      {renderSegmentEditor('leftChest',  'Left Chest')}
      {renderSegmentEditor('rightChest', 'Right Chest')}
      {renderSegmentEditor('leftSleeve', 'Left Sleeve')}
      {renderSegmentEditor('rightSleeve','Right Sleeve')}

      {/* ── BACK PANEL ── */}
      <div className="vdp-design-segment">
        <button onClick={() => toggleSegment('back')} className="vdp-segment-header">
          <div className="vdp-segment-header-left">
            <div className="vdp-segment-check">
              <Check size={12} className="vdp-segment-check-icon" />
            </div>
            <div>
              <h3 className="vdp-segment-title">Back Personalization</h3>
              <p className="vdp-segment-subtitle">
                {state.back.type === 'None'
                  ? 'None'
                  : state.back.type === 'Text'
                  ? 'Custom Arched Script Text'
                  : patchSubtitle(state.back)}
                {state.back.price > 0 ? ` (+$${state.back.price})` : ''}
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`vdp-segment-chevron ${activeSegment === 'back' ? 'vdp-segment-chevron-active' : ''}`}
          />
        </button>

        {activeSegment === 'back' && (
          <div className="vdp-segment-content" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <div>
              <h4 className="vdp-segment-label">Select Back Style</h4>
              <div className="vdp-back-style-grid">
                {[
                  { type: 'None',  label: 'None' },
                  { type: 'Text',  label: 'Arched Typography' },
                  { type: 'Patch', label: 'Center Patch' },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => updateBackSegment({ type: opt.type })}
                    className={`vdp-back-style-btn ${
                      state.back.type === opt.type
                        ? 'vdp-back-style-btn-active'
                        : 'vdp-back-style-btn-inactive'
                    }`}
                  >
                    <span className="vdp-back-style-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {state.back.type === 'Text' && (
              <div className="vdp-back-text-options">
                {/* Back Line 1 */}
                <BackLineRow
                  label="Line 1: Arched Top Text"
                  prefix="line1"
                  backState={state.back}
                  onChange={updateBackSegment}
                />

                {/* Back Line 2 (center) */}
                <BackLineRow
                  label="Line 2: Center Script Tail"
                  prefix="line3"
                  backState={state.back}
                  onChange={updateBackSegment}
                />

                {/* Back Line 3 (bottom arch) */}
                <BackLineRow
                  label="Line 3: Arched Bottom Text"
                  prefix="line2"
                  backState={state.back}
                  onChange={updateBackSegment}
                />
              </div>
            )}

            {/* ── BACK PATCH OPTIONS (same category-driven builder as chest/sleeve) ── */}
            {state.back.type === 'Patch' && (
              <PatchDesignOptions
                value={state.back}
                onChange={updateBackSegment}
              />
            )}
          </div>
        )}
      </div>

      <div className="vdp-design-segment">
  <button
    onClick={() => toggleSegment('uploadDesign')}
    className="vdp-segment-header"
  >
    <div className="vdp-segment-header-left">
      <div className="vdp-segment-check">
        <Check size={12} className="vdp-segment-check-icon" />
      </div>

      <div>
        <h3 className="vdp-segment-title">
          Upload Design
        </h3>

        <p className="vdp-segment-subtitle">
          {state.uploadDesign?.file
            ? state.uploadDesign.file.name
            : 'Upload your own artwork'}
        </p>
      </div>
    </div>

    <ChevronDown
      size={18}
      className={`vdp-segment-chevron ${
        activeSegment === 'uploadDesign'
          ? 'vdp-segment-chevron-active'
          : ''
      }`}
    />
  </button>

  {activeSegment === 'uploadDesign' && (
    <div className="vdp-segment-content">

      <div style={{ marginBottom: 16 }}>
        <label className="vdp-text-options-label">
          Upload Artwork
        </label>

        <input
          type="file"
          accept=".png,.jpg,.jpeg,.svg,.pdf,.ai,.eps"
          onChange={(e) => {
            const file = e.target.files?.[0];

            onChangeState(prev => ({
              ...prev,
              uploadDesign: {
                ...prev.uploadDesign,
                file
              }
            }));
          }}
        />
      </div>

      <div>
        <label className="vdp-text-options-label">
          Designer Notes
        </label>

        <textarea
          className="vdp-text-input"
          rows={4}
          placeholder="Add instructions for our designer..."
          value={state.uploadDesign?.notes || ''}
          onChange={(e) =>
            onChangeState(prev => ({
              ...prev,
              uploadDesign: {
                ...prev.uploadDesign,
                notes: e.target.value
              }
            }))
          }
        />
      </div>

    </div>
  )}
</div>

      <button onClick={onNext} className="vdp-next-btn">
        <span>Proceed To Size Selection</span>
      </button>
    </div>
  );
}

// ─── BackLineRow helper ───────────────────────────────────────────────────────
function BackLineRow({ label, prefix, backState, onChange }) {
  const [open, setOpen] = useState(false);

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const value = {
    text: backState[`${prefix}Text`] || '',
    font: backState[`${prefix}Font`],
    material: backState[`${prefix}Material`],
    sportTouchTexture: backState[`${prefix}SportTouchTexture`],
    color: backState[`${prefix}Color`] || '',
    strokeColor: backState[`${prefix}StrokeColor`] || '',
    height: backState[`${prefix}Height`],
    arc: backState[`${prefix}Arc`],
    rhinestones: backState[`${prefix}Rhinestones`],
  };

  const handleChange = (partial) => {
    const mapped = {};
    Object.entries(partial).forEach(([k, val]) => {
      mapped[`${prefix}${cap(k)}`] = val;
    });
    onChange(mapped);
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', padding: '10px 14px', background: '#f9fafb',
          border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{label}</span>
        <ChevronDown
          size={15}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
        />
      </button>

      {open && (
        <div style={{ padding: '12px 14px' }}>
          <FullTextOptions value={value} onChange={handleChange} maxLength={15} />
        </div>
      )}
    </div>
  );
}

// ─── PropTypes ────────────────────────────────────────────────────────────────
DesignPatchesPanel.propTypes = {
  state: PropTypes.shape({
    collarStyle: PropTypes.string.isRequired,
    collarColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    collarColorName: PropTypes.string,
    leftChest:   PropTypes.object.isRequired,
    rightChest:  PropTypes.object.isRequired,
    leftSleeve:  PropTypes.object.isRequired,
    rightSleeve: PropTypes.object.isRequired,
    back:        PropTypes.object.isRequired,
    uploadDesign: PropTypes.object,
  }).isRequired,
  onChangeState: PropTypes.func.isRequired,
  onNext:        PropTypes.func.isRequired,
};