"use client";

import { useState } from "react";
import styles from "./UploadForm.module.css";

export default function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setProgress(20);

    const reader = new FileReader();
    reader.onloadend = async () => {
      setProgress(40);
      const base64String = reader.result.split(",")[1];
      if (!base64String) {
        alert("Failed to read file as base64");
        setUploading(false);
        setProgress(0);
        return;
      }
      try {
        setProgress(60);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: base64String,
        });
        setProgress(80);
        const data = await response.json();
        setProgress(100);

        if (data.success) {
          onUpload();
          setFile(null);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          alert("Failed to upload receipt: " + data.error);
        }
      } catch (error) {
        alert("Error uploading receipt: " + error.message);
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h3>Upload Receipt</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Select receipt image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className={styles.fileInput}
          />
        </div>
        {uploading && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            ✓ Receipt uploaded successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className={styles.button}
        >
          {uploading && <div className={styles.spinner} />}
          {uploading
            ? "Processing..."
            : file
            ? "Upload Receipt"
            : "Select a file first"}
        </button>
      </form>
    </div>
  );
}
