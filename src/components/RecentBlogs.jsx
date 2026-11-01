import React from 'react';
// React Icons import karein (agar install nahi hain to: npm i react-icons)
import { FaArrowRight, FaRegCalendar, FaRegClock } from 'react-icons/fa';
import './RecentBlogs.css'

const RecentBlogs = ({ blogsSectionRef }) => {
  // Sample Data (Agar parent component se aa raha hai to aap isey remove kar sakte hain)
  const recentBlogs = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
      tag: "Design",
      date: "June 15, 2026",
      readTime: "5 Min Read",
      title: "The Future of Soft Luxury Minimalism in Modern SaaS Aesthetics",
      excerpt: "Explore how premium brands are shifting towards clean layouts, fine typography, and high-contrast accents to capture sophisticated audiences."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
      tag: "Lifestyle",
      date: "May 28, 2026",
      readTime: "8 Min Read",
      title: "Crafting Premium Experiences: A Deep Dive into Curated Collections",
      excerpt: "An editorial look into our design philosophy, blending gold accents with deep navy hues to establish instant visual trust and high prestige."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
      tag: "Business",
      date: "May 12, 2026",
      readTime: "4 Min Read",
      title: "Why High-Contrast Visual Elements Drive Digital Engagement",
      excerpt: "Striking the perfect balance between absolute simplicity and tactical bold micro-interactions inside modern high-end user interfaces."
    }
  ];

  return (
    <section ref={blogsSectionRef} className="v-maker-editorial-blogs-section">
      <div className="v-maker-blogs-container">
        {/* Header Row */}
        <div className="v-maker-blogs-header-row">
          <div className="v-maker-blogs-header-left">
            <span className="v-maker-section-pill-tag">The Journal</span>
            <h2 className="v-maker-section-display-title">Our Recent Blogs</h2>
          </div>
          <button className="v-maker-view-all-journal-btn">
            Explore All Journal <FaArrowRight />
          </button>
        </div>

        {/* Asymmetric Grid */}
        <div className="v-maker-blogs-asymmetric-grid">
          {recentBlogs.map((blog) => (
            <div key={blog.id} className="v-maker-blog-card">
              {/* Image Frame */}
              <div className="v-maker-blog-img-frame">
                <img src={blog.image} alt={blog.title} />
                <span className="v-maker-blog-floating-tag">{blog.tag}</span>
              </div>

              {/* Card Details */}
              <div className="v-maker-blog-card-details">
                <div className="v-maker-blog-meta-stamps">
                  <span className="v-maker-meta-stamp-item">
                    <FaRegCalendar /> {blog.date}
                  </span>
                  <span className="v-maker-meta-stamp-item">
                    <FaRegClock /> {blog.readTime}
                  </span>
                </div>
                
                <h3 className="v-maker-blog-title-link">{blog.title}</h3>
                <p className="v-maker-blog-excerpt-text">{blog.excerpt}</p>
                
                {/* Read Full Perspective Trigger */}
                <div className="v-maker-blog-action-trigger">
                  <span className="v-maker-trigger-text">Read Full Perspective</span>
                  <div className="v-maker-trigger-circle">
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentBlogs;