import type { ILLMProvider, LLMRequest, LLMResponse, ModelConfig } from './types';

export class OpenRouterProvider implements ILLMProvider {
  name = 'openrouter';
  supportedModels: ModelConfig[] = [];

  constructor(private apiKey: string) {}

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://replyai.com',
        'X-Title': 'ReplyAI',
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json() as any;
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: req.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  async *stream(req: LLMRequest): AsyncIterable<any> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://replyai.com',
        'X-Title': 'ReplyAI',
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield { content: delta, delta, finishReason: parsed.choices?.[0]?.finish_reason };
            }
          } catch {}
        }
      }
    }
  }

  countTokens(text: string, model: string): number {
    return Math.ceil(text.length / 4);
  }

  estimateCost(tokens: number, model: string): number {
    const modelConfig = this.supportedModels.find(m => m.name === model);
    if (!modelConfig) return 0;
    return (tokens / 1_000_000) * (modelConfig.inputCostPer1M + modelConfig.outputCostPer1M);
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { 'Authorization': `Bearer ${key}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - start, error: String(error) };
    }
  }
}

export class OpenAIProvider implements ILLMProvider {
  name = 'openai';
  supportedModels: ModelConfig[] = [];

  constructor(private apiKey: string) {}

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json() as any;
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: req.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  async *stream(req: LLMRequest): AsyncIterable<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield { content: delta, delta, finishReason: parsed.choices?.[0]?.finish_reason };
            }
          } catch {}
        }
      }
    }
  }

  countTokens(text: string, model: string): number {
    return Math.ceil(text.length / 4);
  }

  estimateCost(tokens: number, model: string): number {
    const modelConfig = this.supportedModels.find(m => m.name === model);
    if (!modelConfig) return 0;
    return (tokens / 1_000_000) * (modelConfig.inputCostPer1M + modelConfig.outputCostPer1M);
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - start, error: String(error) };
    }
  }
}
