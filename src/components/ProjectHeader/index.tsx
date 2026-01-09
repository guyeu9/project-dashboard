import { useState } from 'react'
import { Card, Row, Col, Tag, Input, Space, Modal, message, Button, Select } from 'antd'
import { EditOutlined, LinkOutlined, UserOutlined, TeamOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Project } from '../../types'
import './index.css'

const { Option } = Select

const { TextArea } = Input

interface ProjectHeaderProps {
  project: Project
  riskStatus: 'normal' | 'risk' | 'delayed'
  onRiskStatusChange: (status: 'normal' | 'risk' | 'delayed') => void
  onProjectUpdate: (field: string, value: any) => void
}

function ProjectHeader({ project, riskStatus, onRiskStatusChange, onProjectUpdate }: ProjectHeaderProps) {
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState(project.name)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [remarkModalVisible, setRemarkModalVisible] = useState(false)
  const [remark, setRemark] = useState(project.remark || '')

  const handleNameEdit = () => {
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
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleFieldSave = () => {
    let value: any = editValue
    
    // 处理数组类型的字段
    if (editingField === 'partners' || editingField === 'developers' || editingField === 'testers') {
      value = editValue.split(',').map((item: string) => item.trim()).filter((item: string) => item)
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
    setRemarkModalVisible(false)
    message.success('备注已更新')
  }

  return (
    <Card className="project-header">
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
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={handleNameEdit}
                  size="small"
                >
                  编辑
                </Button>
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
                    value={editValue}
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
                <div onClick={() => handleFieldEdit('partners', project.partners.join(','))} style={{ cursor: 'pointer' }}>
                  {project.partners.map((partner: string, index: number) => (
                    <Tag key={index} color="blue" style={{ margin: '4px 4px 0 0' }}>
                      {partner}
                    </Tag>
                  ))}
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
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
                    value={editValue}
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
                <div onClick={() => handleFieldEdit('developers', project.developers.join(','))} style={{ cursor: 'pointer' }}>
                  {project.developers.map((dev: string, index: number) => (
                    <Tag key={index} color="green" style={{ margin: '4px 4px 0 0' }}>
                      {dev}
                    </Tag>
                  ))}
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
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
                    value={editValue}
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
                <div onClick={() => handleFieldEdit('testers', project.testers.join(','))} style={{ cursor: 'pointer' }}>
                  {project.testers.map((tester: string, index: number) => (
                    <Tag key={index} color="orange" style={{ margin: '4px 4px 0 0' }}>
                      {tester}
                    </Tag>
                  ))}
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
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
                    value={editValue}
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
                <div onClick={() => handleFieldEdit('owner', project.owner)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Tag color="purple">{project.owner}</Tag>
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="info-section">
            <div className="info-label">
              <ExclamationCircleOutlined /> 项目风险
            </div>
            <div className="info-value">
              <Select
                value={riskStatus}
                onChange={onRiskStatusChange}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="normal">
                  <Tag color="green">正常</Tag>
                </Option>
                <Option value="risk">
                  <Tag color="orange">风险</Tag>
                </Option>
                <Option value="delayed">
                  <Tag color="red">延期</Tag>
                </Option>
              </Select>
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
                project.chatGroupLinks.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-link"
                  >
                    <Tag color="cyan">群组 {index + 1}</Tag>
                  </a>
                ))
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
            <div className="info-label">
              <FileTextOutlined /> 备注
            </div>
            <div className="info-value">
              {editingField === 'remark' ? (
                <Space>
                  <TextArea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="请输入项目备注信息"
                    autoSize={{ minRows: 2, maxRows: 4 }}
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
                <div onClick={() => handleFieldEdit('remark', project.remark || '')} style={{ cursor: 'pointer' }}>
                  {project.remark ? (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {project.remark}
                    </div>
                  ) : (
                    <span className="empty-value">暂无备注，点击添加</span>
                  )}
                  <Button type="link" size="small" icon={<EditOutlined />}>
                    编辑
                  </Button>
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