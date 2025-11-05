"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import "./styles/CompressPage.css";

const CompressPage = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setCompressedImage(null);
    }
  };

  // compress and generate downloadable image
  const handleCompress = async () => {
    if (!originalImage) return;
    setLoading(true);

    const options = {
      maxSizeMB: 1, // target max size
      maxWidthOrHeight: 1280, // resize dimension
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(originalImage, options);
      const compressedFileUrl = URL.createObjectURL(compressedFile);
      setCompressedImage({
        file: compressedFile,
        url: compressedFileUrl,
      });
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement("a");
    link.href = compressedImage.url;
    link.download = `compressed-${originalImage.name}`;
    link.click();
  };

  return (
    <div className="compress-container">
      <h2 className="compress-title">Image Compressor</h2>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {originalImage && (
          <button onClick={handleCompress} disabled={loading}>
            {loading ? "Compressing..." : "Compress Image"}
          </button>
        )}
      </div>

      <div className="preview-section">
        {originalImage && (
          <div className="image-preview">
            <h4>Original Image</h4>
            <img src={URL.createObjectURL(originalImage)} alt="Original" />
            <p>
              Size: {(originalImage.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {compressedImage && (
          <div className="image-preview">
            <h4>Compressed Image</h4>
            <img src={compressedImage.url} alt="Compressed" />
            <p>
              Size: {(compressedImage.file.size / 1024).toFixed(2)} KB
            </p>
            <button className="download-btn" onClick={handleDownload}>
              Download Compressed Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPage;
