import React from "react";

const products = [
  {
    id: 1,
    badge: "80% OFF",
    badgeType: "red",
    image: "/bestseller1.webp",
    fit: "CLASSIC FIT",
    title: "The Albany - Black Melton Wool Varsity Baseball Jacket",
    price: "$745.99",
    oldPrice: null,
    reviews: "(166 reviews)",
    stock: "3 UNITS IN STOCK",
  },
  {
    id: 2,
    badge: "",
    badgeType: "",
    image: "/bestseller2.webp",
    fit: "CLASSIC FIT",
    title: "The Portola - Melton Navy Wool Varsity Baseball Jacket",
    price: "$625.50",
    oldPrice: null,
    reviews: "(84 reviews)",
    stock: "12 UNITS IN STOCK",
  },
  {
    id: 3,
    badge: "SPECIAL OFFER",
    badgeType: "gold",
    image: "/bestseller3.webp",
    fit: "CONTEMPORARY FIT",
    title: "The Albany - Forest Green & Stone Leather Varsity",
    price: "$595.99",
    oldPrice: "$725.00",
    reviews: "(22 reviews)",
    stock: "5 UNITS IN STOCK",
  },
];

export default function BestSellerElite() {
  return (
    <section className="bestSellerElite">
      <div className="bestSellerElite-inner">
        <div className="bestSellerElite-head">
          <div>
            <p className="bestSellerElite-kicker">THE FAVORITES</p>
            <h2 className="bestSellerElite-title">Best Sellers</h2>
          </div>

          <a href="#" className="bestSellerElite-viewAll">
            VIEW ALL BEST SELLERS
          </a>
        </div>

        <div className="bestSellerElite-grid">
          {products.map((product) => (
            <article className="bestSellerElite-card" key={product.id}>
              <div className="bestSellerElite-imgWrap">
                {product.badge ? (
                  <span
                    className={`bestSellerElite-badge ${
                      product.badgeType === "gold"
                        ? "bestSellerElite-badgeGold"
                        : "bestSellerElite-badgeRed"
                    }`}
                  >
                    {product.badge}
                  </span>
                ) : null}

                <img
                  src={product.image}
                  alt={product.title}
                  className="bestSellerElite-img"
                />
              </div>

              <div className="bestSellerElite-body">
                <p className="bestSellerElite-fit">{product.fit}</p>

                <h3 className="bestSellerElite-productTitle">{product.title}</h3>

                <div className="bestSellerElite-priceRow">
                  <span className="bestSellerElite-price">{product.price}</span>
                  {product.oldPrice ? (
                    <span className="bestSellerElite-oldPrice">{product.oldPrice}</span>
                  ) : null}
                </div>

                <div className="bestSellerElite-ratingRow">
                  <span className="bestSellerElite-stars">★★★★☆</span>
                  <span className="bestSellerElite-reviews">{product.reviews}</span>
                </div>

                <p className="bestSellerElite-stock">{product.stock}</p>

                <div className="bestSellerElite-actions">
               <button className="bestSellerElite-btn bestSellerElite-btnGold">
  <svg
    className="bestSellerElite-customIcon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M4 20l4.2-1 9.3-9.3a1.6 1.6 0 0 0 0-2.3l-.9-.9a1.6 1.6 0 0 0-2.3 0L5 15.8 4 20Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 7.5l3 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  <span>START CUSTOMIZATION</span>
</button>
 
                  <button className="bestSellerElite-btn bestSellerElite-btnNavy">
                    🛒 ADD TO CART
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}