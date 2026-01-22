import { create } from 'zustand'
import { AIMessage, AIAnalysisContext, Project, Task } from '../types'
import { aiConfigManager } from '../storage/database/aiConfigManager'
import { aiProviderManager } from '../storage/database/aiProviderManager'

// AI 服务提供商类型
export type AIProviderType = 'gemini' | 'openai'

// AI 服务提供商接口
export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  model: string
  type: AIProviderType
  enabled: boolean
}

// 模型信息接口
export interface AIModel {
  id: string
  name: string
  description?: string
}

// 预设的 AI 服务提供商
const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini-default',
    name: 'Gemini (默认)',
    baseUrl: 'https://api.gemai.cc',
    apiKey: 'sk-zmuSxlt6tJdSFTwc5fizTV8AUvuXN5OZBH7PTMZcSTEzVhxO',
    model: '[福利]gemini-3-flash-preview-maxthinking',
    type: 'gemini',
    enabled: true
  },
  {
    id: 'newapi-default',
    name: 'New API',
    baseUrl: 'https://api.zscc.in',
    apiKey: 'sk-HRZftNK26TslqURsawczI1nJnJVpA0jBi6m28B5jwDkfzIVI',
    model: 'gpt-4o-mini',
    type: 'openai',
    enabled: true
  }
]

// 从数据库加载系统提示词
async function loadSystemPromptFromDB(): Promise<string> {
  try {
    const config = await aiConfigManager.getAIConfigByKey('system_prompt')
    if (config) {
      return config.value
    }
  } catch (error) {
    console.error('Failed to load system prompt from database:', error)
  }
  return DEFAULT_SYSTEM_PROMPT
}

// 保存系统提示词到数据库
async function saveSystemPromptToDB(prompt: string): Promise<void> {
  try {
    await aiConfigManager.upsertAIConfig('system_prompt', prompt)
  } catch (error) {
    console.error('Failed to save system prompt to database:', error)
  }
}

// 从数据库加载AI提供商
async function loadProvidersFromDB(): Promise<AIProvider[]> {
  try {
    const dbProviders = await aiProviderManager.getAIProviders()
    if (dbProviders.length > 0) {
      return dbProviders.map(p => ({
        id: p.id,
        name: p.name,
        baseUrl: p.baseUrl,
        apiKey: p.apiKey,
        model: p.model,
        type: p.type as AIProviderType,
        enabled: p.enabled,
      }))
    }
  } catch (error) {
    console.error('Failed to load providers from database:', error)
  }

  // 如果数据库中没有数据，使用默认值并保存到数据库
  try {
    for (const provider of DEFAULT_PROVIDERS) {
      await aiProviderManager.createAIProvider(provider)
    }
  } catch (error) {
    console.error('Failed to save default providers to database:', error)
  }

  return DEFAULT_PROVIDERS
}

// 保存AI提供商到数据库
async function saveProvidersToDB(providers: AIProvider[]): Promise<void> {
  try {
    await aiProviderManager.syncProviders(providers)
  } catch (error) {
    console.error('Failed to save providers to database:', error)
  }
}

// 从数据库加载当前选中的提供商ID
async function loadCurrentProviderIdFromDB(): Promise<string> {
  try {
    const config = await aiConfigManager.getAIConfigByKey('current_provider_id')
    if (config) {
      return config.value
    }
  } catch (error) {
    console.error('Failed to load current provider ID from database:', error)
  }
  return DEFAULT_PROVIDERS[0].id
}

// 保存当前选中的提供商ID到数据库
async function saveCurrentProviderIdToDB(providerId: string): Promise<void> {
  try {
    await aiConfigManager.upsertAIConfig('current_provider_id', providerId)
  } catch (error) {
    console.error('Failed to save current provider ID to database:', error)
  }
}

// 获取 OpenAI 兼容 API 的模型列表
async function fetchOpenAIModels(baseUrl: string, apiKey: string): Promise<AIModel[]> {
  try {
    console.log('Fetching OpenAI models from:', baseUrl)
    
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch models:', errorText)
      throw new Error(`Failed to fetch models: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Models response:', data)

    // OpenAI API 返回格式: { object: "list", data: [{ id: "gpt-4", ... }] }
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        description: model.description || ''
      }))
    }

    return []
  } catch (error) {
    console.error('Error fetching OpenAI models:', error)
    throw error
  }
}

// 获取 Gemini API 的模型列表
async function fetchGeminiModels(baseUrl: string, apiKey: string): Promise<AIModel[]> {
  try {
    console.log('Fetching Gemini models from:', baseUrl)
    
    // Gemini API 使用不同的端点来获取模型列表
    const response = await fetch(`${baseUrl}/v1beta/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch Gemini models:', errorText)
      throw new Error(`Failed to fetch Gemini models: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('[Gemini Models] Raw response:', JSON.stringify(data).substring(0, 500) + '...')
    
    // Gemini API 返回格式：{ models: [{ name: "models/gemini-pro", ... }] }
    if (data.models && Array.isArray(data.models)) {
      console.log(`[Gemini Models] Found ${data.models.length} models`)
      
      // 不过滤模型，直接返回所有模型
      // 因为 Gemini 模型名称可能不包含 'generateContent' 关键词
      return data.models.map((model: any) => ({
        id: model.name,
        name: model.displayName || model.name,
        description: model.description || ''
      }))
    }
    
    console.warn('[Gemini Models] No models found or invalid format')
    return []
  } catch (error) {
    console.error('Error fetching Gemini models:', error)
    throw error
  }
}

// 获取 AI 服务提供商的模型列表
export async function fetchProviderModels(provider: AIProvider): Promise<AIModel[]> {
  if (provider.type === 'openai') {
    return await fetchOpenAIModels(provider.baseUrl, provider.apiKey)
  } else if (provider.type === 'gemini') {
    return await fetchGeminiModels(provider.baseUrl, provider.apiKey)
  } else {
    throw new Error(`Unsupported provider type: ${provider.type}`)
  }
}

// 状态映射函数
const statusMap = {
  'normal': '正常',
  'delayed': '延期',
  'risk': '风险',
  'completed': '已完成',
  'pending': '待开始',
  'paused': '暂停'
}

const getStatusText = (status: string) => statusMap[status as keyof typeof statusMap] || status

// 翻译函数：将英文文本翻译为中文
async function translateToChinese(text: string): Promise<string> {
  if (!text.trim()) {
    console.log('[Translation] Text is empty, skipping')
    return text
  }
  
  // 检查是否包含足够的中文，而不是要求完全中文
  const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const totalCharCount = text.length;
  const chineseRatio = totalCharCount > 0 ? chineseCharCount / totalCharCount : 0;
  
  console.log(`[Translation] Text analysis - Total chars: ${totalCharCount}, Chinese chars: ${chineseCharCount}, Chinese ratio: ${(chineseRatio * 100).toFixed(2)}%`)
  
  // 如果中文占比超过20%，认为已经是中文，直接返回
  if (chineseRatio > 0.2) {
    console.log('[Translation] Text is already Chinese (ratio > 20%), skipping translation')
    return text
  }
  
  console.log('[Translation] Text appears to be English, attempting translation...')
  console.log('[Translation] Text to translate (first 200 chars):', text.substring(0, 200) + '...')
  
  // 尝试使用浏览器内置的翻译API（如果可用）
  try {
    // 检查是否有翻译API
    if (typeof window !== 'undefined' && 'translation' in window.navigator) {
      console.log('[Translation] Using browser translation API')
      // @ts-ignore - browser translation API
      const result = await (window.navigator as any).translation.translate(text, 'zh-CN')
      console.log('[Translation] Browser translation result:', result)
      return result
    }
  } catch (error) {
    console.log('[Translation] Browser translation API not available or failed:', error)
  }
  
  // 如果浏览器翻译不可用，返回原文并记录警告
  console.warn('[Translation] No translation service available, returning original text')
  console.warn('[Translation] Please improve system prompt to ensure AI returns Chinese directly')
  
  return text
}

// 默认提示词
const DEFAULT_SYSTEM_PROMPT = `你是一位拥有 10 年以上经验的互联网资深项目经理，国内互联网大厂的项目总监。你擅长用中文进行犀利的项目诊断。你擅长从碎片化的任务信息中洞察潜在风险、评估进度健康度，并提供改进策略。 你的母语是**简体中文**。 
 指令： 
 我将为你提供一个或多个项目的详细介绍、任务排期、当前进度及已记录的风险点。请你基于这些数据进行深度审计，并输出一份《项目健康度分析报告》。 
 
 进度偏离度评估：根据当前日期和排期，分析哪些任务存在延期风险，计算整体进度是否符合预期。 
 关键路径识别：识别出影响项目上线的核心链路 
 风险深度洞察：除了我提供的风险点，请结合互联网项目经验，挖掘隐藏的风险（如：任务依赖冲突、测试时间预留不足等，你不需要关注人力资源）。 
 
 (请严格按此结构输出) **全中文输出：** 报告和思考过程必须使用**简体中文**。 
 🚫 禁令 (Must Follow)
1. **禁止输出英文**：除 ID (如 task-1) 和专有名词 (如 API) 外，全篇必须使用**纯简体中文**。: 
 
  【核心风险预警】 
  【其他分析】给出你的综合意见和其他分析建议，指出我可能忽略的地方 
  【行动建议】(针对现有问题，给出具体的破局方案，如：调整优先级等) 
  【综合评估以及建议】输出你的综合分析结论以及指出我需要注意的地方，同时如果有待办也需要输出，例如今天开始联调哪些内容等待办内容。 
  以下是项目详细数据：`

async function callAIAPI(userPrompt: string, systemPrompt: string, provider: AIProvider): Promise<string> {
  try {
    console.log('[AI API] =========================================')
    console.log('[AI API] Starting AI API call')
    console.log('[AI API] Provider:', provider.name, 'Type:', provider.type)
    console.log('[AI API] User prompt length:', userPrompt.length, 'chars')
    console.log('[AI API] System prompt length:', systemPrompt.length, 'chars')

    if (provider.type === 'gemini') {
      return await callGeminiAPI(userPrompt, systemPrompt, provider)
    } else if (provider.type === 'openai') {
      return await callOpenAIAPI(userPrompt, systemPrompt, provider)
    } else {
      throw new Error(`Unsupported provider type: ${provider.type}`)
    }
  } catch (error) {
    console.error('[AI API] Error:', error)
    throw error
  }
}

// 调用 Gemini API
async function callGeminiAPI(userPrompt: string, systemPrompt: string, provider: AIProvider): Promise<string> {
  try {
    // 使用 Gemini 模型的 generateContent 接口
    const requestBody = {
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
        maxOutputTokens: 2000,
        language: 'zh-CN'
      }
    }

    console.log('[Gemini] Request URL:', `${provider.baseUrl}/v1beta/models/${provider.model}:generateContent`)
    console.log('[Gemini] Request body:', JSON.stringify(requestBody).substring(0, 500) + '...')

    const response = await fetch(`${provider.baseUrl}/v1beta/models/${provider.model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error Response:', errorText)
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`)
    }

    // 检查是否为流式响应
    const contentType = response.headers.get('content-type') || ''
    console.log('Response Content-Type:', contentType)
    
    // 更准确的流式响应检测
    const isStreaming = contentType.includes('stream') || 
                       contentType.includes('event-stream') ||
                       contentType.includes('text/event-stream')
    
    let data: any
    
    if (isStreaming) {
      console.log('Detected streaming response')
      
      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get reader from response body')
      }
      
      const decoder = new TextDecoder()
      let chunks = ''
      let completeData: any = null
      let chunkCount = 0
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          chunks += decoder.decode(value, { stream: true })
          console.log(`Received data chunk, total length: ${chunks.length}`)
          
          // 处理所有完整的JSON对象（可能是多个chunk）
          while (true) {
            // 查找完整的JSON对象
            const openBraceIndex = chunks.indexOf('{')
            const closeBraceIndex = chunks.lastIndexOf('}')
            
            if (openBraceIndex === -1 || closeBraceIndex === -1 || openBraceIndex > closeBraceIndex) {
              break // 没有完整的JSON对象
            }
            
            // 提取完整的JSON对象
            const jsonStr = chunks.substring(openBraceIndex, closeBraceIndex + 1)
            chunks = chunks.substring(closeBraceIndex + 1)
            
            try {
              const chunkData = JSON.parse(jsonStr)
              chunkCount++
              console.log(`Processing chunk ${chunkCount}:`, JSON.stringify(chunkData).substring(0, 100) + '...')
              
              // 构建完整响应（正确合并delta内容）
              if (!completeData) {
                // 初始化completeData
                completeData = {
                  choices: [{
                    index: 0,
                    delta: {
                      content: '',
                      reasoning_content: ''
                    },
                    message: {
                      content: '',
                      reasoning_content: ''
                    },
                    finish_reason: null
                  }]
                }
              }
              
              // 合并chunk数据到completeData
              if (chunkData.choices && chunkData.choices[0]) {
                const chunkChoice = chunkData.choices[0]
                
                // 合并delta内容到completeData的第一个choice
                const completeChoice = completeData.choices[0]
                
                // 合并content（主要回复内容）
                if (chunkChoice.delta?.content) {
                  completeChoice.delta.content += chunkChoice.delta.content
                  completeChoice.message.content += chunkChoice.delta.content
                  console.log(`Added content chunk (${chunkChoice.delta.content.length} chars):`, chunkChoice.delta.content.substring(0, 50) + '...')
                }
                
                // 合并reasoning_content（思考过程）
                if (chunkChoice.delta?.reasoning_content) {
                  completeChoice.delta.reasoning_content += chunkChoice.delta.reasoning_content
                  completeChoice.message.reasoning_content += chunkChoice.delta.reasoning_content
                  console.log(`Added reasoning chunk (${chunkChoice.delta.reasoning_content.length} chars):`, chunkChoice.delta.reasoning_content.substring(0, 50) + '...')
                }
                
                // 合并finish_reason
                if (chunkChoice.finish_reason) {
                  completeChoice.finish_reason = chunkChoice.finish_reason
                  console.log(`Stream finished with reason: ${chunkChoice.finish_reason}`)
                }
              }
              
            } catch (parseError) {
              console.error('Failed to parse chunk data:', parseError)
              // 继续处理下一个chunk
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
      
      console.log(`Total chunks processed: ${chunkCount}`)
      console.log('Final complete data:', JSON.stringify(completeData).substring(0, 300) + '...')
      
      // 检查响应完整性
      if (!completeData) {
        throw new Error('No valid data received from streaming response')
      }
      
      // 检查是否有内容
      const hasContent = completeData.choices[0].message.content || 
                         completeData.choices[0].message.reasoning_content
      
      if (!hasContent) {
        console.error('No content in response:', JSON.stringify(completeData))
        throw new Error('Empty response received')
      }
      
      // 检查流式响应是否完成
      if (completeData.choices[0].finish_reason) {
        console.log('Stream completed successfully:', completeData.choices[0].finish_reason)
      } else {
        console.warn('Stream may not have completed properly')
      }
      
      data = completeData
    } else {
      // 处理非流式响应
      console.log('Handling non-streaming response...')
      data = await response.json()
      console.log('Gemini API Raw Response:', data)
    }

    let resultText = ''
    
    // 1. 处理思考过程（reasoning_content）
    if (data.choices) {
      const choice = data.choices[0]
      // 检查流式和非流式的思考过程
      const reasoningContent = choice.delta?.reasoning_content || choice.message?.reasoning_content
      
      if (reasoningContent) {
        console.log('[Gemini] Found reasoning content (first 100 chars):', reasoningContent.substring(0, 100) + '...')
        // 翻译思考过程
        const translatedReasoning = await translateToChinese(reasoningContent)
        console.log('[Gemini] Translated reasoning content (first 100 chars):', translatedReasoning.substring(0, 100) + '...')
        resultText += translatedReasoning + '\n\n'
      }
    }
    
    // 2. 处理主要内容
    let mainContent = ''
    
    // 兼容不同API响应格式
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      // Gemini 格式
      mainContent = data.candidates[0].content.parts[0].text
      console.log('Using Gemini response format')
    } else if (data.choices && data.choices[0]?.message?.content) {
      // OpenAI 非流式格式（优先使用message.content，包含完整内容）
      mainContent = data.choices[0].message.content
      console.log('Using OpenAI non-streaming response format')
    } else if (data.choices && data.choices[0]?.delta?.content) {
      // OpenAI 流式格式（delta.content只包含增量内容，应该使用message.content）
      // 如果message.content为空，才使用delta.content
      if (!data.choices[0].message?.content) {
        mainContent = data.choices[0].delta.content
        console.log('Using OpenAI streaming delta content (message.content is empty)')
      } else {
        console.log('Skipping delta content, using message.content instead')
      }
    } else {
      // 检查是否只有思考过程
      if (resultText) {
        console.log('Only reasoning content found, using it as result')
      } else {
        console.error('Unknown API response format:', JSON.stringify(data))
        throw new Error('Unknown API response format')
      }
    }
    
    // 3. 翻译主要内容（如果是英文）
    if (mainContent) {
      console.log('Original main content (first 100 chars):', mainContent.substring(0, 100) + '...')
      
      // 翻译主要内容
      const translatedContent = await translateToChinese(mainContent)
      console.log('Translated main content (first 100 chars):', translatedContent.substring(0, 100) + '...')
      
      // 将翻译后的主要内容添加到结果中
      resultText += translatedContent
    }

    console.log('Final AI Response Text:', resultText.substring(0, 100) + '...')
    return resultText
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}

// 调用 OpenAI 兼容 API（New API）
async function callOpenAIAPI(userPrompt: string, systemPrompt: string, provider: AIProvider): Promise<string> {
  try {
    // 使用 OpenAI 兼容的 chat completions 接口
    const requestBody = {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }

    console.log('[OpenAI] Request URL:', `${provider.baseUrl}/v1/chat/completions`)
    console.log('[OpenAI] Request body:', JSON.stringify(requestBody).substring(0, 500) + '...')

    const response = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error Response:', errorText)
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('[OpenAI] Raw Response:', JSON.stringify(data).substring(0, 500) + '...')

    // 提取响应内容
    let resultText = ''
    
    // 检查是否有 reasoning_content（思考过程）
    let reasoningContent = ''
    let mainContent = ''
    
    if (data.choices && data.choices[0]) {
      const choice = data.choices[0]
      
      // 优先处理 reasoning_content（思考过程）
      if (choice.message?.reasoning_content) {
        reasoningContent = choice.message.reasoning_content
        console.log('[OpenAI] Found reasoning content (first 100 chars):', reasoningContent.substring(0, 100) + '...')
      }
      
      // 处理主要内容
      if (choice.message?.content) {
        mainContent = choice.message.content
        console.log('[OpenAI] Found main content (first 100 chars):', mainContent.substring(0, 100) + '...')
      }
    }
    
    if (!reasoningContent && !mainContent) {
      console.error('[OpenAI] No content in response:', JSON.stringify(data))
      throw new Error('Empty response received')
    }
    
    // 翻译并组合结果
    if (reasoningContent) {
      const translatedReasoning = await translateToChinese(reasoningContent)
      console.log('[OpenAI] Translated reasoning content (first 100 chars):', translatedReasoning.substring(0, 100) + '...')
      resultText += translatedReasoning + '\n\n'
    }
    
    if (mainContent) {
      const translatedMain = await translateToChinese(mainContent)
      console.log('[OpenAI] Translated main content (first 100 chars):', translatedMain.substring(0, 100) + '...')
      resultText += translatedMain
    }

    console.log('[OpenAI] Final AI Response Text:', resultText.substring(0, 100) + '...')
    return resultText
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw error
  }
}

interface AIAnalysisState {
  modalVisible: boolean
  messages: AIMessage[]
  context: AIAnalysisContext | null
  loading: boolean
  systemPrompt: string
  providers: AIProvider[]
  currentProviderId: string
  promptClickCount: number

  openModal: (context: AIAnalysisContext) => void
  closeModal: () => void
  addMessage: (message: AIMessage) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setSystemPrompt: (prompt: string) => void
  analyzeProjects: (projects: Project[], tasks: Task[], context: AIAnalysisContext) => Promise<void>
  sendFollowUp: (question: string) => Promise<void>

  // AI 服务提供商管理方法
  addProvider: (provider: Omit<AIProvider, 'id'>) => void
  updateProvider: (id: string, updates: Partial<AIProvider>) => void
  deleteProvider: (id: string) => void
  setCurrentProvider: (id: string) => void
  getCurrentProvider: () => AIProvider | undefined
  incrementPromptClickCount: () => void

  // 初始化方法
  initialize: () => Promise<void>
}

const useAIAnalysisStore = create<AIAnalysisState>((set, get) => ({
  modalVisible: false,
  messages: [],
  context: null,
  loading: false,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  providers: DEFAULT_PROVIDERS,
  currentProviderId: DEFAULT_PROVIDERS[0].id,
  promptClickCount: 0,

  // 初始化函数 - 从数据库加载数据
  initialize: async () => {
    try {
      const [systemPrompt, providers, currentProviderId] = await Promise.all([
        loadSystemPromptFromDB(),
        loadProvidersFromDB(),
        loadCurrentProviderIdFromDB(),
      ])

      set({
        systemPrompt,
        providers,
        currentProviderId,
      })
    } catch (error) {
      console.error('Failed to initialize AI store:', error)
    }
  },

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
    saveSystemPromptToDB(prompt)
  },

  incrementPromptClickCount: () => {
    set((state) => ({ promptClickCount: state.promptClickCount + 1 }))
  },

  analyzeProjects: async (projects, tasks, context) => {
    const { addMessage, setLoading, systemPrompt, getCurrentProvider } = get()
    setLoading(true)

    try {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'system',
        content: '正在分析项目数据...',
        timestamp: new Date().toISOString()
      })

      const provider = getCurrentProvider()
      if (!provider) {
        throw new Error('No AI provider selected')
      }

      const analysisData = prepareAnalysisData(projects, tasks, context)
      const userPrompt = analysisData.analysisData
      
      const analysisResult = await callAIAPI(userPrompt, systemPrompt, provider)
      
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
    const { addMessage, setLoading, systemPrompt, getCurrentProvider } = get()
    
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    })

    setLoading(true)

    try {
      const provider = getCurrentProvider()
      if (!provider) {
        throw new Error('No AI provider selected')
      }

      const response = await callAIAPI(question, systemPrompt, provider)

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
  },

  // AI 服务提供商管理方法
  addProvider: (provider) => {
    set((state) => {
      const newProvider: AIProvider = {
        ...provider,
        id: `provider-${Date.now()}`
      }
      const newProviders = [...state.providers, newProvider]
      saveProvidersToDB(newProviders)
      return { providers: newProviders }
    })
  },

  updateProvider: (id, updates) => {
    set((state) => {
      const newProviders = state.providers.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
      saveProvidersToDB(newProviders)
      return { providers: newProviders }
    })
  },

  deleteProvider: (id) => {
    set((state) => {
      const newProviders = state.providers.filter(p => p.id !== id)

      // 如果删除的是当前选中的提供商，切换到第一个可用的提供商
      let newCurrentProviderId = state.currentProviderId
      if (state.currentProviderId === id) {
        newCurrentProviderId = newProviders.length > 0 ? newProviders[0].id : ''
        saveCurrentProviderIdToDB(newCurrentProviderId)
      }

      saveProvidersToDB(newProviders)
      return { providers: newProviders, currentProviderId: newCurrentProviderId }
    })
  },

  setCurrentProvider: (id) => {
    set((state) => {
      const provider = state.providers.find(p => p.id === id)
      if (provider) {
        saveCurrentProviderIdToDB(id)
        return { currentProviderId: id }
      }
      return state
    })
  },

  getCurrentProvider: () => {
    const state = get()
    return state.providers.find(p => p.id === state.currentProviderId)
  }
}))

function prepareAnalysisData(projects: Project[], tasks: Task[], context: AIAnalysisContext) {
  let targetProjects: Project[]
  let targetTasks: Task[]

  if (context.scope === 'single' && context.projectId) {
    // 单项目分析：不过滤任何状态，直接分析指定项目
    targetProjects = projects.filter(p => p.id === context.projectId)
    targetTasks = tasks.filter(t => t.projectId === context.projectId)
  } else {
    // 全局分析：过滤掉暂停和已完成的项目
    targetProjects = projects.filter(p => p.status !== 'paused' && p.status !== 'completed')
    targetTasks = tasks.filter(t => {
      const project = projects.find(p => p.id === t.projectId)
      return project && project.status !== 'paused' && project.status !== 'completed'
    })
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
        `${record.date}：${record.content}（状态：${getStatusText(record.status)}）`
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
      计划排期: `${t.startDate} 至 ${t.endDate}`,
      已用天数: `${usedDays}天`,
      执行人员: t.assignees.join('、'),
      任务备注: t.remark || '无',
      最近记录: recentRecords.map(record =>
        `${record.date}：${record.content}（状态：${getStatusText(record.status)}）`
      ).join('\n') || '暂无记录'
    }
  })

  // D. 风险与延期分析
  const riskProjects = targetProjects.filter(p => p.status === 'risk').map(p => ({
    项目名称: p.name,
    风险描述: p.remark || '存在风险',
    项目负责人: p.owner
  }))

  const delayedProjects = targetProjects.filter(p => p.status === 'delayed').map(p => {
    const endDate = new Date(p.endDate)
    const delayDays = Math.max(0, Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)))
    return {
      项目名称: p.name,
      延期天数: `${delayDays}天`,
      延期原因: p.remark || '进度滞后',
      项目负责人: p.owner
    }
  })

  const riskTasks = targetTasks.filter(t => t.status === 'risk').map(t => {
    const project = targetProjects.find(p => p.id === t.projectId)
    return {
      任务名称: t.name,
      所属项目: project ? project.name : '未知项目',
      风险描述: t.remark || '存在风险',
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
`

  const projectText = `
## B. 项目概览

以下是各项目的详细信息：

${projectOverview.map((p, index) => `
### ${index + 1}. ${p.项目名称}

**基本信息：**
- 项目ID：${p.项目ID}
- 项目状态：${p.项目状态}

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
  - 项目负责人：${p.项目负责人}
`).join('') : '暂无风险项目'}

### 延期项目列表
${delayedProjects.length > 0 ? delayedProjects.map(p => `
- **${p.项目名称}**
  - 延期天数：${p.延期天数}
  - 延期原因：${p.延期原因}
  - 项目负责人：${p.项目负责人}
`).join('') : '暂无延期项目'}

### 风险任务列表
${riskTasks.length > 0 ? riskTasks.map(t => `
- **${t.任务名称}**（所属项目：${t.所属项目}）
  - 风险描述：${t.风险描述}
  - 执行人员：${t.执行人员}
`).join('') : '暂无风险任务'}

### 延期任务列表
${delayedTasks.length > 0 ? delayedTasks.map(t => `
- **${t.任务名称}**（所属项目：${t.所属项目}）
  - 延期天数：${t.延期天数}
  - 延期原因：${t.延期原因}
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
