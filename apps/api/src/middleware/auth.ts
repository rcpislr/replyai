import { Request, Response, NextFunction } from 'express';
import { verifyToken, checkPermission, PERMISSIONS } from '@replyai/auth';
import { UserRole, ErrorCode } from '@replyai/shared';
import { db } from '../db';
import { tenants } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    tenantId: string | null;
  };
  userId?: string;
  tenantId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
  }

  req.user = payload;
  req.userId = payload.userId;
  req.tenantId = payload.tenantId || undefined;
  next();
}

export function tenantMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.tenantId && req.user?.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: ErrorCode.FORBIDDEN });
  }
  next();
}

export function permissionMiddleware(permission: keyof typeof PERMISSIONS) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: ErrorCode.UNAUTHORIZED });
    }

    if (!checkPermission(req.user.role, permission)) {
      return res.status(403).json({ error: ErrorCode.FORBIDDEN });
    }

    next();
  };
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const errorCode = Object.values(ErrorCode).includes(err.message as ErrorCode)
    ? err.message
    : ErrorCode.INTERNAL_ERROR;

  res.status(400).json({
    error: errorCode,
    message: err.message,
  });
}

export async function rlsMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  if (!req.user?.tenantId) {
    return res.status(403).json({ error: ErrorCode.FORBIDDEN });
  }

  next();
}
