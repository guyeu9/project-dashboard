import { eq, and, SQL, or } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { tasks, insertTaskSchema, updateTaskSchema } from "./shared/schema";
import type { Task, InsertTask, UpdateTask } from "./shared/schema";

export class TaskManager {
  async createTask(data: InsertTask): Promise<Task> {
    const db = await getDb();
    const validated = insertTaskSchema.parse(data);
    const [task] = await db.insert(tasks).values(validated).returning();
    return task;
  }

  async getTasks(
    options: {
      skip?: number;
      limit?: number;
      projectId?: string;
      status?: string;
    } = {}
  ): Promise<Task[]> {
    const { skip = 0, limit = 100, projectId, status } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (projectId !== undefined) {
      conditions.push(eq(tasks.projectId, projectId));
    }
    if (status !== undefined) {
      conditions.push(eq(tasks.status, status));
    }

    let query = db.select().from(tasks);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.limit(limit).offset(skip).orderBy(tasks.startDate);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const db = await getDb();
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || null;
  }

  async getTasksByProjectId(projectId: string): Promise<Task[]> {
    const db = await getDb();
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.startDate);
  }

  async updateTask(id: string, data: UpdateTask): Promise<Task | null> {
    const db = await getDb();
    const validated = updateTaskSchema.parse(data);
    const [task] = await db
      .update(tasks)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteTasksByProjectId(projectId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(tasks).where(eq(tasks.projectId, projectId));
    return (result.rowCount ?? 0) > 0;
  }

  async searchTasks(keyword: string): Promise<Task[]> {
    const db = await getDb();
    return db
      .select()
      .from(tasks)
      .where(
        or(
          sql`${tasks.name} ILIKE ${`%${keyword}%`}`
        )
      )
      .orderBy(tasks.startDate);
  }
}

export const taskManager = new TaskManager();
