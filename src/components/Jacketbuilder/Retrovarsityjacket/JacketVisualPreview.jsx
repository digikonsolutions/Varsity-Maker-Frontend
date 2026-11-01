/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JacketVisualPreview.jsx — UPDATED (v5 selectable pocket styles):
 * 1..12 (see previous history) ...
 * 13. NEW: Selectable POCKET STYLES on the Front view.
 *     `state.pocketStyle` drives which pocket artwork is drawn:
 *       'Slash'    -> the original default slit pockets (unchanged)
 *       'Flap'     -> flap pockets with snap buttons
 *       'Snap'     -> snap pockets
 *       'Straight' -> straight vertical pockets
 *       'Welt'     -> welt pockets
 *       'Zipper'   -> zipper pockets
 *     Every non-slash style is real artwork (left + right) that is recolored
 *     live with the chosen `state.pocketColor` (pocketHex). The main pocket
 *     body fill of each artwork is swapped to pocketHex so changing the pocket
 *     color in the panel updates the preview immediately.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './JacketVisualPreview.css';
import { COLLAR_STYLES, FONT_OPTIONS, SPORT_TOUCH_TEXTURES } from './DesignPatchesPanel.jsx';

// ─── Wait for webfonts to actually finish loading ────────────────────────────
function useFontsReady(fontFamilies) {
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await Promise.all(
            fontFamilies.map((ff) => document.fonts.load(`700 32px ${ff}`).catch(() => {}))
          );
          await document.fonts.ready;
        }
      } catch (e) {
        // ignore — worst case we just keep the fallback font
      }
      if (!cancelled) setGeneration((g) => g + 1);
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return generation;
}

// ─── Google Fonts Loader (same set as panel) ─────────────────────────────────
const FONT_IMPORTS = [
  'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',
  'https://fonts.googleapis.com/css2?family=Yellowtail&display=swap',
  'https://fonts.googleapis.com/css2?family=Anton&display=swap',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap',
  'https://fonts.googleapis.com/css2?family=Jersey+15&display=swap',
  'https://fonts.googleapis.com/css2?family=Bangers&display=swap',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600&display=swap',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&display=swap',
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap',
];
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

// ─── Font resolver ────────────────────────────────────────────────────────────
const DEFAULT_FONT_STYLE = {
  fontFamily: '"Pinyon Script", "Brush Script MT", cursive',
  fontWeight: 400, fontStyle: 'italic', textTransform: 'none', extraSpacing: '0.01em',
  transform: 'skewX(-12)', syntheticBold: false,
};
const resolveFontStyle = (fontId) => {
  const found = FONT_OPTIONS.find((f) => f.id === fontId);
  return found || DEFAULT_FONT_STYLE;
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
  return num * 11; // approx px-per-inch scaling tuned for the 600x600 viewBox
};

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 26, g: 26, b: 26 };
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
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

// ─── Quadratic bezier point helper (for rhinestone placement along arc) ──────
const quadPoint = (t, p0, p1, p2) => {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
};

let _arcIdCounter = 0;

// ─── ArcText: curved/straight text with material treatment + rhinestones ────
const ArcText = ({
  text, cx, cy, fontId, fillColor, strokeColor, fontSize = 32,
  arc = 0, material, sportTouchTexture, rhinestones, letterSpacing, uppercase = false,
}) => {
  if (!text) return null;
  const fontStyleDef = resolveFontStyle(fontId);
  const shouldUppercase = uppercase || fontStyleDef.textTransform === 'uppercase';
  const displayText = shouldUppercase ? text.toUpperCase() : text;
  const resolvedLetterSpacing = letterSpacing !== undefined ? letterSpacing : (fontStyleDef.extraSpacing || '1');

  let fill = fillColor || '#ffffff';
  if (material === 'SportTouch') {
    fill = resolveSportTouchHex(sportTouchTexture) || fill;
  }

  const hasUserStroke = strokeColor && strokeColor !== fill;
  const stroke = hasUserStroke ? strokeColor : (fontStyleDef.syntheticBold ? fill : 'none');
  let strokeWidth = stroke !== 'none'
    ? Math.max(1.5, fontSize * (hasUserStroke ? 0.06 : (fontStyleDef.syntheticBold ? 0.1 : 0)))
    : 0;

  let dashArray = undefined;
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

  _arcIdCounter += 1;
  const pathId = `arcText_${_arcIdCounter}`;
  const glitterId = `glitterGrad_${_arcIdCounter}`;
  const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  const rhinestonePoints = [];
  if (rhinestones && displayText.trim().length > 0) {
    const chars = displayText.split('');
    const nonSpace = chars.filter((c) => c !== ' ').length || 1;
    let seen = 0;
    chars.forEach((ch, idx) => {
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

  const fontTransform = fontStyleDef.transform
    ? `translate(${cx} ${cy}) ${fontStyleDef.transform} translate(${-cx} ${-cy})`
    : undefined;

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
      <g transform={fontTransform}>
        <text
          fill={material === 'GlitterVinyl' ? `url(#${glitterId})` : fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          paintOrder="stroke fill"
          fontSize={fontSize}
          fontWeight={fontStyleDef.fontWeight || 'bold'}
          fontStyle={fontStyleDef.fontStyle || 'normal'}
          letterSpacing={resolvedLetterSpacing}
          fontFamily={fontStyleDef.fontFamily}
          style={{
            fontFamily: fontStyleDef.fontFamily,
            fontWeight: fontStyleDef.fontWeight || 'bold',
            fontStyle: fontStyleDef.fontStyle || 'normal',
          }}
        >
          <textPath href={`#${pathId}`} xlinkHref={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {displayText}
          </textPath>
        </text>
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

// ─── SVG Patch Image (legacy patchUrl fallback) ──────────────────────────────
const SvgPatch = ({ url, x, y, size = 70 }) => {
  if (!url) return null;
  return (
    <image
      href={url}
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      crossOrigin="anonymous"
    />
  );
};

// ─── Dedicated patch fonts (separate from the chest/sleeve FONT_OPTIONS set) ─
const PATCH_FONT_STYLES = {
  Classic: {
    fontFamily: '"Jersey 15", "Jersey 10", "Fredoka", "Arial Rounded MT Bold", sans-serif',
    fontWeight: 400,
    fontStyle: 'normal',
    transform: undefined,
  },
  Crazy: {
    fontFamily: '"Bangers", "Comic Sans MS", "Marker Felt", cursive',
    fontWeight: 700,
    fontStyle: 'normal',
    transform: 'skewX(6) rotate(-2)',
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
  if (category === 'Year' && segment.patchYearText) label = segment.patchYearText;
  if (category === 'PositionNumber' && segment.patchPositionText) label = segment.patchPositionText;

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

  const fontTransform = fontStyleDef.transform
    ? `translate(${cx} ${cy}) ${fontStyleDef.transform} translate(${-cx} ${-cy})`
    : undefined;

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
          fontFamily={fontStyleDef.fontFamily}
          fontWeight={fontStyleDef.fontWeight}
          fontStyle={fontStyleDef.fontStyle}
          fontSize={fontSize}
          letterSpacing="0.01em"
          style={{ fontFamily: fontStyleDef.fontFamily, fontWeight: fontStyleDef.fontWeight, fontStyle: fontStyleDef.fontStyle }}
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

// ─── SHOULDER INSERTS ────────────────────────────────────────────────────────
const LEFT_INSERT_SET = [
  "M123.5,152.5c4.2-6.4,10-12,16.9-16.9c7.5,11.2,27.2,47.4,31.8,92.1c2.2,25.3-3.3,44.9-3.7,43.3c-1.6-5.9-3.3-11.9-5-17.9C150.7,209.7,133.6,167.3,123.5,152.5z",
  "M176.3,230.4c-3.8-42.8-21-78.6-31.6-97.7l11.6-6.5l13.1-5.6c0,0,23.4,48,26.9,96.5c0,51-25.5,60-25.5,60s1.4-5.6,2.2-9.3C175.4,258.8,177.8,246.3,176.3,230.4z",
];
const RIGHT_INSERT_SET = [
  "M423.7,230.4c3.8-42.8,21-78.6,31.6-97.7l-11.6-6.5l-13.1-5.6c0,0-23.4,48-26.9,96.5c0,51,25.5,60,25.5,60s-1.4-5.6-2.2-9.3C424.6,258.8,422.2,246.3,423.7,230.4z",
  "M476.5,152.5c-4.2-6.4-10-12-16.9-16.9c-7.5,11.2-27.2,47.4-31.8,92.1c-2.2,25.3,3.3,44.9,3.7,43.3c1.6-5.9,3.3-11.9,5-17.9C449.3,209.7,466.4,167.3,476.5,152.5z",
];

const ShoulderInserts = ({ insertColors, insertCount }) => {
  const count = Math.min(3, Number(insertCount || 0));
  if (count === 0) return null;
  const colors = insertColors || [];
  const mainColor = colors[0] || "#9ca1a4";
  const secondColor = colors[1] || "#ffffff";
  const thirdColor = colors[2] || "#6b7280";

  return (
    <g id="shoulder-inserts">
      {count >= 1 && (
        <>
          <path d={LEFT_INSERT_SET[0]} fill={mainColor} />
          <path d={RIGHT_INSERT_SET[1]} fill={mainColor} />
        </>
      )}
      {count >= 2 && (
        <>
          <path d={LEFT_INSERT_SET[1]} fill={secondColor} />
          <path d={RIGHT_INSERT_SET[0]} fill={secondColor} />
        </>
      )}
      {count >= 3 && (
        <>
          <path d={LEFT_INSERT_SET[1]} fill={thirdColor} opacity="0.9" transform="translate(-8 0) scale(0.86 1)" />
          <path d={RIGHT_INSERT_SET[0]} fill={thirdColor} opacity="0.9" transform="translate(8 0) scale(0.86 1)" />
        </>
      )}
    </g>
  );
};

// ─── KNIT RIB OVERLAYS (real artwork trims for body band + cuffs) ───────────
const RIB_PATHS = {
  'Single Stripe': {
    bodyRight: "M322.355,495.721c49.112-1.436,84.709-7.924,106.11-19.348v8.27c-20.324,11.609-56.668,18.413-106.11,19.92V495.721z",
    bodyLeft: "M277.682,495.721c-49.112-1.436-84.709-7.924-106.11-19.348v8.27c20.324,11.609,56.668,18.413,106.11,19.92V495.721z",
    cuffLeft: "M151.852,504.821l2.353,8.733c-8.435,3.123-19.903,7.021-33.122,10.597c-8.232,2.226-16.239,4.032-23.363,5.469l-2.467-9.116c7.746-1.519,16.675-3.49,25.876-5.979C133.094,511.289,143.641,507.789,151.852,504.821z",
    cuffRight: "M448.146,504.821l-2.353,8.733c8.435,3.123,19.903,7.021,33.122,10.597c8.232,2.226,16.239,4.032,23.363,5.469l2.467-9.116c-7.746-1.519-16.675-3.49-25.876-5.979C466.904,511.289,456.357,507.789,448.146,504.821z",
  },
  'Double Stripe': {
    bodyRight: [
      "M171.572,483.735v4.548c16.269,7.999,47.299,16.54,106.11,18.315v-4.07C229.074,500.991,191.996,494.465,171.572,483.735z",
      "M171.572,474.823v4.548c16.269,7.999,47.299,16.54,106.11,18.315v-4.07C229.074,492.08,191.996,485.554,171.572,474.823z",
    ],
    bodyLeft: [
      "M428.465,487.284v-4.641c-20.324,11.609-56.668,18.413-106.11,19.92v4.069C371.468,505.196,407.065,498.708,428.465,487.284z",
      "M428.465,478.373v-4.641c-20.325,11.609-56.669,18.413-106.11,19.92v4.069C371.467,496.284,407.064,489.796,428.465,478.373z",
    ],
    cuffLeftPaths: [
      "M94.668,518.757c7.664-1.467,16.731-3.432,26.086-5.962c12.072-3.266,22.602-6.813,30.516-9.718l1.044,3.876c-7.973,2.918-18.492,6.451-30.515,9.704c-9.337,2.525-18.395,4.495-26.083,5.973L94.668,518.757z",
      "M97.238,528.257c7.086-1.404,15.187-3.209,23.516-5.462c13.362-3.615,24.841-7.576,32.965-10.627l1.045,3.878c-8.206,3.071-19.669,7.013-32.966,10.61c-8.318,2.25-16.41,4.057-23.514,5.47L97.238,528.257z",
    ],
    cuffRightPaths: [
      "M505.282,518.757c-7.664-1.467-16.731-3.432-26.086-5.962c-12.072-3.266-22.602-6.813-30.516-9.718l-1.044,3.876c7.973,2.918,18.492,6.451,30.515,9.704c9.337,2.525,18.395,4.495,26.083,5.973L505.282,518.757z",
      "M502.712,528.257c-7.086-1.404-15.187-3.209-23.516-5.462c-13.362-3.615-24.841-7.576-32.965-10.627l-1.045,3.878c8.206,3.071,19.669,7.013,32.966,10.61c8.318,2.25,16.41,4.057,23.514,5.47L502.712,528.257z",
    ],
  },
  'Border Knit': {
    bodyRight: [
      "M322.355,492.65v6.071l0.029-0.001c48.85-1.429,84.53-7.897,106.081-19.223v-6.918l-0.496,0.283C407.927,484.311,371.406,491.153,322.355,492.65z",
      "M322.355,501.562v6.071l0.029-0.001c48.851-1.429,84.531-7.897,106.081-19.223v-6.918l-0.496,0.283C407.927,493.223,371.407,500.065,322.355,501.562z",
    ],
    bodyLeft: [
      "M277.682,492.617c-48.797-1.546-85.328-8.004-105.645-18.68l-0.465-0.244v6.784c27.278,13.216,72.692,17.201,106.08,18.209l0.031,0.001V492.617z",
      "M277.682,501.528c-48.797-1.546-85.328-8.004-105.645-18.68l-0.465-0.244v6.784c27.278,13.216,72.692,17.201,106.08,18.209l0.031,0.001V501.528z",
    ],
    cuffLeft: "M148.786,493.435l6.772,25.134c1.156,4.275-1.351,6.83-5.28,8.874c-4.058,2.111-13.679,5.706-20.677,7.599c-6.998,1.893-17.119,3.639-21.688,3.862c-4.424,0.216-7.878-0.727-9.034-5.002l-6.798-25.129c0,0,13.725-1.641,28.862-5.736C137.238,498.628,148.786,493.435,148.786,493.435z",
    cuffRight: "M451.214,493.435l-6.772,25.134c-1.156,4.275,1.351,6.83,5.28,8.874c4.058,2.111,13.679,5.706,20.677,7.599c6.998,1.893,17.119,3.639,21.688,3.862c4.424,0.216,7.878-0.727,9.034-5.002l6.793-25.109c0,0-13.721-1.661-28.857-5.756C462.762,498.628,451.214,493.435,451.214,493.435z",
  },
};

const COMPOSITE_KNIT_STYLES = {
  'Single Stripe Border': ['Single Stripe', 'Border Knit'],
  'Double Stripe Border': ['Double Stripe', 'Border Knit'],
};

const RainbowStops = () => (
  <>
    <stop offset="0%" stopColor="#dc2626" />
    <stop offset="33%" stopColor="#d4af37" />
    <stop offset="66%" stopColor="#2563eb" />
    <stop offset="100%" stopColor="#7c3aed" />
  </>
);

const renderBodyStripeGroup = (style, color, keyPrefix) => {
  const set = RIB_PATHS[style];
  if (!set) return null;
  if (style === 'Border Knit' || style === 'Double Stripe') {
    return (
      <React.Fragment>
        {set.bodyLeft.map((d, i) => <path key={`${keyPrefix}-bl-${i}`} d={d} fill={color} />)}
        {set.bodyRight.map((d, i) => <path key={`${keyPrefix}-br-${i}`} d={d} fill={color} />)}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <path d={set.bodyLeft} fill={color} />
      <path d={set.bodyRight} fill={color} />
    </React.Fragment>
  );
};

const KnitBodyRibs = ({ knitStyle, lineColor, borderColor }) => {
  const color = lineColor || '#d4af37';
  const bColor = borderColor || color;

  if (knitStyle === 'Rainbow') {
    const single = RIB_PATHS['Single Stripe'];
    if (!single) return null;
    return (
      <g id="knit-body-ribs">
        <defs>
          <linearGradient id="rainbowBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <RainbowStops />
          </linearGradient>
        </defs>
        <path d={single.bodyLeft} fill="url(#rainbowBodyGrad)" />
        <path d={single.bodyRight} fill="url(#rainbowBodyGrad)" />
      </g>
    );
  }

  if (COMPOSITE_KNIT_STYLES[knitStyle]) {
    const [lineStyle, borderStyle] = COMPOSITE_KNIT_STYLES[knitStyle];
    return (
      <g id="knit-body-ribs">
        {renderBodyStripeGroup(borderStyle, bColor, 'border')}
        {renderBodyStripeGroup(lineStyle, color, 'line')}
      </g>
    );
  }

  const set = RIB_PATHS[knitStyle];
  if (!set) return null;

  if (knitStyle === 'Border Knit') {
    return <g id="knit-body-ribs">{renderBodyStripeGroup(knitStyle, bColor, 'solo')}</g>;
  }
  if (knitStyle === 'Double Stripe') {
    return <g id="knit-body-ribs">{renderBodyStripeGroup(knitStyle, color, 'solo')}</g>;
  }
  return (
    <g id="knit-body-ribs">
      <path d={set.bodyLeft} fill={color} />
      <path d={set.bodyRight} fill={color} />
    </g>
  );
};

const renderCuffGroup = (style, side, color, keyPrefix, outlineOnly = false) => {
  const set = RIB_PATHS[style];
  if (!set) return null;
  if (style === 'Single Stripe') {
    const d = side === 'left' ? set.cuffLeft : set.cuffRight;
    return <path d={d} fill={color} />;
  }
  if (style === 'Double Stripe') {
    const paths = side === 'left' ? set.cuffLeftPaths : set.cuffRightPaths;
    return <React.Fragment>{paths.map((d, i) => <path key={`${keyPrefix}-${i}`} d={d} fill={color} />)}</React.Fragment>;
  }
  if (style === 'Border Knit') {
    const d = side === 'left' ? set.cuffLeft : set.cuffRight;
    if (outlineOnly) {
      return <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeMiterlimit="10" />;
    }
    return <path d={d} fill="#ffffff" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" />;
  }
  return null;
};

const KnitCuffRibs = ({ knitStyle, side, lineColor, borderColor }) => {
  const color = lineColor || '#d4af37';
  const bColor = borderColor || color;

  if (knitStyle === 'Rainbow') {
    const single = RIB_PATHS['Single Stripe'];
    if (!single) return null;
    const gradId = `rainbowCuffGrad_${side}`;
    const d = side === 'left' ? single.cuffLeft : single.cuffRight;
    return (
      <g>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <RainbowStops />
          </linearGradient>
        </defs>
        <path d={d} fill={`url(#${gradId})`} />
      </g>
    );
  }

  if (COMPOSITE_KNIT_STYLES[knitStyle]) {
    const [lineStyle, borderStyle] = COMPOSITE_KNIT_STYLES[knitStyle];
    return (
      <g>
        {renderCuffGroup(borderStyle, side, bColor, 'border', true)}
        {renderCuffGroup(lineStyle, side, color, 'line')}
      </g>
    );
  }

  if (knitStyle === 'Border Knit') {
    const rendered = renderCuffGroup(knitStyle, side, bColor, 'solo', false);
    return rendered ? <g>{rendered}</g> : null;
  }

  const rendered = renderCuffGroup(knitStyle, side, color, 'solo');
  return rendered ? <g>{rendered}</g> : null;
};

// ─── COLLAR ACCENT KNIT-LINES (front collar only, for now) ──────────────────
const SINGLE_LINE_COLLAR_MARKS = [
  "M360.45,86.499c-18.157,13.514-39.984,29.776-58.27,43.403c0.005,0.035,0.004,0.073,0.01,0.109c0,0,5.564,0.122,13.221-0.653c15.631-11.636,32.574-24.028,47.164-34.627C361.947,92.069,361.225,89.21,360.45,86.499z",
  "M239.59,86.499c18.157,13.514,39.984,29.776,58.27,43.403c-0.005,0.035-0.004,0.073-0.01,0.109c0,0-5.564,0.122-13.221-0.653c-15.631-11.636-32.574-24.028-47.164-34.627C238.093,92.069,238.815,89.21,239.59,86.499z",
];

const DOUBLE_LINE_COLLAR_MARKS = [
  "M360.485,87.044c-0.4-1.402-0.814-2.764-1.236-4.04c-3.471,2.508-51.473,37.769-56.264,41.632c-0.773,2.086-1.091,4.042-0.794,5.797l0,0C302.19,130.434,357.344,89.31,360.485,87.044z",
  "M239.533,87.031c3.147,2.27,58.307,43.432,58.307,43.432c0.299-1.769-0.027-3.744-0.816-5.849c-14.368-11.581-52.778-39.111-56.255-41.623C240.347,84.266,239.933,85.628,239.533,87.031z",
  "M284.731,129.824c2.679,0.268,5.094,0.426,7.103,0.519c-14.191-11.392-50.544-37.446-53.341-39.461c-0.364,1.417-0.708,2.828-1.029,4.189C239.849,96.786,271.598,119.531,284.731,129.824z",
  "M362.558,95.081c-0.321-1.361-0.667-2.771-1.032-4.187c-2.792,2.01-39.102,28.034-53.283,39.416c2.014-0.094,4.43-0.254,7.11-0.524C328.473,119.507,360.178,96.793,362.558,95.081z",
];

const COLLAR_KNIT_LINE_PATHS = {
  'Single Stripe': SINGLE_LINE_COLLAR_MARKS,
  'Border Knit': SINGLE_LINE_COLLAR_MARKS,
  'Single Stripe Border': SINGLE_LINE_COLLAR_MARKS,
  'Double Stripe': DOUBLE_LINE_COLLAR_MARKS,
  'Double Stripe Border': DOUBLE_LINE_COLLAR_MARKS,
  'Rainbow': SINGLE_LINE_COLLAR_MARKS,
  'Two Stripes With Feathering': [
    "M291.269,129.893c-14.557-11.608-50.014-37.022-52.776-39.011c-0.364,1.417-0.708,2.828-1.029,4.189c2.348,1.688,33.16,23.763,46.641,34.265C286.782,129.617,289.217,129.789,291.269,129.893z",
    "M239.67,86.129c4.278,3.117,58.171,43.333,58.171,43.333c0.054-0.317,0.08-0.643,0.095-0.973c-0.029-1.594-0.454-3.313-1.228-5.129c-14.43-11.585-51.592-38.234-55.781-41.257C240.497,83.368,240.076,84.724,239.67,86.129z",
    "M360.348,86.143c-0.406-1.405-0.827-2.762-1.255-4.026c-4.426,3.212-49.63,36.422-55.794,41.27c-0.758,1.795-1.175,3.495-1.204,5.072c0.014,0.331,0.041,0.657,0.095,0.975C302.19,129.434,356.072,89.258,360.348,86.143z",
    "M315.981,129.298c13.467-10.489,44.233-32.531,46.577-34.217c-0.321-1.361-0.667-2.771-1.032-4.187c-2.756,1.985-38.171,27.368-52.717,38.966C310.865,129.755,313.303,129.581,315.981,129.298z",
  ],
};

// ─── SNAP BUTTONS (front closure) ────────────────────────────────────────────
const SnapButtons = ({ snapColor, count = 5 }) => {
  const positions = [];
  for (let i = 0; i < count; i++) positions.push({ x: 300, y: 175 + i * 60 });
  return (
    <g id="snap-buttons">
      <defs>
        <radialGradient id="snapMetalGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="20%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#d1d5db" /><stop offset="75%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </radialGradient>
        <radialGradient id="snapCenterGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <filter id="snapShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>
      {positions.map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y})`} filter="url(#snapShadow)">
          <circle r="6" fill="url(#snapMetalGrad)" stroke="#475569" strokeWidth="0.8" />
          <circle r="4" fill="url(#snapCenterGrad)" />
          <ellipse cx="-2" cy="-2.5" rx="2.5" ry="1.3" fill="#ffffff" opacity="0.7" />
          <circle r="1.2" fill="#64748b" />
        </g>
      ))}
    </g>
  );
};

// ─── ZIPPER (front closure) ──────────────────────────────────────────────────
const ZipperClosure = ({ showFlap = false }) => (
  <g id="zipper-closure" filter="url(#fShadow)">
    <defs>
      <linearGradient id="zipperMetal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4b5563"/><stop offset="20%" stopColor="#d1d5db"/>
        <stop offset="50%" stopColor="#ffffff"/><stop offset="80%" stopColor="#d1d5db"/>
        <stop offset="100%" stopColor="#374151"/>
      </linearGradient>
      <linearGradient id="zipperTape" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/><stop offset="50%" stopColor="#1e293b"/>
        <stop offset="100%" stopColor="#111827"/>
      </linearGradient>
    </defs>
    <rect x="296" y="132" width="3" height="385" fill="url(#zipperTape)" />
    <rect x="301" y="132" width="3" height="385" fill="url(#zipperTape)" />
    {Array.from({ length: 56 }).map((_, i) => (
      <rect key={`l-${i}`} x="298" y={136 + i * 6.8} width="2" height="4" rx="0.7" fill="url(#zipperMetal)" />
    ))}
    {Array.from({ length: 56 }).map((_, i) => (
      <rect key={`r-${i}`} x="300" y={139 + i * 6.8} width="2" height="4" rx="0.7" fill="url(#zipperMetal)" />
    ))}
    <line x1="300" y1="132" x2="300" y2="517" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.4" />
    <rect x="296" y="128" width="8" height="4" rx="2" fill="url(#zipperMetal)" />
    <rect x="296" y="516" width="8" height="5" rx="2" fill="url(#zipperMetal)" />
    <g transform="translate(291 235)">
      <ellipse cx="9" cy="3" rx="4" ry="5" fill="url(#zipperMetal)" stroke="#6b7280" strokeWidth="0.6" />
      <ellipse cx="9" cy="3" rx="2" ry="2.8" fill="#1f2937" />
      <path d="M5 8 C5 5 6.5 4 9 4 C11.5 4 13 5 13 8 L14.5 32 C14.8 37 13 40 9 40 C5 40 3.2 37 3.5 32 Z"
        fill="url(#zipperMetal)" stroke="#6b7280" strokeWidth="0.9" />
      <path d="M6.8 27 C6.8 25.5 7.5 24.5 9 24.5 C10.5 24.5 11.2 25.5 11.2 27 L11.2 33 C11.2 35 10.2 36.5 9 36.5 C7.8 36.5 6.8 35 6.8 33 Z"
        fill="#ffffff" opacity="0.95" />
    </g>
  </g>
);

// ─── POCKET STYLE ARTWORK (front view) ──────────────────────────────────────
// Each entry is raw SVG inner-markup (left + right). The main body fill of each
// artwork is drawn with the placeholder "__PKT__" which is replaced live with
// the chosen pocket color (pocketHex). 'Slash' is handled separately in
// FrontView as the original default polygons.
const POCKET_ARTWORK = {
  Flap: `<g><g><polygon points="412.4,402.7 399.3,411.2 366.4,381.7 352.4,339.8 365.6,331.3" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: __PKT__;"></polygon><g><path d="M369.6,375.4c0.5-2.6,3.1-4.2,5.6-3.7c2.6,0.5,4.2,3.1,3.7,5.6s-3.1,4.2-5.6,3.7C370.8,380.5,369.1,378,369.6,375.4z" style="fill: rgb(156, 161, 164);"></path><path d="M379.7,377.5c0.6-3-1.3-5.9-4.3-6.5c-3-0.6-5.9,1.3-6.5,4.3s1.3,5.9,4.3,6.5C376.2,382.4,379.1,380.5,379.7,377.5z M369.6,375.4c0.5-2.6,3.1-4.2,5.6-3.7c2.6,0.5,4.2,3.1,3.7,5.6s-3.1,4.2-5.6,3.7C370.8,380.5,369.1,378,369.6,375.4z" style="opacity: 0.25; fill: rgb(156, 161, 164);"></path><g style="opacity: 0.5;"><path d="M371.7,375.7c0.4,0.1,0.7-0.1,0.9-0.4c0.4-0.7,1.3-1.1,2.1-0.9s1.5,0.9,1.6,1.7c0,0.4,0.3,0.7,0.7,0.8l0.1,0c0.5,0.1,1-0.3,1-0.9c-0.1-1.6-1.3-2.9-2.9-3.3s-3.2,0.5-4,1.8C370.8,375,371.1,375.6,371.7,375.7L371.7,375.7z" style="fill: rgb(230,230,230);"></path></g></g></g><g><polygon points="187.7,402.7 200.8,411.2 233.6,381.7 247.6,339.8 234.5,331.3" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: __PKT__;"></polygon><g><path d="M226.7,381.1c-2.6,0.5-5.1-1.1-5.6-3.7s1.1-5.1,3.7-5.6s5.1,1.1,5.6,3.7S229.3,380.5,226.7,381.1z" style="fill: rgb(156, 161, 164);"></path><path d="M226.9,381.8c3-0.6,4.9-3.5,4.3-6.5s-3.5-4.9-6.5-4.3c-3,0.6-4.9,3.5-4.3,6.5C221,380.5,223.9,382.4,226.9,381.8z M226.7,381.1c-2.6,0.5-5.1-1.1-5.6-3.7s1.1-5.1,3.7-5.6s5.1,1.1,5.6,3.7S229.3,380.5,226.7,381.1z" style="opacity: 0.25; fill: rgb(156, 161, 164);"></path><g style="opacity: 0.5;"><path d="M228.4,375.7c0.5-0.1,0.8-0.7,0.6-1.2c-0.7-1.4-2.3-2.2-4-1.8c-1.6,0.3-2.8,1.7-2.9,3.3c0,0.5,0.5,1,1,0.9l0.1,0c0.4-0.1,0.6-0.4,0.7-0.8c0.1-0.8,0.7-1.5,1.6-1.7s1.7,0.2,2.1,0.9C227.6,375.6,227.9,375.8,228.4,375.7L228.4,375.7z" style="fill: rgb(230,230,230);"></path></g></g></g></g>`,

  Snap: `<g><g><polygon points="403,417.9 410.3,412.6 366.6,353.6 359.2,358.8" style="stroke: rgb(202, 202, 232); fill: __PKT__; stroke-width: 1px;"></polygon><ellipse transform="matrix(0.9995 -3.131515e-02 3.131515e-02 0.9995 -11.8908 12.2381)" cx="384.8" cy="385.7" rx="3.6" ry="3.6" style="fill: rgb(156, 161, 164);"></ellipse><g style="opacity: 0.5;"><path d="M389,385.7c0-2.3-1.9-4.2-4.2-4.2s-4.2,1.9-4.2,4.2s1.9,4.2,4.2,4.2S389,388.1,389,385.7z M381.1,385.7c0-2,1.6-3.7,3.7-3.7c2,0,3.7,1.6,3.7,3.7s-1.6,3.7-3.7,3.7C382.7,389.4,381.1,387.8,381.1,385.7z" style="opacity: 0.5;"></path><path d="M384.8,382.8c-1.3,0-2.3,0.8-2.7,2c-0.1,0.4,0.2,0.8,0.6,0.8h0c0.3,0,0.5-0.2,0.6-0.5c0.2-0.6,0.8-1,1.4-1c0.7,0,1.2,0.4,1.4,1c0.1,0.3,0.3,0.5,0.6,0.5h0c0.4,0,0.7-0.4,0.6-0.8C387.1,383.6,386,382.8,384.8,382.8z" style="fill: rgb(255, 255, 255);"></path></g></g><g><polygon points="197.1,417.9 189.7,412.6 233.5,353.6 240.8,358.8" style="stroke: rgb(202, 202, 232); fill: __PKT__; stroke-width: 1px;"></polygon><ellipse transform="matrix(3.131515e-02 -0.9995 0.9995 3.131515e-02 -177.0163 588.8282)" cx="215.3" cy="385.7" rx="3.6" ry="3.6" style="fill: rgb(156, 161, 164);"></ellipse><g style="opacity: 0.5;"><path d="M215.3,389.9c2.3,0,4.2-1.9,4.2-4.2s-1.9-4.2-4.2-4.2s-4.2,1.9-4.2,4.2S213,389.9,215.3,389.9z M215.3,389.4c-2,0-3.7-1.6-3.7-3.7s1.6-3.7,3.7-3.7c2,0,3.7,1.6,3.7,3.7S217.3,389.4,215.3,389.4z" style="opacity: 0.5;"></path><path d="M215.3,382.8c-1.3,0-2.3,0.8-2.7,2c-0.1,0.4,0.2,0.8,0.6,0.8h0c0.3,0,0.5-0.2,0.6-0.5c0.2-0.6,0.8-1,1.4-1c0.7,0,1.2,0.4,1.4,1c0.1,0.3,0.3,0.5,0.6,0.5h0c0.4,0,0.7-0.4,0.6-0.8C217.6,383.6,216.5,382.8,215.3,382.8z" style="fill: rgb(255, 255, 255);"></path></g></g></g>`,

  Straight: `<g><g><rect x="392.8" y="355.9" transform="matrix(0.9972 -7.455095e-02 7.455095e-02 0.9972 -28.3792 30.7502)" width="9.9" height="79.1" style="stroke-width: 0.75px; stroke: rgb(202, 202, 232); fill: __PKT__;"></rect></g><g><rect x="199.2" y="355.9" transform="matrix(-0.9972 -7.455095e-02 7.455095e-02 -0.9972 378.1662 805.1431)" width="9.9" height="79.1" style="stroke-width: 0.75px; stroke: rgb(202, 202, 232); fill: __PKT__;"></rect></g></g>`,

  Welt: `<g><g><rect x="375.7" y="352.1" transform="matrix(0.8526 -0.5226 0.5226 0.8526 -147.5003 255.6718)" width="7.4" height="74.3" fill="#2b2b2b"></rect><path d="M363.1,355.7l-2.8,1.7l-0.7,0.5l-2.8,1.7l38.8,63.3l2.8-1.7l0.7-0.5l2.8-1.7L363.1,355.7z M395.2,415.8l-32.2-52.6l-1.2-2.8l1.9,2.3l32.2,52.6l1.2,2.8L395.2,415.8z" style="stroke-width: 0.75px; stroke: rgb(202, 202, 232); fill: __PKT__;"></path></g><g><rect x="183.1" y="385.6" transform="matrix(0.5226 -0.8526 0.8526 0.5226 -226.7319 373.6295)" width="74.3" height="7.4" fill="#2b2b2b"></rect><path d="M197.7,419l2.8,1.7l0.7,0.5l2.8,1.7l38.8-63.3l-2.8-1.7l-0.7-0.5l-2.8-1.7L197.7,419z M202.6,418.1l1.2-2.8l32.2-52.6l1.9-2.3l-1.2,2.8l-32.2,52.6L202.6,418.1z" style="stroke-width: 0.75px; stroke: rgb(202, 202, 232); fill: __PKT__;"></path></g></g>`,

  Zipper: `<g style="stroke-width: 1px; stroke: rgb(202, 202, 232);"><g><path d="M191.3,410.9l41.1-55.4c0.7-1,2.2-1.2,3.2-0.5l3.1,2.3c1,0.7,1.2,2.2,0.5,3.2L198.1,416c-0.7,1-2.2,1.2-3.2,0.5l-3.1-2.3C190.8,413.4,190.6,411.9,191.3,410.9z M235,355.9c-0.6-0.4-1.4-0.3-1.8,0.3l-41.1,55.4c-0.4,0.6-0.3,1.4,0.3,1.8l3.1,2.3c0.6,0.4,1.4,0.3,1.8-0.3l41.1-55.4c0.4-0.6,0.3-1.4-0.3-1.8L235,355.9z" style="fill: __PKT__;"></path><path d="M408.2,414.1l-3.1,2.3c-1,0.7-2.4,0.5-3.2-0.5l-41.1-55.4c-0.7-1-0.5-2.4,0.5-3.2l3.1-2.3c1-0.7,2.4-0.5,3.2,0.5l41.1,55.4C409.4,411.9,409.2,413.4,408.2,414.1z M361.9,358.2c-0.6,0.4-0.7,1.2-0.3,1.8l41.1,55.4c0.4,0.6,1.2,0.7,1.8,0.3l3.1-2.3c0.6-0.4,0.7-1.2,0.3-1.8l-41.1-55.4c-0.4-0.6-1.2-0.7-1.8-0.3L361.9,358.2z" style="fill: __PKT__;"></path></g><g><path d="M365.4,356.9l-2.6,1.9c0,0,4.6,8.2,5.2,9c0.9,1.2,2.7,1.5,3.9,0.6c1.2-0.9,1.5-2.7,0.6-3.9C371.9,363.8,365.4,356.9,365.4,356.9z M371.1,367.4c-0.7,0.6-1.8,0.4-2.3-0.3c-0.6-0.7-0.4-1.8,0.4-2.3c0.7-0.6,1.8-0.4,2.3,0.3C372,365.8,371.9,366.8,371.1,367.4z" fill="#3a3a3a"></path><path d="M371,370.4l32.4,43.8l0.3,0.5l0.4-0.3l2.2-1.6l0.4-0.3l-0.3-0.5l-32.4-43.8L371,370.4z M403.9,413.8L372,370.8l2.2-1.6l31.9,43.1L403.9,413.8z" fill="#3a3a3a"></path></g><g><path d="M227.6,364.5c-0.9,1.2-0.7,3,0.6,3.9c1.2,0.9,3,0.7,3.9-0.6c0.5-0.7,5.2-9,5.2-9l-2.6-1.9C234.6,356.9,228.1,363.8,227.6,364.5z M228.5,365c0.6-0.7,1.6-0.9,2.3-0.3c0.7,0.6,0.9,1.6,0.4,2.3c-0.6,0.7-1.6,0.9-2.3,0.3C228.2,366.8,228,365.8,228.5,365z" fill="#3a3a3a"></path><path d="M225.9,368.1l-32.4,43.8l-0.3,0.5l0.4,0.3l2.2,1.6l0.4,0.3l0.3-0.5l32.4-43.8L225.9,368.1z M194,412.2l31.9-43.1l2.2,1.6l-31.9,43.1L194,412.2z" fill="#3a3a3a"></path></g></g>`,
};

// Recolor the chosen pocket artwork with the pocket hex.
const renderPocketArtwork = (style, hex) => {
  const svg = POCKET_ARTWORK[style];
  if (!svg) return '';
  return svg.replace(/__PKT__/g, hex);
};

// ─── ADVANCED OPTION ARTWORK (front view) ───────────────────────────────────
// Each of these is optional artwork toggled from the "Advanced Options" panel.
// Trim accents (sleeve stripe / pipings) use the placeholder "__TRIM__" so they
// pick up the current knit stripe/border color. The Pro cuff uses "__CUFF__"
// (sleeve color). Helper attributes from the source art (class/data-*) are
// stripped so nothing depends on external CSS.
const stripArtAttrs = (s) => s
  .replace(/\sdata-color-control="[^"]*"/g, '')
  .replace(/\sclass="element_select"/g, '');

// Small chest (pen) pocket on the right chest — fixed neutral detailing.
const CHEST_POCKET_ART = stripArtAttrs(`<g><g><rect x="333.1" y="183.6" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="185.3" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="187" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="188.6" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="190.3" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="191.9" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="193.6" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="195.3" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="196.9" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="198.6" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="200.2" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="201.9" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="203.5" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="205.2" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="206.9" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="208.5" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="210.2" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="211.8" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="213.5" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="215.1" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="216.8" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="218.5" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="220.1" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="221.8" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="223.4" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="225.1" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="226.7" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="228.4" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="230.1" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="231.7" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="333.1" y="233.4" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect><rect x="331.8" y="235" width="1.7" height="0.8" style="fill:#9ca1a4;"></rect></g><path d="M334.9,167.8h-3.3c0,0-1.2,9.4-1.2,10.3c0,1.5,1.3,2.8,2.8,2.8c1.5,0,2.8-1.3,2.8-2.8C336.1,177.2,334.9,167.8,334.9,167.8z M333.3,179.6c-0.9,0-1.7-0.7-1.7-1.7c0-0.9,0.8-1.7,1.7-1.7c0.9,0,1.7,0.7,1.7,1.7C335,178.9,334.2,179.6,333.3,179.6z" style="fill: rgb(156, 161, 164);"></path><path d="M331.4,182v54.5v0.6h0.5h2.7h0.5v-0.6V182H331.4z M332,236.5v-53.6h2.7v53.6H332z" style="fill:#9ca1a4;"></path><path d="M335.3,238.7h-3.9c-1,0-1.8-0.8-1.8-1.8v-69c0-1,0.8-1.8,1.8-1.8h3.9c1,0,1.8,0.8,1.8,1.8v69C337,237.9,336.2,238.7,335.3,238.7z" style="opacity: 0.25; fill: none; stroke: rgb(0, 0, 0); stroke-miterlimit: 10;"></path></g>`)
  .split('fill:#9ca1a4;').join('fill: __CHEST__;')
  .split('fill: rgb(156, 161, 164);').join('fill: __CHEST__;');

// Sleeve seam stripe (left + right).
const SLEEVE_STRIPE_ART = stripArtAttrs(`<g><path d="M57.5,344.3c-1.8-14.1,17-59.7,17-59.7c19.7-68.1,36.5-108.4,49-132.1c0,0,0,0,0,0c19.3-28.8,69.7-41.6,111.7-47.4c-0.1,0.4-0.1,0.6-0.1,0.6c0.6,1,2,3.2,4.8,5.9c-71.8,9.2-99.6,28.9-110.2,44.3c-15.6,29.6-31.9,73.6-48.4,130.8l-0.3,0.7c-7.5,18.2-17.6,47.7-16.5,56.1c0.7,5.7-0.1,11.7-1.1,18.7c-1.6,11.7-3.7,26.3,0.5,46.8c1.1,5.3,2.1,10.9,3.1,16.2c5.3,28.6,10.8,58.1,27.6,76c0.9,0.9,1.8,1.9,2.6,2.9l3.3,3.5c-5.2,0.9-8.5,1.3-8.5,1.3c-0.8-1-1.7-1.9-2.6-2.8c-21.7-23-25.7-62-32.5-95.7C50.2,376.6,59.2,357.7,57.5,344.3z" style="stroke-width: 1px; stroke: __TRIM__; fill: __TRIM__;"></path><path d="M542.5,344.3c1.8-14.1-17-59.7-17-59.7c-19.7-68.1-36.5-108.4-49-132.1c0,0,0,0,0,0c-19.3-28.8-69.7-41.6-111.7-47.4c0.1,0.4,0.1,0.6,0.1,0.6c-0.6,1-2,3.2-4.8,5.9c71.8,9.2,99.6,28.9,110.2,44.3c15.6,29.6,31.9,73.6,48.4,130.8l0.3,0.7c7.5,18.2,17.6,47.7,16.5,56.1c-0.7,5.7,0.1,11.7,1.1,18.7c1.6,11.7,3.7,26.3-0.5,46.8c-1.1,5.3-2.1,10.9-3.1,16.2c-5.3,28.6-10.8,58.1-27.6,76c-0.9,0.9-1.8,1.9-2.6,2.9l-3.3,3.5c5.2,0.9,8.5,1.3,8.5,1.3c0.8-1,1.7-1.9,2.6-2.8c21.7-23,25.7-62,32.5-95.7C549.8,376.6,540.8,357.7,542.5,344.3z" style="stroke-width: 1px; stroke: __TRIM__; fill: __TRIM__;"></path></g>`);

// Piping traced around the (slash) pockets — left + right.
const POCKET_PIPING_ART = stripArtAttrs(`<g><path d="M237.3,363.6l1.2-2.9l-1.7-1l-2,2.4l-32,52.9l-1.2,2.9l1.7,1l2-2.4L237.3,363.6z M202.6,418.2l1.2-2.8l31.9-52.7l1.9-2.3l-1.2,2.8l-31.9,52.7L202.6,418.2z" style="fill: __TRIM__;"></path><path d="M394.2,416.5l2,2.4l1.7-1l-1.2-2.9l-32-52.9l-2-2.4l-1.7,1l1.2,2.9L394.2,416.5z M395,415.9l-31.9-52.7l-1.2-2.8l1.9,2.3l31.9,52.7l1.2,2.8L395,415.9z" style="fill: __TRIM__;"></path></g>`);

// Shoulder seam piping — left + right.
const SHOULDER_PIPING_ART = stripArtAttrs(`<g><path d="M426.8,293.9l-1.5-0.3c11.5-54.8,36.8-121.8,50.6-142.1l0.9,1.4C460.6,176.9,436.2,249.5,426.8,293.9z" style="fill: __TRIM__;"></path><path d="M173,293.9l1.5-0.3c-11.5-54.8-36.8-121.8-50.6-142.1l-0.9,1.4C139.3,176.9,163.7,249.4,173,293.9z" style="fill: __TRIM__;"></path></g>`);

// Full front-seam stripe piping — left + right.
const STRIPE_PIPING_ART = stripArtAttrs(`<g><path d="M102.3,507.2l-0.2-0.2l-3.8-4c-0.8-0.9-1.7-1.9-2.6-2.9c-16.6-17.6-22-46.9-27.3-75.3c-1-5.4-2-10.9-3.1-16.3c-4.1-20.3-2.1-34.7-0.5-46.3c1-7.1,1.8-13.2,1.1-19.1c-0.9-7.3,7.8-34.5,16.4-55.4l0.3-0.8c16.6-57.1,32.8-101,48.3-130.5c10.3-14.9,37.6-34.4,109.1-43.6l1.3-0.2l-1.5-1.3c-71.8,9.2-99.6,28.9-110.2,44.3c-15.6,29.6-31.9,73.6-48.4,130.8l-0.3,0.7c-7.5,18.2-17.6,47.7-16.5,56.1c0.7,5.7-0.1,11.7-1.1,18.7c-1.6,11.7-3.7,26.3,0.5,46.8c1.1,5.3,2.1,10.9,3.1,16.2c5.3,28.6,10.8,58.1,27.6,76c0.9,0.9,1.8,1.9,2.6,2.9l3.3,3.5L102.3,507.2z" style="fill: __TRIM__;"></path><path d="M499.4,507.5l3.3-3.5c0.9-1,1.7-1.9,2.6-2.9c16.9-17.9,22.3-47.4,27.6-76c1-5.4,2-10.9,3.1-16.2c4.2-20.5,2.1-35.1,0.5-46.8c-1-7-1.8-13-1.1-18.7c1.1-8.5-9-37.9-16.5-56.1l-0.3-0.7c-16.6-57.2-32.9-101.2-48.4-130.8c-10.6-15.3-38.4-35.1-110.2-44.3l-1.5,1.3l1.3,0.2c71.5,9.1,98.8,28.7,109.1,43.6c15.5,29.5,31.7,73.4,48.3,130.5l0.3,0.8c8.6,20.9,17.3,48,16.4,55.4c-0.7,5.9,0.1,12,1.1,19.1c1.6,11.6,3.6,26-0.5,46.3c-1.1,5.4-2.1,10.9-3.1,16.3c-5.3,28.4-10.7,57.7-27.3,75.3c-0.9,0.9-1.8,1.9-2.6,2.9l-3.8,4l-0.2,0.2L499.4,507.5z" style="fill: __TRIM__;"></path></g>`);

// Pro cuff (replaces knit cuffs) — takes the sleeve color.
const PRO_CUFF_ART = stripArtAttrs(`<g><path d="M148.8,493.9l6.8,25.1c1.2,4.3-55.5,19.6-56.7,15.3l-6.8-25.1c0,0,13.7-1.6,28.9-5.7C137.2,499.1,148.8,493.9,148.8,493.9z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: __CUFF__;"></path><path d="M451.2,493.9l-6.8,25.1c-1.2,4.3,55.5,19.6,56.7,15.3l6.8-25.1c0,0-13.7-1.6-28.9-5.7C462.8,499.1,451.2,493.9,451.2,493.9z" style="stroke: rgb(202, 202, 232); stroke-miterlimit: 10; fill: __CUFF__;"></path></g>`);

// Replace a single placeholder token in an artwork string.
const injectColor = (svg, token, hex) => (svg ? svg.split(token).join(hex) : '');

// ─── FRONT VIEW ──────────────────────────────────────────────────────────────
const FrontView = ({ bodyHex, sleeveHex, knitHex, pocketHex, snapColor, showPockets, pocketStyle, snapsOrZipper, showFlap, insertColors, insertCount, knitStyle, knitLineHex, knitBorderHex, cuffStyle, addChestPocket, addSleeveStripe, addPocketPiping, addShoulderPiping, addStripePiping, proCuffHex, chestPocketHex, sleeveStripeHex, pocketPipingHex, shoulderPipingHex, stripePipingHex }) => {
  const trimHex = knitLineHex || '#d4af37';
  const bStroke = darkenColor(bodyHex, 50);
  const sStroke = darkenColor(sleeveHex, 50);
  const kStroke = darkenColor(knitHex, 50);
  const pStroke = darkenColor(pocketHex, 50);
  return (
    <>
      <defs>
        <radialGradient id="fBodyG" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={lightenColor(bodyHex, 12)} />
          <stop offset="35%" stopColor={lightenColor(bodyHex, 6)} />
          <stop offset="70%" stopColor={bodyHex} />
          <stop offset="100%" stopColor={darkenColor(bodyHex, 15)} />
        </radialGradient>
        <linearGradient id="fSleeveG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={darkenColor(sleeveHex, 30)} />
          <stop offset="15%" stopColor={darkenColor(sleeveHex, 10)} />
          <stop offset="40%" stopColor={lightenColor(sleeveHex, 18)} />
          <stop offset="55%" stopColor={lightenColor(sleeveHex, 8)} />
          <stop offset="80%" stopColor={darkenColor(sleeveHex, 10)} />
          <stop offset="100%" stopColor={darkenColor(sleeveHex, 30)} />
        </linearGradient>
        <linearGradient id="fKnitG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 20)} />
          <stop offset="30%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} />
          <stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="cuff3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 18)} />
          <stop offset="35%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} />
          <stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="pocket3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(pocketHex, 12)} />
          <stop offset="35%" stopColor={lightenColor(pocketHex, 6)} />
          <stop offset="100%" stopColor={darkenColor(pocketHex, 15)} />
        </linearGradient>
        <radialGradient id="bodyStudioLight" cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cuffHighlight" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bottomKnitHighlight" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="fShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* BOTTOM KNIT BAND */}
      <path d="M300.018,482.716c0,0-104.349,0.617-128.447-19.798v27.329c0,3.784,1.957,7.275,5.132,9.17c24.04,14.346,69.841,18.274,122.397,18.274c54.284,0,101.367-4.323,124.703-19.715c2.924-1.928,4.661-5.289,4.661-8.869v-26.188C404.368,483.332,300.018,482.716,300.018,482.716z"
        fill="url(#fKnitG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="300" cy="474" rx="112" ry="10" fill="url(#bottomKnitHighlight)" pointerEvents="none" />
      <KnitBodyRibs knitStyle={knitStyle} lineColor={knitLineHex} borderColor={knitBorderHex} />
      {cuffStyle === 'Pro' ? (
        /* PRO CUFFS (plain sleeve-color cuffs, no knit ribs) */
        <g id="pro-cuffs" key={`procuff-${proCuffHex}`} dangerouslySetInnerHTML={{ __html: injectColor(PRO_CUFF_ART, '__CUFF__', proCuffHex) }} />
      ) : (
        <>
          {/* LEFT CUFF */}
          <path d="M148.786,493.435l6.772,25.134c1.156,4.275-1.351,6.83-5.28,8.874c-4.058,2.111-13.679,5.706-20.677,7.599c-6.998,1.893-17.119,3.639-21.688,3.862c-4.424,0.216-7.878-0.727-9.034-5.002l-6.798-25.129c0,0,13.725-1.641,28.862-5.736C137.238,498.628,148.786,493.435,148.786,493.435z"
            fill="url(#cuff3D)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
          <ellipse cx="122" cy="512" rx="26" ry="10" fill="url(#cuffHighlight)" pointerEvents="none" />
          <KnitCuffRibs knitStyle={knitStyle} side="left" lineColor={knitLineHex} borderColor={knitBorderHex} />
          {/* RIGHT CUFF */}
          <path d="M451.214,493.435l-6.772,25.134c-1.156,4.275,1.351,6.83,5.28,8.874c4.058,2.111,13.679,5.706,20.677,7.599c6.998,1.893,17.119,3.639,21.688,3.862c4.424,0.216,7.878-0.727,9.034-5.002l6.793-25.109c0,0-13.721-1.661-28.857-5.756C462.762,498.628,451.214,493.435,451.214,493.435z"
            fill="url(#cuff3D)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
          <ellipse cx="478" cy="512" rx="26" ry="10" fill="url(#cuffHighlight)" pointerEvents="none" />
          <KnitCuffRibs knitStyle={knitStyle} side="right" lineColor={knitLineHex} borderColor={knitBorderHex} />
        </>
      )}
      {/* LEFT SLEEVE */}
      <path d="M173.588,291.651c-11.917-54.049-37.015-119.906-50.067-139.181c-12.482,23.708-29.26,64.057-49.003,132.163c0,0-18.754,45.535-17,59.667c1.663,13.404-7.347,32.333-0.507,66c6.84,33.667,10.84,72.667,32.507,95.667c0.866,0.92,2.562,2.807,2.562,2.807s13.725-1.641,28.862-5.736c16.296-4.408,27.841-9.609,27.841-9.609s1.163-27.268-3.265-52.795c-5.667-32.667-7-65.667-3-76.333C145.584,356.124,164.478,317.911,173.588,291.651z"
        fill="url(#fSleeveG)" stroke={sStroke} strokeWidth="1.5" />
      <path d="M108,155 C112,200 118,280 116,370 C114,430 112,470 110,493"
        fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="12" strokeLinecap="round" />
      {/* RIGHT SLEEVE */}
      <path d="M426.412,291.651c11.917-54.049,37.015-119.906,50.067-139.181c12.482,23.708,29.26,64.057,49.003,132.163c0,0,18.754,45.535,17,59.667c-1.663,13.404,7.347,32.333,0.507,66c-6.84,33.667-10.84,72.667-32.507,95.667c-0.866,0.92-1.72,1.866-2.567,2.824c0,0-13.721-1.659-28.857-5.754c-16.296-4.408-27.843-9.601-27.843-9.601c-0.5-7.447-1.161-27.275,3.267-52.803c5.667-32.667,7-65.667,3-76.333C454.416,356.124,435.522,317.911,426.412,291.651z"
        fill="url(#fSleeveG)" stroke={sStroke} strokeWidth="1.5" />
      <path d="M492,155 C488,200 482,280 484,370 C486,430 488,470 490,493"
        fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="12" strokeLinecap="round" />
      {/* MAIN BODY */}
      <path d="M430.268,357.966c3-16-4.75-62-4.75-62c11.494-54.807,37.599-123.714,51-143.5c-35.5-53-176.5-52-176.5-52s-141-1-176.5,52c13.401,19.786,39.506,88.693,51,143.5c0,0-7.75,46-4.75,62s-25.5,77.5,1,104.25c15.966,14.997,74.348,19.032,106.913,20.111v35.117c6.985,0.168,14.134,0.247,21.419,0.247c7.924,0,15.689-0.095,23.254-0.301v-35.063c32.565-1.079,90.947-5.114,106.913-20.111C455.768,435.466,427.268,373.966,430.268,357.966z"
        fill="url(#fBodyG)" stroke={bStroke} strokeWidth="1.5" />
        <ShoulderInserts insertColors={insertColors} insertCount={insertCount} />
      <ellipse cx="300" cy="280" rx="140" ry="180" fill="url(#bodyStudioLight)" pointerEvents="none" />
      <path d="M300 130 L300 490" stroke="#000" strokeOpacity="0.10" strokeWidth="12" />
      <path d="M298 130 L298 490" stroke="#ffffff" strokeOpacity="0.10" strokeWidth="4" />
      <ellipse cx="300" cy="470" rx="135" ry="18" fill="#000" opacity="0.06" />
      {/* POCKETS — selectable style */}
      {showPockets && !addPocketPiping && (
  (pocketStyle === 'Slash' || !pocketStyle) ? (
    <g id="pockets">
      <polygon points="405.182,441.446 410.757,440.299 399.175,367.48 393.6,368.627"
        fill="url(#pocket3D)" stroke={pStroke} strokeWidth="1.2" />
      <polygon points="200.861,367.48 206.436,368.627 194.854,441.446 189.28,440.299"
        fill="url(#pocket3D)" stroke={pStroke} strokeWidth="1.2" />
    </g>
  ) : (
    <g id="pockets" key={`pockets-${pocketStyle}-${pocketHex}`} dangerouslySetInnerHTML={{ __html: renderPocketArtwork(pocketStyle, pocketHex) }} />
  )
)}
      {/* ADVANCED OPTION OVERLAYS (front view) */}
      {addSleeveStripe && (
        <g id="sleeve-stripe" key={`sstripe-${sleeveStripeHex}`} dangerouslySetInnerHTML={{ __html: injectColor(SLEEVE_STRIPE_ART, '__TRIM__', sleeveStripeHex) }} />
      )}
      {addStripePiping && (
        <g id="stripe-piping" key={`stripepipe-${stripePipingHex}`} dangerouslySetInnerHTML={{ __html: injectColor(STRIPE_PIPING_ART, '__TRIM__', stripePipingHex) }} />
      )}
      {addShoulderPiping && (
        <g id="shoulder-piping" key={`shldrpipe-${shoulderPipingHex}`} dangerouslySetInnerHTML={{ __html: injectColor(SHOULDER_PIPING_ART, '__TRIM__', shoulderPipingHex) }} />
      )}
      {showPockets && addPocketPiping && (
        <g id="pocket-piping" key={`pktpipe-${pocketPipingHex}`} dangerouslySetInnerHTML={{ __html: injectColor(POCKET_PIPING_ART, '__TRIM__', pocketPipingHex) }} />
      )}
      {addChestPocket && (
        <g id="chest-pocket" key={`chestpkt-${chestPocketHex}`} dangerouslySetInnerHTML={{ __html: injectColor(CHEST_POCKET_ART, '__CHEST__', chestPocketHex) }} />
      )}
      <line x1="300" y1="131.475" x2="290.518" y2="517.69" stroke={kStroke} strokeOpacity="0.3" strokeWidth="1" />
      {snapsOrZipper === 'Zipper' ? <ZipperClosure showFlap={showFlap} /> : <SnapButtons snapColor={snapColor} count={5} />}
    </>
  );
};

// ─── BACK VIEW ───────────────────────────────────────────────────────────────
const BackCollarOverlay = ({ collarHex, collarStyle }) => {
  const lightHex = lightenColor(collarHex, 30);
  const darkHex = darkenColor(collarHex, 40);
  const commonDefs = (
    <defs>
      <linearGradient id="backCollarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={lightHex} />
        <stop offset="50%" stopColor={collarHex} />
        <stop offset="100%" stopColor={darkHex} />
      </linearGradient>
      <filter id="backCollarShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>
  );
  const commonProps = { fill: "url(#backCollarGrad)", stroke: darkHex, strokeMiterlimit: "10", strokeWidth: "1.5", filter: "url(#backCollarShadow)" };

  if (collarStyle === 'classic_standup' || collarStyle === 'classic_standup_overlap') {
    return <g id="back-classic-standup">{commonDefs}<path d="M358.852,81.499c-3.803-10.828-9.349-17.137-22.924-20.447c-16.364-3.998-55.672-4.029-72.039-0.031c-13.572,3.309-19.118,9.619-22.924,20.449c-3.232,9.202-5.865,22.648-5.865,22.648s36.43,5.222,66.832,5.222c30.402,0,62.968-5.222,62.968-5.222S362.088,90.704,358.852,81.499z" {...commonProps} /></g>;
  }
  if (collarStyle === 'pro_shirt') {
    return <g id="back-pro-shirt">{commonDefs}<path d="M300,112.4c-41.5,0-64.9-6.8-64.9-6.8s12.5-26.7,14.2-29.4c1.8-2.8,3.1-3.2,4.4-3.2s26.2,1.7,46.3,1.7c20,0,45-1.7,46.3-1.7c1.3,0,2.6,0.4,4.4,3.2c1.8,2.7,14.2,29.4,14.2,29.4S341.5,112.4,300,112.4" {...commonProps} /></g>;
  }
  if (collarStyle === 'hood') {
    return <g id="back-hood">{commonDefs}<path d="M394.396,68.241c7.256-1.201,9.85,1.868,9.85,16.5c5.317,2.465,8.825,3.885,5.295,14.127c0,0,0.232,8.71-1.454,13.444c-6.31,17.716-25.661,38.855-43.468,58.16c-22.341,24.224-58.623,21.194-58.623,21.194s-36.278,3.031-58.623-21.194c-17.804-19.306-37.154-40.444-43.464-58.16c-1.686-4.733-1.454-13.444-1.454-13.444c-3.53-10.242-0.022-11.662,5.295-14.127c0-14.63,2.594-17.7,9.848-16.5c1.811,0.299,3.907,0.861,6.332,1.58c-0.533-8.108,7.671-13.452,21.585-9.393c36.162,10.55,84.804,10.55,120.966,0c13.914-4.06,22.118,1.285,21.585,9.393C390.49,69.102,392.586,68.541,394.396,68.241z" {...commonProps} /></g>;
  }
  if (collarStyle === 'zippered_hood') {
    return <g id="back-zippered-hood">{commonDefs}<path d="M420.1,112.9c-5.7-14.4-15.6-17-32.5-22.4c-7.6-6.5-16-11.3-24.9-14.8c-7.5-10.2-24.5-23.6-62.9-23.6c-39.1,0-55.6,13.7-62.6,23.7c-8.7,3.5-17,8.3-24.7,14.8c-16.9,5.4-26.9,8-32.5,22.4c0,0-24.9,45.6-21.4,82.1c0.6,5.6,10.5,5.6,55.7,9.7c41.6,3.8,53.8-5.8,78.8-25.9c0-2.8,0-10.8,0-13.4h14.1c0,2.6,0,10.6,0,13.4c25,20.1,37.3,29.6,78.8,25.9c45.2-4.1,55.1-4.1,55.7-9.7C445,158.5,420.1,112.9,420.1,112.9z" {...commonProps} /></g>;
  }
  if (collarStyle === 'classic_band') {
    return <g id="back-classic-band">{commonDefs}<path d="M358.9,81.9c-3.8-10.8-9.3-17.1-22.9-20.4c-16.4-4-55.7-4-72,0c-13.6,3.3-19.1,9.6-22.9,20.4c-3.2,9.2-5.9,22.6-5.9,22.6s36.4,5.2,66.8,5.2c30.4,0,63-5.2,63-5.2S362.1,91.1,358.9,81.9z" {...commonProps} /></g>;
  }
  if (collarStyle === 'band' || collarStyle === 'band_stripe') {
    return <g id="back-band-collar">{commonDefs}<path d="M232,106l6.1-24c1.2-4.6,13.4-15.2,61.9-15.2s60.7,10.7,61.9,15.2l6.1,24c0,0-33.5-3.8-68-3.8S232,106,232,106z" {...commonProps} /></g>;
  }
  return null;
};

const BackView = ({ bodyHex, sleeveHex, knitHex, insertColors, insertCount, knitStyle, knitLineHex, knitBorderHex, collarHex, collarStyle }) => {
  const bStroke = darkenColor(bodyHex, 50);
  const sStroke = darkenColor(sleeveHex, 50);
  const kStroke = darkenColor(knitHex, 50);
  return (
    <>
      <defs>
        <radialGradient id="bBodyG" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor={lightenColor(bodyHex, 18)} /><stop offset="30%" stopColor={lightenColor(bodyHex, 8)} />
          <stop offset="65%" stopColor={bodyHex} /><stop offset="100%" stopColor={darkenColor(bodyHex, 20)} />
        </radialGradient>
        <linearGradient id="bSleeveG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={darkenColor(sleeveHex, 30)} /><stop offset="15%" stopColor={darkenColor(sleeveHex, 10)} />
          <stop offset="40%" stopColor={lightenColor(sleeveHex, 18)} /><stop offset="55%" stopColor={lightenColor(sleeveHex, 8)} />
          <stop offset="80%" stopColor={darkenColor(sleeveHex, 10)} /><stop offset="100%" stopColor={darkenColor(sleeveHex, 30)} />
        </linearGradient>
        <linearGradient id="bKnitBandG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 20)} /><stop offset="30%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="bCuff3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 18)} /><stop offset="35%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <radialGradient id="bBodyLight" cx="50%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.13" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bKnitHighlight" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bCuffHL" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="bShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>
      <path d="M300.017,482.716c0,0,106.75,0.634,129.25-20.5c26.5-26.75-2-88.25,1-104.25s-4.75-62-4.75-62c11.494-54.807,37.599-123.714,51-143.5c-35.5-53-176.5-52-176.5-52s-141-1-176.5,52c13.401,19.786,39.506,88.693,51,143.5c0,0-7.75,46-4.75,62s-25.5,77.5,1,104.25C193.267,483.349,300.017,482.716,300.017,482.716z"
        fill="url(#bBodyG)" stroke={bStroke} strokeMiterlimit="10" strokeWidth="1.5" />
          <ShoulderInserts insertColors={insertColors} insertCount={insertCount} />

      <ellipse cx="300" cy="270" rx="140" ry="170" fill="url(#bBodyLight)" pointerEvents="none" />
      <line x1="300" y1="100" x2="300" y2="483" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />
      <ellipse cx="300" cy="470" rx="135" ry="16" fill="#000" opacity="0.07" />
      {/* SLEEVES */}
      <path d="M173.605,291.651c-11.917-54.049-37.015-119.906-50.067-139.181c-12.482,23.708-29.26,64.057-49.003,132.163c0,0-18.754,45.535-17,59.667c1.663,13.404-7.347,32.333-0.507,66c6.84,33.667,10.84,72.667,32.507,95.667c0.866,0.92,2.562,2.807,2.562,2.807s13.725-1.641,28.862-5.736c16.296-4.408,27.841-9.609,27.841-9.609s1.163-27.268-3.265-52.795c-5.667-32.667-7-65.667-3-76.333C145.601,356.124,164.495,317.911,173.605,291.651z"
        fill="url(#bSleeveG)" stroke={sStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M426.428,291.651c11.917-54.049,37.015-119.906,50.067-139.181c12.482,23.708,29.26,64.057,49.003,132.163c0,0,18.754,45.535,17,59.667c-1.663,13.404,7.347,32.333,0.507,66c-6.84,33.667-10.84,72.667-32.507,95.667c-0.866,0.92-1.72,1.866-2.567,2.824c0,0-13.721-1.659-28.857-5.754c-16.296-4.408-27.843-9.601-27.843-9.601c-0.5-7.447-1.161-27.275,3.267-52.803c5.667-32.667,7-65.667,3-76.333C454.432,356.124,435.538,317.911,426.428,291.651z"
        fill="url(#bSleeveG)" stroke={sStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      {/* CUFFS */}
      <path d="M148.802,493.435l6.772,25.134c1.156,4.275-1.351,6.83-5.28,8.874c-4.058,2.111-13.679,5.706-20.677,7.599c-6.998,1.893-17.119,3.639-21.688,3.862c-4.424,0.216-7.878-0.727-9.034-5.002l-6.798-25.129c0,0,13.725-1.641,28.862-5.736C137.255,498.628,148.802,493.435,148.802,493.435z"
        fill="url(#bCuff3D)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="122" cy="512" rx="26" ry="10" fill="url(#bCuffHL)" pointerEvents="none" />
      <KnitCuffRibs knitStyle={knitStyle} side="left" lineColor={knitLineHex} borderColor={knitBorderHex} />
      <path d="M451.231,493.435l-6.772,25.134c-1.156,4.275,1.351,6.83,5.28,8.874c4.058,2.111,13.679,5.706,20.677,7.599c6.998,1.893,17.119,3.639,21.688,3.862c4.424,0.216,7.878-0.727,9.034-5.002l6.793-25.109c0,0-13.721-1.661-28.857-5.756C462.778,498.628,451.231,493.435,451.231,493.435z"
        fill="url(#bCuff3D)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="478" cy="512" rx="26" ry="10" fill="url(#bCuffHL)" pointerEvents="none" />
      <KnitCuffRibs knitStyle={knitStyle} side="right" lineColor={knitLineHex} borderColor={knitBorderHex} />
      {/* BOTTOM BAND */}
      <path d="M300.037,482.716c0,0-104.349,0.617-128.447-19.798v27.329c0,3.784,1.957,7.275,5.132,9.17c24.04,14.346,69.841,18.274,122.397,18.274c54.284,0,101.367-4.323,124.703-19.715c2.924-1.928,4.661-5.289,4.661-8.869v-26.188C404.386,483.332,300.037,482.716,300.037,482.716z"
        fill="url(#bKnitBandG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="300" cy="474" rx="112" ry="10" fill="url(#bKnitHighlight)" pointerEvents="none" />
      <KnitBodyRibs knitStyle={knitStyle} lineColor={knitLineHex} borderColor={knitBorderHex} />
      {collarHex && collarStyle && <BackCollarOverlay collarHex={collarHex} collarStyle={collarStyle} />}
    </>
  );
};

// ─── LEFT VIEW ───────────────────────────────────────────────────────────────
const LeftView = ({ bodyHex, sleeveHex, knitHex, pocketHex, showPockets, insertColors, insertCount, knitStyle, knitLineHex }) => {
  const bStroke = darkenColor(bodyHex, 50);
  const sStroke = darkenColor(sleeveHex, 50);
  const kStroke = darkenColor(knitHex, 50);
  const pStroke = darkenColor(pocketHex, 50);
  return (
    <>
      <defs>
        <linearGradient id="lBodyG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(bodyHex, 22)} /><stop offset="25%" stopColor={lightenColor(bodyHex, 10)} />
          <stop offset="60%" stopColor={bodyHex} /><stop offset="100%" stopColor={darkenColor(bodyHex, 25)} />
        </linearGradient>
        <linearGradient id="lSleeveG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={darkenColor(sleeveHex, 25)} /><stop offset="20%" stopColor={darkenColor(sleeveHex, 8)} />
          <stop offset="45%" stopColor={lightenColor(sleeveHex, 20)} /><stop offset="65%" stopColor={lightenColor(sleeveHex, 8)} />
          <stop offset="85%" stopColor={darkenColor(sleeveHex, 8)} /><stop offset="100%" stopColor={darkenColor(sleeveHex, 28)} />
        </linearGradient>
        <linearGradient id="lKnitG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 20)} /><stop offset="30%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="lCuffG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 18)} /><stop offset="35%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="lPocketG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(pocketHex, 15)} /><stop offset="50%" stopColor={pocketHex} />
          <stop offset="100%" stopColor={darkenColor(pocketHex, 25)} />
        </linearGradient>
        <radialGradient id="lBodyHL" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lCuffHL" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lKnitHL" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g id="left-knit-band">
        <path d="M207.07,445.527c1.2,4.337,2.877,8.282,5.155,11.668c15.278,21.134,89.197,25.521,89.197,25.521s72.485,0.634,87.763-20.5c2.278-3.386,3.955-7.331,5.155-11.668l0,37.699c0,3.784-1.416,7.275-3.713,9.17c-17.391,14.346-50.523,20.274-88.542,20.274c-39.269,0-73.329-6.323-90.21-21.715c-2.115-1.928-3.372-5.289-3.372-8.869L207.07,445.527z"
          fill="url(#lKnitG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
        <ellipse cx="300" cy="453" rx="90" ry="9" fill="url(#lKnitHL)" pointerEvents="none" />
      </g>
      <g id="left-knit-cuff">
        <path d="M258.336,513.902c-1.772,4.059,0.333,6.955,3.92,9.554c3.704,2.684,12.693,7.653,19.336,10.553c6.644,2.9,16.399,6.114,20.885,7.005c4.344,0.863,7.899,0.438,9.671-3.621l10.415-23.858c0,0-13.336-3.639-27.707-9.913c-15.472-6.754-26.128-13.594-26.128-13.594L258.336,513.902z"
          fill="url(#lCuffG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
        <ellipse cx="295" cy="515" rx="28" ry="10" fill="url(#lCuffHL)" pointerEvents="none" />
      </g>
      <path d="M394.473,425.266c-3.512-10.757-8.431-29.952-5.428-41.145c3.003-11.196,0-17.078,0-17.078s-3.463-41.326-2.952-55.113c0.607-16.401,8.345-65.113,8.345-65.113s8.676-97.491-38.447-143.381c-6.541-6.37-36.081-1.619-55.315,5.939c-38.668,15.196-50.157,18.304-50.157,18.304s-3.181,17.519-18.75,45.789c-15.57,28.274-26.429,39.543-29.502,97.316c-3.073,57.774,3.268,147.329,3.268,154.923c0,7.898,0.572,14.292,1.668,19.82c1.2,4.337,2.877,8.282,5.155,11.668c15.278,21.134,89.197,25.521,89.197,25.521s72.485,0.634,87.763-20.5c2.278-3.386,3.955-7.331,5.155-11.667C395.449,440.376,396.023,430.015,394.473,425.266z"
        fill="url(#lBodyG)" stroke={bStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="310" cy="280" rx="90" ry="160" fill="url(#lBodyHL)" pointerEvents="none" />
      <path d="M268.726,490.035c-0.003-0.091,3.381-21.935,8.53-33.05c10.233-22.09,26.157-43.948,27.487-59.731c2.006-23.794,10.042-35.475,11.173-51.553c2.074-29.492-34.715-97.994-12.92-159.088c12.624-30.243,39.202-34.143,39.202-34.143s30.567,3.021,44.513,40.466c13.946,37.445,11.737,59.184,11.737,59.184s-1.194,19.933-1.15,26.485c0.107,15.914-4.879,48.082-4.378,67.098c1.788,14.602-0.438,23.347-2.657,29.097c-2.774,7.18-6.218,15.977-6.688,28.481c-0.846,22.517-7.599,23.359-14.635,40.529c-7.036,17.167-31.329,54.491-36.395,60.684c-3.948,4.825-9.979,9.043-9.979,9.043s-16.662-5.091-27.707-9.913C280.081,497.171,268.726,490.035,268.726,490.035z"
        fill="url(#lSleeveG)" stroke={sStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M328,165 C334,220 336,300 330,380 C325,440 316,475 306,500"
        fill="none" stroke="#ffffff" strokeOpacity="0.13" strokeWidth="14" strokeLinecap="round" />
      {showPockets && (
        <g>
          <polygon points="260.176,433.446 265.75,432.299 254.169,359.48 248.594,360.627"
            fill="url(#lPocketG)" stroke={pStroke} strokeWidth="1.2" />
          <line x1="251" y1="364" x2="261" y2="430" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>
      )}
    </>
  );
};

// ─── RIGHT VIEW ──────────────────────────────────────────────────────────────
const RightCollarOverlay = ({ collarHex, collarStyle }) => {
  const lightHex = lightenColor(collarHex, 30);
  const darkHex = darkenColor(collarHex, 40);
  const commonDefs = (
    <defs>
      <linearGradient id="rightCollarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={lightHex} /><stop offset="50%" stopColor={collarHex} /><stop offset="100%" stopColor={darkHex} />
      </linearGradient>
      <filter id="rightCollarShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
      </filter>
    </defs>
  );
  const cp = { fill: "url(#rightCollarGrad)", stroke: darkHex, strokeWidth: "1.5", strokeLinejoin: "round", filter: "url(#rightCollarShadow)" };
  if (collarStyle === 'hood' || collarStyle === 'zippered_hood') {
    return <g id="right-hood-collar">{commonDefs}<path d="M330,125 C340,115 348,98 342,80 C336,65 320,58 305,60 C290,62 278,72 275,85 C272,98 280,110 290,118 L295,128 Z" {...cp} /></g>;
  }
  if (collarStyle === 'classic_standup' || collarStyle === 'classic_standup_overlap') {
    return <g id="right-classic-standup">{commonDefs}<path d="M318,128 C312,118 304,110 294,106 C284,102 274,103 268,108" fill="none" stroke={darkHex} strokeWidth="1" strokeOpacity="0.4" /></g>;
  }
  if (collarStyle === 'band' || collarStyle === 'band_stripe' || collarStyle === 'classic_band') {
    return <g id="right-band-collar">{commonDefs}<path d="M322,134 C322,134 314,112 302,105 C290,98 276,97 268,100 C260,103 256,112 258,120 C260,128 266,133 274,135 C286,137 306,136 322,134 Z" {...cp} /></g>;
  }
  if (collarStyle === 'pro_shirt') {
    return <g id="right-pro-collar">{commonDefs}<path d="M326,128 C326,128 318,104 306,97 C294,90 280,89 270,93 C260,97 256,107 258,117 C260,125 267,131 275,133 C287,135 307,134 326,128 Z" {...cp} /></g>;
  }
  return <g id="right-default-collar">{commonDefs}<path d="M320,132 C320,132 310,110 298,103 C286,96 274,95 266,99 C258,103 255,112 257,120 C259,128 265,133 273,135 C285,137 303,136 320,132 Z" fill="url(#rightCollarGrad)" stroke={darkHex} strokeWidth="1.2" /></g>;
};

const RightView = ({ bodyHex, sleeveHex, knitHex, pocketHex, showPockets, insertColors, insertCount, knitStyle, knitLineHex, knitBorderHex, collarHex, collarStyle }) => {
  const bStroke = darkenColor(bodyHex, 50);
  const sStroke = darkenColor(sleeveHex, 50);
  const kStroke = darkenColor(knitHex, 50);
  const pStroke = darkenColor(pocketHex, 50);
  return (
    <>
      <defs>
        <linearGradient id="rBodyG" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(bodyHex, 22)} /><stop offset="25%" stopColor={lightenColor(bodyHex, 10)} />
          <stop offset="60%" stopColor={bodyHex} /><stop offset="100%" stopColor={darkenColor(bodyHex, 25)} />
        </linearGradient>
        <linearGradient id="rSleeveG" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={darkenColor(sleeveHex, 25)} /><stop offset="20%" stopColor={darkenColor(sleeveHex, 8)} />
          <stop offset="45%" stopColor={lightenColor(sleeveHex, 20)} /><stop offset="65%" stopColor={lightenColor(sleeveHex, 8)} />
          <stop offset="85%" stopColor={darkenColor(sleeveHex, 8)} /><stop offset="100%" stopColor={darkenColor(sleeveHex, 28)} />
        </linearGradient>
        <linearGradient id="rKnitG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 20)} /><stop offset="30%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="rCuffG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(knitHex, 18)} /><stop offset="35%" stopColor={lightenColor(knitHex, 8)} />
          <stop offset="70%" stopColor={knitHex} /><stop offset="100%" stopColor={darkenColor(knitHex, 22)} />
        </linearGradient>
        <linearGradient id="rPocketG" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lightenColor(pocketHex, 15)} /><stop offset="50%" stopColor={pocketHex} />
          <stop offset="100%" stopColor={darkenColor(pocketHex, 25)} />
        </linearGradient>
        <radialGradient id="rBodyHL" cx="65%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rCuffHL" cx="60%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rKnitHL" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g id="right-knit-cuff">
        <path d="M341.664,513.902c1.772,4.059-0.333,6.955-3.92,9.554c-3.704,2.684-12.693,7.653-19.336,10.553c-6.644,2.9-16.399,6.114-20.885,7.005c-4.344,0.863-7.899,0.438-9.671-3.621l-10.415-23.858c0,0,13.336-3.639,27.707-9.913c15.472-6.754,26.128-13.594,26.128-13.594L341.664,513.902z"
          fill="url(#rCuffG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
        <ellipse cx="305" cy="515" rx="28" ry="10" fill="url(#rCuffHL)" pointerEvents="none" />
      </g>
      <KnitCuffRibs knitStyle={knitStyle} side="right" lineColor={knitLineHex} borderColor={knitBorderHex} />
      <g id="right-knit-band">
        <path d="M392.93,445.527c-1.2,4.337-2.877,8.282-5.155,11.668c-15.278,21.134-89.197,25.521-89.197,25.521s-72.485,0.634-87.763-20.5c-2.278-3.386-3.955-7.331-5.155-11.668l0,37.699c0,3.784,1.416,7.275,3.713,9.17c17.391,14.346,50.523,20.274,88.542,20.274c39.269,0,73.329-6.323,90.21-21.715c2.115-1.928,3.372-5.289,3.372-8.869L392.93,445.527z"
          fill="url(#rKnitG)" stroke={kStroke} strokeMiterlimit="10" strokeWidth="1.5" />
        <ellipse cx="300" cy="453" rx="90" ry="9" fill="url(#rKnitHL)" pointerEvents="none" />
      </g>
      <path d="M205.527,425.266c3.512-10.757,8.431-29.952,5.428-41.145c-3.003-11.196,0-17.078,0-17.078s3.463-41.326,2.952-55.113c-0.607-16.401-8.345-65.113-8.345-65.113s-8.676-97.491,38.447-143.381c6.541-6.37,36.081-1.619,55.315,5.939c38.668,15.196,50.157,18.304,50.157,18.304s3.181,17.519,18.75,45.789c15.57,28.274,26.429,39.543,29.502,97.316c3.073,57.774-3.268,147.329-3.268,154.923c0,7.898-0.572,14.292-1.668,19.82c-1.2,4.337-2.877,8.282-5.155,11.668c-15.278,21.134-89.197,25.521-89.197,25.521s-72.485,0.634-87.763-20.5c-2.278-3.386-3.955-7.331-5.155-11.667C204.551,440.376,203.977,430.015,205.527,425.266z"
        fill="url(#rBodyG)" stroke={bStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <ellipse cx="290" cy="280" rx="90" ry="160" fill="url(#rBodyHL)" pointerEvents="none" />
      <path d="M331.274,490.035c0.003-0.091-3.381-21.935-8.53-33.05c-10.233-22.09-26.157-43.948-27.487-59.731c-2.006-23.794-10.042-35.475-11.173-51.553c-2.074-29.492,34.715-97.994,12.92-159.088c-12.624-30.243-39.202-34.143-39.202-34.143s-30.567,3.021-44.513,40.466c-13.946,37.445-11.737,59.184-11.737,59.184s1.194,19.933,1.15,26.485c-0.107,15.914,4.879,48.082,4.378,67.098c-1.788,14.602,0.438,23.347,2.657,29.097c2.774,7.18,6.218,15.977,6.688,28.481c0.846,22.517,7.599,23.359,14.635,40.529c7.036,17.167,31.329,54.491,36.395,60.684c3.948,4.825,9.979,9.043,9.979,9.043s16.662-5.091,27.707-9.913C319.919,497.171,331.274,490.035,331.274,490.035z"
        fill="url(#rSleeveG)" stroke={sStroke} strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M272,165 C266,220 264,300 270,380 C275,440 284,475 294,500"
        fill="none" stroke="#ffffff" strokeOpacity="0.13" strokeWidth="14" strokeLinecap="round" />
      {showPockets && (
        <g>
          <polygon points="339.824,433.446 334.25,432.299 345.831,359.48 351.406,360.627"
            fill="url(#rPocketG)" stroke={pStroke} strokeWidth="1.2" />
          <line x1="349" y1="364" x2="339" y2="430" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>
      )}
      {collarHex && collarStyle && <RightCollarOverlay collarHex={collarHex} collarStyle={collarStyle} />}
    </>
  );
};

// ─── COLLAR HELPERS ──────────────────────────────────────────────────────────
const applyCollarColor = (svgString, fillValue) => {
  if (!svgString || !fillValue) return svgString;
  let result = svgString;
  result = result.replace(/fill="#ffffff"/gi, `fill="${fillValue}"`);
  result = result.replace(/fill="#fff"/gi, `fill="${fillValue}"`);
  result = result.replace(
    /style="([^"]*)fill\s*:\s*rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)([^"]*)"/g,
    (match, before, after) => `style="${before}fill: ${fillValue}${after}"`
  );
  return result;
};

const SideCollarOverlay = ({ collarHex, collarStyle, flip = false }) => {
  const lightHex = lightenColor(collarHex, 30);
  const darkHex = darkenColor(collarHex, 40);
  const gradId = `sideCollarG_${flip ? 'r' : 'l'}`;
  const shadowId = `sideCollarShadow_${flip ? 'r' : 'l'}`;
  const transform = flip ? 'translate(600,0) scale(-1,1)' : '';
  const sharedDefs = (
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={lightHex} /><stop offset="50%" stopColor={collarHex} /><stop offset="100%" stopColor={darkHex} />
      </linearGradient>
      <filter id={shadowId}>
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.28" />
      </filter>
    </defs>
  );
  const cp = { fill: `url(#${gradId})`, stroke: darkHex, strokeMiterlimit: "10", strokeWidth: "1.5", filter: `url(#${shadowId})` };
  if (collarStyle === 'classic_standup' || collarStyle === 'classic_standup_overlap') {
    return <g transform={transform}>{sharedDefs}<path d="M349.522,127.309c0.215-1.692,0.857-11.275-9.433-25.351c-14.402-19.701-42.897-37.803-54.747-41.429c-11.85-3.626-16.648-2.44-20.725-1.686c-9.311,1.936-8.405,19.445-19.959,43.168c-0.085,0.174-0.513,1.055-0.649,1.325c8.123-5.772,27.411,3.535,52.337,13.175c37.515,14.51,53.135,11.067,53.135,11.067S349.499,127.487,349.522,127.309z" {...cp} /></g>;
  }
  if (collarStyle === 'pro_shirt') {
    return <g transform={transform}>{sharedDefs}<path d="M235.9,112.9l10.7-33.5c0,0,1.2-7.1,7.1-6.2c5.1,0.8,34.7,13.6,54.5,21.2c19.7,7.6,34.7,11.1,43.2,14.3c1,14.6-7,48-7,48s-16.6-14.4-53.6-37.5C258.3,99,235.9,112.9,235.9,112.9z" {...cp} /></g>;
  }
  if (collarStyle === 'hood') {
    return <g transform={transform}>{sharedDefs}<path d="M349.579,127.678c0,0,13.555-17.403-9.175-31.642s-39.208-29.457-75.94-34.978s-55.432-0.883-73.231,28.478c-17.964,14.733-23.321,54.987-13,63.5c10.321,8.513-18.019,24.501,6.064,37.44c1.806,10.428,7.398,23.659,16.442,17.952c4.108-2.948,3.83-12.108,6.187-22.395c4.639-20.24,23.576-64.896,52.472-77.521C284.529,97.533,318.991,119.23,349.579,127.678z" {...cp} /></g>;
  }
  if (collarStyle === 'zippered_hood') {
    return <g transform={transform}>{sharedDefs}<path d="M352.1,125.7c-24.8-1.9-38.1-18.5-70-10c0,0-10.6,1.8-21,13.6c-10.5,11.8-16,32.4-21.4,50.5c-5.5,18.5-16.6,32.3-29.8,41.8c-17.2,12.4-3.9-42.9,2.3-67.8c1.5-6.1,16.8-49.5,34.4-67c17.5-17.5,6.3-35.1,24.2-34.7c17.9,0.4,18.3,9.7,38,19.6C338.9,87,379,114.9,365,127.1C361.5,128.4,356.1,126,352.1,125.7z" {...cp} /></g>;
  }
  if (collarStyle === 'classic_band') {
    return <g transform={transform}>{sharedDefs}<path d="M349.7,129c-1.7-7.7-0.5-19.6-2.6-29.3c-0.3-1.6-1.4-4.4-2.9-4.9c-8.2-2.9-35.6-12.1-54.7-19.1c-14-5.2-27.4-7.3-33-8c-1.5-0.2-3,0.7-3.4,2.2l-1.9,6.6c-1.6,5.4-7.3,27-7.3,27s2.4-3.1,16.5,0c6.5,1.4,15.1,5.2,27.5,10.2c4.4,1.8,21.7,8.8,34.5,11.6C337.2,128.6,349.7,129,349.7,129z" {...cp} /></g>;
  }
  if (collarStyle === 'band' || collarStyle === 'band_stripe') {
    return <g transform={transform}>{sharedDefs}<path d="M244,103.4l2.6-30.3c0,0,1.2-7.1,7.1-6.2c5.1,0.8,38.6,14.1,54.5,19.2c15.9,5.1,26.1,6.9,34.8,9.7c3.9,1.2,6.6,5,6.4,9.1c-0.5,13.2,0.1,22.8,0.1,22.8s-18.6,1.1-58.8-15.8C251.6,95.5,244,103.4,244,103.4z" {...cp} /></g>;
  }
  return null;
};

// ─── DECORATION RENDERER ─────────────────────────────────────────────────────
const SegmentDecoration = ({ segment, x, y, size = 70, fontSize = 34 }) => {
  if (!segment || segment.type === 'None') return null;

  if (segment.type === 'Text' && segment.text) {
    return (
      <ArcText
        text={segment.text}
        cx={x}
        cy={y}
        fontId={segment.font || 'Script'}
        fillColor={segment.color || '#ffffff'}
        strokeColor={segment.strokeColor}
        fontSize={resolveFontSize(segment.height, fontSize)}
        arc={segment.arc ?? 0}
        material={segment.material}
        sportTouchTexture={segment.sportTouchTexture}
        rhinestones={segment.rhinestones}
        letterSpacing="2"
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
    // An image-category patch: show the chosen image directly.
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

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function JacketVisualPreview({ state, view, onChangeView }) {
  if (!state || typeof state !== 'object') {
    return (
      <div className="jvp-jacket-preview-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p>Loading jacket preview...</p>
        </div>
      </div>
    );
  }

  const bodyHex        = state.bodyColor?.hex             || '#1a1a2e';
  const sleeveHex      = state.sleeveColor?.hex           || '#000000';
  const pocketHex      = state.pocketColor?.hex           || '#1a1a2e';
  const pocketStyle    = state.pocketStyle                || 'Slash';
  const knitHex        = state.knitBaseColor?.hex         || '#1a1a2e';
  const knitLineHex    = state.knitLineColor?.hex         || '#d4af37';
  const knitBorderHex  = state.knitBorderColor?.hex       || knitLineHex;
  const knitStyle      = state.knitStyle                  || 'Plain Knit';
  const snapColor      = state.snapColor?.hex             || '#c0c0c0';
  const snapsOrZipper  = state.snapsOrZipper              || 'Snap';
  const showFlap       = state.addZipperFlap === true;
  const showPockets    = state.showPockets !== false;
  const cuffStyle        = state.cuffStyle === 'Pro' ? 'Pro' : 'Classic';
  const addChestPocket   = state.addChestPocket === true;
  const addSleeveStripe  = state.addSleeveStripe === true;
  const addPocketPiping  = state.addPocketPiping === true;
  const addShoulderPiping = state.addShoulderPiping === true;
  const addStripePiping  = state.addStripePiping === true;
  const proCuffHex       = state.proCuffColor?.hex        || sleeveHex;
  const chestPocketHex   = state.chestPocketColor?.hex    || '#9ca1a4';
  const sleeveStripeHex  = state.sleeveStripeColor?.hex   || '#d4af37';
  const pocketPipingHex  = state.pocketPipingColor?.hex   || '#d4af37';
  const shoulderPipingHex = state.shoulderPipingColor?.hex || '#d4af37';
  const stripePipingHex  = state.stripePipingColor?.hex   || '#d4af37';
  const insertCount    = typeof state.shoulderInsertCount === 'number' ? state.shoulderInsertCount : (state.hasShoulderInserts ? 2 : 0);
  const insertColors = [
  state.shoulderColor?.hex  || '#9ca1a4',
  state.shoulderColor2?.hex || state.shoulderColor?.hex || '#9ca1a4',
  state.shoulderColor3?.hex || state.shoulderColor?.hex || '#9ca1a4',
];

  const getCollarHex = () => {
    if (state.collarColor && typeof state.collarColor === 'object') return state.collarColor.hex || knitHex;
    if (typeof state.collarColor === 'string') return state.collarColor;
    return knitHex;
  };
  const collarHex = getCollarHex();

  const get3DCollarSvg = () => {
    try {
      const collarStyleObj = COLLAR_STYLES?.find(c => c.id === state.collarStyle);
      if (!collarStyleObj) return null;
      const lightColor = lightenColor(collarHex, 40);
      const darkColor  = darkenColor(collarHex, 40);
      const gId = 'vmCollarGrad';
      const fId = 'vmCollarShadow';
      const rainbowId = 'vmCollarRainbowGrad';

      let svg = applyCollarColor(collarStyleObj.svg, collarHex);

      const linePaths = COLLAR_KNIT_LINE_PATHS[knitStyle];
      let knitLinesMarkup = '';
      let rainbowDefsMarkup = '';

      if (linePaths) {
        if (knitStyle === 'Rainbow') {
          rainbowDefsMarkup = `
            <linearGradient id="${rainbowId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#dc2626"/>
              <stop offset="33%" stop-color="#d4af37"/>
              <stop offset="66%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="#7c3aed"/>
            </linearGradient>
          `;
          knitLinesMarkup = linePaths.map((d) => `<path d="${d}" fill="url(#${rainbowId})"/>`).join('');
        } else {
          const markColor = knitStyle === 'Border Knit' ? knitBorderHex : knitLineHex;
          knitLinesMarkup = linePaths.map((d) => `<path d="${d}" fill="${markColor}"/>`).join('');
        }
      }

      return `
        <defs>
          <filter id="${fId}"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/></filter>
          <linearGradient id="${gId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stop-color="${lightColor}"/>
            <stop offset="50%"  stop-color="${collarHex}"/>
            <stop offset="100%" stop-color="${darkColor}"/>
          </linearGradient>
          ${rainbowDefsMarkup}
        </defs>
        <g filter="url(#${fId})">${svg}</g>
        <g>${knitLinesMarkup}</g>
      `;
    } catch { return null; }
  };

  const fontsReady = useFontsReady(FONT_OPTIONS.map((f) => f.fontFamily));

  const commonKnitProps = { knitStyle, knitLineHex, knitBorderHex };

  const renderViewPaths = () => {
    switch (view) {
      case 'Front':
        return <FrontView bodyHex={bodyHex} sleeveHex={sleeveHex} knitHex={knitHex} pocketHex={pocketHex} snapColor={snapColor} showPockets={showPockets} pocketStyle={pocketStyle} snapsOrZipper={snapsOrZipper} showFlap={showFlap} insertColors={insertColors} insertCount={insertCount} cuffStyle={cuffStyle} addChestPocket={addChestPocket} addSleeveStripe={addSleeveStripe} addPocketPiping={addPocketPiping} addShoulderPiping={addShoulderPiping} addStripePiping={addStripePiping} proCuffHex={proCuffHex} chestPocketHex={chestPocketHex} sleeveStripeHex={sleeveStripeHex} pocketPipingHex={pocketPipingHex} shoulderPipingHex={shoulderPipingHex} stripePipingHex={stripePipingHex} {...commonKnitProps} />;
      case 'Back':
        return <BackView bodyHex={bodyHex} sleeveHex={sleeveHex} knitHex={knitHex} insertColors={insertColors} insertCount={insertCount} collarHex={collarHex} collarStyle={state.collarStyle} {...commonKnitProps} />;
      case 'Left':
        return <LeftView bodyHex={bodyHex} sleeveHex={sleeveHex} knitHex={knitHex} pocketHex={pocketHex} showPockets={showPockets} insertColors={insertColors} insertCount={insertCount} {...commonKnitProps} />;
      case 'Right':
        return <RightView bodyHex={bodyHex} sleeveHex={sleeveHex} knitHex={knitHex} pocketHex={pocketHex} showPockets={showPockets} insertColors={insertColors} insertCount={insertCount} collarHex={collarHex} collarStyle={state.collarStyle} {...commonKnitProps} />;
      default:
        return null;
    }
  };

  const back = state.back || {};

  return (
    <div className="jvp-jacket-preview-container">
      <div className="jvp-viewport-frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${fontsReady}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="jvp-viewport-content"
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            <svg viewBox="0 0 600 600" style={{ width: '100%', height: '100%', display: 'block' }}>
              {renderViewPaths()}

              <defs>
                <filter id="overlayDropShadow">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* ── COLLAR overlays ── */}
              {view === 'Front' && state.collarStyle && (() => {
                const html = get3DCollarSvg();
                if (!html) return null;
                return <g dangerouslySetInnerHTML={{ __html: html }} />;
              })()}
              {view === 'Left' && state.collarStyle && (
                <SideCollarOverlay collarHex={collarHex} collarStyle={state.collarStyle} flip={true} />
              )}
              {view === 'Right' && state.collarStyle && (
                <SideCollarOverlay collarHex={collarHex} collarStyle={state.collarStyle} flip={false} />
              )}

              {/* ── FRONT DECORATIONS ── */}
              {view === 'Front' && (
                <g id="front-decorations">
                  <SegmentDecoration segment={state.leftChest} x={362} y={225} fontSize={34} size={65} />
                  <SegmentDecoration segment={state.rightChest} x={240} y={225} fontSize={34} size={65} />
                </g>
              )}

              {/* ── SLEEVE DECORATIONS ── */}
              {view === 'Left' && (
                <g>
                  <SegmentDecoration segment={state.leftSleeve} x={350} y={270} fontSize={28} size={58} />
                </g>
              )}
              {view === 'Right' && (
                <g>
                  <SegmentDecoration segment={state.rightSleeve} x={255} y={270} fontSize={28} size={58} />
                </g>
              )}

              {/* ── BACK DECORATIONS ── */}
              {view === 'Back' && back.type !== 'None' && (
                <g id="back-decorations">
                  {back.line1Text && (
                    <g filter="url(#overlayDropShadow)">
                      <ArcText
                        text={back.line1Text}
                        cx={300}
                        cy={195}
                        fontId={back.line1Font || 'Block'}
                        fillColor={back.line1Color || '#ffffff'}
                        strokeColor={back.line1StrokeColor}
                        fontSize={resolveFontSize(back.line1Height, 28)}
                        arc={back.line1Arc ?? -45}
                        material={back.line1Material}
                        sportTouchTexture={back.line1SportTouchTexture}
                        rhinestones={back.line1Rhinestones}
                        letterSpacing="3"
                        uppercase
                      />
                    </g>
                  )}
                  {back.line3Text && (
                    <g filter="url(#overlayDropShadow)">
                      <ArcText
                        text={back.line3Text}
                        cx={300}
                        cy={345}
                        fontId={back.line3Font || 'Script'}
                        fillColor={back.line3Color || '#ffffff'}
                        strokeColor={back.line3StrokeColor}
                        fontSize={resolveFontSize(back.line3Height, 34)}
                        arc={back.line3Arc ?? 0}
                        material={back.line3Material}
                        sportTouchTexture={back.line3SportTouchTexture}
                        rhinestones={back.line3Rhinestones}
                        letterSpacing="0"
                      />
                    </g>
                  )}
                  {back.line2Text && (
                    <g filter="url(#overlayDropShadow)">
                      <ArcText
                        text={back.line2Text}
                        cx={300}
                        cy={425}
                        fontId={back.line2Font || 'Block'}
                        fillColor={back.line2Color || '#ffffff'}
                        strokeColor={back.line2StrokeColor}
                        fontSize={resolveFontSize(back.line2Height, 26)}
                        arc={back.line2Arc ?? 45}
                        material={back.line2Material}
                        sportTouchTexture={back.line2SportTouchTexture}
                        rhinestones={back.line2Rhinestones}
                        letterSpacing="2.5"
                        uppercase
                      />
                    </g>
                  )}
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
      <div className="jvp-view-selectors">
        {['Front', 'Left', 'Right', 'Back'].map((v) => (
          <button
            key={v}
            onClick={() => onChangeView(v)}
            className={`jvp-view-btn ${view === v ? 'jvp-view-btn-active' : 'jvp-view-btn-inactive'}`}
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
  view: PropTypes.oneOf(['Front', 'Left', 'Right', 'Back']).isRequired,
  onChangeView: PropTypes.func.isRequired,
};

JacketVisualPreview.defaultProps = {
  state: {
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
    collarColor:  { hex: '#1a1a2e', name: 'Black' },
    leftChest:    { type: 'None', text: '', color: '#ffffff', font: 'Script', material: 'Embroidery', height: '3"', arc: 0, rhinestones: false },
    rightChest:   { type: 'None', text: '', color: '#ffffff', font: 'Script', material: 'Embroidery', height: '3"', arc: 0, rhinestones: false },
    leftSleeve:   { type: 'None', text: '', color: '#000000', font: 'Script', material: 'Embroidery', height: '2"', arc: 0, rhinestones: false },
    rightSleeve:  { type: 'None', text: '', color: '#000000', font: 'Script', material: 'Embroidery', height: '2"', arc: 0, rhinestones: false },
    back: { type: 'None' },
  },
};