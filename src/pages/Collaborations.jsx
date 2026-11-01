import React from 'react';
import './Collaborations.css';
import TestimonailBanner from '../components/TestimonialBanner.jsx';

// Mock data representing the premium collaborative collection pieces
const collaborationItems = [
  { id: 1, title: 'Golden Bear x J.Crew Studded Letterman', image: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80' },
  { id: 2, title: 'Union Los Angeles x Needles', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80' },
  { id: 3, title: 'Schott NYC x Engineered Garments', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80' },
  { id: 4, title: 'Human Made x Undercover Last Orgy 2', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80' },
  { id: 5, title: 'Stüssy x Denim Tears Type 1 Jacket', image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&auto=format&fit=crop&q=80' },
  { id: 6, title: 'Kith x TaylorMade Golden Bear Varsity', image: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80' },
  { id: 7, title: 'Supreme x Junya Watanabe CDG Man', image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80' },
  { id: 8, title: 'Palace x Engineered Garments Varsity', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80' },
  { id: 9, title: 'A Bathing Ape x OVO Varsity Classic', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80' },
  { id: 10, title: 'Billionaire Boys Club x Neighborhood', image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&auto=format&fit=crop&q=80' },
  { id: 11, title: 'Noah x Barbour Bedale Waxed Varsity', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80' },
  { id: 12, title: 'Fragment Design x Cactus Jack by Travis Scott', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80' },
];

const Collaborations = () => {
  return (
    <><div className="collabs-page-wrapper">
      {/* Editorial Hero Banner */}
      <header className="collabs-hero-section">
        <div className="collabs-hero-overlay">
          <h1 className="collabs-hero-title">Collaborations</h1>
          <p className="collabs-hero-subtitle">ARCHIVE — EXPLORING CURATED PARTNERSHIPS AND HISTORIC DESIGN CROSSOVERS</p>
        </div>
      </header>

      {/* Intro Text Block */}
      <section className="collabs-intro-container">
        <p className="collabs-intro-text">
          Bridging the gap between heritage craftsmanship and modern streetwear. Each piece represents a unique narrative, blending our signature varsity silhouettes with global creative visionaries.
        </p>
        <div className="collabs-section-divider"></div>
        <h2 className="collabs-grid-heading">Our Collaborations</h2>
      </section>

      {/* 3-Column Image Layout Grid */}
      <main className="collabs-grid-container">
        {collaborationItems.map((item) => (
          <div key={item.id} className="collabs-grid-card">
            <div className="collabs-image-wrapper">
              <img src={item.image} alt={item.title} className="collabs-card-img" />
              <div className="collabs-text-gradient-overlay">
                <h3 className="collabs-card-title">{item.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </main>
      

     
    </div>
    <TestimonailBanner/>
    
    </>
    
    
  );
};

export default Collaborations;