import { create } from 'zustand'
import { Project, Task, TaskType } from '../types'
import { mockProjects } from './mockData'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: '1',
    name: '开发排期',
    type: { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
    status: 'normal',
    progress: 80,
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    assignees: ['张三', '李四'],
    dailyRecords: [
      {
        date: '2026-01-01',
        progress: 10,
        status: 'normal',
        content: '项目启动，环境搭建完成',
        assignees: ['张三', '李四']
      },
      {
        date: '2026-01-02',
        progress: 25,
        status: 'risk',
        content: '遇到技术难点，需要协调资源',
        assignees: ['张三', '李四']
      },
      {
        date: '2026-01-03',
        progress: 30,
        status: 'normal',
        content: '技术问题解决，继续开发',
        assignees: ['张三', '李四']
      },
      {
        date: '2026-01-04',
        progress: 40,
        status: 'delayed',
        content: '联调接口延后，整体进度有延期风险',
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
    startDate: '2026-01-11',
    endDate: '2026-01-15',
    assignees: ['张三', '李四'],
    dailyRecords: [
      {
        date: '2026-01-11',
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
    startDate: '2026-01-16',
    endDate: '2026-01-25',
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
  deleteProject: (projectId: string) => void
  initializeData: () => void
}

const API_BASE_URL =
  (import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL
    ? (import.meta as any).env.VITE_API_BASE_URL
    : ''

const API_URL = `${API_BASE_URL}/api/data`

const defaultData: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[] } = {
  projects: mockProjects,
  tasks: mockTasks,
  taskTypes: [
    { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
    { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
    { id: '3', name: '测试排期', color: '#faad14', enabled: true },
    { id: '4', name: '测试联调', color: '#f5222d', enabled: true },
    { id: '5', name: '产品UAT', color: '#722ed1', enabled: true },
    { id: '6', name: '上线', color: '#13c2c2', enabled: true },
  ]
}

const syncFromServer = async (): Promise<{ projects: Project[]; tasks: Task[]; taskTypes: TaskType[] } | null> => {
  try {
    const res = await fetch(API_URL, { method: 'GET' })
    if (!res.ok) {
      return null
    }
    const data = await res.json()
    if (!data.projects || !data.tasks) {
      return null
    }
    return {
      projects: data.projects as Project[],
      tasks: data.tasks as Task[],
      taskTypes: (data.taskTypes || defaultData.taskTypes) as TaskType[],
    }
  } catch (error) {
    console.error('从服务端加载数据失败:', error)
    return null
  }
}

const saveToServer = async (data: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[] }) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('保存数据到服务端失败:', error)
  }
}

const useStore = create<AppState>((set, get) => {
  const applyAndPersist = (data: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[] }) => {
    set({ projects: data.projects, tasks: data.tasks, taskTypes: data.taskTypes })
    saveToServer(data)
  }

  syncFromServer().then((serverData) => {
    if (serverData) {
      applyAndPersist(serverData)
    } else {
      saveToServer(defaultData)
    }
  })

  return {
    projects: defaultData.projects,
    tasks: defaultData.tasks,
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
      const data = { projects, tasks: get().tasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    setTasks: (tasks) => {
      const data = { projects: get().projects, tasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    setTaskTypes: (taskTypes) => {
      const data = { projects: get().projects, tasks: get().tasks, taskTypes }
      applyAndPersist(data)
    },
    setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),
    
    addProject: (project) => {
      const newProjects = [...get().projects, project]
      const data = { projects: newProjects, tasks: get().tasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    updateProject: (projectId, updates) => {
      const newProjects = get().projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      const data = { projects: newProjects, tasks: get().tasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    addTask: (task) => {
      const newTasks = [...get().tasks, task]
      const data = { projects: get().projects, tasks: newTasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    updateTask: (taskId, updates) => {
      const newTasks = get().tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      const data = { projects: get().projects, tasks: newTasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    deleteTask: (taskId) => {
      const newTasks = get().tasks.filter((t) => t.id !== taskId)
      const data = { projects: get().projects, tasks: newTasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    deleteProject: (projectId) => {
      // 删除项目
      const newProjects = get().projects.filter(p => p.id !== projectId)
      // 删除关联任务
      const newTasks = get().tasks.filter(t => t.projectId !== projectId)
      const data = { projects: newProjects, tasks: newTasks, taskTypes: get().taskTypes }
      applyAndPersist(data)
    },
    initializeData: () => {
      syncFromServer().then((serverData) => {
        if (serverData) {
          applyAndPersist(serverData)
        } else {
          applyAndPersist(defaultData)
        }
      })
    },
  }
})

export default useStore
