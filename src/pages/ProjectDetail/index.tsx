import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Breadcrumb, Spin, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import useStore from '../../store/useStore'
import { Task } from '../../types'
import ProjectHeader from '../../components/ProjectHeader'
import ExecutionGantt from '../../components/ExecutionGantt'
import TaskEditModal from '../../components/TaskEditModal'
import TaskHistory from '../../components/TaskHistory'

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, tasks, updateTask, addTask, taskTypes } = useStore()
  
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

      <ProjectHeader project={project} />

      <Card 
        title="执行甘特图" 
        style={{ marginTop: 24 }}
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