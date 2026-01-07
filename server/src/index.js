import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import { enrichRole } from './middleware/enrichRole.js';
import { requireApproval } from './middleware/approvalCheck.js';
import { initializeSocket } from './services/socketService.js';

// ✅ 모든 라우터 import (기존과 동일)
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/teams.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import clubRoutes from './routes/clubs.js';
import inviteRoutes from './routes/invites.js';
import aiRoutes from './routes/ai.js';
import approvalRoutes from './routes/approvals.js';
import roleRequestRoutes from './routes/roleRequests.js';
import clubSettingsRoutes from './routes/clubSettings.js';
import teamJoinRequestRoutes from './routes/teamJoinRequests.js';
import predictionRoutes from './routes/predictions.js';
import inquiryRoutes from './routes/inquiries.js';
import teamIssueRoutes from './routes/teamIssues.js';
import adminClubRoutes from './routes/adminClubs.js';
import adminSettingsRoutes from './routes/adminSettings.js';
import adminAnalyticsRoutes from './routes/adminAnalytics.js';

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(morgan('dev'));

// CORS 설정 (기존과 동일)
if (env.DISABLE_CORS) {
  console.log('[CORS] CORS disabled for testing');
  app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  }));
} else {
  // 멀티 오리진 CORS 설정
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // Postman 등 허용
      return env.CLIENT_URLS.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false,
  }));
}
app.options('*', cors());

app.use(express.json());

// 정적 파일 제공 (기존과 동일)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// ==========================================================
// ========== [수정된] 라우터 설정 (Router Configuration) ==========
// ==========================================================

// -----------------------------------------------------------------
// 1. Public Routes (인증이 전혀 필요 없는 공개 경로)
// -----------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes); // 로그인, 회원가입, 비밀번호찾기 등
app.use('/api/clubs', clubRoutes);
app.use('/api/invites', inviteRoutes);


// -----------------------------------------------------------------
// 2. Protected Routes (여기서부터는 모든 경로에 최소 '로그인'이 필요)
// -----------------------------------------------------------------

// '계정 승인'은 필요 없지만 '로그인'은 필요한 경로들
app.use('/api/approvals', requireAuth, enrichRole, approvalRoutes);
app.use('/api/users', requireAuth, enrichRole, userRoutes);

// '로그인' 뿐만 아니라 '계정 승인'까지 받아야 접근 가능한 경로들
// 재사용을 위해 미들웨어 배열 생성
const needsApproval = [requireAuth, enrichRole, requireApproval];

app.use('/api/teams', needsApproval, teamRoutes);
app.use('/api/reports', needsApproval, reportRoutes);
app.use('/api/dashboard', needsApproval, dashboardRoutes);
app.use('/api/ai', needsApproval, aiRoutes);
app.use('/api/role-requests', needsApproval, roleRequestRoutes);
app.use('/api/club-settings', needsApproval, clubSettingsRoutes);
app.use('/api/team-join-requests', needsApproval, teamJoinRequestRoutes);
app.use('/api/predictions', needsApproval, predictionRoutes);
app.use('/api/inquiries', needsApproval, inquiryRoutes);
app.use('/api/team-issues', needsApproval, teamIssueRoutes);
app.use('/api/admin/clubs', needsApproval, adminClubRoutes);
app.use('/api/admin/settings', needsApproval, adminSettingsRoutes);
app.use('/api/admin/analytics', needsApproval, adminAnalyticsRoutes);

// Error handler (기존과 동일)
app.use(errorHandler);

// ========== 서버 시작 (기존과 동일) ==========
connectDB().then(async () => {
  // 데이터베이스 정리 작업
  try {
    const { cleanupClubData } = await import('./utils/cleanupClubs.js');
    await cleanupClubData();
  } catch (error) {
    console.warn('[CLEANUP] Club cleanup failed:', error.message);
  }
  
  initializeSocket(httpServer);
  
  httpServer.listen(env.PORT, () => {
    console.log(`[API] Server listening on port :${env.PORT}`);
    console.log('[CORS] Allowed origins:', env.CLIENT_URLS.join(', '));
    console.log('[Socket] Socket.io initialized');
  });
}).catch(error => {
  console.error('[DB] Connection failed:', error);
  process.exit(1);
});