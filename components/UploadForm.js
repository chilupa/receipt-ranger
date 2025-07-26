"use client";

import { useState } from "react";

export default function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1]; // Extract base64 data (skip data URL prefix)
      if (!base64String) {
        alert("Failed to read file as base64");
        return;
      }
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: base64String,
        });
        const data = await response.json();
        if (data.success) {
          onUpload();
        } else {
          alert("Failed to upload receipt: " + data.error);
        }
      } catch (error) {
        alert("Error uploading receipt: " + error.message);
      }
    };
    reader.readAsDataURL(file); // Reads as data URL (e.g., data:image/png;base64,...)
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={!file}>
          Upload Receipt
        </button>
      </form>
    </div>
  );
}
