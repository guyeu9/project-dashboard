import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd'
import { Project } from '../../types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

interface ProjectEditModalProps {
  visible: boolean
  project: Project | null
  onSave: (projectId: string, updates: Partial<Project>) => void
  onAdd: (project: Project) => void
  onCancel: () => void
}

function ProjectEditModal({ visible, project, onSave, onAdd, onCancel }: ProjectEditModalProps) {
  const [form] = Form.useForm()
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    setIsEditMode(!!project)
    if (project) {
      form.setFieldsValue({
        name: project.name,
        status: project.status,
        progress: project.progress,
        startDate: dayjs(project.startDate),
        endDate: dayjs(project.endDate),
        owner: project.owner,
        pmo: project.pmo || '',
        productManager: project.productManager || '',
        partners: project.partners,
        developers: project.developers,
        testers: project.testers,
        chatGroupLinks: project.chatGroupLinks || [],
        contacts: project.contacts || [],
        remark: project.remark || '',
      })
    } else {
      form.resetFields()
    }
  }, [project, form])

  const handleOk = () => {
    form.validateFields().then((values) => {
      const updates = {
        name: values.name,
        status: values.status,
        progress: values.progress,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        owner: values.owner,
        pmo: values.pmo,
        productManager: values.productManager,
        partners: values.partners,
        developers: values.developers,
        testers: values.testers,
        chatGroupLinks: values.chatGroupLinks,
        contacts: values.contacts,
        remark: values.remark,
      }

      if (isEditMode && project) {
        onSave(project.id, updates)
      } else {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          ...updates,
        }
        onAdd(newProject)
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
      title={isEditMode ? '编辑项目' : '添加项目'}
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
          status: 'normal',
          progress: 0,
          partners: [],
          developers: [],
          testers: [],
          chatGroupLinks: [],
          contacts: [],
        }}
      >
        <Form.Item
          label="项目名称"
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: '请选择项目状态' }]}
        >
          <Select placeholder="请选择项目状态">
            <Option value="normal">正常</Option>
            <Option value="delayed">延期</Option>
            <Option value="risk">风险</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="进度"
          name="progress"
          rules={[{ required: true, message: '请输入项目进度' }]}
        >
          <InputNumber min={0} max={100} placeholder="0-100" />
        </Form.Item>

        <Form.Item
          label="开始日期"
          name="startDate"
          rules={[{ required: true, message: '请选择开始日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="结束日期"
          name="endDate"
          rules={[{ required: true, message: '请选择结束日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="负责人"
          name="owner"
          rules={[{ required: true, message: '请输入负责人' }]}
        >
          <Input placeholder="请输入负责人" />
        </Form.Item>

        <Form.Item
          label="PMO"
          name="pmo"
        >
          <Input placeholder="请输入PMO负责人" />
        </Form.Item>

        <Form.Item
          label="产品经理"
          name="productManager"
        >
          <Input placeholder="请输入产品经理" />
        </Form.Item>

        <Form.Item
          label="合作方"
          name="partners"
        >
          <Select
            mode="tags"
            placeholder="请输入合作方"
            style={{ width: '100%' }}
          >
            <Option value="合作方A">合作方A</Option>
            <Option value="合作方B">合作方B</Option>
            <Option value="合作方C">合作方C</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="开发人员"
          name="developers"
        >
          <Select
            mode="tags"
            placeholder="请输入开发人员"
            style={{ width: '100%' }}
          >
            <Option value="张三">张三</Option>
            <Option value="李四">李四</Option>
            <Option value="王五">王五</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="测试人员"
          name="testers"
        >
          <Select
            mode="tags"
            placeholder="请输入测试人员"
            style={{ width: '100%' }}
          >
            <Option value="赵六">赵六</Option>
            <Option value="陈七">陈七</Option>
            <Option value="周八">周八</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="备注"
          name="remark"
        >
          <TextArea
            rows={4}
            placeholder="请输入项目备注"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProjectEditModal
