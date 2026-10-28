export const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET', 'PORT', 'CLIENT_ORIGIN', 'ALLOWED_EMAIL_DOMAIN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}`);
  }
  return process.env;
};