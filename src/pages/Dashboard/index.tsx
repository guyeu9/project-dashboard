import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons'
import useStore from '../../store/useStore'
import MasterGantt from '../../components/MasterGantt'

function Dashboard() {
  const { projects } = useStore()
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'ongoing') {
      // 当前进行项目：显示所有未结束的项目（包括正常、延期、风险状态）
      return projects.filter((p) => p.status === 'normal' || p.status === 'delayed' || p.status === 'risk')
    } else if (selectedFilter === 'parallel') {
      // 并行项目：显示所有并行项目
      return projects.filter((p) => p.status === 'normal' || p.status === 'delayed' || p.status === 'risk')
    } else if (selectedFilter === 'delayed') {
      return projects.filter((p) => p.status === 'delayed')
    } else if (selectedFilter === 'risk') {
      return projects.filter((p) => p.status === 'risk')
    } else if (selectedFilter === 'pending') {
      // 待开始项目：显示进度为0的正常状态项目
      return projects.filter((p) => p.status === 'normal' && p.progress === 0)
    }
    return projects
  }, [projects, selectedFilter])

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(selectedFilter === filter ? 'all' : filter)
  }

  const metrics = useMemo(() => {
    const ongoingProjects = projects.filter((p: any) => p.status !== 'completed').length
    const parallelProjects = projects.filter((p: any) => p.status === 'normal' || p.status === 'delayed' || p.status === 'risk').length
    const delayedProjects = projects.filter((p: any) => p.status === 'delayed').length
    const riskProjects = projects.filter((p: any) => p.status === 'risk').length
    const pendingProjects = projects.filter((p: any) => p.status === 'normal' && p.progress === 0).length

    return {
      ongoingProjects,
      parallelProjects,
      delayedProjects,
      riskProjects,
      pendingProjects,
    }
  }, [projects])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            hoverable
            onClick={() => handleFilterClick('ongoing')}
            style={{
              background: selectedFilter === 'ongoing' 
                ? 'linear-gradient(135deg, #722ED1 0%, #B37FEB 100%)' 
                : 'linear-gradient(135deg, #9254DE 0%, #D3ADF7 100%)',
              borderRadius: '10px',
              boxShadow: selectedFilter === 'ongoing' 
                ? '0 0 0 2px #722ed1, 0 10px 20px rgba(0, 0, 0, 0.15)' 
                : '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: 'none',
              overflow: 'hidden',
              padding: '12px',
              position: 'relative',
              height: '120px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>
              当前进行项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Statistic
                value={metrics.ongoingProjects}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', alignSelf: 'flex-start', marginTop: '6px' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            hoverable
            onClick={() => handleFilterClick('parallel')}
            style={{
              background: selectedFilter === 'parallel' 
                ? 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)' 
                : 'linear-gradient(135deg, #69C0FF 0%, #BAE7FF 100%)',
              borderRadius: '10px',
              boxShadow: selectedFilter === 'parallel' 
                ? '0 0 0 2px #1890ff, 0 10px 20px rgba(0, 0, 0, 0.15)' 
                : '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: 'none',
              overflow: 'hidden',
              padding: '12px',
              position: 'relative',
              height: '120px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>
              并行项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Statistic
                value={metrics.parallelProjects}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', alignSelf: 'flex-start', marginTop: '6px' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            hoverable
            onClick={() => handleFilterClick('delayed')}
            style={{
              background: selectedFilter === 'delayed' 
                ? 'linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%)' 
                : 'linear-gradient(135deg, #FF7A45 0%, #FFB980 100%)',
              borderRadius: '10px',
              boxShadow: selectedFilter === 'delayed' 
                ? '0 0 0 2px #ff4d4f, 0 10px 20px rgba(0, 0, 0, 0.15)' 
                : '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: 'none',
              overflow: 'hidden',
              padding: '12px',
              position: 'relative',
              height: '120px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>
              延期项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Statistic
                value={metrics.delayedProjects}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <CloseCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', alignSelf: 'flex-start', marginTop: '6px' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            hoverable
            onClick={() => handleFilterClick('risk')}
            style={{
              background: selectedFilter === 'risk' 
                ? 'linear-gradient(135deg, #FA8C16 0%, #FFC53D 100%)' 
                : 'linear-gradient(135deg, #FAAD14 0%, #FFD666 100%)',
              borderRadius: '10px',
              boxShadow: selectedFilter === 'risk' 
                ? '0 0 0 2px #faad14, 0 10px 20px rgba(0, 0, 0, 0.15)' 
                : '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: 'none',
              overflow: 'hidden',
              padding: '12px',
              position: 'relative',
              height: '120px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>
              风险项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Statistic
                value={metrics.riskProjects}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <ClockCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', alignSelf: 'flex-start', marginTop: '6px' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            hoverable
            onClick={() => handleFilterClick('pending')}
            style={{
              background: selectedFilter === 'pending' 
                ? 'linear-gradient(135deg, #52C41A 0%, #95DE64 100%)' 
                : 'linear-gradient(135deg, #B7EB8F 0%, #D3F261 100%)',
              borderRadius: '10px',
              boxShadow: selectedFilter === 'pending' 
                ? '0 0 0 2px #52c41a, 0 10px 20px rgba(0, 0, 0, 0.15)' 
                : '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: 'none',
              overflow: 'hidden',
              padding: '12px',
              position: 'relative',
              height: '120px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>
              待开始项目
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Statistic
                value={metrics.pendingProjects}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
              />
              <ClockCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', alignSelf: 'flex-start', marginTop: '6px' }} />
            </div>
          </Card>
        </Col>
      </Row>

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
        <MasterGantt projects={filteredProjects} />
      </Card>
    </div>
  )
}

export default Dashboard