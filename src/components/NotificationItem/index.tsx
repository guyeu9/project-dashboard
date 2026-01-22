import React from 'react'
import { Button } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { NotificationItem as NotificationItemType } from '../../types'
import dayjs from 'dayjs'

interface NotificationItemProps {
  notification: NotificationItemType
  onConfirm: (notificationId: string) => void
  onDelete?: (notificationId: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onConfirm, onDelete }) => {
  const formattedTime = dayjs(notification.remindTime).format('YYYY-MM-DD HH:mm')
  
  const handleConfirm = () => {
    onConfirm(notification.id)
  }
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(notification.id)
  }
  
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
          {notification.taskName}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          项目：{notification.projectName}
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          提醒时间：{formattedTime}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
        <Button
          type="text"
          icon={<CheckOutlined />}
          onClick={handleConfirm}
          style={{
            color: '#52c41a',
            fontSize: '14px',
            padding: '4px 8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(82, 196, 26, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          确认
        </Button>
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          style={{
            color: '#ff4d4f',
            fontSize: '14px',
            padding: '4px 8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          删除
        </Button>
      </div>
    </div>
  )
}

export default NotificationItem