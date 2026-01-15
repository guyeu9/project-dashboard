import React, { useState } from 'react'
import { Table, Select, DatePicker, Pagination, Card, Space, Tag } from 'antd'
import { ClockCircleOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import useStore from '../../store/useStore'
import './index.css'

const { RangePicker } = DatePicker
const { Option } = Select

const HistoryLog: React.FC = () => {
  const { projects, getHistoryRecords } = useStore()
  const [filters, setFilters] = useState({
    projectId: undefined as string | undefined,
    timeRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 获取历史记录
  const records = getHistoryRecords({
    projectId: filters.projectId,
    startDate: filters.timeRange?.[0]?.format('YYYY-MM-DD'),
    endDate: filters.timeRange?.[1]?.format('YYYY-MM-DD'),
  })

  // 分页处理
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }))
  }

  // 筛选处理
  const handleProjectChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      projectId: value || undefined,
    }))
    setPagination(prev => ({
      ...prev,
      current: 1,
    }))
  }

  const handleTimeRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setFilters(prev => ({
      ...prev,
      timeRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null,
    }))
    setPagination(prev => ({
      ...prev,
      current: 1,
    }))
  }

  // 分页数据
  const paginatedRecords = records.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  )

  // 操作类型中文映射
  const operationTypeMap: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
  }

  // 实体类型中文映射
  const entityTypeMap: Record<string, string> = {
    project: '项目',
    task: '任务',
    taskType: '任务类型',
  }

  // 操作类型标签颜色映射
  const operationColorMap: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
  }

  // 表格列配置
  const columns = [
    {
      title: '操作时间',
      dataIndex: 'operatedAt',
      key: 'operatedAt',
      width: 180,
      render: (operatedAt: string) => (
        <div className="history-time">
          <ClockCircleOutlined className="time-icon" />
          <span>{dayjs(operatedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      render: (operation: string) => (
        <Tag color={operationColorMap[operation] || 'default'}>
          {operationTypeMap[operation] || operation}
        </Tag>
      ),
    },
    {
      title: '实体类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 100,
      render: (entityType: string) => entityTypeMap[entityType] || entityType,
    },
    {
      title: '实体名称',
      dataIndex: 'entityName',
      key: 'entityName',
      width: 150,
      render: (name: string) => <span className="entity-name">{name}</span>,
    },
    {
      title: '所属项目',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 150,
      render: (projectId: string) => {
        const project = projects.find(p => p.id === projectId)
        return project ? (
          <div className="project-info">
            <ProjectOutlined className="project-icon" />
            <span>{project.name}</span>
          </div>
        ) : '-'
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (operator: string) => (
        <div className="operator-info">
          <UserOutlined className="user-icon" />
          <span>{operator}</span>
        </div>
      ),
    },
    {
      title: '变更内容',
      dataIndex: 'changes',
      key: 'changes',
      render: (changes: Record<string, { from: unknown; to: unknown }>) => {
        if (!changes || Object.keys(changes).length === 0) {
          return '-'
        }

        return (
          <div className="changes-list">
            {Object.entries(changes).slice(0, 3).map(([key, { from, to }], index) => (
              <div key={index} className="change-item">
                <span className="change-key">{key}:</span>
                <span className="change-from">{JSON.stringify(from)}</span>
                <span className="change-arrow">→</span>
                <span className="change-to">{JSON.stringify(to)}</span>
              </div>
            ))}
            {Object.keys(changes).length > 3 && (
              <div className="change-more">... 共 {Object.keys(changes).length} 项变更</div>
            )}
          </div>
        )
      },
    },
  ]

  // 准备表格数据
  const tableData = paginatedRecords.map(record => ({
    ...record,
    key: record.id,
  }))

  return (
    <div className="history-log-container">
      <Card title="历史修改记录" className="history-log-card">
        <div className="filter-section">
          <Space size="middle" wrap>
            <Select
              placeholder="按项目筛选"
              style={{ width: 200 }}
              value={filters.projectId}
              onChange={handleProjectChange}
              allowClear
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleTimeRangeChange}
              allowClear
            />
          </Space>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: '暂无修改记录',
            }}
          />
        </div>

        <div className="pagination-section">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={records.length}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
          />
        </div>
      </Card>
    </div>
  )
}

export default HistoryLog