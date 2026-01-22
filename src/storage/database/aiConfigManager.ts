import { eq, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  aiConfigs,
  insertAiConfigSchema,
  updateAiConfigSchema,
} from "./shared/schema";
import type { AIConfig, InsertAIConfig, UpdateAIConfig } from "./shared/schema";

export class AIConfigManager {
  async createAIConfig(data: InsertAIConfig): Promise<AIConfig> {
    const db = await getDb();
    const validated = insertAiConfigSchema.parse(data);
    const [config] = await db
      .insert(aiConfigs)
      .values(validated)
      .onConflictDoUpdate({
        target: aiConfigs.key,
        set: { value: validated.value, updatedAt: new Date() },
      })
      .returning();
    return config;
  }

  async getAIConfigs(): Promise<AIConfig[]> {
    const db = await getDb();
    return db
      .select()
      .from(aiConfigs)
      .orderBy(aiConfigs.key);
  }

  async getAIConfigByKey(key: string): Promise<AIConfig | null> {
    const db = await getDb();
    const [config] = await db
      .select()
      .from(aiConfigs)
      .where(eq(aiConfigs.key, key));
    return config || null;
  }

  async updateAIConfig(id: string, data: UpdateAIConfig): Promise<AIConfig | null> {
    const db = await getDb();
    const validated = updateAiConfigSchema.parse(data);
    const [config] = await db
      .update(aiConfigs)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(aiConfigs.id, id))
      .returning();
    return config || null;
  }

  async upsertAIConfig(key: string, value: string): Promise<AIConfig> {
    const db = await getDb();
    const [config] = await db
      .insert(aiConfigs)
      .values({
        id: `ai-config-${Date.now()}`,
        key,
        value,
      })
      .onConflictDoUpdate({
        target: aiConfigs.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return config;
  }

  async deleteAIConfig(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(aiConfigs).where(eq(aiConfigs.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const aiConfigManager = new AIConfigManager();
