import { useState } from 'react'
import { Card, Button, Space, Upload, message, Modal, Table, Tag } from 'antd'
import { UploadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Project } from '../../types'
import useStore from '../../store/useStore'
import dayjs from 'dayjs'
import './index.css'

const { Dragger } = Upload

function ImportExport() {
  const { projects, tasks, setProjects, setTasks } = useStore()
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState<'excel' | 'json'>('excel')
  const [exportData, setExportData] = useState<any>(null)

  const handleExportExcel = () => {
    setExportFormat('excel')
    setExportData(projects)
    setExportModalVisible(true)
  }

  const handleExportJSON = () => {
    setExportFormat('json')
    setExportData({ projects, tasks })
    setExportModalVisible(true)
  }

  const handleDownload = () => {
    if (exportFormat === 'excel') {
      message.success('Excel导出功能开发中...')
      return
    }
    
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
    
    message.success('导出成功')
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
          normal: { color: 'green', text: '正常' },
          delayed: { color: 'red', text: '延期' },
          risk: { color: 'orange', text: '风险' },
        }
        const config = statusConfig[status as keyof typeof statusConfig]
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
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
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
              <p className="ant-upload-hint">支持单个JSON文件上传</p>
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
          <h4>导出数据量：{exportData.length} 条记录</h4>
          
          {exportFormat === 'excel' && (
            <div>
              <h5>项目列表：</h5>
              <Table
                columns={projectColumns}
                dataSource={exportData as Project[]}
                rowKey="id"
                pagination={false}
                scroll={{ y: 300 }}
                size="small"
              />
            </div>
          )}
          
          {exportFormat === 'json' && (
            <div>
              <h5>完整数据（项目+任务）：</h5>
              <div className="json-preview">
                <pre>{JSON.stringify(exportData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImportExport
