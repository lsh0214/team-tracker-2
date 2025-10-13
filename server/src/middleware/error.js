import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // 1. 서버 콘솔에는 항상 자세한 에러를 출력 (개발자 확인용)
  console.error('[ERR]', err.status || 500, err.message || err);

  // 2. 운영 환경(production)인 경우
  if (env.NODE_ENV === 'production') {
    // 사용자에게는 일반적인 오류 메시지만 전송
    return res.status(500).json({
      error: 'InternalServerError',
      message: '서버에 예상치 못한 문제가 발생했습니다.'
    });
  }

  // 3. 개발 환경(development)인 경우
  // 디버깅을 위해 기존처럼 자세한 오류 정보를 전송
  res.status(err.status || 500).json({
    error: err.name || 'ServerError',
    message: err.message || 'Unexpected error',
    stack: err.stack, // 개발 환경에서는 스택 정보까지 주면 디버깅에 더 용이합니다.
  });
};
