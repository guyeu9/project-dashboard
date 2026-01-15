import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Breadcrumb, Spin, Tabs, App as AntApp } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import useStore from '../../store/useStore'
import { Task } from '../../types'
import ProjectHeader from '../../components/ProjectHeader'
import ExecutionGantt from '../../components/ExecutionGantt'
import TaskEditModal from '../../components/TaskEditModal'
import TaskHistory from '../../components/TaskHistory'
import DailyProgressManager from '../../components/DailyProgressManager'
import useAuthStore from '../../store/authStore'

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = AntApp.useApp()
  const { projects, tasks, updateTask, addTask, taskTypes, updateProject, deleteTask } = useStore()
  const { role } = useAuthStore()
  const isAdmin = role === 'admin'
  
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
    navigate('/project-management')
  }

  const handleTaskDoubleClick = (task: Task) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑任务')
      return
    }
    setEditingTask(task)
    setEditModalVisible(true)
  }

  const handleTaskSave = (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑任务')
      return
    }
    updateTask(taskId, updates)
    message.success('任务已更新')
    setEditModalVisible(false)
  }

  const handleTaskAdd = (task: Task) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以新增任务')
      return
    }
    addTask(task)
    message.success('任务已添加')
    setEditModalVisible(false)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以删除任务')
      return
    }
    deleteTask(taskId)
    message.success('任务已删除')
  }

  const handleViewHistory = (taskId: string) => {
    setSelectedTaskId(taskId)
    setHistoryVisible(true)
  }

  const handleTaskDailyProgressUpdate = (taskId: string, records: any[]) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改每日进度')
      return
    }
    updateTask(taskId, { dailyRecords: records })
    message.success('每日进度已更新')
  }

  // 更新项目字段
  const handleProjectFieldUpdate = (field: string, value: any) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改项目信息')
      return
    }
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

  const tabItems = [
    {
      key: 'gantt',
      label: '执行甘特图',
          children: (
          <Card 
            title="执行甘特图" 
            extra={
              <Button 
                type="primary" 
                disabled={!isAdmin}
                onClick={() => {
                  if (!isAdmin) {
                    message.warning('当前为游客，仅管理员可以新增任务')
                    return
                  }
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
            onDeleteTask={handleDeleteTask}
            isAdmin={isAdmin}
          />
        </Card>
      ),
    },
    {
      key: 'daily',
      label: '每日进度',
      children: (
        <div style={{ marginTop: 16 }}>
          {projectTasks.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>暂无任务排期</p>
                <Button 
                  type="primary" 
                  disabled={!isAdmin}
                  onClick={() => {
                    if (!isAdmin) {
                      message.warning('当前为游客，仅管理员可以新增任务')
                      return
                    }
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
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <span onClick={handleBack} style={{ cursor: 'pointer' }}>
                项目全景
              </span>
            ),
          },
          {
            title: project.name,
          },
        ]}
      />

      <ProjectHeader 
        project={project} 
        onProjectUpdate={handleProjectFieldUpdate}
        isAdmin={isAdmin}
        onBack={handleBack}
      />

      <Tabs
        defaultActiveKey="gantt"
        items={tabItems}
        style={{ marginTop: 24 }}
      />

      <TaskEditModal
        visible={editModalVisible}
        task={editingTask}
        taskTypes={taskTypes}
        projectId={id || ''}
        isAdmin={isAdmin}
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
