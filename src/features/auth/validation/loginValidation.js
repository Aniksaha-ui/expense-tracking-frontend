export const validateLoginForm = ({ email, password }) => {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password.trim()) {
    errors.password = 'Password is required.'
  } else if (password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}
