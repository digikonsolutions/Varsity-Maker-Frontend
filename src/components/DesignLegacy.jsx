import React from "react";

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" className="designLegacy-miniIcon" aria-hidden="true">
    <path
      d="M12 3.5c-4.9 0-8.8 3.6-8.8 8.1 0 4.1 3.2 7.1 7.2 7.1H12a1.7 1.7 0 0 0 0-3.4h-1.1a1.4 1.4 0 0 1 0-2.8h1.6c4.6 0 8.3-3.4 8.3-7.5S16.9 3.5 12 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="8.2" cy="10" r="1" fill="currentColor" />
    <circle cx="11.2" cy="7.6" r="1" fill="currentColor" />
    <circle cx="15.1" cy="8.4" r="1" fill="currentColor" />
    <circle cx="16.3" cy="12.1" r="1" fill="currentColor" />
  </svg>
);

const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" className="designLegacy-miniIcon" aria-hidden="true">
    <circle cx="6.5" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="6.5" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M8.4 8.4 19 3.8M8.4 15.6 19 20.2M9 9.4l4.5 4.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TapeIcon = () => (
  <svg viewBox="0 0 24 24" className="designLegacy-miniIcon" aria-hidden="true">
    <path
      d="M8.5 5.5h5.1a3.9 3.9 0 0 1 3.9 3.9v5.1a3.9 3.9 0 0 1-3.9 3.9H8.5a2.5 2.5 0 0 1-2.5-2.5V8a2.5 2.5 0 0 1 2.5-2.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M10 9.2h4.2M10 12h2.8M10 14.8h4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export default function DesignLegacy() {
  return (
    <section className="designLegacy">
      <div className="designLegacy-inner">
        <div className="designLegacy-left">
          <h2 className="designLegacy-title">
            Design Your
            <br />
            Own Legacy
          </h2>

          <p className="designLegacy-text">
            Choose your wool, leather, and ribbing. Add custom embroidery to
            create a truly one-of-a-kind varsity jacket.
          </p>

          <div className="designLegacy-features">
            <div className="designLegacy-feature">
              <span className="designLegacy-featureIconWrap">
                <PaletteIcon />
              </span>
              <span className="designLegacy-featureText">50+ COLORS</span>
            </div>

            <div className="designLegacy-feature">
              <span className="designLegacy-featureIconWrap">
                <ScissorsIcon />
              </span>
              <span className="designLegacy-featureText">CUSTOM FIT</span>
            </div>

            <div className="designLegacy-feature">
              <span className="designLegacy-featureIconWrap">
                <TapeIcon />
              </span>
              <span className="designLegacy-featureText">SIZE GUIDE</span>
            </div>
          </div>

          <a href="#" className="designLegacy-btn">
            START CUSTOMIZING
          </a>
        </div>

        <div className="designLegacy-right">
          <div className="designLegacy-imageWrap">
            <img
              src="/design-legacy.jpeg"
              alt="Design your own legacy"
              className="designLegacy-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}