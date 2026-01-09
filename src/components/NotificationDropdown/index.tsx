import React from 'react'
import { Dropdown, Empty } from 'antd'
import NotificationItem from '../NotificationItem'
import { BellOutlined } from '@ant-design/icons'
import { NotificationItem as NotificationItemType } from '../../types'

interface NotificationDropdownProps {
  notifications: NotificationItemType[]
  unreadCount: number
  onConfirm: (notificationId: string) => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, unreadCount, onConfirm }) => {
  // 获取待处理的提醒
  const pendingNotifications = notifications.filter(n => n.status === 'pending')
  
  // 渲染下拉菜单内容
  const renderDropdownContent = () => {
    return (
      <div 
        style={{
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #f0f0f0',
          animation: 'fadeIn 0.3s ease'
        }}
      >
        <div style={{
          padding: '12px 16px',
          fontWeight: '500',
          color: '#333',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          待处理提醒 ({pendingNotifications.length})
        </div>
        
        {pendingNotifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Empty description="暂无待处理提醒" />
          </div>
        ) : (
          pendingNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>
    )
  }
  
  return (
    <Dropdown
      overlay={renderDropdownContent}
      trigger={['click']}
      placement="bottomRight"
      arrow
      autoAdjustOverflow
      dropdownRender={(menu) => (
        <div>
          {menu}
          <style>
            {`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
        </div>
      )}
    >
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#666',
          padding: '8px',
          borderRadius: '50%',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <BellOutlined />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '1px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Dropdown>
  )
}

export default NotificationDropdown