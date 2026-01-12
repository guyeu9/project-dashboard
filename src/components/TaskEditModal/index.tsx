import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col, Typography, Divider } from 'antd'
import { Task, TaskType, Project } from '../../types'
import dayjs from 'dayjs'
import DailyProgressManager from '../DailyProgressManager'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

// 模拟人员数据
const MOCK_DEVELOPERS = ['张三', '李四', '王靖博', '邓晓旭', '陈七', '周八', '孙十一', '李十三']
const MOCK_TESTERS = ['王五', '赵六', '史宁博', '吴九', '郑十', '钱十二', '王十四']

interface TaskEditModalProps {
  visible: boolean
  task: Task | null
  taskTypes: TaskType[]
  project?: Project | null
  projectId?: string
  isAdmin?: boolean
  onSave: (taskId: string, updates: Partial<Task>) => void
  onAdd: (task: Task) => void
  onCancel: () => void
}

function TaskEditModal({ visible, task, taskTypes, project, projectId, isAdmin = true, onSave, onAdd, onCancel }: TaskEditModalProps) {
  const [form] = Form.useForm()
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string>(task?.type.id || taskTypes[0]?.id || '')

  useEffect(() => {
    setIsEditMode(!!task)
    if (task) {
      const taskTypeId = task.type.id
      setSelectedTypeId(taskTypeId)
      form.setFieldsValue({
        name: task.name,
        type: taskTypeId,
        status: task.status,
        progress: task.progress,
        startDate: dayjs(task.startDate),
        endDate: dayjs(task.endDate),
        assignees: task.assignees,
        remark: task.remark || '',
      })
    } else {
      const defaultTypeId = taskTypes[0]?.id || ''
      setSelectedTypeId(defaultTypeId)
      form.setFieldsValue({
        type: defaultTypeId
      })
      form.resetFields()
    }
  }, [task, form, taskTypes])

  // 监听表单中type字段的变化，更新selectedTypeId
  const handleTypeChange = (value: string) => {
    setSelectedTypeId(value)
  }

  const handleOk = () => {
    if (!isAdmin) {
      return
    }
    form.validateFields().then((values) => {
      const selectedTaskType = taskTypes.find(type => type.id === values.type)
      if (!selectedTaskType) {
        throw new Error('Invalid task type')
      }

      const updates = {
        name: values.name || selectedTaskType.name,
        type: selectedTaskType,
        status: values.status || 'normal',
        progress: values.progress || 0,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        assignees: values.assignees || [],
        remark: values.remark || '',
      }

      if (isEditMode && task) {
        onSave(task.id, updates)
      } else {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          projectId: projectId || project?.id || task?.projectId || '',
          ...updates,
          dailyRecords: [],
        }
        onAdd(newTask)
      }
      form.resetFields()
    })
  }

  const handleUpdateRecords = (taskId: string, records: any[]) => {
    if (isEditMode && task) {
      onSave(taskId, { dailyRecords: records })
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  // 根据任务类型动态获取人员选项
  const getPersonnelOptions = () => {
    const taskType = taskTypes.find(t => t.id === selectedTypeId)
    if (!taskType) return []

    const typeName = taskType.name
    if (typeName.includes('开发')) {
      return MOCK_DEVELOPERS
    } else if (typeName.includes('测试')) {
      return MOCK_TESTERS
    }
    return [...MOCK_DEVELOPERS, ...MOCK_TESTERS] // 默认显示全部
  }

  const personnelLabel = () => {
    const taskType = taskTypes.find(t => t.id === selectedTypeId)
    if (!taskType) return '参与人员'
    
    const typeName = taskType.name
    if (typeName.includes('开发')) return '开发人员'
    if (typeName.includes('测试')) return '测试人员'
    return '参与人员'
  }

  return (
    <Modal
      title={isEditMode ? '编辑任务' : '添加任务'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={720}
      okText="保存"
      cancelText="取消"
      className="compact-modal task-edit-modal"
      okButtonProps={{ disabled: !isAdmin }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: taskTypes[0]?.id || '',
          status: 'normal',
          progress: 0,
          assignees: [],
        }}
        className="compact-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="任务名称"
              name="name"
            >
              <Input placeholder="请输入任务名称" disabled={!isAdmin} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="任务类型"
              name="type"
              rules={[{ required: true, message: '请选择任务类型' }]}
            >
              <Select 
                placeholder="请选择任务类型" 
                disabled={!isAdmin}
                onChange={handleTypeChange}
              >
                {taskTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="状态"
              name="status"
            >
              <Select placeholder="请选择任务状态" disabled={!isAdmin}>
                <Option value="pending">待开始</Option>
                <Option value="normal">正常</Option>
                <Option value="risk">风险</Option>
                <Option value="delayed">延期</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="开始日期"
              name="startDate"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker style={{ width: '100%' }} disabled={!isAdmin} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="结束日期"
              name="endDate"
              rules={[{ required: true, message: '请选择结束日期' }]}
            >
              <DatePicker style={{ width: '100%' }} disabled={!isAdmin} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="进度"
              name="progress"
            >
              <InputNumber min={0} max={100} placeholder="0-100" style={{ width: '100%' }} disabled={!isAdmin} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label={personnelLabel()}
              name="assignees"
              extra={<Text type="secondary" style={{ fontSize: '12px' }}>根据任务类型自动匹配候选人</Text>}
            >
              <Select
                mode="multiple"
                placeholder={`请选择${personnelLabel()}`}
                style={{ width: '100%' }}
                allowClear
                disabled={!isAdmin}
              >
                {getPersonnelOptions().map(person => (
                  <Option key={person} value={person}>{person}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="备注"
          name="remark"
          style={{ marginBottom: '24px' }}
        >
          <TextArea
            rows={2}
            placeholder="请输入任务备注"
            maxLength={500}
            showCount
            disabled={!isAdmin}
          />
        </Form.Item>

        {isEditMode && task && (
          <>
            <Divider orientation="left">每日进度管理</Divider>
            <DailyProgressManager 
              task={task} 
              project={project || { developers: MOCK_DEVELOPERS, testers: MOCK_TESTERS }} 
              onUpdate={handleUpdateRecords}
              isAdmin={isAdmin}
            />
          </>
        )}
      </Form>
    </Modal>
  )
}

export default TaskEditModal
