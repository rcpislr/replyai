import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '@replyai/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  tenantName: z.string().min(1).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface AuthContext {
  user: JWTPayload;
  tenantId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export const ROLES = {
  SUPER_ADMIN: ['SUPER_ADMIN'],
  TENANT_ADMIN: ['TENANT_ADMIN', 'SUPER_ADMIN'],
  TENANT_MEMBER: ['TENANT_MEMBER', 'TENANT_ADMIN', 'SUPER_ADMIN'],
} as const;

export function hasPermission(userRole: string, requiredRoles: readonly string[]): boolean {
  return requiredRoles.includes(userRole);
}

export const PERMISSIONS = {
  'tenant:read': ROLES.TENANT_MEMBER,
  'tenant:write': ROLES.TENANT_ADMIN,
  'tenant:delete': ROLES.TENANT_ADMIN,
  'subscription:read': ROLES.TENANT_MEMBER,
  'subscription:write': ROLES.TENANT_ADMIN,
  'platform:read': ROLES.TENANT_MEMBER,
  'platform:write': ROLES.TENANT_ADMIN,
  'platform:delete': ROLES.TENANT_ADMIN,
  'message:read': ROLES.TENANT_MEMBER,
  'message:write': ROLES.TENANT_MEMBER,
  'message:approve': ROLES.TENANT_ADMIN,
  'message:reject': ROLES.TENANT_ADMIN,
  'knowledge-base:read': ROLES.TENANT_MEMBER,
  'knowledge-base:write': ROLES.TENANT_ADMIN,
  'api-key:read': ROLES.TENANT_ADMIN,
  'api-key:write': ROLES.TENANT_ADMIN,
  'user:invite': ROLES.TENANT_ADMIN,
  'user:remove': ROLES.TENANT_ADMIN,
  'billing:read': ROLES.TENANT_ADMIN,
  'billing:write': ROLES.TENANT_ADMIN,
  'admin:tenants:read': ROLES.SUPER_ADMIN,
  'admin:tenants:write': ROLES.SUPER_ADMIN,
  'admin:users:read': ROLES.SUPER_ADMIN,
  'admin:usage:read': ROLES.SUPER_ADMIN,
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function checkPermission(userRole: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole as any);
}
