import { useState } from 'react';
import './Scan.css';

const Scan = () => {
  const [image, setImage] = useState(null);
  const [disease, setDisease] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [prevention, setPrevention] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false); // Track if the image is scanned

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setDisease(null);
        setConfidence(null);
        setPrevention(null);
        setScanned(false); // Reset scanned state
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const uploadResponse = await fetch('/api/upload_image', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
      }

      const data = await uploadResponse.json();
      setDisease(data.disease);
      setConfidence(data.confidence ? (data.confidence * 100).toFixed(2) : null);
      setPrevention(data.prevention);
      setScanned(true); // Disable scan button after successful scan
    } catch (error) {
      console.error('There was an error scanning the image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeImage = () => {
    setImage(null);
    setDisease(null);
    setConfidence(null);
    setPrevention(null);
    setScanned(false); // Reset scanned state
  };

  return (
    <div className="scan-container">
      {loading && <div className="spinner"></div>}
      {image ? (
        <div className="image-preview">
          <div className="prevention-info">
            <h3>Prevention</h3>
            <p>{prevention || 'No prevention information available.'}</p>
          </div>
          <div className="info-container">
            <img src={image} alt="Uploaded" className="preview-img" />
            <div className="scan-info">
              <p><strong>Disease:</strong> {disease || 'N/A'}</p>
              <p><strong>Confidence:</strong> {confidence ? `${confidence}%` : 'N/A'}</p>
            </div>
          </div>
          <div className="button-group">
            <button 
              className="change-button" 
              onClick={handleChangeImage} 
              disabled={loading} // Disable button during loading
            >
              Change Image
            </button>
            {!scanned && (
              <button 
                className="scan-button" 
                onClick={handleScan} 
                disabled={loading} // Disable button during loading
              >
                Scan
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="upload-container">
          <input type="file" id="fileUpload" onChange={handleImageUpload} hidden />
          <label htmlFor="fileUpload" className="upload-label">
            Drag and drop an image or <span className="browse-link">browse</span> to upload.
          </label>
          <p className="file-requirements">JPEG, JPG, or PNG up to 40MB</p>
          <button className="btn" onClick={() => document.getElementById('fileUpload').click()}>Upload Photo</button>
        </div>
      )}
    </div>
  );
};

export default Scan;
