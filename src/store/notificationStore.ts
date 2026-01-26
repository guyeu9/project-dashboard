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

// 通知的本地存储键名
const STORAGE_KEY = 'project-notifications'

// 从 localStorage 加载通知数据（手动实现，不使用 persist 中间件以避免复杂问题）
const loadNotificationsFromStorage = (): NotificationItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // 过滤掉7天前的已确认通知，避免数据无限增长
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return data.filter((n: NotificationItem) => {
        const createdAt = new Date(n.createdAt)
        // 保留7天内所有通知，或者7天外但未确认的通知
        return createdAt > sevenDaysAgo || n.status === 'pending'
      })
    }
  } catch (error) {
    console.error('[Notification] Failed to load notifications from storage:', error)
  }
  return []
}

// 保存通知数据到 localStorage
const saveNotificationsToStorage = (notifications: NotificationItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error('[Notification] Failed to save notifications to storage:', error)
  }
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotificationsFromStorage(),
  unreadCount: loadNotificationsFromStorage().filter(n => n.status === 'pending').length,

  addNotification: (notification) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    set((state) => {
      const updatedNotifications = [...state.notifications, newNotification]
      const unreadCount = updatedNotifications.filter((n) => n.status === 'pending').length

      // 保存到 localStorage
      saveNotificationsToStorage(updatedNotifications)

      return {
        notifications: updatedNotifications,
        unreadCount,
      }
    })
  },

  confirmNotification: (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, status: 'confirmed' as NotificationStatus } : n
      )
      const unreadCount = updatedNotifications.filter((n) => n.status === 'pending').length

      // 保存到 localStorage
      saveNotificationsToStorage(updatedNotifications)

      return {
        notifications: updatedNotifications,
        unreadCount,
      }
    })
  },

  deleteNotification: (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter((n) => n.id !== notificationId)
      const unreadCount = updatedNotifications.filter((n) => n.status === 'pending').length

      // 保存到 localStorage
      saveNotificationsToStorage(updatedNotifications)

      return {
        notifications: updatedNotifications,
        unreadCount,
      }
    })
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
    // 清空 localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  getPendingNotifications: () => {
    return get().notifications.filter((n) => n.status === 'pending')
  },
}))

export default useNotificationStore
