import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Modal, Form, DatePicker, Input, Select, Space, InputNumber, App as AntApp } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Task, DailyTaskRecord } from '../../types'

const { TextArea } = Input
const { Option } = Select

interface DailyProgressManagerProps {
  task: Task
  project: any
  onUpdate: (taskId: string, records: DailyTaskRecord[]) => void
  isAdmin: boolean
}

function DailyProgressManager({ task, project, onUpdate, isAdmin }: DailyProgressManagerProps) {
  const { message } = AntApp.useApp()
  const [records, setRecords] = useState<DailyTaskRecord[]>(task.dailyRecords || [])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DailyTaskRecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<DailyTaskRecord | null>(null)
  const [form] = Form.useForm()

  // 保证当任务或其每日记录从外部更新时，本地列表保持同步
  useEffect(() => {
    setRecords(task.dailyRecords || [])
  }, [task.id, task.dailyRecords])

  const getStatusColor = (status: string) => {
    const colorMap = {
      normal: 'green',
      risk: 'orange',
      delayed: 'red',
    }
    return colorMap[status as keyof typeof colorMap] || 'default'
  }

  const getStatusText = (status: string) => {
    const textMap = {
      normal: '正常',
      risk: '风险',
      delayed: '延期',
    }
    return textMap[status as keyof typeof textMap] || status
  }

  const handleAdd = () => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑每日进度')
      return
    }
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: DailyTaskRecord) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑每日进度')
      return
    }
    setEditingRecord(record)
    form.setFieldsValue({
      date: dayjs(record.date),
      progress: record.progress,
      status: record.status,
      content: record.content,
      assignees: record.assignees,
    })
    setModalVisible(true)
  }

  const handleDelete = (record: DailyTaskRecord) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑每日进度')
      return
    }
    setDeleteRecord(record)
  }

  const handleSave = () => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以编辑每日进度')
      return
    }
    form.validateFields().then((values) => {
      const newRecord: DailyTaskRecord = {
        date: values.date.format('YYYY-MM-DD'),
        progress: values.progress || 0,
        status: values.status,
        content: values.content || '',
        assignees: values.assignees || [],
      }

      let newRecords: DailyTaskRecord[]
      if (editingRecord) {
        // 编辑现有记录
        newRecords = records.map(r => 
          r.date === editingRecord.date ? newRecord : r
        )
      } else {
        // 添加新记录
        const existingIndex = records.findIndex(r => r.date === newRecord.date)
        if (existingIndex >= 0) {
          // 如果日期已存在，替换
          newRecords = [...records]
          newRecords[existingIndex] = newRecord
        } else {
          // 否则添加新记录
          newRecords = [...records, newRecord].sort((a, b) => a.date.localeCompare(b.date))
        }
      }

      setRecords(newRecords)
      onUpdate(task.id, newRecords)
      setModalVisible(false)
      form.resetFields()
      
      // 显示成功消息
      message.success(editingRecord ? '进度记录已更新' : '进度记录已添加')
    }).catch((error) => {
      console.error('表单验证失败:', error)
      message.error('请检查表单输入是否正确')
    })
  }

  const handleCancel = () => {
    setModalVisible(false)
    form.resetFields()
  }

  const handleConfirmDelete = () => {
    if (!deleteRecord) {
      return
    }
    const newRecords = records.filter(r => r.date !== deleteRecord.date)
    setRecords(newRecords)
    onUpdate(task.id, newRecords)
    setDeleteRecord(null)
    message.success('进度记录已删除')
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date: string) => dayjs(date).format('MM月DD日'),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 70,
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
    },
    {
      title: '参与人员',
      dataIndex: 'assignees',
      key: 'assignees',
      width: 120,
      render: (assignees: string[]) => assignees.join('、'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: DailyTaskRecord) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={`${task.type.name}：${task.name} - 每日进度管理`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加进度
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>暂无进度记录</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加第一条进度
            </Button>
          </div>
        ) : (
          <Table
            dataSource={records}
            columns={columns}
            rowKey="date"
            pagination={false}
            size="small"
            scroll={{ x: 600, y: 300 }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? '编辑进度' : '添加进度'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={720}
        className="compact-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'normal',
            progress: 0,
            assignees: [],
          }}
          className="compact-form"
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="进度"
            name="progress"
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="0-100"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="normal">正常</Option>
              <Option value="risk">风险</Option>
              <Option value="delayed">延期</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
          >
            <TextArea
              rows={3}
              placeholder="请输入进度内容"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="参与人员"
            name="assignees"
          >
            <Select
              mode="tags"
              placeholder="请输入参与人员"
              style={{ width: '100%' }}
            >
              {project.developers.map((dev: string) => (
                <Option key={dev} value={dev}>{dev}</Option>
              ))}
              {project.testers.map((tester: string) => (
                <Option key={tester} value={tester}>{tester}</Option>
              ))}
              {project.productManager && (
                <Option key={project.productManager} value={project.productManager}>{project.productManager}</Option>
              )}
              {project.pmo && (
                <Option key={project.pmo} value={project.pmo}>{project.pmo}</Option>
              )}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认删除"
        open={!!deleteRecord}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteRecord(null)}
        okText="删除"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除 {deleteRecord?.date} 的进度记录吗？</p>
      </Modal>
    </div>
  )
}

export default DailyProgressManager
