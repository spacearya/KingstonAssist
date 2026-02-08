import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import DiscoveryPage from './pages/DiscoveryPage'
import PartnerPage from './pages/PartnerPage'
import SuccessPage from './pages/SuccessPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
<Route path="/partner" element={<PartnerPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
