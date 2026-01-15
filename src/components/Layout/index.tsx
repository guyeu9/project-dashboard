import React, { useState, useEffect } from 'react'
import { Layout as AntLayout, Menu, Button, ConfigProvider, Modal, Form, Input, Space, App as AntApp } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import NotificationDropdown from '../NotificationDropdown'
import AIAnalysisModal from '../AIAnalysisModal'
import useAuthStore from '../../store/authStore'
import useNotificationStore from '../../store/notificationStore'
import useAIAnalysisStore from '../../store/aiStore'
import { startReminderTimer, cleanupReminderTimer } from '../../utils/notificationUtils'
import './index.css'

const { Header, Sider, Content } = AntLayout

interface LoginFormProps {
  role: string
  onQuickAdmin: () => void
}

function LoginForm({ role, onQuickAdmin }: LoginFormProps) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ username: 'admin', password: 'admin' }}
    >
      {role !== 'admin' && (
        <>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号，默认为 admin" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码，默认为 admin" />
          </Form.Item>
          <Space style={{ marginTop: 8 }}>
            <Button type="link" onClick={onQuickAdmin}>
              管理员一键登录
            </Button>
          </Space>
        </>
      )}
      {role === 'admin' && (
        <div>
          <p>当前已以 <strong>管理员</strong> 身份登录。</p>
          <p>可以在「设置中心」和各页面修改项目与任务数据。</p>
        </div>
      )}
    </Form>
  )
}

function CustomLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = AntApp.useApp()
  const [collapsed, setCollapsed] = useState(false)
  const { notifications, unreadCount, confirmNotification } = useNotificationStore()
  const { role, initFromCookie, quickAdminLogin, logout } = useAuthStore()
  const { openModal } = useAIAnalysisStore()
  const [loginVisible, setLoginVisible] = useState(false)

  const handleAIAnalysis = () => {
    openModal({ scope: 'all' })
  }

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '项目全景' },
    { key: '/project-management', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/resource-schedule', icon: <TeamOutlined />, label: '资源排期' },
    { key: '/smart-parser', icon: <FileTextOutlined />, label: '智能解析' },
    { key: '/data-management', icon: <FileTextOutlined />, label: '数据管理' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置中心' },
    { key: '/user-guide', icon: <QuestionCircleOutlined />, label: '使用说明' },
  ]

  const getSelectedMenuKey = () => {
    const { pathname } = location
    if (pathname.startsWith('/project/')) {
      return '/project-management'
    }
    // 处理可能的尾部斜杠，确保匹配
    if (pathname !== '/' && pathname.endsWith('/')) {
      return pathname.slice(0, -1)
    }
    return pathname
  }

  useEffect(() => {
    const timerId = startReminderTimer()
    return () => cleanupReminderTimer(timerId)
  }, [])

  useEffect(() => {
    initFromCookie()
  }, [initFromCookie])

  const handleQuickAdmin = () => {
    quickAdminLogin()
    message.success('已一键登录为管理员')
    setLoginVisible(false)
  }

  const handleLogout = () => {
    logout()
    message.success('已退出登录，当前为游客')
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2F54EB',
          borderRadius: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Layout: {
            headerBg: '#FFFFFF',
            siderBg: '#FFFFFF',
            bodyBg: '#F5F7FA',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'var(--gradient-blue)',
            itemSelectedColor: '#FFFFFF',
            itemHoverBg: '#F0F5FF',
            itemHoverColor: '#2F54EB',
          }
        }
      }}
    >
      <AntLayout className="app-layout">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={220}
          collapsedWidth={80}
          className="app-sider"
        >
          <div className="logo-container">
            <div className="logo-icon">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="logo-text"
              >
                新产品联调平台
              </motion.span>
            )}
          </div>
          <Menu
          mode="inline"
          selectedKeys={[getSelectedMenuKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="app-menu"
        />
        </Sider>
        <AntLayout>
          <Header className="app-header">
            <div className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="collapse-btn"
              />
              <h1 className="page-title">
                {menuItems.find(item => item.key === location.pathname)?.label || '详情'}
              </h1>
            </div>
            <div className="header-right">
              <Button
                type="primary"
                size="large"
                icon={<RobotOutlined />}
                onClick={handleAIAnalysis}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  height: 'auto',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  marginRight: '16px'
                }}
              >
                AI 一键分析
              </Button>
              <NotificationDropdown 
                notifications={notifications}
                unreadCount={unreadCount}
                onConfirm={confirmNotification}
              />
              <div 
                className="user-profile"
                style={{ cursor: 'pointer' }}
                onClick={() => setLoginVisible(true)}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {role === 'admin' ? 'A' : 'G'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="user-name">{role === 'admin' ? '管理员' : '游客'}</span>
                </div>
              </div>
            </div>
          </Header>
          <Content className="app-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="content-wrapper"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Content>
        </AntLayout>
      </AntLayout>

      <Modal
        title={role === 'admin' ? '账户信息' : '管理员登录'}
        open={loginVisible}
        onCancel={() => setLoginVisible(false)}
        onOk={role === 'admin' ? handleLogout : undefined}
        okText={role === 'admin' ? '退出登录' : '登录'}
      >
        {loginVisible && (
          <LoginForm
          role={role}
          onQuickAdmin={handleQuickAdmin}
        />
        )}
      </Modal>

      <AIAnalysisModal />
    </ConfigProvider>
  )
}

export default CustomLayout
