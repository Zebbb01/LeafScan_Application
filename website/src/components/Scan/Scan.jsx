import { useState, useEffect } from 'react';
import './Scan.css';
import Spinner from '../Spinner/Spinner';

const Scan = () => {
  const [image, setImage] = useState(null);
  const [disease, setDisease] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [prevention, setPrevention] = useState(null);
  const [cause, setCause] = useState(null); 
  const [contributingFactors, setContributingFactors] = useState(null);
  const [moreInfoUrl, setMoreInfoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Reset the overlay when component unmounts or when the page changes
  useEffect(() => {
    return () => {
      setShowCancelConfirm(false); // Clean up the confirmation dialog state
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setDisease(null);
        setConfidence(null);
        setPrevention(null);
        setCause(null); 
        setContributingFactors(null);
        setMoreInfoUrl(null);
        setScanned(false);
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
      setCause(data.cause); 
      setContributingFactors(data.contributing_factors);
      setMoreInfoUrl(data.more_info_url);
      setScanned(true);
    } catch (error) {
      console.error('There was an error scanning the image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    setImage(null);
    setDisease(null);
    setConfidence(null);
    setPrevention(null);
    setCause(null); 
    setContributingFactors(null); 
    setMoreInfoUrl(null);
    setScanned(false); 
  };

  const handleMoreInfo = () => {
    if (moreInfoUrl) {
      window.open(moreInfoUrl, '_blank');
    }
  };
  

  return (
    <div className="scan-container">
      {loading && <Spinner />}
      {showCancelConfirm && (
        <>
          {/* Overlay with dynamically applied 'show' class */}
          <div className={`overlay ${showCancelConfirm ? 'show' : ''}`} onClick={() => setShowCancelConfirm(false)}></div>

          {/* Confirmation dialog */}
          <div className="confirmation-dialog">
            <p>Are you sure you want to cancel?</p>
            <button onClick={confirmCancel}>Yes</button>
            <button onClick={() => setShowCancelConfirm(false)} className="no-button">No</button>
          </div>
        </>
      )}

      {image ? (
        <div className="image-preview">
          <div className="scrollable-prevention-info">
            <div className="prevention-info">
              <h3>Cause</h3>
              <p>{cause || 'No cause information available.'}</p>
              <h3>Contributing Factors</h3>
              <p>{contributingFactors || 'No contributing factors information available.'}</p>
              <h3>Prevention</h3>
              <p>{prevention || 'No prevention information available.'}</p>
              {moreInfoUrl && moreInfoUrl.trim() ? (
                <>
                  <h4>More Info</h4>
                  <a onClick={handleMoreInfo} className="more-info-link">Click here for more information</a>
                </>
              ) : (
                <>
                  <h4>More Info</h4>
                  <p className="no-info-text">No additional information available.</p>
                </>
              )}
            </div>
          </div>
          <div className="image-container">
            <img src={image} alt="Uploaded" className="preview-img" />
          </div>
          <div className={`info-container ${scanned ? 'show' : ''}`}>
            <p><strong>Disease:</strong> {disease || 'N/A'}</p>
            <p><strong>Confidence:</strong> {confidence ? `${confidence}%` : 'N/A'}</p>
          </div>
          <div className="button-group">
            <button className="cancel-button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            {!scanned && (
              <button className="scan-button" onClick={handleScan} disabled={loading}>
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
