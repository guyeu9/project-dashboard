import { getDb } from "coze-coding-dev-sdk";
import {
  projects,
  tasks,
  taskTypes,
  pmos,
  productManagers,
  insertProjectSchema,
  insertTaskSchema,
  insertTaskTypeSchema,
  insertPmoSchema,
  insertProductManagerSchema,
} from "../storage/database";

// 从数据库读取所有数据
export async function getAllData() {
  try {
    const db = await getDb();

    const [projectsData, tasksData, taskTypesData, pmosData, productManagersData] =
      await Promise.all([
        db.select().from(projects as any).orderBy((projects as any).createdAt),
        db.select().from(tasks as any).orderBy((tasks as any).startDate),
        db.select().from(taskTypes as any).orderBy((taskTypes as any).name),
        db.select().from(pmos as any).orderBy((pmos as any).name),
        db.select().from(productManagers as any).orderBy((productManagers as any).name),
      ]);

    // 如果 taskTypes 为空，返回默认值
    const finalTaskTypes =
      taskTypesData.length > 0
        ? taskTypesData
        : [
            { id: "1", name: "开发排期", color: "#1890ff", enabled: true },
            { id: "2", name: "开发联调", color: "#52c41a", enabled: true },
            { id: "3", name: "测试排期", color: "#faad14", enabled: true },
            { id: "4", name: "测试联调", color: "#f5222d", enabled: true },
            { id: "5", name: "产品UAT", color: "#722ed1", enabled: true },
            { id: "6", name: "上线", color: "#13c2c2", enabled: true },
          ];

    return {
      projects: projectsData,
      tasks: tasksData,
      taskTypes: finalTaskTypes,
      pmos: pmosData,
      productManagers: productManagersData,
      historyRecords: [], // 历史记录可以按需加载
    };
  } catch (error: any) {
    console.error("[ERROR] 从数据库读取数据失败:", error.message);
    throw error;
  }
}

// 手动转换日期字符串为 ISO 格式
function normalizeDates(obj: any, dateFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;

  const result = { ...obj };

  for (const field of dateFields) {
    if (result[field] && typeof result[field] === 'string') {
      // 如果是 'YYYY-MM-DD' 格式，转换为 ISO 格式
      const dateStr = result[field];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // 使用 UTC 时间，避免时区问题
        const [year, month, day] = dateStr.split('-').map(Number)
        result[field] = new Date(Date.UTC(year, month - 1, day)).toISOString()
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}T/)) {
        // 已经是 ISO 格式，不需要转换
        result[field] = dateStr
      } else {
        // 尝试使用浏览器默认解析
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime())) {
          result[field] = parsed.toISOString()
        }
      }
    }
  }

  return result;
}

// 保存所有数据到数据库
export async function saveAllData(data: {
  projects: any[];
  tasks: any[];
  taskTypes: any[];
  pmos: any[];
  productManagers: any[];
  historyRecords?: any[];
}) {
  try {
    console.log('[saveAllData] 开始保存数据，项目数:', data.projects?.length, '任务数:', data.tasks?.length);

    const db = await getDb();

    // 使用事务确保数据一致性
    await db.transaction(async (tx) => {
      console.log('[saveAllData] 开始事务，清空现有数据');
      await tx.delete(tasks as any);
      await tx.delete(projects as any);
      await tx.delete(taskTypes as any);
      await tx.delete(pmos as any);
      await tx.delete(productManagers as any);

      // 插入新数据 - 直接插入，跳过 schema 验证
      if (data.projects && data.projects.length > 0) {
        const normalizedProjects = data.projects.map((project) =>
          normalizeDates(project, ['startDate', 'endDate'])
        );
        await tx.insert(projects as any).values(normalizedProjects as any);
      }

      if (data.tasks && data.tasks.length > 0) {
        const normalizedTasks = data.tasks.map((task) =>
          normalizeDates(task, ['startDate', 'endDate'])
        );
        await tx.insert(tasks as any).values(normalizedTasks as any);
      }

      if (data.taskTypes && data.taskTypes.length > 0) {
        await tx.insert(taskTypes as any).values(data.taskTypes as any);
      }

      if (data.pmos && data.pmos.length > 0) {
        await tx.insert(pmos as any).values(data.pmos as any);
      }

      if (data.productManagers && data.productManagers.length > 0) {
        await tx.insert(productManagers as any).values(data.productManagers as any);
      }
    });

    console.log("[INFO] 数据保存成功");
    return { ok: true, message: "数据保存成功" };
  } catch (error: any) {
    console.error("[ERROR] 保存数据到数据库失败:", error.message);
    console.error("[ERROR] 堆栈:", error.stack);
    throw error;
  }
}
