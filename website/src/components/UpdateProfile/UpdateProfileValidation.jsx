
const UpdateProfileValidation = (values) => {
    let errors = {};

    if (values.currentPassword && !values.newPassword) {
        errors.newPassword = 'Please enter a new password';
    } else if (values.currentPassword && values.currentPassword === values.newPassword) {
        errors.newPassword = 'Please use a new password';
    } else if (values.newPassword && !validatePassword(values.newPassword)) {
        errors.newPassword = 'New password must be at least 8 characters long, include a number, an uppercase letter, and a lowercase letter';
    }

    return errors;
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
};

export default UpdateProfileValidation;
