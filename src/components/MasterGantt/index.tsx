import { useState, useMemo, useRef, useEffect } from 'react'
import { Tooltip, Button, Space, Tag } from 'antd'
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
  const [currentDate, setCurrentDate] = useState(dayjs())
  const containerRef = useRef<HTMLDivElement>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTaskToProject, setAddingTaskToProject] = useState<string | null>(null)
  const [visibleDateRange, setVisibleDateRange] = useState({ start: 0, end: 0 })
  
  // 计算缓存
  const calculationCache = useRef(new Map<string, any>())
  const { updateProject, tasks, addTask, updateTask, taskTypes } = useStore()

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
  }

  const handleProjectSave = (projectId: string, updates: Partial<Project>) => {
    // 清除相关缓存
    calculationCache.current.delete(`project-${projectId}-${currentDate.format('YYYY-MM')}`)
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
    // 清除相关缓存
    calculationCache.current.delete(`task-${taskId}-${currentDate.format('YYYY-MM')}`)
    updateTask(taskId, updates)
    setTaskModalVisible(false)
    setEditingTask(null)
    setAddingTaskToProject(null)
  }

  const handleTaskAdd = (task: Task) => {
    if (addingTaskToProject) {
      // 清除相关项目缓存
      calculationCache.current.delete(`project-${addingTaskToProject}-${currentDate.format('YYYY-MM')}`)
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

  // 获取任务类型对应的人员
  const getTaskTypePersonnel = (task: Task, project: Project): string[] => {
    const taskTypeName = task.type.name
    switch (taskTypeName) {
      case '开发排期':
      case '开发联调':
      case '开发':
        return project.developers
      case '测试排期':
      case '测试联调':
      case '测试':
        return project.testers
      case '产品UAT':
      case '产品':
      case 'UAT':
        return project.productManager ? [project.productManager] : []
      case '上线':
      case '部署':
      case '发布':
        return project.pmo ? [project.pmo] : []
      default:
        return task.assignees
    }
  }

  // 获取任务的每日风险记录
  const getTaskRiskRecords = (task: Task): { [date: string]: any } => {
    const riskMap: { [date: string]: any } = {}
    if (task.dailyRecords) {
      task.dailyRecords.forEach(record => {
        if (record.status === 'risk' || record.status === 'delayed') {
          riskMap[record.date] = record
        }
      })
    }
    return riskMap
  }

  // 获取项目的最新风险状态
  const getProjectRiskStatus = (project: Project, projectTasks: Task[]): 'normal' | 'risk' | 'delayed' => {
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
    
    return project.status
  }

  // 带缓存的项目进度条计算
  const getProjectBarPosition = (project: Project, projectTasks: Task[]) => {
    const cacheKey = `project-${project.id}-${currentDate.format('YYYY-MM')}`
    
    if (calculationCache.current.has(cacheKey)) {
      return calculationCache.current.get(cacheKey)
    }
    
    const projectStartDate = dayjs(project.startDate)
    const projectEndDate = dayjs(project.endDate)
    const totalDays = days.length
    
    const projectStartOffset = Math.max(0, projectStartDate.diff(dateRange.start, 'day'))
    const projectDuration = Math.min(
      projectEndDate.diff(projectStartDate, 'day') + 1,
      totalDays - projectStartOffset
    )

    // 使用像素宽度计算，确保在小屏幕上不会压缩
    const dayWidth = 60 // 每个日期的固定宽度
    const projectBarLeft = projectStartOffset * dayWidth
    const projectBarWidth = projectDuration * dayWidth
    
    const result = {
      left: projectBarLeft,
      width: projectBarWidth,
      status: getProjectRiskStatus(project, projectTasks)
    }
    
    calculationCache.current.set(cacheKey, result)
    return result
  }

  // 带缓存的任务进度条计算
  const getTaskBarPosition = (task: Task) => {
    const cacheKey = `task-${task.id}-${currentDate.format('YYYY-MM')}`
    
    if (calculationCache.current.has(cacheKey)) {
      return calculationCache.current.get(cacheKey)
    }
    
    const taskStartDate = dayjs(task.startDate)
    const taskEndDate = dayjs(task.endDate)
    const totalDays = days.length
    
    const taskStartOffset = Math.max(0, taskStartDate.diff(dateRange.start, 'day'))
    const taskDuration = Math.min(
      taskEndDate.diff(taskStartDate, 'day') + 1,
      totalDays - taskStartOffset
    )

    // 使用像素宽度计算，确保在小屏幕上不会压缩
    const dayWidth = 60 // 每个日期的固定宽度
    const taskBarLeft = taskStartOffset * dayWidth
    const taskBarWidth = taskDuration * dayWidth
    
    const result = {
      left: taskBarLeft,
      width: taskBarWidth
    }
    
    calculationCache.current.set(cacheKey, result)
    return result
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

  const handleProjectClick = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
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

  // 监听滚动事件，更新视口范围
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft
        const containerWidth = containerRef.current.clientWidth
        const dayWidth = 60
        
        const visibleStartIndex = Math.floor(scrollLeft / dayWidth)
        const visibleEndIndex = Math.ceil((scrollLeft + containerWidth) / dayWidth)
        
        setVisibleDateRange({ start: visibleStartIndex, end: visibleEndIndex })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      // 初始计算
      handleScroll()
      
      return () => {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // 添加触摸滚动优化
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      let startX = 0
      let scrollLeft = 0
      let isScrolling = false

      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        isScrolling = true
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!isScrolling) return
        e.preventDefault()
        const x = e.touches[0].pageX - container.offsetLeft
        const walk = (x - startX) * 2 // 滚动速度倍数
        container.scrollLeft = scrollLeft - walk
      }

      const handleTouchEnd = () => {
        isScrolling = false
      }

      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

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
        <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
          左右滑动查看更多
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
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="project-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{project.name}</div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {project.pmo && (
                        <Tag color="red" style={{ 
                          fontSize: '10px',
                          height: '18px',
                          lineHeight: '16px',
                          margin: 0
                        }}>
                          {project.pmo}
                        </Tag>
                      )}
                      {project.productManager && (
                        <Tag color="blue" style={{ 
                          fontSize: '10px',
                          height: '18px',
                          lineHeight: '16px',
                          margin: 0
                        }}>
                          {project.productManager}
                        </Tag>
                      )}
                    </div>
                  </div>
                  <Space size={4}>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => handleAddTask(project.id)}
                      className="add-task-button"
                      style={{ padding: '0 4px', minWidth: '24px', height: '24px' }}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEditProject(project)}
                      className="edit-button"
                      style={{ padding: '0 4px', minWidth: '24px', height: '24px' }}
                    />
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
          <div className="timeline-header" style={{ width: `${days.length * 60}px` }}>
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
          
          {/* 滚动位置指示器 */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '2px', 
            backgroundColor: '#f0f0f0',
            zIndex: 5 
          }}>
            <div style={{
              width: `${(visibleDateRange.end - visibleDateRange.start) / days.length * 100}%`,
              height: '100%',
              backgroundColor: '#1890ff',
              transform: `translateX(${visibleDateRange.start / days.length * 100}%)`,
              transition: 'all 0.3s ease'
            }} />
          </div>

          <div className="timeline-body" style={{ width: `${days.length * 60}px` }}>
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.projectId === project.id)
              
              // 使用缓存的项目进度条计算
              const projectBarPosition = getProjectBarPosition(project, projectTasks)

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
                    
                    <Tooltip 
                      title={
                        <div>
                          <div><strong>{project.name}</strong></div>
                          <div>合作方: {project.partners.join(', ')}</div>
                          <div>开发: {project.developers.join(', ')}</div>
                          <div>测试: {project.testers.join(', ')}</div>
                          <div>负责人: {project.owner}</div>
                          <div>进度: {project.progress}%</div>
                          <div>状态: {getProjectRiskStatus(project, projectTasks) === 'normal' ? '正常' : getProjectRiskStatus(project, projectTasks) === 'risk' ? '风险' : '延期'}</div>
                        </div>
                      }
                    >
                      <div 
                        className="project-bar"
                        style={{
                          ...getProjectBarStyle({ ...project, status: projectBarPosition.status }),
                          left: `${projectBarPosition.left}px`,
                          width: `${projectBarPosition.width}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 8px',
                          minWidth: '60px'
                        }}
                        onClick={() => handleProjectClick(project)}
                      >
                        <div style={{ 
                          flex: 1, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '12px',
                          color: '#fff',
                          fontWeight: '500'
                        }}>
                          {project.name}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontWeight: '600',
                          marginLeft: '4px'
                        }}>
                          {project.progress}%
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                  
                  {/* 任务排期 */}
                  {projectTasks.map((task) => {
                    // 获取任务类型对应的人员
                    const personnel = getTaskTypePersonnel(task, project)
                    const personnelText = personnel.join('、')
                    
                    // 获取任务的每日风险记录
                    const riskRecords = getTaskRiskRecords(task)
                    
                    // 使用缓存的任务进度条计算
                    const taskBarPosition = getTaskBarPosition(task)

                    return (
                      <div key={task.id} className="timeline-row task-row">
                        <div className="timeline-grid">
                          {days.map((day) => {
                            const dayStr = day.format('YYYY-MM-DD')
                            const hasRisk = riskRecords[dayStr]
                            
                            return (
                              <div 
                                key={dayStr} 
                                className={`grid-cell ${isToday(day) ? 'today' : ''}`}
                                style={{ position: 'relative' }}
                              >
                                {hasRisk && (
                                  <div 
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      width: '8px',
                                      height: '8px',
                                      backgroundColor: '#ff4d4f',
                                      borderRadius: '50%',
                                      zIndex: 10,
                                      cursor: 'pointer'
                                    }}
                                    title={`${dayStr}: ${hasRisk.content}`}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        <Tooltip 
                          title={
                            <div>
                              <div><strong>{task.type.name}：{personnelText}</strong></div>
                              <div>任务: {task.name}</div>
                              <div>状态: {task.status === 'normal' ? '正常' : task.status === 'blocked' ? '阻塞' : '已解决'}</div>
                              <div>进度: {task.progress}%</div>
                              <div>时间: {dayjs(task.startDate).format('YYYY-MM-DD')} - {dayjs(task.endDate).format('YYYY-MM-DD')}</div>
                              {Object.keys(riskRecords).length > 0 && (
                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                                  <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>风险记录:</div>
                                  {Object.entries(riskRecords).map(([date, record]) => (
                                    <div key={date} style={{ fontSize: '12px' }}>
                                      {date}: {record.content}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div 
                            className="task-bar"
                            style={{
                              backgroundColor: task.type.color,
                              borderRadius: 4,
                              height: 20,
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              left: `${taskBarPosition.left}px`,
                              width: `${taskBarPosition.width}px`,
                              marginLeft: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0 6px',
                              minWidth: '40px'
                            }}
                            onClick={() => handleEditTask(task)}
                          >
                            <div style={{ 
                                flex: 1, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontSize: '11px',
                                color: '#fff',
                                fontWeight: '500',
                                minWidth: '0'
                              }}>
                                {task.type.name}：{personnelText}
                              </div>
                            <div style={{ 
                              fontSize: '10px', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              fontWeight: '600',
                              marginLeft: '2px'
                            }}>
                              {task.progress}%
                            </div>
                          </div>
                        </Tooltip>
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