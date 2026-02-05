import { useState } from 'react'
import { Card, Descriptions, Tag, Table, Switch, App as AntApp, Button, Modal, Form, Input, Space, Popconfirm, Radio, Select } from 'antd'
import useAuthStore from '../../store/authStore'
import useStore from '../../store/useStore'
import useAIAnalysisStore, { AIProvider, AIProviderType, AIModel, fetchProviderModels } from '../../store/aiStore'
import { PMO, ProductManager } from '../../types'

function SettingsPage() {
  const { message } = AntApp.useApp()
  const { role } = useAuthStore()
  const { taskTypes, setTaskTypes, pmos, setPMOs, productManagers, setProductManagers, clearAllData } = useStore()
  const { systemPrompt, setSystemPrompt, providers, currentProviderId, addProvider, updateProvider, deleteProvider, setCurrentProvider } = useAIAnalysisStore()

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
  const [clearDataPassword, setClearDataPassword] = useState('')

  // AI 提示词编辑相关状态
  const [aiPromptModalVisible, setAiPromptModalVisible] = useState(false)
  const [aiPromptForm] = Form.useForm()
  const [aiPromptPasswordModalVisible, setAiPromptPasswordModalVisible] = useState(false)
  const [aiPromptPassword, setAiPromptPassword] = useState('')

  // AI 服务提供商管理相关状态
  const [aiProviderModalVisible, setAiProviderModalVisible] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)
  const [aiProviderForm] = Form.useForm()

  // 模型列表相关状态
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

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
    setAiPromptPasswordModalVisible(true)
  }

  const handleConfirmAIPromptPassword = () => {
    if (aiPromptPassword !== 'admin123') {
      message.error('密码错误，操作已取消')
      setAiPromptPassword('')
      return
    }

    aiPromptForm.setFieldsValue({
      prompt: systemPrompt
    })
    setAiPromptPasswordModalVisible(false)
    setAiPromptPassword('')
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

  // AI 服务提供商管理相关函数
  const handleOpenNewProvider = () => {
    setEditingProviderId(null)
    aiProviderForm.resetFields()
    setAvailableModels([])
    setAiProviderModalVisible(true)
  }

  const handleOpenEditProvider = (provider: AIProvider) => {
    setEditingProviderId(provider.id)

    // 对 API Key 进行脱敏处理
    const maskedApiKey = provider.apiKey.length > 8
      ? `${provider.apiKey.substring(0, 4)}****${provider.apiKey.substring(provider.apiKey.length - 4)}`
      : '****'

    aiProviderForm.setFieldsValue({
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: maskedApiKey, // 编辑时显示脱敏的 API Key
      model: provider.model,
      type: provider.type,
      enabled: provider.enabled
    })
    setAvailableModels([])
    setAiProviderModalVisible(true)
  }

  const handleDeleteProvider = (id: string) => {
    if (providers.length <= 1) {
      message.error('至少需要保留一个 AI 服务提供商')
      return
    }
    deleteProvider(id)
    message.success('AI 服务提供商已删除')
  }

  const handleSaveProvider = () => {
    aiProviderForm.validateFields().then(values => {
      if (!isAdmin) {
        message.error('当前为游客，仅管理员可以修改AI服务提供商')
        return
      }
      const { name, baseUrl, apiKey, model, type, enabled } = values

      // 判断 API Key 是否被修改
      let finalApiKey = apiKey
      if (editingProviderId) {
        const existingProvider = providers.find(p => p.id === editingProviderId)
        if (existingProvider) {
          // 如果输入的 API Key 是脱敏格式（包含 ****），则保留原有的 API Key
          if (apiKey && apiKey.includes('****')) {
            finalApiKey = existingProvider.apiKey
          }
          // 如果输入的 API Key 为空，也保留原有的 API Key
          else if (!apiKey) {
            finalApiKey = existingProvider.apiKey
          }
          // 否则使用用户输入的新 API Key
        }
      }

      if (editingProviderId) {
        updateProvider(editingProviderId, { name, baseUrl, apiKey: finalApiKey, model, type, enabled })
        message.success('AI 服务提供商已更新')
      } else {
        addProvider({ name, baseUrl, apiKey: finalApiKey, model, type, enabled })
        message.success('AI 服务提供商已新增')
      }
      setAiProviderModalVisible(false)
      aiProviderForm.resetFields()
    })
  }

  const handleSwitchProvider = (providerId: string) => {
    setCurrentProvider(providerId)
    const provider = providers.find(p => p.id === providerId)
    message.success(`已切换到 ${provider?.name}`)
  }

  // 获取模型列表
  const handleFetchModels = async () => {
    const values = aiProviderForm.getFieldsValue()
    const { baseUrl, apiKey, type } = values

    if (!baseUrl || !apiKey || !type) {
      message.error('请先填写 Base URL、API Key 和 API 类型')
      return
    }

    // 如果是编辑模式且 API Key 是脱敏格式，则使用原有的完整 API Key
    let finalApiKey = apiKey
    if (editingProviderId && apiKey.includes('****')) {
      const existingProvider = providers.find(p => p.id === editingProviderId)
      if (existingProvider) {
        finalApiKey = existingProvider.apiKey
      }
    }

    setLoadingModels(true)
    try {
      const tempProvider: AIProvider = {
        id: 'temp',
        name: 'temp',
        baseUrl,
        apiKey: finalApiKey,
        model: '',
        type,
        enabled: true
      }

      const models = await fetchProviderModels(tempProvider)
      setAvailableModels(models)
      message.success(`成功获取 ${models.length} 个模型`)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      message.error('获取模型列表失败，请检查配置信息')
    } finally {
      setLoadingModels(false)
    }
  }

  const handleConfirmClearData = () => {
    // 验证密码
    if (clearDataPassword !== 'admin123') {
      message.error('密码错误，操作已取消')
      setClearDataPassword('')
      return
    }

    try {
      clearAllData()
      message.success('所有数据已成功清空')
      setClearDataModalVisible(false)
      setClearDataPassword('')
    } catch (error) {
      console.error('清空数据失败:', error)
      message.error('清空数据失败，请重试')
    }
  }

  const aiProviderColumns = [
    {
      title: '当前使用',
      key: 'current',
      width: 100,
      render: (_: any, record: AIProvider) => (
        <Radio
          checked={record.id === currentProviderId}
          onChange={() => handleSwitchProvider(record.id)}
          disabled={!record.enabled}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AIProvider) => (
        <span>
          {text}
          {record.id === currentProviderId && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              当前使用
            </Tag>
          )}
        </span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AIProviderType) => (
        <Tag color={type === 'gemini' ? 'purple' : 'green'}>
          {type === 'gemini' ? 'Gemini' : 'OpenAI'}
        </Tag>
      )
    },
    {
      title: 'Base URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      ellipsis: true,
      render: (url: string) => (
        <span style={{ fontSize: '12px', color: '#666' }}>{url}</span>
      )
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      ellipsis: true,
      render: (apiKey: string) => (
        <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
          {apiKey.length > 8 ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : '****'}
        </span>
      )
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      ellipsis: true,
      render: (model: string) => (
        <span style={{ fontSize: '12px', color: '#666' }}>{model}</span>
      )
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (_: boolean, record: AIProvider) => (
        <Switch
          checked={record.enabled}
          disabled={!isAdmin}
          onChange={(checked) => {
            updateProvider(record.id, { enabled: checked })
            message.success('AI 服务提供商状态已更新')
          }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: AIProvider) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleOpenEditProvider(record)}
            disabled={!isAdmin}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个 AI 服务提供商吗？"
            onConfirm={() => handleDeleteProvider(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={!isAdmin}
          >
            <Button
              type="link"
              size="small"
              danger
              disabled={!isAdmin}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

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
        <div style={{ backgroundColor: '#f0f5ff', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', fontSize: '48px' }}>🔒</div>
          <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>AI 提示词已隐藏</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#999' }}>
            点击右上角"编辑提示词"按钮，输入管理员密码后可查看和编辑
          </p>
        </div>
      </Card>

      {/* AI 服务提供商管理卡片 */}
      <Card
        title="AI 服务提供商管理"
        style={{ marginTop: 24 }}
        extra={
          <Button type="primary" disabled={!isAdmin} onClick={handleOpenNewProvider}>
            新增 AI 服务
          </Button>
        }
      >
        <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
          配置和管理 AI 服务提供商，点击单选按钮切换当前使用的 AI 服务。
        </div>
        <Table
          dataSource={providers}
          columns={aiProviderColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
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

      {/* AI 提示词密码验证模态框 */}
      <Modal
        title="安全验证"
        open={aiPromptPasswordModalVisible}
        onOk={handleConfirmAIPromptPassword}
        onCancel={() => {
          setAiPromptPasswordModalVisible(false)
          setAiPromptPassword('')
        }}
        okText="确认"
        cancelText="取消"
        width={400}
      >
        <div>
          <p style={{ marginBottom: '12px' }}>请输入管理员密码以编辑 AI 提示词：</p>
          <Input.Password
            placeholder="请输入管理员密码"
            value={aiPromptPassword}
            onChange={(e) => setAiPromptPassword(e.target.value)}
            onPressEnter={handleConfirmAIPromptPassword}
            autoFocus
          />
        </div>
      </Modal>

      {/* 编辑 AI 提示词模态框 */}
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

      {/* AI 服务提供商编辑/新增模态框 */}
      <Modal
        title={editingProviderId ? '编辑 AI 服务提供商' : '新增 AI 服务提供商'}
        open={aiProviderModalVisible}
        onOk={handleSaveProvider}
        onCancel={() => {
          setAiProviderModalVisible(false)
          aiProviderForm.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !isAdmin }}
        width={600}
      >
        <Form
          form={aiProviderForm}
          layout="vertical"
          initialValues={{
            type: 'openai',
            enabled: true
          }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入AI服务名称' }]}
          >
            <Input placeholder="例如：New API" disabled={!isAdmin} />
          </Form.Item>
          <Form.Item
            label="API 类型"
            name="type"
            rules={[{ required: true, message: '请选择API类型' }]}
          >
            <Select disabled={!isAdmin}>
              <Select.Option value="openai">OpenAI 兼容</Select.Option>
              <Select.Option value="gemini">Gemini</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[{ required: true, message: '请输入Base URL' }]}
          >
            <Input placeholder="例如：https://api.zscc.in" disabled={!isAdmin} />
          </Form.Item>
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入API Key' }]}
            extra={editingProviderId ? "编辑时显示脱敏版本，直接修改即可更新" : ""}
          >
            <Input.Password
              placeholder="请输入API Key"
              disabled={!isAdmin}
            />
          </Form.Item>
          <Form.Item label="模型名称" required>
            <Form.Item
              name="model"
              noStyle
              rules={[{ required: true, message: '请选择或输入模型名称' }]}
            >
              <Select
                showSearch
                placeholder="请选择或输入模型名称"
                style={{ width: '100%' }}
                disabled={!isAdmin}
                mode="combobox"
                options={availableModels.map(model => ({
                  label: model.name,
                  value: model.id
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="link"
                size="small"
                onClick={handleFetchModels}
                disabled={!isAdmin || loadingModels}
                loading={loadingModels}
              >
                {loadingModels ? '获取中...' : '从服务端获取模型列表'}
              </Button>
              {availableModels.length > 0 && (
                <Button
                  type="default"
                  size="small"
                  onClick={() => setAvailableModels([])}
                  disabled={!isAdmin}
                >
                  清空模型列表
                </Button>
              )}
            </div>
            {availableModels.length > 0 && (
              <div style={{ marginTop: 4, color: '#666', fontSize: '12px' }}>
                已获取 {availableModels.length} 个模型
              </div>
            )}
          </Form.Item>
          <Form.Item
            label="启用"
            name="enabled"
            valuePropName="checked"
          >
            <Switch disabled={!isAdmin} />
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
        onCancel={() => {
          setClearDataModalVisible(false)
          setClearDataPassword('')
        }}
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

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <h5 style={{ color: '#ff4d4f', marginBottom: '12px' }}>安全验证</h5>
            <p style={{ marginBottom: '12px' }}>请输入管理员密码以确认此操作：</p>
            <Input.Password
              placeholder="请输入管理员密码"
              value={clearDataPassword}
              onChange={(e) => setClearDataPassword(e.target.value)}
              onPressEnter={handleConfirmClearData}
              autoFocus
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
