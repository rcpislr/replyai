import { Router, Request, Response, NextFunction } from 'express';
import { getPlatformConnector } from '@replyai/platform-connectors';
import { db } from '../db';
import { platforms, messages } from '../db/schema';
import { eq } from 'drizzle-orm';
import { MessageStatus, Platform } from '@replyai/shared';
import { queueMessageForProcessing } from '../services/messageService';

const router: Router = Router();

router.post('/webhook/:platform', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform } = req.params;
    const platformKey = platform as Platform;
    if (!Object.values(Platform).includes(platformKey)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    const signature = req.headers['x-signature'] as string || req.headers['x-hub-signature-256'] as string;
    const body = req.body;

    const connector = getPlatformConnector(platformKey as any);
    
    if (!connector.verifyWebhook(body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const normalized = connector.normalizeMessage(body);

    const [platformConfig] = await db
      .select()
      .from(platforms)
      .where(eq(platforms.platform, platformKey))
      .limit(1);

    if (!platformConfig || !platformConfig.isActive) {
      return res.status(404).json({ error: 'Platform not configured' });
    }

    const [message] = await db.insert(messages).values({
      tenantId: platformConfig.tenantId,
      platform: platformKey,
      platformMessageId: normalized.platformMessageId,
      conversationId: normalized.conversationId,
      customerId: normalized.customerId,
      customerName: normalized.customerName,
      customerEmail: normalized.customerEmail,
      content: normalized.content,
      direction: 'inbound',
      status: MessageStatus.PENDING,
    }).returning();

    await queueMessageForProcessing(message.id);

    res.json({ success: true, messageId: message.id });
  } catch (error) {
    next(error);
  }
});

export default router;
