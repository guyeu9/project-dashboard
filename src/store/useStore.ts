import { create } from 'zustand'
import { Project, Task, TaskType, HistoryRecord, PMO, ProductManager, SmartParseResult, ScheduleItem } from '../types'
import { mockProjects, mockPMOs, mockProductManagers } from './mockData'
import useAIAnalysisStore from './aiStore'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: '1',
    name: '开发排期',
    type: { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
    status: 'normal',
    progress: 80,
    startDate: '2026-01-01',
    endDate: '2026-01-13',
    assignees: ['张三'],
    dailyRecords: [
      {
        date: '2026-01-06',
        progress: 10,
        status: 'risk',
        content: '项目启动，环境搭建完成',
        assignees: ['张三', '李四']
      },
      {
        date: '2026-01-15',
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
    ],
    remark: ''
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
    ],
    remark: ''
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
    assignees: ['王五'],
    dailyRecords: []
  }
]

interface AppState {
  projects: Project[]
  tasks: Task[]
  taskTypes: TaskType[]
  pmos: PMO[]
  productManagers: ProductManager[]
  historyRecords: HistoryRecord[]
  selectedProjectId: string | null
  selectedStatus: string[]
  
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setTaskTypes: (taskTypes: TaskType[]) => void
  setPMOs: (pmos: PMO[]) => void
  setProductManagers: (productManagers: ProductManager[]) => void
  setSelectedProjectId: (projectId: string | null) => void
  setSelectedStatus: (status: string[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  deleteProject: (projectId: string) => void
  initializeData: () => void
  addHistoryRecord: (record: HistoryRecord) => void
  clearHistoryRecords: () => void
  clearAllData: () => void
  getHistoryRecords: (filters?: { projectId?: string; startDate?: string; endDate?: string }) => HistoryRecord[]
  startSyncInterval: () => void
  stopSyncInterval: () => void
  manualSync: () => Promise<void>
  analyzeProjects: (projects: Project[], tasks: Task[], context: any) => Promise<void>
  
  // 智能解析相关方法
  importPersonnel: (result: SmartParseResult) => void
  createTasksFromSchedule: (projectId: string, schedules: ScheduleItem[]) => void
}

const API_BASE_URL =
  (import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL
    ? (import.meta as any).env.VITE_API_BASE_URL
    : ''

const API_URL = `${API_BASE_URL}/api/data`

const defaultData: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[]; pmos: PMO[]; productManagers: ProductManager[]; historyRecords: HistoryRecord[] } = {
  projects: mockProjects,
  tasks: mockTasks,
  taskTypes: [
    { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
    { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
    { id: '3', name: '测试排期', color: '#faad14', enabled: true },
    { id: '4', name: '测试联调', color: '#f5222d', enabled: true },
    { id: '5', name: '产品UAT', color: '#722ed1', enabled: true },
    { id: '6', name: '上线', color: '#13c2c2', enabled: true },
  ],
  pmos: mockPMOs,
  productManagers: mockProductManagers,
  historyRecords: []
}

const syncFromServer = async (): Promise<{ projects: Project[]; tasks: Task[]; taskTypes: TaskType[]; pmos: PMO[]; productManagers: ProductManager[]; historyRecords: HistoryRecord[] } | null> => {
  try {
    const res = await fetch(API_URL, { method: 'GET' })
    if (!res.ok) {
      console.error('[ERROR] 从服务端加载数据失败:', res.status, res.statusText)
      return null
    }
    const data = await res.json()
    if (!data || typeof data !== 'object') {
      console.error('[ERROR] 服务端数据格式错误')
      return null
    }
    
    // 确保 projects 和 tasks 是数组，并填充缺失的字段
    const projects = Array.isArray(data.projects) ? data.projects.map((p: any) => ({
      id: p.id || '',
      name: p.name || '',
      status: p.status || 'pending',
      progress: typeof p.progress === 'number' ? p.progress : 0,
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      partners: Array.isArray(p.partners) ? p.partners : [],
      developers: Array.isArray(p.developers) ? p.developers : [],
      testers: Array.isArray(p.testers) ? p.testers : [],
      owner: p.owner || '',
      productManager: p.productManager || '',
      pmo: p.pmo || '',
      remark: p.remark || '',
      chatGroupLinks: Array.isArray(p.chatGroupLinks) ? p.chatGroupLinks : [],
      contacts: Array.isArray(p.contacts) ? p.contacts : [],
      dailyProgress: Array.isArray(p.dailyProgress) ? p.dailyProgress : []
    })) : []
    
    const tasks = Array.isArray(data.tasks) ? data.tasks.map((t: any) => ({
      id: t.id || '',
      projectId: t.projectId || '',
      name: t.name || '',
      type: t.type || { id: '', name: '', color: '', enabled: true },
      status: t.status || 'pending',
      progress: typeof t.progress === 'number' ? t.progress : 0,
      startDate: t.startDate || '',
      endDate: t.endDate || '',
      assignees: Array.isArray(t.assignees) ? t.assignees : [],
      dailyProgress: t.dailyProgress || '',
      remark: t.remark || '',
      dailyRecords: Array.isArray(t.dailyRecords) ? t.dailyRecords : []
    })) : []
    
    console.log('[INFO] 从服务端成功加载数据')
    return {
      projects: projects as Project[],
      tasks: tasks as Task[],
      taskTypes: (data.taskTypes || defaultData.taskTypes) as TaskType[],
      pmos: (data.pmos || defaultData.pmos) as PMO[],
      productManagers: (data.productManagers || defaultData.productManagers) as ProductManager[],
      historyRecords: (data.historyRecords || []) as HistoryRecord[],
    }
  } catch (error) {
    const err = error as Error
    console.error('[ERROR] 从服务端加载数据失败:', err.message)
    return null
  }
}

const isFirstRun = async (): Promise<boolean> => {
  try {
    const res = await fetch(API_URL, { method: 'GET' })
    if (!res.ok) {
      return true
    }
    const data = await res.json()
    // 如果数据不存在，或者数据是空对象（所有字段都是空数组），认为是首次运行
    if (!data || typeof data !== 'object') {
      return true
    }
    // 检查是否有实际的项目或任务数据（不仅仅是空数组）
    const hasProjects = Array.isArray(data.projects) && data.projects.length > 0
    const hasTasks = Array.isArray(data.tasks) && data.tasks.length > 0
    const hasPMOs = Array.isArray(data.pmos) && data.pmos.length > 0
    const hasProductManagers = Array.isArray(data.productManagers) && data.productManagers.length > 0
    const hasHistory = Array.isArray(data.historyRecords) && data.historyRecords.length > 0
    
    // 如果没有任何实际数据，认为是首次运行
    return !(hasProjects || hasTasks || hasPMOs || hasProductManagers || hasHistory)
  } catch (error) {
    console.error('检查是否首次运行失败:', error)
    return true
  }
}

const saveToServer = async (data: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[]; pmos: PMO[]; productManagers: ProductManager[]; historyRecords: HistoryRecord[] }) => {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000
  
  console.log('[DEBUG] saveToServer called with:', {
    projectsCount: data.projects.length,
    tasksCount: data.tasks.length,
    taskTypesCount: data.taskTypes.length,
    pmosCount: data.pmos.length,
    productManagersCount: data.productManagers.length,
    historyRecordsCount: data.historyRecords.length,
  })
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        console.log('[INFO] 数据保存成功')
        return
      }
      
      console.error(`[ERROR] 数据保存失败 (尝试 ${attempt}/${MAX_RETRIES}):`, res.status, res.statusText)
      
      if (attempt < MAX_RETRIES) {
        console.log(`[INFO] ${RETRY_DELAY}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    } catch (error) {
      const err = error as Error
      console.error(`[ERROR] 数据保存失败 (尝试 ${attempt}/${MAX_RETRIES}):`, err.message)
      
      if (attempt < MAX_RETRIES) {
        console.log(`[INFO] ${RETRY_DELAY}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }
  }
  
  console.error('[ERROR] 数据保存失败，已达到最大重试次数')
}

const useStore = create<AppState>((set, get) => {
  let syncInterval: number | null = null
  
  const applyAndPersist = (data: { projects: Project[]; tasks: Task[]; taskTypes: TaskType[]; pmos: PMO[]; productManagers: ProductManager[]; historyRecords: HistoryRecord[] }) => {
    set({ 
      projects: data.projects, 
      tasks: data.tasks, 
      taskTypes: data.taskTypes, 
      pmos: data.pmos, 
      productManagers: data.productManagers, 
      historyRecords: data.historyRecords 
    })
    saveToServer(data)
  }

  const startSyncInterval = () => {
    if (syncInterval) {
      clearInterval(syncInterval)
    }
    syncInterval = setInterval(async () => {
      const serverData = await syncFromServer()
      if (serverData) {
        set({
          projects: serverData.projects,
          tasks: serverData.tasks,
          taskTypes: serverData.taskTypes,
          historyRecords: serverData.historyRecords
        })
      }
    }, 30000)
  }

  const stopSyncInterval = () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }

  const manualSync = async () => {
    const serverData = await syncFromServer()
    if (serverData) {
      set({
        projects: serverData.projects,
        tasks: serverData.tasks,
        taskTypes: serverData.taskTypes,
        historyRecords: serverData.historyRecords
      })
    }
  }

  syncFromServer().then((serverData) => {
    if (serverData) {
      // 只更新状态，不立即保存（避免不必要的数据覆盖）
      set({
        projects: serverData.projects,
        tasks: serverData.tasks,
        taskTypes: serverData.taskTypes,
        pmos: serverData.pmos,
        productManagers: serverData.productManagers,
        historyRecords: serverData.historyRecords
      })
    } else {
      isFirstRun().then((firstRun) => {
        if (firstRun) {
          saveToServer(defaultData)
        } else {
          // 如果不是首次运行但服务器不可达，使用空数据而不是默认测试数据
          const emptyData = {
            projects: [],
            tasks: [],
            taskTypes: defaultData.taskTypes,
            pmos: [],
            productManagers: [],
            historyRecords: []
          }
          set(emptyData)
        }
      })
    }
    startSyncInterval()
  })

  return {
    projects: defaultData.projects,
    tasks: defaultData.tasks,
    taskTypes: defaultData.taskTypes,
    pmos: defaultData.pmos,
    productManagers: defaultData.productManagers,
    historyRecords: defaultData.historyRecords,
    selectedProjectId: null,
    selectedStatus: [],
    
    setProjects: (projects) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'project',
        entityId: 'batch',
        entityName: '项目列表',
        operation: 'update',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { projects: { from: get().projects, to: projects } }
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const data = {
        projects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ projects, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    setTasks: (tasks) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'task',
        entityId: 'batch',
        entityName: '任务列表',
        operation: 'update',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { tasks: { from: get().tasks, to: tasks } }
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const data = {
        projects: get().projects,
        tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ tasks, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    setTaskTypes: (taskTypes) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'taskType',
        entityId: 'batch',
        entityName: '任务类型',
        operation: 'update',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { taskTypes: { from: get().taskTypes, to: taskTypes } }
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const data = {
        projects: get().projects,
        tasks: get().tasks,
        taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ taskTypes, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    setPMOs: (pmos) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'pmo',
        entityId: 'batch',
        entityName: 'PMO',
        operation: 'update',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { pmos: { from: get().pmos, to: pmos } }
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const data = {
        projects: get().projects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ pmos, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    setProductManagers: (productManagers) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'productManager',
        entityId: 'batch',
        entityName: '产品经理',
        operation: 'update',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { productManagers: { from: get().productManagers, to: productManagers } }
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const data = {
        projects: get().projects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers,
        historyRecords: newHistoryRecords
      }
      set({ productManagers, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
    setSelectedStatus: (status) => set({ selectedStatus: status }),
    
    addProject: (project) => {
      console.log('[DEBUG] addProject called with project:', project.name)
      
      // 先创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'project',
        entityId: project.id,
        entityName: project.name,
        operation: 'create',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { created: project }, // 添加 changes 字段
        projectId: project.id
      }
      
      console.log('[DEBUG] Created history record:', historyRecord)
      
      // 更新数据并保存（包含历史记录）
      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const newProjects = [...get().projects, project]
      
      console.log('[DEBUG] New history records count:', newHistoryRecords.length)
      console.log('[DEBUG] Current projects count:', get().projects.length, '->', newProjects.length)
      
      const data = {
        projects: newProjects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      
      console.log('[DEBUG] Saving data with history records:', data.historyRecords.length)
      
      set({ projects: newProjects, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    updateProject: (projectId, updates) => {
      const project = get().projects.find(p => p.id === projectId)
      if (!project) return

      const newProjects = get().projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p))

      // 计算变更内容
      const changes: Record<string, { from: unknown; to: unknown }> = {}
      Object.entries(updates).forEach(([key, value]) => {
        if (project[key as keyof Project] !== value) {
          changes[key] = { from: project[key as keyof Project], to: value }
        }
      })

      // 创建历史记录（如果有变更）
      let newHistoryRecords = get().historyRecords
      if (Object.keys(changes).length > 0) {
        const historyRecord = {
          id: `history-${Date.now()}`,
          entityType: 'project',
          entityId: projectId,
          entityName: project.name,
          operation: 'update',
          operator: 'admin',
          operatedAt: new Date().toISOString(),
          changes,
          projectId: projectId
        }
        newHistoryRecords = [...get().historyRecords, historyRecord]
      }

      // 更新数据并保存（包含历史记录）
      const data = {
        projects: newProjects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ projects: newProjects, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    addTask: (task) => {
      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'task',
        entityId: task.id,
        entityName: task.name,
        operation: 'create',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { created: task }, // 添加 changes 字段
        projectId: task.projectId
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const newTasks = [...get().tasks, task]

      // 更新数据并保存（包含历史记录）
      const data = {
        projects: get().projects,
        tasks: newTasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ tasks: newTasks, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    updateTask: (taskId, updates) => {
      const task = get().tasks.find(t => t.id === taskId)
      if (!task) return

      const newTasks = get().tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))

      // 需要排除的字段（不记录变更或不参与比较）
      const excludedFields = ['dailyRecords']

      // 计算变更内容
      const changes: Record<string, { from: unknown; to: unknown }> = {}
      Object.entries(updates).forEach(([key, value]) => {
        // 跳过不需要比较的字段
        if (excludedFields.includes(key)) return

        const oldValue = task[key as keyof Task]
        // 使用 JSON.stringify 比较对象和数组，确保内容一致才认为无变化
        const oldValueStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue
        const newValueStr = typeof value === 'object' ? JSON.stringify(value) : value

        if (oldValueStr !== newValueStr) {
          changes[key] = { from: oldValue, to: value }
        }
      })

      // 创建历史记录（如果有变更）
      let newHistoryRecords = get().historyRecords
      if (Object.keys(changes).length > 0) {
        const historyRecord = {
          id: `history-${Date.now()}`,
          entityType: 'task',
          entityId: taskId,
          entityName: task.name,
          operation: 'update',
          operator: 'admin',
          operatedAt: new Date().toISOString(),
          changes,
          projectId: task.projectId
        }
        newHistoryRecords = [...get().historyRecords, historyRecord]
      }

      // 更新数据并保存（包含历史记录）
      const data = {
        projects: get().projects,
        tasks: newTasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ tasks: newTasks, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    deleteTask: (taskId) => {
      const task = get().tasks.find(t => t.id === taskId)
      if (!task) return

      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'task',
        entityId: taskId,
        entityName: task.name,
        operation: 'delete',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { deleted: task }, // 添加 changes 字段
        projectId: task.projectId
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const newTasks = get().tasks.filter((t) => t.id !== taskId)

      // 更新数据并保存（包含历史记录）
      const data = {
        projects: get().projects,
        tasks: newTasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ tasks: newTasks, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    deleteProject: (projectId) => {
      const project = get().projects.find(p => p.id === projectId)
      if (!project) return

      // 创建历史记录
      const historyRecord = {
        id: `history-${Date.now()}`,
        entityType: 'project',
        entityId: projectId,
        entityName: project.name,
        operation: 'delete',
        operator: 'admin',
        operatedAt: new Date().toISOString(),
        changes: { deleted: project }, // 添加 changes 字段
        projectId: projectId
      }

      const newHistoryRecords = [...get().historyRecords, historyRecord]
      const newProjects = get().projects.filter(p => p.id !== projectId)
      const newTasks = get().tasks.filter(t => t.projectId !== projectId)

      // 更新数据并保存（包含历史记录）
      const data = {
        projects: newProjects,
        tasks: newTasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: newHistoryRecords
      }
      set({ projects: newProjects, tasks: newTasks, historyRecords: newHistoryRecords })
      saveToServer(data)
    },
    initializeData: () => {
      syncFromServer().then((serverData) => {
        if (serverData) {
          applyAndPersist(serverData)
        } else {
          isFirstRun().then((firstRun) => {
            if (firstRun) {
              applyAndPersist(defaultData)
            } else {
              applyAndPersist({
                projects: [],
                tasks: [],
                taskTypes: defaultData.taskTypes,
                pmos: [],
                productManagers: [],
                historyRecords: []
              })
            }
          })
        }
      })
    },
    addHistoryRecord: (record) => {
      set(state => ({
        historyRecords: [...state.historyRecords, record]
      }))
      // 保存包含新历史记录的完整数据
      const data = {
        projects: get().projects,
        tasks: get().tasks,
        taskTypes: get().taskTypes,
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: [...get().historyRecords, record]
      }
      saveToServer(data)
    },
    clearHistoryRecords: () => {
      set({ historyRecords: [] })
      const data = { 
        projects: get().projects, 
        tasks: get().tasks, 
        taskTypes: get().taskTypes, 
        pmos: get().pmos,
        productManagers: get().productManagers,
        historyRecords: [] 
      }
      saveToServer(data)
    },
    clearAllData: () => {
      const emptyData = { 
        projects: [], 
        tasks: [], 
        taskTypes: defaultData.taskTypes, // 保留默认任务类型
        pmos: [],
        productManagers: [],
        historyRecords: [] 
      }
      set(emptyData)
      saveToServer(emptyData)
    },
    getHistoryRecords: (filters) => {
      let records = [...get().historyRecords]
      
      if (filters?.projectId) {
        records = records.filter(record => record.projectId === filters.projectId)
      }
      
      if (filters?.startDate) {
        const startDate = new Date(filters.startDate)
        records = records.filter(record => new Date(record.operatedAt) >= startDate)
      }
      
      if (filters?.endDate) {
        const endDate = new Date(filters.endDate)
        records = records.filter(record => new Date(record.operatedAt) <= endDate)
      }
      
      return records.sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime())
    },
    startSyncInterval,
    stopSyncInterval,
    manualSync,
    analyzeProjects: async (projects, tasks, context) => {
      const aiStore = useAIAnalysisStore.getState()
      await aiStore.analyzeProjects(projects, tasks, context)
    },
    
    // 智能解析相关方法
    importPersonnel: (result: SmartParseResult) => {
      const state = get()
      const allPersonnel = [...state.pmos, ...state.productManagers]
      
      if (result.personnel.owner) {
        const ownerExists = allPersonnel.some(p => p.name === result.personnel.owner)
        if (!ownerExists) {
          const newPMO = { id: `pmo-${Date.now()}`, name: result.personnel.owner, enabled: true }
          state.setPMOs([...state.pmos, newPMO])
        }
      }
      
      if (result.personnel.developers && result.personnel.developers.length > 0) {
        for (const dev of result.personnel.developers) {
          const devExists = allPersonnel.some(p => p.name === dev)
          if (!devExists) {
            const newPM = { id: `pm-${Date.now()}`, name: dev, enabled: true }
            state.setProductManagers([...state.productManagers, newPM])
          }
        }
      }
      
      if (result.personnel.testers && result.personnel.testers.length > 0) {
        for (const tester of result.personnel.testers) {
          const testerExists = allPersonnel.some(p => p.name === tester)
          if (!testerExists) {
            const newPM = { id: `pm-${Date.now()}`, name: tester, enabled: true }
            state.setProductManagers([...state.productManagers, newPM])
          }
        }
      }
    },
    
    createTasksFromSchedule: (projectId: string, schedules: ScheduleItem[]) => {
      const state = get()

      // 日期格式转换函数：YYYY.MM.DD -> YYYY-MM-DD
      const convertDate = (dateStr: string): string => {
        return dateStr.replace(/\./g, '-')
      }

      for (const schedule of schedules) {
        let taskType = state.taskTypes.find(t => t.name === schedule.name)

        // 如果找不到精确匹配，尝试模糊匹配
        if (!taskType) {
          if (schedule.name.includes('开发') && schedule.name.includes('联调')) {
            taskType = state.taskTypes.find(t => t.name === '开发联调')
          } else if (schedule.name.includes('测试') && schedule.name.includes('联调')) {
            taskType = state.taskTypes.find(t => t.name === '测试联调')
          } else if (schedule.name.includes('产品') || schedule.name.includes('UAT')) {
            taskType = state.taskTypes.find(t => t.name === '产品UAT')
          } else if (schedule.name.includes('上线') || schedule.name.includes('部署') || schedule.name.includes('发布')) {
            taskType = state.taskTypes.find(t => t.name === '上线')
          } else if (schedule.name.includes('测试')) {
            taskType = state.taskTypes.find(t => t.name === '测试排期')
          } else if (schedule.name.includes('开发')) {
            taskType = state.taskTypes.find(t => t.name === '开发排期')
          }
        }

        if (taskType) {
          const newTask = {
            id: `task-${Date.now()}`,
            projectId,
            name: schedule.name,
            type: taskType,
            status: 'normal' as const,
            progress: 0,
            startDate: convertDate(schedule.startDate),
            endDate: convertDate(schedule.endDate),
            assignees: [],
            dailyRecords: []
          }
          state.addTask(newTask)
        } else {
          console.warn(`[createTasksFromSchedule] 找不到匹配的任务类型: ${schedule.name}`)
        }
      }
    }
  }
})

export default useStore