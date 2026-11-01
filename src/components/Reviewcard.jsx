// src/components/ReviewCard.jsx
import React, { useState, useEffect } from 'react';
import StarRating from './Starrating.jsx';
import ReplyForm  from './Replyform.jsx';
import './Reviewsection.css';

/* ---- Small icon helpers ---- */
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
         m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

/* ---- Avatar initials ---- */
function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

/* ---- Relative time ---- */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * ReviewCard — renders a single review with its replies
 * @param {object}   review        - review data
 * @param {function} onDelete      - async fn(reviewId)
 * @param {function} onAddReply    - async fn(reviewId, {name, reply})
 * @param {boolean}  canDelete     - show delete button
 */
export default function ReviewCard({ review, onDelete, onAddReply, canDelete = true }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [replyLoading, setReplyLoading]   = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [localReplies, setLocalReplies]   = useState(review.replies || []);

  const replyCount = localReplies.length;

  const handleDelete = async () => {
    if (!window.confirm('Delete this review and all its replies?')) return;
    setDeleting(true);
    await onDelete(review.id);
    setDeleting(false);
  };

  useEffect(() => {
  setLocalReplies(review.replies || []);
}, [review.replies]);

const handleReplySubmit = async (data) => {
  setReplyLoading(true);

  const newReply = await onAddReply(review.id, {
    name: data.name,
    replyText: data.reply,
  });

  if (newReply) {
    setLocalReplies((prev) => [...prev, newReply]);
    setRepliesOpen(true);
    setReplyFormOpen(false);
  }

  setReplyLoading(false);
};

  return (
    <div className="review-card">
      <div className="review-card-body">
        {/* Top meta */}
        <div className="review-meta">
          <div className="review-user">
            <div className="avatar">{getInitials(review.name)}</div>
            <div>
              <div className="user-info-name">{review.name}</div>
              <div className="user-info-date">
                {review.created_at ? timeAgo(review.created_at) : 'Recently'}
              </div>
            </div>
          </div>

          {canDelete && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete review"
            >
              <TrashIcon />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} />

        {/* Comment */}
        <p className="review-comment">{review.comment}</p>

        {/* Actions */}
        <div className="review-actions">
          {/* Replies toggle */}
          <button
            className="reply-toggle-btn"
            onClick={() => setRepliesOpen((o) => !o)}
          >
            <ChevronIcon open={repliesOpen} />
            Replies
            {replyCount > 0 && (
              <span className="reply-count-badge">{replyCount}</span>
            )}
          </button>

          {/* Reply form toggle */}
          <button
            className="reply-toggle-btn"
            onClick={() => {
              setReplyFormOpen((o) => !o);
              if (!repliesOpen && replyCount > 0) setRepliesOpen(true);
            }}
            style={{ marginLeft: 8 }}
          >
            <ReplyIcon />
            {replyFormOpen ? 'Cancel' : 'Reply'}
          </button>
        </div>
      </div>

      {/* Replies panel */}
      {(repliesOpen || replyFormOpen) && (
        <div className="replies-section">
          {/* Replies list */}
          {repliesOpen && localReplies.length === 0 && !replyFormOpen && (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 12 }}>
              No replies yet.
            </p>
          )}

          {repliesOpen && localReplies.length > 0 && (
            <div className="replies-list">
              {localReplies.map((r) => (
                <div key={r.id} className="reply-card">
                  <div className="reply-avatar">{getInitials(r.name)}</div>
                  <div className="reply-content">
                    <div>
                      <span className="reply-name">{r.name}</span>
                      <span className="reply-date">
                        {r.created_at ? timeAgo(r.created_at) : 'Recently'}
                      </span>
                    </div>
                    <p className="reply-text">{r.reply}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyFormOpen && (
            <ReplyForm
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyFormOpen(false)}
              isLoading={replyLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}