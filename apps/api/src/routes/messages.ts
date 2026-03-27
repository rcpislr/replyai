import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { messages } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendApprovedAIReply, sendManualReply } from '../services/messageService';

const router: any = Router();

// GET /api/messages - List messages for tenant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId; // From middleware
    const { status, platform, limit = '50', offset = '0' } = req.query;

    // Build conditions array
    const conditions: any[] = [eq(messages.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(messages.status, status as any));
    }

    if (platform) {
      conditions.push(eq(messages.platform, platform as any));
    }

    const messageList = await db
      .select()
      .from(messages)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(messages.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: messageList,
      count: messageList.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/:id - Get single message
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const message = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.tenantId, tenantId)))
      .limit(1);

    if (!message.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, data: message[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/:id/approve - Approve and send message
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;

    const message = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.tenantId, tenantId)))
      .limit(1);

    if (!message.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await sendApprovedAIReply(id, userId);

    res.json({ success: true, message: 'Message approved and sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/:id/reject - Reject message
router.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const message = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.tenantId, tenantId)))
      .limit(1);

    if (!message.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db
      .update(messages)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(messages.id, id));

    res.json({ success: true, message: 'Message rejected' });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/:id/send - Send a manual response
router.post('/:id/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), eq(messages.tenantId, tenantId)))
      .limit(1);

    if (!message.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const responseMessage = await sendManualReply(id, content, userId);

    res.json({ success: true, message: 'Response sent', responseId: responseMessage.id });
  } catch (error) {
    next(error);
  }
});

export default router;
