import React from 'react'
import { Layout as AntLayout, Menu, Breadcrumb } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import './index.css'
import {
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  ProjectOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useEffect } from 'react'
import NotificationDropdown from '../NotificationDropdown'
import useNotificationStore from '../../store/notificationStore'
import { startReminderTimer, cleanupReminderTimer } from '../../utils/notificationUtils'

const { Header, Sider, Content } = AntLayout

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 通知状态管理
  const { notifications, unreadCount, confirmNotification } = useNotificationStore()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '项目全景',
    },
    {
      key: '/project-management',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/resource-schedule',
      icon: <TeamOutlined />,
      label: '资源排期',
    },
    {
      key: '/data-management',
      icon: <SettingOutlined />,
      label: '数据管理',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 确认通知处理函数
  const handleConfirmNotification = (notificationId: string) => {
    confirmNotification(notificationId)
  }

  // 启动和清理提醒定时器
  useEffect(() => {
    const timerId = startReminderTimer()
    return () => {
      cleanupReminderTimer(timerId)
    }
  }, [])

  // 获取当前页面标题
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return '立项总览'
      case '/project-management':
        return '项目进度'
      case '/resource-schedule':
        return '资源排期'
      case '/data-management':
        return '数据管理'
      default:
        return '媒体剧项目管理平台'
    }
  }

  // 自定义菜单项样式，参考卡片设计
  const customMenuItems = menuItems.map(item => ({
    ...item,
    icon: React.cloneElement(item.icon as React.ReactElement, {
      style: {
        fontSize: '18px',
        marginRight: '12px'
      }
    })
  }));

  return (
    <AntLayout style={{ 
      minHeight: '100vh',
      background: 'var(--gray-50)'
    }}>
      <Sider
        width={200}
        style={{
          background: '#FFFFFF',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          borderRight: '1px solid var(--gray-200)'
        }}
      >
        <div style={{
          height: 64,
          margin: '0 var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gray-800)',
          fontWeight: 'var(--font-weight-bold)',
          fontSize: 'var(--font-size-lg)',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          媒体剧项目管理平台
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            background: '#FFFFFF',
            borderRight: 'none',
            fontSize: '16px',
            marginTop: 'var(--spacing-md)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)'
          }}
          className="custom-vertical-menu"
          // 使用items的样式配置替代itemStyle等属性
          items={customMenuItems.map(item => ({
            ...item,
            style: {
              margin: 'var(--spacing-sm) 0',
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.3s ease',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              padding: '0 var(--spacing-md)'
            },
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>{item.label}</div>
                {location.pathname === item.key && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                )}
              </div>
            )
          }))}
        />
      </Sider>
      <AntLayout style={{ background: 'transparent' }}>
        <Header style={{
          padding: '0 var(--spacing-xxl)',
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          height: 'var(--header-height)'
        }}>
          <div>
            <Breadcrumb style={{ margin: 'var(--spacing-sm) 0' }}>
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              <Breadcrumb.Item>{getPageTitle()}</Breadcrumb.Item>
            </Breadcrumb>
            <h1 style={{ 
              margin: 0, 
              color: 'var(--gray-800)', 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 'var(--font-weight-bold)'
            }}>
              {getPageTitle()}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            {/* 使用新的通知下拉组件 */}
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onConfirm={handleConfirmNotification}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-md)', 
              cursor: 'pointer',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              transition: 'all var(--transition-base)',
              backgroundColor: 'var(--gray-50)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-100)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-50)'}>
              <UserOutlined style={{ fontSize: 'var(--font-size-lg)', color: 'var(--gray-600)' }} />
              <span style={{ color: 'var(--gray-700)', fontWeight: 'var(--font-weight-medium)' }}>admin</span>
            </div>
          </div>
        </Header>
        <Content style={{ 
          margin: 'var(--spacing-xl)', 
          overflow: 'initial',
          padding: 0
        }}>
          <div style={{
            padding: 'var(--spacing-xxl)',
            minHeight: 'calc(100vh - var(--header-height) - var(--spacing-xl) * 2)',
            background: 'var(--white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout