import { create } from 'zustand'
import { Project, Task, TaskType } from '../types'
import { mockProjects } from './mockData'

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

const useStore = create<AppState>((set) => ({
  projects: mockProjects,
  tasks: [],
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
  
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setTaskTypes: (taskTypes) => set({ taskTypes }),
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
  initializeData: () => set({ projects: mockProjects }),
}))

export default useStore