import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import next from 'next';

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
const dev = true;

// Next.js dev uses inline/eval scripts; disable CSP in dev.
app.use(helmet({ contentSecurityPolicy: false }));
// Ensure no CSP header blocks Next dev scripts
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});
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

async function start() {
  let nextReady = false;

  app.use((req, res, next) => {
    if (nextReady) return next();
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.status(503).send('Starting up...');
  });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Single-port dev server running on ${PORT}`);
  });

  console.log('Preparing Next apps...');
  const webApp = next({ dev, dir: path.resolve(__dirname, '../../web') });
  const dashboardApp = next({ dev, dir: path.resolve(__dirname, '../../dashboard') });
  const adminApp = next({ dev, dir: path.resolve(__dirname, '../../admin') });

  await webApp.prepare();
  console.log('Web ready.');
  await dashboardApp.prepare();
  console.log('Dashboard ready.');
  await adminApp.prepare();
  console.log('Admin ready.');

  const webHandler = webApp.getRequestHandler();
  const dashboardHandler = dashboardApp.getRequestHandler();
  const adminHandler = adminApp.getRequestHandler();

  app.all('/dashboard', (req, res) => dashboardHandler(req, res));
  app.all('/dashboard/:path*', (req, res) => dashboardHandler(req, res));
  app.all('/admin', (req, res) => adminHandler(req, res));
  app.all('/admin/:path*', (req, res) => adminHandler(req, res));
  app.all('*', (req, res) => webHandler(req, res));

  nextReady = true;
  console.log('Next apps ready.');
}

start().catch((err) => {
  console.error('Failed to start single-port dev server:', err);
  process.exit(1);
});
