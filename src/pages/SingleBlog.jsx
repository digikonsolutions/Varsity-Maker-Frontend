import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaLayerGroup, FaClock, FaDiscord, FaTwitter, FaShareAlt, FaRegBookmark, FaUserCircle,FaLeaf, FaPenNib,FaGlobe, FaCamera, FaHome, FaPlane  } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { getsingleblogAPIthunk } from "../slices/singleblogbyid/getsingleblogbyid.jsx";
import {getlatestblogsthunk} from '../slices/latestblogs/latestblogsslice.jsx';
import {fetchcollections} from '../slices/collections/collectionsslice.jsx';
import {storageurl} from '../constants/baseurls.jsx';
import Newslettersection from '../components/NewsletterSection.jsx'; 
import FAQs from '../components/FAQ.jsx';



const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const getReadingMessage = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes === 0)
    return `you've been immersed for ${totalSeconds} second${totalSeconds !== 1 ? "s" : ""}.`;
  return `you've been immersed for ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
};



const SingleBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [seconds, setSeconds] = useState(0);
  const [showShare, setShowShare] = useState(false);
const newsletterRef = useRef(null);
  
 const handleMemberClick = () => {
  newsletterRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

 const { items, loading, error } = useSelector(
  (state) => state.singleblog

);

const latestBlogs = useSelector((state) => state.latestblogs.items);
useEffect(() => {
  dispatch(getlatestblogsthunk());
}, [dispatch]);

const latestcollections = useSelector(
  (state) => state.collections?.items || []
);
useEffect(() => {
  dispatch(fetchcollections());
}, [dispatch]);
const blog = items;


const handleShare = () => {
  setShowShare((prev) => !prev);
};

const handleCopy = async () => {
  const url = window.location.href;

  try {
    await navigator.clipboard.writeText(url);
    setShowShare(false); // auto close
  } catch (err) {
    prompt("Copy this link:", url);
  }
};

useEffect(() => {
  if (id) dispatch(getsingleblogAPIthunk(id));
}, [dispatch, id]);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="error-container">
        <h2>Loading...</h2>
      </div>
    );
  }

if (!blog) {
  return (
    <div className="error-container">
      <h2>Blog not found!</h2>
      <button onClick={() => navigate("/blog")}>Back</button>
    </div>
  );
}

  const readingMins = parseInt(blog.reading_time) || 5;
  const publishedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  return (
    <>
      <div className="single-blog-page">
        <div className="single-blog-container">

          {/* LEFT CONTENT */}
          <div className="single-blog-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft /> BACK TO JOURNAL
            </button>

            <div className="blog-meta-top">
              <span className="meta-tag">{blog?.category?.name}</span>
              {publishedDate && <span>{publishedDate}</span>}
              {publishedDate && blog.reading_time && <span>•</span>}
              {blog.reading_time && <span>{blog.reading_time} min read</span>}
            </div>

            <h1 className="single-blog-title">{blog.title}</h1>

            <div className="author-row">
              <div class="author-info">
                <FaUserCircle size={40} />
                <div>
                  <h4>{blog?.author?.name}</h4><p>Content Writer</p>
                  </div>
                </div>
             <div className="blog-actions">
  <FaShareAlt
    onClick={handleShare}
    style={{ cursor: "pointer" }}
  />
</div>

{showShare && (
  <div className="share-bar">
    <input
      type="text"
      value={window.location.href}
      readOnly
      onClick={(e) => e.target.select()}
    />

    <button onClick={handleCopy}>Copy</button>
  </div>
)}
            </div>

            {blog.featured_image && (
              <div className="hero-image">
                <img
                  src={`${storageurl}${blog.featured_image}`}
                  alt={blog.title}
                />
              </div>
            )}

            {blog.excerpt && <blockquote>"{blog.excerpt}"</blockquote>}

            {blog.content && (
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="single-blog-sidebar">
            <div className="reading-card">
              <div className="reading-top">
                <span>READING SESSION</span>
                <FaClock />
              </div>
              <h2>{formatTime(seconds)}</h2>
              <p>{getReadingMessage(seconds)}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((seconds / (readingMins * 60)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="sidebar-card categories-card">
              <h3>Explore Categories</h3>

    {latestcollections?.length > 0 ? (
    latestcollections.slice(0, 4).map((cat, index) => (
      <div
        key={cat.id || index}
        className="category-item"
        style={{ cursor: "pointer" }}
      >
        <div>
          { <FaLayerGroup />}
          <span style={{ marginLeft: "8px" }}>{cat.name}</span>
        </div>

        <span>{cat.count || 1}</span>
      </div>
    ))
  ) : (
    <p>No categories found</p>
  )}
</div>
            <div className="sidebar-card community-card">
              <h3>Join Our Community</h3>
              <p>Connect with 5,000+ artisans and thinkers in our private digital sanctuary.</p>
              <div className="community-buttons">
               
              </div>
              <button className="member-btn" onClick={handleMemberClick}>
  <HiOutlineUsers /> Become a Member
</button>
            </div>

            <div className="trending-card">
              <h5>TRENDING BLOGS</h5>
              <div className="trending-list">
                {latestBlogs?.slice(0, 3).map((item) => (
                  <div key={item.number} className="trending-item">
                    <span className="trending-number">{item.number}</span>
                    <span className="trending-title">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div ref={newsletterRef}>
  <Newslettersection />
</div>
<FAQs/>
    </>
  );
};

export default SingleBlog;