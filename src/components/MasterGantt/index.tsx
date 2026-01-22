import { useState, useMemo, useRef, useEffect } from 'react'
import { Tooltip, Button, Space, Tag, App as AntApp } from 'antd'
import { LeftOutlined, RightOutlined, EditOutlined, PlusOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Project, Task } from '../../types'
import ProjectEditModal from '../ProjectEditModal'
import TaskEditModal from '../TaskEditModal'
import useStore from '../../store/useStore'
import useAuthStore from '../../store/authStore'
import './index.css'

interface MasterGanttProps {
  projects: Project[]
}

function MasterGantt({ projects }: MasterGanttProps) {
  const containerElementRef = useRef<HTMLDivElement>(null)

  const { role } = useAuthStore()
  const isAdmin = role === 'admin'
  const { message } = AntApp.useApp()

  // 内部辅助方法
  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存项目修改')
    }
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

  const handleAddTask = (projectId: string) => {
    setAddingTaskToProject(projectId)
    setEditingTask(null)
    setTaskModalVisible(true)
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存任务修改')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setAddingTaskToProject(null)
    setTaskModalVisible(true)
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存任务修改')
    }
  }

  const handleTaskSave = (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存任务修改')
      return
    }
    updateTask(taskId, updates)
    setTaskModalVisible(false)
    setEditingTask(null)
    setAddingTaskToProject(null)
  }

  const handleTaskAdd = (task: Task) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存任务修改')
      return
    }
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

  // 获取项目的每日风险记录 (综合所有任务)
  const getProjectRiskRecords = (project: Project, projectTasks: Task[]): { [date: string]: any } => {
    const riskMap: { [date: string]: any } = {}
    
    // 检查项目自身的 dailyProgress (如果有)
    if (project.dailyProgress) {
      project.dailyProgress.forEach(record => {
        if (record.status === 'risk' || record.status === 'delayed') {
          riskMap[record.date] = record
        }
      })
    }
    
    // 检查项目下所有任务的 dailyRecords
    projectTasks.forEach(task => {
      if (task.dailyRecords) {
        task.dailyRecords.forEach(record => {
          if (record.status === 'risk' || record.status === 'delayed') {
            // 如果同一天有多个风险，保留最新的或内容更丰富的
            if (!riskMap[record.date] || (record.content && !riskMap[record.date].content)) {
              riskMap[record.date] = {
                ...record,
                taskName: task.name
              }
            }
          }
        })
      }
    })
    
    return riskMap
  }

  // 获取项目的最新风险状态
  const getProjectRiskStatus = (project: Project): Project['status'] => {
    return project.status
  }

  const getProjectBarPosition = (project: Project) => {
    const projectStartDate = dayjs(project.startDate)
    const projectEndDate = dayjs(project.endDate)
    
    const projectStartOffset = projectStartDate.diff(dateRange.start, 'day')
    const projectDuration = projectEndDate.diff(projectStartDate, 'day') + 1

    const dayWidth = 60
    const projectBarLeft = projectStartOffset * dayWidth
    const projectBarWidth = projectDuration * dayWidth
    
    return {
      left: projectBarLeft,
      width: projectBarWidth,
      status: getProjectRiskStatus(project)
    }
  }

  // 任务进度条位置计算
  const getTaskBarPosition = (task: Task) => {
    const taskStartDate = dayjs(task.startDate)
    const taskEndDate = dayjs(task.endDate)
    
    const taskStartOffset = taskStartDate.diff(dateRange.start, 'day')
    const taskDuration = taskEndDate.diff(taskStartDate, 'day') + 1

    const dayWidth = 60
    const taskBarLeft = taskStartOffset * dayWidth
    const taskBarWidth = taskDuration * dayWidth
    
    return {
      left: taskBarLeft,
      width: taskBarWidth
    }
  }

  const getProjectBarStyle = (project: Project, status?: Project['status']) => {
    const finalStatus = status || project.status
    
    let backgroundColor = 'var(--success-color)' // 正常 - 绿色
    let borderColor = 'var(--success-color)'
    let textColor = '#ffffff'

    if (finalStatus === 'risk') {
      backgroundColor = 'var(--warning-color)' // 风险 - 黄色
      borderColor = 'var(--warning-color)'
      textColor = '#ffffff'
    } else if (finalStatus === 'delayed') {
      backgroundColor = 'var(--error-color)' // 延期 - 红色
      borderColor = 'var(--error-color)'
      textColor = '#ffffff'
    } else if (finalStatus === 'completed') {
      backgroundColor = '#595959' // 已完成 - 灰色
      borderColor = '#595959'
      textColor = '#ffffff'
    } else if (finalStatus === 'pending') {
      backgroundColor = 'var(--pending-color)' // 待开始 - 紫色
      borderColor = 'var(--pending-color)'
      textColor = '#ffffff'
    }

    return {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      color: textColor,
      borderRadius: '0px',
      height: 32,
      cursor: 'pointer',
      transition: 'all 0.3s',
    }
  }

  const handleProjectClick = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
  }

  const handlePrevMonth = () => {
    if (containerElementRef.current) {
      containerElementRef.current.scrollBy({ left: -600, behavior: 'smooth' })
    }
  }

  const handleNextMonth = () => {
    if (containerElementRef.current) {
      containerElementRef.current.scrollBy({ left: 600, behavior: 'smooth' })
    }
  }

  const handleToday = () => {
    if (containerElementRef.current && todayIndex !== -1) {
      const dayWidth = 60
      const scrollLeft = (todayIndex - 5) * dayWidth
      containerElementRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      })
    }
  }

  const isToday = (date: dayjs.Dayjs) => {
    return date.isSame(dateRange.today, 'day')
  }

  const isWeekend = (date: dayjs.Dayjs) => {
    const day = date.day()
    return day === 0 || day === 6
  }

  const dateRange = useMemo(() => {
    // 强制使用 2026-01-10 作为今天，确保演示效果一致
    const today = dayjs().year(2026).month(0).date(10)
    // 向前扩展 30 天，向后扩展 120 天，确保滚动空间足够
    const start = today.subtract(30, 'day')
    const end = today.add(120, 'day')
    return { start, end, today }
  }, [])

  // 计算日期数组
  const days = useMemo(() => {
    const days = []
    let current = dateRange.start
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end)) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }, [dateRange])

  // 计算今日索引
  const todayIndex = useMemo(() => {
    return days.findIndex(day => day.isSame(dateRange.today, 'day'))
  }, [days, dateRange.today])

  const [currentDate, setCurrentDate] = useState(dateRange.today)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTaskToProject, setAddingTaskToProject] = useState<string | null>(null)
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<string[]>([])
  const { updateProject, tasks, addTask, updateTask, taskTypes } = useStore()

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjectIds(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    )
  }

  const [rowHeights, setRowHeights] = useState<Record<string, number>>({})
  const rowHeightRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const observers = useRef<Record<string, ResizeObserver>>({})

  const handleSidebarRowRef = (id: string) => (element: HTMLDivElement | null) => {
    // 清理旧的 observer
    if (observers.current[id]) {
      observers.current[id].disconnect()
      delete observers.current[id]
    }

    if (!element) {
      delete rowHeightRefs.current[id]
      return
    }
    
    rowHeightRefs.current[id] = element
    
    // 使用 ResizeObserver 动态监听高度变化
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height
        setRowHeights(prev => {
          if (prev[id] === height) return prev
          return { ...prev, [id]: height }
        })
      }
    })
    
    observer.observe(element)
    observers.current[id] = observer
  }

  // 组件卸载时清理所有 observers
  useEffect(() => {
    return () => {
      Object.values(observers.current).forEach(observer => observer.disconnect())
    }
  }, [])

  // 监听滚动更新当前显示月份
  useEffect(() => {
    const container = containerElementRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const dayWidth = 60
      const visibleStartIndex = Math.floor(scrollLeft / dayWidth)
      if (days[visibleStartIndex]) {
        setCurrentDate(days[visibleStartIndex])
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [days])

  // 自动定位到今天前5天
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerElementRef.current && todayIndex !== -1) {
        const dayWidth = 60
        const scrollLeft = (todayIndex - 5) * dayWidth
        containerElementRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [todayIndex])

  // 添加触摸滚动优化
  useEffect(() => {
    const container = containerElementRef.current
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

  useEffect(() => {
    const container = containerElementRef.current
    if (!container) {
      return
    }

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
    }

    const handleMouseLeave = () => {
      isDown = false
    }

    const handleMouseUp = () => {
      isDown = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) {
        return
      }
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="master-gantt">
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
          <div className="sidebar-header">项目与任务列表</div>
          {projects.map((project) => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            const isCollapsed = collapsedProjectIds.includes(project.id)
            return (
              <div key={project.id} className="project-section">
                <div
                  className="sidebar-row project-row"
                  ref={handleSidebarRowRef(project.id)}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div
                      className="project-name"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        textOverflow: 'unset',
                        wordBreak: 'break-all',
                      }}
                    >
                      {project.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <Tag color="orange" style={{ fontSize: '10px', margin: 0 }}>
                          PM: {project.productManager || '未分配'}
                        </Tag>
                        {project.pmo && (
                          <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
                            PMO: {project.pmo}
                          </Tag>
                        )}
                      </div>
                      <Space size={2}>
                        <Tooltip title={isCollapsed ? '展开任务' : '收起任务'}>
                          <Button
                            type="text"
                            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
                            size="small"
                            onClick={() => toggleProjectCollapse(project.id)}
                            className="collapse-button"
                          />
                        </Tooltip>
                        <Tooltip title="添加任务">
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => handleAddTask(project.id)}
                            className="add-task-button"
                          />
                        </Tooltip>
                        <Tooltip title="编辑项目">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditProject(project)}
                            className="edit-button"
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </div>
                {!isCollapsed && projectTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="sidebar-row task-row"
                    ref={handleSidebarRowRef(task.id)}
                    style={{ minHeight: 32, height: 'fit-content' }}
                  >
                    <div className="task-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden', height: '100%' }}>
                      <Tag 
                        color={task.type.color} 
                        style={{ 
                          fontSize: '10px', 
                          margin: 0, 
                          borderRadius: '10px',
                          padding: '0 8px',
                          lineHeight: '18px',
                          border: `1px solid ${task.type.color}`,
                          background: `${task.type.color}`,
                          color: '#ffffff'
                        }}
                      >
                        {task.type.name}
                      </Tag>
                      <div className="task-name" style={{ fontSize: '12px' }}>{task.name}</div>
                    </div>
                    <Tooltip title="编辑任务">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditTask(task)}
                        className="edit-button"
                        style={{ fontSize: '10px' }}
                      />
                    </Tooltip>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <div className="gantt-timeline" ref={containerElementRef}>
          <div className="timeline-header" style={{ width: `${days.length * 60}px` }}>
            {days.map((day) => (
              <div 
                key={day.format('YYYY-MM-DD')} 
                className={`timeline-day ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'is-weekend' : ''}`}
              >
                <div className="day-weekday">{day.format('MM/DD')}</div>
              </div>
            ))}
          </div>
          
          {/* 今日贯穿红线 */}
          {todayIndex !== -1 && (
            <div 
              className="today-line-vertical" 
              style={{ 
                left: `${todayIndex * 60 + 30}px`,
                height: '100%' // 确保覆盖整个高度
              }}
            />
          )}

          <div className="timeline-body" style={{ width: `${days.length * 60}px` }}>
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.projectId === project.id)
              const isCollapsed = collapsedProjectIds.includes(project.id)
              const projectRiskRecords = getProjectRiskRecords(project, projectTasks)
              const riskDates = Object.keys(projectRiskRecords).sort()
              
              // 使用缓存的项目进度条计算
              const projectBarPosition = getProjectBarPosition(project)

              return (
                <div key={project.id} className="project-timeline-section">
                  {/* 项目进度条 */}
                  <div
                    className="timeline-row project-row"
                    style={{ height: rowHeights[project.id] || 64 }}
                  >
                    <div className="timeline-grid">
                      {days.map((day) => {
                        const dayStr = day.format('YYYY-MM-DD')
                        const risk = projectRiskRecords[dayStr]
                        return (
                          <div 
                            key={dayStr} 
                            className={`grid-cell ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'is-weekend' : ''} ${risk ? 'has-risk' : ''}`}
                          />
                        )
                      })}
                    </div>
                    
                    {/* 项目进度条背景 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '0',
                        width: `${days.length * 60}px`,
                        top: '0',
                        height: '100%',
                        backgroundColor: '#E6F4FF',
                        zIndex: 1,
                      }}
                    />
                    
                    <Tooltip 
                      title={
                        <div>
                          <div><strong>{project.name}</strong></div>
                          <div>负责人: {project.owner || '未分配'}</div>
                          {project.developers && project.developers.length > 0 && (
                            <div>开发: {project.developers.join('、')}</div>
                          )}
                          {project.testers && project.testers.length > 0 && (
                            <div>测试: {project.testers.join('、')}</div>
                          )}
                          <div>进度: {project.progress}%</div>
                          <div>状态: {
                            projectBarPosition.status === 'normal' ? '正常' :
                            projectBarPosition.status === 'risk' ? '风险' :
                            projectBarPosition.status === 'delayed' ? '延期' :
                            projectBarPosition.status === 'completed' ? '已完成' :
                            '待开始'
                          }</div>
                          {riskDates.length > 0 && (
                            <div>风险日期: {riskDates.join(' / ')}</div>
                          )}
                        </div>
                      }
                    >
                      <div 
                        className="project-bar"
                        style={{
                          ...getProjectBarStyle(project, projectBarPosition.status),
                          left: `${projectBarPosition.left}px`,
                          width: `${projectBarPosition.width}px`,
                          top: `${((rowHeights[project.id] || 64) - 40) / 2}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          padding: '0 12px',
                          minWidth: '60px',
                          minHeight: '40px'
                        }}
                        onClick={() => handleProjectClick(project)}
                      >
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%'
                        }}>
                          <div style={{ 
                            flex: 1, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {project.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            fontWeight: '700',
                            marginLeft: '8px'
                          }}>
                            {project.progress}%
                          </div>
                        </div>
                        {(project.developers && project.developers.length > 0) || (project.testers && project.testers.length > 0) ? (
                          <div style={{ 
                            fontSize: '10px', 
                            opacity: 0.9,
                            marginTop: '2px',
                            display: 'flex',
                            gap: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {project.developers && project.developers.length > 0 && (
                              <span>开发: {project.developers.join('、')}</span>
                            )}
                            {project.testers && project.testers.length > 0 && (
                              <span>测试: {project.testers.join('、')}</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </Tooltip>

                    {/* 风险感叹号覆盖层，确保在项目条之上 */}
                    <div className="project-risk-layer">
                      {days.map((day, index) => {
                        const dayStr = day.format('YYYY-MM-DD')
                        const risk = projectRiskRecords[dayStr]
                        if (!risk) return null
                        return (
                          <Tooltip 
                            key={dayStr}
                            title={
                              <div>
                                <div><strong>{risk.status === 'risk' ? '风险' : '延期'}</strong></div>
                                <div>备注：{risk.content || '无备注'}</div>
                                <div>来源：{risk.taskName ? `任务 - ${risk.taskName}` : '项目整体'}</div>
                              </div>
                            }
                          >
                            <div
                              className="project-risk-block"
                              style={{ left: `${index * 60}px` }}
                            >
                              <div className="risk-indicator">!</div>
                            </div>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* 任务排期 */}
                  {!isCollapsed && projectTasks.map((task) => {
                    const personnel = getTaskTypePersonnel(task, project)
                    const personnelText = personnel.join('、')
                    const taskBarPosition = getTaskBarPosition(task)

                    return (
                      <div 
                        key={task.id} 
                        className="timeline-row task-row"
                        style={{ height: rowHeights[task.id] || 32 }}
                      >
                        <div className="timeline-grid">
                          {days.map((day) => (
                            <div 
                              key={day.format('YYYY-MM-DD')} 
                              className={`grid-cell ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'is-weekend' : ''}`}
                              style={{ position: 'relative' }}
                            />
                          ))}
                        </div>
                        
                        <Tooltip 
                          title={
                            <div>
                              <div><strong>{task.name}</strong></div>
                              <div>阶段: {task.type.name}</div>
                              <div>进度: {task.progress}%</div>
                              <div>负责人: {personnelText || '未分配'}</div>
                              <div>周期: {dayjs(task.startDate).format('MM/DD')} - {dayjs(task.endDate).format('MM/DD')}</div>
                            </div>
                          }
                        >
                          <div 
                            className="task-bar-container"
                            style={{
                              left: `${taskBarPosition.left}px`,
                              width: `${taskBarPosition.width}px`,
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 8px',
                              overflow: 'hidden',
                              backgroundColor: `${task.type.color}`, // 使用强对比色
                              border: `1px solid ${task.type.color}`,
                              color: '#ffffff', // 白色字体
                              borderRadius: '14px' // 任务条改为圆角（Tag 样式）
                            }}
                            onClick={() => handleEditTask(task)}
                          >
                            <div style={{ 
                              flex: 1, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {task.name}
                            </div>
                            <div style={{ 
                              fontSize: '10px', 
                              opacity: 0.9,
                              marginLeft: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              {personnelText}
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
          <span>正常进行</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff4d4f' }}></div>
          <span>风险/延期</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f6ffed', border: '1px solid #389e0d' }}></div>
          <span>周末</span>
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
        onProjectCreated={() => {}}
      />

      <TaskEditModal
        visible={taskModalVisible}
        task={editingTask}
        taskTypes={taskTypes}
        project={projects.find(p => p.id === (addingTaskToProject || editingTask?.projectId))}
        isAdmin={isAdmin}
        onSave={handleTaskSave}
        onAdd={handleTaskAdd}
        onCancel={handleTaskCancel}
      />
    </div>
  )
}

export default MasterGantt
