import Redis from 'ioredis';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { KeyVault, OpenAIProvider, OpenRouterProvider, calculateConfidence } from '@replyai/ai-engine';
import { getPlatformConnector } from '@replyai/platform-connectors';
import { db } from '../db';
import {
  aiUsageLogs,
  apiKeys,
  knowledgeBaseDocuments,
  knowledgeBasePrompts,
  messages,
  platforms,
  systemSettings,
  tenants,
} from '../db/schema';
import { config } from '../config';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

let processorStarted = false;

type ProviderResult = {
  response: string;
  confidence: number;
  tokens: number;
  provider: string;
  model: string;
  costUsd: number;
};

function getVault(): KeyVault {
  return new KeyVault({ masterKey: config.keys.masterKey });
}

function generateMockAIResponse(content: string, platform: string): ProviderResult {
  const mockResponses: Record<string, string[]> = {
    trendyol: [
      'Merhaba, mesajiniz icin tesekkur ederiz. Siparis numaranizi paylasirsaniz hemen kontrol edelim.',
      'Yardimci olmaktan memnuniyet duyariz. Kisa sure icinde net bilgi verelim.',
      'Talebinizi aldik. Detaylari kontrol edip size donus saglayacagiz.',
    ],
    hepsiburada: [
      'Merhaba, yasadiginiz durum icin uzgunuz. Siparis detayini paylasirsaniz kontrol saglayalim.',
      'Bilgilendirmeniz icin tesekkur ederiz. Konuyu inceleyip size hizlica donus yapacagiz.',
      'Memnuniyetiniz bizim icin onemli. Gerekli kontrolu hemen baslatiyoruz.',
    ],
    instagram: [
      'Merhaba, yazdiginiz icin tesekkurler. Detay paylasirsaniz size hemen yardimci olalim.',
      'Tesekkur ederiz. DM uzerinden siparis veya urun detayini iletebilirsiniz.',
      'Harika soru. Kisa surede net bilgi vermek icin kontroldeyiz.',
    ],
  };

  const responses = mockResponses[platform] || mockResponses.trendyol;
  const response = responses[Math.floor(Math.random() * responses.length)];
  const confidence = calculateConfidence(response, {
    minLength: 40,
    maxLength: 400,
    containsGreeting: true,
    containsRefundMention: true,
  }).score;
  const tokens = Math.ceil((content.length + response.length) / 4);

  return {
    response,
    confidence,
    tokens,
    provider: 'mock',
    model: 'mock-v1',
    costUsd: 0,
  };
}

async function getSystemSetting(key: string): Promise<string | null> {
  const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  if (!setting) return null;

  if (!setting.isEncrypted) {
    return setting.value;
  }

  try {
    return getVault().decrypt(setting.value);
  } catch {
    return null;
  }
}

async function getTenantProvider(tenantId: string): Promise<{ provider: 'openrouter' | 'openai'; apiKey: string } | null> {
  const [tenantKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt))
    .limit(1);

  if (tenantKey) {
    try {
      return {
        provider: tenantKey.provider === 'openai' ? 'openai' : 'openrouter',
        apiKey: getVault().decrypt(tenantKey.encryptedKey),
      };
    } catch {
      console.warn(`Failed to decrypt tenant API key for tenant ${tenantId}`);
    }
  }

  const openRouterKey = config.openrouter.apiKey || await getSystemSetting('OPENROUTER_API_KEY');
  if (openRouterKey) {
    return { provider: 'openrouter', apiKey: openRouterKey };
  }

  return null;
}

async function buildKnowledgeContext(tenantId: string): Promise<string> {
  const [prompt] = await db
    .select()
    .from(knowledgeBasePrompts)
    .where(and(eq(knowledgeBasePrompts.tenantId, tenantId), eq(knowledgeBasePrompts.isActive, true)))
    .orderBy(desc(knowledgeBasePrompts.isDefault), desc(knowledgeBasePrompts.updatedAt))
    .limit(1);

  const docs = await db
    .select()
    .from(knowledgeBaseDocuments)
    .where(and(eq(knowledgeBaseDocuments.tenantId, tenantId), eq(knowledgeBaseDocuments.isActive, true)))
    .orderBy(desc(knowledgeBaseDocuments.updatedAt))
    .limit(3);

  const promptBlock = prompt?.prompt ? `Merchant instructions:\n${prompt.prompt}\n\n` : '';
  const docsBlock = docs.length > 0
    ? docs.map((doc, index) => `Document ${index + 1} - ${doc.title}:\n${doc.content.slice(0, 1200)}`).join('\n\n')
    : '';

  return `${promptBlock}${docsBlock}`.trim();
}

async function generateAIResponse(messageId: string): Promise<ProviderResult> {
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!message) {
    throw new Error(`Message ${messageId} not found`);
  }

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, message.tenantId)).limit(1);
  const providerConfig = await getTenantProvider(message.tenantId);
  const knowledgeContext = await buildKnowledgeContext(message.tenantId);

  if (!providerConfig) {
    return generateMockAIResponse(message.content, message.platform);
  }

  const provider = providerConfig.provider === 'openai'
    ? new OpenAIProvider(providerConfig.apiKey)
    : new OpenRouterProvider(providerConfig.apiKey);

  const model = providerConfig.provider === 'openai' ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const systemPrompt = [
    'You are a Turkish ecommerce customer support assistant.',
    'Reply in Turkish unless the customer clearly writes in another language.',
    'Be concise, polite, and action-oriented.',
    'Never invent shipment or refund facts. Ask for order information when needed.',
    tenant ? `Merchant name: ${tenant.name}.` : '',
    knowledgeContext ? `Use this merchant context when relevant:\n${knowledgeContext}` : '',
  ].filter(Boolean).join('\n');

  try {
    const completion = await provider.complete({
      model,
      temperature: 0.4,
      maxTokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Platform: ${message.platform}\nCustomer message: ${message.content}` },
      ],
    });

    const confidence = calculateConfidence(completion.content, {
      minLength: 40,
      maxLength: 500,
      containsGreeting: true,
      containsRefundMention: true,
    }).score;

    return {
      response: completion.content,
      confidence,
      tokens: completion.usage.totalTokens || Math.ceil((message.content.length + completion.content.length) / 4),
      provider: provider.name,
      model: completion.model,
      costUsd: provider.estimateCost(completion.usage.totalTokens, completion.model),
    };
  } catch (error) {
    console.error(`AI provider failed for message ${messageId}, falling back to mock:`, error);
    return generateMockAIResponse(message.content, message.platform);
  }
}

async function createOutboundMessageRecord(params: {
  tenantId: string;
  platform: string;
  sourceMessageId: string;
  conversationId: string | null;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  content: string;
  approvedBy?: string;
}) {
  const [created] = await db.insert(messages).values({
    id: uuidv4(),
    tenantId: params.tenantId,
    platform: params.platform as any,
    platformMessageId: `reply_${params.sourceMessageId}_${Date.now()}`,
    conversationId: params.conversationId,
    customerId: params.customerId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    content: params.content,
    direction: 'outbound',
    status: 'sent',
    approvedBy: params.approvedBy || null,
    sentAt: new Date(),
    processedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return created;
}

export async function sendPlatformReply(messageId: string, content: string): Promise<void> {
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!message) {
    throw new Error('Message not found');
  }

  const [platformConfig] = await db
    .select()
    .from(platforms)
    .where(and(eq(platforms.tenantId, message.tenantId), eq(platforms.platform, message.platform), eq(platforms.isActive, true)))
    .limit(1);

  if (!platformConfig) {
    throw new Error(`Active ${message.platform} platform configuration not found`);
  }

  const connector = getPlatformConnector(message.platform);
  await connector.sendReply(message.platformMessageId, content, platformConfig.credentials);
}

export async function processMessage(messageId: string) {
  try {
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
    if (!message) {
      console.error(`Message ${messageId} not found`);
      return;
    }

    if (message.direction !== 'inbound') {
      return;
    }

    await db
      .update(messages)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(messages.id, messageId));

    const result = await generateAIResponse(messageId);
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, message.tenantId)).limit(1);
    const shouldAutoSend = result.confidence >= 85;

    if (shouldAutoSend) {
      await sendPlatformReply(messageId, result.response);
      await createOutboundMessageRecord({
        tenantId: message.tenantId,
        platform: message.platform,
        sourceMessageId: message.id,
        conversationId: message.conversationId,
        customerId: message.customerId,
        customerName: message.customerName,
        customerEmail: message.customerEmail,
        content: result.response,
      });
    }

    await db
      .update(messages)
      .set({
        aiResponse: result.response,
        confidenceScore: result.confidence,
        status: shouldAutoSend ? 'sent' : 'pending',
        sentAt: shouldAutoSend ? new Date() : null,
        processedAt: new Date(),
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    await db.insert(aiUsageLogs).values({
      id: uuidv4(),
      tenantId: message.tenantId,
      messageId: message.id,
      provider: result.provider,
      model: result.model,
      inputTokens: Math.ceil(message.content.length / 4),
      outputTokens: Math.max(1, Math.ceil(result.response.length / 4)),
      totalTokens: result.tokens,
      costUsd: Math.round((result.costUsd || 0) * 1000000),
      createdAt: new Date(),
    });

    if (tenant) {
      await redis.incrby(
        `tenant:${message.tenantId}:usage:${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        result.tokens
      );

      await db
        .update(tenants)
        .set({
          usedAiCredits: (tenant.usedAiCredits || 0) + result.tokens,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenant.id));
    }

    console.log(`Processed message ${messageId} via ${result.provider}/${result.model}`);
  } catch (error) {
    console.error(`Error processing message ${messageId}:`, error);

    await db
      .update(messages)
      .set({
        status: 'failed',
        errorMessage: (error as Error).message,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
  }
}

export async function queueMessageForProcessing(messageId: string) {
  try {
    await redis.lpush('message_queue', messageId);
    console.log(`Queued message ${messageId} for processing`);
  } catch (error) {
    console.error('Error queuing message:', error);
    await processMessage(messageId);
  }
}

export async function processQueuedMessages(limit = 10) {
  try {
    for (let i = 0; i < limit; i += 1) {
      const messageId = await redis.rpop('message_queue');
      if (!messageId) break;
      await processMessage(messageId);
    }
  } catch (error) {
    console.error('Error processing queued messages:', error);
  }
}

export function startMessageProcessor() {
  if (processorStarted) return;

  processorStarted = true;
  console.log('Message processor started');

  setInterval(async () => {
    await processQueuedMessages(5);
  }, 5000);
}

export async function sendApprovedAIReply(messageId: string, approvedBy?: string) {
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!message) {
    throw new Error('Message not found');
  }

  if (!message.aiResponse) {
    throw new Error('No AI response available to send');
  }

  await sendPlatformReply(messageId, message.aiResponse);
  await createOutboundMessageRecord({
    tenantId: message.tenantId,
    platform: message.platform,
    sourceMessageId: message.id,
    conversationId: message.conversationId,
    customerId: message.customerId,
    customerName: message.customerName,
    customerEmail: message.customerEmail,
    content: message.aiResponse,
    approvedBy,
  });

  await db
    .update(messages)
    .set({
      status: 'sent',
      approvedBy: approvedBy || null,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));
}

export async function sendManualReply(messageId: string, content: string, approvedBy?: string) {
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!message) {
    throw new Error('Message not found');
  }

  await sendPlatformReply(messageId, content);
  const outbound = await createOutboundMessageRecord({
    tenantId: message.tenantId,
    platform: message.platform,
    sourceMessageId: message.id,
    conversationId: message.conversationId,
    customerId: message.customerId,
    customerName: message.customerName,
    customerEmail: message.customerEmail,
    content,
    approvedBy,
  });

  await db
    .update(messages)
    .set({
      status: 'sent',
      approvedBy: approvedBy || null,
      aiResponse: content,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));

  return outbound;
}

export default {
  processMessage,
  queueMessageForProcessing,
  processQueuedMessages,
  sendApprovedAIReply,
  sendManualReply,
  sendPlatformReply,
  startMessageProcessor,
};
