import { create } from 'zustand'
import { Project, Task, TaskType } from '../types'
import { mockProjects } from './mockData'

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: '1',
    name: '开发排期',
    type: { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
    status: 'normal',
    progress: 80,
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    assignees: ['张三', '李四'],
    dailyRecords: [
      {
        date: '2024-01-01',
        progress: 10,
        status: 'normal',
        content: '项目启动，环境搭建完成',
        assignees: ['张三', '李四']
      },
      {
        date: '2024-01-02',
        progress: 25,
        status: 'risk',
        content: '遇到技术难点，需要协调资源',
        assignees: ['张三', '李四']
      },
      {
        date: '2024-01-03',
        progress: 30,
        status: 'normal',
        content: '技术问题解决，继续开发',
        assignees: ['张三', '李四']
      }
    ]
  },
  {
    id: 'task-2',
    projectId: '1',
    name: '开发联调',
    type: { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
    status: 'normal',
    progress: 60,
    startDate: '2024-01-11',
    endDate: '2024-01-15',
    assignees: ['张三', '李四'],
    dailyRecords: [
      {
        date: '2024-01-11',
        progress: 50,
        status: 'normal',
        content: '开始联调测试',
        assignees: ['张三', '李四']
      }
    ]
  },
  {
    id: 'task-3',
    projectId: '1',
    name: '测试排期',
    type: { id: '3', name: '测试排期', color: '#faad14', enabled: true },
    status: 'normal',
    progress: 40,
    startDate: '2024-01-16',
    endDate: '2024-01-25',
    assignees: ['王五', '赵六'],
    dailyRecords: []
  }
]

interface AppState {
  projects: Project[]
  tasks: Task[]
  taskTypes: TaskType[]
  selectedProjectId: string | null
  selectedStatus: string[]
  
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setTaskTypes: (taskTypes: TaskType[]) => void
  setSelectedProjectId: (projectId: string | null) => void
  setSelectedStatus: (status: string[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  initializeData: () => void
}

// localStorage 数据持久化工具
const STORAGE_KEY = 'project-management-data'

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return {
        projects: data.projects || mockProjects,
        tasks: data.tasks || mockTasks,
      }
    }
  } catch (error) {
    console.error('加载本地存储数据失败:', error)
  }
  return {
    projects: mockProjects,
    tasks: mockTasks,
  }
}

const saveToStorage = (data: { projects: Project[], tasks: Task[] }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('保存本地存储数据失败:', error)
  }
}

const useStore = create<AppState>((set, get) => {
  // 初始化时从本地存储加载数据
  const initialData = loadFromStorage()
  
  return {
    projects: initialData.projects,
    tasks: initialData.tasks,
    taskTypes: [
      { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
      { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
      { id: '3', name: '测试排期', color: '#faad14', enabled: true },
      { id: '4', name: '测试联调', color: '#f5222d', enabled: true },
      { id: '5', name: '产品UAT', color: '#722ed1', enabled: true },
      { id: '6', name: '上线', color: '#13c2c2', enabled: true },
    ],
    selectedProjectId: null,
    selectedStatus: [],
    
    setProjects: (projects) => {
      set({ projects })
      saveToStorage({ projects, tasks: get().tasks })
    },
    setTasks: (tasks) => {
      set({ tasks })
      saveToStorage({ projects: get().projects, tasks })
    },
    setTaskTypes: (taskTypes) => set({ taskTypes }),
    setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),
    
    addProject: (project) => {
      const newProjects = [...get().projects, project]
      set({ projects: newProjects })
      saveToStorage({ projects: newProjects, tasks: get().tasks })
    },
    updateProject: (projectId, updates) => {
      const newProjects = get().projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      set({ projects: newProjects })
      saveToStorage({ projects: newProjects, tasks: get().tasks })
    },
    addTask: (task) => {
      const newTasks = [...get().tasks, task]
      set({ tasks: newTasks })
      saveToStorage({ projects: get().projects, tasks: newTasks })
    },
    updateTask: (taskId, updates) => {
      const newTasks = get().tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      set({ tasks: newTasks })
      saveToStorage({ projects: get().projects, tasks: newTasks })
    },
    deleteTask: (taskId) => {
      const newTasks = get().tasks.filter((t) => t.id !== taskId)
      set({ tasks: newTasks })
      saveToStorage({ projects: get().projects, tasks: newTasks })
    },
    initializeData: () => {
      const data = loadFromStorage()
      set(data)
    },
  }
})

export default useStore