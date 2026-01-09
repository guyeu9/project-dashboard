import { useState, useMemo } from 'react'
import { Modal, Table, Tag, Space, Input, DatePicker, Select, Button } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { TaskHistory as TaskHistoryType } from '../../types'
import dayjs from 'dayjs'
import './index.css'

const { Option } = Select

interface TaskHistoryProps {
  visible: boolean
  taskId: string | null
  onClose: () => void
}

function TaskHistory({ visible, taskId, onClose }: TaskHistoryProps) {
  const [searchText, setSearchText] = useState('')
  const [filterUser, setFilterUser] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const mockHistories = useMemo(() => {
    if (!taskId) return []
    
    return [
      {
        id: '1',
        taskId,
        modifiedBy: '张三',
        modifiedAt: '2024-01-08 10:30:00',
        changes: {
          progress: { from: 50, to: 75 },
          status: { from: 'normal', to: 'blocked' },
          dailyProgress: { from: '', to: '完成接口开发' },
        } as Record<string, { from: unknown; to: unknown }>,
      },
      {
        id: '2',
        taskId,
        modifiedBy: '李四',
        modifiedAt: '2024-01-08 14:20:00',
        changes: {
          progress: { from: 75, to: 80 },
          dailyProgress: { from: '完成接口开发', to: '完成单元测试' },
        } as Record<string, { from: unknown; to: unknown }>,
      },
      {
        id: '3',
        taskId,
        modifiedBy: '王五',
        modifiedAt: '2024-01-09 09:15:00',
        changes: {
          status: { from: 'blocked', to: 'resolved' },
          remark: { from: '', to: '阻塞已解决' },
        } as Record<string, { from: unknown; to: unknown }>,
      },
    ]
  }, [taskId])

  const filteredHistories = useMemo(() => {
    return mockHistories.filter(history => {
      const matchesSearch = !searchText || 
        Object.values(history.changes).some(change => 
          JSON.stringify(change).toLowerCase().includes(searchText.toLowerCase())
        )
      
      const matchesUser = !filterUser || history.modifiedBy === filterUser
      const matchesType = !filterType || 
        Object.keys(history.changes).includes(filterType)
      
      const matchesDate = !dateRange || (
        dayjs(history.modifiedAt).isAfter(dateRange[0].startOf('day')) &&
        dayjs(history.modifiedAt).isBefore(dateRange[1].endOf('day'))
      )
      
      return matchesSearch && matchesUser && matchesType && matchesDate
    })
  }, [mockHistories, searchText, filterUser, filterType, dateRange])

  const columns = [
    {
      title: '修改时间',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      width: 180,
      render: (text: string) => (
        <span className="history-time">{text}</span>
      ),
    },
    {
      title: '修改人',
      dataIndex: 'modifiedBy',
      key: 'modifiedBy',
      width: 120,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: '修改内容',
      key: 'changes',
      render: (_: any, record: TaskHistoryType) => (
        <div className="changes-container">
          {Object.entries(record.changes).map(([key, change]) => (
            <div key={key} className="change-item">
              <span className="change-field">{getFieldLabel(key)}:</span>
              <span className="change-value">
                <span className="change-from">{formatChangeValue(change.from)}</span>
                <span className="change-arrow">→</span>
                <span className="change-to">{formatChangeValue(change.to)}</span>
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  const getFieldLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      progress: '进度',
      status: '状态',
      dailyProgress: '当日进展',
      remark: '备注',
      assignees: '负责人',
      startDate: '开始日期',
      endDate: '结束日期',
    }
    return labelMap[key] || key
  }

  const formatChangeValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    if (value === null || value === undefined) {
      return '空'
    }
    return String(value)
  }

  const handleClearFilters = () => {
    setSearchText('')
    setFilterUser('')
    setFilterType('')
    setDateRange(null)
  }

  return (
    <Modal
      title="任务修改历史"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div className="history-filters">
        <Space size="middle">
          <Input
            placeholder="搜索修改内容"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          
          <Select
            placeholder="筛选修改人"
            value={filterUser}
            onChange={setFilterUser}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="张三">张三</Option>
            <Option value="李四">李四</Option>
            <Option value="王五">王五</Option>
          </Select>

          <Select
            placeholder="筛选修改类型"
            value={filterType}
            onChange={setFilterType}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="progress">进度</Option>
            <Option value="status">状态</Option>
            <Option value="dailyProgress">当日进展</Option>
            <Option value="remark">备注</Option>
          </Select>

          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始日期', '结束日期']}
            style={{ width: 280 }}
          />

          <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
            清除筛选
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredHistories}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ y: 400 }}
        className="history-table"
      />
    </Modal>
  )
}

export default TaskHistory