export interface Project {
  id: string
  name: string
  status: 'normal' | 'delayed' | 'risk'
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
  status: 'normal' | 'blocked' | 'resolved'
  progress: number
  startDate: string
  endDate: string
  assignees: string[]
  dailyProgress?: string
  remark?: string
}

export interface TaskType {
  id: string
  name: string
  color: string
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