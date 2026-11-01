import React from "react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ text = "LOADING..." }) {
  return (
    <div className="embedded-loading-container">
      <div className="modern-spinner"></div>
      <p className="modern-loading-text">{text.toUpperCase()}</p>
    </div>
  );
}