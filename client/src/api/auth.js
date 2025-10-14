import client from './client';

export const login = (data) => client.post('/auth/login', data);

export const signup = (data) => client.post('/auth/signup', data);

export const getMe = () => client.get('/auth/me');

// === [수정] '임시 비밀번호 발급' API 함수 ===

/**
 * 임시 비밀번호 발급 요청 (이메일 전송)
 * @param {object} data - { email: 'user@example.com' }
 * @returns Promise
 */
export const forgotPassword = (data) => client.post('/auth/forgot-password', data);
