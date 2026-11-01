import React from "react";
import BlogSection from "../components/BlogSection";
import NewsletterSection from "../components/NewsletterSection";
import './Blog.css';

const Blog = () => {
  return (
    <main>
      {/* Hero Section */}
     <section className="ct-cinema-hero">
      {/* Cinematic Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1800&q=80" 
        alt="Varsity Collection Lifestyle" 
        className="ct-cinema-bg"
      />
      
      {/* Smooth Dark Gradient Overlay for perfect text readability */}
      <div className="ct-cinema-overlay"></div>

      <div className="ct-cinema-container">
        <div className="ct-cinema-content">
          
          {/* Transparent Minimal Tag */}
          <span className="ct-cinema-tag">Varsity Collection</span>

          {/* Clean Sans-Serif Elegant Title */}
          <h1 className="ct-cinema-title">
            Modern Lifestyle
          </h1>

          {/* Balanced High-contrast Description */}
          <p className="ct-cinema-desc">
            Discover the culture, trends, and styling inspirations behind
            varsity jackets — designed for those who carry confidence and
            timeless street elegance.
          </p>

          {/* Minimalist Slider Dots */}
          <div className="ct-cinema-dots">
            <span className="ct-dot active"></span>
            <span className="ct-dot"></span>
            <span className="ct-dot"></span>
          </div>

        </div>
      </div>
    </section>

      {/* Blog Section */}
      <BlogSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </main>
  );
};

export default Blog;