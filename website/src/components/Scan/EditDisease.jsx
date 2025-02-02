import { useState, useEffect } from 'react';
import './EditDisease.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditDisease = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    prevention: '',
    cause: '',
    contributing_factors: '',
    more_info_url: '',
  });
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    prevention: '',
    cause: '',
    contributing_factors: '',
    more_info_url: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/diseases`)
      .then((response) => {
        setDiseases(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching diseases:', error);
        toast.error('Failed to load diseases.');
        setLoading(false);
      });
  }, []);

  const handleSelectDisease = (e) => {
    const selectedName = e.target.value;
    const selected = diseases.find((disease) => disease.name === selectedName);
    setSelectedDisease(selectedName);
    setFormData({
      name: selected?.name || '',
      prevention: selected?.prevention || '',
      cause: selected?.cause || '',
      contributing_factors: selected?.contributing_factors || '',
      more_info_url: selected?.more_info_url || '',
    });
    setOriginalFormData({
      name: selected?.name || '',
      prevention: selected?.prevention || '',
      cause: selected?.cause || '',
      contributing_factors: selected?.contributing_factors || '',
      more_info_url: selected?.more_info_url || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the form data has changed
    if (
      JSON.stringify(formData) === JSON.stringify(originalFormData)
    ) {
      toast.info('No changes made.', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Zoom,
      });
      return;
    }

    if (!selectedDisease) {
      toast.error('Please select a disease to edit.');
      return;
    }

    setLoading(true);
    axios
      .put(`${import.meta.env.VITE_API_BASE_URL}/diseases`, formData)
      .then(() => {
        toast.success(`Disease information updated for ${formData.name}`, {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          theme: 'colored',
          transition: Zoom,
        });
        setLoading(false);
        navigate('/'); // Navigate to home page only after successful update
      })
      .catch((error) => {
        console.error('Error updating disease:', error);
        toast.error('Failed to update disease information.');
        setLoading(false);
      });
  };

  const handleCancel = () => {
    navigate('/home'); // Navigate to home page on cancel
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <div className={`pf-update-disease-container ${!selectedDisease ? 'white-background' : ''}`}>
        <h1 className="edit-disease-title">Manage Disease</h1>
        <div className="mb-2">
          <label className='disease-Title' htmlFor="diseaseSelect">Select Disease:</label>
          <select
            id="diseaseSelect"
            className="edit-disease-select"
            onChange={handleSelectDisease}
            value={selectedDisease || ''}
          >
            <option value="" disabled>
              Select a disease to edit
            </option>
            {diseases.length > 0 ? (
              diseases.map((disease) => (
                <option key={disease.name} value={disease.name}>
                  {disease.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No diseases available
              </option>
            )}
          </select>
        </div>
        {selectedDisease && (
          <form className="edit-disease-form" onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className='disease-Title' htmlFor="name">Disease Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                className="form-control-disease"
                disabled
              />
            </div>
            <div className="mb-2">
              <label className='disease-Title' htmlFor="prevention">Prevention:</label>
              <textarea
                id="prevention"
                name="prevention"
                value={formData.prevention}
                className="form-control"
                rows="8"
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className='disease-Title' htmlFor="cause">Cause:</label>
              <textarea
                id="cause"
                name="cause"
                value={formData.cause}
                className="form-control"
                rows="5"
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className='disease-Title' htmlFor="contributing_factors">Contributing Factors:</label>
              <textarea
                id="contributing_factors"
                name="contributing_factors"
                value={formData.contributing_factors}
                className="form-control"
                rows="8"
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className='disease-Title' htmlFor="more_info_url">More Info URL:</label>
              <input
                type="url"
                id="more_info_url"
                name="more_info_url"
                value={formData.more_info_url}
                className="form-control"
                onChange={handleChange}
              />
            </div>
            <div className="button-container">
              <button type="submit" className="btn-primary-disease">
                Update
              </button>
              <button type="button" className="btn-secondary-disease" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EditDisease;
