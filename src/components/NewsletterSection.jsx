import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from 'react-redux';
import {SubscribeourcommunityThunk} from '../slices/subscription/subscriptionslice.jsx';
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const NewsletterSection = () => {

 const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubscribe = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      const res = await dispatch(SubscribeourcommunityThunk(email));

      // success toast
      toast.success("Subscribed successfully 🎉");

      setEmail("");
    } catch (error) {
      toast.error("Subscription failed ❌");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="newsletter-section">
      <div className="newsletter-left">
       

        <h2 className="newsletter-title">
          Elevate Your <span>Perspective</span>
        </h2>

        <p className="newsletter-text">
          Join our curated community of modern enthusiasts.
          <br />
          Receive weekly dispatches on high-end design, wellness,
          and cultural insights.
        </p>

        {/* <div className="newsletter-trust">
          <div className="avatar-group">
            <img src="https://i.pravatar.cc/40?img=1" alt="user" />
            <img src="https://i.pravatar.cc/40?img=2" alt="user" />
            <img src="https://i.pravatar.cc/40?img=3" alt="user" />
            <span className="plus-count">+12K</span>
          </div>
          <p>Trusted by 12,000+ readers worldwide</p>
        </div> */}
      </div>

      <div className="newsletter-right">
        <p className="input-label">YOUR EMAIL ADDRESS</p>

        <input
          type="email"
          placeholder="support@example.com"
          className="newsletter-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

       <button
  className="newsletter-btn"
  onClick={handleSubscribe}
  disabled={loading}
>
  {loading ? (
    <>
      <FaSpinner className="spin" /> Subscribing...
    </>
  ) : (
    "Join the Inner Circle ✈"
  )}
</button>

        <p className="newsletter-note">
          • NO SPAM. ONLY CURATED EXCELLENCE. UNSUBSCRIBE ANYTIME.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;