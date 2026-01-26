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
  
  // 任务开始前一天（只比较日期，忽略时间）
  const oneDayBefore = taskStartTime.subtract(1, 'day').startOf('day')
  const currentDay = currentTime.startOf('day')
  
  // 当前日期是否等于任务开始前一天
  return currentDay.isSame(oneDayBefore, 'day')
}

/**
 * 检查是否需要提醒（任务开始当天早上9点）
 * @param task 任务对象
 * @returns 是否需要触发提醒
 */
export const shouldTriggerSameDay9AMReminder = (task: Task): boolean => {
  const currentTime = dayjs()
  const taskStartTime = dayjs(task.startDate).startOf('day') // 只取日期部分
  
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
  
  // 如果没有任务数据，跳过检查
  if (!tasks || tasks.length === 0) {
    console.log('[Notification] No tasks available, skipping reminder check')
    return
  }
  
  // 如果没有项目数据，跳过检查
  if (!projects || projects.length === 0) {
    console.log('[Notification] No projects available, skipping reminder check')
    return
  }
  
  const currentTime = dayjs()
  console.log(`[Notification] =========================================`)
  console.log(`[Notification] Current time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`)
  console.log(`[Notification] Current date: ${currentTime.startOf('day').format('YYYY-MM-DD')}`)
  console.log(`[Notification] Current hour: ${currentTime.hour()}, minute: ${currentTime.minute()}`)
  console.log(`[Notification] Checking ${tasks.length} tasks for reminders...`)
  console.log(`[Notification] =========================================`)
  
  let newNotificationsCreated = 0
  
  tasks.forEach((task, index) => {
    // 获取项目信息
    const project = projects.find(p => p.id === task.projectId)
    if (!project) {
      console.log(`[Notification] Task ${index + 1} (${task.name}) has no associated project, skipping`)
      return
    }
    
    const taskStartTime = dayjs(task.startDate)
    console.log(`[Notification] Task ${index + 1}: ${task.name}`)
    console.log(`[Notification]   - Start date: ${task.startDate} (parsed as: ${taskStartTime.format('YYYY-MM-DD HH:mm:ss')})`)
    console.log(`[Notification]   - Project: ${project.name}`)
    
    // 检查是否需要前一天提醒
    const oneDayBeforeResult = shouldTriggerOneDayBeforeReminder(task)
    console.log(`[Notification]   - One day before reminder: ${oneDayBeforeResult}`)
    
    if (oneDayBeforeResult) {
      const taskStartTimeDay = taskStartTime.startOf('day')
      const remindTime = taskStartTimeDay.subtract(1, 'day').format('YYYY-MM-DD')
      const oneDayBefore = taskStartTimeDay.subtract(1, 'day')
      
      console.log(`[Notification]     Current day: ${currentTime.startOf('day').format('YYYY-MM-DD')}`)
      console.log(`[Notification]     One day before: ${oneDayBefore.format('YYYY-MM-DD')}`)
      console.log(`[Notification]     Is same day: ${currentTime.startOf('day').isSame(oneDayBefore, 'day')}`)
      
      // 检查是否已存在相同的通知（无论状态如何，只检查是否已创建过）
      const existingNotification = notificationStore.notifications.find(
        n => n.taskId === task.id &&
            n.remindTime === remindTime
      )
      
      if (!existingNotification) {
        console.log(`[Notification]     ✅ Creating one-day-before reminder for task: ${task.name}`)
        notificationStore.addNotification({
          taskId: task.id,
          taskName: task.name,
          projectId: task.projectId,
          projectName: project.name,
          remindTime: remindTime
        })
        newNotificationsCreated++
      } else {
        console.log(`[Notification]     ⚠️ One-day-before reminder already exists for task: ${task.name}`)
      }
    }
    
    // 检查是否需要当天早上9点提醒
    const sameDay9AMResult = shouldTriggerSameDay9AMReminder(task)
    console.log(`[Notification]   - Same day 9AM reminder: ${sameDay9AMResult}`)
    
    if (sameDay9AMResult) {
      const taskStartTimeDay = taskStartTime.startOf('day')
      const remindTime = taskStartTimeDay.hour(9).minute(0).format('YYYY-MM-DD HH:mm')
      const sameDay9AM = taskStartTimeDay.hour(9).minute(0).second(0).millisecond(0)
      
      const diffMinutes = currentTime.diff(sameDay9AM, 'minute')
      console.log(`[Notification]     Same day 9AM: ${sameDay9AM.format('YYYY-MM-DD HH:mm:ss')}`)
      console.log(`[Notification]     Current time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`)
      console.log(`[Notification]     Diff minutes: ${diffMinutes}`)
      console.log(`[Notification]     Within 5 minutes: ${Math.abs(diffMinutes) <= 5}`)
      console.log(`[Notification]     Is same day: ${currentTime.isSame(taskStartTimeDay, 'day')}`)
      
      // 检查是否已存在相同的通知（无论状态如何，只检查是否已创建过）
      const existingNotification = notificationStore.notifications.find(
        n => n.taskId === task.id &&
            n.remindTime === remindTime
      )
      
      if (!existingNotification) {
        console.log(`[Notification]     ✅ Creating same-day-9am reminder for task: ${task.name}`)
        notificationStore.addNotification({
          taskId: task.id,
          taskName: task.name,
          projectId: task.projectId,
          projectName: project.name,
          remindTime: remindTime
        })
        newNotificationsCreated++
      } else {
        console.log(`[Notification]     ⚠️ Same-day-9am reminder already exists for task: ${task.name}`)
      }
    }
  })
  
  console.log(`[Notification] =========================================`)
  console.log(`[Notification] Reminder check completed. ${newNotificationsCreated} new notifications created. Total notifications: ${notificationStore.notifications.length}, Unread: ${notificationStore.unreadCount}`)
  console.log(`[Notification] =========================================`)
}

/**
 * 启动提醒检查定时器
 * @returns 定时器ID，用于清理
 */
export const startReminderTimer = (): number => {
  console.log('[Notification] Starting reminder timer...')
  
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