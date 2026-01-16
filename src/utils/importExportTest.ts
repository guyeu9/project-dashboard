import { Project, Task, TaskType, PMO, ProductManager } from '../types'

interface FieldInfo {
  name: keyof Project | keyof Task | keyof TaskType | keyof PMO | keyof ProductManager
  type: string
  required: boolean
  description: string
}

const projectFields: FieldInfo[] = [
  { name: 'id', type: 'string', required: true, description: '项目唯一标识' },
  { name: 'name', type: 'string', required: true, description: '项目名称' },
  { name: 'status', type: "'normal' | 'delayed' | 'risk' | 'completed' | 'pending'", required: true, description: '项目状态' },
  { name: 'progress', type: 'number', required: true, description: '进度百分比' },
  { name: 'startDate', type: 'string', required: true, description: '开始日期' },
  { name: 'endDate', type: 'string', required: true, description: '结束日期' },
  { name: 'partners', type: 'string[]', required: true, description: '合作方列表' },
  { name: 'developers', type: 'string[]', required: true, description: '开发人员列表' },
  { name: 'testers', type: 'string[]', required: true, description: '测试人员列表' },
  { name: 'owner', type: 'string', required: true, description: '负责人' },
  { name: 'remark', type: 'string', required: false, description: '备注' },
  { name: 'chatGroupLinks', type: 'string[]', required: false, description: '群组链接' },
  { name: 'contacts', type: 'Contact[]', required: false, description: '联系人信息' },
  { name: 'productManager', type: 'string', required: false, description: '产品经理' },
  { name: 'pmo', type: 'string', required: false, description: 'PMO' },
  { name: 'dailyProgress', type: 'DailyProgress[]', required: false, description: '每日进度记录' }
]

const taskFields: FieldInfo[] = [
  { name: 'id', type: 'string', required: true, description: '任务唯一标识' },
  { name: 'projectId', type: 'string', required: true, description: '所属项目ID' },
  { name: 'name', type: 'string', required: true, description: '任务名称' },
  { name: 'type', type: 'TaskType', required: true, description: '任务类型' },
  { name: 'status', type: 'string', required: true, description: '任务状态' },
  { name: 'progress', type: 'number', required: true, description: '进度百分比' },
  { name: 'startDate', type: 'string', required: true, description: '开始日期' },
  { name: 'endDate', type: 'string', required: true, description: '结束日期' },
  { name: 'assignees', type: 'string[]', required: true, description: '参与人员' },
  { name: 'dailyProgress', type: 'string', required: false, description: '每日进度描述' },
  { name: 'remark', type: 'string', required: false, description: '备注' },
  { name: 'dailyRecords', type: 'DailyTaskRecord[]', required: false, description: '每日任务记录' }
]

const taskTypeFields: FieldInfo[] = [
  { name: 'id', type: 'string', required: true, description: '类型ID' },
  { name: 'name', type: 'string', required: true, description: '类型名称' },
  { name: 'color', type: 'string', required: true, description: '类型颜色' },
  { name: 'enabled', type: 'boolean', required: true, description: '是否启用' }
]

export function analyzeFieldCoverage() {
  const report: string[] = []
  report.push('='.repeat(80))
  report.push('字段覆盖率分析报告')
  report.push('='.repeat(80))
  report.push('')

  report.push('一、Project 字段分析')
  report.push('-'.repeat(80))
  
  const exportedProjectFields = ['id', 'name', 'status', 'progress', 'startDate', 'endDate', 'owner', 'productManager', 'pmo', 'remark']
  const missingProjectFields = projectFields.filter(f => !exportedProjectFields.includes(f.name as string))
  
  report.push(`已导出字段 (${exportedProjectFields.length}个)：`)
  exportedProjectFields.forEach(field => {
    const fieldInfo = projectFields.find(f => f.name === field)
    report.push(`  ✓ ${field} (${fieldInfo?.type || 'unknown'})`)
  })
  
  report.push('')
  report.push(`缺失字段 (${missingProjectFields.length}个)：`)
  missingProjectFields.forEach(field => {
    report.push(`  ✗ ${field.name} - ${field.description} (${field.type})`)
  })
  
  report.push('')
  report.push('二、Task 字段分析')
  report.push('-'.repeat(80))
  
  const exportedTaskFields = ['name', 'type.name', 'progress', 'startDate', 'endDate', 'assignees', 'remark']
  const missingTaskFields = taskFields.filter(f => {
    const fieldPath = f.name === 'type' ? 'type' : f.name
    return !exportedTaskFields.some(ef => ef === fieldPath || ef === `${fieldPath}.name`)
  })
  
  report.push(`已导出字段 (${exportedTaskFields.length}个)：`)
  exportedTaskFields.forEach(field => {
    report.push(`  ✓ ${field}`)
  })
  
  report.push('')
  report.push(`缺失字段 (${missingTaskFields.length}个)：`)
  missingTaskFields.forEach(field => {
    report.push(`  ✗ ${field.name} - ${field.description} (${field.type})`)
  })
  
  report.push('')
  report.push('三、TaskType 字段分析（Excel导出）')
  report.push('-'.repeat(80))
  
  report.push('当前仅导出 type.name，缺失以下字段：')
  taskTypeFields.forEach(field => {
    if (field.name !== 'name') {
      report.push(`  ✗ ${field.name} - ${field.description} (${field.type})`)
    }
  })
  
  report.push('')
  report.push('四、结论')
  report.push('-'.repeat(80))
  report.push(`Excel导出存在${missingProjectFields.length + missingTaskFields.length + 2}个字段缺失`)
  report.push('建议修复方案：')
  report.push('  1. 在项目汇总页签添加：partners, developers, testers, chatGroupLinks, contacts')
  report.push('  2. 在项目详细页签添加：dailyProgress 汇总信息')
  report.push('  3. 在任务明细中添加：dailyRecords 汇总信息')
  report.push('  4. 完整导出 TaskType 对象的所有字段')
  
  return report.join('\n')
}

export function generateTestCases() {
  const testCases = [
    {
      id: 'TC001',
      name: 'JSON导出包含所有Project字段',
      description: '验证JSON导出是否包含types定义的所有Project字段',
      steps: ['导出JSON', '解析JSON', '对比字段列表'],
      expected: '所有Project字段都应出现在导出数据中',
      priority: '高'
    },
    {
      id: 'TC002',
      name: 'JSON导出包含所有Task字段',
      description: '验证JSON导出是否包含types定义的所有Task字段',
      steps: ['导出JSON', '解析JSON', '对比字段列表'],
      expected: '所有Task字段都应出现在导出数据中',
      priority: '高'
    },
    {
      id: 'TC003',
      name: 'JSON导出导入数据一致性',
      description: '验证导出后重新导入，数据是否完整恢复',
      steps: ['创建测试数据', '导出JSON', '清空数据', '导入JSON', '对比数据'],
      expected: '导入后的数据与原始数据完全一致',
      priority: '高'
    },
    {
      id: 'TC004',
      name: '特殊字符处理',
      description: '验证包含特殊字符（中文、英文、符号、换行）的数据能正确导出导入',
      steps: ['创建含特殊字符的数据', '导出', '导入', '验证'],
      expected: '特殊字符无损传输',
      priority: '中'
    },
    {
      id: 'TC005',
      name: '空值和undefined处理',
      description: '验证空数组、undefined、null值能正确处理',
      steps: ['创建含空值的数据', '导出', '导入', '验证'],
      expected: '空值正确保留',
      priority: '中'
    },
    {
      id: 'TC006',
      name: '大量数据导出性能',
      description: '验证大量数据（100+项目，1000+任务）的导出性能',
      steps: ['创建大量数据', '测量导出时间'],
      expected: '导出时间在合理范围内（< 30秒）',
      priority: '低'
    },
    {
      id: 'TC007',
      name: '嵌套对象导出',
      description: '验证嵌套对象（contacts、dailyProgress、dailyRecords）能正确导出导入',
      steps: ['创建含嵌套对象的数据', '导出', '导入', '验证'],
      expected: '嵌套对象结构完整保留',
      priority: '高'
    },
    {
      id: 'TC008',
      name: '数组类型字段',
      description: '验证数组类型字段（partners、developers、testers）能正确导出导入',
      steps: ['创建含数组的测试数据', '导出', '导入', '验证数组内容'],
      expected: '数组元素完整保留',
      priority: '高'
    }
  ]
  
  return testCases
}

export function generateFixRecommendations() {
  const recommendations = [
    {
      priority: '高',
      issue: 'Excel导出缺失Project的partners、developers、testers字段',
      solution: `在项目汇总页签中添加以下列：
        '合作方': p.partners?.join('、') || '-',
        '开发人员': p.developers?.join('、') || '-',
        '测试人员': p.testers?.join('、') || '-'
      `
    },
    {
      priority: '高',
      issue: 'Excel导出缺失Project的chatGroupLinks和contacts字段',
      solution: `在项目详细页签的项目基本信息中添加：
        '群组链接': project.chatGroupLinks?.join('; ') || '-',
        '联系人': project.contacts?.map(c => \`\${c.name}(\${c.role})\`).join('; ') || '-'
      `
    },
    {
      priority: '高',
      issue: 'Excel导出缺失Task的dailyRecords字段',
      solution: `在任务明细中添加每日记录汇总信息，或在页签末尾添加独立的每日记录详情表
      `
    },
    {
      priority: '中',
      issue: 'TaskType只导出name字段',
      solution: `在导出任务明细时，同时导出type的完整信息：
        '类型ID': t.type.id,
        '类型颜色': t.type.color,
        '是否启用': t.type.enabled ? '是' : '否'
      `
    },
    {
      priority: '低',
      issue: 'Excel导出缺失Project的dailyProgress字段',
      solution: `在项目详细页签中添加每日进度汇总表，或作为备注的补充信息
      `
    }
  ]
  
  return recommendations
}

export function generateFullReport() {
  const report = []
  
  report.push(analyzeFieldCoverage())
  report.push('')
  report.push('='.repeat(80))
  report.push('测试用例清单')
  report.push('='.repeat(80))
  report.push('')
  
  const testCases = generateTestCases()
  testCases.forEach(tc => {
    report.push(`【${tc.id}】${tc.name} [优先级: ${tc.priority}]`)
    report.push(`描述: ${tc.description}`)
    report.push(`步骤: ${tc.steps.join(' → ')}`)
    report.push(`预期: ${tc.expected}`)
    report.push('')
  })
  
  report.push('')
  report.push('='.repeat(80))
  report.push('修复建议')
  report.push('='.repeat(80))
  report.push('')
  
  const recommendations = generateFixRecommendations()
  recommendations.forEach(rec => {
    report.push(`【优先级: ${rec.priority}】${rec.issue}`)
    report.push(`解决方案:`)
    report.push(rec.solution)
    report.push('')
  })
  
  return report.join('\n')
}

export function exportFieldAnalysis() {
  console.log(generateFullReport())
  return generateFullReport()
}
