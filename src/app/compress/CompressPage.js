"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import "./styles/CompressPage.css";

const CompressPage = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressionPercent, setCompressionPercent] = useState(90); // default

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setCompressedImage(null);
    }
  };

  const handleCompress = async () => {
    if (!originalImage) return;
    setLoading(true);

    // Convert percentage to maxSizeMB dynamically
    // Higher percentage = more compression (smaller file)
    const compressionRatio = compressionPercent / 100;
    const targetMB = Math.max(0.05, (originalImage.size / 1024 / 1024) * compressionRatio);

    const options = {
      maxSizeMB: targetMB, 
      maxWidthOrHeight: 1280,
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

      {/* Upload Section */}
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {originalImage && (
          <>
            <div className="slider-section">
              <label>
                Compression Level: <strong>{compressionPercent}%</strong>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={compressionPercent}
                onChange={(e) => setCompressionPercent(parseInt(e.target.value))}
              />
            </div>

            <button onClick={handleCompress} disabled={loading}>
              {loading ? "Compressing..." : "Compress Image"}
            </button>
          </>
        )}
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        {originalImage && (
          <div className="image-preview">
            <h4>Original Image</h4>
            <img src={URL.createObjectURL(originalImage)} alt="Original" />
            <p>Size: {(originalImage.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {compressedImage && (
          <div className="image-preview">
            <h4>Compressed Image</h4>
            <img src={compressedImage.url} alt="Compressed" />
            <p>Size: {(compressedImage.file.size / 1024).toFixed(2)} KB</p>
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
