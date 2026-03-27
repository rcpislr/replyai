import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { systemSettings, bankAccounts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { KeyVault } from '@replyai/ai-engine';
import { UserRole, ErrorCode } from '@replyai/shared';

const router: Router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    tenantId: string | null;
  };
}

function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: ErrorCode.FORBIDDEN });
  }
  next();
}

router.get('/settings', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await db.select().from(systemSettings);
    
    const result: Record<string, { value: string; isEncrypted: boolean }> = {};
    for (const s of settings) {
      let value = s.value;
      if (s.isEncrypted) {
        const vault = new KeyVault({ masterKey: process.env.MASTER_KEY || '' });
        value = vault.decrypt(value);
      }
      result[s.key] = { value, isEncrypted: s.isEncrypted };
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/settings', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key, value, isEncrypted, description } = req.body;

    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    
    let storedValue = value;
    if (isEncrypted) {
      const vault = new KeyVault({ masterKey: process.env.MASTER_KEY || '' });
      storedValue = vault.encrypt(value);
    }

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ value: storedValue, isEncrypted: isEncrypted || false, description, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({
        key,
        value: storedValue,
        isEncrypted: isEncrypted || false,
        description,
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/bank-accounts', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accounts = await db.select().from(bankAccounts);
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.post('/bank-accounts', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bankName, accountNumber, IBAN, accountHolder } = req.body;

    const [account] = await db.insert(bankAccounts).values({
      bankName,
      accountNumber,
      IBAN,
      accountHolder,
    }).returning();

    res.json(account);
  } catch (error) {
    next(error);
  }
});

router.put('/bank-accounts/:id', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, IBAN, accountHolder, isActive } = req.body;

    await db
      .update(bankAccounts)
      .set({ bankName, accountNumber, IBAN, accountHolder, isActive, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id));

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/bank-accounts/:id', requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
