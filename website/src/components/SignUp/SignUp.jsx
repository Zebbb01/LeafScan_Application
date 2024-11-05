import { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import SignUpValidation from './SignUpValidation';
import axios from 'axios';
import { toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo.png';
import Spinner from '../Spinner/Spinner';

const SignUp = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showStrengthBar, setShowStrengthBar] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const strength = getPasswordStrength(value);
      setPasswordStrength(strength);
      setShowStrengthBar(value.length > 0); // Show strength bar only if password field is not empty
    } else {
      setShowStrengthBar(false); // Hide strength bar when not typing password
    }

    const validationErrors = SignUpValidation({ ...values, [name]: value });
    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = SignUpValidation(values);
    setErrors(validationErrors);

    if (!validationErrors.name && !validationErrors.email && !validationErrors.password && !validationErrors.confirmPassword) {
      setLoading(true);
      axios.post('/api/create_token1', values, { withCredentials: true })
        .then(() => {
          setLoading(false);
          navigate('/');
          toast.success('Sign Up successfully!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Zoom,
          });
        }).catch(err => {
          setLoading(false);
          const errorMessage = err.response?.data?.error || 'An error occurred while signing up';
          setErrors(prev => ({ ...prev, email: errorMessage }));
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
        });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
  
    // Length check
    if (password.length >= 8) {
      strength++;
    }
  
    // Check for number
    if (/\d/.test(password)) {
      strength++;
    }
  
    // Check for uppercase and lowercase letters
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      strength++;
    }

    // Length check
    if (password.length >= 15) {
      strength++;
    }
  
    return strength;
  };
  
  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return 'Unknown';
    }
  };

  return (
    <div className='signup-container'>
      <div className='addUser'>
        <img src={logo} alt="logo" className='logo-signup' />
        <h1>Register</h1>
        {loading ? <Spinner /> : (
          <form className='addUserForm' onSubmit={handleSubmit}>
            <div className='inputGroup'>
              <label htmlFor='name'>Username: {errors.name && <span>{errors.name}</span>}</label>
              <input type='text' id='name' name='name' placeholder='Enter Username' onChange={handleInput} />
              <label htmlFor='email'>Email:{errors.email && <span>{errors.email}</span>}</label>
              <input type='email' id='email' name='email' placeholder='Enter your Email' onChange={handleInput} />
              <label htmlFor='password'>Password:{errors.password && <span>{errors.password}</span>}</label>
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
              {showStrengthBar && (
                <div className='passwordStrengthWrapper'>
                  <div className={`passwordStrengthBar strength-${passwordStrength}`}>
                    <span></span>
                  </div>
                  <div className='passwordStrengthText'>
                    {getPasswordStrengthText(passwordStrength)}
                  </div>
                </div>
              )}
              
              <label htmlFor='confirmPassword'>Confirm Password:{errors.confirmPassword && <span>{errors.confirmPassword}</span>}</label>
              <div className='passwordWrapper'>
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  placeholder='Confirm your password'
                  onChange={handleInput}
                />
                <FontAwesomeIcon
                  icon={confirmPasswordVisible ? faEyeSlash : faEye}
                  onClick={toggleConfirmPasswordVisibility}
                  className='eyeIcon'
                />
              </div>
              
              <button type='submit' className='btn'>Sign Up</button>
            </div>
            <div className='logins'>
              <p>Already have an account?</p>
              <Link to='/' className='btn'>Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
