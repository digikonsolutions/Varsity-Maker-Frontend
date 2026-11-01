/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Mail, Ruler, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import './CartSummaryPanel.css';

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
    <div className="classic-cart-summary-container">
      
      {/* Dynamic Checkout Feedbacks */}
      {addedMessage && (
        <div className="classic-success-message">
          <div className="classic-success-message-inner">
            <CheckCircle size={16} className="classic-success-icon" />
            <span className="classic-success-text">"Your Custom Varsity Jacket" has been successfully added to your cart!</span>
          </div>
          <p className="classic-success-subtext">Your configured design is booked. Proceed to Checkout securely in the payment tab.</p>
        </div>
      )}

      {/* Summary Matrix */}
      <h3 className="classic-section-title">Customization Specifications</h3>
      
      <div className="classic-summary-card">
        {/* Core items Grid */}
        <div className="classic-summary-grid">
          <div className="classic-summary-left">
            <h4 className="classic-summary-subtitle">Jacket Chassis</h4>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Collar Type / Style:</span>
              <span className="classic-summary-value">{state.style}</span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Body ({state.bodyMaterial}):</span>
              <span className="classic-summary-value">{state.bodyColor?.name || 'Black'}</span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Sleeves ({state.sleeveMaterial}):</span>
              <span className="classic-summary-value">{state.sleeveColor?.name || 'Black'}</span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Fasteners:</span>
              <span className="classic-summary-value">
                {state.snapsOrZipper === 'Zipper' ? 'Brass Zipper' : `Snaps (${state.snapColor?.name || 'Silver'})`}
              </span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Linings / Interior:</span>
              <span className="classic-summary-value">
                {state.innerLining || 'Satin'} ({state.innerLiningColor?.name || 'Red'} Satin)
              </span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Knit Trim Pattern:</span>
              <span className="classic-summary-value">{state.knitStyle || 'Solid Color'}</span>
            </div>
            <div className="classic-summary-item">
              <span className="classic-summary-label">Knit Base / Stripe:</span>
              <span className="classic-summary-value-subtle">
                {state.knitBaseColor?.name || 'Black'} / {state.knitLineColor?.name || 'Gold'}
              </span>
            </div>
          </div>

          <div className="classic-summary-right">
            <h4 className="classic-summary-subtitle">Personalizations</h4>
            {state.leftChest?.type !== 'None' && (
              <div className="classic-summary-item">
                <span className="classic-summary-label">Left Chest ({state.leftChest.type}):</span>
                <span className="classic-summary-value classic-truncate">
                  {state.leftChest.type === 'Text' ? `"${state.leftChest.text}"` : state.leftChest.patchName}
                </span>
              </div>
            )}
            {state.rightChest?.type !== 'None' && (
              <div className="classic-summary-item">
                <span className="classic-summary-label">Right Chest ({state.rightChest.type}):</span>
                <span className="classic-summary-value classic-truncate">
                  {state.rightChest.type === 'Text' ? `"${state.rightChest.text}"` : state.rightChest.patchName}
                </span>
              </div>
            )}
            {state.leftSleeve?.type !== 'None' && (
              <div className="classic-summary-item">
                <span className="classic-summary-label">Left Sleeve:</span>
                <span className="classic-summary-value">Active Patch</span>
              </div>
            )}
            {state.rightSleeve?.type !== 'None' && (
              <div className="classic-summary-item">
                <span className="classic-summary-label">Right Sleeve:</span>
                <span className="classic-summary-value">Active Patch</span>
              </div>
            )}
            {state.back?.type !== 'None' && (
              <div className="classic-summary-item">
                <span className="classic-summary-label">Back Config:</span>
                <span className="classic-summary-value">Custom Artwork</span>
              </div>
            )}
            {!(state.leftChest?.type !== 'None' || state.rightChest?.type !== 'None' || 
              state.leftSleeve?.type !== 'None' || state.rightSleeve?.type !== 'None' || 
              state.back?.type !== 'None') && (
              <span className="classic-no-personalization">No custom patches or numbers added. Clean aesthetic.</span>
            )}
          </div>
        </div>

        {/* Costing calculation */}
        <div className="classic-costing-section">
          <div className="classic-cost-item">
            <span className="classic-cost-label">Special Template Base Coat:</span>
            <span className="classic-cost-value">$ {getJacketBaseCost()}</span>
          </div>
          <div className="classic-cost-item">
            <span className="classic-cost-label">Tailoring Modification Upgrades:</span>
            <span className="classic-cost-value">$ {getPersonalizationsCost()}</span>
          </div>
          {getSizingCost() > 0 && (
            <div className="classic-cost-item">
              <span className="classic-cost-label">Selected Oversize/Tall Surcharge:</span>
              <span className="classic-cost-value">$ {getSizingCost()}</span>
            </div>
          )}
          <div className="classic-cost-total">
            <span className="classic-cost-total-label">Estimated Total:</span>
            <span className="classic-cost-total-value">$ {getTotalCost()}</span>
          </div>
        </div>
      </div>

      {/* Sizing Picker */}
      <div className="classic-sizing-section">
        <label className="classic-sizing-label">Select Fit / Standard Size *</label>
        <div className="classic-sizing-control">
          <select
            value={state.size || ''}
            onChange={(e) => onChangeState(prev => ({ ...prev, size: e.target.value }))}
            className="classic-sizing-select"
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
            className="classic-sizing-chart-btn"
            title="Check dimensions chart"
          >
            <Ruler size={14} className="classic-chart-icon" />
            <span className="classic-chart-text">Chart</span>
          </button>
        </div>
      </div>

      {/* Inline Sizing Chart Matrix */}
      {showSizeChart && (
        <div className="classic-size-chart">
          <div className="classic-size-chart-header">
            <h4 className="classic-size-chart-title">Adult Dimensions Guide</h4>
            <span className="classic-size-chart-sub">(Measurements in Inches)</span>
          </div>
          <div className="classic-size-chart-table-wrap">
            <table className="classic-size-chart-table">
              <thead>
                <tr className="classic-size-chart-head">
                  <th className="classic-size-chart-cell">Size</th>
                  <th className="classic-size-chart-cell">Chest</th>
                  <th className="classic-size-chart-cell">Length</th>
                  <th className="classic-size-chart-cell">Sleeve</th>
                </tr>
              </thead>
              <tbody className="classic-size-chart-body">
                <tr><td className="classic-size-chart-data classic-size-chart-bold">SMALL</td><td className="classic-size-chart-data">36-38</td><td className="classic-size-chart-data">26</td><td className="classic-size-chart-data">32</td></tr>
                <tr><td className="classic-size-chart-data classic-size-chart-bold">MEDIUM</td><td className="classic-size-chart-data">39-41</td><td className="classic-size-chart-data">27</td><td className="classic-size-chart-data">33</td></tr>
                <tr><td className="classic-size-chart-data classic-size-chart-bold">LARGE</td><td className="classic-size-chart-data">42-44</td><td className="classic-size-chart-data">28</td><td className="classic-size-chart-data">34</td></tr>
                <tr><td className="classic-size-chart-data classic-size-chart-bold">XLARGE</td><td className="classic-size-chart-data">46-48</td><td className="classic-size-chart-data">29</td><td className="classic-size-chart-data">35</td></tr>
                <tr><td className="classic-size-chart-data classic-size-chart-bold">2XLARGE</td><td className="classic-size-chart-data">50-52</td><td className="classic-size-chart-data">30</td><td className="classic-size-chart-data">36</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Major Cart buttons */}
      <button
        onClick={handleInnerAddToCart}
        disabled={!state.size}
        className="classic-cart-button"
      >
        <ShoppingBag size={15} className="classic-cart-button-icon" />
        <span>Add to Cart & Order Jacket</span>
      </button>

      {/* Share with friends referral segment */}
      <div className="classic-share-section">
        <div className="classic-share-header">
          <Mail size={14} className="classic-share-icon" />
          <h4 className="classic-share-title">Send Config to a Friend</h4>
        </div>
        
        <form onSubmit={handleShareEmail} className="classic-share-form">
          <input
            type="text"
            required
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Email Subject *"
            className="classic-share-input"
          />
          <div className="classic-share-input-group">
            <input
              type="email"
              required
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              placeholder="Your Email *"
              className="classic-share-input"
            />
            <input
              type="email"
              required
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="Friend's Email *"
              className="classic-share-input"
            />
          </div>

          <button
            type="submit"
            disabled={referring}
            className="classic-share-submit"
          >
            {referring ? 'Sending Invitation...' : 'Send Referral Link'}
          </button>
        </form>

        {emailSent && (
          <div className="classic-share-success">
            Custom configuration shared successfully! Check inbox.
          </div>
        )}
      </div>

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