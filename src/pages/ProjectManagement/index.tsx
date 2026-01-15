import { useState, useMemo } from 'react'
import { Card, Row, Col, Tag, Button, Space, Select, DatePicker, Input, Empty, Radio, Progress, Spin, App as AntApp, Popconfirm } from 'antd'
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  RobotOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import useStore from '../../store/useStore'
import useAIAnalysisStore from '../../store/aiStore'
import useAuthStore from '../../store/authStore'
import ProjectEditModal from '../../components/ProjectEditModal'
import AIAnalysisModal from '../../components/AIAnalysisModal'
import { Project } from '../../types'
import './index.css'
import { useNavigate } from 'react-router-dom'

const { Option } = Select
const { RangePicker } = DatePicker

function ProjectManagement() {
  const { projects, addProject, updateProject, deleteProject } = useStore()
  const { openModal } = useAIAnalysisStore()
  const { role } = useAuthStore()
  const { message } = AntApp.useApp()
  const navigate = useNavigate()
  const isAdmin = role === 'admin'
  const [loading] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'progress'>('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const handleAIAnalysis = (project: Project) => {
    openModal({ scope: 'single', projectId: project.id, projectName: project.name })
  }

  const statusOptions = [
    { label: '待开始', value: 'pending' },
    { label: '正常', value: 'normal' },
    { label: '延期', value: 'delayed' },
    { label: '风险', value: 'risk' },
    { label: '已完成', value: 'completed' },
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
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存项目修改')
    }
  }

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

  const handleProjectAdd = (project: Project) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以保存项目修改')
      return
    }
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
      normal: 'var(--success-color)',
      delayed: 'var(--error-color)', // 延期统一红色
      risk: 'var(--warning-color)',   // 风险/黄色
      pending: 'var(--pending-color)', // 待开始/紫色
      completed: '#595959',
    }
    return colorMap[status as keyof typeof colorMap] || 'var(--neutral-secondary)'
  }

  const getStatusText = (status: string) => {
    const textMap = {
      pending: '待开始',
      normal: '正常',
      delayed: '延期',
      risk: '风险',
      completed: '已完成',
    }
    return textMap[status as keyof typeof textMap] || status
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'var(--success-color)'
    if (progress >= 50) return 'var(--primary-color)'
    if (progress >= 20) return 'var(--warning-color)'
    return 'var(--error-color)'
  }

  const renderCardView = () => (
    <Row gutter={[24, 24]}>
      {filteredProjects.map(project => (
        <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            className="project-card-v3"
            hoverable
            onClick={() => navigate(`/project/${project.id}`)}
            styles={{ body: { padding: '24px' } }}
          >
            <div className="card-header-v3">
              <div className="header-left-v3">
                <Tag 
                  color={getStatusColor(project.status)} 
                  className="status-tag-v3"
                >
                  {getStatusText(project.status)}
                </Tag>
                <Button
                  type="text"
                  size="small"
                  icon={<RobotOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIAnalysis(project);
                  }}
                  className="ai-btn-v3"
                >
                  AI分析
                </Button>
              </div>
              <Space size={4}>
                <Button
                  type="text"
                  size="small"
                  disabled={!isAdmin}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    if (!isAdmin) {
                      message.warning('当前为游客，仅管理员可以编辑项目')
                      return
                    }
                    handleEditProject(project);
                  }}
                  className="edit-btn-v3"
                >
                  设置
                </Button>
                <Popconfirm
                  title="确认删除该项目？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => {
                    if (!isAdmin) {
                      message.warning('当前为游客，仅管理员可以删除项目')
                      return
                    }
                    deleteProject(project.id);
                  }}
                  okButtonProps={{ danger: true }}
                  disabled={!isAdmin}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    disabled={!isAdmin}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                    className="delete-btn-v3"
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
            <h3 className="project-name-v3">{project.name}</h3>
            <div className="card-body-v3">
              <div className="info-row-v3">
                <span className="label">负责人</span>
                <span className="value">{project.owner}</span>
              </div>
              <div className="info-row-v3">
                <span className="label">当前进度</span>
                <div style={{ flex: 1, marginLeft: 16 }}>
                  <Progress
                    percent={project.progress}
                    strokeColor={getProgressColor(project.progress)}
                    size="small"
                    trailColor="var(--neutral-border)"
                  />
                </div>
              </div>
              <div className="info-row-v3">
                <span className="label">起止时间</span>
                <span className="value date-value">
                  {dayjs(project.startDate).format('MM/DD')} - {dayjs(project.endDate).format('MM/DD')}
                </span>
              </div>
              <div className="dev-team-v3">
                <span className="label">开发团队</span>
                <div className="team-tags">
                  <Space size={4} wrap>
                    {project.developers.slice(0, 3).map((dev, index) => (
                      <Tag key={index} className="dev-tag-v3">
                        {dev}
                      </Tag>
                    ))}
                    {project.developers.length > 3 && (
                      <Tag className="dev-tag-v3 more">+{project.developers.length - 3}</Tag>
                    )}
                  </Space>
                </div>
              </div>
            </div>
            <div className="card-footer-v3">
              <Button type="link" block className="manage-link-v3">
                查看详情 <ArrowRightOutlined />
              </Button>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderListView = () => (
    <div className="project-list-v3">
      <div className="list-header-v3">
        <div className="col-name">项目名称</div>
        <div className="col-owner">负责人</div>
        <div className="col-date">周期</div>
        <div className="col-devs">核心开发</div>
        <div className="col-progress">进度</div>
        <div className="col-status">状态</div>
        <div className="col-action">操作</div>
      </div>
      {filteredProjects.map(project => (
        <div 
          key={project.id} 
          className="list-item-v3"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          <div className="col-name">{project.name}</div>
          <div className="col-owner">{project.owner}</div>
          <div className="col-date">
            {dayjs(project.startDate).format('YYYY-MM-DD')}
          </div>
          <div className="col-devs">
            <Space size={4}>
              {project.developers.slice(0, 2).map((dev, i) => (
                <Tag key={i} className="dev-tag-v3 mini">{dev}</Tag>
              ))}
            </Space>
          </div>
          <div className="col-progress">
            <Progress
              percent={project.progress}
              strokeColor={getProgressColor(project.progress)}
              size="small"
              style={{ width: '100px', margin: 0 }}
            />
          </div>
          <div className="col-status">
            <Tag 
              color={getStatusColor(project.status)} 
              className="status-tag-v3"
            >
              {getStatusText(project.status)}
            </Tag>
          </div>
          <div className="col-action">
            <Space>
              <Button 
                type="text" 
                size="small" 
                icon={<RobotOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAIAnalysis(project);
                }}
                className="ai-btn-list"
              >
                AI分析
              </Button>
              <Button 
                type="text" 
                size="small" 
                disabled={!isAdmin}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAdmin) {
                    message.warning('当前为游客，仅管理员可以编辑项目')
                    return
                  }
                  handleEditProject(project);
                }}
                className="edit-btn-list"
              >
                编辑
              </Button>
              <Button 
                type="primary" 
                size="small" 
                disabled={!isAdmin}
                className="btn-purple-mini"
              >
                管理
              </Button>
              <Popconfirm
                title="确认删除该项目？"
                okText="删除"
                cancelText="取消"
                onConfirm={() => {
                  if (!isAdmin) {
                    message.warning('当前为游客，仅管理员可以删除项目')
                    return
                  }
                  deleteProject(project.id);
                }}
                okButtonProps={{ danger: true }}
                disabled={!isAdmin}
              >
                <Button 
                  type="text" 
                  size="small" 
                  danger
                  disabled={!isAdmin}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                >
                  删除
                </Button>
              </Popconfirm>
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
          <Button type="primary" onClick={handleAddProject} disabled={!isAdmin}>
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

      <AIAnalysisModal />
    </div>
  )
}

export default ProjectManagement
