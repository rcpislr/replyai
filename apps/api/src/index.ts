import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import webhookRoutes from './routes/webhooks';
import adminRoutes from './routes/admin';
import messagesRoutes from './routes/messages';
import platformsRoutes from './routes/platforms';
import knowledgeRoutes from './routes/knowledge';
import dashboardRoutes from './routes/dashboard';
import { authMiddleware, errorHandler } from './middleware/auth';
import { config } from './config';
import { startMessageProcessor } from './services/messageService';

dotenv.config();

const app: Express = express();
const isDev = config.nodeEnv !== 'production';

app.use(helmet({ contentSecurityPolicy: isDev ? false : undefined }));
app.use(cors({
  origin: [config.app.url, config.app.dashboardUrl, config.app.adminUrl],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);

// Protected routes (require authentication)
app.use('/api', authMiddleware);

app.use('/api/messages', messagesRoutes);
app.use('/api/platforms', platformsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

startMessageProcessor();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
