import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevOrTest = nodeEnv === 'development' || nodeEnv === 'test';

// Outside development, JWT_SECRET must be supplied via environment variable (no fallback)
const jwtSecret = process.env.JWT_SECRET || (isDevOrTest ? 'super_secure_development_secret_32_chars_min_precious_metals_2026' : '');

export function validateProductionConfig(env = process.env, cfg = config): void {
  const currentEnv = env.NODE_ENV || cfg.nodeEnv || 'development';
  const isDev = currentEnv === 'development' || currentEnv === 'test';

  if (!isDev && !env.JWT_SECRET && !cfg.jwtSecret) {
    throw new Error('Fatal: JWT_SECRET environment variable is missing outside development.');
  }

  if (currentEnv === 'production') {
    const webhookSecret = env.PAYMENT_WEBHOOK_SECRET || cfg.paymentWebhookSecret;
    if (!webhookSecret || webhookSecret === 'whsec_test_hmac_secret_placeholder') {
      throw new Error('Fatal: Refusing to start in production: PAYMENT_WEBHOOK_SECRET is unset or using the test placeholder.');
    }
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv,
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/precious_commerce',

  // Auth & MFA
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  mfaDemoCode: process.env.MFA_DEMO_CODE || '748291',
  seedUserPassword: process.env.SEED_USER_PASSWORD || process.env.SEED_ADMIN_PASSWORD || 'VaultPass@2026',

  // Security & CORS
  corsAllowlist: (process.env.CORS_ALLOWLIST || process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

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
