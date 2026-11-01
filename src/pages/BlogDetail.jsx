import React from "react";
import { useParams } from "react-router-dom";
import { blogs } from "../components/BlogSection";
import LatestInsights from "../components/LatestInsights"; 
import NewsletterSignup from "../components/NewsletterSignup";
import Newslettersection from '../components/NewsletterSection';
import './BlogDetail.css'


const BlogDetail = () => {
  const { id } = useParams();
  console.log(id);

  const blog = blogs.find((item) => item.id === parseInt(id));

  if (!blog) {
    return <h2>Blog not found</h2>;
  }

  const words = blog.title.split(" ");
  const highlight = words.slice(-2).join(" ");
  const normalText = words.slice(0, -2).join(" ");

  return (
    <>
      {/* Hero Section */}
     <section className="premium-blog-hero">
      {/* Cinematic Background Image (Replace with your varsity / product image) */}
      <img 
        src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1800&q=80" 
        alt="Premium Editorial Background" 
        className="premium-hero-bg-img"
      />

      {/* Smooth gradient shadow overlay for high readability */}
      <div className="premium-hero-fade-overlay"></div>

      <div className="premium-blog-container">
        <div className="premium-blog-content">
          {/* Glassmorphic Badge */}
          <span className="premium-badge">{blog.tag}</span>

          {/* Majestic Bold Editorial Title */}
          <h1>
            {normalText} <br />
            <span className="premium-title-highlight">{highlight}</span>
          </h1>

          {/* Clean Light-Gray Balanced Paragraph */}
          <p>{blog.desc}</p>

          {/* Sleek Minimalist CTA Buttons */}
          <div className="premium-buttons">
            <button className="primary-btn">
              <span>Start Reading</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="secondary-btn">Explore More</button>
          </div>
        </div>
      </div>
    </section>
      <LatestInsights id = {id} />
      <Newslettersection />
    </>
  );
};

export default BlogDetail;