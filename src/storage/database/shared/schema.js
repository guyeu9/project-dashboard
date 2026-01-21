import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index, } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
// 任务类型表
export const taskTypes = pgTable("task_types", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    nameIdx: index("task_types_name_idx").on(table.name),
}));
// PMO人员表
export const pmos = pgTable("pmos", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    nameIdx: index("pmos_name_idx").on(table.name),
}));
// 产品经理表
export const productManagers = pgTable("product_managers", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    nameIdx: index("product_managers_name_idx").on(table.name),
}));
// 项目表
export const projects = pgTable("projects", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    progress: integer("progress").notNull().default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    partners: jsonb("partners").$type().default(sql `'[]'::jsonb`).notNull(),
    developers: jsonb("developers").$type().default(sql `'[]'::jsonb`).notNull(),
    testers: jsonb("testers").$type().default(sql `'[]'::jsonb`).notNull(),
    owner: varchar("owner", { length: 100 }),
    productManager: varchar("product_manager", { length: 36 }),
    pmo: varchar("pmo", { length: 36 }),
    remark: text("remark"),
    chatGroupLinks: jsonb("chat_group_links").$type().default(sql `'[]'::jsonb`).notNull(),
    contacts: jsonb("contacts").notNull().$type().default(sql `'[]'::jsonb`),
    dailyProgress: jsonb("daily_progress").notNull().$type().default(sql `'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    nameIdx: index("projects_name_idx").on(table.name),
    statusIdx: index("projects_status_idx").on(table.status),
    progressIdx: index("projects_progress_idx").on(table.progress),
    productManagerIdx: index("projects_product_manager_idx").on(table.productManager),
    pmoIdx: index("projects_pmo_idx").on(table.pmo),
}));
// 任务表
export const tasks = pgTable("tasks", {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("project_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: jsonb("type").notNull().$type(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    progress: integer("progress").notNull().default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    assignees: jsonb("assignees").$type().default(sql `'[]'::jsonb`).notNull(),
    dailyProgress: text("daily_progress"),
    remark: text("remark"),
    dailyRecords: jsonb("daily_records").notNull().$type().default(sql `'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
    statusIdx: index("tasks_status_idx").on(table.status),
    progressIdx: index("tasks_progress_idx").on(table.progress),
    startDateIdx: index("tasks_start_date_idx").on(table.startDate),
}));
// 历史记录表
export const historyRecords = pgTable("history_records", {
    id: varchar("id", { length: 36 }).primaryKey(),
    entityType: varchar("entity_type", { length: 20 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    entityName: varchar("entity_name", { length: 255 }).notNull(),
    operation: varchar("operation", { length: 20 }).notNull(),
    operator: varchar("operator", { length: 100 }).notNull(),
    operatedAt: timestamp("operated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    changes: jsonb("changes").notNull().$type(),
    projectId: varchar("project_id", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    entityTypeIdx: index("history_records_entity_type_idx").on(table.entityType),
    entityIdIdx: index("history_records_entity_id_idx").on(table.entityId),
    projectIdIdx: index("history_records_project_id_idx").on(table.projectId),
    operatedAtIdx: index("history_records_operated_at_idx").on(table.operatedAt),
}));
// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
    coerce: { date: true },
});
// TaskType Schemas
export const insertTaskTypeSchema = createCoercedInsertSchema(taskTypes).pick({
    id: true,
    name: true,
    color: true,
    enabled: true,
});
export const updateTaskTypeSchema = createCoercedInsertSchema(taskTypes)
    .pick({
    name: true,
    color: true,
    enabled: true,
})
    .partial();
// PMO Schemas
export const insertPmoSchema = createCoercedInsertSchema(pmos).pick({
    id: true,
    name: true,
    enabled: true,
});
export const updatePmoSchema = createCoercedInsertSchema(pmos)
    .pick({
    name: true,
    enabled: true,
})
    .partial();
// ProductManager Schemas
export const insertProductManagerSchema = createCoercedInsertSchema(productManagers).pick({
    id: true,
    name: true,
    enabled: true,
});
export const updateProductManagerSchema = createCoercedInsertSchema(productManagers)
    .pick({
    name: true,
    enabled: true,
})
    .partial();
// Project Schemas
export const insertProjectSchema = createCoercedInsertSchema(projects).pick({
    id: true,
    name: true,
    status: true,
    progress: true,
    startDate: true,
    endDate: true,
    partners: true,
    developers: true,
    testers: true,
    owner: true,
    productManager: true,
    pmo: true,
    remark: true,
    chatGroupLinks: true,
    contacts: true,
    dailyProgress: true,
});
export const updateProjectSchema = createCoercedInsertSchema(projects)
    .pick({
    name: true,
    status: true,
    progress: true,
    startDate: true,
    endDate: true,
    partners: true,
    developers: true,
    testers: true,
    owner: true,
    productManager: true,
    pmo: true,
    remark: true,
    chatGroupLinks: true,
    contacts: true,
    dailyProgress: true,
})
    .partial();
// Task Schemas
export const insertTaskSchema = createCoercedInsertSchema(tasks).pick({
    id: true,
    projectId: true,
    name: true,
    type: true,
    status: true,
    progress: true,
    startDate: true,
    endDate: true,
    assignees: true,
    dailyProgress: true,
    remark: true,
    dailyRecords: true,
});
export const updateTaskSchema = createCoercedInsertSchema(tasks)
    .pick({
    projectId: true,
    name: true,
    type: true,
    status: true,
    progress: true,
    startDate: true,
    endDate: true,
    assignees: true,
    dailyProgress: true,
    remark: true,
    dailyRecords: true,
})
    .partial();
// HistoryRecord Schemas
export const insertHistoryRecordSchema = createCoercedInsertSchema(historyRecords).pick({
    id: true,
    entityType: true,
    entityId: true,
    entityName: true,
    operation: true,
    operator: true,
    operatedAt: true,
    changes: true,
    projectId: true,
});
