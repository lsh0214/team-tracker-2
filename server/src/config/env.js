import 'dotenv/config';
import jwt from 'jsonwebtoken';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  CLIENT_URLS: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',').map(s => s.trim()).filter(Boolean),
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '2h',
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 20),
  DISABLE_CORS: process.env.DISABLE_CORS === 'true',
};

if (!env.MONGODB_URI || !env.JWT_SECRET) {
  console.error('[ENV] Missing MONGODB_URI or JWT_SECRET');
  process.exit(1);
}

export function signJwt(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '1h',  // 1시간으로 단축
    algorithm: 'HS256'  // 알고리즘 명시
  });
}
