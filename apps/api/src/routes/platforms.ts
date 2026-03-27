import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { platforms } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router: any = Router();

// GET /api/platforms - List platforms for tenant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;

    const platformList = await db
      .select()
      .from(platforms)
      .where(eq(platforms.tenantId, tenantId));

    res.json({ success: true, data: platformList });
  } catch (error) {
    next(error);
  }
});

// POST /api/platforms - Add platform
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
    const { platform, credentials, settings } = req.body;

    if (!platform || !credentials) {
      return res.status(400).json({ error: 'Platform and credentials are required' });
    }

    const newPlatform = {
      id: uuidv4(),
      tenantId,
      platform,
      credentials: JSON.stringify(credentials),
      settings: settings ? JSON.stringify(settings) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(platforms).values(newPlatform).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

// PUT /api/platforms/:id - Update platform
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;
    const { credentials, settings, isActive } = req.body;

    const platform = await db
      .select()
      .from(platforms)
      .where(and(eq(platforms.id, id), eq(platforms.tenantId, tenantId)))
      .limit(1);

    if (!platform.length) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    const updateData: any = { updatedAt: new Date() };
    if (credentials) updateData.credentials = JSON.stringify(credentials);
    if (settings !== undefined) updateData.settings = settings ? JSON.stringify(settings) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await db
      .update(platforms)
      .set(updateData)
      .where(eq(platforms.id, id))
      .returning();

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/platforms/:id - Delete platform
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const platform = await db
      .select()
      .from(platforms)
      .where(and(eq(platforms.id, id), eq(platforms.tenantId, tenantId)))
      .limit(1);

    if (!platform.length) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    await db.delete(platforms).where(eq(platforms.id, id));

    res.json({ success: true, message: 'Platform deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
