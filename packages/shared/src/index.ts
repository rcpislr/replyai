import { z } from 'zod';

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MEMBER: 'TENANT_MEMBER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Platform = {
  TRENDYOL: 'trendyol',
  HEPSIBURADA: 'hepsiburada',
  INSTAGRAM: 'instagram',
} as const;
export type Platform = (typeof Platform)[keyof typeof Platform];

export const SubscriptionPlan = {
  STARTER: 'starter',
  GROWTH: 'growth',
  PRO: 'pro',
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PaymentMethod = {
  PAYTR: 'paytr',
  HAVALE: 'havale',
  BYOK: 'byok',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const MessageStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT: 'sent',
  FAILED: 'failed',
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NO_BUDGET: 'NO_BUDGET',
  PLATFORM_ERROR: 'PLATFORM_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  tenantId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus),
  subscriptionExpiresAt: z.date().nullable(),
  aiCredits: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  plan: z.nativeEnum(SubscriptionPlan),
  status: z.nativeEnum(SubscriptionStatus),
  paymentMethod: z.nativeEnum(PaymentMethod),
  monthlyPrice: z.number().int().min(0),
  aiCreditsIncluded: z.number().int().min(0),
  startDate: z.date(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  platform: z.nativeEnum(Platform),
  platformMessageId: z.string(),
  customerId: z.string(),
  customerName: z.string().nullable(),
  customerEmail: z.string().email().nullable(),
  content: z.string(),
  direction: z.enum(['inbound', 'outbound']),
  status: z.nativeEnum(MessageStatus),
  confidenceScore: z.number().min(0).max(100).nullable(),
  aiResponse: z.string().nullable(),
  processedAt: z.date().nullable(),
  sentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PlatformCredentialsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  platform: z.nativeEnum(Platform),
  credentials: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  encryptedKey: z.string(),
  provider: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const KnowledgeDocumentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  fileName: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  chunkCount: z.number().int(),
  vectorIds: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type PlatformCredentials = z.infer<typeof PlatformCredentialsSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;

export const PLAN_LIMITS = {
  [SubscriptionPlan.STARTER]: {
    aiCredits: 100000,
    platforms: 1,
    features: ['approval_mode', 'basic_analytics'],
  },
  [SubscriptionPlan.GROWTH]: {
    aiCredits: 500000,
    platforms: 2,
    features: ['approval_mode', 'full_analytics', 'priority_support'],
  },
  [SubscriptionPlan.PRO]: {
    aiCredits: -1,
    platforms: -1,
    features: ['approval_mode', 'full_analytics', 'priority_support', 'custom_integrations'],
  },
} as const;

export const PLATFORM_RATES = {
  [Platform.TRENDYOL]: { limit: 100, window: 3600 },
  [Platform.HEPSIBURADA]: { limit: 100, window: 3600 },
  [Platform.INSTAGRAM]: { limit: 200, window: 3600 },
} as const;

export const i18n = {
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      loading: 'Yükleniyor...',
      error: 'Hata oluştu',
      success: 'İşlem başarılı',
    },
    auth: {
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      logout: 'Çıkış Yap',
      email: 'E-posta',
      password: 'Şifre',
      forgotPassword: 'Şifremi Unuttum',
    },
    subscription: {
      starter: 'Başlangıç',
      growth: 'Büyüme',
      pro: 'Pro',
      expired: 'Abonelik Süresi Dolmuş',
      pastDue: 'Ödeme Bekleniyor',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Operation successful',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password',
    },
    subscription: {
      starter: 'Starter',
      growth: 'Growth',
      pro: 'Pro',
      expired: 'Subscription Expired',
      pastDue: 'Payment Pending',
    },
  },
} as const;
