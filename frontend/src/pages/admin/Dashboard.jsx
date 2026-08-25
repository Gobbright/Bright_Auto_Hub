import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const cards = [
  { key: 'vehicles', label: 'Vehicles', icon: 'vehicle', color: 'blue', page: 'vehicles' },
  { key: 'services', label: 'Services', icon: 'service', color: 'green', page: 'services' },
  { key: 'parts', label: 'Spare parts', icon: 'parts', color: 'orange', page: 'parts' },
  { key: 'enquiries', label: 'Enquiries', icon: 'inbox', color: 'pink', page: 'enquiries' },
  { key: 'brands', label: 'Brands', icon: 'brand', color: 'violet', page: 'brands' },
  { key: 'categories', label: 'Categories', icon: 'category', color: 'orange', page: 'categories' },
  { key: 'blogs', label: 'Blog posts', icon: 'blog', color: 'pink', page: 'blogs' },
  { key: 'content', label: 'Website pages', icon: 'page', color: 'green', page: 'content' },
]

export default function Dashboard({ onNavigate, refreshKey = 0 }) {
  const [data, setData] = useState({ counts: {}, summary: {}, recentVehicles: [], recentBlogs: [], recentServices: [], recentParts: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/dashboard')
      .then((result) => active && setData(result))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [refreshKey])

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div><p className="eyebrow">GoAuto control centre</p><h2>Everything is ready to manage.</h2><p>Vehicles, services, pages and stories—all controlled from this single admin panel.</p></div>
        <div className="dashboard-actions"><button className="admin-primary" type="button" onClick={() => onNavigate('vehicles', true)}><AdminIcon name="plus" /> Add vehicle</button><button className="admin-secondary" type="button" onClick={() => onNavigate('services', true)}>Add service</button><button className="admin-secondary" type="button" onClick={() => onNavigate('parts', true)}>Add part</button></div>
      </div>

      <section className='operations-strip'>
        <div><span>Published vehicles</span><strong>{loading ? '—' : data.summary.activeVehicles || 0}</strong><small>Visible on website</small></div>
        <div><span>Active services</span><strong>{loading ? '—' : data.summary.activeServices || 0}</strong><small>Ready for enquiries</small></div>
        <div><span>Active parts</span><strong>{loading ? '—' : data.summary.activeParts || 0}</strong><small>Available products</small></div>
        <div className={data.summary.lowStockParts ? 'needs-attention' : ''}><span>Low stock</span><strong>{loading ? '—' : data.summary.lowStockParts || 0}</strong><small>5 units or fewer</small></div>
        <div><span>Inventory value</span><strong>{loading ? '—' : `₹${Number(data.summary.inventoryValue || 0).toLocaleString('en-IN')}`}</strong><small>Parts stock value</small></div>
      </section>

      {error && <div className="admin-notice error">{error}. Start the backend to view live MongoDB data.</div>}

      <div className="stat-grid">
        {cards.map((card) => (
          <button className="stat-card" type="button" key={card.key} onClick={() => onNavigate(card.page)}>
            <span className={`stat-icon ${card.color}`}><AdminIcon name={card.icon} size={22} /></span>
            <span><small>{card.label}</small><strong>{loading ? '—' : data.counts[card.key] || 0}</strong></span>
            <i>View →</i>
          </button>
        ))}
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <header><div><h3>Recent vehicles</h3><p>Latest catalogue additions</p></div><button onClick={() => onNavigate('vehicles')}>View all</button></header>
          <div className="activity-list">
            {data.recentVehicles.length ? data.recentVehicles.map((vehicle) => (
              <div className="activity-item" key={vehicle._id}>
                <span className="activity-avatar vehicle">{vehicle.name[0]}</span>
                <div><strong>{vehicle.name}</strong><p>{vehicle.brand?.name || 'No brand'} · {vehicle.category?.name || 'No category'}</p></div>
                <span className={`status-chip ${vehicle.status}`}>{vehicle.status}</span>
              </div>
            )) : <div className="mini-empty">No vehicles added yet.</div>}
          </div>
        </section>

        <section className="dashboard-panel">
          <header><div><h3>Recent services</h3><p>Latest service packages</p></div><button onClick={() => onNavigate('services')}>View all</button></header>
          <div className="activity-list">
            {data.recentServices.length ? data.recentServices.map((service) => (
              <div className="activity-item" key={service._id}>
                <span className="activity-avatar service"><AdminIcon name="service" /></span>
                <div><strong>{service.name}</strong><p>{service.category} · From ₹{Number(service.price || 0).toLocaleString('en-IN')}</p></div>
                <span className={`status-chip ${service.status}`}>{service.status}</span>
              </div>
            )) : <div className="mini-empty">No services added yet.</div>}
          </div>
        </section>

        <section className="dashboard-panel">
          <header><div><h3>Parts inventory</h3><p>Latest spare parts and stock</p></div><button onClick={() => onNavigate('parts')}>View all</button></header>
          <div className="activity-list">
            {data.recentParts.length ? data.recentParts.map((part) => (
              <div className="activity-item" key={part._id}>
                <span className="activity-avatar part"><AdminIcon name="parts" /></span>
                <div><strong>{part.name}</strong><p>{part.category} · {part.stock} in stock</p></div>
                <span className={`stock-chip ${part.stock <= 5 ? 'low' : ''}`}>{part.stock <= 5 ? 'Low stock' : 'In stock'}</span>
              </div>
            )) : <div className="mini-empty">No spare parts added yet.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}
