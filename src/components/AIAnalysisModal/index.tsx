import { useState, useEffect, useRef } from 'react'
import { Modal, Input, Button, Avatar, Typography, Divider, Space } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import useAIAnalysisStore from '../../store/aiStore'
import useStore from '../../store/useStore'
import { AIMessage } from '../../types'
import './index.css'

const { TextArea } = Input
const { Text } = Typography

function AIAnalysisModal() {
  const { modalVisible, messages, context, loading, closeModal, sendFollowUp } = useAIAnalysisStore()
  const { projects, tasks, analyzeProjects } = useStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (modalVisible && context && messages.length === 0) {
      analyzeProjects(projects, tasks, context)
    }
  }, [modalVisible, context])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = () => {
    if (inputValue.trim() && !loading) {
      sendFollowUp(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === 'user'
    const isSystem = message.role === 'system'

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`ai-message ${isUser ? 'user-message' : 'assistant-message'}`}
      >
        <div className="message-avatar">
          {isSystem ? (
            <Avatar icon={<LoadingOutlined spin />} className="system-avatar" />
          ) : isUser ? (
            <Avatar icon={<UserOutlined />} className="user-avatar" />
          ) : (
            <Avatar icon={<RobotOutlined />} className="assistant-avatar" />
          )}
        </div>
        <div className="message-content">
          {isSystem ? (
            <Text type="secondary">{message.content}</Text>
          ) : (
            <div className="markdown-content">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{message.content}</pre>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const getTitle = () => {
    if (context?.scope === 'single') {
      return `AI 分析 - ${context.projectName || '项目'}`
    }
    return 'AI 一键分析 - 全局项目'
  }

  return (
    <Modal
      title={getTitle()}
      open={modalVisible}
      onCancel={closeModal}
      footer={null}
      width={800}
      centered
      maskClosable={false}
      className="ai-analysis-modal"
      destroyOnHidden
    >
      <div className="ai-modal-content">
        <div className="messages-container">
          <AnimatePresence>
            {messages.map((message) => renderMessage(message))}
          </AnimatePresence>
          {loading && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ai-message assistant-message"
            >
              <div className="message-avatar">
                <Avatar icon={<LoadingOutlined spin />} className="assistant-avatar" />
              </div>
              <div className="message-content">
                <Text type="secondary">正在思考...</Text>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Divider className="input-divider" />

        <div className="input-container">
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入您的问题，按 Enter 发送..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              className="ai-input"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              className="send-button"
            >
              发送
            </Button>
          </Space.Compact>
        </div>
      </div>
    </Modal>
  )
}

export default AIAnalysisModal
