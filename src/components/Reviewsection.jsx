// src/components/ReviewSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {SubmitreviewAPI } from '../slices/reviews/reviewsslice.jsx';
import {getsubmittedreviewthunk} from '../slices/reviews/getsubmittedreview.jsx';
import {Addreviewreplythunk} from '../slices/reviewreply/addreviewreply.jsx';
import ReviewForm  from './Reviewform.jsx';
import ReviewCard  from './Reviewcard.jsx';
import ToastContainer from './Toast.jsx';
import './Reviewsection.css';

const StarSVG = ({ filled }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      className={filled ? '' : 'empty'}
      fill={filled ? 'var(--gold)' : 'var(--dark-muted)'}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
       style={{ width: 28, height: 28 }}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

let toastId = 0;

export default function ReviewSection({productId}) {
  const [reviews, setReviews]       = useState([]);
  const [avgRating, setAvgRating]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts]         = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");

  const addToast = (message, type = 'success') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
  };

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);


  const headerStars = Array.from({ length: 5 }, (_, i) => (
    <StarSVG key={i} filled={i < Math.round(avgRating)} />
  ));


  const dispatch = useDispatch();
  const {
  loading: reviewLoading,
  item,
  error,
} = useSelector((state) => state.submitreview);

const handleSubmitReview = async (formData) => {
  try {
    setSubmitting(true);

    const resultAction = await dispatch(
      SubmitreviewAPI({
        id: productId,
        name: formData.name,
        email: formData.email,
        comment: formData.comment,
        rating: formData.rating,
      })
    );

    if (SubmitreviewAPI.fulfilled.match(resultAction)) {

  const newReview = resultAction.payload?.data ?? resultAction.payload;
if (!newReview?.id) {
  addToast("Review save hua par response empty", "error");
  return false;
}
setReviews((prev) => [newReview, ...prev]);
  console.log("New review", newReview);

  setReviews((prev) => [newReview, ...prev]);

  const updatedReviews = [newReview, ...reviews];

  const avg =
    updatedReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
    updatedReviews.length;

  setAvgRating(avg.toFixed(1));

  addToast("Review Reply submitted successfully!", "success");

  return true;
} else {
      addToast(error || "Failed to submit review", "error");
      return false;
    }

  } catch (err) {
    addToast("Something went wrong", "error");

  } finally {
    setSubmitting(false);
  }
};

useEffect(() => {
  if (!productId) return;

  const fetchReviews = async () => {
    setLoading(true);

    const result = await dispatch(
      getsubmittedreviewthunk(productId)
    );

    if (getsubmittedreviewthunk.fulfilled.match(result)) {
  const data = result.payload?.data || [];

  setReviews(data);

  const avg =
    data.length > 0
      ? data.reduce((sum, r) => sum + Number(r.rating), 0) /
        data.length
      : 0;

  setAvgRating(avg.toFixed(1));

    }

    setLoading(false);
  };

  fetchReviews();
}, [productId]);

const handleDeleteReview = () => {};

const handleAddReply = async (reviewId, payload) => {
  const safeName = String(payload?.name ?? "").trim();
  const safeReply = String(payload?.replyText ?? "").trim();
  console.log(reviewId);

  console.log("DEBUG PAYLOAD:", payload); // 🔥 ADD THIS

  if (!safeName || !safeReply) {
    addToast("Reply name and text required", "error");
    return null;
  }

  const resultAction = await dispatch(
    Addreviewreplythunk({
      reviewId,
      name: safeName,
      replyText: safeReply,
    })
  );

  if (Addreviewreplythunk.fulfilled.match(resultAction)) {
    return resultAction.payload?.data;
  }

  return null;
};

const canDelete = false;


  return (
    <section className="review-section">
      {/* ---- Header ---- */}
      <div className="review-header">
        <div className="review-header-left">
          <p className="review-subtitle">Customer Feedback</p>
          <h2>
            What People <span>Say</span>
          </h2>
        </div>

        <div className="review-stats">
          <div className="stat-rating-big">{avgRating || '—'}</div>
          <div className="stat-stars">{headerStars}</div>
          <div className="stat-count">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="review-divider" />

      <ReviewForm onSubmit={handleSubmitReview} isLoading={submitting} />

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <span>Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <MessageIcon />
          </div>
          <h3 className="empty-title">No Reviews Yet</h3>
          <p className="empty-desc">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {Array.isArray(reviews) && reviews.map((review, i) => (
            <div key={review.id} style={{ animationDelay: `${i * 60}ms` }}>
<ReviewCard
  review={review}
  onDelete={handleDeleteReview}
onAddReply={(reviewId, payload) =>
  handleAddReply(reviewId, payload)
}
  canDelete={canDelete}
/>
            </div>
          ))}
        </div>
      )}

      {/* ---- Toasts ---- */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </section>
  );
}