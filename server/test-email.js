// server/test-email.js (ESM 방식으로 다시 수정됨)

// ✅ require를 다시 import로 변경합니다.
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

async function runTest() {
  console.log('--- 이메일 전송 테스트 시작 ---');
  console.log(`사용자 이름: ${process.env.EMAIL_USERNAME}`);
  console.log(`앱 비밀번호: ${process.env.EMAIL_PASSWORD ? '설정됨 (길이: ' + process.env.EMAIL_PASSWORD.length + ')' : '설정 안됨!'}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Team Tracker Test <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_USERNAME, // 자기 자신에게 테스트 메일 발송
    subject: 'Nodemailer 테스트 성공!',
    html: '<h1>이 메시지가 보인다면, 인증 정보가 올바른 것입니다.</h1>',
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('✅ 테스트 성공! 이메일이 성공적으로 발송되었습니다.');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ 테스트 실패! 아래 에러를 확인하세요:');
    console.error(error);
  }
}

runTest();