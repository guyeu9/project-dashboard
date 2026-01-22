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
    '开发排期',
    '开发联调',
    '开发设计',
    '开发',
    '开发自测',
    '测试排期',
    '测试联调',
    '测试设计',
    '测试',
    '产品UAT',
    'UAT测试',
    '准生产测试',
    '三方联调',
    '上线',
    '上线时间',
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
  // 支持多种日期格式：
  // 1. YYYY.MM.DD-YYYY.MM.DD (2024.12.25-2025.01.01)
  // 2. MM.DD-MM.DD (12.25-1.1)
  // 3. MM.DD (单日期)

  // 完整日期格式：YYYY.MM.DD-YYYY.MM.DD
  const fullDatePattern = /(\d{4}\.\d{1,2}\.\d{1,2})\s*[-—～~到至]\s*(\d{4}\.\d{1,2}\.\d{1,2})/
  const fullMatch = line.match(fullDatePattern)
  if (fullMatch && lastScheduleName) {
    return {
      name: lastScheduleName,
      startDate: fullMatch[1],
      endDate: fullMatch[2],
      duration: 0
    }
  }

  // 简化日期格式：MM.DD-MM.DD
  const shortDatePattern = /(\d{1,2}\.\d{1,2})\s*[-—～~到至]\s*(\d{1,2}\.\d{1,2})/
  const shortMatch = line.match(shortDatePattern)
  if (shortMatch && lastScheduleName) {
    // 转换为完整日期格式，自动补充年份
    const currentYear = new Date().getFullYear()
    let startMonth = parseInt(shortMatch[1].split('.')[0])
    let endMonth = parseInt(shortMatch[2].split('.')[0])

    // 判断是否跨年：如果结束月份小于开始月份（且差距较大），则跨年
    const startYear = currentYear
    let endYear = currentYear
    if (endMonth < startMonth && (startMonth - endMonth) > 6) {
      endYear = currentYear + 1
    }

    const startStr = `${startYear}.${shortMatch[1].padStart(5, '0').replace(/\./g, '.')}`
    const endStr = `${endYear}.${shortMatch[2].padStart(5, '0').replace(/\./g, '.')}`

    return {
      name: lastScheduleName,
      startDate: `${startYear}.${shortMatch[1]}`,
      endDate: `${endYear}.${shortMatch[2]}`,
      duration: 0
    }
  }

  // 单日期格式：MM.DD 或 YYYY.MM.DD
  const singleDatePattern = /(\d{4}\.\d{1,2}\.\d{1,2})|(\d{1,2}\.\d{1,2})/
  const singleMatch = line.match(singleDatePattern)
  if (singleMatch && lastScheduleName) {
    const dateStr = singleMatch[0]
    // 如果是简化格式，补充年份
    if (!dateStr.match(/^\d{4}\./)) {
      const currentYear = new Date().getFullYear()
      return {
        name: lastScheduleName,
        startDate: `${currentYear}.${dateStr}`,
        endDate: `${currentYear}.${dateStr}`,
        duration: 0
      }
    }
    return {
      name: lastScheduleName,
      startDate: dateStr,
      endDate: dateStr,
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
