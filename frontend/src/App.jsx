import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import PublicContent from './pages/PublicContent.jsx'
import Register from './pages/Register.jsx'
import AdminLayout from './pages/admin/AdminShell.jsx'
import MarketplacePage from './pages/MarketplacePage.jsx'
import VehicleCategoryPage from './pages/VehicleCategoryPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import FinanceInsurancePage from './pages/FinanceInsurancePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import LegalPage from './pages/LegalPage.jsx'
import { api } from './lib/api.js'
import EnquiryModal from './components/EnquiryModal.jsx'
import { ui } from './lib/uiClasses.js'

export default function App() {
  const { pathname } = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isDashboardLoggedIn') === 'true')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const login = (name, method = 'password') => {
    localStorage.setItem('isDashboardLoggedIn', 'true')
    localStorage.setItem('dashboardUserName', name)
    setIsLoggedIn(true)
    api.post('/activity/login', {
      event: method === 'register' ? 'register' : 'login',
      method,
      username: name,
      status: 'success',
      source: 'website',
      details: method === 'register' ? 'New account registration' : 'Password login',
    }).catch(() => {})
  }
  const logout = () => {
    localStorage.removeItem('isDashboardLoggedIn')
    setIsLoggedIn(false)
  }
  const userLogin = (user) => {
    localStorage.setItem('publicUserProfile', JSON.stringify(user))
    window.dispatchEvent(new CustomEvent('public-user-change', { detail: user }))
  }
  return <div className={`app-shell ${ui.app}`}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/vehicles" element={<MarketplacePage kind="vehicles" />} />
    <Route path="/vehicles/:group" element={<VehicleCategoryPage />} />
    <Route path="/vehicles/:group/:category" element={<VehicleCategoryPage />} />
    <Route path="/compare" element={<MarketplacePage kind="compare" />} />
    <Route path="/calculators" element={<MarketplacePage kind="calculators" />} />
    <Route path="/used-cars" element={<MarketplacePage kind="used-cars" />} />
    <Route path="/spare-parts" element={<MarketplacePage kind="spare-parts" />} />
    <Route path="/spare-parts/:categorySlug" element={<MarketplacePage kind="spare-parts" />} />
    <Route path="/services" element={<MarketplacePage kind="services" />} />
    <Route path="/contact" element={<MarketplacePage kind="contact" />} />
    <Route path="/login" element={<Login onAdminLogin={login} onUserLogin={userLogin} />} />
    <Route path="/register" element={<Register onUserLogin={userLogin} />} />
    <Route path="/services/:slug" element={<PublicContent kind="content" type="service" />} />
    <Route path="/pages" element={<PublicContent kind="content" />} />
    <Route path="/pages/:slug" element={<PublicContent kind="content" />} />
    <Route path="/blog" element={<MarketplacePage kind="blog" />} />
    <Route path="/blog/:slug" element={<PublicContent kind="blogs" />} />
    <Route path="/admin" element={isLoggedIn ? <AdminLayout onLogout={logout} /> : <Navigate to="/login" replace />} />
    <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route path='/vehicles/product/:identifier' element={<ProductDetailPage kind='vehicles' />} />
    <Route path='/finance-insurance' element={<FinanceInsurancePage />} />
    <Route path='/finance-insurance/:service' element={<FinanceInsurancePage />} />
    <Route path='/spare-parts/product/:identifier' element={<ProductDetailPage kind='parts' />} />
    <Route path='/services/product/:identifier' element={<ProductDetailPage kind='services' />} />
    <Route path='/search' element={<SearchPage />} />
    <Route path='/legal/:slug' element={<LegalPage />} />
  </Routes><EnquiryModal/></div>
}
