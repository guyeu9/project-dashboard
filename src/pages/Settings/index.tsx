import { useState } from 'react'
import { Card, Descriptions, Tag, Table, Switch, App as AntApp, Button, Modal, Form, Input, Space, Popconfirm } from 'antd'
import useAuthStore from '../../store/authStore'
import useStore from '../../store/useStore'
import useAIAnalysisStore from '../../store/aiStore'
import { PMO, ProductManager } from '../../types'



function SettingsPage() {
  const { message } = AntApp.useApp()
  const { role } = useAuthStore()
  const { taskTypes, setTaskTypes, pmos, setPMOs, productManagers, setProductManagers, clearAllData } = useStore()
  const { systemPrompt, setSystemPrompt } = useAIAnalysisStore()

  const isAdmin = role === 'admin'
  
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [typeForm] = Form.useForm()
  
  const [pmoModalVisible, setPmoModalVisible] = useState(false)
  const [editingPmoId, setEditingPmoId] = useState<string | null>(null)
  const [pmoForm] = Form.useForm()
  
  const [productManagerModalVisible, setProductManagerModalVisible] = useState(false)
  const [editingProductManagerId, setEditingProductManagerId] = useState<string | null>(null)
  const [productManagerForm] = Form.useForm()
  const [clearDataModalVisible, setClearDataModalVisible] = useState(false)
  
  // AI 提示词编辑相关状态
  const [aiPromptModalVisible, setAiPromptModalVisible] = useState(false)
  const [aiPromptForm] = Form.useForm()

  const handleOpenNewType = () => {
    setEditingTypeId(null)
    typeForm.resetFields()
    setTypeModalVisible(true)
  }

  const handleOpenEditType = (record: any) => {
    setEditingTypeId(record.id)
    typeForm.setFieldsValue({
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
    typeForm.validateFields().then(values => {
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
      typeForm.resetFields()
    })
  }

  const handleOpenNewPmo = () => {
    setEditingPmoId(null)
    pmoForm.resetFields()
    setPmoModalVisible(true)
  }

  const handleOpenEditPmo = (record: PMO) => {
    setEditingPmoId(record.id)
    pmoForm.setFieldsValue({
      name: record.name,
    })
    setPmoModalVisible(true)
  }

  const handleDeletePmo = (id: string) => {
    const next = pmos.filter(p => p.id !== id)
    setPMOs(next)
    message.success('PMO已删除')
  }

  const handleSavePmo = () => {
    pmoForm.validateFields().then(values => {
      if (!isAdmin) {
        message.error('当前为游客，仅管理员可以修改PMO')
        return
      }
      const { name } = values
      if (editingPmoId) {
        const next = pmos.map(p =>
          p.id === editingPmoId ? { ...p, name } : p,
        )
        setPMOs(next)
        message.success('PMO已更新')
      } else {
        const newPmo = {
          id: `pmo-${Date.now()}`,
          name,
          enabled: true,
        }
        setPMOs([...pmos, newPmo])
        message.success('PMO已新增')
      }
      setPmoModalVisible(false)
      pmoForm.resetFields()
    })
  }

  const handleOpenNewPm = () => {
    setEditingProductManagerId(null)
    productManagerForm.resetFields()
    setProductManagerModalVisible(true)
  }

  const handleOpenEditPm = (record: ProductManager) => {
    setEditingProductManagerId(record.id)
    productManagerForm.setFieldsValue({
      name: record.name,
    })
    setProductManagerModalVisible(true)
  }

  const handleDeletePm = (id: string) => {
    const next = productManagers.filter(p => p.id !== id)
    setProductManagers(next)
    message.success('产品经理已删除')
  }

  const handleSavePm = () => {
    productManagerForm.validateFields().then(values => {
      if (!isAdmin) {
        message.error('当前为游客，仅管理员可以修改产品经理')
        return
      }
      const { name } = values
      if (editingProductManagerId) {
        const next = productManagers.map(p =>
          p.id === editingProductManagerId ? { ...p, name } : p,
        )
        setProductManagers(next)
        message.success('产品经理已更新')
      } else {
        const newPm = {
          id: `pm-${Date.now()}`,
          name,
          enabled: true,
        }
        setProductManagers([...productManagers, newPm])
        message.success('产品经理已新增')
      }
      setProductManagerModalVisible(false)
      productManagerForm.resetFields()
    })
  }

  // AI 提示词编辑相关函数
  const handleOpenEditAIPrompt = () => {
    aiPromptForm.setFieldsValue({
      prompt: systemPrompt
    })
    setAiPromptModalVisible(true)
  }

  const handleSaveAIPrompt = () => {
    aiPromptForm.validateFields().then(values => {
      if (!isAdmin) {
        message.error('当前为游客，仅管理员可以修改AI提示词')
        return
      }
      setSystemPrompt(values.prompt)
      message.success('AI提示词已更新')
      setAiPromptModalVisible(false)
      aiPromptForm.resetFields()
    })
  }

  const handleConfirmClearData = () => {
    try {
      clearAllData()
      message.success('所有数据已成功清空')
      setClearDataModalVisible(false)
    } catch (error) {
      console.error('清空数据失败:', error)
      message.error('清空数据失败，请重试')
    }
  }

  const typeColumns = [
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
            onClick={() => handleOpenEditType(record)}
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

  const pmoColumns = [
    {
      title: 'PMO名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
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
            const next = pmos.map((p) =>
              p.id === record.id ? { ...p, enabled: checked } : p,
            )
            setPMOs(next)
            message.success('PMO状态已更新')
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
            onClick={() => handleOpenEditPmo(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该PMO？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDeletePmo(record.id)}
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

  const pmColumns = [
    {
      title: '产品经理名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
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
            const next = productManagers.map((p) =>
              p.id === record.id ? { ...p, enabled: checked } : p,
            )
            setProductManagers(next)
            message.success('产品经理状态已更新')
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
            onClick={() => handleOpenEditPm(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该产品经理？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDeletePm(record.id)}
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

      {/* AI 提示词设置卡片 */}
      <Card
        title="AI 提示词管理"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenEditAIPrompt}>
            编辑提示词
          </Button>
        }
      >
        <div style={{ backgroundColor: '#f0f5ff', padding: '16px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{systemPrompt}</pre>
        </div>
      </Card>

      <Card
        title="系统字段维护 - 任务类型"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenNewType}>
            新增任务类型
          </Button>
        }
      >
        <Table
          dataSource={taskTypes}
          columns={typeColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card
        title="系统字段维护 - PMO"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenNewPmo}>
            新增PMO
          </Button>
        }
      >
        <Table
          dataSource={pmos}
          columns={pmoColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card
        title="系统字段维护 - 产品经理"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenNewPm}>
            新增产品经理
          </Button>
        }
      >
        <Table
          dataSource={productManagers}
          columns={pmColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title="编辑 AI 提示词"
        open={aiPromptModalVisible}
        onOk={handleSaveAIPrompt}
        onCancel={() => {
          setAiPromptModalVisible(false)
          aiPromptForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
        width={800}
      >
        <Form
          form={aiPromptForm}
          layout="vertical"
        >
          <Form.Item
            label="AI 提示词"
            name="prompt"
            rules={[{ required: true, message: '请输入AI提示词' }]}
          >
            <Input.TextArea
              rows={15}
              placeholder="请输入AI分析时使用的提示词"
              disabled={!isAdmin}
              style={{ fontSize: '14px', fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTypeId ? '编辑任务类型' : '新增任务类型'}
        open={typeModalVisible}
        onOk={handleSaveType}
        onCancel={() => {
          setTypeModalVisible(false)
          typeForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
      >
        <Form
          form={typeForm}
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

      <Modal
        title={editingPmoId ? '编辑PMO' : '新增PMO'}
        open={pmoModalVisible}
        onOk={handleSavePmo}
        onCancel={() => {
          setPmoModalVisible(false)
          pmoForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
      >
        <Form
          form={pmoForm}
          layout="vertical"
        >
          <Form.Item
            label="PMO名称"
            name="name"
            rules={[{ required: true, message: '请输入PMO名称' }]}
          >
            <Input placeholder="例如：PMO-A" disabled={!isAdmin} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingProductManagerId ? '编辑产品经理' : '新增产品经理'}
        open={productManagerModalVisible}
        onOk={handleSavePm}
        onCancel={() => {
          setProductManagerModalVisible(false)
          productManagerForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
      >
        <Form
          form={productManagerForm}
          layout="vertical"
        >
          <Form.Item
            label="产品经理名称"
            name="name"
            rules={[{ required: true, message: '请输入产品经理名称' }]}
          >
            <Input placeholder="例如：产品经理A" disabled={!isAdmin} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据管理卡片 - 仅管理员可见 */}
      {isAdmin && (
        <Card
          title="数据管理" 
          style={{ marginTop: 24 }}
          extra={
            <span style={{ color: '#ff4d4f', fontSize: '14px', fontWeight: 'bold' }}>⚠️ 危险操作</span>
          }
        >
          <div className="clear-data-section">
            <h4>一键清空所有数据</h4>
            <p className="clear-data-description">
              此操作将清空系统中的所有项目、任务、PMO、产品经理和历史记录，仅保留默认任务类型。
              请谨慎操作，建议先导出备份数据。
            </p>
            <Button 
              type="primary" 
              danger
              size="large"
              onClick={() => setClearDataModalVisible(true)}
            >
              一键清空数据
            </Button>
          </div>
        </Card>
      )}

      {/* 清空数据确认模态框 */}
      <Modal
        title="确认清空所有数据"
        open={clearDataModalVisible}
        onOk={handleConfirmClearData}
        onCancel={() => setClearDataModalVisible(false)}
        okText="确认清空"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        width={500}
      >
        <div className="clear-data-confirm">
          <div className="warning-icon">⚠️</div>
          <h4>警告：此操作不可恢复！</h4>
          <p>您即将清空系统中的所有数据，包括：</p>
          <ul>
            <li>所有项目和任务</li>
            <li>所有PMO和产品经理</li>
            <li>所有历史记录</li>
          </ul>
          <p>仅会保留默认的任务类型。</p>
          <p className="strong">请确保您已导出所有重要数据！</p>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
