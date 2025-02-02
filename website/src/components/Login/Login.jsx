/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import LoginValidation from './LoginValidation';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo.png';
import Spinner from '../Spinner/Spinner';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => {
    // Retrieve email from local storage, or default to an empty string
    const savedEmail = localStorage.getItem('email');
    return { email: savedEmail || '', password: '' };
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInput = (e) => {
    setValues(prev => ({
      ...prev, [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = LoginValidation(values);
    setErrors(validationErrors);

    if (!validationErrors.email && !validationErrors.password) {
      setLoading(true);
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/token`, values, { withCredentials: true })
        .then(res => {
          setLoading(false);
          if (res.data.status === "success") {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.removeItem('email'); // Clear email on successful login
            navigate('/home');
            toast.success('Login successfully', {
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
        }).catch(err => {
          setLoading(false);
          const errorMessage = err.response?.data?.error || 'Database connection error';
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
          // Save email in local storage on error
          localStorage.setItem('email', values.email);
        });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className='login-container'>
      <div className='loginAddUser'>
        <img src={logo} alt="logo" className='logo-login' />
        <h1>Sign In</h1>
        {loading ? <Spinner /> : (
          <form className='loginAddUserForm' onSubmit={handleSubmit}>
            <div className='inputGroup'>
              <label htmlFor='email'>Email:</label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Enter your Email'
                value={values.email} // Set value from state
                onChange={handleInput}
              />
              {errors.email && <span>{errors.email}</span>}
              <label htmlFor='password'>Password:</label>
              <div className='passwordWrapper'>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id='password'
                  name='password'
                  placeholder='Enter Password'
                  onChange={handleInput}
                />
                <FontAwesomeIcon
                  icon={passwordVisible ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className='eyeIcon'
                />
              </div>
              {errors.password && <span>{errors.password}</span>}
              <button type='submit' className='btn'>Login</button>
            </div>
            <div className='login'>
              <p>Don't have an account?</p>
              <Link to='/signup' className='btn'>Sign Up</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
