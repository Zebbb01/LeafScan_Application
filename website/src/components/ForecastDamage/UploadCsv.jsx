import { useState, useRef } from 'react';
import './UploadCsv.css';

const UploadCsv = ({ setIsDataLoaded }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

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

        try {
            const response = await fetch('/api/upload_csv', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Unknown upload error');
            }

            setIsDataLoaded(true); // Trigger data reload in ForecastDamage
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = '';
        setIsDataLoaded(false); // Set to false when file is removed to reload data
    };

    return (
        <div className="upload-csv-container">
            <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                hidden 
                ref={fileInputRef} 
            />
            <label htmlFor="file-upload" className="upload-csv-label">
                {file ? `Selected File: ${file.name}` : 'Choose a CSV file'}
            </label>
            {file && (
                <div className="file-preview">
                    <span className="file-name">{file.name}</span>
                    <button onClick={handleRemoveFile} className="remove-file-btn">Remove</button>
                </div>
            )}
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
