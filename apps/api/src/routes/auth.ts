import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '@replyai/auth';
import { UserRole, ErrorCode } from '@replyai/shared';
import { hashPassword, verifyPassword, generateToken } from '@replyai/auth';
import { db } from '../db';
import { users, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';

const router: Router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, tenantName } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const tenantSlug = tenantName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || email.split('@')[0];
    
    const [tenant] = await db.insert(tenants).values({
      name: tenantName || name,
      slug: tenantSlug,
      subscriptionPlan: 'starter',
      subscriptionStatus: 'active',
      aiCredits: 100000,
    }).returning();

    const passwordHash = await hashPassword(password);
    
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      role: UserRole.TENANT_ADMIN,
      tenantId: tenant.id,
    }).returning();

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscriptionPlan: tenant.subscriptionPlan,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: user.tenantId ? {
        id: user.tenantId,
      } : null,
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
