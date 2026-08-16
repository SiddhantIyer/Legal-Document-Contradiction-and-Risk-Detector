import { useState, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { getMe, getToken, removeToken } from './services/api'
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
import KnowledgeBasePage from './pages/App/KnowledgeBasePage'
import HistoryPage from './pages/App/HistoryPage'
import ProfilePage from './pages/App/ProfilePage'

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // On mount, check if we have a valid token and restore the session
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getMe()
        setUser(data.user)
        setIsAuthenticated(true)
      } catch (error) {
        // Token is invalid or expired — clear it
        removeToken()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    navigate('/app')
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
    setIsAuthenticated(false)
    navigate('/')
  }

  // Show nothing while validating the session token on page load
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--floral-white, #fffcf2)',
        color: 'var(--carbon-black, #252422)',
        fontSize: '1.1rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        Loading...
      </div>
    )
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
        <Route path="/app/workspace/:contractId" element={<ContractWorkspacePage />} />
        <Route path="/app/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/app/history" element={<HistoryPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
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
