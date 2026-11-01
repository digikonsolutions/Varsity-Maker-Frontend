import { useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {useSelector, useDispatch} from 'react-redux';
import {fetchcollections} from '../slices/collections/collectionsslice.jsx';
import {storageurl} from '../constants/baseurls.jsx';

import cat1 from "../assets/cat1.png";
import cat2 from "../assets/cat2.png";
import cat3 from "../assets/cat3.png";

import cat4 from "../assets/cat4.png";
import cat5 from "../assets/cat5.png";
import cat6 from "../assets/cat6.png";

gsap.registerPlugin(ScrollTrigger);

const IconArrow = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
  >
    <path
      d="M7 17L17 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 7h8v8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function splitText(text) {
  return text.split("").map((char, i) => (
    <span className="char" key={i}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

/* ================= CARD ================= */
function CategoryCard({ img, hoverImg, kicker, title }) {
  return (
    <div className="cat-card3d">
      <div className="cat-imgWrap catSwap">
        <img className="cat-img catImgBase" src={img} alt={title} />
        <img className="cat-img catImgHover" src={hoverImg || img} alt={title} />
      </div>

      <div className="cat-bottom">
        <div className="cat-content">
          <div className="cat-kicker">{kicker}</div>

          <div className="cat-title card-text">
            {title}
          </div>
        </div>

        <span className="cat-ic">
          <IconArrow className="catArrow" />
        </span>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */
export default function Categories() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const dispatch = useDispatch();

  const { items = [], loading, error } = useSelector(
    (state) => state.collections
  );

  useEffect(() => {
    dispatch(fetchcollections());
  }, [dispatch]);



useLayoutEffect(() => {
  if (!items.length) return;

  const timeout = setTimeout(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current;

      gsap.set(cards, {
        opacity: 0,
        x: -120,
        rotateY: 20,
        rotateX: 8,
        filter: "blur(10px)",
        transformPerspective: 1200,
      });

      gsap.set(".heading-text .char, .sub-text .char, .card-text .char", {
        opacity: 0,
        y: 30,
        rotateX: 90,
        display: "inline-block",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          scrub: 1,
        },
      });

      tl.to(".heading-text .char", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.03,
      });

      tl.to(".sub-text .char", {
        opacity: 1,
        y: 0,
      });

      tl.to(cards, {
        opacity: 1,
        x: 0,
        rotateY: 0,
        rotateX: 0,
        filter: "blur(0px)",
        stagger: 0.2,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, 100); // 👈 small delay

  return () => clearTimeout(timeout);

}, [items]);

  return (
    <section className="cats" ref={sectionRef}>
      <div className="cats-inner">

        {/* ================= HEADING ================= */}

        <h2 className="cats-heading heading-text">
          {splitText("OUR CATEGORIES")}
        </h2>


        <p className="cats-sub sub-text">
          {"Endless choices, perfectly sorted"}
        </p>


        <div className="cats-grid">
  {loading && <p>Loading categories...</p>}

  {error && <p>Error loading categories</p>}

 {items?.slice(0,3).map((it, idx) => (
  <div key={it.id}>
    <CategoryCard
      img={`${storageurl}/${it.image}`}
      hoverImg={it.hover_image || it.image}
      kicker={it.name}
      title={it.name}
    />
  </div>
))}
</div>

      </div>
    </section>
  );
}