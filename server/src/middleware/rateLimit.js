import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',

  // --- ⬇️ 이 부분이 핵심입니다 ⬇️ ---
  /**
   * 요청을 어떤 기준으로 그룹화하여 카운트할지 결정합니다.
   * 사용자가 입력한 이메일 주소를 기준으로 하고, 이메일이 없으면 IP 주소를 사용합니다.
   */
  keyGenerator: (req, res) => {
    return req.body.email || req.ip;
  },
});
