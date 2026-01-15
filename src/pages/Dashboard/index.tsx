import { useState, useEffect, useMemo } from 'react'
import { Card, Row, Col, Spin, Tag, Space } from 'antd'
import { 
  ClockCircleOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import MasterGantt from '../../components/MasterGantt'
import AIAnalysisModal from '../../components/AIAnalysisModal'
import './index.css'

function Dashboard() {
  const { projects } = useStore()
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }, [])

  // 计算各状态数量
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    // 过滤掉已完成的项目进行统计
    const activeProjects = projects.filter(p => p.status !== 'completed')
    const total = activeProjects.length
    
    const normal = projects.filter(p => p.status === 'normal').length
    const risk = projects.filter(p => p.status === 'risk').length
    const delayed = projects.filter(p => p.status === 'delayed').length
    
    // 待开始逻辑
    const pendingProjects = projects.filter(p => {
      if (p.status === 'pending') return true
      if (!p.startDate) return true
      return p.startDate > today
    })
    const pendingCount = pendingProjects.length

    return [
      { 
        label: '全部项目', 
        count: total, 
        gradient: 'var(--gradient-blue)',
        icon: <ProjectOutlined />, 
        key: 'all' 
      },
      { 
        label: '待开始', 
        count: pendingCount, 
        gradient: 'var(--gradient-purple)',
        icon: <ClockCircleOutlined />, 
        key: 'pending' 
      },
      { 
        label: '正常推进', 
        count: normal, 
        gradient: 'var(--gradient-green)',
        icon: <CheckCircleOutlined />, 
        key: 'normal' 
      },
      { 
        label: '存在风险', 
        count: risk, 
        gradient: 'var(--gradient-warning)',
        icon: <ExclamationCircleOutlined />, 
        key: 'risk' 
      },
      { 
        label: '已延期', 
        count: delayed, 
        gradient: 'var(--gradient-error)',
        icon: <ClockCircleOutlined />, 
        key: 'delayed' 
      },
    ]
  }, [projects])

  const filteredProjects = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    if (selectedFilter === 'all') return projects.filter(p => p.status !== 'completed')
    if (selectedFilter === 'pending') {
      return projects.filter(p => {
        if (p.status === 'pending') return true
        if (!p.startDate) return true
        return p.startDate > today
      })
    }
    return projects.filter(p => p.status === selectedFilter)
  }, [projects, selectedFilter])

  const handleFilterClick = (key: string) => {
    setSelectedFilter(key === selectedFilter ? 'all' : key)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
          </motion.div>
        </Col>
      </Row>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Row gutter={[20, 20]} className="metrics-row">
          {metrics.map((metric) => (
            <Col xs={24} sm={12} md={8} lg={4} xl={4} key={metric.key} style={{ flex: '1 1 200px' }}>
              <motion.div variants={item} style={{ height: '100%' }}>
                <Card 
                  hoverable 
                  className={`metric-card-vibrant ${selectedFilter === metric.key ? 'active' : ''}`}
                  onClick={() => handleFilterClick(metric.key)}
                  styles={{ body: { padding: '24px' } }}
                  style={{ 
                    background: metric.gradient,
                    border: 'none',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div className="metric-icon-bg">
                    {metric.icon}
                  </div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
                      {metric.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 800 }}>{metric.count}</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>个</span>
                    </div>
                  </div>
                  <div className="metric-card-decoration" />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card 
                className="main-gantt-card"
                title={
                  <div className="card-title-wrapper">
                    <Space size="middle">
                      <span className="title-indicator" />
                      <span style={{ fontWeight: 700, fontSize: 16 }}>项目进度甘特图</span>
                      {selectedFilter !== 'all' && (
                        <Tag 
                          closable 
                          onClose={() => setSelectedFilter('all')} 
                          color="blue"
                          style={{ borderRadius: 4, padding: '2px 10px' }}
                        >
                          视图: {metrics.find(m => m.key === selectedFilter)?.label}
                        </Tag>
                      )}
                    </Space>
                  </div>
                }
              >
                <MasterGantt projects={filteredProjects} />
              </Card>
            </motion.div>
          </AnimatePresence>
        </Col>
      </Row>

      <AIAnalysisModal />
    </motion.div>
  )
}

export default Dashboard