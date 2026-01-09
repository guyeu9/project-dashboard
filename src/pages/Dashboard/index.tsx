import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Statistic, Select, Spin, Tag, Progress } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons'
import useStore from '../../store/useStore'
import MasterGantt from '../../components/MasterGantt'

const { Option } = Select

function Dashboard() {
  const { projects, selectedStatus, setSelectedStatus } = useStore()
  const [loading, setLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  const filteredProjects = useMemo(() => {
    if (selectedStatus.length === 0) return projects
    return projects.filter((p) => selectedStatus.includes(p.status))
  }, [projects, selectedStatus])

  const displayedProjects = useMemo(() => {
    if (selectedProjects.length === 0) return filteredProjects
    return filteredProjects.filter((p) => selectedProjects.includes(p.id))
  }, [filteredProjects, selectedProjects])

  const handleProjectCardClick = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
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

  const metrics = useMemo(() => {
    const parallelProjects = filteredProjects.length
    const delayedProjects = filteredProjects.filter((p: any) => p.status === 'delayed').length
    const riskProjects = filteredProjects.filter((p: any) => p.status === 'risk').length
    const pendingProjects = filteredProjects.filter((p: any) => p.status === 'normal' && p.progress === 0).length

    return {
      parallelProjects,
      delayedOrRisk: delayedProjects + riskProjects,
      pendingProjects,
    }
  }, [filteredProjects])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const handleStatusChange = (value: string[]) => {
    setSelectedStatus(value)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)', // 活泼的蓝色
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
              border: 'none',
              overflow: 'hidden',
              padding: '18px', // 减小内边距
              position: 'relative',
              height: '140px' // 减小高度
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
              并行项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Statistic
                value={metrics.parallelProjects}
                valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #FF7A45 0%, #FFB980 100%)', // 活泼的橙色
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
              border: 'none',
              overflow: 'hidden',
              padding: '18px', // 减小内边距
              position: 'relative',
              height: '140px' // 减小高度
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
              延期/风险
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Statistic
                value={metrics.delayedOrRisk}
                valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <CloseCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #52C41A 0%, #95DE64 100%)', // 活泼的绿色
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
              border: 'none',
              overflow: 'hidden',
              padding: '18px', // 减小内边距
              position: 'relative',
              height: '140px' // 减小高度
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
              待开始
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Statistic
                value={metrics.pendingProjects}
                valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <ClockCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="项目状态筛选"
        extra={
          <Select
            mode="multiple"
            placeholder="选择项目状态"
            style={{ width: 200 }}
            value={selectedStatus}
            onChange={handleStatusChange}
            allowClear
            size="middle"
          >
            <Option value="normal">正常</Option>
            <Option value="delayed">延期</Option>
            <Option value="risk">风险</Option>
          </Select>
        }
        style={{ 
          marginBottom: 24, 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          padding: '16px'
        }}
      >
        <div style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>
          共 {filteredProjects.length} 个项目
        </div>
      </Card>

      <Card 
        title="项目列表" 
        style={{ 
          marginBottom: 24, 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff'
        }}
      >
        <Row gutter={[24, 24]}>
          {filteredProjects.map(project => (
            <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => handleProjectCardClick(project.id)}
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: selectedProjects.includes(project.id) ? '0 0 0 2px #1890ff, 0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  cursor: 'pointer'
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
                  <Tag 
                    color={selectedProjects.includes(project.id) ? 'blue' : 'default'} 
                    style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '12px', fontWeight: '500' }}
                  >
                    {selectedProjects.includes(project.id) ? '已选中' : '未选中'}
                  </Tag>
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
                  <div className="info-row" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="label" style={{ color: '#666', fontSize: '14px' }}>时间：</span>
                    <span className="value" style={{ color: '#333', fontSize: '14px' }}>
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card 
        title="项目全景甘特图" 
        style={{ 
          marginTop: 24, 
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          padding: '0'
        }}
      >
        <MasterGantt projects={displayedProjects} />
      </Card>
    </div>
  )
}

export default Dashboard