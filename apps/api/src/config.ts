import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'), // Default 3001 for dev, Nginx handles 3000
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'replyai',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  paytr: {
    merchantId: process.env.PAYTR_MERCHANT_ID || '',
    merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
    testMode: process.env.NODE_ENV !== 'production',
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
  },

  app: {
    // Development: individual ports, Production: single port with paths
    url: process.env.APP_URL || 'http://localhost:4000',
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:4000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:4000',
    apiUrl: process.env.API_URL || 'http://localhost:4000',
  },

  keys: {
    masterKey: process.env.MASTER_KEY || 'your-master-key-change-in-production',
  },
};
