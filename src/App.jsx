import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import AccountPage from './pages/AccountPage'
import AccountOrderPage from './pages/AccountOrderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/order" element={<AccountOrderPage />} />
      </Routes>
    </BrowserRouter>
  )
}
