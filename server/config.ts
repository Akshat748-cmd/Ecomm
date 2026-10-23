import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/precious_commerce',

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'super_secure_development_secret_32_chars_min_precious_metals_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Rates & Bullion Feeds
  mcxApiUrl: process.env.MCX_API_URL || 'https://api.example.com/mcx/live-rates',
  lbmaApiUrl: process.env.LBMA_API_URL || 'https://api.example.com/lbma/live-rates',
  rateStaleThresholdSeconds: parseInt(process.env.RATE_STALE_THRESHOLD_SECONDS || '20', 10),

  // Payments
  paymentGatewayProvider: process.env.PAYMENT_GATEWAY_PROVIDER || 'razorpay_sandbox',
  paymentGatewayKeyId: process.env.PAYMENT_GATEWAY_KEY_ID || 'rzp_test_placeholder_key',
  paymentGatewayKeySecret: process.env.PAYMENT_GATEWAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_test_hmac_secret_placeholder',

  // Compliance
  pmlaPanThresholdInr: parseInt(process.env.PMLA_PAN_THRESHOLD_INR || '200000', 10),
  gstRateBullion: parseFloat(process.env.GST_RATE_BULLION || '0.03'),
  companyGstin: process.env.GSTIN_COMPANY || '27AABCP1234F1Z8',
};
