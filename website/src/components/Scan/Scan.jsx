import { useState, useEffect } from "react";
import "./Scan.css";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import SpinnerScan from "../Spinner/SpinnerScan";

const Scan = () => {
  const [totalScans, setTotalScans] = useState(0);
  const [userTotalScans, setUserTotalScans] = useState(0);
  const [scansToday, setScansToday] = useState(0);
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
  const [diseaseCounts, setDiseaseCounts] = useState({});
  const [totalDiseasesDetected, setTotalDiseasesDetected] = useState(0);
  const [showDiseaseList, setShowDiseaseList] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // State for real-time clock
  const [showErrorModal, setShowErrorModal] = useState(false); // State for the error modal
  const [errorMessage, setErrorMessage] = useState(""); // State for the error message
  const [showActualNumbers, setShowActualNumbers] = useState(false); // State to toggle between actual numbers and "Many"

  const threshold = 1000;

  // Fetch the scan counts from the server
  const fetchScanCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_scan_counts`);
      const data = await response.json();
      setTotalScans(data.total_scans);
      setUserTotalScans(data.total_user_scans);
      setScansToday(data.scans_today);
    } catch (error) {
      console.error('Error fetching scan counts:', error);
    }
  };

  // Fetch the disease counts from the server
  const fetchDiseaseCounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_disease_counts`);
      const data = await response.json();
      setTotalDiseasesDetected(data.total_diseases_detected);
      setDiseaseCounts(data.disease_counts);
    } catch (error) {
      console.error('Error fetching disease counts:', error);
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    fetchScanCounts();
    fetchDiseaseCounts();

    const interval = setInterval(() => {
      fetchScanCounts();
      fetchDiseaseCounts();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Real-time clock logic
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date()); // Update current time every second
    }, 1000);

    return () => clearInterval(clockInterval); // Cleanup interval on unmount
  }, []);

    // Format current time as "April 12, 2004"
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(currentTime);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    // Check if the file is an image
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
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
    } else {
      // If the file is not an image, show a custom error modal
      setErrorMessage('Please upload a valid image file (JPEG, JPG, or PNG).');
      setShowErrorModal(true);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleScan = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload_image`, {
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
      setConfidence(data.confidence ? (data.confidence * 1).toFixed(2) : null);
      setPrevention(data.prevention);
      setCause(data.cause);
      setContributingFactors(data.contributing_factors);
      setMoreInfoUrl(data.more_info_url);
      setScanned(true);

      await fetchScanCounts();
      await fetchDiseaseCounts();
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

  const toggleShowActualNumbers = () => {
    setShowActualNumbers(!showActualNumbers);
  };

  return (
    <>
      <div className="scan-container">
        {loading && <SpinnerScan />}
        
        {/* Error Modal */}
        {showErrorModal && (
          <div className="error-modal">
            <div className="error-modal-content">
              <h2>Error</h2>
              <p>{errorMessage}</p>
              <button onClick={handleCloseErrorModal}>Close</button>
            </div>
          </div>
        )}

        {showCancelConfirm && (
          <>
            <div className={`overlay ${showCancelConfirm ? 'show' : ''}`} onClick={() => setShowCancelConfirm(false)}></div>
            <div className="confirmation-dialog">
              <p>Are you sure you want to cancel?</p>
              <button onClick={confirmCancel}>Yes</button>
              <button onClick={() => setShowCancelConfirm(false)} className="no-button">No</button>
            </div>
          </>
        )}

        <div className="scan-header">
          <div className="scan-info-box-dropdown" >
            <div className="scan-title">
              <h2>Total Scan Diseases</h2>
              <p onClick={toggleShowActualNumbers}>
                <strong>{showActualNumbers || totalDiseasesDetected <= threshold ? totalDiseasesDetected : '500+'}</strong>
              </p>
              <div className="dropdown-icon-graph" onClick={() => setShowDiseaseList(!showDiseaseList)}>
                {showDiseaseList ? <FaChevronRight /> : <FaChevronLeft />}
              </div>
            </div>
          </div>
          {showDiseaseList && (
            <div className="dropdown-list">
              {Object.keys(diseaseCounts).length > 0 ? (
                <ul>
                  {Object.entries(diseaseCounts).map(([disease, count]) => (
                    <li key={disease}>
                      <span className="disease-name">{disease}</span>: <span className="disease-count"> {count} </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-data-text">No data available yet.</div>
              )}
            </div>
          )}

          <div className="scan-info-box">
            <div className="scan-title">
              <h2>Total Scans</h2>
              <p onClick={toggleShowActualNumbers}>
                <strong>{showActualNumbers || totalScans <= threshold ? totalScans : '500+'}</strong>
              </p>
            </div>
          </div>
          <div className="scan-info-box">
            <div className="scan-title">
              <h2>Scan Today</h2>
              <p onClick={toggleShowActualNumbers}>
                <strong>{showActualNumbers || scansToday <= threshold ? scansToday : '500+'}</strong>
              </p>
            </div>
          </div>
          <div className="scan-info-box">
            <div className="scan-title">
              <h2>Your Total Scan</h2>
              <p onClick={toggleShowActualNumbers}>
                <strong>{showActualNumbers || userTotalScans <= threshold ? userTotalScans : '500+'}</strong>
              </p>
            </div>
          </div>
          <div className="scan-info-box">
            <div className="scan-title">
              <h2>Current Date/Time</h2>
              <h3>{formattedDate}</h3>
            </div>
          </div>
        </div>

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
              {disease === 'Unrecognize' ? (
                <div>
                  <p className="unrecognize">Unrecognized Image</p>
                </div>
              ) : (
                <>
                  <p><strong>Disease:</strong> {disease || 'N/A'}</p>
                  <p><strong>Accuracy:</strong> {confidence ? `${confidence}%` : 'N/A'}</p>
                </>
              )}
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
    </>
  );
};
export default Scan;
