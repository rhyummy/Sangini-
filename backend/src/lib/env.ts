export function validateEnv() {
  const required = ['GEMINI_API_KEY', 'DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please add them to your .env file`
    );
  }
}
