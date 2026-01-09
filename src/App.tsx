import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CustomLayout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import DataManagement from './pages/DataManagement'
import ResourceSchedule from './pages/ResourceSchedule'
import ProjectManagement from './pages/ProjectManagement'

function App() {
  return (
    <BrowserRouter>
      <CustomLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/resource-schedule" element={<ResourceSchedule />} />
          <Route path="/project-management" element={<ProjectManagement />} />
        </Routes>
      </CustomLayout>
    </BrowserRouter>
  )
}

export default App