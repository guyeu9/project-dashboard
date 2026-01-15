import { useState } from 'react'
import { Card, Button, Space, Table, Tag, Modal, Input, Select, App as AntApp } from 'antd'
import { ImportOutlined, ClearOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import { Task, Project } from '../../types'
import useStore from '../../store/useStore'
import useAuthStore from '../../store/authStore'
import ProjectEditModal from '../ProjectEditModal'
import dayjs from 'dayjs'
import './index.css'

const { Option } = Select

interface ParsedTask {
  id: string
  phase: string
  startDate: string
  endDate: string
  assignees: string[]
  remark?: string
}

function SmartParser() {
  const { addTask, addProject, updateProject, taskTypes } = useStore()
  const { message } = AntApp.useApp()
  const { role } = useAuthStore()
  const isAdmin = role === 'admin'
  const [inputText, setInputText] = useState('')
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([])
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('1')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const parseText = (text: string): ParsedTask[] => {
    try {
      const tasks: ParsedTask[] = []
      const lines = text.split('\n').filter(line => line.trim())
      
      let currentTask: Partial<ParsedTask> = {}
      
      for (const line of lines) {
        const phaseMatch = line.match(/^(开发排期|开发联调|测试排期|测试联调|产品UAT|上线)/)
        const dateMatch = line.match(/(\d{1,2}\.\d{1,2})-(\d{1,2}\.\d{1,2})/)
        const assigneeMatches = line.match(/@([^\s]+)/g)
        
        if (phaseMatch) {
          if (Object.keys(currentTask).length > 0) {
            tasks.push({
              ...currentTask as ParsedTask,
              id: `task-${Date.now()}-${tasks.length}`,
            })
          }
          
          currentTask = {
            phase: phaseMatch[1],
          }
          
          if (dateMatch) {
            const [startMonth, startDay] = dateMatch[1].split('.')
            const [endMonth, endDay] = dateMatch[2].split('.')
            
            const currentYear = dayjs().year()
            const startYear = parseInt(startMonth) > parseInt(endMonth) ? currentYear - 1 : currentYear
            const endYear = parseInt(endMonth) < parseInt(startMonth) ? currentYear + 1 : currentYear
            
            currentTask.startDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`
            currentTask.endDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`
          }
          
          if (assigneeMatches) {
            currentTask.assignees = assigneeMatches.map(match => {
              const name = match.replace('@', '').split('-')[0].trim()
              return name
            })
          } else {
            currentTask.assignees = []
          }
          
          const remarkMatch = line.match(/（([^)]*)）/)
          if (remarkMatch) {
            currentTask.remark = remarkMatch[1]
          }
        }
      }
      
      if (Object.keys(currentTask).length > 0) {
        tasks.push({
          ...currentTask as ParsedTask,
          id: `task-${Date.now()}-${tasks.length}`,
        })
      }
      
      return tasks
    } catch (error) {
      console.error('解析文本时出错:', error)
      message.error('解析文本失败，请检查输入格式')
      return []
    }
  }

  const handleParse = () => {
    if (!inputText.trim()) {
      message.warning('请输入需要解析的文本')
      return
    }
    
    const tasks = parseText(inputText)
    setParsedTasks(tasks)
    message.success(`成功解析 ${tasks.length} 个任务`)
  }

  const handleClear = () => {
    setInputText('')
    setParsedTasks([])
  }

  const handleImport = () => {
    if (parsedTasks.length === 0) {
      message.warning('没有可导入的任务')
      return
    }
    
    setImportModalVisible(true)
  }

  const handleConfirmImport = () => {
    if (!taskTypes || taskTypes.length === 0) {
      message.error('任务类型数据未加载，请刷新页面重试')
      return
    }
    
    const tasksToAdd: Task[] = parsedTasks.map((parsedTask, index) => {
      const taskType = taskTypes.find(t => t.name === parsedTask.phase) || taskTypes[0] 
      
      return {
        id: `task-${Date.now()}-${index}`,
        projectId: selectedProjectId,
        name: `${parsedTask.phase}任务`,
        type: taskType,
        status: 'normal' as const,
        progress: 0,
        startDate: parsedTask.startDate,
        endDate: parsedTask.endDate,
        assignees: parsedTask.assignees || [],
        dailyProgress: '',
        remark: parsedTask.remark || '',
      }
    })
    
    tasksToAdd.forEach(task => addTask(task))
    message.success(`成功导入 ${tasksToAdd.length} 个任务`)
    setImportModalVisible(false)
    setParsedTasks([])
    setInputText('')
  }

  const handleCancelImport = () => {
    setImportModalVisible(false)
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setEditModalVisible(true)
  }

  const handleProjectCreated = (project: Project) => {
    if (!taskTypes || taskTypes.length === 0) {
      message.error('任务类型数据未加载，请刷新页面重试')
      return false
    }
    
    addProject(project)
    
    const tasksToAdd: Task[] = parsedTasks.map((parsedTask, index) => {
      const taskType = taskTypes.find(t => t.name === parsedTask.phase) || taskTypes[0] 
      
      return {
        id: `task-${Date.now()}-${index}`,
        projectId: project.id,
        name: `${parsedTask.phase}任务`,
        type: taskType,
        status: 'normal' as const,
        progress: 0,
        startDate: parsedTask.startDate,
        endDate: parsedTask.endDate,
        assignees: parsedTask.assignees || [],
        dailyProgress: '',
        remark: parsedTask.remark || '',
      }
    })
    
    tasksToAdd.forEach(task => addTask(task))
    message.success(`成功创建项目并导入 ${tasksToAdd.length} 个任务`)
    setEditModalVisible(false)
    setParsedTasks([])
    setInputText('')
    
    return false
  }

  const handleProjectSave = (projectId: string, updates: Partial<Project>) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存项目修改')
      return
    }
    updateProject(projectId, updates)
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const handleProjectCancel = () => {
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const columns = [
    {
      title: '任务阶段',
      dataIndex: 'phase',
      key: 'phase',
      width: 120,
      render: (phase: string) => {
        const colorMap: Record<string, string> = {
          '开发排期': '#1890ff',
          '开发联调': '#52c41a',
          '测试排期': '#faad14',
          '测试联调': '#f5222d',
          '产品UAT': '#722ed1',
          '上线': '#13c2c2',
        }
        return <Tag color={colorMap[phase] || 'blue'}>{phase}</Tag>
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'assignees',
      key: 'assignees',
      width: 200,
      render: (assignees?: string[]) => (
        <Space size="small" wrap>
          {assignees?.map((name, index) => (
            <Tag key={index} color="geekblue">{name}</Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark?: string) => remark || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, __: ParsedTask, index: number) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => {
            const newTasks = [...parsedTasks]
            newTasks.splice(index, 1)
            setParsedTasks(newTasks)
          }}
        >
          删除
        </Button>
      ),
    },
  ]

  const exampleText = `开发排期：12.18-1.14 
开发联调（期望与合作方):1.19-1.21 @王靖博-业务交付中心（常用） @邓晓旭  
测试排期：1.12-1.23 
测试联调（期望与合作方）：1.26-1.30 @史宁博  
产品UAT：1.29-1.30 
一批次上线时间：1.30`

  return (
    <div className="smart-parser">
      <Card title="智能文本解析" className="parser-card">
        <div className="parser-section">
          <div className="input-section">
            <div className="section-header">
              <h3>输入排期文本</h3>
              <Button
                type="link"
                size="small"
                onClick={() => setInputText(exampleText)}
              >
                使用示例文本
              </Button>
            </div>
            <Input.TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入项目排期文本，例如：&#10;开发排期：12.18-1.14&#10;开发联调：1.19-1.21 @张三 @李四"
              rows={12}
              className="parser-textarea"
            />
            <div className="button-group">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddProject}
                  disabled={!isAdmin}
                >
                  新建项目
                </Button>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={handleParse}
                  disabled={!inputText.trim()}
                >
                  解析
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  disabled={!inputText.trim()}
                >
                  清除
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {parsedTasks.length > 0 && (
          <div className="preview-section">
            <div className="section-header">
              <h3>解析结果预览</h3>
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleImport}
              >
                导入甘特图
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={parsedTasks}
              rowKey="id"
              pagination={false}
              scroll={{ y: 400 }}
              className="preview-table"
              locale={{
                emptyText: '暂无解析结果，请输入文本并点击解析按钮'
              }}
            />
          </div>
        )}
      </Card>

      <Modal
        title="确认导入"
        open={importModalVisible}
        onOk={handleConfirmImport}
        onCancel={handleCancelImport}
        okText="确认导入"
        cancelText="取消"
        width={600}
      >
        <div className="import-confirm">
          <p>即将导入 <strong>{parsedTasks.length}</strong> 个任务到甘特图</p>
          <p>目标项目ID：</p>
          <Select
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            style={{ width: '100%', marginTop: 16 }}
          >
            <Option value="1">短剧小程序</Option>
            <Option value="2">支付中台改造</Option>
            <Option value="3">用户中心升级</Option>
            <Option value="4">数据报表系统</Option>
            <Option value="5">营销活动平台</Option>
          </Select>
        </div>
      </Modal>

      <ProjectEditModal
        visible={editModalVisible}
        project={editingProject}
        onSave={handleProjectSave}
        onAdd={() => {}}
        onCancel={handleProjectCancel}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}

export default SmartParser
