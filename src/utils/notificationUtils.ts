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
  const oneDayBefore = taskStartTime.subtract(1, 'day').startOf('day')
  const currentDay = currentTime.startOf('day')
  const taskDay = taskStartTime.startOf('day')
  
  // 如果当前日期在任务开始前一天或任务开始当天之间，则提醒
  // 即：oneDayBefore <= currentDay <= taskDay
  return currentDay.isSame(oneDayBefore, 'day') || currentDay.isSame(taskDay, 'day')
}

/**
 * 检查是否需要提醒（任务开始当天）
 * @param task 任务对象
 * @returns 是否需要触发提醒
 */
export const shouldTriggerSameDay9AMReminder = (task: Task): boolean => {
  const currentTime = dayjs()
  const taskStartTime = dayjs(task.startDate).startOf('day')
  
  // 只要当天是任务开始日期，就提醒（不限制具体时间）
  return currentTime.isSame(taskStartTime, 'day')
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

  // 过滤掉已完成和暂停的项目
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'paused')
  const activeProjectIds = new Set(activeProjects.map(p => p.id))

  // 只检查属于活跃项目的任务
  const activeTasks = tasks.filter(task => activeProjectIds.has(task.projectId))

  console.log(`[Notification] =========================================`)
  console.log(`[Notification] Total projects: ${projects.length}, Active projects: ${activeProjects.length}`)
  console.log(`[Notification] Total tasks: ${tasks.length}, Active tasks: ${activeTasks.length}`)
  console.log(`[Notification] Filtered out tasks from completed/paused projects`)

  const currentTime = dayjs()
  console.log(`[Notification] Current time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`)
  console.log(`[Notification] Current date: ${currentTime.startOf('day').format('YYYY-MM-DD')}`)
  console.log(`[Notification] Current hour: ${currentTime.hour()}, minute: ${currentTime.minute()}`)
  console.log(`[Notification] Checking ${activeTasks.length} active tasks for reminders...`)
  console.log(`[Notification] =========================================`)

  let newNotificationsCreated = 0

  activeTasks.forEach((task, index) => {
    // 获取项目信息
    const project = activeProjects.find(p => p.id === task.projectId)
    if (!project) {
      console.log(`[Notification] Task ${index + 1} (${task.name}) has no associated active project, skipping`)
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
    
    // 检查是否需要当天提醒
    const sameDay9AMResult = shouldTriggerSameDay9AMReminder(task)
    console.log(`[Notification]   - Same day reminder: ${sameDay9AMResult}`)
    
    if (sameDay9AMResult) {
      const taskStartTimeDay = taskStartTime.startOf('day')
      const remindTime = taskStartTimeDay.hour(9).minute(0).format('YYYY-MM-DD HH:mm')
      
      console.log(`[Notification]     Current time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`)
      console.log(`[Notification]     Task day: ${taskStartTimeDay.format('YYYY-MM-DD')}`)
      console.log(`[Notification]     Is same day: ${currentTime.isSame(taskStartTimeDay, 'day')}`)
      
      // 检查是否已存在相同的通知（无论状态如何，只检查是否已创建过）
      const existingNotification = notificationStore.notifications.find(
        n => n.taskId === task.id &&
            n.remindTime === remindTime
      )
      
      if (!existingNotification) {
        console.log(`[Notification]     ✅ Creating same-day reminder for task: ${task.name}`)
        notificationStore.addNotification({
          taskId: task.id,
          taskName: task.name,
          projectId: task.projectId,
          projectName: project.name,
          remindTime: remindTime
        })
        newNotificationsCreated++
      } else {
        console.log(`[Notification]     ⚠️ Same-day reminder already exists for task: ${task.name}`)
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