import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminIcon from './AdminIcon.jsx'

const emptyFromFields = (fields) => Object.fromEntries(
  fields.map((field) => [field.name, field.defaultValue ?? (field.type === 'checkbox' ? false : '')]),
)

const valueAt = (item, path) => path.split('.').reduce((value, key) => value?.[key], item)

const categoryPath = (item, categories) => {
  const names = [item.name]
  let parentId = typeof item.parentId === 'object' ? item.parentId?._id : item.parentId
  const visited = new Set()
  while (parentId && !visited.has(String(parentId))) {
    visited.add(String(parentId))
    const parent = categories.find((entry) => String(entry._id) === String(parentId))
    if (!parent) break
    names.unshift(parent.name)
    parentId = typeof parent.parentId === 'object' ? parent.parentId?._id : parent.parentId
  }
  return names.join(' › ')
}

const displayValue = (value, field) => {
  if (value === null || value === undefined || value === '') return '—'
  if (field?.type === 'checkbox') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ') || '—'
  if (typeof value === 'object') return value.name || value.title || JSON.stringify(value)
  if (field?.type === 'number' && field.name.toLowerCase().includes('price')) return `₹${Number(value).toLocaleString('en-IN')}`
  return String(value)
}

function Notice({ kind, children }) {
  if (!children) return null
  return <div className={`admin-notice ${kind}`}>{children}</div>
}

function Field({ field, value, onChange, lookups, onUploadChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputId = `resource-${field.name}`
  const options = field.lookup
    ? (lookups[field.lookup] || [])
      .filter((item) => item.status !== 'draft' && (!field.lookupGroup || item.group === field.lookupGroup))
      .filter((item) => !field.leafOnly || !(lookups.categories || []).some((entry) => String(entry.parentId?._id || entry.parentId || '') === String(item._id)))
      .map((item) => {
        const parent = field.lookup === 'categories' && item.parentId ? (lookups.categories || []).find((entry) => entry._id === item.parentId) : null
        const label = field.treeOptions && field.lookup === 'categories' ? categoryPath(item, lookups.categories || []) : parent ? parent.name + ' / ' + item.name : item.name || item.title
        return { value: field.lookupValue ? item[field.lookupValue] : item._id, label }
      })
    : field.options || []

  if (field.type === 'files') {
    const images = Array.isArray(value) ? value : []
    const handleFiles = async (event) => {
      const files = [...(event.target.files || [])]
      if (!files.length) return
      const invalid = files.find((file) => file.size > 2 * 1024 * 1024)
      if (invalid) {
        setUploadError(`${invalid.name} is larger than 2 MB.`)
        event.target.value = ''
        return
      }
      setUploadError('')
      setUploading(true)
      onUploadChange?.(1)
      try {
        const uploaded = []
        for (const file of files) {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`))
            reader.readAsDataURL(file)
          })
          const stored = await api.post('/storage', { filename: file.name, dataUrl, title: file.name, alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), context: 'blog-content' })
          uploaded.push({ url: stored.url, alt: stored.metadata?.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') })
        }
        onChange(field.name, [...images, ...uploaded])
      } catch (error) { setUploadError(error.message) }
      finally {
        setUploading(false)
        onUploadChange?.(-1)
        event.target.value = ''
      }
    }
    return (
      <div className={`admin-field file-upload-field multi-image-field ${field.wide ? 'wide' : ''}`}>
        <label htmlFor={inputId}>{field.label}{field.required && <b> *</b>}</label>
        {images.length > 0 && <div className='multi-image-preview'>{images.map((image, index) => <figure key={`${image.url}-${index}`}><img src={image.url} alt={image.alt || `Article image ${index + 1}`} /><button type='button' aria-label={`Remove image ${index + 1}`} onClick={() => onChange(field.name, images.filter((_, imageIndex) => imageIndex !== index))}>×</button><input aria-label={`Alt text for image ${index + 1}`} value={image.alt || ''} placeholder='Image alt text' onChange={(event) => onChange(field.name, images.map((entry, imageIndex) => imageIndex === index ? { ...entry, alt: event.target.value } : entry))} /></figure>)}</div>}
        <label className='multi-file-picker' htmlFor={inputId}><AdminIcon name='image' /><span><strong>{uploading ? 'Uploading images to MongoDB...' : 'Choose content images'}</strong><small>Multiple PNG, JPG, WEBP or SVG files · Max 2 MB each</small></span><input id={inputId} type='file' multiple accept={field.accept || 'image/*'} required={field.required && images.length === 0} disabled={uploading} onChange={handleFiles} /></label>
        {uploadError && <small className='upload-error'>{uploadError}</small>}
        {field.hint && <small>{field.hint}</small>}
      </div>
    )
  }

  if (field.type === 'file') {
    const handleFile = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        window.alert('Please select an image smaller than 2 MB.')
        event.target.value = ''
        return
      }
      setUploadError('')
      setUploading(true)
      onUploadChange?.(1)
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const stored = await api.post('/storage', { filename: file.name, dataUrl: reader.result, title: file.name, alt: field.label, context: field.name })
          onChange(field.name, stored.url)
        } catch (error) {
          setUploadError(error.message)
        } finally {
          setUploading(false)
          onUploadChange?.(-1)
        }
      }
      reader.onerror = () => {
        setUploadError('Unable to read this image. Please choose another file.')
        setUploading(false)
        onUploadChange?.(-1)
      }
      reader.readAsDataURL(file)
    }
    return (
      <div className={`admin-field file-upload-field ${field.wide ? 'wide' : ''}`}>
        <label htmlFor={inputId}>{field.label}{field.required && <b> *</b>}</label>
        <label className='brand-file-picker' htmlFor={inputId}>
          <span className='brand-file-preview'>{value ? <img src={value} alt={'Selected '+field.label} /> : <AdminIcon name='image' />}</span>
          <span><strong>{uploading ? 'Uploading to MongoDB...' : value ? 'Replace image file' : 'Choose image file'}</strong><small>PNG, JPG, WEBP or SVG · Max 2 MB</small></span>
          <input id={inputId} type='file' accept={field.accept || 'image/*'} required={field.required && !value} disabled={uploading} onChange={handleFile} />
        </label>
        {uploadError && <small className='upload-error'>{uploadError}</small>}
        {field.hint && <small>{field.hint}</small>}
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="switch-field" htmlFor={inputId}>
        <input id={inputId} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.name, event.target.checked)} />
        <span className="switch-track"><span /></span>
        <span><strong>{field.label}</strong><small>{field.hint}</small></span>
      </label>
    )
  }

  return (
    <div className={`admin-field ${field.wide ? 'wide' : ''}`}>
      <label htmlFor={inputId}>{field.label}{field.required && <b> *</b>}</label>
      {field.type === 'textarea' ? (
        <textarea
          id={inputId}
          rows={field.rows || 4}
          value={value ?? ''}
          placeholder={field.placeholder || ''}
          required={field.required}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ) : field.type === 'select' ? (
        <select id={inputId} value={value ?? ''} required={field.required} onChange={(event) => onChange(field.name, event.target.value)}>
          <option value="">{field.emptyLabel || `Select ${field.label}`}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input
          id={inputId}
          type={field.type || 'text'}
          value={value ?? ''}
          min={field.min}
          placeholder={field.placeholder || ''}
          required={field.required}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      )}
      {field.hint && <small>{field.hint}</small>}
    </div>
  )
}

export default function ResourceManager({ config, openToken = 0, onDataChange }) {
  const { resource, fields, columns } = config
  const [items, setItems] = useState([])
  const [lookups, setLookups] = useState({})
  const [form, setForm] = useState(() => emptyFromFields(fields))
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [extraFilters, setExtraFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: '', message: '' })
  const [uploadingCount, setUploadingCount] = useState(0)
  const detailImage = viewing?.imageUrl || viewing?.logoUrl

  const lookupNames = useMemo(() => [...new Set(fields.map((field) => field.lookup).filter(Boolean))], [fields])

  const load = useCallback(async () => {
    setLoading(true)
    setNotice({ kind: '', message: '' })
    try {
      const [data, ...lookupData] = await Promise.all([
        api.get(`/${resource}`),
        ...lookupNames.map((name) => api.get(`/${name}`)),
      ])
      setItems(data)
      setLookups(Object.fromEntries(lookupNames.map((name, index) => [name, lookupData[index]])))
    } catch (error) {
      setNotice({ kind: 'error', message: `${error.message}. Backend server is running என்பதை check பண்ணுங்க.` })
    } finally {
      setLoading(false)
    }
  }, [lookupNames, resource])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (openToken > 0) {
      setEditing(null)
      setForm(emptyFromFields(fields))
      setIsFormOpen(true)
    }
  }, [openToken, fields])

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      if (config.filterGroup && item.group !== config.filterGroup) return false
      const parentId = item.parentId?._id || item.parentId
      if (config.categoryLevel === 'main' && parentId) return false
      if (config.categoryLevel === 'sub' && !parentId) return false
      if (config.categoryMode === 'vehicle-primary' && !config.primarySlugs.includes(item.slug)) return false
      if (config.categoryMode === 'vehicle-sub' && (item.slug === 'vehicles' || config.primarySlugs.includes(item.slug))) return false
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = !query || columns.some((column) => String(valueAt(item, column.key) || '').toLowerCase().includes(query))
      const matchesExtra = (config.filters || []).every((filter) => {
        const selected = extraFilters[filter.key] || 'all'
        if (selected === 'all') return true
        const value = valueAt(item, filter.key)
        if (filter.type !== 'date') return String(value || '') === selected
        const date = new Date(value)
        const now = new Date()
        if (selected === 'today') return date.toDateString() === now.toDateString()
        const days = selected === '7days' ? 7 : 30
        return date >= new Date(now.getTime() - days * 86400000)
      })
      return matchesStatus && matchesSearch && matchesExtra
    })
  }, [columns, config.categoryLevel, config.categoryMode, config.filterGroup, config.filters, config.primarySlugs, extraFilters, items, search, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyFromFields(fields))
    setNotice({ kind: '', message: '' })
    setIsFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm(Object.fromEntries(fields.map((field) => {
      let value = valueAt(item, field.name)
      if (field.lookup && value && typeof value === 'object') value = value._id
      if (field.name === 'tags' && Array.isArray(value)) value = value.join(', ')
      if (['features', 'vehicleTypes', 'compatibleVehicleTypes', 'brands'].includes(field.name) && Array.isArray(value)) value = value.join(', ')
      if (field.name === 'sections' && value && typeof value === 'object') value = JSON.stringify(value, null, 2)
      if (['specifications', 'details'].includes(field.name) && value && typeof value === 'object') value = JSON.stringify(value, null, 2)
      return [field.name, value ?? (field.type === 'checkbox' ? false : '')]
    })))
    setNotice({ kind: '', message: '' })
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice({ kind: '', message: '' })
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => {
        const field = fields.find((entry) => entry.name === key)
        if (field?.type === 'number') return [key, value === '' ? 0 : Number(value)]
        return [key, value]
      }))
      if (editing) await api.put(`/${resource}/${editing._id}`, payload)
      else await api.post(`/${resource}`, payload)
      setIsFormOpen(false)
      await load()
      onDataChange?.()
      setNotice({ kind: 'success', message: `${config.singular} ${editing ? 'updated' : 'created'} successfully.` })
    } catch (error) {
      setNotice({ kind: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (item) => setDeleting(item)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await api.delete(`/${resource}/${deleting._id}`)
      setItems((current) => current.filter((entry) => entry._id !== deleting._id))
      setNotice({ kind: 'success', message: `${config.singular} deleted.` })
      setDeleting(null)
      onDataChange?.()
    } catch (error) {
      setNotice({ kind: 'error', message: error.message })
      setDeleting(null)
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="manager-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{config.eyebrow || 'Manage website'}</p>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        {!config.noCreate && <button className="admin-primary" type="button" onClick={openCreate}><AdminIcon name="plus" /> Add {config.singular}</button>}
      </div>

      <Notice kind={notice.kind}>{notice.message}</Notice>

      {!config.simple && <div className='manager-metrics'>
        <div><span>All records</span><strong>{visibleItems.length}</strong></div>
        <div><span>Live / active</span><strong>{visibleItems.filter((item) => ['active', 'published'].includes(item.status)).length}</strong></div>
        <div><span>Draft</span><strong>{visibleItems.filter((item) => item.status === 'draft').length}</strong></div>
        <div><span>Featured</span><strong>{visibleItems.filter((item) => item.featured).length}</strong></div>
      </div>}

      <section className="data-panel">
        <div className="data-toolbar">
          <div className="search-box"><AdminIcon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} /></div>
          <select className='toolbar-filter' value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label='Filter by status'>
            <option value='all'>All statuses</option>
            {[...new Set(items.map((item) => item.status).filter(Boolean))].map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
          {(config.filters || []).map((filter) => {
            const options = filter.options || [...new Set(items.map((item) => valueAt(item, filter.key)).filter(Boolean))].map((value) => ({ value: String(value), label: String(value) }))
            return <select className='toolbar-filter' value={extraFilters[filter.key] || 'all'} onChange={(event) => setExtraFilters((current) => ({ ...current, [filter.key]: event.target.value }))} aria-label={filter.label} key={filter.key}><option value='all'>{filter.label}</option>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
          })}
          <div className="record-count">{visibleItems.length} {visibleItems.length === 1 ? 'record' : 'records'}</div>
          <button className="icon-button" type="button" onClick={load} aria-label="Refresh"><AdminIcon name="refresh" /></button>
        </div>

        {loading ? (
          <div className="admin-empty"><span className="loader" /><h3>Loading {config.title.toLowerCase()}...</h3></div>
        ) : visibleItems.length === 0 ? (
          <div className="admin-empty"><span className="empty-symbol">+</span><h3>No {config.title.toLowerCase()} found</h3><p>{config.noCreate ? 'No activity has been recorded yet.' : `Add your first ${config.singular.toLowerCase()} to get started.`}</p>{!config.noCreate && <button type="button" onClick={openCreate}>Add {config.singular}</button>}</div>
        ) : (
          <div className="table-scroll">
            <table className="resource-table">
              <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="actions-cell">Actions</th></tr></thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item._id}>
                    {columns.map((column) => {
                      const value = valueAt(item, column.key)
                      return (
                        <td key={column.key}>
                          {column.image ? (
                            value ? <img className="table-image" src={value} alt="" /> : <span className="table-image placeholder">{(item.name || item.title || '?')[0]}</span>
                          ) : column.status ? (
                            <span className={`status-chip ${value}`}>{value}</span>
                          ) : column.boolean ? (
                            <span className={value ? 'featured-yes' : 'muted'}>{value ? 'Yes' : 'No'}</span>
                          ) : column.money ? (
                            `₹${Number(value || 0).toLocaleString('en-IN')}`
                          ) : (
                            <span className={column.primary ? 'cell-primary' : ''}>{column.format ? column.format(value, item, lookups) : displayValue(value, column)}</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="actions-cell"><button type="button" onClick={() => setViewing(item)} aria-label="View"><AdminIcon name="eye" /></button>{!config.noEdit && <button type="button" onClick={() => openEdit(item)} aria-label="Edit"><AdminIcon name="edit" /></button>}<button className="danger" type="button" onClick={() => handleDelete(item)} aria-label="Delete"><AdminIcon name="trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {deleting && (
        <div className='admin-modal-backdrop' role='presentation' onMouseDown={(event) => event.target === event.currentTarget && !deletingBusy && setDeleting(null)}>
          <section className='admin-modal delete-confirm-modal' role='alertdialog' aria-modal='true' aria-labelledby='delete-confirm-title' aria-describedby='delete-confirm-description'>
            <div className='delete-confirm-icon'><AdminIcon name='trash' size={24} /></div>
            <div className='delete-confirm-copy'><p className='eyebrow'>Confirm deletion</p><h2 id='delete-confirm-title'>Delete {config.singular}?</h2><p id='delete-confirm-description'>You are about to permanently delete <strong>{deleting.name || deleting.title}</strong>. This action cannot be undone.</p></div>
            <footer><button className='admin-secondary' type='button' disabled={deletingBusy} onClick={() => setDeleting(null)}>Cancel</button><button className='admin-danger' type='button' disabled={deletingBusy} onClick={confirmDelete}><AdminIcon name='trash' /> {deletingBusy ? 'Deleting...' : `Delete ${config.singular}`}</button></footer>
          </section>
        </div>
      )}

      {viewing && (
        <div className='admin-modal-backdrop' role='presentation' onMouseDown={(event) => event.target === event.currentTarget && setViewing(null)}>
          <section className='admin-modal detail-modal' role='dialog' aria-modal='true' aria-labelledby='record-detail-title'>
            <header><div><p className='eyebrow'>{config.singular} details</p><h2 id='record-detail-title'>{viewing.name || viewing.title}</h2></div><button type='button' onClick={() => setViewing(null)} aria-label='Close'><AdminIcon name='close' /></button></header>
            {detailImage && <div className='detail-cover'><img src={detailImage} alt={viewing.name || viewing.title} /></div>}
            <div className='detail-grid'>
              {fields.filter((field) => !['imageUrl', 'logoUrl', 'galleryImages'].includes(field.name)).map((field) => <div className={field.wide ? 'wide' : ''} key={field.name}><span>{field.label}</span><strong>{displayValue(valueAt(viewing, field.name), field)}</strong></div>)}
              {viewing.galleryImages?.length > 0 && <div className='wide'><span>Article content images</span><div className='detail-gallery'>{viewing.galleryImages.map((image, index) => <img src={image.url} alt={image.alt || `Article image ${index + 1}`} key={`${image.url}-${index}`} />)}</div></div>}
            </div>
            <footer><button className='admin-secondary' type='button' onClick={() => setViewing(null)}>Close</button>{!config.noEdit && <button className='admin-primary' type='button' onClick={() => { const item = viewing; setViewing(null); openEdit(item) }}><AdminIcon name='edit' /> Edit {config.singular}</button>}</footer>
          </section>
        </div>
      )}

      {isFormOpen && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsFormOpen(false)}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="resource-form-title">
            <header><div><p className="eyebrow">{editing ? 'Edit existing' : 'Create new'}</p><h2 id="resource-form-title">{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><AdminIcon name="close" /></button></header>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                {fields.map((field) => <Field key={field.name} field={field} value={form[field.name]} lookups={lookups} onUploadChange={(delta) => setUploadingCount((count) => Math.max(0, count + delta))} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />)}
              </div>
              <footer><button className="admin-secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="admin-primary" type="submit" disabled={saving || uploadingCount > 0}>{uploadingCount > 0 ? 'Uploading image...' : saving ? 'Saving...' : editing ? `Update ${config.singular}` : `Create ${config.singular}`}</button></footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
