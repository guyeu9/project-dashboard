import { saveAllData } from "./src/api/dataApi.js";

const testData = {
  projects: [
    {
      id: "test-project-final-api",
      name: "最终测试项目 API",
      status: "pending",
      progress: 0,
      startDate: "2024-01-01T00:00:00.000Z",
      endDate: "2024-12-31T00:00:00.000Z",
      partners: ["Partner API"],
      developers: ["Dev API"],
      testers: ["Tester API"],
      chatGroupLinks: [],
      contacts: [],
      dailyProgress: [],
    },
  ],
  tasks: [],
  taskTypes: [
    { id: "1", name: "开发排期", "color": "#1890ff", "enabled": true },
    { id: "2", "name": "开发联调", "color": "#52c41a", "enabled": true },
    { id: "3", "name": "测试排期", "color": "#faad14", "enabled": true },
    { id: "4", "name": "测试联调", "color": "#f5222d", "enabled": true },
    { id: "5", "name": "产品UAT", "color": "#722ed1", "enabled": true },
    { id: "6", "name": "上线", "color": "#13c2c2", "enabled": true },
  ],
  pmos: [],
  productManagers: [],
};

console.log("开始最终测试保存数据...");
console.log("测试数据:", JSON.stringify(testData, null, 2).substring(0, 500));

try {
  const result = await saveAllData(testData);
  console.log("保存成功:", result);
} catch (error: any) {
  console.error("保存失败:", error.message);
  console.error("堆栈:", error.stack);
  process.exit(1);
}
