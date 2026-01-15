import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, Button, Space, Radio, Tooltip, Tag, Empty } from 'antd'
import { LeftOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Task } from '../../types'
import useStore from '../../store/useStore'
import './index.css'

interface ResourceHeatmapProps {
  tasks: Task[]
}

interface HeatmapData {
  userId: string
  userName: string
  role: 'developer' | 'tester'
  date: string
  taskCount: number
  tasks: Task[]
  isOverloaded: boolean
  isIdle: boolean
}

function ResourceHeatmap({ tasks }: ResourceHeatmapProps) {
  const { projects } = useStore()
  const [viewMode, setViewMode] = useState<'number' | 'color'>('color')
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)
  const [sidePanelVisible, setSidePanelVisible] = useState(false)
  const containerElementRef = useRef<HTMLDivElement>(null)

  const overloadThreshold = 3
  const idleThreshold = 1

  const dateRange = useMemo(() => {
    const today = dayjs()
    const start = today.subtract(30, 'day')
    const end = today.add(120, 'day')
    return { start, end, today }
  }, [])

  const allUsers = useMemo(() => {
    const userRoles = new Map<string, 'developer' | 'tester'>()
    
    projects.forEach(project => {
      project.developers.forEach(dev => {
        userRoles.set(dev, 'developer')
      })
      project.testers.forEach(tester => {
        userRoles.set(tester, 'tester')
      })
    })
    
    tasks.forEach(task => {
      task.assignees.forEach(assignee => {
        if (!userRoles.has(assignee)) {
          userRoles.set(assignee, 'developer')
        }
      })
    })
    
    return Array.from(userRoles.entries()).map(([name, role]) => ({
      id: name,
      name,
      role,
    }))
  }, [projects, tasks])

  const dateRangeDays = useMemo(() => {
    const days = []
    let current = dateRange.start
    while (current.isBefore(dateRange.end) || current.isSame(dateRange.end, 'day')) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }, [dateRange])

  const todayIndex = useMemo(() => {
    return dateRangeDays.findIndex(day => day.isSame(dateRange.today, 'day'))
  }, [dateRangeDays, dateRange.today])

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

  const heatmapData = useMemo(() => {
    const data: HeatmapData[] = []

    allUsers.forEach(user => {
      dateRangeDays.forEach(date => {
        const dateStr = date.format('YYYY-MM-DD')
        const userTasks = tasks.filter(task => 
          task.assignees.includes(user.name) &&
          !dayjs(task.startDate).isAfter(date) &&
          !dayjs(task.endDate).isBefore(date)
        )

        const taskCount = userTasks.length
        const isOverloaded = taskCount > overloadThreshold
        const isIdle = taskCount < idleThreshold

        data.push({
          userId: user.id,
          userName: user.name,
          role: user.role,
          date: dateStr,
          taskCount,
          tasks: userTasks,
          isOverloaded,
          isIdle,
        })
      })
    })

    return data
  }, [allUsers, dateRangeDays, tasks, overloadThreshold, idleThreshold])

  const overloadedUsers = useMemo(() => {
    const overloaded = new Set<string>()
    heatmapData.forEach(cell => {
      if (cell.isOverloaded) {
        overloaded.add(cell.userName)
      }
    })
    return Array.from(overloaded)
  }, [heatmapData])

  const handleCellClick = (cell: HeatmapData) => {
    setSelectedCell(cell)
    setSidePanelVisible(true)
  }

  const handlePrevPeriod = () => {
    setCurrentDate(currentDate.subtract(1, 'month'))
  }

  const handleNextPeriod = () => {
    setCurrentDate(currentDate.add(1, 'month'))
  }

  const handleToday = () => {
    setCurrentDate(dayjs())
    if (containerElementRef.current && todayIndex !== -1) {
      const dayWidth = 60
      const scrollLeft = (todayIndex - 5) * dayWidth
      containerElementRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      })
    }
  }

  const getCellColor = (cell: HeatmapData) => {
    if (cell.taskCount === 0) return '#f5f5f5'
    if (cell.isOverloaded) return '#ff4d4f'
    if (cell.isIdle) return '#e6f7ff'
    
    const intensity = Math.min(cell.taskCount / overloadThreshold, 1)
    const baseColor = { r: 82, g: 196, b: 26 }
    const factor = 0.3 + intensity * 0.7
    return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${factor})`
  }

  const getCellContent = (cell: HeatmapData) => {
    if (viewMode === 'number') {
      return cell.taskCount > 0 ? cell.taskCount : ''
    }
    return ''
  }

  const getCellTitle = (cell: HeatmapData) => {
    if (cell.taskCount === 0) return '无任务'
    if (cell.isOverloaded) return `过载：${cell.taskCount}个任务`
    if (cell.isIdle) return `空闲：${cell.taskCount}个任务`
    return `${cell.taskCount}个任务`
  }

  return (
    <div className="resource-heatmap">
      <Card title="资源排期热力图">
        <div className="heatmap-toolbar">
          <Space>
            <Button icon={<LeftOutlined />} onClick={handlePrevPeriod}>
              上个月
            </Button>
            <Button onClick={handleToday}>今天</Button>
            <Button icon={<RightOutlined />} onClick={handleNextPeriod}>
              下个月
            </Button>
          </Space>

          <Space>
            <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <Radio.Button value="color">颜色模式</Radio.Button>
              <Radio.Button value="number">数字模式</Radio.Button>
            </Radio.Group>
          </Space>
        </div>

        {overloadedUsers.length > 0 && (
          <div className="warning-banner">
            <WarningOutlined />
            <span>
              检测到过载人员：{overloadedUsers.join(', ')}
            </span>
          </div>
        )}

        <div className="heatmap-wrapper">
          <div className="heatmap-sidebar">
            <div className="sidebar-header">人员</div>
            {allUsers.map(user => (
              <div key={user.id} className="sidebar-row">
                <div className="user-name">{user.name}</div>
                <div className="user-role">
                  {user.role === 'developer' ? '开发' : '测试'}
                </div>
              </div>
            ))}
          </div>

          <div className="heatmap-main" ref={containerElementRef}>
            {allUsers.length === 0 ? (
              <Empty description="暂无人员数据" />
            ) : (
              <div className="heatmap-grid">
                <div className="heatmap-header">
                  {dateRangeDays.map(date => (
                    <div
                      key={date.format('YYYY-MM-DD')}
                      className={`date-cell ${date.isSame(dayjs(), 'day') ? 'today' : ''}`}
                    >
                      {date.format('M/D')}
                    </div>
                  ))}
                </div>

                {todayIndex !== -1 && (
                  <div
                    className="today-line-vertical"
                    style={{
                      left: `${todayIndex * 60 + 30}px`,
                      height: '100%'
                    }}
                  />
                )}

                {allUsers.map(user => (
                  <div key={user.id} className="heatmap-row">
                    {dateRangeDays.map(date => {
                      const dateStr = date.format('YYYY-MM-DD')
                      const cell = heatmapData.find(
                        c => c.userId === user.id && c.date === dateStr
                      )
                      return (
                        <Tooltip key={dateStr} title={cell ? getCellTitle(cell) : '无任务'}>
                          <div
                            className={`heatmap-cell ${cell?.isOverloaded ? 'overloaded' : ''} ${cell?.isIdle ? 'idle' : ''}`}
                            style={{
                              backgroundColor: cell ? getCellColor(cell) : '#f5f5f5',
                            }}
                            onClick={() => cell && handleCellClick(cell)}
                          >
                            {getCellContent(cell!)}
                          </div>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="heatmap-legend">
          <Space>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f5f5f5' }} />
              <span>无任务</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e6f7ff' }} />
              <span>空闲（1个任务）</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'rgba(82, 196, 26, 0.6)' }} />
              <span>正常（2-3个任务）</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ff4d4f' }} />
              <span>过载（3个以上任务）</span>
            </div>
          </Space>
        </div>

        {sidePanelVisible && selectedCell && (
          <div className="side-panel">
            <div className="panel-header">
              <h3>
                {selectedCell.userName} - {dayjs(selectedCell.date).format('YYYY年MM月DD日')}
              </h3>
              <Button
                type="text"
                onClick={() => setSidePanelVisible(false)}
              >
                ✕
              </Button>
            </div>
            <div className="panel-content">
              {selectedCell.tasks.length === 0 ? (
                <Empty description="当天无任务" />
              ) : (
                <div className="task-list">
                  {selectedCell.tasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId)
                    return (
                      <div key={task.id} className="task-item">
                        <div className="task-header">
                          <span className="task-name">{task.name}</span>
                          <Tag color={
                            task.status === 'normal' ? 'var(--success-color)' : 
                            task.status === 'risk' ? 'var(--warning-color)' : 
                            task.status === 'delayed' ? 'var(--error-color)' : 
                            task.status === 'completed' ? '#595959' : 
                            task.status === 'pending' ? 'var(--pending-color)' : 
                            'default'
                          }>
                            {task.status === 'normal' ? '正常' : 
                             task.status === 'risk' ? '风险' : 
                             task.status === 'delayed' ? '延期' : 
                             task.status === 'completed' ? '已完成' : 
                             task.status === 'pending' ? '待开始' : 
                             task.status}
                          </Tag>
                        </div>
                        <div className="task-project">
                          项目：{project?.name || '未知'}
                        </div>
                        <div className="task-date">
                          {dayjs(task.startDate).format('MM/DD')} - {dayjs(task.endDate).format('MM/DD')}
                        </div>
                        <div className="task-progress">
                          进度：{task.progress}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ResourceHeatmap
