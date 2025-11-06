"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import piexif from "piexifjs";
import "./styles/CompressPage.css";

const CompressPage = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressionPercent, setCompressionPercent] = useState(90);
  const [metadata, setMetadata] = useState(null);

  // Helper: read image as DataURL
  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Extract EXIF metadata
  const extractMetadata = async (file) => {
    const dataUrl = await readFileAsDataURL(file);
    try {
      const exifObj = piexif.load(dataUrl);
      setMetadata(exifObj);
      return exifObj;
    } catch (err) {
      console.warn("No EXIF metadata found or failed to extract:", err);
      return null;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setCompressedImage(null);
      await extractMetadata(file);
    }
  };

  const handleCompress = async () => {
    if (!originalImage) return;
    setLoading(true);

    const compressionRatio = compressionPercent / 100;
    const targetMB = Math.max(0.05, (originalImage.size / 1024 / 1024) * compressionRatio);

    const options = {
      maxSizeMB: targetMB,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      // Compress the image
      const compressedFile = await imageCompression(originalImage, options);
      let compressedDataUrl = await readFileAsDataURL(compressedFile);

      // Reinsert EXIF metadata (if any)
      if (metadata) {
        try {
          const exifBytes = piexif.dump(metadata);
          compressedDataUrl = piexif.insert(exifBytes, compressedDataUrl);
          console.log("EXIF metadata reapplied successfully ✅");
        } catch (metaError) {
          console.warn("Failed to reinsert metadata:", metaError);
        }
      }

      const compressedBlob = await (await fetch(compressedDataUrl)).blob();
      const compressedUrl = URL.createObjectURL(compressedBlob);
      setCompressedImage({
        file: compressedBlob,
        url: compressedUrl,
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
      <h2 className="compress-title">Image Compressor (with Metadata)</h2>

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
