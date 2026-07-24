import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Landing from './pages/LandingPage'
import HomePage from './pages/Dashboard/Dashboard'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import OTPVerificationPage from './pages/Auth/OTPVerificationPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import ProtectedLayout from './layouts/ProtectedLayout'
import UploadContractPage from './pages/App/UploadContractPage'
import ContractWorkspacePage from './pages/App/ContractWorkspacePage'
import CompareContractsPage from './pages/App/CompareContractsPage'
import HistoryPage from './pages/App/HistoryPage'
import ProfilePage from './pages/App/ProfilePage'
import DocumentProcessingPage from './pages/App/DocumentProcessingPage'
import AnalysisResultPage from './pages/App/AnalysisResultPage'
import ClauseViewerPage from './pages/App/ClauseViewerPage'
import ContradictionDetectionPage from './pages/App/ContradictionDetectionPage'
import RiskDashboardPage from './pages/App/RiskDashboardPage'
import ClauseRewritePage from './pages/App/ClauseRewritePage'
import LegalChatPage from './pages/App/LegalChatPage'
import KnowledgeBasePage from './pages/App/KnowledgeBasePage'
import SettingsPage from './pages/App/SettingsPage'
import NotificationsPage from './pages/App/NotificationsPage'
import HelpCenterPage from './pages/App/HelpCenterPage'

const AUTH_KEY = 'machine-counsel-auth'

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.localStorage.getItem(AUTH_KEY) === 'true'
  )
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    window.localStorage.setItem(AUTH_KEY, 'true')
    setIsAuthenticated(true)
    navigate('/app')
  }

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    navigate('/')
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            navbarProps={{
              isAuthenticated,
              onNavigate: (path) => navigate(path),
              onLogout: handleLogout,
            }}
          />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <LoginPage 
              onLogin={handleLoginSuccess} 
              onGoToRegister={() => navigate('/register')} 
              onForgotPassword={() => navigate('/forgot-password')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <RegisterPage 
              onRegister={handleLoginSuccess} 
              onGoToLogin={() => navigate('/login')} 
            />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <ForgotPasswordPage 
              onSubmit={() => navigate('/otp')} 
              onBack={() => navigate('/login')} 
            />
          )
        }
      />
      <Route
        path="/otp"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <OTPVerificationPage 
              onVerify={() => navigate('/reset-password')} 
              onBack={() => navigate('/login')} 
            />
          )
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <ResetPasswordPage 
              onReset={() => navigate('/login')} 
              onBack={() => navigate('/login')} 
            />
          )
        }
      />

      <Route
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            onNavigate={(path) => navigate(path)}
            onLogout={handleLogout}
          />
        }
      >
        <Route path="/app" element={<HomePage />} />
        <Route path="/app/upload" element={<UploadContractPage />} />
        <Route path="/app/processing" element={<DocumentProcessingPage />} />
        <Route path="/app/analysis" element={<AnalysisResultPage />} />
        <Route path="/app/workspace/:contractId" element={<ContractWorkspacePage />} />
        <Route path="/app/clause-viewer" element={<ClauseViewerPage />} />
        <Route path="/app/contradictions" element={<ContradictionDetectionPage />} />
        <Route path="/app/risk-dashboard" element={<RiskDashboardPage />} />
        <Route path="/app/clause-rewrite" element={<ClauseRewritePage />} />
        <Route path="/app/chat" element={<LegalChatPage />} />
        <Route path="/app/compare" element={<CompareContractsPage />} />
        <Route path="/app/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/app/history" element={<HistoryPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />
        <Route path="/app/help" element={<HelpCenterPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
