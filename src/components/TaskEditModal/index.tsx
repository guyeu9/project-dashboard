import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, DatePicker, Space } from 'antd'
import { Task, TaskType } from '../../types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

interface TaskEditModalProps {
  visible: boolean
  task: Task | null
  taskTypes: TaskType[]
  projectId?: string
  onSave: (taskId: string, updates: Partial<Task>) => void
  onAdd: (task: Task) => void
  onCancel: () => void
}

function TaskEditModal({ visible, task, taskTypes, projectId, onSave, onAdd, onCancel }: TaskEditModalProps) {
  const [form] = Form.useForm()
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    setIsEditMode(!!task)
    if (task) {
      form.setFieldsValue({
        name: task.name,
        type: task.type.id,
        status: task.status,
        progress: task.progress,
        startDate: dayjs(task.startDate),
        endDate: dayjs(task.endDate),
        assignees: task.assignees,
        dailyProgress: task.dailyProgress,
        remark: task.remark || '',
      })
    } else {
      form.resetFields()
    }
  }, [task, form, taskTypes])

  const handleOk = () => {
    form.validateFields().then((values) => {
      const selectedTaskType = taskTypes.find(type => type.id === values.type)
      if (!selectedTaskType) {
        throw new Error('Invalid task type')
      }

      const updates = {
        name: values.name,
        type: selectedTaskType,
        status: values.status,
        progress: values.progress,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        assignees: values.assignees,
        dailyProgress: values.dailyProgress,
        remark: values.remark,
      }

      if (isEditMode && task) {
        onSave(task.id, updates)
      } else {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          projectId: projectId || task?.projectId || '',
          ...updates,
        }
        onAdd(newTask)
      }
      form.resetFields()
    })
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={isEditMode ? '编辑任务' : '添加任务'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="保存"
      cancelText="取消"
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
      >
        <Form.Item
          label="任务名称"
          name="name"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item
          label="任务类型"
          name="type"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select placeholder="请选择任务类型">
            {taskTypes.map(type => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: '请选择任务状态' }]}
        >
          <Select placeholder="请选择任务状态">
            <Option value="normal">正常</Option>
            <Option value="blocked">阻塞</Option>
            <Option value="resolved">已解决</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="进度"
          name="progress"
          rules={[{ required: true, message: '请输入任务进度' }]}
        >
          <InputNumber min={0} max={100} placeholder="0-100" />
        </Form.Item>

        <Space style={{ width: '100%' }}>
          <Form.Item
            label="开始日期"
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="结束日期"
            name="endDate"
            rules={[{ required: true, message: '请选择结束日期' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Form.Item
          label="负责人及参与人员"
          name="assignees"
        >
          <Select
            mode="tags"
            placeholder="请输入负责人及参与人员"
            style={{ width: '100%' }}
          >
            <Option value="张三">张三</Option>
            <Option value="李四">李四</Option>
            <Option value="王五">王五</Option>
            <Option value="赵六">赵六</Option>
            <Option value="陈七">陈七</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="每日进度"
          name="dailyProgress"
        >
          <TextArea
            rows={2}
            placeholder="请输入每日进度"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="备注"
          name="remark"
        >
          <TextArea
            rows={3}
            placeholder="请输入任务备注"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TaskEditModal