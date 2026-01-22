export type OperationType = 'create' | 'update' | 'delete'
export type EntityType = 'project' | 'task' | 'taskType' | 'pmo' | 'productManager'

export interface HistoryRecord {
  id: string
  entityType: EntityType
  entityId: string
  entityName: string
  operation: OperationType
  operator: string
  operatedAt: string
  changes?: Record<string, { from: unknown; to: unknown }>
  projectId?: string
}

export interface Project {
  id: string
  name: string
  status: 'normal' | 'delayed' | 'risk' | 'completed' | 'pending' | 'paused'
  progress: number
  startDate: string
  endDate: string
  partners: string[]
  developers: string[]
  testers: string[]
  owner: string
  remark?: string
  chatGroupLinks?: string[]
  contacts?: Contact[]
  // 新增字段
  productManager?: string
  pmo?: string
  dailyProgress?: DailyProgress[]  // 每日进度记录
}

export interface Contact {
  name: string
  role: string
  phone: string
}

export interface Task {
  id: string
  projectId: string
  name: string
  type: TaskType
  status: 'normal' | 'delayed' | 'risk' | 'completed' | 'pending'
  progress: number
  startDate: string
  endDate: string
  assignees: string[]
  dailyProgress?: string
  remark?: string
  // 新增字段
  dailyRecords?: DailyTaskRecord[]
}

export interface TaskType {
  id: string
  name: string
  color: string
  enabled: boolean
}

export interface PMO {
  id: string
  name: string
  enabled: boolean
}

export interface ProductManager {
  id: string
  name: string
  enabled: boolean
}

export interface ResourceSchedule {
  userId: string
  userName: string
  role: 'developer' | 'tester'
  tasks: Task[]
}

export interface TaskHistory {
  id: string
  taskId: string
  modifiedBy: string
  modifiedAt: string
  changes: Record<string, { from: unknown; to: unknown }>
}

export interface DailyProgress {
  date: string
  progress: number
  status: 'normal' | 'risk' | 'delayed'
  content: string
  taskType: 'development' | 'testing' | 'uat' | 'deployment'
  assignees: string[]
}

export interface DailyTaskRecord {
  date: string
  progress: number
  status: 'normal' | 'risk' | 'delayed'
  content: string
  assignees: string[]
}

export type NotificationStatus = 'pending' | 'confirmed'

export interface NotificationItem {
  id: string
  taskName: string
  taskId: string
  projectId: string
  remindTime: string
  createdAt: string
  status: NotificationStatus
  projectName: string
}

export type AIMessageRole = 'user' | 'assistant' | 'system'

export interface AIMessage {
  id: string
  role: AIMessageRole
  content: string
  timestamp: string
}

export type AIAnalysisScope = 'all' | 'single'

export interface AIAnalysisContext {
  scope: AIAnalysisScope
  projectId?: string
  projectName?: string
}

// 智能解析相关类型
export interface SmartParseResult {
  projectName: string
  projectRemark?: string
  personnel: PersonnelInfo
  schedules: ScheduleItem[]
}

export interface ScheduleItem {
  name: string
  startDate: string
  endDate: string
  duration: number
}

export interface PersonnelInfo {
  owner?: string
  developers: string[]
  testers: string[]
}