import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  taskTypes,
  insertTaskTypeSchema,
  updateTaskTypeSchema,
} from "./shared/schema";
import type { TaskType, InsertTaskType, UpdateTaskType } from "./shared/schema";

export class TaskTypeManager {
  async createTaskType(data: InsertTaskType): Promise<TaskType> {
    const db = await getDb();
    const validated = insertTaskTypeSchema.parse(data);
    const [taskType] = await db
      .insert(taskTypes)
      .values(validated)
      .returning();
    return taskType;
  }

  async getTaskTypes(
    options: { skip?: number; limit?: number; enabled?: boolean } = {}
  ): Promise<TaskType[]> {
    const { skip = 0, limit = 100, enabled } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (enabled !== undefined) {
      conditions.push(eq(taskTypes.enabled, enabled));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(taskTypes)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip)
        .orderBy(taskTypes.name);
    }

    return db
      .select()
      .from(taskTypes)
      .limit(limit)
      .offset(skip)
      .orderBy(taskTypes.name);
  }

  async getTaskTypeById(id: string): Promise<TaskType | null> {
    const db = await getDb();
    const [taskType] = await db
      .select()
      .from(taskTypes)
      .where(eq(taskTypes.id, id));
    return taskType || null;
  }

  async updateTaskType(id: string, data: UpdateTaskType): Promise<TaskType | null> {
    const db = await getDb();
    const validated = updateTaskTypeSchema.parse(data);
    const [taskType] = await db
      .update(taskTypes)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(taskTypes.id, id))
      .returning();
    return taskType || null;
  }

  async deleteTaskType(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(taskTypes).where(eq(taskTypes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTaskTypeOptions(): Promise<
    Array<{ id: string; name: string; color: string }>
  > {
    const db = await getDb();
    return db
      .select({
        id: taskTypes.id,
        name: taskTypes.name,
        color: taskTypes.color,
      })
      .from(taskTypes)
      .where(eq(taskTypes.enabled, true))
      .orderBy(taskTypes.name);
  }
}

export const taskTypeManager = new TaskTypeManager();
