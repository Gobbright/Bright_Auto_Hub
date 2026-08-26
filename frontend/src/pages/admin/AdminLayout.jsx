import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'
import Dashboard from './Dashboard.jsx'
import ResourceManager from './ResourceManager.jsx'
import StorageManager from './StorageManager.jsx'
import StorageUsage from './StorageUsage.jsx'
import WebsiteContentManager from './WebsiteContentManager.jsx'
import { activityConfig, blogConfig, brandConfig, enquiryConfig, mainCategoryConfig, partConfig, partSubcategoryConfig, serviceConfig, serviceSubcategoryConfig, vehicleCategoryConfig, vehicleConfig, vehicleSubcategoryConfig } from './resourceConfigs.js'

const navigation = [
  { label: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'enquiries', label: 'Enquiries', icon: 'inbox' },
  ] },
  { label: 'Catalogue', items: [
    { id: 'categories', label: 'Categories', icon: 'category', children: [
      { id: 'main-categories', label: 'Main Categories' },
      { id: 'vehicle-categories', label: 'Vehicle Categories' },
      { id: 'vehicle-subcategories', label: 'Vehicle Sub-categories' },
      { id: 'part-subcategories', label: 'Spare Part Sub-categories' },
      { id: 'service-subcategories', label: 'Service Sub-categories' },
    ] },
    { id: 'vehicles', label: 'Vehicles', icon: 'vehicle' },
    { id: 'parts', label: 'Spare Parts', icon: 'parts' },
    { id: 'services', label: 'Services', icon: 'service' },
    { id: 'brands', label: 'Brands', icon: 'brand' },
  ] },
  { label: 'Website content', items: [
    { id: 'website-content', label: 'Website Content', icon: 'page' },
    { id: 'blogs', label: 'Blog Posts', icon: 'blog' },
  ] },
  { label: 'System', items: [
    { id: 'activities', label: 'Login Activity', icon: 'activity' },
    { id: 'storage', label: 'Storage', icon: 'storage', children: [
      { id: 'storage-images', label: 'Image Gallery' },
      { id: 'storage-usage', label: 'Storage & Collections' },
    ] },
  ] },
]

const pageMeta = {
  dashboard: ['Dashboard', 'Overview of your GoAuto website'],
  brands: ['Brands', 'Manage vehicle manufacturers'],
  'main-categories': ['Main Categories', 'Manage only top-level website categories'],
  'vehicle-categories': ['Vehicle Categories', 'Manage the six primary public vehicle groups'],
  'vehicle-subcategories': ['Vehicle Sub-categories', 'Manage vehicle sub-category hierarchy'],
  'part-subcategories': ['Spare Part Sub-categories', 'Manage spare-part sub-category hierarchy'],
  'service-subcategories': ['Service Sub-categories', 'Manage service sub-category hierarchy'],
  vehicles: ['Vehicles', 'Manage every vehicle listing'],
  'website-content': ['Website Content', 'View and edit all public page content in one place'],
  blogs: ['Blog Posts', 'Manage articles and publishing'],
  parts: ['Spare Parts', 'Manage products, pricing and stock'],
  services: ['Vehicle Services', 'Manage service packages and bookings'],
  enquiries: ['Enquiries', 'Manage customer messages and leads'],
  activities: ['Login Activity', 'View website login, failed attempt and logout history'],
  'storage-images': ['Image Gallery', 'Manage every image stored in MongoDB GridFS'],
  'storage-usage': ['Storage & Collections', 'View website assets, GridFS and every MongoDB collection'],
}

const configs = { brands: brandConfig, 'main-categories': mainCategoryConfig, 'vehicle-categories': vehicleCategoryConfig, 'vehicle-subcategories': vehicleSubcategoryConfig, 'part-subcategories': partSubcategoryConfig, 'service-subcategories': serviceSubcategoryConfig, vehicles: vehicleConfig, blogs: blogConfig, parts: partConfig, services: serviceConfig, enquiries: enquiryConfig, activities: activityConfig, 'website-content': { noCreate: true }, 'storage-images': { singular: 'Image' }, 'storage-usage': { noCreate: true } }

const countKeys = {
  categories: 'categories',
  'main-categories': 'mainCategories',
  'vehicle-categories': 'vehicleCategories',
  'vehicle-subcategories': 'vehicleSubCategories',
  'part-subcategories': 'partSubCategories',
  'service-subcategories': 'serviceSubCategories',
  vehicles: 'vehicles',
  parts: 'parts',
  services: 'services',
  brands: 'brands',
  'website-content': 'websiteContent',
  blogs: 'blogs',
  enquiries: 'enquiries',
  activities: 'activities',
  storage: 'storage',
  'storage-images': 'storage',
  'storage-usage': 'storageCollections',
}

const readProfile = () => {
  try { return JSON.parse(localStorage.getItem('dashboardProfile') || '{}') }
  catch { return {} }
}

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate()
  const saved = readProfile()
  const [profile, setProfile] = useState({
    name: saved.name || localStorage.getItem('dashboardUserName') || 'Admin',
    email: saved.email || 'admin@goauto.in',
    phone: saved.phone || '+91 98765 43210',
    role: saved.role || 'Administrator',
  })
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openTrees, setOpenTrees] = useState({ categories: true, storage: true })
  const [accountOpen, setAccountOpen] = useState(false)
  const [openTokens, setOpenTokens] = useState({})
  const [dashboardRefresh, setDashboardRefresh] = useState(0)
  const [navRefresh, setNavRefresh] = useState(0)
  const [navData, setNavData] = useState({ counts: {}, notifications: {} })

  useEffect(() => {
    api.get('/dashboard').then((data) => setNavData({ counts: data.counts || {}, notifications: data.notifications || {} })).catch(() => {})
  }, [activePage, dashboardRefresh, navRefresh])

  useEffect(() => {
    if (!sidebarOpen && !accountOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setSidebarOpen(false)
      setAccountOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [sidebarOpen, accountOpen])

  const navCount = (id) => {
    const key = countKeys[id]
    return key ? navData.counts[key] : null
  }
  const countLabel = (id) => Number(navCount(id) || 0) > 999 ? '999+' : String(navCount(id) ?? 0)

  const selectPage = (page, openCreate = false) => {
    setActivePage(page)
    setSidebarOpen(false)
    if (openCreate) setOpenTokens((current) => ({ ...current, [page]: (current[page] || 0) + 1 }))
  }

  const saveProfile = (event) => {
    event.preventDefault()
    localStorage.setItem('dashboardProfile', JSON.stringify(profile))
    localStorage.setItem('dashboardUserName', profile.name)
    setAccountOpen(false)
  }

  const logout = () => {
    api.post('/activity/login', { event: 'logout', method: 'session', username: profile.name, status: 'success', source: 'admin', details: 'Admin profile logout' }).catch(() => {})
    onLogout()
    navigate('/', { replace: true })
  }

  return (
    <section className="goauto-admin">
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`goauto-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="goauto-brand">
          <span className="goauto-logo"><i />G</span>
          <div><strong>GoAuto</strong><small>Admin Console</small></div>
          <button className="mobile-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><AdminIcon name="close" /></button>
        </div>

        <nav className="goauto-nav" aria-label="Admin navigation">
          {navigation.map((section) => (
            <div className="nav-section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => item.children ? (
                <div className='nav-tree' key={item.id}>
                  <button className={item.children.some((child) => child.id === activePage) ? 'active parent-active' : ''} type='button' data-label={item.label} aria-expanded={Boolean(openTrees[item.id])} onClick={() => setOpenTrees((current) => ({ ...current, [item.id]: !current[item.id] }))}>
                    <span><AdminIcon name={item.icon}/></span>{item.label}<em className='nav-count'>{countLabel(item.id)}</em><b className={openTrees[item.id] ? 'nav-caret open' : 'nav-caret'}>⌄</b>
                  </button>
                  {openTrees[item.id] && <div className='nav-submenu'>{item.children.map((child) => <button className={activePage === child.id ? 'active' : ''} type='button' key={child.id} data-label={child.label} onClick={() => selectPage(child.id)}>{child.label}<em className='nav-count'>{countLabel(child.id)}</em>{activePage === child.id && <i/>}</button>)}</div>}
                </div>
              ) : (
                <button className={activePage === item.id ? 'active' : ''} type="button" key={item.id} data-label={item.label} aria-label={item.label} onClick={() => selectPage(item.id)}>
                  <span><AdminIcon name={item.icon} /></span>{item.label}{navCount(item.id) !== null && <em className={navData.notifications[item.id] ? 'nav-count alert' : 'nav-count'}>{countLabel(item.id)}</em>}{activePage === item.id && <i />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <span>{profile.name.charAt(0).toUpperCase()}</span>
          <button type="button" onClick={() => setAccountOpen(true)}><strong>{profile.name}</strong><small>{profile.role}</small></button>
        </div>
      </aside>

      <main className="goauto-main">
        <header className="goauto-topbar">
          <div className="topbar-title">
            <button className="menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><AdminIcon name="menu" size={21} /></button>
            <div><h1>{pageMeta[activePage][0]}</h1><p>{pageMeta[activePage][1]}</p></div>
          </div>
          <div className="topbar-actions">
            {activePage === 'dashboard' ? <button className="icon-button" type="button" onClick={() => setDashboardRefresh((value) => value + 1)} aria-label="Refresh dashboard"><AdminIcon name="refresh" /></button> : !configs[activePage]?.noCreate && <button className="topbar-add" type="button" onClick={() => selectPage(activePage, true)}><AdminIcon name="plus" /> New {configs[activePage].singular}</button>}
            <button className="topbar-profile" type="button" onClick={() => setAccountOpen(true)}><span>{profile.name.charAt(0).toUpperCase()}</span><div><strong>{profile.name}</strong><small>{profile.role}</small></div></button>
          </div>
        </header>
        <div className="goauto-content">
          {activePage === 'dashboard'
            ? <Dashboard refreshKey={dashboardRefresh} onNavigate={selectPage} />
            : activePage === 'storage-images'
              ? <StorageManager openToken={openTokens['storage-images'] || 0} onDataChange={() => setNavRefresh((value) => value + 1)} />
              : activePage === 'storage-usage'
                ? <StorageUsage />
                : activePage === 'website-content'
                  ? <WebsiteContentManager onDataChange={() => setNavRefresh((value) => value + 1)} />
                  : <ResourceManager config={configs[activePage]} openToken={openTokens[activePage] || 0} onDataChange={() => setNavRefresh((value) => value + 1)} />}
        </div>
      </main>

      {accountOpen && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAccountOpen(false)}>
          <section className="admin-modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <header><div><p className="eyebrow">Account settings</p><h2 id="profile-title">Profile details</h2></div><button type="button" onClick={() => setAccountOpen(false)} aria-label="Close"><AdminIcon name="close" /></button></header>
            <form onSubmit={saveProfile}>
              <div className="profile-hero"><span>{profile.name.charAt(0).toUpperCase()}</span><div><strong>{profile.name}</strong><p>{profile.email}</p></div></div>
              <div className="admin-form-grid">
                {[
                  ['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel'], ['role', 'Role', 'text'],
                ].map(([name, label, type]) => <div className="admin-field" key={name}><label htmlFor={`profile-${name}`}>{label}</label><input id={`profile-${name}`} type={type} value={profile[name]} required onChange={(event) => setProfile((current) => ({ ...current, [name]: event.target.value }))} /></div>)}
              </div>
              <footer><button className="admin-secondary danger-text" type="button" onClick={logout}><AdminIcon name="logout" /> Logout</button><button className="admin-primary" type="submit">Save profile</button></footer>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
