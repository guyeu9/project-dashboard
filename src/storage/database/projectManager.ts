import { eq, and, SQL, or, desc, asc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  projects,
  insertProjectSchema,
  updateProjectSchema,
} from "./shared/schema";
import type { Project, InsertProject, UpdateProject } from "./shared/schema";

export class ProjectManager {
  async createProject(data: InsertProject): Promise<Project> {
    const db = await getDb();
    const validated = insertProjectSchema.parse(data);
    const [project] = await db.insert(projects).values(validated).returning();
    return project;
  }

  async getProjects(
    options: {
      skip?: number;
      limit?: number;
      status?: string;
      productManager?: string;
      pmo?: string;
    } = {}
  ): Promise<Project[]> {
    const { skip = 0, limit = 100, status, productManager, pmo } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (status !== undefined) {
      conditions.push(eq(projects.status, status));
    }
    if (productManager !== undefined && productManager !== null) {
      conditions.push(eq(projects.productManager, productManager));
    }
    if (pmo !== undefined && pmo !== null) {
      conditions.push(eq(projects.pmo, pmo));
    }

    let query = db.select().from(projects);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.limit(limit).offset(skip).orderBy(asc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const db = await getDb();
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || null;
  }

  async updateProject(id: string, data: UpdateProject): Promise<Project | null> {
    const db = await getDb();
    const validated = updateProjectSchema.parse(data);
    const [project] = await db
      .update(projects)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchProjects(keyword: string): Promise<Project[]> {
    const db = await getDb();
    return db
      .select()
      .from(projects)
      .where(
        or(
          // 简单的名称搜索，实际可以使用 pg 的全文搜索
          sql`${projects.name} ILIKE ${`%${keyword}%`}`
        )
      )
      .orderBy(asc(projects.createdAt));
  }

  async getProjectOptions(): Promise<Array<{ id: string; name: string }>> {
    const db = await getDb();
    return db
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects)
      .orderBy(projects.name);
  }
}

export const projectManager = new ProjectManager();
