import React from "react";

const products = [
  {
    id: 1,
    image: "/elitegrid1.webp",
    title: "Classic All Black Varsity Jacket Leather Sleeves",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 2,
    image: "/elitegrid2.webp",
    title: "Black Wool Body Gold Leather Sleeves Letterman Jacket",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 3,
    image: "/elitegrid3.webp",
    title: "Black and White Varsity Jacket with Leather Sleeves",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 4,
    image: "/elitegrid4.webp",
    title: "Red Wool Body Gold Leather Sleeves Letterman Jacket",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 5,
    image: "/elitegrid5.webp",
    title: "Navy Wool Body White Leather Sleeves Varsity Jacket",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 6,
    image: "/elitegrid6.webp",
    title: "Green Wool Body White Leather Sleeves Letterman Jacket",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 7,
    image: "/elitegrid7.webp",
    title: "Grey and Black Varsity Jacket Leather Sleeves",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
  {
    id: 8,
    image: "/elitegrid8.webp",
    title: "Royal Blue Varsity Jacket White Leather Sleeves",
    oldPrice: "$200",
    newPrice: "$80",
    badge: "60% OFF",
  },
];

export default function EliteGrid() {
  return (
    <section className="eliteGrid">
      <div className="eliteGrid-inner">
        <div className="eliteGrid-cards">
          {products.map((product) => (
            <article className="eliteGrid-card" key={product.id}>
              <div className="eliteGrid-imgWrap">
                <span className="eliteGrid-badge">{product.badge}</span>

                <img
                  src={product.image}
                  alt={product.title}
                  className="eliteGrid-img"
                />
              </div>

              <div className="eliteGrid-body">
                <h3 className="eliteGrid-title">{product.title}</h3>

                <div className="eliteGrid-prices">
                  <span className="eliteGrid-oldPrice">{product.oldPrice}</span>
                  <span className="eliteGrid-newPrice">{product.newPrice}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}