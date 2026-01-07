import { Router } from 'express';
import { User } from '../models/User.js';
import { signJwt } from '../utils/jwt.js';
import sendEmail from '../utils/sendEmail.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../validators/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
// [추가] 임시 비밀번호 생성을 위한 유틸리티를 import 합니다.
import { generateRandomPassword } from '../utils/passwordGenerator.js';

const router = Router();

// 회원가입 시
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { email, username, password, studentId, clubId } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: 'EmailInUse' });
    
    if (studentId) {
      const studentExists = await User.findOne({ studentId });
      if (studentExists) return res.status(409).json({ error: 'StudentIdInUse' });
    }
    
    const user = await User.create({ 
      email: normalizedEmail, 
      username: username.trim(), 
      password, 
      studentId,
      clubId,
      role: 'MEMBER',
      approvalStatus: 'pending'
    });
    
    const token = signJwt({ 
      id: user.id, 
      role: user.role, 
      clubId: user.clubId 
    });
    
    res.json({ 
      token, 
      user: { 
        _id: user.id, 
        email: normalizedEmail, 
        username: username.trim(), 
        studentId,
        role: user.role, 
        clubId: user.clubId,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus
      } 
    });
  } catch (e) { next(e); }
});

// 로그인 시
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'InvalidCredentials' });
    }
    
    const token = signJwt({ 
      id: user.id, 
      role: user.role, 
      clubId: user.clubId 
    });
    
    res.json({ 
      token, 
      user: { 
        _id: user.id, 
        email: user.email, 
        username: user.username, 
        studentId: user.studentId,
        role: user.role, 
        clubId: user.clubId,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus
      } 
    });
  } catch (e) { next(e); }
});

router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // 보안을 위해, 이메일이 존재하지 않더라도 성공한 것처럼 응답합니다.
      return res.status(200).json({ message: '요청이 접수되었습니다. 가입된 이메일이라면 임시 비밀번호가 전송됩니다.' });
    }

    // 1. 임시 비밀번호를 생성합니다.
    const tempPassword = generateRandomPassword();

    // 2. 이메일 본문에 임시 비밀번호를 담아 전송합니다.
    const message = `
      <h1>임시 비밀번호 발급 안내</h1>
      <p>요청하신 임시 비밀번호는 아래와 같습니다. 로그인 후 반드시 비밀번호를 변경해주세요.</p>
      <h2 style="color: #007bff; letter-spacing: 2px;">${tempPassword}</h2>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Team Tracker 임시 비밀번호 안내',
      message,
    });
    
    // 3. 생성된 임시 비밀번호를 사용자의 새 비밀번호로 DB에 업데이트합니다.
    // User 모델의 pre('save') hook이 이 비밀번호를 자동으로 해싱(암호화)하여 저장합니다.
    user.password = tempPassword;
    await user.save();

    res.status(200).json({ message: '요청이 접수되었습니다. 가입된 이메일이라면 임시 비밀번호가 전송됩니다.' });

  } catch (e) {
    next(e);
  }
});


router.get('/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = header.split(' ')[1];
    const { verifyJwt } = await import('../utils/jwt.js');
    const payload = verifyJwt(token);
    
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'UserNotFound' });
    
    res.json({
      _id: user.id,
      email: user.email,
      username: user.username,
      studentId: user.studentId,
      role: user.role,
      clubId: user.clubId,
      isApproved: user.isApproved,
      approvalStatus: user.approvalStatus
    });
  } catch (e) {
    next(e);
  }
});

export default router;