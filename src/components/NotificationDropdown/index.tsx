import React from 'react'
import { Dropdown, Empty } from 'antd'
import NotificationItem from '../NotificationItem'
import { BellOutlined } from '@ant-design/icons'
import { NotificationItem as NotificationItemType } from '../../types'

interface NotificationDropdownProps {
  notifications: NotificationItemType[]
  unreadCount: number
  onConfirm: (notificationId: string) => void
  onDelete?: (notificationId: string) => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, unreadCount, onConfirm, onDelete }) => {
  // 获取所有通知，按创建时间倒序排列
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  // 待处理通知
  const pendingNotifications = sortedNotifications.filter(n => n.status === 'pending')
  // 已确认通知
  const confirmedNotifications = sortedNotifications.filter(n => n.status === 'confirmed')
  
  // 渲染下拉菜单内容
  const renderDropdownContent = () => {
    return (
      <div 
        style={{
          width: '380px',
          maxHeight: '500px',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          border: '1px solid #f0f0f0',
          animation: 'fadeIn 0.3s ease'
        }}
      >
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
          
            .notification-list::-webkit-scrollbar {
              width: 6px;
            }
            
            .notification-list::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
            }
            
            .notification-list::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;
            }
            
            .notification-list::-webkit-scrollbar-thumb:hover {
              background: #a1a1a1;
            }
          `}
        </style>
        
        {/* 待处理提醒 */}
        <div style={{
          padding: '12px 16px',
          fontWeight: '600',
          color: '#333',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          待处理提醒 ({pendingNotifications.length})
        </div>
        
        {pendingNotifications.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#999' }}>
            暂无待处理提醒
          </div>
        ) : (
          <div>
            {pendingNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onConfirm={onConfirm}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {/* 已确认提醒 */}
        {confirmedNotifications.length > 0 && (
          <>
            <div style={{
              padding: '12px 16px',
              fontWeight: '500',
              color: '#666',
              borderBottom: '1px solid #f0f0f0',
              background: '#f5f5f5',
              marginTop: '8px'
            }}>
              已确认 ({confirmedNotifications.length})
            </div>
            <div>
              {confirmedNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onConfirm={onConfirm}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </>
        )}
        
        {/* 无任何通知 */}
        {notifications.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty 
              description="暂无提醒" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    )
  }
  
  return (
    <Dropdown
      menu={{ items: [] }}
      trigger={['click']}
      placement="bottomRight"
      arrow
      autoAdjustOverflow
      popupRender={() => renderDropdownContent()}
    >
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#666',
          padding: '8px',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          marginRight: '12px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <BellOutlined />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '0 5px',
              borderRadius: '10px',
              minWidth: '18px',
              height: '18px',
              lineHeight: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(255, 77, 79, 0.3)',
              animation: 'badgePulse 2s infinite'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <style>
          {`
            @keyframes badgePulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.1);
              }
            }
          `}
        </style>
      </div>
    </Dropdown>
  )
}

export default NotificationDropdown