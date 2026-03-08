// Simple sanitization without external dependencies
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim();
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateRequired(value, fieldName) {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  return true;
}

export function validateLength(value, min, max, fieldName) {
  if (value.length < min) {
    throw new Error(`${fieldName} must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new Error(`${fieldName} must be no more than ${max} characters`);
  }
  return true;
}
