import dayjs from 'dayjs'
import useStore from '../store/useStore'
import useNotificationStore from '../store/notificationStore'
import { Task } from '../types'

/**
 * 检查是否需要提醒（任务开始前一天）
 * @param task 任务对象
 * @returns 是否需要触发提醒
 */
export const shouldTriggerOneDayBeforeReminder = (task: Task): boolean => {
  const currentTime = dayjs()
  const taskStartTime = dayjs(task.startDate)
  
  // 任务开始前一天
  const oneDayBefore = taskStartTime.subtract(1, 'day')
  
  // 当前日期是否等于任务开始前一天
  return currentTime.isSame(oneDayBefore, 'day')
}

/**
 * 检查是否需要提醒（任务开始当天早上9点）
 * @param task 任务对象
 * @returns 是否需要触发提醒
 */
export const shouldTriggerSameDay9AMReminder = (task: Task): boolean => {
  const currentTime = dayjs()
  const taskStartTime = dayjs(task.startDate)
  
  // 任务开始当天早上9点
  const sameDay9AM = taskStartTime.hour(9).minute(0).second(0).millisecond(0)
  
  // 当前时间是否是任务开始当天早上9点（前后5分钟内）
  const diffMinutes = currentTime.diff(sameDay9AM, 'minute')
  return Math.abs(diffMinutes) <= 5 && currentTime.isSame(taskStartTime, 'day')
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
    // 获取项目信息
    const project = projects.find(p => p.id === task.projectId)
    if (!project) return
    
    // 检查是否需要前一天提醒
    if (shouldTriggerOneDayBeforeReminder(task)) {
      const existingNotification = notificationStore.notifications.find(
        n => n.taskId === task.id && 
            n.remindTime === dayjs(task.startDate).subtract(1, 'day').format('YYYY-MM-DD') &&
            n.status === 'pending'
      )
      
      if (!existingNotification) {
        const remindTime = dayjs(task.startDate).subtract(1, 'day').format('YYYY-MM-DD')
        notificationStore.addNotification({
          taskId: task.id,
          taskName: task.name,
          projectId: task.projectId,
          projectName: project.name,
          remindTime: remindTime
        })
      }
    }
    
    // 检查是否需要当天早上9点提醒
    if (shouldTriggerSameDay9AMReminder(task)) {
      const existingNotification = notificationStore.notifications.find(
        n => n.taskId === task.id && 
            n.remindTime === dayjs(task.startDate).hour(9).minute(0).format('YYYY-MM-DD HH:mm') &&
            n.status === 'pending'
      )
      
      if (!existingNotification) {
        const remindTime = dayjs(task.startDate).hour(9).minute(0).format('YYYY-MM-DD HH:mm')
        notificationStore.addNotification({
          taskId: task.id,
          taskName: task.name,
          projectId: task.projectId,
          projectName: project.name,
          remindTime: remindTime
        })
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
  
  // 每分钟检查一次（确保不错过9点的提醒）
  return window.setInterval(() => {
    checkTasksAndTriggerReminders()
  }, 60 * 1000)
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