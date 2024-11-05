const LoginValidation = (values) => {
    let errors = {};
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!email_pattern.test(values.email)) {
      errors.email = 'Email is incorrect or not exist';
    } else {
      errors.email = '';
    }
  
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!password_pattern.test(values.password)) {
      errors.password = 'Password is incorrect';
    } else {
      errors.password = '';
    }
  
    return errors;
  };
  
  export default LoginValidation;