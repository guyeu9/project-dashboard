import { pgTable, index, varchar, timestamp, jsonb, boolean, integer, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// ==================== 表定义 ====================

export const historyRecords = pgTable("history_records", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	entityType: varchar("entity_type", { length: 20 }).notNull(),
	entityId: varchar("entity_id", { length: 36 }).notNull(),
	entityName: varchar("entity_name", { length: 255 }).notNull(),
	operation: varchar({ length: 20 }).notNull(),
	operator: varchar({ length: 100 }).notNull(),
	operatedAt: timestamp("operated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	changes: jsonb().notNull(),
	projectId: varchar("project_id", { length: 36 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("history_records_entity_id_idx").using("btree", table.entityId.asc().nullsLast().op("text_ops")),
	index("history_records_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("history_records_operated_at_idx").using("btree", table.operatedAt.asc().nullsLast().op("timestamptz_ops")),
	index("history_records_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
]);

export const pmos = pgTable("pmos", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("pmos_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const productManagers = pgTable("product_managers", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("product_managers_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const projects = pgTable("projects", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	progress: integer().default(0).notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	partners: jsonb().default([]).notNull(),
	developers: jsonb().default([]).notNull(),
	testers: jsonb().default([]).notNull(),
	owner: varchar({ length: 100 }),
	productManager: varchar("product_manager", { length: 36 }),
	pmo: varchar({ length: 36 }),
	remark: text(),
	chatGroupLinks: jsonb("chat_group_links").default([]).notNull(),
	contacts: jsonb().default([]).notNull(),
	dailyProgress: jsonb("daily_progress").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("projects_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("projects_pmo_idx").using("btree", table.pmo.asc().nullsLast().op("text_ops")),
	index("projects_product_manager_idx").using("btree", table.productManager.asc().nullsLast().op("text_ops")),
	index("projects_progress_idx").using("btree", table.progress.asc().nullsLast().op("int4_ops")),
	index("projects_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const taskTypes = pgTable("task_types", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	color: varchar({ length: 20 }).notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("task_types_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const tasks = pgTable("tasks", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	projectId: varchar("project_id", { length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: jsonb().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	progress: integer().default(0).notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	assignees: jsonb().default([]).notNull(),
	dailyProgress: text("daily_progress"),
	remark: text(),
	dailyRecords: jsonb("daily_records").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("tasks_progress_idx").using("btree", table.progress.asc().nullsLast().op("int4_ops")),
	index("tasks_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("tasks_start_date_idx").using("btree", table.startDate.asc().nullsLast().op("timestamptz_ops")),
	index("tasks_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

// ==================== Zod Schemas ====================

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
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

export type TaskType = typeof taskTypes.$inferSelect;
export type InsertTaskType = z.infer<typeof insertTaskTypeSchema>;
export type UpdateTaskType = z.infer<typeof updateTaskTypeSchema>;

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

export type PMO = typeof pmos.$inferSelect;
export type InsertPmo = z.infer<typeof insertPmoSchema>;
export type UpdatePmo = z.infer<typeof updatePmoSchema>;

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

export type ProductManager = typeof productManagers.$inferSelect;
export type InsertProductManager = z.infer<typeof insertProductManagerSchema>;
export type UpdateProductManager = z.infer<typeof updateProductManagerSchema>;

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

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

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

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

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

export const updateHistoryRecordSchema = createCoercedInsertSchema(historyRecords)
  .pick({
    entityType: true,
    entityName: true,
    operation: true,
    operator: true,
    changes: true,
    projectId: true,
  })
  .partial();

export type HistoryRecord = typeof historyRecords.$inferSelect;
export type InsertHistoryRecord = z.infer<typeof insertHistoryRecordSchema>;
export type UpdateHistoryRecord = z.infer<typeof updateHistoryRecordSchema>;
