import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/LandingUIKit'
import AuthPage from './pages/AuthPage'
import AccountPage from './pages/AccountUIKitPage'
import AccountOrderPage from './pages/AccountOrderPage'
import ConstructorPage from './pages/ConstructorUIKitPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/constructor" element={<ConstructorPage />} />
        <Route path="/constructor/*" element={<ConstructorPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/order" element={<AccountOrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
