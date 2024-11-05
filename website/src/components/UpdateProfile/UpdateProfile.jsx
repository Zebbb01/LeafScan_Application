import { useState, useEffect } from 'react';
import './UpdateProfile.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import UpdateProfileValidation from './UpdateProfileValidation';

const UpdateProfile = ({ setUser }) => {
  const { id } = useParams();
  const location = useLocation();
  const [name, setName] = useState(location.state?.name || ''); // Get name from state
  const [email, setEmail] = useState(location.state?.email || ''); // Get email from state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  useEffect(() => {
    if (!location.state) {
      // If state is not available, fetch user data
      setLoading(true);
      axios.get(`api/user/${id}`)
        .then(res => {
          setName(res.data.name);
          setEmail(res.data.email);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, location.state]);

  const navigate = useNavigate();

  const toggleCurrentPasswordVisibility = () => {
    setCurrentPasswordVisible(!currentPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = { currentPassword, newPassword };
    const validationErrors = UpdateProfileValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!currentPassword && !newPassword) {
      updateProfile({ name });
      return;
    }

    if (currentPassword) {
      try {
        const response = await axios.post('api/check-password', {
          id,
          password: currentPassword
        });

        if (!response.data.valid) {
          setErrors(prev => ({
            ...prev,
            currentPassword: 'Current password is incorrect'
          }));
          toast.error('Current password is incorrect', {
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
      } catch (error) {
        console.error('Error checking password:', error);
        toast.error('Wrong password', {
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
    }

    updateProfile({ name, password: newPassword });
  };

  const updateProfile = async (dataToUpdate) => {
    setLoading(true);

    axios.put(`/api/update/${id}`, dataToUpdate, { withCredentials: true })
      .then(res => {
        setLoading(false);
        if (res.data.updated) {
          const updatedUser = { ...JSON.parse(localStorage.getItem('user')), name: dataToUpdate.name };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          navigate('/home');
          toast.success('Profile updated successfully', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        } else {
          toast.error('Failed to update', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toast.error('Failed to update', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Zoom,
        });
      });
  };

  const handleCancel = () => {
    navigate('/home');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='update-container'>
      <div className='pf-update'>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-2'>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Enter Name"
              className='form-control'
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className='mb-2'>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              placeholder="Enter Email"
              className='form-control'
            />
          </div>
          <div className='mb-2'>
            <label htmlFor="currentPassword">Current Password:</label>
            <div className='passwordWrapper'>
              <input
                type={currentPasswordVisible ? 'text' : 'password'}
                id="currentPassword"
                value={currentPassword}
                placeholder="Enter Current Password"
                className='form-control'
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <FontAwesomeIcon
                icon={currentPasswordVisible ? faEyeSlash : faEye}
                onClick={toggleCurrentPasswordVisibility}
                className='up-eyeIcon'
              />
            </div>
            {errors.currentPassword && <span>{errors.currentPassword}</span>}
          </div>
          <div className='mb-2'>
            <label htmlFor="newPassword">New Password:</label>
            <div className='passwordWrapper'>
              <input
                type={newPasswordVisible ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                placeholder="Enter New Password"
                className='form-control'
                onChange={e => setNewPassword(e.target.value)}
              />
              <FontAwesomeIcon
                icon={newPasswordVisible ? faEyeSlash : faEye}
                onClick={toggleNewPasswordVisibility}
                className='up-eyeIcon'
              />
            </div>
            {errors.newPassword && <span>{errors.newPassword}</span>}
          </div>
          <div className='btn-update'>
            <button type="submit" className='btn'>Update</button>
            <button type="button" className='btn btn-secondary' onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
