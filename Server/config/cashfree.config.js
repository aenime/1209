import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
  CASHFREE_ENVIRONMENT: process.env.CASHFREE_ENVIRONMENT,
  APP_BASE_URL: process.env.APP_BASE_URL
};

// Validation
if (!config.CASHFREE_APP_ID || !config.CASHFREE_SECRET_KEY) {
  throw new Error('Missing required Cashfree credentials in .env file');
}
