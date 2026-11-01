import React from 'react';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaFacebookF, FaYoutube } from 'react-icons/fa';
import './StudentCommunity.css';

const StudentCommunity = () => {
  return (
    <section className="v-maker-premium-cta-section">
      {/* Decorative Grid Line System underneath */}
      <div className="v-maker-grid-blueprint-overlay"></div>
      
      <div className="v-maker-premium-cta-container">
        
        {/* Modern Social Proof Trust Pill */}
        <div className="v-maker-trust-badge-pill">
          <div className="v-maker-avatar-group-mesh">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Active Elite Student" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Active Elite Student" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Active Elite Student" />
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="Active Elite Student" />
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80" alt="Active Elite Student" />
          </div>
          
          <div className="v-maker-trust-meta-text">
            <h4>Join 10,000+ students</h4>
            <p>who trust Varsity Maker</p>
          </div>
          
          <div className="v-maker-pill-ambient-shimmer"></div>
        </div>

        {/* Dynamic Typography Header Suite */}
        <div className="v-maker-premium-cta-content">
          <span className="v-maker-premium-tag">The Varsity Locker Room</span>
          
          <h2 className="v-maker-premium-display-title">
            Join the community
          </h2>
          
          <p className="v-maker-premium-prose-description">
            Join our 1,000,000+ person community of elite student designers, creators, and athletes to unlock premium varsity custom kits and exclusive team drop mechanics.
          </p>
        </div>

        {/* --- NEW: Modern Reels Grid Section --- */}
        <div className="v-maker-reels-grid">
          {/* Reel 1 */}
          <div className="v-maker-reel-card">
            <div className="v-maker-reel-video-wrapper">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80" alt="Varsity Kit Unboxing Reel" />
              <div className="v-maker-reel-overlay">
                <button className="v-maker-reel-play-btn" aria-label="Play Reel">
                  <FiPlay />
                </button>
                <div className="v-maker-reel-meta">
                  <span>@alex_creator</span>
                  <p>Unboxing the Winter Drop 🔥</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reel 2 */}
          <div className="v-maker-reel-card">
            <div className="v-maker-reel-video-wrapper">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80" alt="Custom Jersey Design Process" />
              <div className="v-maker-reel-overlay">
                <button className="v-maker-reel-play-btn" aria-label="Play Reel">
                  <FiPlay />
                </button>
                <div className="v-maker-reel-meta">
                  <span>@jess_varsity</span>
                  <p>How we styled custom kits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reel 3 */}
          <div className="v-maker-reel-card">
            <div className="v-maker-reel-video-wrapper">
              <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80" alt="Athletes Fit Check" />
              <div className="v-maker-reel-overlay">
                <button className="v-maker-reel-play-btn" aria-label="Play Reel">
                  <FiPlay />
                </button>
                <div className="v-maker-reel-meta">
                  <span>@team_v_maker</span>
                  <p>Locker room fit check ⚡</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* --- End of Reels Grid --- */}

        {/* Luxury Execution Trigger Action System with Social Links Row */}
        <div className="v-maker-cta-trigger-block">
          <div className="v-maker-action-interactive-row">
            <button className="v-maker-prime-action-button">
              <span>Start for free</span>
              <FiArrowRight className="v-maker-prime-btn-arrow" />
            </button>

            <div className="v-maker-social-divider-line"></div>

            <div className="v-maker-social-icon-deck">
              <a href="#instagram" className="v-maker-social-icon-link" aria-label="Instagram Channel">
                <FaInstagram />
              </a>
              <a href="#tiktok" className="v-maker-social-icon-link" aria-label="TikTok Hub">
                <FaTiktok />
              </a>
              <a href="#facebook" className="v-maker-social-icon-link" aria-label="Facebook Space">
                <FaFacebookF />
              </a>
              <a href="#youtube" className="v-maker-social-icon-link" aria-label="YouTube Channel">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StudentCommunity;