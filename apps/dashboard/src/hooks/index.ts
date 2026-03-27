'use client';

import { useState, useCallback, useEffect } from 'react';
import APIClient from '@replyai/api-client';
import type { Message } from '@replyai/shared';
import { useAuth } from '../contexts/AuthContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useFetch<T>(url: string) {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new APIClient(apiBaseUrl);
  if (token) {
    apiClient.setToken(token);
  }

  const fetch = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.request<T>('GET', url);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

export function useMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new APIClient(apiBaseUrl);
  if (token) {
    apiClient.setToken(token);
  }

  const getMessages = useCallback(async (status?: string, platform?: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getMessages(status, platform);
      setMessages(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching messages');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const approve = useCallback(async (id: string) => {
    try {
      await apiClient.approveMessage(id);
      setMessages(current =>
        current.map(message =>
          message.id === id
            ? { ...message, status: 'sent', sentAt: new Date() }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving message');
    }
  }, []);

  const reject = useCallback(async (id: string) => {
    try {
      await apiClient.rejectMessage(id);
      setMessages(current =>
        current.map(message =>
          message.id === id
            ? { ...message, status: 'rejected' }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting message');
    }
  }, []);

  return { messages, isLoading, error, getMessages, approve, reject };
}

export function usePlatforms() {
  const { token } = useAuth();
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new APIClient(apiBaseUrl);
  if (token) {
    apiClient.setToken(token);
  }

  const getPlatforms = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPlatforms();
      setPlatforms(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching platforms');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addPlatform = useCallback(async (platform: string, credentials: any) => {
    try {
      const response = await apiClient.addPlatform(platform, credentials);
      if (response.data) {
        setPlatforms(current => [...current, response.data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding platform');
      throw err;
    }
  }, []);

  return { platforms, isLoading, error, getPlatforms, addPlatform };
}

export function useDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new APIClient(apiBaseUrl);
  if (token) {
    apiClient.setToken(token);
  }

  const getStats = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getDashboardStats();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return { stats, isLoading, error, getStats };
}
