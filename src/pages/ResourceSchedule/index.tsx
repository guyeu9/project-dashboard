import { useState, useMemo } from 'react'
import { Spin } from 'antd'
import useStore from '../../store/useStore'
import ResourceHeatmap from '../../components/ResourceHeatmap'

function ResourceSchedule() {
  const { tasks, projects } = useStore()
  const [loading] = useState(false)

  const activeTasks = useMemo(() => {
    return tasks.filter(task => {
      const project = projects.find(p => p.id === task.projectId)
      return project
    })
  }, [tasks, projects])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <ResourceHeatmap tasks={activeTasks} />
    </div>
  )
}

export default ResourceSchedule
