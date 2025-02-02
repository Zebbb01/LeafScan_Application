import { useState, useRef, useEffect } from 'react';
import './UploadCsv.css';
import { toast } from 'react-toastify';

const UploadCsv = ({ setIsDataLoaded, setCsvUploaded, setSeverityChanged }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState(() => {
        const savedSeverity = localStorage.getItem('severity');
        return savedSeverity ? parseInt(savedSeverity, 10) : 1;
    });
    const fileInputRef = useRef(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    useEffect(() => {
        const savedFile = localStorage.getItem('uploadedFile');
        if (savedFile) {
            const parsedFile = JSON.parse(savedFile);
            const fileObject = new File([new Blob([parsedFile.content])], parsedFile.name, { type: parsedFile.type });
            setFile(fileObject);
            setIsDataLoaded(true);
            setIsFileUploaded(true);
        }
    }, [setIsDataLoaded]);

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
        formData.append('severity', severity);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload_csv`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Unknown upload error');
            }

            const fileContent = await file.text();
            localStorage.setItem('uploadedFile', JSON.stringify({ name: file.name, type: file.type, content: fileContent }));
            localStorage.setItem('severity', severity); // Save severity to localStorage when upload is successful
            setIsDataLoaded(true);
            setIsFileUploaded(true);
            setCsvUploaded(true); // Notify parent component that CSV is uploaded
            setSeverityChanged(true); // Notify parent component that severity has changed

            toast.success(`CSV uploaded successfully with severity ${severity} : ${getSeverityLabel()}`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
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
        localStorage.removeItem('uploadedFile');
        setIsFileUploaded(false);
    };

    const handleSeverityChange = (e) => {
        const newSeverity = parseInt(e.target.value, 10);
        setSeverity(newSeverity); // Update severity state without saving to localStorage here
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
            {!file && (
                <label htmlFor="file-upload" className="upload-csv-label">
                    Choose a CSV file
                </label>
            )}

            {file && (
                <div className="file-preview">
                    <span className="file-name">{file.name}</span>
                    <button onClick={handleRemoveFile} className="remove-file-btn">
                        Remove
                    </button>
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