import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Breadcrumb, Spin, message, Tabs } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import useStore from '../../store/useStore'
import { Task } from '../../types'
import ProjectHeader from '../../components/ProjectHeader'
import ExecutionGantt from '../../components/ExecutionGantt'
import TaskEditModal from '../../components/TaskEditModal'
import TaskHistory from '../../components/TaskHistory'
import DailyProgressManager from '../../components/DailyProgressManager'

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, tasks, updateTask, addTask, taskTypes, updateProject } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const project = useMemo(() => {
    return projects.find(p => p.id === id)
  }, [projects, id])

  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.projectId === id)
  }, [tasks, id])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }, [id])

  const handleBack = () => {
    navigate('/')
  }

  const handleTaskDoubleClick = (task: Task) => {
    setEditingTask(task)
    setEditModalVisible(true)
  }

  const handleTaskSave = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates)
    message.success('任务已更新')
    setEditModalVisible(false)
  }

  const handleTaskAdd = (task: Task) => {
    addTask(task)
    message.success('任务已添加')
    setEditModalVisible(false)
  }

  const handleViewHistory = (taskId: string) => {
    setSelectedTaskId(taskId)
    setHistoryVisible(true)
  }

  const handleTaskDailyProgressUpdate = (taskId: string, records: any[]) => {
    updateTask(taskId, { dailyRecords: records })
    message.success('每日进度已更新')
  }

  // 计算项目的最新风险状态
  const getProjectLatestRiskStatus = () => {
    let latestRiskRecord: any = null
    let latestDate = ''
    
    projectTasks.forEach(task => {
      if (task.dailyRecords) {
        task.dailyRecords.forEach(record => {
          if ((record.status === 'risk' || record.status === 'delayed') && record.date > latestDate) {
            latestDate = record.date
            latestRiskRecord = record
          }
        })
      }
    })
    
    if (latestRiskRecord) {
      return latestRiskRecord.status === 'risk' ? 'risk' : 'delayed'
    }
    
    return project?.status || 'normal'
  }

  // 更新项目风险状态
  const updateProjectRiskStatus = (newStatus: 'normal' | 'risk' | 'delayed') => {
    if (project && project.id) {
      updateProject(project.id, { status: newStatus })
      message.success('项目风险状态已更新')
    }
  }

  // 更新项目字段
  const handleProjectFieldUpdate = (field: string, value: any) => {
    if (project && project.id) {
      updateProject(project.id, { [field]: value })
      message.success(`${field}已更新`)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card>
          <Space direction="vertical" align="center">
            <h2>项目不存在</h2>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回列表
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <span onClick={handleBack} style={{ cursor: 'pointer' }}>
            项目全景
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{project.name}</Breadcrumb.Item>
      </Breadcrumb>

      <ProjectHeader 
        project={project} 
        riskStatus={getProjectLatestRiskStatus()}
        onRiskStatusChange={updateProjectRiskStatus}
        onProjectUpdate={handleProjectFieldUpdate}
      />

      <Tabs defaultActiveKey="gantt" style={{ marginTop: 24 }}>
        <Tabs.TabPane tab="执行甘特图" key="gantt">
          <Card 
            title="执行甘特图" 
            extra={
              <Button 
                type="primary" 
                onClick={() => {
                  setEditingTask(null)
                  setEditModalVisible(true)
                }}
              >
                新增任务
              </Button>
            }
          >
            <ExecutionGantt 
              tasks={projectTasks}
              onTaskDoubleClick={handleTaskDoubleClick}
              onViewHistory={handleViewHistory}
            />
          </Card>
        </Tabs.TabPane>
        
        <Tabs.TabPane tab="每日进度" key="daily">
          <div style={{ marginTop: 16 }}>
            {projectTasks.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>暂无任务排期</p>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      setEditingTask(null)
                      setEditModalVisible(true)
                    }}
                  >
                    新增任务
                  </Button>
                </div>
              </Card>
            ) : (
              <div>
                {projectTasks.map(task => (
                  <DailyProgressManager
                    key={task.id}
                    task={task}
                    project={project}
                    onUpdate={handleTaskDailyProgressUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>

      <TaskEditModal
        visible={editModalVisible}
        task={editingTask}
        taskTypes={taskTypes}
        projectId={id || ''}
        onSave={handleTaskSave}
        onAdd={handleTaskAdd}
        onCancel={() => setEditModalVisible(false)}
      />

      <TaskHistory
        visible={historyVisible}
        taskId={selectedTaskId}
        onClose={() => setHistoryVisible(false)}
      />
    </div>
  )
}

export default ProjectDetail