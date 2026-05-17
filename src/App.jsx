import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import AccountPage from './pages/AccountPage'
import AccountOrderPage from './pages/AccountOrderPage'
import ConstructorPage from './pages/ConstructorPage'
import Header from './components/Header/Header'

function ConstructorRoute() {
  return (
    <>
      <Header />
      <ConstructorPage />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/constructor" element={<ConstructorRoute />} />
        <Route path="/constructor/*" element={<ConstructorRoute />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/order" element={<AccountOrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}