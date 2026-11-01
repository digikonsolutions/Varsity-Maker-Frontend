// SizeChart.jsx

import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMaximize,
  FiClock,
} from "react-icons/fi";
import { MdStraighten } from "react-icons/md";
import { FaChild } from "react-icons/fa"; // Kid face icon

const SizeChart = () => {
  const tabs = [
    "Classic Fit",
    "Tailored Classic",
    "Contemporary Fit",
    "Slim Fit",
    "Pint Size",
  ];

  const [activeTab, setActiveTab] = useState("Classic Fit");

  const tableData = [
    ["XS", "43", "34", "25 ½", "18"],
    ["S", "46", "34 ¾", "26", "18 ¾"],
    ["M", "49", "35 ½", "26 ½", "19 ½"],
    ["L", "52", "36 ¼", "27", "20 ¼"],
    ["XL", "55", "37", "27 ½", "21"],
    ["XXL", "58", "37 ¾", "28", "21 ¾"],
    ["3XL", "61", "38 ½", "28 ½", "22 ½"],
    ["4XL", "64", "39 ¼", "29", "23 ¼"],
  ];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, []);

  return (
    <div className="size-chart-page">
      <div className="size-chart-hero">
        <p className="size-mini-heading">SIZING GUIDELINES</p>
        <h1>ALL SIZE CHARTS</h1>
        <p className="size-description">
          For the best fit, measure and compare these product measurements to a
          similar garment you already own.
        </p>
        <span>All measurements are in inches.</span>
      </div>

      <div className="size-tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`size-tab-btn ${
              activeTab === tab ? "active-size-tab" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {index === 0 && <FiUser />}
            {index === 1 && <FiUser />}
            {index === 2 && <FiMaximize />}
            {index === 3 && <FiUser />}
            {index === 4 && <FaChild />}
            {tab}
          </button>
        ))}
      </div>

      <div className="size-table-card">
        <div className="size-table-header">
          <div>
            <h2>{activeTab}</h2>
            <p>
              {activeTab === "Classic Fit" && "Roomy in the chest, waist, and arms. Our most comfortable fit."}
              {activeTab === "Tailored Classic" && "A refined classic fit with slightly less room for a cleaner look."}
              {activeTab === "Contemporary Fit" && "Modern fit with balanced proportions."}
              {activeTab === "Slim Fit" && "Close-fitting through the chest and waist."}
              {activeTab === "Pint Size" && "Specifically designed for shorter frames."}
            </p>
          </div>

          <button className="standard-measurement-btn">
            <MdStraighten size={18} />
            Standard Measurements
          </button>
        </div>

        <div className="table-wrapper">
          <table className="size-table">
            <thead>
              <tr>
                <th>SIZE</th>
                <th>CHEST <span>(2" BELOW ARMHOLE)</span></th>
                <th>SLEEVE <span>(FROM CENTER BACK)</span></th>
                <th>CENTER BACK</th>
                <th>ACROSS SHOULDER</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td className={row[0] === "4XL" ? "highlight-size" : ""}>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="size-info-section">
        <div className="size-info-box">
          <div className="info-icon">i</div>
          <div>
            <h4>Lining & Construction</h4>
            <p>Please note that <b>Quilt lining adds bulk</b> to the inside of the jacket, including the sleeves. Consider this when choosing between sizes if you plan to layer heavily.</p>
          </div>
        </div>
        <div className="size-info-box">
          <div className="info-icon">›</div>
          <div>
            <h4>Tall Sizes</h4>
            <p>For our taller customers, we offer specialized sizing. Tall sizes feature an additional <b>+2 inches</b> in both Sleeve Length and Body Length.</p>
          </div>
        </div>
      </div>

      <div className="size-bottom-text">
        PREMIUM QUALITY & FIT GUARANTEED
      </div>
    </div>
  );
};

export default SizeChart;