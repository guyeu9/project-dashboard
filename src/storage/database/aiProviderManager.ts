import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  aiProviders,
  insertAiProviderSchema,
  updateAiProviderSchema,
} from "./shared/schema";
import type { AIProvider, InsertAIProvider, UpdateAIProvider } from "./shared/schema";

export class AIProviderManager {
  async createAIProvider(data: InsertAIProvider): Promise<AIProvider> {
    const db = await getDb();
    const validated = insertAiProviderSchema.parse(data);
    const [provider] = await db
      .insert(aiProviders)
      .values(validated)
      .returning();
    return provider;
  }

  async getAIProviders(
    options: { skip?: number; limit?: number; enabled?: boolean; type?: string } = {}
  ): Promise<AIProvider[]> {
    const { skip = 0, limit = 100, enabled, type } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (enabled !== undefined) {
      conditions.push(eq(aiProviders.enabled, enabled));
    }
    if (type !== undefined) {
      conditions.push(eq(aiProviders.type, type));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(aiProviders)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip)
        .orderBy(aiProviders.name);
    }

    return db
      .select()
      .from(aiProviders)
      .limit(limit)
      .offset(skip)
      .orderBy(aiProviders.name);
  }

  async getAIProviderById(id: string): Promise<AIProvider | null> {
    const db = await getDb();
    const [provider] = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, id));
    return provider || null;
  }

  async updateAIProvider(id: string, data: UpdateAIProvider): Promise<AIProvider | null> {
    const db = await getDb();
    const validated = updateAiProviderSchema.parse(data);
    const [provider] = await db
      .update(aiProviders)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(aiProviders.id, id))
      .returning();
    return provider || null;
  }

  async deleteAIProvider(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(aiProviders).where(eq(aiProviders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async upsertAIProvider(data: InsertAIProvider): Promise<AIProvider> {
    const db = await getDb();
    const validated = insertAiProviderSchema.parse(data);
    const [provider] = await db
      .insert(aiProviders)
      .values(validated)
      .onConflictDoUpdate({
        target: aiProviders.id,
        set: {
          name: validated.name,
          baseUrl: validated.baseUrl,
          apiKey: validated.apiKey,
          model: validated.model,
          type: validated.type,
          enabled: validated.enabled,
          updatedAt: new Date(),
        },
      })
      .returning();
    return provider;
  }

  async syncProviders(providers: Array<{ id: string } & InsertAIProvider>): Promise<void> {
    const db = await getDb();

    for (const provider of providers) {
      await this.upsertAIProvider(provider);
    }

    // 删除不再存在的providers
    const existingProviders = await this.getAIProviders();
    const existingIds = existingProviders.map((p) => p.id);
    const newIds = providers.map((p) => p.id);
    const toDeleteIds = existingIds.filter((id) => !newIds.includes(id));

    for (const id of toDeleteIds) {
      await this.deleteAIProvider(id);
    }
  }
}

export const aiProviderManager = new AIProviderManager();
