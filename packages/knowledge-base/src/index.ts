import { z } from 'zod';

export interface ChunkStrategy {
  chunkSize: number;
  overlap: number;
}

export interface DocumentParser {
  parse(file: Buffer, fileType: string): Promise<string>;
}

export interface VectorUpsert {
  tenantId: string;
  documentId: string;
  chunks: Array<{ content: string; vector: number[] }>;
}

export interface TenantNamespace {
  tenantId: string;
  collectionName: string;
}

export const DocumentUploadSchema = z.object({
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  file: z.any(),
});

export const PromptSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  prompt: z.string().min(1),
  contentUrl: z.string().url().optional(),
  isDefault: z.boolean().default(false),
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;
export type PromptInput = z.infer<typeof PromptSchema>;

export class SimpleTextParser implements DocumentParser {
  async parse(file: Buffer, fileType: string): Promise<string> {
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      return file.toString('utf-8');
    }
    if (fileType === 'application/pdf') {
      return '[PDF content - requires pdf-parse]';
    }
    return file.toString('utf-8');
  }
}

export function chunkText(text: string, strategy: ChunkStrategy): string[] {
  const chunks: string[] = [];
  const { chunkSize, overlap } = strategy;
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  return chunks;
}

export function generateEmbeddings(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const hash = words.reduce((acc, word) => {
    return acc + word.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  }, 0);
  
  const embedding = new Array(384).fill(0).map((_, i) => {
    return Math.sin(hash + i) * Math.cos(hash * i + 1);
  });
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}
