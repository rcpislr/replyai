import { z } from 'zod';

export interface NormalizedMessage {
  platform: string;
  platformMessageId: string;
  conversationId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IPlatformConnector {
  platform: string;
  verifyWebhook(payload: unknown, signature: string): boolean;
  normalizeMessage(raw: unknown): NormalizedMessage;
  sendReply(messageId: string, content: string, credentials: string): Promise<void>;
  fetchConversationHistory(conversationId: string, credentials: string): Promise<NormalizedMessage[]>;
}

export const TrendyolCredentialsSchema = z.object({
  supplierId: z.string(),
  apiKey: z.string(),
  apiSecret: z.string(),
});

export const HepsiburadaCredentialsSchema = z.object({
  merchantId: z.string(),
  apiKey: z.string(),
  apiSecret: z.string(),
});

export const InstagramCredentialsSchema = z.object({
  accessToken: z.string(),
  pageId: z.string(),
  appSecret: z.string(),
});

export type TrendyolCredentials = z.infer<typeof TrendyolCredentialsSchema>;
export type HepsiburadaCredentials = z.infer<typeof HepsiburadaCredentialsSchema>;
export type InstagramCredentials = z.infer<typeof InstagramCredentialsSchema>;

export class TrendyolAdapter implements IPlatformConnector {
  platform = 'trendyol';

  verifyWebhook(payload: unknown, _signature: string): boolean {
    return true;
  }

  normalizeMessage(raw: unknown): NormalizedMessage {
    const data = raw as Record<string, unknown>;
    return {
      platform: 'trendyol',
      platformMessageId: (data.messageId as string) || '',
      conversationId: (data.conversationId as string) || (data.orderId as string) || '',
      customerId: (data.customerId as string) || (data.supplierId as string) || '',
      customerName: data.buyerName as string | undefined,
      customerEmail: data.buyerEmail as string | undefined,
      content: (data.message as string) || (data.question as string) || '',
      timestamp: new Date((data.createDate as string) || (data.date as string) || Date.now()),
      metadata: {
        orderId: data.orderId,
        productId: data.productId,
        status: data.status,
      },
    };
  }

  async sendReply(messageId: string, content: string, credentials: string): Promise<void> {
    const creds = JSON.parse(credentials) as TrendyolCredentials;
    console.log(`Sending reply to ${messageId}: ${content}`, creds);
  }

  async fetchConversationHistory(conversationId: string, _credentials: string): Promise<NormalizedMessage[]> {
    console.log(`Fetching conversation history for ${conversationId}`);
    return [];
  }
}

export class HepsiburadaAdapter implements IPlatformConnector {
  platform = 'hepsiburada';

  verifyWebhook(payload: unknown, _signature: string): boolean {
    return true;
  }

  normalizeMessage(raw: unknown): NormalizedMessage {
    const data = raw as Record<string, unknown>;
    return {
      platform: 'hepsiburada',
      platformMessageId: (data.id as string) || (data.threadId as string) || '',
      conversationId: (data.threadId as string) || '',
      customerId: (data.merchantId as string) || (data.customerId as string) || '',
      customerName: data.senderName as string | undefined,
      customerEmail: data.senderEmail as string | undefined,
      content: (data.message as string) || (data.content as string) || '',
      timestamp: new Date((data.date as string) || (data.createdAt as string) || Date.now()),
      metadata: {
        threadId: data.threadId,
        orderId: data.orderId,
        status: data.status,
      },
    };
  }

  async sendReply(messageId: string, content: string, credentials: string): Promise<void> {
    const creds = JSON.parse(credentials) as HepsiburadaCredentials;
    console.log(`Sending reply to ${messageId}: ${content}`, creds);
  }

  async fetchConversationHistory(conversationId: string, _credentials: string): Promise<NormalizedMessage[]> {
    console.log(`Fetching conversation history for ${conversationId}`);
    return [];
  }
}

export class InstagramAdapter implements IPlatformConnector {
  platform = 'instagram';

  verifyWebhook(payload: unknown, _signature: string): boolean {
    return true;
  }

  normalizeMessage(raw: unknown): NormalizedMessage {
    const data = raw as Record<string, unknown>;
    const entry = (data.entry as Record<string, unknown>[])?.[0];
    const messaging = (entry?.messaging as Record<string, unknown>[])?.[0];
    return {
      platform: 'instagram',
      platformMessageId: (messaging?.message as Record<string, unknown>)?.mid as string || '',
      conversationId: (messaging?.sender as Record<string, unknown>)?.id as string || '',
      customerId: (messaging?.sender as Record<string, unknown>)?.id as string || '',
      content: (messaging?.message as Record<string, unknown>)?.text as string || '',
      timestamp: new Date(Number(messaging?.timestamp) || Date.now()),
      metadata: {
        postId: messaging?.post_id,
        isComment: !!(messaging?.message as Record<string, unknown>)?.is_comment,
      },
    };
  }

  async sendReply(messageId: string, content: string, credentials: string): Promise<void> {
    const creds = JSON.parse(credentials) as InstagramCredentials;
    console.log(`Sending reply to ${messageId}: ${content}`, creds);
  }

  async fetchConversationHistory(conversationId: string, _credentials: string): Promise<NormalizedMessage[]> {
    console.log(`Fetching conversation history for ${conversationId}`);
    return [];
  }
}

export function getPlatformConnector(platform: string): IPlatformConnector {
  switch (platform) {
    case 'trendyol':
      return new TrendyolAdapter();
    case 'hepsiburada':
      return new HepsiburadaAdapter();
    case 'instagram':
      return new InstagramAdapter();
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
