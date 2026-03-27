import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { messages, subscriptions, tenants } from '../db/schema';
import { eq, and, count, sum } from 'drizzle-orm';

const router: any = Router();

// GET /api/dashboard/stats - Overall dashboard statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;

    // Get tenant
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant.length) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get message counts
    const totalMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.tenantId, tenantId));

    const sentMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), eq(messages.status, 'sent')));

    const pendingMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), eq(messages.status, 'pending')));

    const inboundMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), eq(messages.direction, 'inbound')));

    const outboundMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), eq(messages.direction, 'outbound')));

    // Calculate AI reply percentage (mock)
    const totalCount = totalMessages[0]?.count || 0;
    const sentCount = sentMessages[0]?.count || 0;
    const aiPercentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalMessages: totalCount,
        sentMessages: sentCount,
        pendingMessages: pendingMessages[0]?.count || 0,
        inboundMessages: inboundMessages[0]?.count || 0,
        outboundMessages: outboundMessages[0]?.count || 0,
        aiReplyPercentage: aiPercentage,
        avgResponseTime: '2.3s', // Mock
        plan: tenant[0].subscriptionPlan,
        aiCredits: tenant[0].aiCredits,
        usedAiCredits: tenant[0].usedAiCredits,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/usage - AI credit usage
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;

    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant.length) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const t = tenant[0];
    const usage = {
      total: t.monthlyTokenLimit,
      used: t.usedAiCredits,
      remaining: Math.max(0, t.monthlyTokenLimit - t.usedAiCredits),
      percentage: t.monthlyTokenLimit > 0 ? (t.usedAiCredits / t.monthlyTokenLimit) * 100 : 0,
    };

    res.json({ success: true, data: usage });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/recent-messages - Recent messages
router.get('/recent-messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
    const { limit = '10' } = req.query;

    const recentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.tenantId, tenantId))
      .orderBy(messages.createdAt)
      .limit(parseInt(limit as string));

    res.json({ success: true, data: recentMessages });
  } catch (error) {
    next(error);
  }
});

export default router;
