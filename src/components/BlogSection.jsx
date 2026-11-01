import React, { useState, useEffect } from "react";
import { FaUser, FaClock, FaSearch, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux';
import {fetchallcategoriesthunk} from '../slices/blogcategories/blogcategoriesslice.jsx';
import {storageurl} from '../constants/baseurls.jsx';
import './BlogSection.css';

import img1 from "../assets/blog1.jpg";
import img2 from "../assets/blog2.jpg";
import img3 from "../assets/blog3.jpg";
import img4 from "../assets/blog4.jpg";
import img5 from "../assets/blog5.jpg";
import img6 from "../assets/blog6.jpg";

export const blogs = [
  {
    id: 1,
    tag: "LIFESTYLE",
    title: "The Art of Living in a Maximalist World",
    desc: "Embracing bold fashion choices that reflect confidence and individuality.",
    content:
      "This article explores how bold fashion and intentional styling create a sense of individuality in modern life.",
    author: "Elena Vance",
    read: "6 min read",
    date: "Oct 12, 2023",
    img: img1,
  },
  {
    id: 2,
    tag: "LIFESTYLE",
    title: "Fashion: More Than Just a Trend",
    desc: "Exploring how varsity-inspired styles are becoming more ethical and conscious.",
    content:
      "Sustainable fashion is no longer optional—it represents responsibility, ethics, and creativity.",
    author: "Julian Thorne",
    read: "8 min read",
    date: "Oct 10, 2023",
    img: img2,
  },
  {
    id: 3,
    tag: "LIFESTYLE",
    title: "Morning Rituals of the World's Most Creative Minds",
    desc: "How creatives start their day with focus, style, and self-expression.",
    content:
      "Morning rituals often shape productivity and creativity for successful individuals.",
    author: "Marcus Aurel",
    read: "5 min read",
    date: "Oct 08, 2023",
    img: img3,
  },
  {
    id: 4,
    tag: "LIFESTYLE",
    title: "The Architecture of Silence: Designing for Peace",
    desc: "Minimal spaces inspired by varsity aesthetics and modern calm living.",
    content:
      "Designing peaceful environments improves mental clarity and emotional balance.",
    author: "Sarah Chen",
    read: "10 min read",
    date: "Oct 05, 2023",
    img: img4,
  },
  {
    id: 5,
    tag: "LIFESTYLE",
    title: "Journeys: Finding Soul in Style",
    desc: "Street culture flavors that match the energy of urban varsity lifestyle.",
    content:
      "Street food tells stories of culture, heritage, and unforgettable experiences.",
    author: "David Park",
    read: "7 min read",
    date: "Oct 02, 2023",
    img: img5,
  },
  {
    id: 6,
    tag: "LIFESTYLE",
    title: "Digital Detox: Reclaiming Attention Span",
    desc: "Balancing digital life with a clean, focused varsity-inspired mindset.",
    content:
      "Reducing screen time helps improve concentration and supports intentional living.",
    author: "Elena Vance",
    read: "9 min read",
    date: "Sep 28, 2023",
    img: img6,
  },
];

const BlogSection = () => {
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  const {items, error, loading} = useSelector(
    (state) => state.blogcategories
  )
  console.log('categories bro', items);

  useEffect(() => {
    dispatch(fetchallcategoriesthunk());
  }, [dispatch]);


  const categories = items?.data || [];

 const filteredCategories = categories.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <section className="blog-section">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search blog categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="blog-grid">
        {filteredCategories.map((item) => (
          <Link
            to={`/blog/categories/${item.id}`}
            key={item.id}
            className="blog-link"
          >
            <div className="blog-card">
              <div className="blog-img">
                <img src={`${storageurl}${item.image}`} alt={item.title} />
                {/* <span className="tag">{item.author.name}</span> */}
              </div>

              <div className="blog-content">
                <div className="meta">
                  <span className="meta-item">
                    <FaUser className="icon" />
                    {item.author.name}
                  </span>

                  <span className="meta-item">
                    
                  </span>
                </div>

                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="blog-footer">
                  <div className="publish-time-tag"><FaClock className="icon" /><span>
  {new Date(item.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}
</span></div>
                  <span className="read-more">
  Read More <FaArrowRight />
</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;