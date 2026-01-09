import dayjs from 'dayjs'
import useStore from '../store/useStore'
import useNotificationStore from '../store/notificationStore'
import { Task } from '../types'

/**
 * 检查当前时间是否到达任务开始时间
 * @param task 任务对象
 * @returns 是否需要触发提醒
 */
export const shouldTriggerReminder = (task: Task): boolean => {
  const currentTime = dayjs()
  const taskStartTime = dayjs(task.startDate)
  
  // 检查当前时间是否在任务开始时间前后5分钟内
  const diffMinutes = currentTime.diff(taskStartTime, 'minute')
  return Math.abs(diffMinutes) <= 5
}

/**
 * 检查任务并触发提醒
 * @param tasks 任务列表
 */
export const checkTasksAndTriggerReminders = () => {
  const tasks = useStore.getState().tasks
  const notificationStore = useNotificationStore.getState()
  const projects = useStore.getState().projects
  
  tasks.forEach(task => {
    if (shouldTriggerReminder(task)) {
      // 获取项目信息
      const project = projects.find(p => p.id === task.projectId)
      if (project) {
        // 检查是否已经发送过提醒
        const existingNotification = notificationStore.notifications.find(
          n => n.taskId === task.id && n.status === 'pending'
        )
        
        // 如果没有发送过提醒，则发送
        if (!existingNotification) {
          notificationStore.addNotification({
            taskId: task.id,
            taskName: task.name,
            projectId: task.projectId,
            projectName: project.name,
            remindTime: task.startDate
          })
        }
      }
    }
  })
}

/**
 * 启动提醒检查定时器
 * @returns 定时器ID，用于清理
 */
export const startReminderTimer = (): number => {
  // 立即检查一次
  checkTasksAndTriggerReminders()
  
  // 每5分钟检查一次
  return window.setInterval(() => {
    checkTasksAndTriggerReminders()
  }, 5 * 60 * 1000)
}

/**
 * 清理提醒检查定时器
 * @param timerId 定时器ID
 */
export const cleanupReminderTimer = (timerId: number | null): void => {
  if (timerId) {
    window.clearInterval(timerId)
  }
}