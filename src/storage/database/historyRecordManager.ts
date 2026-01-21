import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  historyRecords,
  insertHistoryRecordSchema,
} from "./shared/schema";
import type { HistoryRecord, InsertHistoryRecord } from "./shared/schema";

export class HistoryRecordManager {
  async createHistoryRecord(data: InsertHistoryRecord): Promise<HistoryRecord> {
    const db = await getDb();
    const validated = insertHistoryRecordSchema.parse(data);
    const [record] = await db
      .insert(historyRecords as any)
      .values(validated as any)
      .returning();
    return record;
  }

  async getHistoryRecords(
    options: {
      skip?: number;
      limit?: number;
      entityType?: string;
      entityId?: string;
      projectId?: string;
    } = {}
  ): Promise<HistoryRecord[]> {
    const {
      skip = 0,
      limit = 100,
      entityType,
      entityId,
      projectId,
    } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (entityType !== undefined) {
      conditions.push(eq(historyRecords.entityType, entityType));
    }
    if (entityId !== undefined) {
      conditions.push(eq(historyRecords.entityId, entityId));
    }
    if (projectId !== undefined && projectId !== null) {
      conditions.push(eq(historyRecords.projectId, projectId));
    }

    let query = db.select().from(historyRecords as any);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query
      .limit(limit)
      .offset(skip)
      .orderBy((historyRecords as any).operatedAt);
  }

  async getHistoryRecordById(id: string): Promise<HistoryRecord | null> {
    const db = await getDb();
    const [record] = await db
      .select()
      .from(historyRecords as any)
      .where(eq((historyRecords as any).id, id));
    return record || null;
  }

  async getHistoryRecordsByProjectId(
    projectId: string
  ): Promise<HistoryRecord[]> {
    const db = await getDb();
    return db
      .select()
      .from(historyRecords as any)
      .where(eq((historyRecords as any).projectId, projectId))
      .orderBy((historyRecords as any).operatedAt);
  }

  async clearHistoryRecords(
    options: {
      entityType?: string;
      entityId?: string;
      projectId?: string;
    } = {}
  ): Promise<boolean> {
    const { entityType, entityId, projectId } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (entityType !== undefined) {
      conditions.push(eq((historyRecords as any).entityType, entityType));
    }
    if (entityId !== undefined) {
      conditions.push(eq((historyRecords as any).entityId, entityId));
    }
    if (projectId !== undefined && projectId !== null) {
      conditions.push(eq((historyRecords as any).projectId, projectId));
    }

    let query = db.delete(historyRecords as any);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return (result.rowCount ?? 0) > 0;
  }
}

export const historyRecordManager = new HistoryRecordManager();
