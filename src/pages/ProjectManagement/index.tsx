import { useState, useMemo } from 'react'
import { Card, Row, Col, Tag, Button, Space, Select, DatePicker, Input, Empty, Radio, Progress, Spin } from 'antd'
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import useStore from '../../store/useStore'
import ProjectEditModal from '../../components/ProjectEditModal'
import { Project } from '../../types'
import './index.css'

const { Option } = Select
const { RangePicker } = DatePicker

function ProjectManagement() {
  const { projects, addProject, updateProject } = useStore()
  const [loading] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'progress'>('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const statusOptions = [
    { label: '正常', value: 'normal' },
    { label: '延期', value: 'delayed' },
    { label: '风险', value: 'risk' },
  ]

  const allOwners = useMemo(() => {
    const owners = new Set<string>()
    projects.forEach(project => owners.add(project.owner))
    return Array.from(owners)
  }, [projects])

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (statusFilter.length > 0) {
      result = result.filter(p => statusFilter.includes(p.status))
    }

    if (ownerFilter.length > 0) {
      result = result.filter(p => ownerFilter.includes(p.owner))
    }

    if (dateRange) {
      const [start, end] = dateRange
      result = result.filter(p => {
        const projectStart = dayjs(p.startDate)
        const projectEnd = dayjs(p.endDate)
        return projectStart.isAfter(start) && projectEnd.isBefore(end)
      })
    }

    if (searchText) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'startDate':
          comparison = dayjs(a.startDate).unix() - dayjs(b.startDate).unix()
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [projects, statusFilter, ownerFilter, dateRange, searchText, sortBy, sortOrder])

  const handleSort = (field: 'name' | 'startDate' | 'progress') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setEditModalVisible(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setEditModalVisible(true)
  }

  const handleProjectSave = (projectId: string, updates: Partial<Project>) => {
    updateProject(projectId, updates)
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const handleProjectAdd = (project: Project) => {
    addProject(project)
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const handleProjectCancel = () => {
    setEditModalVisible(false)
    setEditingProject(null)
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      normal: 'green',
      delayed: 'red',
      risk: 'orange',
    }
    return colorMap[status as keyof typeof colorMap] || 'default'
  }

  const getStatusText = (status: string) => {
    const textMap = {
      normal: '正常',
      delayed: '延期',
      risk: '风险',
    }
    return textMap[status as keyof typeof textMap] || status
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a'
    if (progress >= 50) return '#1890ff'
    if (progress >= 20) return '#faad14'
    return '#ff4d4f'
  }

  const renderCardView = () => (
    <Row gutter={[24, 24]}>
      {filteredProjects.map(project => (
        <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            className="project-card"
            hoverable
            onClick={() => window.location.href = `/project/${project.id}`}
            style={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Tag 
                color={getStatusColor(project.status)} 
                style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '12px', fontWeight: '500' }}
              >
                {getStatusText(project.status)}
              </Tag>
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}
                style={{ fontSize: '12px', padding: '0' }}
              >
                编辑
              </Button>
            </div>
            <h3 className="project-name" style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{project.name}</h3>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="info-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label" style={{ color: '#666', fontSize: '14px' }}>负责人：</span>
                <span className="value" style={{ color: '#333', fontSize: '14px' }}>{project.owner}</span>
              </div>
              <div className="info-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label" style={{ color: '#666', fontSize: '14px' }}>进度：</span>
                <Progress
                  percent={project.progress}
                  strokeColor={getProgressColor(project.progress)}
                  size="small"
                  style={{ width: '120px' }}
                />
              </div>
              <div className="info-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label" style={{ color: '#666', fontSize: '14px' }}>时间：</span>
                <span className="value" style={{ color: '#333', fontSize: '14px' }}>
                  {dayjs(project.startDate).format('MM/DD')} - {dayjs(project.endDate).format('MM/DD')}
                </span>
              </div>
              <div className="info-row" style={{ marginBottom: 0 }}>
                <span className="label" style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>开发：</span>
                <Space size={4} wrap>
                  {project.developers.slice(0, 3).map((dev, index) => (
                    <Tag key={index} color="blue" style={{ margin: 0, borderRadius: '12px', fontSize: '12px' }}>
                      {dev}
                    </Tag>
                  ))}
                  {project.developers.length > 3 && (
                    <Tag style={{ borderRadius: '12px', fontSize: '12px' }}>+{project.developers.length - 3}</Tag>
                  )}
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderListView = () => (
    <div className="project-list" style={{ marginTop: '24px' }}>
      <div style={{ 
        background: '#fafafa', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px',
        fontWeight: 'bold',
        color: '#333',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr auto',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div>项目名称</div>
        <div>负责人</div>
        <div>开始日期</div>
        <div>结束日期</div>
        <div>开发人员</div>
        <div>整体进度</div>
        <div>状态</div>
        <div style={{ textAlign: 'right' }}>操作</div>
      </div>
      {filteredProjects.map(project => (
        <div 
          key={project.id} 
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            padding: '20px',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr auto',
            gap: '16px',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'}
        >
          <div style={{ fontWeight: '500', color: '#333' }}>{project.name}</div>
          <div style={{ color: '#666' }}>{project.owner}</div>
          <div style={{ color: '#333' }}>{dayjs(project.startDate).format('YYYY-MM-DD')}</div>
          <div style={{ color: '#333' }}>{dayjs(project.endDate).format('YYYY-MM-DD')}</div>
          <div style={{ color: '#666' }}>{project.developers.slice(0, 2).join(', ')}</div>
          <div>
            <Progress
              percent={project.progress}
              strokeColor={getProgressColor(project.progress)}
              size="small"
              style={{ width: '100px' }}
            />
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>{project.progress}%</span>
          </div>
          <div>
            <Tag 
              color={getStatusColor(project.status)} 
              style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '12px', fontWeight: '500' }}
            >
              {getStatusText(project.status)}
            </Tag>
          </div>
          <div style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              type="text" 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(project);
              }}
              style={{ fontSize: '12px' }}
            >
              编辑
            </Button>
            <Button 
              type="primary" 
              size="small" 
              onClick={() => window.location.href = `/project/${project.id}`}
              style={{ 
                borderRadius: '6px', 
                background: 'linear-gradient(45deg, #0f3460 0%, #16537e 100%)', 
                border: 'none',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              管理进度
            </Button>
          </Space>
        </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="project-management">
      <Card 
        title="项目进度" 
        extra={
          <Button type="primary" style={{ 
            borderRadius: '8px', 
            background: 'linear-gradient(45deg, #0f3460 0%, #16537e 100%)', 
            border: 'none',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }} onClick={handleAddProject}>
            新建项目
          </Button>
        }
        style={{ 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px',
          backgroundColor: '#ffffff'
        }}
      >
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>管理项目进度与状态</p>

        <div className="toolbar">
          <Space wrap>
            <Input
              placeholder="搜索项目名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200, borderRadius: '8px' }}
              allowClear
            />

            <Select
              mode="multiple"
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150, borderRadius: '8px' }}
              allowClear
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            <Select
              mode="multiple"
              placeholder="筛选负责人"
              value={ownerFilter}
              onChange={setOwnerFilter}
              style={{ width: 150, borderRadius: '8px' }}
              allowClear
            >
              {allOwners.map(owner => (
                <Option key={owner} value={owner}>
                  {owner}
                </Option>
              ))}
            </Select>

            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: 260, borderRadius: '8px' }}
            />
          </Space>

          <Space>
            <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <Radio.Button value="card" style={{ borderRadius: '8px 0 0 8px' }}>
                <AppstoreOutlined /> 卡片
              </Radio.Button>
              <Radio.Button value="list" style={{ borderRadius: '0 8px 8px 0' }}>
                <UnorderedListOutlined /> 列表
              </Radio.Button>
            </Radio.Group>
          </Space>
        </div>

        <div className="sort-bar">
          <Space>
            <span style={{ color: '#666' }}>排序：</span>
            <Button
              type={sortBy === 'name' ? 'primary' : 'default'}
              onClick={() => handleSort('name')}
              style={{ borderRadius: '8px' }}
            >
              名称 {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
            </Button>
            <Button
              type={sortBy === 'startDate' ? 'primary' : 'default'}
              onClick={() => handleSort('startDate')}
              style={{ borderRadius: '8px' }}
            >
              开始时间 {sortBy === 'startDate' && (sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
            </Button>
            <Button
              type={sortBy === 'progress' ? 'primary' : 'default'}
              onClick={() => handleSort('progress')}
              style={{ borderRadius: '8px' }}
            >
              进度 {sortBy === 'progress' && (sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
            </Button>
          </Space>
        </div>

        {filteredProjects.length === 0 ? (
          <Empty description="暂无符合条件的项目" />
        ) : (
          <div className="project-content">
            {viewMode === 'card' ? renderCardView() : renderListView()}
          </div>
        )}
      </Card>

      <ProjectEditModal
        visible={editModalVisible}
        project={editingProject}
        onSave={handleProjectSave}
        onAdd={handleProjectAdd}
        onCancel={handleProjectCancel}
      />
    </div>
  )
}

export default ProjectManagement
