import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ThankYouPage.css';

export default function ThankYouPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const trackingNumber = localStorage.getItem("tracking_number");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2 seconds baad normal state
  };

  return (
    <div className="tyContainer">
      <div className="tyCard animateFadeUp">
        
        {/* Premium Geometric Checkmark Badge */}
        <div className="tyIconSuccess animateScaleIn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Header Metadata */}
        <span className="tySubHeader">Order Verified</span>
        <h1 className="tyTitle">Thank you for your order!</h1>
        <p className="tyDescription">
          Your payment was successful and your order has been logged into our system. We are crafting and processing your premium parcel right now.</p>

        {/* Minimalist Visual Separator */}
        <div className="tyDividerWrapper">
          <div className="tyDividerLine"></div>
          <span className="tyDividerDot"></span>
          <div className="tyDividerLine"></div>
        </div>

        {/* High-Contrast Tracking Container */}
        <div className="tyTrackingBox">
          <div className="tyTrackingHeader">
            <span className="tyLabel">LOGISTICS COURIER KEY</span>
            <span className="tyBadgeStatus">DISPATCH READY</span>
          </div>
          
          <div className="tyTrackingValueRow">
            <code className="tyTrackingCode">{trackingNumber}</code>
            <button 
              onClick={handleCopyToClipboard} 
              className={`tyCopyBtn ${copied ? 'copiedState' : ''}`}
              type="button"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="copySvgIcon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="copySvgIcon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.197 0-.392.002-.586.007M15.75 22.5l-1.5-1.5m0 0l-1.5 1.5m1.5-1.5v-3.375c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m11.25 0v1.125c0 .621-.504 1.125-1.125 1.125H9.75M8.25 21h4.5M21 3.75v3.375c0 .621-.504 1.125-1.125 1.125H16.5M21 3.75l-3.375 3.375M21 3.75v3.375c0 .621-.504 1.125-1.125 1.125" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          
          <p className="tyInfoText">⚡ Paste this tracking number into our dispatch page to see real-time updates.</p>
        </div>

        {/* Clean Info Grid */}
        <div className="tyInfoGrid">
          <div className="tyInfoItem">
            <h4>Fulfillment Window</h4>
            <p>3 - 5 Business Days</p>
          </div>
          <div className="tyInfoItem">
            <h4>Need Assistance?</h4>
            <p>Our support team is active 24/7.</p>
          </div>
        </div>

        {/* High-End Brand Buttons */}
        <div className="tyActionContainer">
          <button onClick={() => navigate('/orders')} className="tyBtnSecondary">
            Track Shipment Status
          </button>
          <button onClick={() => navigate('/')} className="tyBtnPrimary">
            Continue Premium Store
          </button>
        </div>

      </div>
    </div>
  );
}