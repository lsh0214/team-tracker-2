// server/src/utils/sendEmail.js

// CHANGED: require를 import로 변경
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // 또는 다른 이메일 서비스
        auth: {
            user: process.env.EMAIL_USERNAME, // .env 파일에 설정
            pass: process.env.EMAIL_PASSWORD, // .env 파일에 설정 (Gmail은 앱 비밀번호)
        },
    });

    const mailOptions = {
        from: `Team Tracker <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(mailOptions);
};

// CHANGED: module.exports를 export default로 변경
export default sendEmail;