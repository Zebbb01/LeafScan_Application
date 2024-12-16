import { useState, useRef } from 'react';
import './UploadCsv.css';

const UploadCsv = ({ setIsDataLoaded }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState(1); // Single severity value for both min and max
    const fileInputRef = useRef(null);

    const getSeverityLabel = () => {
        if (severity >= 1 && severity <= 3) return 'Low';
        if (severity >= 4 && severity <= 6) return 'Moderate';
        if (severity >= 7 && severity <= 10) return 'Severe';
        return 'Mixed';
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please select a valid CSV file.');
        }
    };

    const handleFileUpload = async () => {
        setError(null);
        if (!file) {
            setError('Please select a file before uploading.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('severity', severity);  // Pass the severity value directly
        
        try {
            const response = await fetch('/api/upload_csv', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Unknown upload error');
            }

            setIsDataLoaded(true); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
        setIsDataLoaded(false);
    };

    const handleSeverityChange = (e) => {
        const newSeverity = parseInt(e.target.value, 10);
        setSeverity(newSeverity); // Update severity for both min and max
    };

    return (
        <div className="upload-csv-container">
            {/* Hidden file input */}
            <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                hidden 
                ref={fileInputRef} 
            />
            {!file && (
                <label htmlFor="file-upload" className="upload-csv-label">
                    Choose a CSV file
                </label>
            )}

            {file && (
                <div className="file-preview">
                    <span className="file-name">{file.name}</span>
                    {/* Hide the file input and show the remove button */}
                    <button onClick={handleRemoveFile} className="remove-file-btn">Remove</button>
                </div>
            )}
            
            <div className="severity-selector">
                <label htmlFor="severity">VSD Disease Severity:</label>
                <div className="slider-group">
                    <label>Severity:</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={severity}
                        onChange={handleSeverityChange}
                    />
                    <span>{severity}%</span>
                </div>
                <div className="severity-label">
                    <strong>Severity Level:</strong> {getSeverityLabel()}
                </div>
            </div>

            <button 
                className={`upload-csv-btn ${loading ? 'loading' : ''}`} 
                onClick={handleFileUpload}
                disabled={loading || !file}
            >
                {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
            {error && <div className="upload-csv-error">{error}</div>}
        </div>
    );
};

export default UploadCsv;
