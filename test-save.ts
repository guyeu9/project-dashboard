import { saveAllData } from "./src/api/dataApi.js";

const testData = {
  projects: [
    {
      id: "test-project-1",
      name: "测试项目",
      status: "pending",
      progress: 0,
      startDate: "2024-01-01T00:00:00.000Z",
      endDate: "2024-12-31T00:00:00.000Z",
      partners: ["Partner A"],
      developers: ["Dev A"],
      testers: ["Tester A"],
      chatGroupLinks: [],
      contacts: [],
      dailyProgress: [],
    },
  ],
  tasks: [],
  taskTypes: [
    { id: "1", name: "开发排期", color: "#1890ff", enabled: true },
    { id: "2", name: "开发联调", color: "#52c41a", enabled: true },
    { id: "3", name: "测试排期", color: "#faad14", enabled: true },
    { id: "4", name: "测试联调", color: "#f5222d", enabled: true },
    { id: "5", name: "产品UAT", color: "#722ed1", enabled: true },
    { id: "6", name: "上线", color: "#13c2c2", enabled: true },
  ],
  pmos: [],
  productManagers: [],
};

console.log("开始测试保存数据...");
console.log("测试数据:", JSON.stringify(testData, null, 2));

try {
  const result = await saveAllData(testData);
  console.log("保存成功:", result);
} catch (error: any) {
  console.error("保存失败:", error.message);
  console.error("堆栈:", error.stack);
}
