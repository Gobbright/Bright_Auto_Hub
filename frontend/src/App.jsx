import { useEffect, useRef, useState } from 'react'
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
import CalculatorsPage from './pages/CalculatorsPage.jsx'
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
  if (pathname === '/calculators') return 'Tools & Calculators'
  if (pathname === '/used-vehicles' || pathname === '/used-cars') return 'Used Vehicles'
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
  if (pathname.startsWith('/calculators/')) return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Tools & Calculators')
  if (pathname.startsWith('/legal/')) return 'Legal Page'
  return toTitleCase(pathname.split('/').filter(Boolean).at(-1) || 'Home')
}
export default function App() {
  const { pathname, search } = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isDashboardLoggedIn') === 'true')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const trackerRef = useRef({ sessionId: '', pagePath: '', pageTitle: '', pageUrl: '', startedAt: 0, clicks: 0, enabled: false })
  const readTrackingUser = () => {
    try {
      const profile = JSON.parse(window.localStorage.getItem('publicUserProfile') || '{}')
      if (profile?.name || profile?.email) return { name: profile.name || profile.email, email: profile.email || '' }
    } catch {
      // Continue with dashboard or guest data when profile storage is unavailable.
    }
    const dashboardName = window.localStorage.getItem('dashboardUserName') || ''
    return { name: dashboardName || 'Guest', email: '' }
  }
  const trackingSessionId = () => {
    try {
      const existing = window.sessionStorage.getItem('goauto:website-session')
      if (existing) return existing
      const created = window.crypto?.randomUUID ? window.crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
      window.sessionStorage.setItem('goauto:website-session', created)
      return created
    } catch {
      return `session-${Date.now()}`
    }
  }
  const sendWebsiteActivity = (payload, preferBeacon = false) => {
    const body = JSON.stringify({ source: 'website', ...payload })
    if (preferBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon('/api/website-activities/track', blob)) return Promise.resolve()
    }
    return api.post('/website-activities/track', JSON.parse(body)).catch(() => {})
  }
  const finishWebsitePage = (preferBeacon = false) => {
    const current = trackerRef.current
    if (!current.enabled || !current.startedAt) return
    const endedAt = new Date()
    const durationSeconds = Math.max(1, Math.round((endedAt.getTime() - current.startedAt) / 1000))
    const user = readTrackingUser()
    sendWebsiteActivity({
      event: 'page-duration',
      sessionId: current.sessionId,
      userName: user.name,
      userEmail: user.email,
      pageTitle: current.pageTitle,
      pageUrl: current.pageUrl,
      pagePath: current.pagePath,
      durationSeconds,
      clickCount: current.clicks,
      startedAt: new Date(current.startedAt).toISOString(),
      endedAt: endedAt.toISOString(),
      referrer: document.referrer || '',
      details: `Spent ${durationSeconds}s and clicked ${current.clicks} item(s).`,
    }, preferBeacon)
    trackerRef.current = { ...current, startedAt: 0, clicks: 0 }
  }
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/dashboard') return undefined
    let cancelled = false
    const startTracking = async () => {
      try {
        const setting = await api.get('/website-activities/settings')
        if (cancelled || !setting.enabled) {
          trackerRef.current = { ...trackerRef.current, enabled: false, startedAt: 0, clicks: 0 }
          return
        }
        const user = readTrackingUser()
        const pageTitle = stripSiteSuffix(document.title) || pageLabelForPath(pathname)
        const pagePath = `${window.location.pathname}${window.location.search}`
        const sessionId = trackingSessionId()
        trackerRef.current = { enabled: true, sessionId, pagePath, pageTitle, pageUrl: window.location.href, startedAt: Date.now(), clicks: 0 }
        await sendWebsiteActivity({
          event: 'pageview',
          sessionId,
          userName: user.name,
          userEmail: user.email,
          pageTitle,
          pageUrl: window.location.href,
          pagePath,
          referrer: document.referrer || '',
          details: pageLabelForPath(pathname),
        })
      } catch {
        trackerRef.current = { ...trackerRef.current, enabled: false, startedAt: 0, clicks: 0 }
      }
    }
    const handlePageHide = () => finishWebsitePage(true)
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') finishWebsitePage(true) }
    startTracking()
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      cancelled = true
      finishWebsitePage(true)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname, search])
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/dashboard') return undefined
    const handleWebsiteClick = (event) => {
      const current = trackerRef.current
      if (!current.enabled) return
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

      const user = readTrackingUser()
      const nextClicks = current.clicks + 1
      trackerRef.current = { ...current, clicks: nextClicks }
      sendWebsiteActivity({
        event: 'click',
        sessionId: current.sessionId,
        userName: user.name,
        userEmail: user.email,
        pageTitle: current.pageTitle || stripSiteSuffix(document.title) || pageLabelForPath(pathname),
        pageUrl: window.location.href,
        pagePath: current.pagePath || `${window.location.pathname}${window.location.search}`,
        action: tagName === 'a' ? 'link' : 'button',
        target,
        clickCount: nextClicks,
        referrer: document.referrer || '',
        details: clickedElement.getAttribute('href') || clickedElement.getAttribute('type') || '',
      })
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
    <Route path="/calculators" element={<CalculatorsPage />} />
    <Route path="/calculators/:calculator" element={<CalculatorsPage />} />
    <Route path="/used-vehicles" element={<MarketplacePage kind="used-vehicles" />} />
    <Route path="/used-cars" element={<Navigate to="/used-vehicles" replace />} />
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
    <Route path="/admin/*" element={isLoggedIn ? <AdminLayout onLogout={logout} /> : <Navigate to="/login" replace />} />
    <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
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
