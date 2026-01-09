import { useState, useMemo, useRef } from 'react'
import { Table, Button, Space, Tag, Progress, Avatar } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Task } from '../../types'
import './index.css'

interface ExecutionGanttProps {
  tasks: Task[]
  onTaskDoubleClick: (task: Task) => void
  onViewHistory?: (taskId: string) => void
}

function ExecutionGantt({ tasks, onTaskDoubleClick, onViewHistory }: ExecutionGanttProps) {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const tableRef = useRef<HTMLDivElement>(null)

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

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: '任务名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        fixed: 'left' as const,
        render: (text: string, record: Task) => (
          <div className="task-name-cell">
            <div className="task-name">{text}</div>
            {record.dailyProgress && (
              <div className="daily-progress">
                {record.dailyProgress}
              </div>
            )}
          </div>
        ),
      },
      {
        title: '负责人',
        dataIndex: 'assignees',
        key: 'assignees',
        width: 120,
        render: (assignees: string[]) => (
          <Avatar.Group maxCount={2} size="small">
            {assignees.map((name, index) => (
              <Avatar key={index} style={{ backgroundColor: '#87d068' }}>
                {name.charAt(0)}
              </Avatar>
            ))}
          </Avatar.Group>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => {
          const statusConfig = {
            normal: { color: 'green', text: '正常' },
            blocked: { color: 'red', text: '阻塞' },
            resolved: { color: 'blue', text: '已解决' },
          }
          const config = statusConfig[status as keyof typeof statusConfig]
          return <Tag color={config.color}>{config.text}</Tag>
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right' as const,
        render: (_: any, record: Task) => (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => onTaskDoubleClick(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => onViewHistory?.(record.id)}
              disabled={!onViewHistory}
            >
              历史
            </Button>
          </Space>
        ),
      },
    ]

    const dateColumns = days.map(day => ({
      title: day.format('M/D'),
      key: day.format('YYYY-MM-DD'),
      width: 60,
      align: 'center' as const,
      className: `date-column ${day.isSame(dayjs(), 'day') ? 'today' : ''}`,
      render: (_: any, record: Task) => {
        const startDate = dayjs(record.startDate)
        const endDate = dayjs(record.endDate)
        const isInRange = day.isAfter(startDate.subtract(1, 'day')) && day.isBefore(endDate.add(1, 'day'))
        
        if (isInRange) {
          const totalDays = endDate.diff(startDate, 'day') + 1
          const currentDay = day.diff(startDate, 'day') + 1
          const progress = (currentDay / totalDays) * 100
          
          return (
            <div className="task-bar-cell">
              <Progress
                percent={progress}
                showInfo={false}
                strokeColor={getStatusColor(record.status)}
                size="small"
              />
            </div>
          )
        }
        return null
      },
    }))

    return [...baseColumns, ...dateColumns]
  }, [days])

  const getStatusColor = (status: string) => {
    const colorMap = {
      normal: '#52c41a',
      blocked: '#ff4d4f',
      resolved: '#1890ff',
    }
    return colorMap[status as keyof typeof colorMap] || '#52c41a'
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

  const handleRowDoubleClick = (record: Task) => {
    onTaskDoubleClick(record)
  }

  return (
    <div className="execution-gantt" ref={tableRef}>
      <div className="gantt-toolbar">
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

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content', y: 400 }}
        onRow={(record) => ({
          onDoubleClick: () => handleRowDoubleClick(record),
        })}
        rowClassName="gantt-row"
      />
    </div>
  )
}

export default ExecutionGantt
