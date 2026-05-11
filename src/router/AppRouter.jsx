import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage.jsx';
import ConstructorPage from '../pages/Constructor/ConstructorPage.jsx';
import AuthPage from '../pages/Auth/AuthPage.jsx';
import AccountPage from '../pages/Account/AccountPage.jsx';
import AccountOrderPage from '../pages/AccountOrder/AccountOrderPage.jsx';

export default function AppRouter(){
  return <Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/constructor" element={<ConstructorPage/>}/>
    <Route path="/auth" element={<AuthPage/>}/>
    <Route path="/account" element={<AccountPage/>}/>
    <Route path="/account/order/:id" element={<AccountOrderPage/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
