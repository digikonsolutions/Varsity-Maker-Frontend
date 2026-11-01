/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Mail, Ruler, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './CartSummaryPanel.css';
import Sizefinderpopup from '../../../components/SizeFinderPopup.jsx';
import { LuRuler } from "react-icons/lu";

// Size Options Data
export const SIZE_OPTIONS = [
  { value: 'S', label: 'Small', priceAddon: 0 },
  { value: 'M', label: 'Medium', priceAddon: 0 },
  { value: 'L', label: 'Large', priceAddon: 0 },
  { value: 'XL', label: 'X-Large', priceAddon: 10 },
  { value: '2XL', label: '2X-Large', priceAddon: 15 },
  { value: '3XL', label: '3X-Large', priceAddon: 20 },
];

/**
 * Get colors for material (helper function)
 */
export const getColorsForMaterial = (material) => {
  const colors = {
    wool: ['Black', 'Navy', 'Grey', 'Charcoal', 'Camel'],
    leather: ['Black', 'Brown', 'Tan', 'Burgundy', 'Navy'],
    suede: ['Tan', 'Brown', 'Navy', 'Black', 'Burgundy'],
  };
  return colors[material?.toLowerCase()] || colors.wool;
};

/**
 * CartSummaryPanel Component
 */
export default function CartSummaryPanel({ state, onChangeState, onAddToCart }) {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Build your own Varsity Jacket!');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [referring, setReferring] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);
      const [open, setOpen] = useState(false);

  const getSelectedSizeOption = () => {
    return SIZE_OPTIONS.find(o => o.value === state.size);
  };

  const getSizingCost = () => {
    return getSelectedSizeOption()?.priceAddon || 0;
  };

  const getJacketBaseCost = () => {
    return 249;
  };

  const getPersonalizationsCost = () => {
    let cost = 0;
    cost += state.leftChest.price || 0;
    cost += state.rightChest.price || 0;
    cost += state.leftSleeve.price || 0;
    cost += state.rightSleeve.price || 0;
    cost += state.back.price || 0;
    if (state.hasShoulderInserts) {
      cost += state.shoulderMaterial === 'Leather' ? 20 : 10;
    }
    if (state.snapsOrZipper === 'Zipper') {
      cost += 10;
    }
    return cost;
  };

  const getTotalCost = () => {
    return getJacketBaseCost() + getPersonalizationsCost() + getSizingCost();
  };

  const handleShareEmail = (e) => {
    e.preventDefault();
    if (!emailFrom || !emailTo) return;
    setReferring(true);
    setTimeout(() => {
      setReferring(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    }, 1500);
  };

  const handleInnerAddToCart = () => {
    if (!state.size) {
      alert("Please select your size before adding to cart.");
      return;
    }
    setAddedMessage(true);
    onAddToCart();
    setTimeout(() => {
      setAddedMessage(false);
    }, 7000);
  };

  return (
    <div className="raglan-cart-summary-container">
      
      {/* Dynamic Checkout Feedbacks */}
      {addedMessage && (
        <div className="raglan-success-message">
          <div className="raglan-success-message-inner">
            <CheckCircle size={16} className="raglan-success-icon" />
            <span className="raglan-success-text">"Your Custom Varsity Jacket" has been successfully added to your cart!</span>
          </div>
          <p className="raglan-success-subtext">Your configured design is booked. Proceed to Checkout securely in the payment tab.</p>
        </div>
      )}

      {/* Summary Matrix */}
      <h3 className="raglan-section-title">Customization Specifications</h3>
      
      <div className="raglan-summary-card">
        {/* Core items Grid */}
        <div className="raglan-summary-grid">
          <div className="raglan-summary-left">
            <h4 className="raglan-summary-subtitle">Jacket Chassis</h4>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Collar Type / Style:</span>
              <span className="raglan-summary-value">{state.style}</span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Body ({state.bodyMaterial}):</span>
              <span className="raglan-summary-value">{state.bodyColor?.name || 'Black'}</span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Sleeves ({state.sleeveMaterial}):</span>
              <span className="raglan-summary-value">{state.sleeveColor?.name || 'Black'}</span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Fasteners:</span>
              <span className="raglan-summary-value">
                {state.snapsOrZipper === 'Zipper' ? 'Brass Zipper' : `Snaps (${state.snapColor?.name || 'Silver'})`}
              </span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Linings / Interior:</span>
              <span className="raglan-summary-value">
                {state.innerLining || 'Satin'} ({state.innerLiningColor?.name || 'Red'} Satin)
              </span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Knit Trim Pattern:</span>
              <span className="raglan-summary-value">{state.knitStyle || 'Solid Color'}</span>
            </div>
            <div className="raglan-summary-item">
              <span className="raglan-summary-label">Knit Base / Stripe:</span>
              <span className="raglan-summary-value-subtle">
                {state.knitBaseColor?.name || 'Black'} / {state.knitLineColor?.name || 'Gold'}
              </span>
            </div>
          </div>

          <div className="raglan-summary-right">
            <h4 className="raglan-summary-subtitle">Personalizations</h4>
            {state.leftChest?.type !== 'None' && (
              <div className="raglan-summary-item">
                <span className="raglan-summary-label">Left Chest ({state.leftChest.type}):</span>
                <span className="raglan-summary-value raglan-truncate">
                  {state.leftChest.type === 'Text' ? `"${state.leftChest.text}"` : state.leftChest.patchName}
                </span>
              </div>
            )}
            {state.rightChest?.type !== 'None' && (
              <div className="raglan-summary-item">
                <span className="raglan-summary-label">Right Chest ({state.rightChest.type}):</span>
                <span className="raglan-summary-value raglan-truncate">
                  {state.rightChest.type === 'Text' ? `"${state.rightChest.text}"` : state.rightChest.patchName}
                </span>
              </div>
            )}
            {state.leftSleeve?.type !== 'None' && (
              <div className="raglan-summary-item">
                <span className="raglan-summary-label">Left Sleeve:</span>
                <span className="raglan-summary-value">Active Patch</span>
              </div>
            )}
            {state.rightSleeve?.type !== 'None' && (
              <div className="raglan-summary-item">
                <span className="raglan-summary-label">Right Sleeve:</span>
                <span className="raglan-summary-value">Active Patch</span>
              </div>
            )}
            {state.back?.type !== 'None' && (
              <div className="raglan-summary-item">
                <span className="raglan-summary-label">Back Config:</span>
                <span className="raglan-summary-value">Custom Artwork</span>
              </div>
            )}
            {!(state.leftChest?.type !== 'None' || state.rightChest?.type !== 'None' || 
              state.leftSleeve?.type !== 'None' || state.rightSleeve?.type !== 'None' || 
              state.back?.type !== 'None') && (
              <span className="raglan-no-personalization">No custom patches or numbers added. Clean aesthetic.</span>
            )}
          </div>
        </div>

        {/* Costing calculation */}
        {/* <div className="raglan-costing-section">
          <div className="raglan-cost-item">
            <span className="raglan-cost-label">Special Template Base Coat:</span>
            <span className="raglan-cost-value">$ {getJacketBaseCost()}</span>
          </div>
          <div className="raglan-cost-item">
            <span className="raglan-cost-label">Tailoring Modification Upgrades:</span>
            <span className="raglan-cost-value">$ {getPersonalizationsCost()}</span>
          </div>
          {getSizingCost() > 0 && (
            <div className="raglan-cost-item">
              <span className="raglan-cost-label">Selected Oversize/Tall Surcharge:</span>
              <span className="raglan-cost-value">$ {getSizingCost()}</span>
            </div>
          )}
          <div className="raglan-cost-total">
            <span className="raglan-cost-total-label">Estimated Total:</span>
            <span className="raglan-cost-total-value">$ {getTotalCost()}</span>
          </div>
        </div> */}
      </div>

      {/* Sizing Picker */}
      <div className="raglan-sizing-section">
        <label className="raglan-sizing-label">Select Fit / Standard Size *</label>
        <div className="raglan-sizing-control">
          <select
            value={state.size || ''}
            onChange={(e) => onChangeState(prev => ({ ...prev, size: e.target.value }))}
            className="raglan-sizing-select"
          >
            <option value="" disabled>Select Adult Sizing</option>
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value} {o.priceAddon > 0 ? `(+$${o.priceAddon})` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSizeChart(!showSizeChart)}
            className="raglan-sizing-chart-btn"
            title="Check dimensions chart"
          >
            <Ruler size={14} className="raglan-chart-icon" />
            <span className="raglan-chart-text">Chart</span>
          </button>
        </div>
      </div>

      {/* Inline Sizing Chart Matrix */}
      {showSizeChart && (
        <div className="raglan-size-chart">
          <div className="raglan-size-chart-header">
            <h4 className="raglan-size-chart-title">Adult Dimensions Guide</h4>
            <span className="raglan-size-chart-sub">(Measurements in Inches)</span>
          </div>
          <div className="raglan-size-chart-table-wrap">
            <table className="raglan-size-chart-table">
              <thead>
                <tr className="raglan-size-chart-head">
                  <th className="raglan-size-chart-cell">Size</th>
                  <th className="raglan-size-chart-cell">Chest</th>
                  <th className="raglan-size-chart-cell">Length</th>
                  <th className="raglan-size-chart-cell">Sleeve</th>
                </tr>
              </thead>
              <tbody className="raglan-size-chart-body">
                <tr><td className="raglan-size-chart-data raglan-size-chart-bold">SMALL</td><td className="raglan-size-chart-data">36-38</td><td className="raglan-size-chart-data">26</td><td className="raglan-size-chart-data">32</td></tr>
                <tr><td className="raglan-size-chart-data raglan-size-chart-bold">MEDIUM</td><td className="raglan-size-chart-data">39-41</td><td className="raglan-size-chart-data">27</td><td className="raglan-size-chart-data">33</td></tr>
                <tr><td className="raglan-size-chart-data raglan-size-chart-bold">LARGE</td><td className="raglan-size-chart-data">42-44</td><td className="raglan-size-chart-data">28</td><td className="raglan-size-chart-data">34</td></tr>
                <tr><td className="raglan-size-chart-data raglan-size-chart-bold">XLARGE</td><td className="raglan-size-chart-data">46-48</td><td className="raglan-size-chart-data">29</td><td className="raglan-size-chart-data">35</td></tr>
                <tr><td className="raglan-size-chart-data raglan-size-chart-bold">2XLARGE</td><td className="raglan-size-chart-data">50-52</td><td className="raglan-size-chart-data">30</td><td className="raglan-size-chart-data">36</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Major Cart buttons */}
      <button
        onClick={handleInnerAddToCart}
        disabled={!state.size}
        className="raglan-cart-button"
      >
        <ShoppingBag size={15} className="raglan-cart-button-icon" />
        <span>Add to Cart & Order Jacket</span>
      </button>

       <div className="made-to-measure">
            <label className="leather-sizing-label">Make to Measure</label>
                          <button onClick={() => setOpen(true)} className="productDetailPage-virtualBtn">
                            Find My Size{" "}
                            <LuRuler className="productDetailPage-virtualIcon" />
                          </button>
            
                          <Sizefinderpopup open={open} onClose={() => setOpen(false)} />
                          </div>

      {/* Share with friends referral segment */}
      {/* <div className="raglan-share-section">
        <div className="raglan-share-header">
          <Mail size={14} className="raglan-share-icon" />
          <h4 className="raglan-share-title">Send Config to a Friend</h4>
        </div>
        
        <form onSubmit={handleShareEmail} className="raglan-share-form">
          <input
            type="text"
            required
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Email Subject *"
            className="raglan-share-input"
          />
          <div className="raglan-share-input-group">
            <input
              type="email"
              required
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              placeholder="Your Email *"
              className="raglan-share-input"
            />
            <input
              type="email"
              required
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="Friend's Email *"
              className="raglan-share-input"
            />
          </div>

          <button
            type="submit"
            disabled={referring}
            className="raglan-share-submit"
          >
            {referring ? 'Sending Invitation...' : 'Send Referral Link'}
          </button>
        </form>

        {emailSent && (
          <div className="raglan-share-success">
            Custom configuration shared successfully! Check inbox.
          </div>
        )}
      </div> */}

    </div>
  );
}

// PropTypes for runtime validation
CartSummaryPanel.propTypes = {
  state: PropTypes.shape({
    style: PropTypes.string,
    size: PropTypes.string,
    bodyMaterial: PropTypes.string,
    sleeveMaterial: PropTypes.string,
    snapsOrZipper: PropTypes.string,
    shoulderMaterial: PropTypes.string,
    hasShoulderInserts: PropTypes.bool,
    innerLining: PropTypes.string,
    knitStyle: PropTypes.string,
    bodyColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    sleeveColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    pocketColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    shoulderColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    snapColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    knitBaseColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    knitLineColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    innerLiningColor: PropTypes.shape({
      name: PropTypes.string,
      hex: PropTypes.string,
    }),
    leftChest: PropTypes.shape({
      type: PropTypes.string,
      text: PropTypes.string,
      color: PropTypes.string,
      patchName: PropTypes.string,
      price: PropTypes.number,
    }),
    rightChest: PropTypes.shape({
      type: PropTypes.string,
      text: PropTypes.string,
      color: PropTypes.string,
      patchName: PropTypes.string,
      price: PropTypes.number,
    }),
    leftSleeve: PropTypes.shape({
      type: PropTypes.string,
      text: PropTypes.string,
      color: PropTypes.string,
      patchName: PropTypes.string,
      price: PropTypes.number,
    }),
    rightSleeve: PropTypes.shape({
      type: PropTypes.string,
      text: PropTypes.string,
      color: PropTypes.string,
      patchName: PropTypes.string,
      price: PropTypes.number,
    }),
    back: PropTypes.shape({
      type: PropTypes.string,
      price: PropTypes.number,
    }),
  }).isRequired,
  onChangeState: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};