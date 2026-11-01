// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import StarRatingInput from './Starratinginput.jsx';
import './Reviewsection.css';

const PenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const INITIAL = { name: '', comment: '', rating: 0, email: '', };


export default function ReviewForm({ onSubmit, isLoading }) {
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));


  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.comment.trim()) errs.comment = 'Comment is required';
    if (!form.rating)         errs.rating  = 'Please select a rating';
    if (!form.email.trim()) {
  errs.email = 'Email is required';
}
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const ok = await onSubmit(form);
    if (ok) setForm(INITIAL);
  };

  return (
    <div className="review-form-wrapper">
      <h3 className="form-title">
        Leave a <span>Review</span>
      </h3>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name & Rating row */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              maxLength={100}
            />
            {errors.name && (
              <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
  <label className="form-label">Email</label>

  <input
    className="form-input"
    type="email"
    placeholder="john@example.com"
    value={form.email}
    onChange={set('email')}
  />

  {errors.email && (
    <span style={{ fontSize: 11, color: 'var(--danger)' }}>
      {errors.email}
    </span>
  )}
</div>

          <div className="form-group">
            <label className="form-label">Rating</label>
            <StarRatingInput
              value={form.rating}
              onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
            />
            {errors.rating && (
              <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                {errors.rating}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea
            className="form-textarea"
            placeholder="Share your experience with this product..."
            value={form.comment}
            onChange={set('comment')}
            maxLength={1000}
          />
          {errors.comment && (
            <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
              {errors.comment}
            </span>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'right' }}>
            {form.comment.length} / 1000
          </span>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            <PenIcon />
            {isLoading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}