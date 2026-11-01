// src/components/ReplyForm.jsx
import React, { useState } from 'react';
import './Reviewsection.css';

const INITIAL = { name: '', reply: '' };

/**
 * ReplyForm — inline form to post a reply to a review
 * @param {function} onSubmit  - async fn({name, reply})
 * @param {function} onCancel  - close the form
 * @param {boolean}  isLoading
 */
export default function ReplyForm({ onSubmit, onCancel, isLoading }) {
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name required';
    if (!form.reply.trim()) errs.reply = 'Reply cannot be empty';
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
    <div className="reply-form-wrapper">
      <p className="reply-form-title">Add a Reply</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="reply-form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={set('name')}
              maxLength={100}
            />
            {errors.name && (
              <span style={{ fontSize: 10, color: 'var(--danger)' }}>{errors.name}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reply</label>
            <input
              className="form-input"
              type="text"
              placeholder="Write your reply…"
              value={form.reply}
              onChange={set('reply')}
              maxLength={1000}
            />
            {errors.reply && (
              <span style={{ fontSize: 10, color: 'var(--danger)' }}>{errors.reply}</span>
            )}
          </div>
        </div>

        <div className="reply-form-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Posting…' : 'Post Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}