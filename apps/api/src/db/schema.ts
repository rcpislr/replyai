import { pgTable, uuid, varchar, timestamp, boolean, text, integer, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'TENANT_ADMIN', 'TENANT_MEMBER']);
export const platformEnum = pgEnum('platform', ['trendyol', 'hepsiburada', 'instagram']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['starter', 'growth', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'cancelled', 'expired']);
export const paymentMethodEnum = pgEnum('payment_method', ['paytr', 'havale', 'byok']);
export const messageStatusEnum = pgEnum('message_status', ['pending', 'processing', 'approved', 'rejected', 'sent', 'failed']);
export const messageDirectionEnum = pgEnum('message_direction', ['inbound', 'outbound']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('TENANT_MEMBER'),
  tenantId: uuid('tenant_id'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logo: varchar('logo', { length: 500 }),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').notNull().default('starter'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('active'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  aiCredits: integer('ai_credits').notNull().default(100000),
  usedAiCredits: integer('used_ai_credits').notNull().default(0),
  monthlyTokenLimit: integer('monthly_token_limit').notNull().default(100000),
  isActive: boolean('is_active').notNull().default(true),
  settings: text('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  plan: subscriptionPlanEnum('plan').notNull(),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('paytr'),
  monthlyPrice: integer('monthly_price').notNull().default(0),
  aiCreditsIncluded: integer('ai_credits_included').notNull().default(100000),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').notNull().default(true),
  paymentTransactionId: uuid('payment_transaction_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  subscriptionId: uuid('subscription_id'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('TRY'),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  paymentGatewayId: varchar('payment_gateway_id', { length: 255 }),
  gatewayResponse: text('gateway_response'),
  paymentProof: varchar('payment_proof', { length: 500 }),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platforms = pgTable('platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  platform: platformEnum('platform').notNull(),
  credentials: text('credentials').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  settings: text('settings'),
  webhookUrl: varchar('webhook_url', { length: 500 }),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  platform: platformEnum('platform').notNull(),
  platformMessageId: varchar('platform_message_id', { length: 255 }).notNull(),
  conversationId: varchar('conversation_id', { length: 255 }),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  content: text('content').notNull(),
  direction: messageDirectionEnum('direction').notNull(),
  status: messageStatusEnum('status').notNull().default('pending'),
  confidenceScore: integer('confidence_score'),
  aiResponse: text('ai_response'),
  approvedBy: uuid('approved_by'),
  processedAt: timestamp('processed_at'),
  sentAt: timestamp('sent_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const knowledgeBaseDocuments = pgTable('knowledge_base_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  fileName: varchar('file_name', { length: 500 }),
  fileType: varchar('file_type', { length: 100 }),
  fileSize: integer('file_size'),
  chunkCount: integer('chunk_count').notNull().default(0),
  vectorIds: text('vector_ids'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const knowledgeBasePrompts = pgTable('knowledge_base_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  prompt: text('prompt').notNull(),
  contentUrl: varchar('content_url', { length: 500 }),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  encryptedKey: text('encrypted_key').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  messageId: uuid('message_id'),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  costUsd: integer('cost_usd').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('TENANT_MEMBER'),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  metadata: text('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: varchar('description', { length: 500 }),
  isEncrypted: boolean('is_encrypted').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  IBAN: varchar('iban', { length: 50 }).notNull(),
  accountHolder: varchar('account_holder', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  invitations: many(invitations),
  approvedMessages: many(messages),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  subscriptions: many(subscriptions),
  platforms: many(platforms),
  messages: many(messages),
  apiKeys: many(apiKeys),
  knowledgeBaseDocuments: many(knowledgeBaseDocuments),
  knowledgeBasePrompts: many(knowledgeBasePrompts),
  paymentTransactions: many(paymentTransactions),
  aiUsageLogs: many(aiUsageLogs),
  invitations: many(invitations),
  auditLogs: many(auditLogs),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
  paymentTransactions: many(paymentTransactions),
}));

export const platformsRelations = relations(platforms, ({ one }) => ({
  tenant: one(tenants, {
    fields: [platforms.tenantId],
    references: [tenants.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [messages.tenantId],
    references: [tenants.id],
  }),
  approvedByUser: one(users, {
    fields: [messages.approvedBy],
    references: [users.id],
  }),
}));

export const knowledgeBaseDocumentsRelations = relations(knowledgeBaseDocuments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [knowledgeBaseDocuments.tenantId],
    references: [tenants.id],
  }),
}));

export const knowledgeBasePromptsRelations = relations(knowledgeBasePrompts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [knowledgeBasePrompts.tenantId],
    references: [tenants.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apiKeys.tenantId],
    references: [tenants.id],
  }),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [aiUsageLogs.tenantId],
    references: [tenants.id],
  }),
  message: one(messages, {
    fields: [aiUsageLogs.messageId],
    references: [messages.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentTransactions.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [paymentTransactions.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invitations.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
