import crypto from 'crypto';
import type { KeyVaultConfig } from './types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export class KeyVault {
  private key: Buffer;

  constructor(config: KeyVaultConfig) {
    const masterKey = Buffer.from(config.masterKey.padEnd(32, '0').slice(0, 32));
    this.key = crypto.createHash('sha256').update(masterKey).digest();
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static deriveTenantKey(masterKey: string, tenantId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${masterKey}:${tenantId}`)
      .digest('hex');
  }
}

export class TokenCounter {
  constructor(private redis: any) {}

  async increment(tenantId: string, tokens: number, date?: Date): Promise<void> {
    const d = date || new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const key = `tenant:${tenantId}:usage:${monthKey}`;
    
    await this.redis.incrby(key, tokens);
    await this.redis.expire(key, 60 * 60 * 24 * 90);
  }

  async getUsage(tenantId: string, date?: Date): Promise<number> {
    const d = date || new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const key = `tenant:${tenantId}:usage:${monthKey}`;
    
    const value = await this.redis.get(key);
    return parseInt(value || '0', 10);
  }

  async checkLimit(tenantId: string, limit: number, date?: Date): Promise<{ allowed: boolean; current: number; remaining: number }> {
    const current = await this.getUsage(tenantId, date);
    return {
      allowed: current < limit || limit === -1,
      current,
      remaining: limit === -1 ? -1 : Math.max(0, limit - current),
    };
  }

  async notifyAt80Percent(tenantId: string, limit: number): Promise<boolean> {
    if (limit === -1) return false;
    const current = await this.getUsage(tenantId);
    return current >= limit * 0.8;
  }

  async isOverLimit(tenantId: string, limit: number): Promise<boolean> {
    if (limit === -1) return false;
    const current = await this.getUsage(tenantId);
    return current >= limit;
  }
}
