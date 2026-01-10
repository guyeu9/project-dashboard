import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CustomLayout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import DataManagement from './pages/DataManagement'
import ResourceSchedule from './pages/ResourceSchedule'
import ProjectManagement from './pages/ProjectManagement'
import SmartParserPage from './pages/SmartParser'
import SettingsPage from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <CustomLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/smart-parser" element={<SmartParserPage />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/resource-schedule" element={<ResourceSchedule />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </CustomLayout>
    </BrowserRouter>
  )
}

export default App
