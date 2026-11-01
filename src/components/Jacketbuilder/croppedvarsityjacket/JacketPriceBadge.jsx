
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import './JacketPriceBadge.css';

import { getPriceBreakdown } from './MaterialsColorsPanel.jsx';
import { getDesignPriceBreakdown } from './DesignPatchesPanel.jsx';

const CURRENCY = '$';

const fmtMoney = (n) =>
  `${n < 0 ? '-' : ''}${CURRENCY}${Math.abs(Number(n) || 0).toLocaleString()}`;

const fmtDelta = (n) => {
  const v = Number(n) || 0;
  return `${v > 0 ? '+' : '−'}${CURRENCY}${Math.abs(v).toLocaleString()}`;
};

export default function JacketPriceBadge({
  state,
  position = 'top-right',
  defaultOpen = false,
  onOpenChange,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [delta, setDelta] = useState(0);
  const prevTotal = useRef(null);

  // ── price, recomputed whenever any option in state changes ──
  const { jacketLines, jacketTotal, designLines, designTotal, total } = useMemo(() => {
    if (!state || typeof state !== 'object') {
      return { jacketLines: [], jacketTotal: 0, designLines: [], designTotal: 0, total: 0 };
    }

    let jacket = { lines: [], total: 0 };
    let design = { lines: [], total: 0 };

    try { jacket = getPriceBreakdown(state); } catch (e) { /* panel not loaded */ }
    try { design = getDesignPriceBreakdown(state); } catch (e) { /* panel not loaded */ }

    return {
      jacketLines: jacket.lines || [],
      jacketTotal: jacket.total || 0,
      designLines: design.lines || [],
      designTotal: design.total || 0,
      total: (jacket.total || 0) + (design.total || 0),
    };
  }, [state]);

  // ── flash the difference whenever the total moves ──
  useEffect(() => {
    if (prevTotal.current === null) {
      prevTotal.current = total;
      return undefined;
    }
    if (prevTotal.current === total) return undefined;

    setDelta(total - prevTotal.current);
    prevTotal.current = total;

    const timer = setTimeout(() => setDelta(0), 1700);
    return () => clearTimeout(timer);
  }, [total]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (typeof onOpenChange === 'function') onOpenChange(next);
  };

  const renderGroup = (title, lines, subtotal) => {
    if (!lines.length) return null;
    return (
      <div className="cropped-jpb-group">
        <div className="cropped-jpb-group-head">
          <span className="cropped-jpb-group-title">{title}</span>
          <span className="cropped-jpb-group-sub">{fmtMoney(subtotal)}</span>
        </div>
        <ul className="cropped-jpb-lines">
          {lines.map((l, i) => (
            <li key={`${l.label}-${i}`} className="cropped-jpb-line">
              <span className="cropped-jpb-line-label">{l.label}</span>
              <span className={`cropped-jpb-line-amount${l.amount < 0 ? ' cropped-is-minus' : ''}`}>
                {fmtMoney(l.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`cropped-jpb-root cropped-jpb-${position}`}>
      <button
        type="button"
        className={`cropped-jpb-badge${open ? ' cropped-jpb-badge-open' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-label={`Total ${fmtMoney(total)}. ${open ? 'Hide' : 'Show'} price breakdown`}
      >
        <span className="cropped-jpb-badge-left">
          <span className="cropped-jpb-label">Your total</span>
          <motion.span
            key={total}
            className="cropped-jpb-total"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            {fmtMoney(total)}
          </motion.span>
        </span>

        <ChevronDown size={15} className={`cropped-jpb-chevron${open ? ' cropped-jpb-chevron-open' : ''}`} />
      </button>

      {/* Floating +/− flash whenever an option is added or removed */}
      <AnimatePresence>
        {delta !== 0 && (
          <motion.span
            key={`delta-${delta}-${total}`}
            className={`cropped-jpb-delta${delta < 0 ? ' cropped-jpb-delta-minus' : ''}`}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {fmtDelta(delta)}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="cropped-jpb-panel"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="cropped-jpb-panel-inner">
              {renderGroup('Jacket', jacketLines, jacketTotal)}
              {renderGroup('Design & patches', designLines, designTotal)}

              {designLines.length === 0 && (
                <p className="cropped-jpb-empty">No personalization added yet.</p>
              )}

              <div className="cropped-jpb-grand">
                <span>Total</span>
                <strong>{fmtMoney(total)}</strong>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

JacketPriceBadge.propTypes = {
  state: PropTypes.object,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
  defaultOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
};