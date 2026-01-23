import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import CustomLayout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import DataManagement from './pages/DataManagement'
import ResourceSchedule from './pages/ResourceSchedule'
import ProjectManagement from './pages/ProjectManagement'
import SmartParserPage from './pages/SmartParser'
import SettingsPage from './pages/Settings'
import UserGuidePage from './pages/UserGuide'
import useAIAnalysisStore from './store/aiStore'

function App() {
  const initializeAIStore = useAIAnalysisStore(state => state.initialize)

  useEffect(() => {
    // 初始化AI Store，从数据库加载配置
    initializeAIStore()
  }, [initializeAIStore])

  // 设置 dayjs 为中文
  dayjs.locale('zh-cn')

  return (
    <BrowserRouter>
      <ConfigProvider locale={zhCN}>
        <CustomLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/smart-parser" element={<SmartParserPage />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/resource-schedule" element={<ResourceSchedule />} />
            <Route path="/project-management" element={<ProjectManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/user-guide" element={<UserGuidePage />} />
          </Routes>
        </CustomLayout>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App
