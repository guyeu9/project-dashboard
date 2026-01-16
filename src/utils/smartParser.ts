import { SmartParseResult, ScheduleItem } from '../types'

export function parseSmartProjectInfo(text: string): SmartParseResult | null {
  if (!text || text.trim().length === 0) {
    return null
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  if (lines.length === 0) {
    return null
  }

  const result: SmartParseResult = {
    projectName: '',
    projectRemark: '',
    personnel: {
      owner: undefined,
      developers: [],
      testers: []
    },
    schedules: []
  }

  let currentSection: 'project' | 'personnel' | 'schedule' | 'remark' = 'project'
  let lastScheduleName: string = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (currentSection === 'project') {
      if (i === 0) {
        result.projectName = line
      } else if (line.startsWith('归属项目：')) {
        result.projectRemark = line.replace('归属项目：', '').trim()
      } else if (line.startsWith('人员信息：')) {
        currentSection = 'personnel'
      } else if (line.startsWith('排期信息：') || line.startsWith('整体排期信息：')) {
        currentSection = 'schedule'
      }
    } else if (currentSection === 'personnel') {
      if (line.startsWith('负责人：')) {
        result.personnel.owner = line.replace('负责人：', '').trim()
      } else if (line.startsWith('开发人员：')) {
        const developers = line.replace('开发人员：', '').trim()
        result.personnel.developers = parsePersonnel(developers)
      } else if (line.startsWith('测试人员：')) {
        const testers = line.replace('测试人员：', '').trim()
        result.personnel.testers = parsePersonnel(testers)
      } else if (line.startsWith('排期信息：') || line.startsWith('整体排期信息：')) {
        currentSection = 'schedule'
      }
    } else if (currentSection === 'schedule') {
      const scheduleItem = parseScheduleItem(line, lastScheduleName)
      if (scheduleItem) {
        result.schedules.push(scheduleItem)
        lastScheduleName = ''
      } else if (isScheduleName(line)) {
        lastScheduleName = line.replace('：', '').replace(':', '').trim()
      } else if (line.startsWith('暂定') || line.startsWith('上线')) {
        currentSection = 'remark'
        result.projectRemark = line.trim()
      }
    } else if (currentSection === 'remark') {
      if (line.includes('上线')) {
        result.projectRemark = line.trim()
      }
    }
  }

  return result
}

function isScheduleName(line: string): boolean {
  const scheduleNames = [
    '开发设计',
    '开发',
    '开发自测',
    '测试设计',
    '测试',
    'UAT测试',
    '准生产测试',
    '三方联调',
    '上线',
    '技术负责人',
    '提出人',
    '抄送人',
    '生产验收人',
    '创建人',
    '原始提出人'
  ]

  for (const name of scheduleNames) {
    if (line === name || line === name + '：' || line === name + ':') {
      return true
    }
  }

  return false
}

function parseScheduleItem(line: string, lastScheduleName: string): ScheduleItem | null {
  const datePattern = /(\d{4}\.\d{2}\.\d{2})\s*-\s*(\d{4}\.\d{2}\.\d{2})\s*\((\d+\.?\d*)小时\)/
  const singleDatePattern = /(\d{4}\.\d{2}\.\d{2})/

  const match = line.match(datePattern)
  if (match && lastScheduleName) {
    return {
      name: lastScheduleName,
      startDate: match[1],
      endDate: match[2],
      duration: parseFloat(match[3])
    }
  }

  const singleMatch = line.match(singleDatePattern)
  if (singleMatch && lastScheduleName) {
    return {
      name: lastScheduleName,
      startDate: singleMatch[1],
      endDate: singleMatch[1],
      duration: 0
    }
  }

  return null
}

function parsePersonnel(text: string): string[] {
  const personnel: string[] = []
  const items = text.split(/[,，、]/).map(item => item.trim()).filter(item => item.length > 0)

  for (const item of items) {
    const cleanedItem = item.replace('@', '').trim()
    if (cleanedItem.length > 0) {
      personnel.push(cleanedItem)
    }
  }

  return personnel
}
