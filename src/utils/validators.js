const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const isValidEmail = (email) => typeof email === "string" && EMAIL_REGEX.test(email.trim());

/** At least 8 characters, with at least one letter and one number. */
const isStrongPassword = (password) =>
  typeof password === "string" && PASSWORD_REGEX.test(password);

module.exports = { isValidEmail, isStrongPassword };
