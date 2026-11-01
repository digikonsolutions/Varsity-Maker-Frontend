import React, { useState, useEffect } from "react";
import { FaUser, FaClock, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux';
import {FetchblogsbycategoryidAPI} from '../slices/blogsbycategoryid/blogsbycategoryidslice.jsx';
import {storageurl} from '../constants/baseurls.jsx';


const blogs = [
  {
    id: 1,
    category: "LIFESTYLE",
    image: "/blogdetail1.jfif",
    time: "6 min read",
    author: "Elena Vance",
    title: "The Art of Minimalist Living in a Digital Age",
    desc: "Discover how stripping your digital environment can lead to a more focused and fulfilling creative life.",
    date: "March 15, 2024",
  },
  {
    id: 2,
    category: "DESIGN",
    image: "/blogdetail2.jfif",
    time: "8 min read",
    author: "Julian Thorne",
    title: "Architectural Wonders: Where History Meets Modernity",
    desc: "Exploring the structures that bridge the gap between ancient heritage and futuristic design.",
    date: "March 12, 2024",
  },
  {
    id: 3,
    category: "ENVIRONMENT",
    image: "/blogdetail3.jfif",
    time: "10 min read",
    author: "Sarah Chen",
    title: "The Future of Sustainable Urban Planning",
    desc: "How cities are evolving to climate change through green spaces and renewable energy integration.",
    date: "March 10, 2024",
  },
  {
    id: 4,
    category: "PHOTOGRAPHY",
    image: "/blogdetail4.jfif",
    time: "5 min read",
    author: "Marcus Aurelius",
    title: "Mastering the Craft of Narrative Photography",
    desc: "Learn the techniques used by world-class photojournalists to tell stories through a single, powerful frame.",
    date: "March 8, 2024",
  },
  {
    id: 5,
    category: "INTERIOR",
    image: "/blogdetail5.jfif",
    time: "7 min read",
    author: "Isabella Ross",
    title: "The Psychology of Color in Interior Design",
    desc: "Understanding how different hues influence our mood and productivity within the spaces we inhabit every day.",
    date: "March 5, 2024",
  },
  {
    id: 6,
    category: "TRAVEL",
    image: "/blogdetail6.jfif",
    time: "9 min read",
    author: "Luca Moretti",
    title: "Culinary Journeys: The Hidden Gems of Mediterranean Cuisine",
    desc: "A deep dive into the traditional recipes and local ingredients that define the rich flavors of the Mediterranean coast.",
    date: "March 2, 2024",
  },
];


const LatestInsights = ({id}) => {

  console.log("category id:", id);

  const dispatch = useDispatch();

  const { items, loading, error } = useSelector(
    (state) => state.blogsbycategory
  );

  useEffect(() => {
    if (id) {
      dispatch(FetchblogsbycategoryidAPI({id}));
    }
  }, [dispatch, id]);

  const [sortOption, setSortOption] = useState("Newest");
  const [activeCategory, setActiveCategory] = useState("ALL POSTS");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const blogData = items?.length ? items : [];

  const filteredBlogs =
    activeCategory === "ALL POSTS"
      ? blogData
      : blogData.filter((b) => b.category === activeCategory);

  const searchedBlogs = filteredBlogs.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedBlogs = [...searchedBlogs].sort((a, b) => {
    if (sortOption === "Newest") {
      return new Date(b.date) - new Date(a.date);
    }
    if (sortOption === "Oldest") {
      return new Date(a.date) - new Date(b.date);
    }
    if (sortOption === "ReadTime") {
      return parseInt(a.time) - parseInt(b.time);
    }
    return 0;
  });

  

  return (
    <>
      {/* <div className="blog-category-nav">
        <ul className="blog-category-list">
          {categories.map((cat) => (
            <li
              key={cat}
              className={activeCategory === cat ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div> */}


      <section className="latest-insights">


        <div className="li-header">

   
          <div className="li-search-bar">
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        
          <div className="sort">
            <label>Sort by:</label>

            <div className="select-wrapper">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="ReadTime">Read Time</option>
              </select>

              <FaChevronDown className="dropdown-icon" />
            </div>
          </div>

        </div>

        <div className="li-grid">
          {sortedBlogs.map((blog) => (
            <div
              className="li-card"
              key={blog.id}
              onClick={() => navigate(`/blog/singleblog/${blog.id}`)} 
              style={{ cursor: "pointer" }}
            >
              <div className="li-img">
                <img src={`${storageurl}${blog.featured_image}`} alt="" />
                <span className="li-category">{blog.category.name || 'no category'}</span>
              </div>

              <div className="li-content">
                <div className="li-meta">
                  <span>
                    <FaClock className="icon" />
                    {blog.reading_time} Min
                  </span>

                  <span>
                    <FaUser className="icon" />
                    {blog.author.name}
                  </span>
                </div>

                <h3>{blog.title}</h3>
                <p>{blog.short_content}</p>

                <div className="li-footer">
                  <span>{new Date(blog.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}</span>

                 
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blog/singleblog/${blog.id}`);
                    }}
                    style={{ color: "#000", cursor: "pointer" }}
                  >
                    Read More →
                  </span>

                </div>
              </div>
            </div>
          ))}
        </div>


      </section>
    </>
  );
};

export default LatestInsights;