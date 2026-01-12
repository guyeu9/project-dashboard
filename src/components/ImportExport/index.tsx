import { useState } from 'react'
import { Card, Button, Space, Upload, Modal, Table, Tag, App as AntApp } from 'antd'
import { UploadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import useStore from '../../store/useStore'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import './index.css'

const { Dragger } = Upload

function ImportExport() {
  const { projects, tasks, setProjects, setTasks } = useStore()
  const { message } = AntApp.useApp()
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState<'excel' | 'json'>('excel')
  const [exportData, setExportData] = useState<any>(null)

  const handleExportExcel = () => {
    setExportFormat('excel')
    setExportData({ projects, tasks })
    setExportModalVisible(true)
  }

  const handleExportJSON = () => {
    setExportFormat('json')
    setExportData({ projects, tasks })
    setExportModalVisible(true)
  }

  const handleDownload = () => {
    if (exportFormat === 'excel') {
      try {
        const workbook = XLSX.utils.book_new()

        // 1. 项目汇总页签
        const projectSummaryData = projects.map(p => ({
          '项目ID': p.id,
          '项目名称': p.name,
          '状态': p.status === 'normal' ? '正常' : p.status === 'risk' ? '风险' : p.status === 'delayed' ? '延期' : p.status,
          '进度': `${p.progress}%`,
          '开始日期': p.startDate,
          '结束日期': p.endDate,
          '负责人': p.owner,
          '产品经理': p.productManager || '-',
          'PMO': p.pmo || '-',
          '备注': p.remark || ''
        }))
        const summarySheet = XLSX.utils.json_to_sheet(projectSummaryData)
        XLSX.utils.book_append_sheet(workbook, summarySheet, '项目汇总')

        // 2. 为每个项目创建独立页签
        projects.forEach(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id)
          
          // 构建该项目的任务和进度数据
          const sheetData: any[] = []
          
          // 项目基本信息行
          sheetData.push({
            '类别': '项目基本信息',
            '名称': project.name,
            '进度': `${project.progress}%`,
            '开始': project.startDate,
            '结束': project.endDate,
            '负责人': project.owner,
            '内容/备注': project.remark || '-'
          })
          
          sheetData.push({}) // 空行

          // 任务明细
          sheetData.push({ '类别': '任务明细' })
          projectTasks.forEach(t => {
            sheetData.push({
              '类别': '任务',
              '名称': t.name,
              '类型': t.type.name,
              '进度': `${t.progress}%`,
              '开始': t.startDate,
              '结束': t.endDate,
              '参与人员': t.assignees.join('、'),
              '内容/备注': t.remark || '-'
            })
          })

          sheetData.push({}) // 空行

          // 每日进度
          sheetData.push({ '类别': '每日进度明细' })
          
          const dailyRecords: any[] = []
          // 收集任务的每日记录
          projectTasks.forEach(t => {
            if (t.dailyRecords) {
              t.dailyRecords.forEach(record => {
                dailyRecords.push({
                  '日期': record.date,
                  '来源': `任务: ${t.name}`,
                  '人员': record.assignees.join('、'),
                  '进度': `${record.progress}%`,
                  '状态': record.status === 'normal' ? '正常' : record.status === 'risk' ? '风险' : '延期',
                  '详细内容': record.content
                })
              })
            }
          })
          
          // 收集项目的每日记录
          if (project.dailyProgress) {
            project.dailyProgress.forEach(record => {
              dailyRecords.push({
                '日期': record.date,
                '来源': '项目整体',
                '人员': record.assignees.join('、'),
                '进度': `${record.progress}%`,
                '状态': record.status === 'normal' ? '正常' : record.status === 'risk' ? '风险' : '延期',
                '详细内容': record.content
              })
            })
          }

          // 按日期倒序排列
          dailyRecords.sort((a, b) => dayjs(b['日期']).diff(dayjs(a['日期'])))
          
          dailyRecords.forEach(r => {
            sheetData.push({
              '类别': '每日记录',
              '日期': r['日期'],
              '来源': r['来源'],
              '人员': r['人员'],
              '进度': r['进度'],
              '状态': r['状态'],
              '详细内容': r['详细内容']
            })
          })

          const projectSheet = XLSX.utils.json_to_sheet(sheetData)
          
          // 设置列宽
          const wscols = [
            { wch: 15 }, // 类别
            { wch: 25 }, // 名称/日期
            { wch: 15 }, // 类型/来源
            { wch: 10 }, // 进度
            { wch: 15 }, // 开始/状态
            { wch: 15 }, // 结束/人员
            { wch: 50 }, // 备注/详细内容
          ]
          projectSheet['!cols'] = wscols

          // Sheet 名称限制 31 个字符，且不能包含特殊字符
          const safeSheetName = project.name.substring(0, 30).replace(/[\\/?*[\]]/g, '_')
          XLSX.utils.book_append_sheet(workbook, projectSheet, safeSheetName)
        })

        XLSX.writeFile(workbook, `项目排期详细报表-${dayjs().format('YYYY-MM-DD')}.xlsx`)
        message.success('Excel导出成功')
      } catch (error) {
        console.error('Excel导出失败:', error)
        message.error('Excel导出失败，请重试')
      }
    } else {
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `project-data-${dayjs().format('YYYY-MM-DD')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success('JSON导出成功')
    }
    
    setExportModalVisible(false)
  }

  const handleImportJSON: UploadProps['onChange'] = (info) => {
    const { file } = info
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects)
          message.success(`成功导入 ${data.projects.length} 个项目`)
        }
        
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks)
          message.success(`成功导入 ${data.tasks.length} 个任务`)
        }
      } catch (error) {
        message.error('文件格式错误，请上传有效的JSON文件')
      }
    }
    reader.readAsText(file.originFileObj as Blob)
  }

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          normal: { color: 'var(--success-color)', text: '正常' },
          delayed: { color: 'var(--error-color)', text: '延期' },
          risk: { color: 'var(--warning-color)', text: '风险' },
          completed: { color: '#595959', text: '已完成' },
          pending: { color: 'var(--pending-color)', text: '待开始' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'var(--success-color)', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
    },
  ]

  return (
    <div className="import-export">
      <Card title="数据导入导出" className="export-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="export-section">
            <h3>导出数据</h3>
            <Space wrap>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                size="large"
              >
                导出为Excel
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={handleExportJSON}
                size="large"
              >
                导出为JSON
              </Button>
            </Space>
          </div>

          <div className="import-section">
            <h3>导入数据</h3>
            <Dragger
              name="file"
              multiple={false}
              accept=".json"
              beforeUpload={() => false}
              onChange={handleImportJSON}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽JSON文件到此区域上传</p>
              <p className="ant-upload-hint">支持从导出的JSON文件恢复数据</p>
            </Dragger>
          </div>
        </Space>
      </Card>

      <Modal
        title="导出预览"
        open={exportModalVisible}
        onOk={handleDownload}
        onCancel={() => setExportModalVisible(false)}
        width={800}
        okText="下载"
        cancelText="取消"
      >
        <div className="export-preview">
          <h4>导出格式：{exportFormat === 'excel' ? 'Excel (.xlsx)' : 'JSON (.json)'}</h4>
          <h4>包含数据：{projects.length} 个项目，{tasks.length} 个任务</h4>
          
          {exportFormat === 'excel' && (
            <div>
              <h5>预览项目列表：</h5>
              <Table
                columns={projectColumns}
                dataSource={projects}
                rowKey="id"
                pagination={false}
                scroll={{ y: 300 }}
                size="small"
              />
            </div>
          )}
          
          {exportFormat === 'json' && (
            <div>
              <h5>预览JSON数据：</h5>
              <div className="json-preview">
                <pre>{JSON.stringify({ 
                  projects: projects.slice(0, 2), 
                  tasks: tasks.slice(0, 2),
                  _total: { projects: projects.length, tasks: tasks.length },
                  _info: "预览仅展示前2条数据"
                }, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImportExport
