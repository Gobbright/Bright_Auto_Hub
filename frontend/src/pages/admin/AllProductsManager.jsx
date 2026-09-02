import { Fragment, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const productSources = [
  { resource: 'vehicles', type: 'Vehicle', categoryField: 'category' },
  { resource: 'parts', type: 'Spare Part', categoryField: 'categoryId' },
  { resource: 'services', type: 'Service', categoryField: 'categoryId' },
]

const statusClass = (status) => `status-chip ${status || 'draft'}`
const priceLabel = (value) => Number(value || 0) > 0 ? `Rs ${Number(value).toLocaleString('en-IN')}` : '-'
const textValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ') || '-'
  return String(value)
}

const idOf = (value) => String(value?._id || value || '')
const productMainGroups = ['Vehicles', 'Spare Parts', 'Services']
const allProductMainFilterOptions = ['all', ...productMainGroups]
const mainFilterLabel = (value) => value === 'all' ? 'All Products' : value
const addProductOptions = [
  { value: 'vehicles', label: 'Vehicle', actionLabel: 'Add Vehicle', icon: 'vehicle' },
  { value: 'parts', label: 'Spare Part', actionLabel: 'Add Spare Part', icon: 'parts' },
  { value: 'services', label: 'Service', actionLabel: 'Add Service', icon: 'service' },
]


const uniqueById = (rows = []) => {
  const seen = new Set()
  return rows.filter((item) => {
    const id = idOf(item._id)
    const key = id || `${item.productType || ''}:${item.slug || ''}:${item.name || ''}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const categoryRootName = (item, field, categories) => {
  const category = item[field]
  const categoryId = idOf(category)
  const byId = new Map(categories.map((entry) => [idOf(entry._id), entry]))
  let current = byId.get(categoryId) || (category && typeof category === 'object' ? category : null)
  if (!current) return item.productType === 'Vehicle' ? 'Vehicles' : item.productType === 'Spare Part' ? 'Spare Parts' : item.productType === 'Service' ? 'Services' : 'Other'
  let parentId = current.parentId?._id || current.parentId
  const visited = new Set()
  while (parentId && !visited.has(String(parentId))) {
    visited.add(String(parentId))
    const parent = byId.get(String(parentId))
    if (!parent) break
    current = parent
    parentId = parent.parentId?._id || parent.parentId
  }
  return current.name || current.group || 'Other'
}
const categoryName = (item, field) => {
  const category = item[field]
  if (category && typeof category === 'object') return category.parentId?.name ? `${category.parentId.name} / ${category.name}` : category.name
  return item.category || '-'
}

const productRootName = (item, categories) => categoryRootName(item, item.sourceCategoryField, categories)

export default function AllProductsManager({ initialMainCategoryFilter = 'all', onNavigate, onDataChange }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [mainCategoryFilter, setMainCategoryFilter] = useState(initialMainCategoryFilter)
  const [addProductType, setAddProductType] = useState('vehicles')
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setNotice('')
    try {
      const [categoryRows, ...responses] = await Promise.all([api.get('/categories'), ...productSources.map((source) => api.get('/' + source.resource))])
      setCategories(categoryRows)
      setItems(responses.flatMap((rows, index) => rows.map((item) => ({
        ...item,
        productType: productSources[index].type,
        sourceResource: productSources[index].resource,
        sourceCategoryField: productSources[index].categoryField,
      }))))
    } catch (error) {
      setNotice(`${error.message}. Please check that the backend server is running.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setMainCategoryFilter(initialMainCategoryFilter) }, [initialMainCategoryFilter])

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return uniqueById(items).filter((item) => {
      if (typeFilter !== 'all' && item.productType !== typeFilter) return false
      const rootName = productRootName(item, categories)
      if (mainCategoryFilter !== 'all' && rootName !== mainCategoryFilter) return false
      const haystack = [item.name, item.productType, item.category, item.brand?.name || item.brand, item.brands, item.status].join(' ').toLowerCase()
      return !query || haystack.includes(query)
    })
  }, [categories, items, mainCategoryFilter, search, typeFilter])

  const counts = useMemo(() => ({
    total: items.length,
    vehicles: items.filter((item) => item.productType === 'Vehicle').length,
    parts: items.filter((item) => item.productType === 'Spare Part').length,
    services: items.filter((item) => item.productType === 'Service').length,
  }), [items])

  const mainCategoryCards = useMemo(() => allProductMainFilterOptions
    .filter((name) => name !== 'all')
    .map((name) => ({
      name,
      count: uniqueById(items).filter((item) => {
        const rootName = productRootName(item, categories)
        return rootName === name
      }).length,
    })), [categories, items])

  const productSections = useMemo(() => allProductMainFilterOptions
    .filter((name) => name !== 'all')
    .map((name) => ({
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: name,
      description: name + ' product page data',
      items: visibleItems.filter((item) => {
        const rootName = productRootName(item, categories)
        return rootName === name
      }),
    }))
    .filter((section) => mainCategoryFilter === 'all' || section.title === mainCategoryFilter), [categories, mainCategoryFilter, visibleItems])

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    setNotice('')
    try {
      await api.delete(`/${deleting.sourceResource}/${deleting._id}`)
      setItems((current) => current.filter((item) => !(item.sourceResource === deleting.sourceResource && item._id === deleting._id)))
      setDeleting(null)
      onDataChange?.()
    } catch (error) {
      setNotice(error.message)
    } finally {
      setDeletingBusy(false)
    }
  }

  const renderRows = (rows) => rows.map((item) => (
    <tr key={`${item.sourceResource}-${item._id}`}>
      <td>{item.imageUrl ? <img className='table-image' src={item.imageUrl} alt={item.name} /> : <span className='table-image placeholder'>-</span>}</td>
      <td><span className='cell-primary'>{textValue(item.name)}</span></td>
      <td>{item.productType}</td>
      <td>{textValue(item.brand?.name || item.brand || item.brands)}</td>
      <td>{categoryName(item, item.sourceCategoryField)}</td>
      <td>{priceLabel(item.price)}</td>
      <td><span className={statusClass(item.status)}>{item.status || 'draft'}</span></td>
      <td className='actions-cell'><button type='button' onClick={() => onNavigate(item.sourceResource)} aria-label={`Open ${item.productType}`}><AdminIcon name='edit' /></button><button className='danger' type='button' onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`}><AdminIcon name='trash' /></button></td>
    </tr>
  ))

  return (
    <div className='manager-page all-products-manager'>
      <div className='manager-actions-row'>
        <div className='dashboard-actions add-product-controls'>
          <select className='toolbar-filter' value={addProductType} onChange={(event) => setAddProductType(event.target.value)} aria-label='Select product type to add'>
            {addProductOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          <button className='admin-secondary' type='button' onClick={() => onNavigate(addProductType, true)}><AdminIcon name={addProductOptions.find((option) => option.value === addProductType)?.icon || 'plus'} /> {addProductOptions.find((option) => option.value === addProductType)?.actionLabel || 'Add Product'}</button>
        </div>
      </div>

      {notice && <div className='admin-notice error'>{notice}</div>}

      <div className='category-overview-strip all-product-category-strip'>
        <button type='button' className={mainCategoryFilter === 'all' ? 'active' : ''} onClick={() => setMainCategoryFilter('all')}><span>View</span><strong>All Products</strong><small>{items.length} records</small></button>
        {mainCategoryCards.map((category) => <button type='button' className={mainCategoryFilter === category.name ? 'active' : ''} key={category.name} onClick={() => setMainCategoryFilter(category.name)}><span>Product</span><strong>{category.name}</strong><small>{category.count} records</small></button>)}
      </div>

      <div className='manager-metrics'>
        <div><span>Total products</span><strong>{counts.total}</strong></div>
        <div><span>Vehicles</span><strong>{counts.vehicles}</strong></div>
        <div><span>Spare parts</span><strong>{counts.parts}</strong></div>
        <div><span>Services</span><strong>{counts.services}</strong></div>
      </div>

      <section className='data-panel'>
        <div className='data-toolbar'>
          <label className='search-box'><AdminIcon name='search' /><input value={search} placeholder='Search products' onChange={(event) => setSearch(event.target.value)} /></label>
          <select className='toolbar-filter' value={mainCategoryFilter} onChange={(event) => setMainCategoryFilter(event.target.value)} aria-label='Filter products by main category'>{allProductMainFilterOptions.map((option) => <option value={option} key={option}>{mainFilterLabel(option)}</option>)}</select>

          <select className='toolbar-filter' value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value='all'>All types</option>
            <option value='Vehicle'>Vehicles</option>
            <option value='Spare Part'>Spare Parts</option>
            <option value='Service'>Services</option>
          </select>
          <button className='icon-button' type='button' onClick={load} aria-label='Refresh all products'><AdminIcon name='refresh' /></button>
          <div className='record-count'>{visibleItems.length} records</div>
        </div>
        {loading ? <div className='admin-empty'><span className='loader' /></div> : visibleItems.length === 0 ? (
          <div className='admin-empty'><span className='empty-symbol'>+</span><h3>No products found</h3><p>Try a different search or filter.</p></div>
        ) : (
          <div className='table-scroll'>
            <table className='resource-table'>
              <thead><tr><th>Image</th><th>Name</th><th>Type</th><th>Brand</th><th>Category</th><th>Price</th><th>Status</th><th>Manage</th></tr></thead>
              <tbody>{productSections.map((section) => (
                <Fragment key={section.key}>
                  <tr className='table-section-row'><td colSpan={8}><strong>{section.title}</strong><span>{section.description} - {section.items.length} records</span></td></tr>
                  {section.items.length ? renderRows(section.items) : <tr className='table-empty-row'><td colSpan={8}>No records in this section</td></tr>}
                </Fragment>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {deleting && (
        <div className='admin-modal-backdrop' role='presentation' onMouseDown={(event) => event.target === event.currentTarget && !deletingBusy && setDeleting(null)}>
          <section className='admin-modal delete-confirm-modal' role='alertdialog' aria-modal='true' aria-labelledby='all-products-delete-title' aria-describedby='all-products-delete-description'>
            <div className='delete-confirm-icon'><AdminIcon name='trash' size={24} /></div>
            <div className='delete-confirm-copy'>
              <p className='eyebrow'>Confirm deletion</p>
              <h2 id='all-products-delete-title'>Delete {deleting.productType}?</h2>
              <p id='all-products-delete-description'>You are about to permanently delete <strong>{deleting.name}</strong>. This action cannot be undone.</p>
            </div>
            <footer>
              <button className='admin-secondary' type='button' disabled={deletingBusy} onClick={() => setDeleting(null)}>Cancel</button>
              <button className='admin-danger' type='button' disabled={deletingBusy} onClick={confirmDelete}><AdminIcon name='trash' /> {deletingBusy ? 'Deleting...' : 'Delete ' + deleting.productType}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
