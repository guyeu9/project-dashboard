import { useState, useMemo, useRef } from 'react'
import { Table, Button, Space, Tag, Progress, Avatar, Popconfirm } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Task } from '../../types'
import './index.css'

interface ExecutionGanttProps {
  tasks: Task[]
  onTaskDoubleClick: (task: Task) => void
  onViewHistory?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
  isAdmin?: boolean
}

function ExecutionGantt({ tasks, onTaskDoubleClick, onViewHistory, onDeleteTask, isAdmin }: ExecutionGanttProps) {
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
        title: '任务信息',
        dataIndex: 'name',
        key: 'name',
        width: 240,
        fixed: 'left' as const,
        render: (_: string, record: Task) => {
          const taskTypeName = record.type?.name || ''
          const taskName = record.name || ''

          return (
            <div className="task-info-cell">
              <span className="task-type-name">{taskTypeName}</span>
              <span className="task-name">{taskName}</span>
            </div>
          )
        },
      },
      {
        title: '负责人',
        dataIndex: 'assignees',
        key: 'assignees',
        width: 200,
        render: (assignees: string[]) => (
          <Space size={4} wrap>
            {assignees.map((name, index) => (
              <Tag key={index} color="blue" style={{ margin: 0 }}>
                {name}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        title: '周期',
        key: 'period',
        width: 120,
        render: (_: any, record: Task) => {
          const startDate = dayjs(record.startDate).format('YYYY.MM.DD')
          const endDate = dayjs(record.endDate).format('YYYY.MM.DD')
          return (
            <div className="task-period-cell">
              <div className="period-start">{startDate}-</div>
              <div className="period-end">{endDate}</div>
            </div>
          )
        },
      },
      {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: string) => {
                const statusConfig = {
                  normal: { color: 'var(--success-color)', text: '正常' },
                  risk: { color: 'var(--warning-color)', text: '风险' },
                  delayed: { color: 'var(--error-color)', text: '延期' },
                  completed: { color: '#595959', text: '已完成' },
                  pending: { color: 'var(--pending-color)', text: '待开始' },
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
            <Popconfirm
              title="确认删除该任务？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => onDeleteTask?.(record.id)}
              okButtonProps={{ danger: true }}
              disabled={!isAdmin}
            >
              <Button type="link" size="small" danger disabled={!isAdmin}>
                删除
              </Button>
            </Popconfirm>
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
      normal: 'var(--success-color)',      // 正常 → 绿色
      risk: 'var(--warning-color)',         // 风险 → 黄色
      delayed: 'var(--error-color)',      // 延期 → 红色
      completed: '#595959',    // 已完成 → 灰色
      pending: 'var(--pending-color)',      // 待开始 → 紫色
    }
    return colorMap[status as keyof typeof colorMap] || 'var(--success-color)'
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
