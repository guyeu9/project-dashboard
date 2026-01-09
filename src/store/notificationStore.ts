import { create } from 'zustand'
import { NotificationItem, NotificationStatus } from '../types'

interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'status'>) => void
  confirmNotification: (notificationId: string) => void
  deleteNotification: (notificationId: string) => void
  clearAllNotifications: () => void
  getPendingNotifications: () => NotificationItem[]
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  
  unreadCount: 0,
  
  addNotification: (notification) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    
    set((state) => {
      const updatedNotifications = [...state.notifications, newNotification]
      const unreadCount = updatedNotifications.filter(n => n.status === 'pending').length
      return {
        notifications: updatedNotifications,
        unreadCount
      }
    })
  },
  
  confirmNotification: (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n => 
        n.id === notificationId ? { ...n, status: 'confirmed' as NotificationStatus } : n
      )
      const unreadCount = updatedNotifications.filter(n => n.status === 'pending').length
      return {
        notifications: updatedNotifications,
        unreadCount
      }
    })
  },
  
  deleteNotification: (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(n => n.id !== notificationId)
      const unreadCount = updatedNotifications.filter(n => n.status === 'pending').length
      return {
        notifications: updatedNotifications,
        unreadCount
      }
    })
  },
  
  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
  
  getPendingNotifications: () => {
    return get().notifications.filter(n => n.status === 'pending')
  }
}))

export default useNotificationStore