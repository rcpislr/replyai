import { z } from 'zod';
import type { Platform } from '@replyai/shared';

export interface ModelConfig {
  name: string;
  provider: string;
  maxTokens: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export interface LLMRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
}

export interface LLMChunk {
  content: string;
  delta: string;
  finishReason: string;
}

export interface HealthStatus {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export interface ILLMProvider {
  name: string;
  supportedModels: ModelConfig[];

  complete(req: LLMRequest): Promise<LLMResponse>;
  stream(req: LLMRequest): AsyncIterable<LLMChunk>;

  countTokens(text: string, model: string): number;
  estimateCost(tokens: number, model: string): number;

  validateApiKey(key: string): Promise<boolean>;
  healthCheck(): Promise<HealthStatus>;
}

export const OpenRouterModels: ModelConfig[] = [
  { name: 'openai/gpt-4o', provider: 'openrouter', maxTokens: 128000, inputCostPer1M: 5, outputCostPer1M: 15 },
  { name: 'openai/gpt-4o-mini', provider: 'openrouter', maxTokens: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
  { name: 'anthropic/claude-3.5-sonnet', provider: 'openrouter', maxTokens: 200000, inputCostPer1M: 3, outputCostPer1M: 15 },
  { name: 'anthropic/claude-3-haiku', provider: 'openrouter', maxTokens: 200000, inputCostPer1M: 0.08, outputCostPer1M: 0.24 },
];

export const OpenAIModels: ModelConfig[] = [
  { name: 'gpt-4o', provider: 'openai', maxTokens: 128000, inputCostPer1M: 5, outputCostPer1M: 15 },
  { name: 'gpt-4o-mini', provider: 'openai', maxTokens: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
  { name: 'gpt-4-turbo', provider: 'openai', maxTokens: 128000, inputCostPer1M: 10, outputCostPer1M: 30 },
];

export const AnthropicModels: ModelConfig[] = [
  { name: 'claude-3-5-sonnet-20241022', provider: 'anthropic', maxTokens: 200000, inputCostPer1M: 3, outputCostPer1M: 15 },
  { name: 'claude-3-haiku-20240307', provider: 'anthropic', maxTokens: 200000, inputCostPer1M: 0.25, outputCostPer1M: 1.25 },
];

export const ProviderFactorySchema = z.object({
  tenantId: z.string().uuid(),
  hasApiKey: z.boolean(),
  apiKey: z.string().optional(),
  platformCredits: z.number(),
  platformApiKey: z.string().optional(),
});

export type ProviderFactoryInput = z.infer<typeof ProviderFactorySchema>;

export interface KeyVaultConfig {
  masterKey: string;
  tenantId?: string;
}

export interface TokenUsage {
  tenantId: string;
  month: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface ConfidenceScore {
  score: number;
  reasons: string[];
  needsApproval: boolean;
}

export function calculateConfidence(
  response: string,
  options: {
    minLength?: number;
    maxLength?: number;
    containsGreeting?: boolean;
    containsApology?: boolean;
    containsRefundMention?: boolean;
  } = {}
): ConfidenceScore {
  const reasons: string[] = [];
  let score = 80;

  if (options.minLength && response.length < options.minLength) {
    score -= 20;
    reasons.push('Response too short');
  }

  if (options.maxLength && response.length > options.maxLength) {
    score -= 10;
    reasons.push('Response too long');
  }

  if (options.containsGreeting && !response.match(/^(merhaba|selam|hello|hi)/i)) {
    score -= 10;
    reasons.push('Missing greeting');
  }

  if (options.containsRefundMention && response.match(/iptal|para iadesi|geri ödeme/i)) {
    score -= 15;
    reasons.push('Contains refund mention - needs approval');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    needsApproval: score < 70,
  };
}
