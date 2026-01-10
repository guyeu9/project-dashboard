import { useState } from 'react'
import { Card, Descriptions, Tag, Table, Switch, App as AntApp, Button, Modal, Form, Input, Space, Popconfirm } from 'antd'
import useAuthStore from '../../store/authStore'
import useStore from '../../store/useStore'

function SettingsPage() {
  const { message } = AntApp.useApp()
  const { role } = useAuthStore()
  const { taskTypes, setTaskTypes } = useStore()

  const isAdmin = role === 'admin'
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const handleOpenNew = () => {
    setEditingTypeId(null)
    form.resetFields()
    setTypeModalVisible(true)
  }

  const handleOpenEdit = (record: any) => {
    setEditingTypeId(record.id)
    form.setFieldsValue({
      name: record.name,
      color: record.color,
    })
    setTypeModalVisible(true)
  }

  const handleDeleteType = (id: string) => {
    const next = taskTypes.filter(t => t.id !== id)
    setTaskTypes(next)
    message.success('任务类型已删除（刷新后不会影响历史数据）')
  }

  const handleSaveType = () => {
    form.validateFields().then(values => {
      if (!isAdmin) {
        message.error('当前为游客，仅管理员可以修改任务类型')
        return
      }
      const { name, color } = values
      if (editingTypeId) {
        const next = taskTypes.map(t =>
          t.id === editingTypeId ? { ...t, name, color } : t,
        )
        setTaskTypes(next)
        message.success('任务类型已更新')
      } else {
        const newType = {
          id: `type-${Date.now()}`,
          name,
          color,
          enabled: true,
        }
        setTaskTypes([...taskTypes, newType])
        message.success('任务类型已新增')
      }
      setTypeModalVisible(false)
      form.resetFields()
    })
  }

  const columns = [
    {
      title: '任务类型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Tag color={color} style={{ borderRadius: 12, padding: '0 12px', color: '#fff' }}>
          {color}
        </Tag>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_: boolean, record: any) => (
        <Switch
          checked={record.enabled}
          disabled={!isAdmin}
          onChange={(checked) => {
            const next = taskTypes.map((t) =>
              t.id === record.id ? { ...t, enabled: checked } : t,
            )
            setTaskTypes(next)
            message.success('任务类型状态已更新')
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            disabled={!isAdmin}
            onClick={() => handleOpenEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该任务类型？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDeleteType(record.id)}
            disabled={!isAdmin}
          >
            <Button type="link" size="small" danger disabled={!isAdmin}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title="账户权限">
        <Descriptions column={1}>
          <Descriptions.Item label="当前角色">
            {role === 'admin' ? (
              <Tag color="green">管理员</Tag>
            ) : (
              <Tag color="blue">游客</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="权限说明">
            {role === 'admin'
              ? '管理员可以新增、编辑、删除项目与任务，并管理系统字段。'
              : '游客仅可查看数据，无法修改。请通过右上角账户按钮登录管理员。'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="系统字段维护 - 任务类型"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenNew}>
            新增任务类型
          </Button>
        }
      >
        <Table
          dataSource={taskTypes}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title={editingTypeId ? '编辑任务类型' : '新增任务类型'}
        open={typeModalVisible}
        onOk={handleSaveType}
        onCancel={() => {
          setTypeModalVisible(false)
          form.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: '#1890ff' }}
        >
          <Form.Item
            label="任务类型名称"
            name="name"
            rules={[{ required: true, message: '请输入任务类型名称' }]}
          >
            <Input placeholder="例如：开发排期 / 测试联调" disabled={!isAdmin} />
          </Form.Item>
          <Form.Item
            label="颜色"
            name="color"
            rules={[{ required: true, message: '请选择或输入颜色值' }]}
          >
            <Input
              type="color"
              style={{ width: 80, padding: 0, height: 32 }}
              disabled={!isAdmin}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SettingsPage
