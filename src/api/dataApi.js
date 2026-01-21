import { getDb } from "coze-coding-dev-sdk";
import { projects, tasks, taskTypes, pmos, productManagers, } from "../storage/database";
// 从数据库读取所有数据
export async function getAllData() {
    try {
        const db = await getDb();
        const [projectsData, tasksData, taskTypesData, pmosData, productManagersData] = await Promise.all([
            db.select().from(projects).orderBy(projects.createdAt),
            db.select().from(tasks).orderBy(tasks.startDate),
            db.select().from(taskTypes).orderBy(taskTypes.name),
            db.select().from(pmos).orderBy(pmos.name),
            db.select().from(productManagers).orderBy(productManagers.name),
        ]);
        // 如果 taskTypes 为空，返回默认值
        const finalTaskTypes = taskTypesData.length > 0
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
    }
    catch (error) {
        console.error("[ERROR] 从数据库读取数据失败:", error.message);
        throw error;
    }
}
// 保存所有数据到数据库
export async function saveAllData(data) {
    try {
        const db = await getDb();
        // 使用事务确保数据一致性
        await db.transaction(async (tx) => {
            // 清空现有数据
            await tx.delete(tasks);
            await tx.delete(projects);
            await tx.delete(taskTypes);
            await tx.delete(pmos);
            await tx.delete(productManagers);
            // 插入新数据
            if (data.projects && data.projects.length > 0) {
                await tx.insert(projects).values(data.projects);
            }
            if (data.tasks && data.tasks.length > 0) {
                await tx.insert(tasks).values(data.tasks);
            }
            if (data.taskTypes && data.taskTypes.length > 0) {
                await tx.insert(taskTypes).values(data.taskTypes);
            }
            if (data.pmos && data.pmos.length > 0) {
                await tx.insert(pmos).values(data.pmos);
            }
            if (data.productManagers && data.productManagers.length > 0) {
                await tx.insert(productManagers).values(data.productManagers);
            }
        });
        console.log("[INFO] 数据保存成功");
        return { ok: true, message: "数据保存成功" };
    }
    catch (error) {
        console.error("[ERROR] 保存数据到数据库失败:", error.message);
        throw error;
    }
}
