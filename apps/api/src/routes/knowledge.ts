import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { knowledgeBaseDocuments, knowledgeBasePrompts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router: any = Router();

// ========== Documents ==========

// GET /api/knowledge/documents
router.get('/documents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;

    const docs = await db
      .select()
      .from(knowledgeBaseDocuments)
      .where(and(eq(knowledgeBaseDocuments.tenantId, tenantId), eq(knowledgeBaseDocuments.isActive, true)));

    res.json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
});

// GET /api/knowledge/documents/:id
router.get('/documents/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const doc = await db
      .select()
      .from(knowledgeBaseDocuments)
      .where(and(eq(knowledgeBaseDocuments.id, id), eq(knowledgeBaseDocuments.tenantId, tenantId)))
      .limit(1);

    if (!doc.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, data: doc[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/knowledge/documents - Upload document
router.post('/documents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
    const { title, content, fileName, fileType } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // TODO: In future, parse file and generate real embeddings
    // For now, just store the document
    const doc = {
      id: uuidv4(),
      tenantId,
      title,
      content,
      fileName: fileName || `doc_${Date.now()}`,
      fileType: fileType || 'text/plain',
      fileSize: content.length,
      chunkCount: Math.ceil(content.length / 500), // Mock chunks
      vectorIds: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(knowledgeBaseDocuments).values(doc).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/knowledge/documents/:id
router.delete('/documents/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const doc = await db
      .select()
      .from(knowledgeBaseDocuments)
      .where(and(eq(knowledgeBaseDocuments.id, id), eq(knowledgeBaseDocuments.tenantId, tenantId)))
      .limit(1);

    if (!doc.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db
      .update(knowledgeBaseDocuments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(knowledgeBaseDocuments.id, id));

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
});

// ========== Prompts ==========

// GET /api/knowledge/prompts
router.get('/prompts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;

    const prompts = await db
      .select()
      .from(knowledgeBasePrompts)
      .where(and(eq(knowledgeBasePrompts.tenantId, tenantId), eq(knowledgeBasePrompts.isActive, true)));

    res.json({ success: true, data: prompts });
  } catch (error) {
    next(error);
  }
});

// POST /api/knowledge/prompts - Create prompt
router.post('/prompts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
    const { name, prompt, contentUrl, isDefault } = req.body;

    if (!name || !prompt) {
      return res.status(400).json({ error: 'Name and prompt are required' });
    }

    const newPrompt = {
      id: uuidv4(),
      tenantId,
      name,
      prompt,
      contentUrl: contentUrl || null,
      isDefault: isDefault || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(knowledgeBasePrompts).values(newPrompt).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/knowledge/prompts/:id
router.delete('/prompts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;

    const prompt = await db
      .select()
      .from(knowledgeBasePrompts)
      .where(and(eq(knowledgeBasePrompts.id, id), eq(knowledgeBasePrompts.tenantId, tenantId)))
      .limit(1);

    if (!prompt.length) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    await db
      .update(knowledgeBasePrompts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(knowledgeBasePrompts.id, id));

    res.json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
