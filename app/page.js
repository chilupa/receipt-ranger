"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
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
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Receipt Ranger</h1>

        <div className={styles.card}>
          <UploadForm onUpload={handleUpload} />
        </div>

        <div className={styles.card}>
          <h3>Compare Prices</h3>
          <input
            type="text"
            placeholder="Enter product name (e.g., Cheese)"
            className={styles.searchInput}
            onKeyPress={(e) => {
              if (e.key === "Enter")
                fetchComparison(e.target.value.toUpperCase());
            }}
          />

          {comparisonData && (
            <div className={styles.historySection}>
              <h3 className={styles.historyTitle}>
                Price History for {comparisonData.product}
              </h3>
              <ul className={styles.historyList}>
                {comparisonData.history.map((item, index) => (
                  <li key={index} className={styles.historyItem}>
                    <div className={styles.itemHeader}>
                      <span className={styles.price}>${item.price}</span>
                      <span className={styles.storeBadge}>
                        {item.store_name}
                      </span>
                    </div>
                    <span className={styles.uploadTime}>
                      Uploaded:{" "}
                      {new Date(item.uploaded_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
