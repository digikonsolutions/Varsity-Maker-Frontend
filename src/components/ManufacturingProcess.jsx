import React from 'react';
import './ManufacturingProcess.css';

const ManufacturingProcess = () => {
  const steps = [
    {
      id: 1,
      title: 'DESIGN & DEVELOPMENT',
      description: 'We bring your ideas to life with expert design and material selection.',
      image: './design-development.png',
    },
    {
      id: 2,
      title: 'SAMPLING',
      description: 'Precision samples for fit, quality and performance approval.',
      image: './sampling.png',
    },
    {
      id: 3,
      title: 'PRODUCTION',
      description: 'Advanced manufacturing with strict quality standards.',
      image: './production.png',
    },
    {
      id: 4,
      title: 'QUALITY CONTROL',
      description: 'Multi-step inspection to ensure every piece is perfect.',
      image: './quality_control.png',
    },
    {
      id: 5,
      title: 'PACKING & SHIPPING',
      description: 'Secure packaging and on-time delivery anywhere in the world.',
      image: './packing.png',
    },
  ];

  return (
    <section className="mfg-section">
      <div className="mfg-container">
        
        {/* Header Section */}
        <header className="mfg-header">
          <h2 className="mfg-title">
            OUR MANUFACTURING <span className="mfg-title-highlight">PROCESS</span>
          </h2>
          <p className="mfg-subtitle">
            Transparent. Efficient. Quality every step.
          </p>
        </header>

        {/* Steps Grid Layout */}
        <div className="mfg-grid">
          {steps.map((step, index) => (
            <div key={step.id} className="mfg-step-card">
              
              {/* Image Wrapper */}
              <div className="mfg-image-container">
                <img
                  src={step.image}
                  alt={step.title}
                  className="mfg-image"
                />
                {/* Step Number Badge */}
                <div className="mfg-badge">{step.id}</div>
              </div>

              {/* Text Content */}
              <div className="mfg-content">
                <h3 className="mfg-step-title">{step.title}</h3>
                <p className="mfg-step-description">{step.description}</p>
              </div>

              {/* Next Step Connection Arrow */}
              {index < steps.length - 1 && (
                <div className="mfg-arrow-connector">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ManufacturingProcess;