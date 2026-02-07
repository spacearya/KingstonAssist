import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import HomePage from './pages/HomePage'
import DiscoveryPage from './pages/DiscoveryPage'
import PartnerPage from './pages/PartnerPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
