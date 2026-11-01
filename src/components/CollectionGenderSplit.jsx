import React from "react";

export default function CollectionGenderSplit() {
  return (
    <section className="collectionGenderSplit">
      <div className="collectionGenderSplit-inner">
        <div className="collectionGenderSplit-grid collectionGenderShift">
          {/* MEN CARD */}
          <article className="collectionGenderCard">
            <img
              src="/collection-men.jpeg"
              alt="Men's Collection"
              className="collectionGenderCard-img"
            />

            <div className="collectionGenderCard-overlay">
              <h3 className="collectionGenderCard-title">Men's Collection</h3>

              <a href="#" className="collectionGenderBtn collectionGenderBtnFilled collectionGenderMenBtn">
                <span>SHOP MEN</span>
                <span className="collectionGenderArrow">→</span>
              </a>
            </div>
          </article>

          {/* WOMEN CARD */}
          <article className="collectionGenderCard">
            <img
              src="/collection-women.jpeg"
              alt="Women's Collection"
              className="collectionGenderCard-img"
            />

            <div className="collectionGenderCard-overlay">
              <h3 className="collectionGenderCard-title">Women's Collection</h3>

              <a href="#" className="collectionGenderBtn collectionGenderBtnOutline collectionGenderWomenBtn">
                <span>SHOP WOMEN</span>
                <span className="collectionGenderArrow">→</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}