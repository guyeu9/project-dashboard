// 测试创建项目的脚本
const testProject = {
  id: `test-project-${Date.now()}`,
  name: "测试项目",
  status: 'pending',
  progress: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  owner: 'admin',
  developers: [],
  testers: [],
  partners: [],
  remark: '测试项目',
  chatGroupLinks: [],
  contacts: [],
  dailyProgress: []
};

console.log('测试项目数据:', testProject);

// 模拟创建历史记录
const historyRecord = {
  id: `history-${Date.now()}`,
  entityType: 'project',
  entityId: testProject.id,
  entityName: testProject.name,
  operation: 'create',
  operator: 'admin',
  operatedAt: new Date().toISOString(),
  changes: { created: testProject }, // 添加 changes 字段
  projectId: testProject.id
};

console.log('历史记录数据:', historyRecord);

// 发送到后端
fetch('http://localhost:5000/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projects: [testProject],
    tasks: [],
    taskTypes: [],
    pmos: [],
    productManagers: [],
    historyRecords: [historyRecord]
  })
})
.then(res => res.json())
.then(data => {
  console.log('保存成功:', data);
})
.catch(error => {
  console.error('保存失败:', error);
});
