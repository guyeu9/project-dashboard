import SmartParser from '../../components/SmartParser'
import ErrorBoundary from '../../components/ErrorBoundary'
import './index.css'

function SmartParserPage() {
  return (
    <div className="smart-parser-page">
      <ErrorBoundary>
        <SmartParser />
      </ErrorBoundary>
    </div>
  )
}

export default SmartParserPage