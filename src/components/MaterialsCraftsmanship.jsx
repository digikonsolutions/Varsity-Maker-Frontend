import React from "react";

const points = [
  {
    title: "24oz Melton Wool",
    text: "Our heavy-duty wool provides unmatched warmth and a structure that holds its shape for decades.",
  },
  {
    title: "Naked Cowhide",
    text: "Premium top-grain leather that hasn't been sanded or buffed, preserving its natural strength and character.",
  },
  {
    title: "Custom Knit Ribbing",
    text: "Heavyweight wool-blend ribbing that won't pill or lose elasticity, even after years of wear.",
  },
];

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="materialsCraftsmanship-playIcon" aria-hidden="true">
    <path d="M9 7.5v9l7-4.5-7-4.5Z" fill="currentColor" />
  </svg>
);

const BulletIcon = () => (
  <svg viewBox="0 0 24 24" className="materialsCraftsmanship-bulletIcon" aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M9.4 12.2l1.7 1.7 3.6-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function MaterialsCraftsmanship() {
  return (
    <section className="materialsCraftsmanship">
      <div className="materialsCraftsmanship-inner">
        <div className="materialsCraftsmanship-left">
          <p className="materialsCraftsmanship-kicker">THE GOLDEN STANDARD</p>

          <h2 className="materialsCraftsmanship-title">
            Materials &amp;
            <br />
            Craftsmanship
          </h2>

          <p className="materialsCraftsmanship-text">
            We believe in the beauty of the handmade. Every jacket is a masterpiece
            of material science and traditional tailoring.
          </p>

          <div className="materialsCraftsmanship-list">
            {points.map((item) => (
              <div className="materialsCraftsmanship-item" key={item.title}>
                <div className="materialsCraftsmanship-bullet">
                  <BulletIcon />
                </div>

                <div className="materialsCraftsmanship-itemContent">
                  <h3 className="materialsCraftsmanship-itemTitle">{item.title}</h3>
                  <p className="materialsCraftsmanship-itemText">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="materialsCraftsmanship-right">
          <div className="materialsCraftsmanship-imageWrap">
            <img
              src="/materials-craftsmanship.webp"
              alt="Materials and craftsmanship"
              className="materialsCraftsmanship-image"
            />

            <button className="materialsCraftsmanship-playBtn" aria-label="Play video">
              <PlayIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}