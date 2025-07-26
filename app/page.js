"use client";

import { useState, useEffect } from "react";

import UploadForm from "@/components/UploadForm";

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => setPrices(data));
  }, []);

  const handleUpload = () => {
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => setPrices(data));
  };

  const fetchComparison = async (product) => {
    const res = await fetch(
      `/api/price-comparison?product=${encodeURIComponent(product)}`
    );
    const data = await res.json();
    setComparisonData(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Product Price Comparison</h1>
      <UploadForm onUpload={handleUpload} />
      <h2>Recent Prices</h2>
      <ul>
        {prices?.map((price, index) => (
          <li key={index}>
            {price.product}: ${price.price} (Uploaded at: {price.created_at})
          </li>
        ))}
      </ul>
      <h2>Compare Prices</h2>
      <input
        type="text"
        placeholder="Enter product name (e.g., SKIM)"
        onKeyPress={(e) => {
          if (e.key === "Enter") fetchComparison(e.target.value.toUpperCase());
        }}
      />
      {comparisonData && (
        <div>
          <h3>Price History for {comparisonData.product}</h3>
          <ul>
            {comparisonData.history.map((item, index) => (
              <li key={index}>
                ${item.price} (Uploaded at:{" "}
                {new Date(item.uploaded_at).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
