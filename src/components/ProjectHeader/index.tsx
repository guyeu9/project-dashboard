import { useState } from 'react'
import { Card, Row, Col, Tag, Input, Space, Modal, message, Button } from 'antd'
import { EditOutlined, LinkOutlined, UserOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons'
import { Project } from '../../types'
import './index.css'

const { TextArea } = Input

interface ProjectHeaderProps {
  project: Project
}

function ProjectHeader({ project }: ProjectHeaderProps) {
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState(project.name)
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

  const handleRemarkView = () => {
    setRemarkModalVisible(true)
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

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 合作方
            </div>
            <div className="info-value">
              {project.partners.map((partner: string, index: number) => (
                <Tag key={index} color="blue" style={{ margin: '4px 4px 0 0' }}>
                  {partner}
                </Tag>
              ))}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <TeamOutlined /> 开发人员
            </div>
            <div className="info-value">
              {project.developers.map((dev: string, index: number) => (
                <Tag key={index} color="green" style={{ margin: '4px 4px 0 0' }}>
                  {dev}
                </Tag>
              ))}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <TeamOutlined /> 测试人员
            </div>
            <div className="info-value">
              {project.testers.map((tester: string, index: number) => (
                <Tag key={index} color="orange" style={{ margin: '4px 4px 0 0' }}>
                  {tester}
                </Tag>
              ))}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className="info-section">
            <div className="info-label">
              <UserOutlined /> 负责人
            </div>
            <div className="info-value">
              <Tag color="purple">{project.owner}</Tag>
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

        <Col span={24}>
          <div className="info-section">
            <div className="info-label">
              <FileTextOutlined /> 备注
            </div>
            <div className="info-value">
              {project.remark ? (
                <Button type="link" onClick={handleRemarkView}>
                  查看备注
                </Button>
              ) : (
                <span className="empty-value">暂无备注</span>
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