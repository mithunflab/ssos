import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

// Pages
import HomePage from './pages/home'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import DashboardPage from './pages/dashboard'
import ClientsPage from './pages/clients'
import ClientDetailPage from './pages/clients/[id]'
import NewClientPage from './pages/clients/new'
import MeetingsPage from './pages/meetings'
import SettingsPage from './pages/settings'
import DiagnosticsPage from './pages/diagnostics'
import DebugPage from './pages/debug'
import AuthCallbackPage from './pages/auth/callback'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<NewClientPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App
