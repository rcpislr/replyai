import { User, Message, KnowledgeDocument } from '@replyai/shared';

export interface APIResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async fetch<T>(method: string, path: string, body?: any): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${path}`, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${path}]:`, error);
      throw error;
    }
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.fetch<T>(method, path, body);
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, tenantName: string) {
    return this.fetch<{ user: User; tenant: { id: string; name?: string; slug?: string; subscriptionPlan?: string }; token: string }>('POST', '/api/auth/register', {
      email,
      password,
      name,
      tenantName,
    });
  }

  async login(email: string, password: string) {
    return this.fetch<{ user: User; tenant: { id: string } | null; token: string }>('POST', '/api/auth/login', {
      email,
      password,
    });
  }

  async getMe() {
    return this.fetch<User>('GET', '/api/auth/me');
  }

  // Messages endpoints
  async getMessages(status?: string, platform?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (platform) params.append('platform', platform);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return this.fetch<APIResponse<Message[]>>('GET', `/api/messages?${params.toString()}`);
  }

  async getMessage(id: string) {
    return this.fetch<APIResponse<Message>>('GET', `/api/messages/${id}`);
  }

  async approveMessage(id: string) {
    return this.fetch('POST', `/api/messages/${id}/approve`);
  }

  async rejectMessage(id: string) {
    return this.fetch('POST', `/api/messages/${id}/reject`);
  }

  async sendMessage(id: string, content: string) {
    return this.fetch('POST', `/api/messages/${id}/send`, { content });
  }

  // Platforms endpoints
  async getPlatforms() {
    return this.fetch<APIResponse<any[]>>('GET', '/api/platforms');
  }

  async addPlatform(platform: string, credentials: any, settings?: any) {
    return this.fetch<APIResponse<any>>('POST', '/api/platforms', {
      platform,
      credentials,
      settings,
    });
  }

  async updatePlatform(id: string, credentials?: any, settings?: any, isActive?: boolean) {
    return this.fetch<APIResponse<any>>('PUT', `/api/platforms/${id}`, {
      credentials,
      settings,
      isActive,
    });
  }

  async deletePlatform(id: string) {
    return this.fetch('DELETE', `/api/platforms/${id}`);
  }

  // Knowledge base endpoints
  async getDocuments() {
    return this.fetch<APIResponse<KnowledgeDocument[]>>('GET', '/api/knowledge/documents');
  }

  async uploadDocument(title: string, content: string, fileName?: string, fileType?: string) {
    return this.fetch<APIResponse<KnowledgeDocument>>('POST', '/api/knowledge/documents', {
      title,
      content,
      fileName,
      fileType,
    });
  }

  async deleteDocument(id: string) {
    return this.fetch('DELETE', `/api/knowledge/documents/${id}`);
  }

  async getPrompts() {
    return this.fetch('GET', '/api/knowledge/prompts');
  }

  async createPrompt(name: string, prompt: string, contentUrl?: string, isDefault?: boolean) {
    return this.fetch('POST', '/api/knowledge/prompts', {
      name,
      prompt,
      contentUrl,
      isDefault,
    });
  }

  async deletePrompt(id: string) {
    return this.fetch('DELETE', `/api/knowledge/prompts/${id}`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.fetch<APIResponse<any>>('GET', '/api/dashboard/stats');
  }

  async getUsage() {
    return this.fetch<APIResponse<any>>('GET', '/api/dashboard/usage');
  }

  async getRecentMessages(limit = 10) {
    return this.fetch<APIResponse<Message[]>>('GET', `/api/dashboard/recent-messages?limit=${limit}`);
  }
}

export default APIClient;
