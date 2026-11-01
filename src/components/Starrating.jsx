// src/components/StarRating.jsx
import React from 'react';
import './Reviewsection.css';

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      className={filled ? 'star-filled' : 'star-empty'}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

/**
 * StarRating — display-only stars
 * @param {number} rating  - 1–5
 * @param {number} max     - total stars (default 5)
 */
export default function StarRating({ rating = 0, max = 5 }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(rating)} />
      ))}
      <span className="rating-badge">{Number(rating).toFixed(1)}</span>
    </div>
  );
}