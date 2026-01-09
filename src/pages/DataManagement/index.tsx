import { useState } from 'react'
import { Card, Tabs } from 'antd'
import { ImportOutlined, FileTextOutlined } from '@ant-design/icons'
import SmartParser from '../../components/SmartParser'
import ImportExport from '../../components/ImportExport'
import './index.css'

function DataManagement() {
  const [activeTab, setActiveTab] = useState('parse')

  const tabItems = [
    {
      key: 'parse',
      label: (
        <span>
          <FileTextOutlined /> 智能解析
        </span>
      ),
      children: <SmartParser />,
    },
    {
      key: 'import-export',
      label: (
        <span>
          <ImportOutlined /> 导入导出
        </span>
      ),
      children: <ImportExport />,
    },
  ]

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  return (
    <div className="data-management">
      <Card title="数据管理" className="data-card">
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={handleTabChange}
          size="large"
          className="data-tabs"
        />
      </Card>
    </div>
  )
}

export default DataManagement