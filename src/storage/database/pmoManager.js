import { eq, and } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { pmos, insertPmoSchema, updatePmoSchema, } from "./shared/schema";
export class PmoManager {
    async createPmo(data) {
        const db = await getDb();
        const validated = insertPmoSchema.parse(data);
        const [pmo] = await db.insert(pmos).values(validated).returning();
        return pmo;
    }
    async getPmos(options = {}) {
        const { skip = 0, limit = 100, enabled } = options;
        const db = await getDb();
        const conditions = [];
        if (enabled !== undefined) {
            conditions.push(eq(pmos.enabled, enabled));
        }
        if (conditions.length > 0) {
            return db
                .select()
                .from(pmos)
                .where(and(...conditions))
                .limit(limit)
                .offset(skip)
                .orderBy(pmos.name);
        }
        return db
            .select()
            .from(pmos)
            .limit(limit)
            .offset(skip)
            .orderBy(pmos.name);
    }
    async getPmoById(id) {
        const db = await getDb();
        const [pmo] = await db.select().from(pmos).where(eq(pmos.id, id));
        return pmo || null;
    }
    async updatePmo(id, data) {
        const db = await getDb();
        const validated = updatePmoSchema.parse(data);
        const [pmo] = await db
            .update(pmos)
            .set({ ...validated, updatedAt: new Date() })
            .where(eq(pmos.id, id))
            .returning();
        return pmo || null;
    }
    async deletePmo(id) {
        const db = await getDb();
        const result = await db.delete(pmos).where(eq(pmos.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    async getPmoOptions() {
        const db = await getDb();
        return db
            .select({
            id: pmos.id,
            name: pmos.name,
        })
            .from(pmos)
            .where(eq(pmos.enabled, true))
            .orderBy(pmos.name);
    }
}
export const pmoManager = new PmoManager();
