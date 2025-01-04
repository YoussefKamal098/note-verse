import * as Yup from 'yup';

const nameValidation = (fieldName) => Yup.string().matches(
  /^(?!\d)[a-zA-Z0-9_]{3,15}$/,
  `${fieldName} must contain only letters, digits, and underscores, be between 3 and 15 characters, and cannot start with a digit`,
);

const emailValidation = Yup.string()
  .email('Invalid email')
  .required('Email is required');

const passwordValidation = Yup.string()
  .matches(
    /^(?=.{8,20}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
    'Password must be between 8 and 20 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  )
  .required('Password is required');

const confirmPasswordValidation = Yup.string()
  .oneOf([Yup.ref('password'), null], 'Passwords must match')
  .required('Confirm password is required');

export {
  nameValidation, confirmPasswordValidation, emailValidation, passwordValidation,
};
