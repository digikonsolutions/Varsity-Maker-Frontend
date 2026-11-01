import React from "react";

const steps = [
  {
    number: "01",
    title: "Material Selection",
    text: "We source the finest melton wool and premium leather for every varsity jacket we craft.",
  },
  {
    number: "02",
    title: "Precision Cutting",
    text: "Every panel is hand-cut by master tailors to ensure a clean silhouette and exact fit.",
  },
  {
    number: "03",
    title: "Master Assembly",
    text: "Each piece is assembled with expert stitching and finished with refined detailing.",
  },
];

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="handcraftedProcess-playIcon" aria-hidden="true">
    <path d="M9 7.5v9l7-4.5-7-4.5Z" fill="currentColor" />
  </svg>
);

export default function HandcraftedProcess() {
  return (
    <section className="handcraftedProcess">
      <div className="handcraftedProcess-inner">
        <div className="handcraftedProcess-left">
          <p className="handcraftedProcess-kicker">THE PROCESS</p>

          <h2 className="handcraftedProcess-title">
            Handcrafted
            <br />
            Excellence
          </h2>

          <div className="handcraftedProcess-steps">
            {steps.map((step) => (
              <div className="handcraftedProcess-step" key={step.number}>
                <div className="handcraftedProcess-stepNo">{step.number}</div>

                <div className="handcraftedProcess-stepLine"></div>

                <div className="handcraftedProcess-stepContent">
                  <h3 className="handcraftedProcess-stepTitle">{step.title}</h3>
                  <p className="handcraftedProcess-stepText">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="#" className="handcraftedProcess-link">
            EXPLORE OUR WORKSHOP
            <span className="handcraftedProcess-linkArrow">→</span>
          </a>
        </div>

        <div className="handcraftedProcess-right">
          <div className="handcraftedProcess-imageWrap">
            <img
              src="/handcrafted-process.webp"
              alt="Handcrafted process"
              className="handcraftedProcess-image"
            />

            <button className="handcraftedProcess-playBtn" aria-label="Play video">
              <PlayIcon />
            </button>

            <span className="handcraftedProcess-ring handcraftedProcess-ringTop"></span>
            <span className="handcraftedProcess-ring handcraftedProcess-ringBottom"></span>
          </div>
        </div>
      </div>
    </section>
  );
}