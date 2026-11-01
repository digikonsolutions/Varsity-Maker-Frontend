// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';
import './Reviewsection.css';

const CheckIcon = () => (
  <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2700);
    const t2 = setTimeout(() => onRemove(toast.id), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  return (
    <div className={`toast ${toast.type} ${exiting ? 'exiting' : ''}`}>
      <div className="toast-dot" />
      {toast.type === 'success' ? <CheckIcon /> : <XIcon />}
      <span className="toast-msg">{toast.message}</span>
    </div>
  );
}

/**
 * ToastContainer — renders list of toasts
 * @param {Array}    toasts   - [{id, type, message}]
 * @param {function} onRemove - called with toast id to remove
 */
export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}