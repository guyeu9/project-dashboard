import { useState } from 'react'
import { Card, Row, Col, Tag, Input, Space, Modal, Button, Select, App as AntApp, DatePicker } from 'antd'
import {
  EditOutlined,
  LinkOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  FlagOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { Project } from '../../types'
import useStore from '../../store/useStore'
import './index.css'

const { Option } = Select
const { TextArea } = Input

interface ProjectHeaderProps {
  project: Project
  onProjectUpdate: (field: string, value: any) => void
  isAdmin: boolean
  onBack?: () => void
}

function ProjectHeader({ project, onProjectUpdate, isAdmin, onBack }: ProjectHeaderProps) {
  const { message } = AntApp.useApp()
  const { pmos, productManagers } = useStore()
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState(project.name)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string | Date>('')
  const [remarkModalVisible, setRemarkModalVisible] = useState(false)
  const [remark, setRemark] = useState(project.remark || '')

  // 根据 ID 获取 PMO 真实名称
  const getPMOName = (pmoId: string | null | undefined): string => {
    if (!pmoId) return '未设置'
    const pmo = pmos.find(p => p.id === pmoId)
    return pmo?.name || pmoId
  }

  // 根据 ID 获取 ProductManager 真实名称
  const getProductManagerName = (pmId: string | null | undefined): string => {
    if (!pmId) return '未设置'
    const pm = productManagers.find(p => p.id === pmId)
    return pm?.name || pmId
  }

  const handleNameEdit = () => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改项目名称')
      return
    }
    setEditingName(true)
  }

  const handleNameSave = () => {
    setEditingName(false)
    message.success('项目名称已更新')
  }

  const handleNameCancel = () => {
    setProjectName(project.name)
    setEditingName(false)
  }

  const handleFieldEdit = (field: string, currentValue: string) => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改项目信息')
      return
    }
    setEditingField(field)
    // 处理日期字段
    if (field === 'startDate' || field === 'endDate') {
      // 将日期字符串转换为Date对象
      const date = new Date(currentValue)
      setEditValue(date)
    } else {
      setEditValue(currentValue)
    }
  }

  const handleFieldSave = () => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改项目信息')
      return
    }
    let value: any = editValue
    
    // 处理日期字段
    if (editingField === 'startDate' || editingField === 'endDate') {
      // 将Date对象转换为YYYY-MM-DD格式的字符串
      if (value instanceof Date) {
        const year = value.getFullYear()
        const month = String(value.getMonth() + 1).padStart(2, '0')
        const day = String(value.getDate()).padStart(2, '0')
        value = `${year}-${month}-${day}`
      }
    } 
    // 处理数组类型的字段
    else if (editingField === 'partners' || editingField === 'developers' || editingField === 'testers') {
      value = (editValue as string).split(',').map((item: string) => item.trim()).filter((item: string) => item)
    }
    
    onProjectUpdate(editingField!, value)
    setEditingField(null)
    setEditValue('')
    message.success('字段已更新')
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleRemarkSave = () => {
    if (!isAdmin) {
      message.warning('当前为游客，仅管理员可以修改项目备注')
      return
    }
    setRemarkModalVisible(false)
    message.success('备注已更新')
  }

  return (
    <Card className="project-header">
      <div style={{ position: 'absolute', right: 24, top: 24, zIndex: 10 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
        >
          返回项目管理
        </Button>
      </div>
      <Row gutter={24}>
        <Col span={24}>
          <div className="project-title-section">
            {editingName ? (
              <Space>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onPressEnter={handleNameSave}
                  style={{ fontSize: 24, fontWeight: 'bold', width: 400 }}
                />
                <Button type="primary" onClick={handleNameSave}>
                  保存
                </Button>
                <Button onClick={handleNameCancel}>
                  取消
                </Button>
              </Space>
            ) : (
              <Space>
                <h1 className="project-name">{project.name}</h1>
                {isAdmin && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleNameEdit}
                    size="small"
                  >
                    编辑
                  </Button>
                )}
              </Space>
            )}
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 合作方
            </div>
            <div className="info-value">
              {editingField === 'partners' ? (
                <Space>
                  <Input
                    value={editValue as string}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入合作方，用逗号分隔"
                    style={{ width: '100%' }}
                  />
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div 
                  onClick={() => isAdmin && handleFieldEdit('partners', project.partners.join(','))} 
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  {project.partners.map((partner: string, index: number) => (
                    <Tag key={index} color="blue" style={{ margin: '4px 4px 0 0' }}>
                      {partner}
                    </Tag>
                  ))}
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 产品经理
            </div>
            <div className="info-value">
              {editingField === 'productManager' ? (
                <Space>
                  <Select
                    value={editValue as string}
                    onChange={(value) => setEditValue(value)}
                    placeholder="请选择产品经理"
                    style={{ width: 200 }}
                    allowClear
                    showSearch
                  >
                    {productManagers.filter(p => p.enabled).map(p => (
                      <Option key={p.id} value={p.id}>{p.name}</Option>
                    ))}
                  </Select>
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div
                  onClick={() => isAdmin && handleFieldEdit('productManager', project.productManager || '')}
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  <Tag color="geekblue">{getProductManagerName(project.productManager)}</Tag>
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> PMO
            </div>
            <div className="info-value">
              {editingField === 'pmo' ? (
                <Space>
                  <Select
                    value={editValue as string}
                    onChange={(value) => setEditValue(value)}
                    placeholder="请选择 PMO"
                    style={{ width: 200 }}
                    allowClear
                    showSearch
                  >
                    {pmos.filter(p => p.enabled).map(p => (
                      <Option key={p.id} value={p.id}>{p.name}</Option>
                    ))}
                  </Select>
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div
                  onClick={() => isAdmin && handleFieldEdit('pmo', project.pmo || '')}
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  <Tag color="cyan">{getPMOName(project.pmo)}</Tag>
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <TeamOutlined /> 开发人员
            </div>
            <div className="info-value">
              {editingField === 'developers' ? (
                <Space>
                  <Input
                    value={editValue as string}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入开发人员，用逗号分隔"
                    style={{ width: '100%' }}
                  />
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div 
                  onClick={() => isAdmin && handleFieldEdit('developers', project.developers.join(','))} 
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  {project.developers.map((dev: string, index: number) => (
                    <Tag key={index} color="green" style={{ margin: '4px 4px 0 0' }}>
                      {dev}
                    </Tag>
                  ))}
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <TeamOutlined /> 测试人员
            </div>
            <div className="info-value">
              {editingField === 'testers' ? (
                <Space>
                  <Input
                    value={editValue as string}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入测试人员，用逗号分隔"
                    style={{ width: '100%' }}
                  />
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div 
                  onClick={() => isAdmin && handleFieldEdit('testers', project.testers.join(','))} 
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  {project.testers.map((tester: string, index: number) => (
                    <Tag key={index} color="orange" style={{ margin: '4px 4px 0 0' }}>
                      {tester}
                    </Tag>
                  ))}
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 负责人
            </div>
            <div className="info-value">
              {editingField === 'owner' ? (
                <Space>
                  <Input
                    value={editValue as string}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入负责人"
                    style={{ width: '100%' }}
                  />
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div 
                  onClick={() => isAdmin && handleFieldEdit('owner', project.owner)} 
                  style={{ cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  <Tag color="purple">{project.owner}</Tag>
                  {isAdmin && (
                    <Button type="link" size="small" icon={<EditOutlined />}>
                      编辑
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <FlagOutlined /> 项目状态
            </div>
            <div className="info-value">
              <Select
                value={project.status}
                onChange={(value) => {
                  if (!isAdmin) {
                    message.warning('当前为游客，仅管理员可以修改项目信息')
                    return
                  }
                  onProjectUpdate('status', value)
                }}
                style={{ width: '100%' }}
                size="small"
                disabled={!isAdmin}
              >
                <Option value="pending">
                  待开始
                </Option>
                <Option value="normal">
                  正常
                </Option>
                <Option value="delayed">
                  延期
                </Option>
                <Option value="risk">
                  风险
                </Option>
                <Option value="completed">
                  已完成
                </Option>
              </Select>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <CalendarOutlined /> 项目周期
            </div>
            <div className="info-value">
              {editingField === 'startDate' || editingField === 'endDate' ? (
                <Space>
                  <DatePicker
                    value={editValue instanceof Date ? editValue : null}
                    onChange={(date) => setEditValue(date || '')}
                    placeholder={editingField === 'startDate' ? '选择开始日期' : '选择结束日期'}
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                  />
                  <Button type="primary" size="small" onClick={handleFieldSave}>
                    保存
                  </Button>
                  <Button size="small" onClick={handleFieldCancel}>
                    取消
                  </Button>
                </Space>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.startDate} ~ {project.endDate}
                  </span>
                  {isAdmin && (
                    <Space style={{ marginTop: '4px' }}>
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleFieldEdit('startDate', project.startDate)}>
                        编辑开始
                      </Button>
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleFieldEdit('endDate', project.endDate)}>
                        编辑结束
                      </Button>
                    </Space>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <LinkOutlined /> 联调群
            </div>
            <div className="info-value">
              {project.chatGroupLinks && project.chatGroupLinks.length > 0 ? (
                project.chatGroupLinks.map((link: string, index: number) => {
                  const isUrl = /^https?:\/\//.test(link)
                  const content = (
                    <Tag color="cyan">群组 {index + 1}</Tag>
                  )
                  if (isUrl) {
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-link"
                      >
                        {content}
                      </a>
                    )
                  }
                  return (
                    <span key={index} className="chat-link">
                      {content}
                    </span>
                  )
                })
              ) : (
                <span className="empty-value">暂无</span>
              )}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 对方联系人
            </div>
            <div className="info-value">
              {project.contacts && project.contacts.length > 0 ? (
                project.contacts.map((contact: any, index: number) => (
                  <div key={index} className="contact-item">
                    <Tag color="geekblue">
                      {contact.name} ({contact.role})
                    </Tag>
                    <span className="contact-phone">{contact.phone}</span>
                  </div>
                ))
              ) : (
                <span className="empty-value">暂无</span>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24}>
          <div className="info-section">
            <div className="info-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <FileTextOutlined /> 备注
              </span>
              {isAdmin && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => handleFieldEdit('remark', project.remark || '')}
                >
                  编辑
                </Button>
              )}
            </div>
            <div className="info-value">
              {editingField === 'remark' ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    value={editValue as string}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入项目备注信息"
                    autoSize={{ minRows: 2, maxRows: 8 }}
                    style={{ width: '100%' }}
                    maxLength={2000}
                    showCount
                  />
                  <Space style={{ alignSelf: 'flex-end' }}>
                    <Button type="primary" size="small" onClick={handleFieldSave}>
                      保存
                    </Button>
                    <Button size="small" onClick={handleFieldCancel}>
                      取消
                    </Button>
                  </Space>
                </Space>
              ) : (
                <div>
                  {project.remark ? (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      width: '100%',
                      minHeight: '40px'
                    }}>
                      <div>
                        {project.remark}
                      </div>
                      {!isAdmin && (
                        <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', marginTop: '4px' }}>
                          仅管理员可编辑
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '12px 16px', 
                      borderRadius: '6px',
                      border: '1px dashed #d9d9d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      backgroundColor: '#fafafa',
                      width: '100%'
                    }}>
                      <span className="empty-value" style={{ color: '#999' }}>暂无备注</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        title="项目备注"
        open={remarkModalVisible}
        onOk={handleRemarkSave}
        onCancel={() => setRemarkModalVisible(false)}
        width={600}
      >
        <TextArea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="请输入项目备注信息，如鉴权账号、测试环境地址等"
          autoSize={{ minRows: 6, maxRows: 12 }}
        />
      </Modal>
    </Card>
  )
}

export default ProjectHeader
