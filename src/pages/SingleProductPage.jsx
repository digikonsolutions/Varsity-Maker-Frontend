import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaRegCirclePlay,
  FaPlay,
} from "react-icons/fa6";
import { LuRuler } from "react-icons/lu";
import "./SingleProductPage.css";
import { useParams } from "react-router-dom";
import ProductDetailGift from "../components/ProductDetailGiftsec";
import ProductDetailReviews from "../components/ProductDetailReviews";
import ProductDetailGallery from "../components/ProductDetailGallery";
import { fetchsingleproduct } from "../slices/products/singleproductslice.jsx";
import ReviewSection from '../components/Reviewsection.jsx';

import Sizefinderpopup from '../components/SizeFinderPopup.jsx';

// Import Cart Utilities
import { addToCart } from '../slices/cart/cartSlice.jsx';
import CartDrawer from './CartDrawer.jsx';
import {storageurl} from '../constants/baseurls.jsx';

const ProductDetail = () => {


  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) dispatch(fetchsingleproduct(id));
  }, [id, dispatch]);

  const { item } = useSelector((state) => state.singleproduct);

  const productVideo = item?.video_url || "/product-video.mp4";
  const videoThumbnail = "/vid.jpg";
  const mainimageforcart = item?.gallery_images[0];
  console.log(mainimageforcart);


 const galleryImages =
  typeof item?.gallery_images === "string"
    ? JSON.parse(item.gallery_images)
    : item?.gallery_images || [];

const productImages =
  galleryImages.length > 0
    ? galleryImages.map((img) =>
        img.startsWith("http")
          ? img
          : `${storageurl}${img}`
      )
    : [];


  const slides = [
    ...productImages.map((img) => ({ type: "image", src: img })),
    { type: "video", src: productVideo, thumbnail: videoThumbnail },
  ];

  // COLORS (API fallback)
  const colors = item?.colors
    ? item.colors.split(",").map((c) => c.trim())
    : ["navy", "olive", "blue"];

  // SIZES (API fallback)
  const sizes = item?.sizes
    ? item.sizes.split(",").map((s) => s.trim())
    : [
        "XS (US 34)",
        "S (US 36-38)",
        "M (US 40)",
        "L (US 42-44)",
        "XL (US 46)",
        "2XL (US 48-50)",
        "3XL (US 52)",
        "4XL (US 54-56)",
      ];

  // State Management
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M (US 40)");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "navy");
  const [wantsEmbroidery, setWantsEmbroidery] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    specifications: false,
    shipping: false,
    care: false,
    sizeFit: false,
  });

  const videoRef = useRef(null);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThumbnailClick = (index) => {
    setCurrentSlideIndex(index);
    if (videoRef.current) videoRef.current.pause();
  };

  const handlePrevSlide = () => {
    if (videoRef.current) videoRef.current.pause();
    setCurrentSlideIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    if (videoRef.current) videoRef.current.pause();
    setCurrentSlideIndex((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  // 🔥 Handle Add To Cart Strategy Execution
  const handleAddToCartClick = () => {
    console.log("🛒 item:", item);
    if (!item) {
      console.log("Please Select item.");
      return;
    }

    const basePrice = Number(String(item.price || 0).replace(/[^0-9.]/g, ""));
    const embroideryCost = wantsEmbroidery ? 5000 : 0;
    const finalPrice = basePrice + embroideryCost;

    const structuredPayload = {
      id: item.id || item._id || id,
      name: item.name || "NASHVILLE QUILTED GREEN WINDBREAKER JACKET",
      price: finalPrice,
      main_image: mainimageforcart,
      selectedColor: selectedColor,
      sizes: item.sizes,
      selectedSize: selectedSize,
      hasEmbroidery: wantsEmbroidery,
      quantity: 1
    };
    

    console.log("🛒 dispatching payload:", structuredPayload);
    dispatch(addToCart(structuredPayload));
    setCartOpen(true);
};

  const currentSlide = slides[currentSlideIndex];

  return (
    <>
      <div className="productDetailPage-wrapper">
        <div className="productDetailPage-container">

          {/* LEFT SECTION */}
          <div className="productDetailPage-gallery">
            <div className="productDetailPage-thumbnailColumn">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`productDetailPage-thumbnailBox ${
                    currentSlideIndex === index
                      ? "productDetailPage-activeThumb"
                      : ""
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {slide.type === "image" ? (
                    <img
                      src={slide.src}
                      alt=""
                      className="productDetailPage-thumbImg"
                    />
                  ) : (
                    <div className="productDetailPage-videoThumbnail">
                      {!thumbnailError ? (
                        <img
                          src={slide.thumbnail}
                          alt="Video"
                          className="productDetailPage-videoThumbImg"
                          onError={() => setThumbnailError(true)}
                        />
                      ) : (
                        <div className="productDetailPage-videoPlaceholder">
                          <FaPlay className="productDetailPage-playIconLarge" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="productDetailPage-mainImageWrapper">
              {currentSlide.type === "image" && (
                <span className="productDetailPage-discountBadge">
                  {item?.price && item?.discount_price && item.price > 0
                    ? `${Math.round(
                        ((item.price - item.discount_price) / item.price) * 100
                      )}% OFF`
                    : ""}
                </span>
              )}

              <button
                className="productDetailPage-sliderArrow productDetailPage-leftArrow"
                onClick={handlePrevSlide}
              >
                <FaChevronLeft />
              </button>

              {currentSlide.type === "image" ? (
                <img
                  src={currentSlide.src}
                  alt=""
                  className="productDetailPage-mainImage"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="productDetailPage-mainVideo"
                  controls
                  autoPlay
                  key={currentSlide.src}
                >
                  <source src={currentSlide.src} type="video/mp4" />
                </video>
              )}

              <button
                className="productDetailPage-sliderArrow productDetailPage-rightArrow"
                onClick={handleNextSlide}
              >
                <FaChevronRight />
              </button>

              <div className="productDetailPage-slideCounter">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="productDetailPage-info">
            <h1 className="productDetailPage-title">
              {item?.name || "NASHVILLE QUILTED GREEN WINDBREAKER JACKET"}
            </h1>

            <div className="productDetailPage-priceRow">
              <span className="productDetailPage-newPrice">
                {item?.price ? `Rs.${item.price}` : "Rs.28,800.00 PKR"}
              </span>

              <span className="productDetailPage-oldPrice">
                {(Number(item?.discount_price) + Number(item?.price)).toFixed(2)}
              </span>
            </div>

            <p className="productDetailPage-shippingText">
              FREE SHIPPING AND 30 DAYS TO RETURN
            </p>

            {/* COLORS */}
            <div className="productDetailPage-colorSection">
              <p className="productDetailPage-sectionLabel">COLOR: {selectedColor.toUpperCase()}</p>
              <div className="productDetailPage-colorOptions">
                {colors.map((c, i) => (
                  <span
                    key={i}
                    className={`productDetailPage-colorCircle ${
                      selectedColor === c ? "productDetailPage-activeColorCircle" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* EMBROIDERY */}
            <div className="productDetailPage-embroideryWrapper">
              <div className="productDetailPage-embroideryRow">
                <div className="productDetailPage-embroideryLeft">
                  <input
                    type="checkbox"
                    className="productDetailPage-embroideryCheckbox"
                    checked={wantsEmbroidery}
                    onChange={(e) => setWantsEmbroidery(e.target.checked)}
                  />
                  <span>Custom Name / Initials Embroidery</span>
                </div>

                <div className="productDetailPage-embroideryPrice">
                  <span>Rs.5,000.00</span>
                  <small>Rs. 8,000.00</small>
                </div>
              </div>

              <button className="productDetailPage-virtualBtn">
                VIRTUAL TRY ON{" "}
                <FaRegCirclePlay className="productDetailPage-virtualIcon" />
              </button>

              <>
              <button onClick={() => setOpen(true)} className="productDetailPage-virtualBtn">
                Find My Size{" "}
                <LuRuler className="productDetailPage-virtualIcon" />
              </button>

              <Sizefinderpopup open={open} onClose={() => setOpen(false)} />
              </>
            </div>

            {/* SIZES */}
            <div className="productDetailPage-sizeGrid">
              {sizes.map((size, index) => (
                <button
                  key={index}
                  className={`productDetailPage-sizeBtn ${
                    selectedSize === size ? "productDetailPage-activeSize" : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* ADD TO CART ACTION */}
            <button 
              className="productDetailPage-cartBtn"
              onClick={handleAddToCartClick}
            >
              ADD TO CART
            </button>

            {/* ACCORDIONS */}
            <div className="productDetailPage-accordionItem" onClick={() => toggleSection("specifications")}>
              <span>SPECIFICATIONS</span>
              {openSections.specifications ? <FaMinus /> : <FaPlus />}
            </div>
            {openSections.specifications && (
              <div className="productDetailPage-accordionContent">
                {item?.specifications ? (
                  <div className="productDetailPage-specBox">
                    <pre className="productDetailPage-specText">{item.specifications}</pre>
                  </div>
                ) : (
                  <ul className="productDetailPage-specList">
                    <li>Classic Fit Varsity Style</li>
                    <li>Premium Wool & Leather</li>
                    <li>Imported Quality</li>
                  </ul>
                )}
              </div>
            )}

            <div className="productDetailPage-accordionItem" onClick={() => toggleSection("care")}>
              <span>CARE DETAILS</span>
              {openSections.care ? <FaMinus /> : <FaPlus />}
            </div>
            {openSections.care && (
              <div className="productDetailPage-accordionContent">
                {item?.care_details ? (
                  <p>{item.care_details}</p>
                ) : (
                  <ul>
                    <li>Professional dry clean only</li>
                    <li>Do not wash or tumble dry</li>
                    <li>Store in cool dry place</li>
                  </ul>
                )}
              </div>
            )}

            <div className="productDetailPage-accordionItem" onClick={() => toggleSection("shipping")}>
              <span>SHIPPING & RETURNS</span>
              {openSections.shipping ? <FaMinus /> : <FaPlus />}
            </div>
            {openSections.shipping && (
              <div className="productDetailPage-accordionContent">
                <p><strong>Delivery:</strong> 3–5 days</p>
                <p><strong>Returns:</strong> 30 days</p>
              </div>
            )}

            <div className="productDetailPage-accordionItem" onClick={() => toggleSection("sizeFit")}>
              <span>SIZE & FIT</span>
              {openSections.sizeFit ? <FaMinus /> : <FaPlus />}
            </div>
            {openSections.sizeFit && (
              <div className="productDetailPage-accordionContent">
                <ul>
                  <li>Regular fit</li>
                  <li>True to size</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDetailGift />
      <ProductDetailReviews />
      <ProductDetailGallery />
      <ReviewSection productId={id}/>

      {/* 🔥 Render CartDrawer component dynamically */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default ProductDetail;