import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  productManagers,
  insertProductManagerSchema,
  updateProductManagerSchema,
} from "./shared/schema";
import type {
  ProductManager,
  InsertProductManager,
  UpdateProductManager,
} from "./shared/schema";

export class ProductManagerManager {
  async createProductManager(
    data: InsertProductManager
  ): Promise<ProductManager> {
    const db = await getDb();
    const validated = insertProductManagerSchema.parse(data);
    const [productManager] = await db
      .insert(productManagers)
      .values(validated)
      .returning();
    return productManager;
  }

  async getProductManagers(
    options: { skip?: number; limit?: number; enabled?: boolean } = {}
  ): Promise<ProductManager[]> {
    const { skip = 0, limit = 100, enabled } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (enabled !== undefined) {
      conditions.push(eq(productManagers.enabled, enabled));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(productManagers)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip)
        .orderBy(productManagers.name);
    }

    return db
      .select()
      .from(productManagers)
      .limit(limit)
      .offset(skip)
      .orderBy(productManagers.name);
  }

  async getProductManagerById(id: string): Promise<ProductManager | null> {
    const db = await getDb();
    const [productManager] = await db
      .select()
      .from(productManagers)
      .where(eq(productManagers.id, id));
    return productManager || null;
  }

  async updateProductManager(
    id: string,
    data: UpdateProductManager
  ): Promise<ProductManager | null> {
    const db = await getDb();
    const validated = updateProductManagerSchema.parse(data);
    const [productManager] = await db
      .update(productManagers)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(productManagers.id, id))
      .returning();
    return productManager || null;
  }

  async deleteProductManager(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .delete(productManagers)
      .where(eq(productManagers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProductManagerOptions(): Promise<Array<{ id: string; name: string }>> {
    const db = await getDb();
    return db
      .select({
        id: productManagers.id,
        name: productManagers.name,
      })
      .from(productManagers)
      .where(eq(productManagers.enabled, true))
      .orderBy(productManagers.name);
  }
}

export const productManagerManager = new ProductManagerManager();
