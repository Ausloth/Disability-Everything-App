import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Roster } from './pages/Roster'
import { Activities } from './pages/Activities'
import { Clients } from './pages/Clients'
import { PromptGenerator } from './pages/PromptGenerator'
import { Settings } from './pages/Settings'
import { useStore } from './store/useStore'
import { CaptchaGate } from './components/CaptchaGate'

export default function App() {
  const { user } = useStore() // We can use this later for auth walls

  return (
    <CaptchaGate>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/prompt-generator" element={<PromptGenerator />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </CaptchaGate>
  )
}
