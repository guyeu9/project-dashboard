import { Project, Task, TaskType, PMO, ProductManager } from '../types'

export const testProjects: Project[] = [
  {
    id: 'test-1',
    name: '测试项目-完整字段',
    status: 'normal',
    progress: 50,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    partners: ['合作方A', '合作方B（特殊字符）'],
    developers: ['开发者张三', '开发者李四', '开发者Wang'],
    testers: ['测试员王五'],
    owner: '项目经理A',
    remark: '这是一个包含所有字段的测试项目',
    chatGroupLinks: ['https://chat.example.com/1', 'https://work.weixin.qq.com/abc'],
    contacts: [
      { name: '联系人A', role: '技术负责人', phone: '13800138001' },
      { name: '联系人B', role: '业务对接人', phone: '13800138002' }
    ],
    productManager: '产品经理A',
    pmo: 'PMO-A',
    dailyProgress: [
      {
        date: '2026-01-15',
        progress: 30,
        status: 'normal',
        content: '完成需求分析，开始设计',
        taskType: 'development',
        assignees: ['开发者张三']
      },
      {
        date: '2026-01-16',
        progress: 35,
        status: 'risk',
        content: '遇到技术难点，可能延期',
        taskType: 'development',
        assignees: ['开发者张三', '开发者李四']
      }
    ]
  },
  {
    id: 'test-2',
    name: '测试项目-特殊字符',
    status: 'risk',
    progress: 25,
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    partners: ['合作方"Quotes" & 符号'],
    developers: ['开发者_a-b_c', '开发者123数字'],
    testers: ['测试员@符号'],
    owner: '项目经理"B"',
    remark: '包含各种特殊字符：\n换行符、回车符\t制表符',
    chatGroupLinks: ['https://example.com/path?param=value&foo=bar'],
    contacts: [
      { name: '联系人"Quotes"', role: '经理>主管', phone: '139-0013-9001' }
    ],
    productManager: '产品经理B',
    pmo: 'PMO-B'
  },
  {
    id: 'test-3',
    name: '测试项目-空值测试',
    status: 'pending',
    progress: 0,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    partners: [],
    developers: [],
    testers: [],
    owner: '项目经理C',
    productManager: undefined,
    pmo: undefined,
    remark: undefined,
    chatGroupLinks: undefined,
    contacts: undefined,
    dailyProgress: undefined
  },
  {
    id: 'test-4',
    name: '测试项目-最大数据量',
    status: 'normal',
    progress: 100,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    partners: Array.from({ length: 10 }, (_, i) => `合作方${i + 1}`),
    developers: Array.from({ length: 20 }, (_, i) => `开发者${i + 1}`),
    testers: Array.from({ length: 15 }, (_, i) => `测试员${i + 1}`),
    owner: '项目经理D',
    remark: '这是一个包含大量人员的测试项目，用于测试数组字段的导出导入',
    productManager: '产品经理D',
    pmo: 'PMO-D',
    dailyProgress: Array.from({ length: 365 }, (_, i) => ({
      date: `2025-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      progress: Math.min(100, i * 0.3),
      status: (['normal', 'risk', 'delayed'] as const)[i % 3],
      content: `第${i + 1}天进度报告：完成部分开发工作`,
      taskType: (['development', 'testing', 'uat'] as const)[i % 3],
      assignees: [`开发者${(i % 20) + 1}`]
    }))
  }
]

export const testTaskTypes: TaskType[] = [
  { id: 'type-1', name: '开发排期', color: '#1890ff', enabled: true },
  { id: 'type-2', name: '开发联调', color: '#52c41a', enabled: true },
  { id: 'type-3', name: '测试排期', color: '#faad14', enabled: true },
  { id: 'type-4', name: '测试联调', color: '#f5222d', enabled: true },
  { id: 'type-5', name: '产品UAT', color: '#722ed1', enabled: true },
  { id: 'type-6', name: '上线', color: '#13c2c2', enabled: true },
  { id: 'type-7', name: '已禁用类型', color: '#999999', enabled: false }
]

export const testTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'test-1',
    name: '需求分析任务',
    type: testTaskTypes[0],
    status: 'completed',
    progress: 100,
    startDate: '2026-01-01',
    endDate: '2026-01-15',
    assignees: ['开发者张三'],
    dailyProgress: '完成需求文档编写',
    remark: '需求分析阶段',
    dailyRecords: [
      {
        date: '2026-01-05',
        progress: 30,
        status: 'normal',
        content: '收集用户需求',
        assignees: ['开发者张三']
      },
      {
        date: '2026-01-10',
        progress: 80,
        status: 'normal',
        content: '完成需求文档',
        assignees: ['开发者张三']
      }
    ]
  },
  {
    id: 'task-2',
    projectId: 'test-1',
    name: '开发实现任务',
    type: testTaskTypes[1],
    status: 'normal',
    progress: 60,
    startDate: '2026-01-16',
    endDate: '2026-02-28',
    assignees: ['开发者张三', '开发者李四'],
    dailyProgress: '核心功能开发中',
    remark: '开发阶段',
    dailyRecords: [
      {
        date: '2026-01-20',
        progress: 20,
        status: 'normal',
        content: '完成基础框架搭建',
        assignees: ['开发者张三']
      },
      {
        date: '2026-01-25',
        progress: 50,
        status: 'risk',
        content: '遇到技术难点，可能延期',
        assignees: ['开发者张三', '开发者李四']
      }
    ]
  },
  {
    id: 'task-3',
    projectId: 'test-2',
    name: '测试任务-特殊字符',
    type: testTaskTypes[2],
    status: 'pending',
    progress: 0,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    assignees: ['测试员@符号'],
    remark: '包含特殊字符的测试任务'
  },
  {
    id: 'task-4',
    projectId: 'test-3',
    name: '空值测试任务',
    type: testTaskTypes[3],
    status: 'pending',
    progress: 0,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    assignees: [],
    dailyProgress: undefined,
    remark: undefined,
    dailyRecords: undefined
  }
]

export const testPMOs: PMO[] = [
  { id: 'pmo-test-1', name: '测试PMO-A', enabled: true },
  { id: 'pmo-test-2', name: '测试PMO-B', enabled: true },
  { id: 'pmo-test-3', name: '已禁用PMO', enabled: false }
]

export const testProductManagers: ProductManager[] = [
  { id: 'pm-test-1', name: '测试产品经理A', enabled: true },
  { id: 'pm-test-2', name: '测试产品经理B', enabled: true },
  { id: 'pm-test-3', name: '已禁用产品经理', enabled: false }
]

export const testData = {
  projects: testProjects,
  tasks: testTasks,
  taskTypes: testTaskTypes,
  pmos: testPMOs,
  productManagers: testProductManagers
}
