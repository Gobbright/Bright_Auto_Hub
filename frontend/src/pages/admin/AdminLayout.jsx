import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'
import Dashboard from './Dashboard.jsx'
import AllProductsManager from './AllProductsManager.jsx'
import ResourceManager from './ResourceManager.jsx'
import StorageManager from './StorageManager.jsx'
import WebsiteContentManager from './WebsiteContentManager.jsx'
import { activityConfig, blogConfig, brandConfig, enquiryConfig, mainCategoryConfig, partConfig, partSubcategoryConfig, serviceConfig, serviceSubcategoryConfig, subCategoryConfig, vehicleCategoryConfig, vehicleConfig, usedVehicleConfig, vehicleSubcategoryConfig, websiteActivityConfig } from './resourceConfigs.js'

const navigation = [
  { label: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'enquiries', label: 'Enquiries', icon: 'inbox' },
  ] },
  { label: 'Catalog', items: [
    { id: 'catalog-categories', label: 'Main Categories', icon: 'category', children: [
      { id: 'main-categories', label: 'Parent Categories', page: 'main-categories' },
      { id: 'sub-categories', label: 'Child Categories', page: 'sub-categories' },
    ] },
    { id: 'vehicles', label: 'Vehicles', icon: 'vehicle', page: 'vehicles', children: [
      { id: 'catalog-vehicles-bikes', label: 'Bikes', page: 'vehicles', categorySlug: 'bikes', categoryName: 'Bikes', includeDescendants: true },
      { id: 'catalog-vehicles-cars', label: 'Cars', page: 'vehicles', categorySlug: 'cars', categoryName: 'Cars', includeDescendants: true },
      { id: 'catalog-vehicles-commercial', label: 'Commercial Vehicles', page: 'vehicles', categorySlug: 'commercial-vehicles', categoryName: 'Commercial Vehicles', includeDescendants: true },
      { id: 'catalog-vehicles-farm', label: 'Farm Vehicles', page: 'vehicles', categorySlug: 'farm-vehicles', categoryName: 'Farm Vehicles', includeDescendants: true },
      { id: 'catalog-vehicles-construction', label: 'Construction Vehicles', page: 'vehicles', categorySlug: 'construction-vehicles', categoryName: 'Construction Vehicles', includeDescendants: true },
      { id: 'catalog-vehicles-ev', label: 'EV Vehicles', page: 'vehicles', categorySlug: 'ev-vehicles', categoryName: 'EV Vehicles', includeDescendants: true },
      { id: 'catalog-vehicles-used', label: 'Used Vehicles', page: 'used-vehicles' },
    ] },
    { id: 'parts', label: 'Spare Parts', icon: 'parts', children: [
      { id: 'catalog-parts-all', label: 'Spare Parts', page: 'parts' },
      { id: 'catalog-parts-two-wheeler', label: 'Two Wheeler Parts', page: 'parts', categorySlug: 'two-wheeler-parts', categoryName: 'Two Wheeler Parts', includeDescendants: true },
      { id: 'catalog-parts-car', label: 'Car Parts', page: 'parts', categorySlug: 'car-parts', categoryName: 'Car Parts', includeDescendants: true },
      { id: 'catalog-parts-commercial', label: 'Commercial Parts', page: 'parts', categorySlug: 'commercial-vehicle-parts', categoryName: 'Commercial Vehicle Parts', includeDescendants: true },
      { id: 'catalog-parts-construction', label: 'Construction Parts', page: 'parts', categorySlug: 'construction-equipment-parts', categoryName: 'Construction Equipment Parts', includeDescendants: true },
      { id: 'catalog-parts-ev', label: 'EV Parts', page: 'parts', categorySlug: 'ev-vehicle-parts', categoryName: 'EV Vehicle Parts', includeDescendants: true },
      { id: 'catalog-parts-farm', label: 'Farm Parts', page: 'parts', categorySlug: 'farm-vehicle-parts', categoryName: 'Farm Vehicle Parts', includeDescendants: true },
    ] },
    { id: 'services', label: 'Services', icon: 'service', children: [
      { id: 'catalog-services-vehicle-service', label: 'Vehicle Service', page: 'services', categoryName: 'Vehicle Service' },
      { id: 'catalog-services-repair', label: 'Repair', page: 'services', categoryName: 'Repair' },
      { id: 'catalog-services-insurance', label: 'Insurance Service', page: 'services', categoryName: 'Insurance Service' },
      { id: 'catalog-services-roadside', label: 'Roadside Assistance', page: 'services', categoryName: 'Roadside Assistance' },
      { id: 'catalog-services-detailing', label: 'Detailing', page: 'services', categoryName: 'Detailing' },
    ] },
{ id: 'brands', label: 'Brands', icon: 'brand' },
  ] },
  { label: 'Website content', items: [
    { id: 'website-content', label: 'Website Content', icon: 'page' },
    { id: 'blogs', label: 'Blog Posts', icon: 'blog' },
  ] },
  { label: 'System', items: [
    { id: 'activity', label: 'Activity', icon: 'activity', children: [
      { id: 'activities', label: 'Login Activity' },
      { id: 'website-activities', label: 'Website Activity' },
    ] },
    { id: 'storage', label: 'Storage', icon: 'storage', children: [
      { id: 'storage-overall', label: 'Overall Size' },
      { id: 'storage-images', label: 'Uploaded Images' },
      { id: 'storage-backup', label: 'Import / Export' },
    ] },
  ] },
]
const pageMeta = {
  'all-products': ['Catalog', 'View catalog vehicles, spare parts and services in one place'],
  dashboard: ['Dashboard', 'Overview of your GoAuto website'],
  brands: ['Brands', 'Manage vehicle manufacturers'],
  'main-categories': ['Main Categories', 'Manage only top-level website categories'],
  'vehicle-categories': ['Vehicle Categories', 'Manage the six primary public vehicle groups'],
  'vehicle-subcategories': ['Vehicle Sub-categories', 'Manage vehicle sub-category hierarchy'],
  'sub-categories': ['Sub Categories', 'Manage all product sub-categories'],
  'part-subcategories': ['Spare Part Sub-categories', 'Manage spare-part sub-category hierarchy'],
  'service-subcategories': ['Service Sub-categories', 'Manage service sub-category hierarchy'],
  vehicles: ['Vehicles', 'Manage new vehicle listings'],
  'used-vehicles': ['Used Vehicles', 'Manage pre-owned vehicle listings'],
  'website-content': ['Website Content', 'View and edit all public page content in one place'],
  blogs: ['Blog Posts', 'Manage articles and publishing'],
  parts: ['Spare Parts', 'Manage products, pricing and stock'],
  services: ['Vehicle Services', 'Manage service packages and bookings'],
  enquiries: ['Enquiries', 'Manage customer messages and leads'],
  activities: ['Login Activity', 'View website login, failed attempt and logout history'],
  'website-activities': ['Website Activity', 'View page views and click tracking from the public website'],
  storage: ['Storage', 'Live image URLs, total storage usage and MongoDB collections in one page'],
  'storage-overall': ['Overall Size', 'Website assets, MongoDB and GridFS usage'],
  'storage-images': ['Uploaded Images', 'All input-uploaded and GridFS images'],
  'storage-backup': ['Import / Export', 'Backup and restore image/data storage'],
}

const adminPageFromPath = (pathname = '') => {
  const page = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)[0] || 'dashboard'
  return pageMeta[page] ? page : 'dashboard'
}

const adminPathForPage = (page) => `/admin/${page || 'dashboard'}`
const configs = { storage: { noCreate: true }, 'storage-overall': { noCreate: true }, 'storage-images': { singular: 'Image' }, 'storage-backup': { noCreate: true }, 'all-products': { noCreate: true }, brands: brandConfig, 'main-categories': mainCategoryConfig, 'sub-categories': subCategoryConfig, 'vehicle-categories': vehicleCategoryConfig, 'vehicle-subcategories': vehicleSubcategoryConfig, 'part-subcategories': partSubcategoryConfig, 'service-subcategories': serviceSubcategoryConfig, vehicles: vehicleConfig, 'used-vehicles': usedVehicleConfig, blogs: blogConfig, parts: partConfig, services: serviceConfig, enquiries: enquiryConfig, activities: activityConfig, 'website-activities': websiteActivityConfig, 'website-content': { noCreate: true } }

const fixedParentCategoryNames = ['Vehicles', 'Spare Parts', 'Services', 'Finance & Insurance', 'Tools & Calculators']

const countKeys = {
  categories: 'categories',
  'main-categories': 'mainCategories',
  'vehicle-categories': 'vehicleCategories',
  'vehicle-subcategories': 'vehicleSubCategories',
  'part-subcategories': 'partSubCategories',
  'service-subcategories': 'serviceSubCategories',
  vehicles: 'vehicles',
  'used-vehicles': 'vehicles',
  parts: 'parts',
  services: 'services',
  brands: 'brands',
  'website-content': 'websiteContent',
  blogs: 'blogs',
  enquiries: 'enquiries',
  activities: 'activities',
  'website-activities': 'websiteActivities',
  storage: 'storage',
  'storage-overall': 'storage',
  'storage-images': 'storage',
  'storage-backup': 'storage',
}


const productPages = new Set(['vehicles', 'used-vehicles', 'parts', 'services'])
const storagePages = new Set(['storage', 'storage-overall', 'storage-images', 'storage-backup'])
const storageTabForPage = { storage: 'overall', 'storage-overall': 'overall', 'storage-images': 'images', 'storage-backup': 'backup' }
const idOf = (value) => String(value?._id || value || '')

const leafCategoriesFor = (categories, group) => {
  const groupItems = categories.filter((item) => item.group === group && item.status === 'active' && idOf(item.parentId))
  const parentIds = new Set(categories.map((item) => idOf(item.parentId)).filter(Boolean))
  const byId = new Map(categories.map((item) => [idOf(item._id), item]))
  return groupItems
    .filter((item) => !parentIds.has(idOf(item._id)))
    .sort((a, b) => {
      const parentA = byId.get(idOf(a.parentId))?.name || ''
      const parentB = byId.get(idOf(b.parentId))?.name || ''
      return (parentA + a.name).localeCompare(parentB + b.name)
    })
    .map((item) => {
      const parent = byId.get(idOf(item.parentId))
      const parentHasParent = parent && idOf(parent.parentId)
      const label = parentHasParent ? `${parent.name} / ${item.name}` : item.name
      return { id: `${group}:${idOf(item._id)}`, label, page: group === 'Vehicles' ? 'vehicles' : group === 'Spare Parts' ? 'parts' : 'services', categoryFilter: { id: idOf(item._id), label } }
    })
}

const readProfile = () => {
  try { return JSON.parse(localStorage.getItem('dashboardProfile') || '{}') }
  catch { return {} }
}

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const saved = readProfile()
  const [profile, setProfile] = useState({
    name: saved.name || localStorage.getItem('dashboardUserName') || 'Admin',
    email: saved.email || 'admin@goauto.in',
    phone: saved.phone || '+91 98765 43210',
    role: saved.role || 'Administrator',
  })
  const [activePage, setActivePage] = useState(() => adminPageFromPath(location.pathname))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openTrees, setOpenTrees] = useState({ 'catalog-categories': true })
  const [accountOpen, setAccountOpen] = useState(false)
  const [openTokens, setOpenTokens] = useState({})
  const [dashboardRefresh, setDashboardRefresh] = useState(0)
  const [navRefresh, setNavRefresh] = useState(0)
  const [navData, setNavData] = useState({ counts: {}, notifications: {} })
  const [categories, setCategories] = useState([])
  const [activeCategoryFilters, setActiveCategoryFilters] = useState({})
  const [allProductFilter, setAllProductFilter] = useState('all')

  useEffect(() => {
    const nextPage = adminPageFromPath(location.pathname)
    setActivePage((current) => current === nextPage ? current : nextPage)
  }, [location.pathname])
  useEffect(() => {
    api.get('/dashboard').then((data) => setNavData({ counts: data.counts || {}, notifications: data.notifications || {} })).catch(() => {})
  }, [activePage, dashboardRefresh, navRefresh])

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]))
  }, [navRefresh])

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
    if (id === 'all-products') return Number(navData.counts.vehicles || 0) + Number(navData.counts.parts || 0) + Number(navData.counts.services || 0)
    if (id === 'all-products-all') return navCount('all-products')
    if (id === 'all-products-vehicles') return Number(navData.counts.vehicles || 0)
    if (id === 'all-products-parts') return Number(navData.counts.parts || 0)
    if (id === 'all-products-services') return Number(navData.counts.services || 0)
    if (id === 'catalog-categories' || id === 'main-categories') return fixedParentCategoryNames.length
    if (id === 'sub-categories') return Math.max(0, Number(navData.counts.categories || 0) - fixedParentCategoryNames.length)
    const key = countKeys[id]
    return key ? navData.counts[key] : null
  }
  const countLabel = (id) => Number(navCount(id) || 0) > 999 ? '999+' : String(navCount(id) ?? 0)

  const selectPage = (page, openCreate = false, categoryFilter = null, productFilter = null) => {
    setActivePage(page)
    if (location.pathname !== adminPathForPage(page)) navigate(adminPathForPage(page))
    setSidebarOpen(false)
    if (page === 'all-products') setAllProductFilter(productFilter || 'all')
    if (categoryFilter) {
      setActiveCategoryFilters((current) => ({ ...current, [page]: categoryFilter }))
    } else if (productPages.has(page)) {
      setActiveCategoryFilters((current) => {
        const next = { ...current }
        delete next[page]
        return next
      })
    }
    if (openCreate) setOpenTokens((current) => ({ ...current, [page]: (current[page] || 0) + 1 }))
  }

  const firstLeafCategoryId = (category) => {
    const children = categories.filter((item) => idOf(item.parentId) === idOf(category?._id))
    if (!children.length) return idOf(category?._id)
    return idOf(children.find((item) => !categories.some((entry) => idOf(entry.parentId) === idOf(item._id)))?._id || children[0]?._id || category?._id)
  }

  const categoryFilterForChild = (child) => {
    const normalizedName = String(child.categoryName || child.label || '').trim().toLowerCase()
    const normalizedSlug = String(child.categorySlug || '').trim().toLowerCase()
    const category = categories.find((item) => {
      const itemName = String(item.name || '').trim().toLowerCase()
      const itemSlug = String(item.slug || '').trim().toLowerCase()
      return (normalizedSlug && itemSlug === normalizedSlug) || itemName === normalizedName
    })
    if (!category) return null
    return { id: idOf(category._id), label: category.name, includeDescendants: Boolean(child.includeDescendants), defaultCategoryId: child.includeDescendants ? firstLeafCategoryId(category) : idOf(category._id) }
  }

  const decorateCatalogChild = (child) => {
    const categoryFilter = child.categoryName || child.categorySlug ? categoryFilterForChild(child) : child.categoryFilter
    return {
      ...child,
      ...(categoryFilter ? { categoryFilter } : {}),
      ...(child.children ? { children: child.children.map(decorateCatalogChild) } : {}),
    }
  }

  const navigationSections = useMemo(() => navigation.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const children = item.productTree ? [
        { id: `${item.id}-all`, label: item.allLabel, page: item.page, all: true },
        { id: item.manageId, label: item.manageLabel, manage: true },
        ...leafCategoriesFor(categories, item.group),
      ] : item.children
      return children ? { ...item, children: children.map(decorateCatalogChild) } : item
    }),
  })), [categories])

  const activeCategory = activeCategoryFilters[activePage]
  const activeConfig = useMemo(() => {
    const baseConfig = configs[activePage]
    if (!baseConfig || !activeCategory || !productPages.has(activePage)) return baseConfig
    const categoryField = activePage === 'vehicles' || activePage === 'used-vehicles' ? 'category' : 'categoryId'
    return {
      ...baseConfig,
      title: activeCategory.label,
      description: `Viewing ${baseConfig.title.toLowerCase()} from ${activeCategory.label}. Add, edit or delete records from this filtered view.`,
      categoryFilter: { field: categoryField, id: activeCategory.id, includeDescendants: Boolean(activeCategory.includeDescendants) },
      defaultValues: { ...(baseConfig.defaultValues || {}), [categoryField]: activeCategory.defaultCategoryId || activeCategory.id },
    }
  }, [activeCategory, activePage])
  const activeMeta = activeCategory && productPages.has(activePage)
    ? [activeCategory.label, `Filtered ${configs[activePage].title.toLowerCase()} view with add, edit and delete actions`]
    : pageMeta[activePage] || pageMeta.dashboard

  const isChildActive = (child) => {
    if (child.productFilter) return activePage === child.page && allProductFilter === child.productFilter
    if (child.categoryFilter) return activePage === child.page && activeCategoryFilters[child.page]?.id === child.categoryFilter.id
    if (child.children?.some(isChildActive)) return true
    if (child.all) return activePage === child.page && !activeCategoryFilters[child.page]
    return activePage === child.id
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
          {navigationSections.map((section) => (
            <div className="nav-section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => item.children ? (
                <div className='nav-tree' key={item.id}>
                  <button className={item.children.some(isChildActive) ? 'active parent-active' : ''} type='button' data-label={item.label} aria-expanded={Boolean(openTrees[item.id])} onClick={() => {
                      setOpenTrees((current) => current[item.id] ? {} : { [item.id]: true })
                      if (item.productTree) selectPage(item.page, false, null)
                      else if (item.page) selectPage(item.page, false, null, item.defaultFilter || null)
                    }}>
                    <span><AdminIcon name={item.icon}/></span>{item.label}<em className='nav-count'>{countLabel(item.id)}</em><b className={openTrees[item.id] ? 'nav-caret open' : 'nav-caret'}><AdminIcon name='chevronDown' size={14} /></b>
                  </button>
                  {openTrees[item.id] && <div className='nav-submenu'>{item.children.map((child) => {
                    const childCount = navCount(child.id)
                    const childActive = isChildActive(child)
                    return <Fragment key={child.id}><button className={childActive ? 'active' : ''} type='button' data-label={child.label} aria-expanded={child.children ? Boolean(openTrees[child.id]) : undefined} onClick={() => { if (child.children) setOpenTrees((current) => ({ [item.id]: true, ...(current[child.id] ? {} : { [child.id]: true }) })); selectPage(child.page || child.id, Boolean(child.add), child.categoryFilter || null, child.productFilter || null) }}>{(child.manage || child.add) && <span className='nav-sub-dot' />}{child.label}{childCount !== null && <em className='nav-count'>{countLabel(child.id)}</em>}{child.children && <b className={openTrees[child.id] ? 'nav-caret open' : 'nav-caret'}><AdminIcon name='chevronDown' size={13} /></b>}{childActive && <i/>}</button>{child.children && openTrees[child.id] && <div className='nav-submenu nested'>{child.children.map((nested) => {
                      const nestedActive = isChildActive(nested)
                      const nestedCount = navCount(nested.id)
                      return <button className={nestedActive ? 'active' : ''} type='button' key={nested.id} data-label={nested.label} onClick={() => selectPage(nested.page || nested.id, Boolean(nested.add), nested.categoryFilter || null, nested.productFilter || null)}>{nested.label}{nestedCount !== null && <em className='nav-count'>{countLabel(nested.id)}</em>}{nestedActive && <i/>}</button>
                    })}</div>}</Fragment>
                  })}</div>}
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
            <div><h1>{activeMeta[0]}</h1><p>{activeMeta[1]}</p></div>
          </div>
          <div className="topbar-actions">
            {activePage === 'dashboard' ? <button className="icon-button" type="button" onClick={() => setDashboardRefresh((value) => value + 1)} aria-label="Refresh dashboard"><AdminIcon name="refresh" /></button> : !activeConfig?.noCreate && <button className="topbar-add" type="button" onClick={() => selectPage(activePage, true, activeCategoryFilters[activePage] || null)}><AdminIcon name="plus" /> New {activeConfig.singular}</button>}
            <button className="topbar-profile" type="button" onClick={() => setAccountOpen(true)}><span>{profile.name.charAt(0).toUpperCase()}</span><div><strong>{profile.name}</strong><small>{profile.role}</small></div></button>
          </div>
        </header>
        <div className="goauto-content">
          {activePage === 'dashboard'
            ? <Dashboard refreshKey={dashboardRefresh} onNavigate={selectPage} />
            : activePage === 'all-products'
              ? <AllProductsManager initialMainCategoryFilter={allProductFilter} onNavigate={selectPage} onDataChange={() => setNavRefresh((value) => value + 1)} />
            : storagePages.has(activePage)
              ? <StorageManager initialTab={storageTabForPage[activePage] || 'overall'} openToken={openTokens[activePage] || 0} onDataChange={() => setNavRefresh((value) => value + 1)} />
              : activePage === 'website-content'
                  ? <WebsiteContentManager onDataChange={() => setNavRefresh((value) => value + 1)} />
                  : <ResourceManager config={activeConfig} openToken={openTokens[activePage] || 0} onDataChange={() => setNavRefresh((value) => value + 1)} />}
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
