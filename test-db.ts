import { getAllData, saveAllData } from "./src/api/dataApi.js";

async function testDatabase() {
  console.log("[TEST] 开始测试数据库功能...");

  try {
    // 测试 1: 读取数据
    console.log("[TEST] 测试 1: 读取数据...");
    const data = await getAllData();
    console.log("[TEST] 读取数据成功:", JSON.stringify(data, null, 2));

    // 测试 2: 保存数据
    console.log("[TEST] 测试 2: 保存数据...");
    const testData = {
      projects: [
        {
          id: "test-db-1",
          name: "数据库测试项目",
          status: "pending",
          progress: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          partners: [],
          developers: ["Alice", "Bob"],
          testers: [],
          owner: "Alice",
          productManager: null,
          pmo: null,
          remark: "这是一个数据库测试项目",
          chatGroupLinks: [],
          contacts: [],
          dailyProgress: [],
        },
      ],
      tasks: [],
      taskTypes: [],
      pmos: [],
      productManagers: [],
    };
    await saveAllData(testData);
    console.log("[TEST] 保存数据成功");

    // 测试 3: 再次读取数据，验证保存
    console.log("[TEST] 测试 3: 验证保存...");
    const savedData = await getAllData();
    console.log(
      "[TEST] 保存后的数据:",
      JSON.stringify(savedData, null, 2)
    );

    console.log("[TEST] 所有测试通过！");
    process.exit(0);
  } catch (error: any) {
    console.error("[ERROR] 测试失败:", error);
    console.error("[ERROR] 错误详情:", error.message);
    console.error("[ERROR] 堆栈:", error.stack);
    process.exit(1);
  }
}

testDatabase();
