// src/components/StarRatingInput.jsx
import React, { useState } from 'react';
import './Reviewsection.css';

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      className={filled ? 'star-filled' : 'star-empty'}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

/**
 * StarRatingInput — interactive star picker
 * @param {number}   value    - current rating (1–5)
 * @param {function} onChange - called with new rating value
 */
export default function StarRatingInput({ value = 0, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="star-rating-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <StarIcon filled={n <= active} />
        </button>
      ))}
      <span className="star-label">
        {LABELS[active] || 'Select rating'}
      </span>
    </div>
  );
}