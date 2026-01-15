import { create } from 'zustand'
import { AIMessage, AIAnalysisContext, Project, Task } from '../types'

const AI_API_BASE_URL = 'https://api.gemai.cc'
const AI_API_KEY = 'sk-zmuSxlt6tJdSFTwc5fizTV8AUvuXN5OZBH7PTMZcSTEzVhxO'

// 状态映射函数
const statusMap = {
  'normal': '正常',
  'delayed': '延期',
  'risk': '风险',
  'completed': '已完成',
  'pending': '待开始'
}

const getStatusText = (status: string) => statusMap[status as keyof typeof statusMap] || status

// 默认提示词
const DEFAULT_SYSTEM_PROMPT = `你是一位拥有 10 年以上经验的互联网资深项目经理（PMO）和技术架构师。你擅长从碎片化的任务信息中洞察潜在风险、评估进度健康度，并提供改进策略。

Task:
我将为你提供一个或多个项目的详细介绍、任务排期、当前进度及已记录的风险点。请你基于这些数据进行深度审计，并输出一份《项目健康度分析报告》。

Analysis Dimensions:

进度偏离度评估：根据当前日期（请假设今天是 ${new Date().toLocaleDateString('zh-CN')}）和排期，分析哪些任务存在延期风险，计算整体进度是否符合预期。
关键路径识别：识别出影响项目上线的核心链路，判断当前资源是否倾斜在关键路径上。
风险深度洞察：除了我提供的风险点，请结合互联网项目经验，挖掘隐藏的风险（如：任务依赖冲突、人力负载过重、测试时间预留不足等）。

Output Format (请严格按此结构输出):

【核心风险预警】(按优先级排序，列出最致命的 3 个风险)
【进度偏差详情】(哪些任务滞后，预计延期多久)
【行动建议】(针对现有问题，给出具体的破局方案，如：砍需求、加人力、调整优先级等)
【提问环节】(为了更准确分析，你还需要我补充哪些维度的信息？)

以下是项目详细数据：`

async function callAIAPI(userPrompt: string, systemPrompt: string): Promise<string> {
  try {
    // 使用 Gemini 模型的 generateContent 接口
    const response = await fetch(`${AI_API_BASE_URL}/v1beta/models/[福利]gemini-3-flash-preview-maxthinking:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    // 解析 Gemini 响应格式
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('AI API Error:', error)
    throw error
  }
}

interface AIAnalysisState {
  modalVisible: boolean
  messages: AIMessage[]
  context: AIAnalysisContext | null
  loading: boolean
  systemPrompt: string
  
  openModal: (context: AIAnalysisContext) => void
  closeModal: () => void
  addMessage: (message: AIMessage) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setSystemPrompt: (prompt: string) => void
  analyzeProjects: (projects: Project[], tasks: Task[], context: AIAnalysisContext) => Promise<void>
  sendFollowUp: (question: string) => Promise<void>
}

const useAIAnalysisStore = create<AIAnalysisState>((set, get) => ({
  modalVisible: false,
  messages: [],
  context: null,
  loading: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,

  openModal: (context) => {
    set({ modalVisible: true, context, messages: [] })
  },

  closeModal: () => {
    set({ modalVisible: false, context: null, messages: [] })
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setSystemPrompt: (prompt) => {
    set({ systemPrompt: prompt })
  },

  analyzeProjects: async (projects, tasks, context) => {
    const { addMessage, setLoading, systemPrompt } = get()
    setLoading(true)

    try {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'system',
        content: '正在分析项目数据...',
        timestamp: new Date().toISOString()
      })

      const analysisData = prepareAnalysisData(projects, tasks, context)
      const userPrompt = analysisData.analysisData
      
      const analysisResult = await callAIAPI(userPrompt, systemPrompt)
      
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: analysisResult,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '分析过程中出现错误，请稍后重试。',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  },

  sendFollowUp: async (question) => {
    const { addMessage, setLoading, systemPrompt } = get()
    
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    })

    setLoading(true)

    try {
      const response = await callAIAPI(question, systemPrompt)

      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，处理您的问题时出现错误。',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }
}))

function prepareAnalysisData(projects: Project[], tasks: Task[], context: AIAnalysisContext) {
  let targetProjects = projects
  let targetTasks = tasks

  if (context.scope === 'single' && context.projectId) {
    targetProjects = projects.filter(p => p.id === context.projectId)
    targetTasks = tasks.filter(t => t.projectId === context.projectId)
  }

  const currentDate = new Date()

  // A. 总体概览
  const totalProjects = targetProjects.length
  const totalTasks = targetTasks.length
  
  const projectStatusStats = {
    normal: targetProjects.filter(p => p.status === 'normal').length,
    delayed: targetProjects.filter(p => p.status === 'delayed').length,
    risk: targetProjects.filter(p => p.status === 'risk').length,
    completed: targetProjects.filter(p => p.status === 'completed').length,
    pending: targetProjects.filter(p => p.status === 'pending').length
  }

  const taskStatusStats = {
    normal: targetTasks.filter(t => t.status === 'normal').length,
    delayed: targetTasks.filter(t => t.status === 'delayed').length,
    risk: targetTasks.filter(t => t.status === 'risk').length,
    completed: targetTasks.filter(t => t.status === 'completed').length,
    pending: targetTasks.filter(t => t.status === 'pending').length
  }

  const avgProgress = targetProjects.length > 0 
    ? Math.round(targetProjects.reduce((sum, p) => sum + p.progress, 0) / targetProjects.length)
    : 0

  // B. 项目概览（逐个项目）
  const projectOverview = targetProjects.map(p => {
    const startDate = new Date(p.startDate)
    const endDate = new Date(p.endDate)
    const usedDays = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const remainingDays = Math.max(0, Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    // 获取所有进展记录，按日期倒序排列
    const recentProgress = (p.dailyProgress || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      项目名称: p.name,
      项目ID: p.id,
      项目状态: getStatusText(p.status),
      整体进度: `${p.progress}%`,
      项目负责人: p.owner,
      产品经理: p.productManager || '未指定',
      PMO: p.pmo || '未指定',
      开发人员: p.developers.join('、'),
      测试人员: (p.testers || []).join('、'),
      合作伙伴: (p.partners || []).join('、'),
      项目周期: `${p.startDate} 至 ${p.endDate}`,
      已用天数: `${usedDays}天`,
      剩余天数: `${remainingDays}天`,
      项目备注: p.remark || '无',
      最近进展: recentProgress.map(record => 
        `${record.date}：${record.content}（进度：${record.progress}%，状态：${getStatusText(record.status)}）`
      ).join('\n') || '暂无进展记录'
    }
  })

  // C. 任务概览（逐个任务）
  const taskOverview = targetTasks.map(t => {
    const project = targetProjects.find(p => p.id === t.projectId)
    const startDate = new Date(t.startDate)
    const usedDays = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    // 获取所有每日记录，按日期倒序排列
    const recentRecords = (t.dailyRecords || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      任务名称: t.name,
      任务ID: t.id,
      任务类型: t.type.name,
      所属项目: project ? project.name : '未知项目',
      任务状态: getStatusText(t.status),
      完成进度: `${t.progress}%`,
      计划排期: `${t.startDate} 至 ${t.endDate}`,
      已用天数: `${usedDays}天`,
      执行人员: t.assignees.join('、'),
      任务备注: t.remark || '无',
      最近记录: recentRecords.map(record => 
        `${record.date}：${record.content}（进度：${record.progress}%，状态：${getStatusText(record.status)}）`
      ).join('\n') || '暂无记录'
    }
  })

  // D. 风险与延期分析
  const riskProjects = targetProjects.filter(p => p.status === 'risk').map(p => ({
    项目名称: p.name,
    风险描述: p.remark || '存在风险',
    项目进度: `${p.progress}%`,
    项目负责人: p.owner
  }))

  const delayedProjects = targetProjects.filter(p => p.status === 'delayed').map(p => {
    const endDate = new Date(p.endDate)
    const delayDays = Math.max(0, Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)))
    return {
      项目名称: p.name,
      延期天数: `${delayDays}天`,
      延期原因: p.remark || '进度滞后',
      项目进度: `${p.progress}%`,
      项目负责人: p.owner
    }
  })

  const riskTasks = targetTasks.filter(t => t.status === 'risk').map(t => {
    const project = targetProjects.find(p => p.id === t.projectId)
    return {
      任务名称: t.name,
      所属项目: project ? project.name : '未知项目',
      风险描述: t.remark || '存在风险',
      任务进度: `${t.progress}%`,
      执行人员: t.assignees.join('、')
    }
  })

  const delayedTasks = targetTasks.filter(t => t.status === 'delayed').map(t => {
    const project = targetProjects.find(p => p.id === t.projectId)
    const endDate = new Date(t.endDate)
    const delayDays = Math.max(0, Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)))
    return {
      任务名称: t.name,
      所属项目: project ? project.name : '未知项目',
      延期天数: `${delayDays}天`,
      延期原因: t.remark || '进度滞后',
      任务进度: `${t.progress}%`,
      执行人员: t.assignees.join('、')
    }
  })

  // 生成自然语言描述
  const overviewText = `
## A. 总体概览

**数据统计截止于：${currentDate.toLocaleDateString('zh-CN')}**

本次分析共涉及 ${totalProjects} 个项目，${totalTasks} 个任务。

**项目状态统计：**
- 正常项目：${projectStatusStats.normal} 个
- 延期项目：${projectStatusStats.delayed} 个
- 风险项目：${projectStatusStats.risk} 个
- 已完成项目：${projectStatusStats.completed} 个
- 待开始项目：${projectStatusStats.pending} 个

**任务状态统计：**
- 正常任务：${taskStatusStats.normal} 个
- 延期任务：${taskStatusStats.delayed} 个
- 风险任务：${taskStatusStats.risk} 个
- 已完成任务：${taskStatusStats.completed} 个
- 待开始任务：${taskStatusStats.pending} 个

**整体进度：** 平均项目进度为 ${avgProgress}%
`

  const projectText = `
## B. 项目概览

以下是各项目的详细信息：

${projectOverview.map((p, index) => `
### ${index + 1}. ${p.项目名称}

**基本信息：**
- 项目ID：${p.项目ID}
- 项目状态：${p.项目状态}
- 整体进度：${p.整体进度}

**项目团队：**
- 项目负责人：${p.项目负责人}
- 产品经理：${p.产品经理}
- PMO：${p.PMO}
- 开发人员：${p.开发人员}
- 测试人员：${p.测试人员}
- 合作伙伴：${p.合作伙伴}

**项目周期：**
- 计划周期：${p.项目周期}
- 已用天数：${p.已用天数}
- 剩余天数：${p.剩余天数}

**项目备注：** ${p.项目备注}

**最近进展：**
${p.最近进展.split('\n').map(line => `- ${line}`).join('\n')}
---
`).join('\n')}
`

  const taskText = `
## C. 任务概览

以下是各任务的详细信息：

${taskOverview.map((t, index) => `
### ${index + 1}. ${t.任务名称}

**基本信息：**
- 任务ID：${t.任务ID}
- 任务类型：${t.任务类型}
- 所属项目：${t.所属项目}
- 任务状态：${t.任务状态}

**任务排期：**
- 计划排期：${t.计划排期}
- 已用天数：${t.已用天数}

**执行人员：** ${t.执行人员}

**任务备注：** ${t.任务备注}

**最近记录：**
${t.最近记录.split('\n').map(line => `- ${line}`).join('\n')}
---
`).join('\n')}
`

  const riskText = `
## D. 风险与延期分析

### 风险项目列表
${riskProjects.length > 0 ? riskProjects.map(p => `
- **${p.项目名称}**
  - 风险描述：${p.风险描述}
  - 项目进度：${p.项目进度}
  - 项目负责人：${p.项目负责人}
`).join('') : '暂无风险项目'}

### 延期项目列表
${delayedProjects.length > 0 ? delayedProjects.map(p => `
- **${p.项目名称}**
  - 延期天数：${p.延期天数}
  - 延期原因：${p.延期原因}
  - 项目进度：${p.项目进度}
  - 项目负责人：${p.项目负责人}
`).join('') : '暂无延期项目'}

### 风险任务列表
${riskTasks.length > 0 ? riskTasks.map(t => `
- **${t.任务名称}**（所属项目：${t.所属项目}）
  - 风险描述：${t.风险描述}
  - 任务进度：${t.任务进度}
  - 执行人员：${t.执行人员}
`).join('') : '暂无风险任务'}

### 延期任务列表
${delayedTasks.length > 0 ? delayedTasks.map(t => `
- **${t.任务名称}**（所属项目：${t.所属项目}）
  - 延期天数：${t.延期天数}
  - 延期原因：${t.延期原因}
  - 任务进度：${t.任务进度}
  - 执行人员：${t.执行人员}
`).join('') : '暂无延期任务'}
`

  return {
    scope: context.scope,
    projectName: context.projectName,
    analysisData: overviewText + projectText + taskText + riskText,
    projects: targetProjects,
    tasks: targetTasks,
    totalProjects: targetProjects.length,
    totalTasks: targetTasks.length
  }
}

export default useAIAnalysisStore
