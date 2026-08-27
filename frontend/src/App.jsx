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

const stripSiteSuffix = (value = '') => value.toString().replace(/\s+\|\s+Bright Auto Hub.*$/i, '').trim()
const toTitleCase = (value = '') => value.toString().replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim()

const pageLabelForPath = (pathname = '') => {
  if (pathname === '/') return 'Home'
  if (pathname === '/vehicles') return 'Vehicles'
  if (pathname === '/compare') return 'Compare Vehicles'
  if (pathname === '/calculators') return 'Calculators'
  if (pathname === '/used-cars') return 'Used Cars'
  if (pathname === '/spare-parts') return 'Spare Parts'
  if (pathname === '/services') return 'Services'
  if (pathname === '/contact') return 'Contact'
  if (pathname === '/blog') return 'Blog'
  if (pathname === '/pages') return 'Website Pages'
  if (pathname === '/search') return 'Search'
  if (pathname === '/finance-insurance') return 'Finance & Insurance'
  if (pathname.startsWith('/vehicles/product/')) return 'Vehicle Details'
  if (pathname.startsWith('/spare-parts/product/')) return 'Spare Part Details'
  if (pathname.startsWith('/services/product/')) return 'Service Details'
  if (pathname.startsWith('/blog/')) return 'Blog Article'
  if (pathname.startsWith('/pages/')) return 'Website Page'
  if (pathname.startsWith('/vehicles/')) return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Vehicles')
  if (pathname.startsWith('/spare-parts/')) return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Spare Parts')
  if (pathname.startsWith('/services/')) return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Services')
  if (pathname.startsWith('/finance-insurance/')) return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Finance & Insurance')
  if (pathname.startsWith('/legal/')) return 'Legal Page'
  return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Home')
}
export default function App() {
  const { pathname, search } = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isDashboardLoggedIn') === 'true')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/dashboard') return undefined
    const timer = window.setTimeout(() => {
      const pageTitle = stripSiteSuffix(document.title) || pageLabelForPath(pathname)
      const pagePath = `${window.location.pathname}${window.location.search}`
      const fingerprint = `${pagePath}|${pageTitle}`
      try {
        const existing = JSON.parse(window.sessionStorage.getItem('goauto:last-pageview') || 'null')
        if (existing && existing.fingerprint === fingerprint && Date.now() - Number(existing.time || 0) < 1500) return
        window.sessionStorage.setItem('goauto:last-pageview', JSON.stringify({ fingerprint, time: Date.now() }))
      } catch {
        // Ignore storage failures and still send the event.
      }
      api.post('/website-activities/track', {
        event: 'pageview',
        pageTitle,
        pageUrl: window.location.href,
        pagePath,
        referrer: document.referrer || '',
        source: 'website',
        details: pageLabelForPath(pathname),
      }).catch(() => {})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [pathname, search])
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/dashboard') return undefined
    const handleWebsiteClick = (event) => {
      const clickedElement = event.target instanceof Element ? event.target.closest('a, button') : null
      if (!clickedElement || clickedElement.closest('[data-no-track]')) return

      const tagName = clickedElement.tagName.toLowerCase()
      const target = stripSiteSuffix(
        clickedElement.getAttribute('aria-label')
        || clickedElement.getAttribute('title')
        || clickedElement.textContent
        || clickedElement.getAttribute('href')
        || `${tagName} click`,
      )
      if (!target) return

      const pageTitle = stripSiteSuffix(document.title) || pageLabelForPath(pathname)
      const pagePath = `${window.location.pathname}${window.location.search}`
      api.post('/website-activities/track', {
        event: 'click',
        pageTitle,
        pageUrl: window.location.href,
        pagePath,
        action: tagName === 'a' ? 'link' : 'button',
        target,
        referrer: document.referrer || '',
        source: 'website',
        details: clickedElement.getAttribute('href') || clickedElement.getAttribute('type') || '',
      }).catch(() => {})
    }

    document.addEventListener('click', handleWebsiteClick, true)
    return () => document.removeEventListener('click', handleWebsiteClick, true)
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
    <Route path="/services/:slug" element={<MarketplacePage kind="services" />} />
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
