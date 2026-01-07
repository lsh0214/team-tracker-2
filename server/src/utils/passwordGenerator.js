import crypto from 'crypto';

/**
 * 랜덤한 임시 비밀번호를 생성합니다 (예: 8자리 영문/숫자 조합)
 * @returns {string} 생성된 임시 비밀번호
 */
export const generateRandomPassword = () => {
  return crypto.randomBytes(4).toString('hex'); // 8자리 랜덤 문자열 생성
};