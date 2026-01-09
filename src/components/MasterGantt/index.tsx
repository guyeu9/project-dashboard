import { useState, useMemo, useRef, useEffect } from 'react'
import { Tooltip, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined, RightOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Project, Task } from '../../types'
import ProjectEditModal from '../ProjectEditModal'
import TaskEditModal from '../TaskEditModal'
import useStore from '../../store/useStore'
import './index.css'

interface MasterGanttProps {
  projects: Project[]
}

function MasterGantt({ projects }: MasterGanttProps) {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const containerRef = useRef<HTMLDivElement>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTaskToProject, setAddingTaskToProject] = useState<string | null>(null)
  const { updateProject, tasks, addTask, updateTask, taskTypes } = useStore()

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
  }

  const handleProjectSave = (projectId: string, updates: Partial<Project>) => {
    updateProject(projectId, updates)
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const handleProjectCancel = () => {
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const handleAddTask = (projectId: string) => {
    setAddingTaskToProject(projectId)
    setEditingTask(null)
    setTaskModalVisible(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setAddingTaskToProject(null)
    setTaskModalVisible(true)
  }

  const handleTaskSave = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates)
    setTaskModalVisible(false)
    setEditingTask(null)
    setAddingTaskToProject(null)
  }

  const handleTaskAdd = (task: Task) => {
    if (addingTaskToProject) {
      addTask({ ...task, projectId: addingTaskToProject })
    }
    setTaskModalVisible(false)
    setEditingTask(null)
    setAddingTaskToProject(null)
  }

  const handleTaskCancel = () => {
    setTaskModalVisible(false)
    setEditingTask(null)
    setAddingTaskToProject(null)
  }

  const dateRange = useMemo(() => {
    const start = currentDate.startOf('month')
    const end = currentDate.endOf('month')
    return { start, end }
  }, [currentDate])

  const days = useMemo(() => {
    const days = []
    let current = dateRange.start
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end)) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }, [dateRange])

  const getProjectBarStyle = (project: Project) => {
    const isDelayed = project.status === 'delayed' || project.status === 'risk'
    return {
      backgroundColor: isDelayed ? '#ff4d4f' : '#52c41a',
      borderRadius: 4,
      height: 24,
      cursor: 'pointer',
      transition: 'all 0.3s',
    }
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'))
  }

  const handleToday = () => {
    setCurrentDate(dayjs())
  }

  const isToday = (date: dayjs.Dayjs) => {
    return date.isSame(dayjs(), 'day')
  }

  // 自动滚动到今天
  useEffect(() => {
    if (containerRef.current) {
      // 找到今天的日期元素
      const todayElement = containerRef.current.querySelector('.timeline-day.today') || 
                          containerRef.current.querySelector('.grid-cell.today')
      if (todayElement) {
        // 滚动到今天的位置，稍微靠左一点以便查看后续任务
        const container = containerRef.current
        const todayRect = todayElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        // 计算滚动位置，让今天的日期位于容器的1/3处
        const scrollLeft = container.scrollLeft + todayRect.left - containerRect.left - containerRect.width / 3
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentDate])

  return (
    <div className="master-gantt" ref={containerRef}>
      <div className="gantt-header">
        <Space>
          <Button icon={<LeftOutlined />} onClick={handlePrevMonth}>
            上个月
          </Button>
          <Button onClick={handleToday}>
            今天
          </Button>
          <Button icon={<RightOutlined />} onClick={handleNextMonth}>
            下个月
          </Button>
        </Space>
        <span className="current-date">
          {currentDate.format('YYYY年MM月')}
        </span>
      </div>

      <div className="gantt-container">
        <div className="gantt-sidebar">
          <div className="sidebar-header">项目名称</div>
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            return (
              <div key={project.id} className="project-section">
                <div className="sidebar-row project-row">
                  <div className="project-name">{project.name}</div>
                  <Space>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => handleAddTask(project.id)}
                      className="add-task-button"
                    >
                      添加任务
                    </Button>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEditProject(project)}
                      className="edit-button"
                    >
                      编辑
                    </Button>
                  </Space>
                </div>
                {projectTasks.map(task => (
                  <div key={task.id} className="sidebar-row task-row">
                    <div className="task-name" style={{ paddingLeft: '20px' }}>{task.name}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <div className="gantt-timeline">
          <div className="timeline-header">
            {days.map((day) => (
              <div 
                key={day.format('YYYY-MM-DD')} 
                className={`timeline-day ${isToday(day) ? 'today' : ''}`}
              >
                <div className="day-number">{day.format('D')}</div>
                <div className="day-weekday">{day.format('ddd')}</div>
              </div>
            ))}
          </div>

          <div className="timeline-body">
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.projectId === project.id)
              
              // 项目行
              const projectStartDate = dayjs(project.startDate)
              const projectEndDate = dayjs(project.endDate)
              const totalDays = days.length
              
              const projectStartOffset = Math.max(0, projectStartDate.diff(dateRange.start, 'day'))
              const projectDuration = Math.min(
                projectEndDate.diff(projectStartDate, 'day') + 1,
                totalDays - projectStartOffset
              )

              const projectBarWidth = (projectDuration / totalDays) * 100
              const projectBarLeft = (projectStartOffset / totalDays) * 100

              return (
                <div key={project.id} className="project-timeline-section">
                  {/* 项目进度条 */}
                  <div className="timeline-row project-row">
                    <div className="timeline-grid">
                      {days.map((day) => (
                        <div 
                          key={day.format('YYYY-MM-DD')} 
                          className={`grid-cell ${isToday(day) ? 'today' : ''}`}
                        />
                      ))}
                    </div>
                    
                    <div 
                      className="project-bar"
                      style={{
                        ...getProjectBarStyle(project),
                        left: `${projectBarLeft}%`,
                        width: `${projectBarWidth}%`,
                      }}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <Tooltip 
                        title={
                          <div>
                            <div><strong>{project.name}</strong></div>
                            <div>合作方: {project.partners.join(', ')}</div>
                            <div>开发: {project.developers.join(', ')}</div>
                            <div>测试: {project.testers.join(', ')}</div>
                            <div>负责人: {project.owner}</div>
                            <div>进度: {project.progress}%</div>
                          </div>
                        }
                      >
                        <div className="bar-label">
                          {project.progress}%
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {/* 任务排期 */}
                  {projectTasks.map((task) => {
                    const taskStartDate = dayjs(task.startDate)
                    const taskEndDate = dayjs(task.endDate)
                    
                    const taskStartOffset = Math.max(0, taskStartDate.diff(dateRange.start, 'day'))
                    const taskDuration = Math.min(
                      taskEndDate.diff(taskStartDate, 'day') + 1,
                      totalDays - taskStartOffset
                    )

                    const taskBarWidth = (taskDuration / totalDays) * 100
                    const taskBarLeft = (taskStartOffset / totalDays) * 100

                    return (
                      <div key={task.id} className="timeline-row task-row">
                        <div className="timeline-grid">
                          {days.map((day) => (
                            <div 
                              key={day.format('YYYY-MM-DD')} 
                              className={`grid-cell ${isToday(day) ? 'today' : ''}`}
                            />
                          ))}
                        </div>
                        
                        <div 
                          className="task-bar"
                          style={{
                            backgroundColor: task.type.color,
                            borderRadius: 4,
                            height: 20,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            left: `${taskBarLeft}%`,
                            width: `${taskBarWidth}%`,
                            marginLeft: '20px',
                          }}
                          onClick={() => handleEditTask(task)}
                        >
                          <Tooltip 
                            title={
                              <div>
                                <div><strong>{task.name}</strong></div>
                                <div>类型: {task.type.name}</div>
                                <div>负责人: {task.assignees.join(', ')}</div>
                                <div>状态: {task.status === 'normal' ? '正常' : task.status === 'blocked' ? '阻塞' : '已解决'}</div>
                                <div>进度: {task.progress}%</div>
                                <div>时间: {taskStartDate.format('YYYY-MM-DD')} - {taskEndDate.format('YYYY-MM-DD')}</div>
                              </div>
                            }
                          >
                            <div className="bar-label" style={{ fontSize: '12px', lineHeight: '20px' }}>
                              {task.name}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="gantt-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#52c41a' }}></div>
          <span>正常</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff4d4f' }}></div>
          <span>延期/风险</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today-line"></div>
          <span>今天</span>
        </div>
      </div>

      <ProjectEditModal
        visible={editModalVisible}
        project={editingProject}
        onSave={handleProjectSave}
        onAdd={() => {}}
        onCancel={handleProjectCancel}
      />

      <TaskEditModal
        visible={taskModalVisible}
        task={editingTask}
        taskTypes={taskTypes}
        onSave={handleTaskSave}
        onAdd={handleTaskAdd}
        onCancel={handleTaskCancel}
      />
    </div>
  )
}

export default MasterGantt