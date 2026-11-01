import React from "react";
import Stats from "../components/Stats";
import BestSellerElite from "../components/BestSellerElite";
import CollectionGenderSplit from "../components/CollectionGenderSplit";
import EliteGrid from "../components/EliteGrid";
import HandcraftedProcess from "../components/HandcraftedProcess";
import MaterialsCraftsmanship from "../components/MaterialsCraftsmanship";
import DesignLegacy from "../components/DesignLegacy";
import Community from "../components/Community";
import TestimonialBanner from "../components/TestimonialBanner";
import HelpCenter from "../components/HelpCenter";
import OnTheGram from "../components/OnTheGram";

export default function EliteCollectionPage() {
  return (
    <main className="eliteHeroPage">
      <section className="eliteHero">
        <div className="eliteHero-grid">
          <div className="eliteHero-left">
            <div className="eliteHero-topline">
              <span className="eliteHero-meta">COLLECTION 01</span>
              <span className="eliteHero-line"></span>
              <span className="eliteHero-meta">SF / CA</span>
            </div>

            <h1 className="eliteHero-title">
              <span className="eliteHero-titleMain">Varsity</span>
              <span className="eliteHero-titleAccent">Elite</span>
            </h1>

            <p className="eliteHero-text">
              Where heritage meets the horizon. Handcrafted varsity jackets built
              with century-old techniques and modern silhouettes.
            </p>

            <div className="eliteHero-actions eliteShift">
              <a href="#" className="eliteBtn eliteBtnPrimary eliteShop">
                SHOP THE DROP
              </a>

              <a href="#" className="eliteBtn eliteBtnGhost eliteStudio">
                CUSTOM STUDIO
              </a>
            </div>

            <div className="eliteHero-footerMeta">
              <div className="eliteHero-footerLine"></div>

              <div className="eliteHero-batch">
                <span>BATCH NO. 2026-01</span>
                <span>LIMITED TO 100 UNITS</span>
              </div>
            </div>
          </div>

          <div className="eliteHero-right">
            <div className="eliteHero-imageWrap">
              <img
                src="/elite-hero.jpeg"
                alt="Varsity Elite Jacket"
                className="eliteHero-image"
              />

              <div className="eliteHero-stamp">
                <svg
                  className="eliteHero-stampText"
                  viewBox="0 0 200 200"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="eliteCirclePath"
                      d="M 100,100
                         m -68,0
                         a 68,68 0 1,1 136,0
                         a 68,68 0 1,1 -136,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#eliteCirclePath" startOffset="0%">
                      HANDCRAFTED HERITAGE • PREMIUM QUALITY •
                    </textPath>
                  </text>
                </svg>

                <div className="eliteHero-stampCenter">SF</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Stats />
      <BestSellerElite />
      <CollectionGenderSplit />
      <EliteGrid />
      <HandcraftedProcess />
      <MaterialsCraftsmanship />
      <DesignLegacy />
      <Community />
      <TestimonialBanner />
      <HelpCenter />
      <OnTheGram />
    </main>
  );
}