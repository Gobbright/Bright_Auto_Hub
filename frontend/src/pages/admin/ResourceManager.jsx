import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../lib/api.js'
import BlogDetailPage from '../BlogDetailPage.jsx'
import ProductDetailPage from '../ProductDetailPage.jsx'
import defaultBlogHero from '../../assets/Images/BLOG/new-cars-lineup-showroom.png'
import AdminIcon from './AdminIcon.jsx'

const emptyFromFields = (fields, defaults = {}) => ({
  ...defaults,
  ...Object.fromEntries(fields.map((field) => [field.name, defaults[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : field.type === 'files' || field.type === 'colorImages' ? [] : '')])),
})

const valueAt = (item, path) => path.split('.').reduce((value, key) => value?.[key], item)
const idOf = (value) => String(value?._id || value || '')
const fixedMainCategoryNames = new Set(['Vehicles', 'Spare Parts', 'Services', 'Finance & Insurance', 'Tools & Calculators'])
const comingSoonCategoryNames = new Set(['Dealers & Locations'])
const productPreviewMeta = {
  vehicles: { kind: 'vehicles', categoryLabel: 'Vehicle', detail: 'Vehicle specifications' },
  'used-vehicles': { kind: 'vehicles', categoryLabel: 'Used Vehicle', detail: 'Vehicle specifications' },
  parts: { kind: 'spare-parts', categoryLabel: 'Spare Part', detail: 'Part specifications' },
  services: { kind: 'services', categoryLabel: 'Service', detail: 'Service details' },
}
const splitList = (value) => Array.isArray(value) ? value.filter(Boolean) : String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
const textFromHtml = (value = '') => String(value || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim()
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Unable to read this image.'))
  reader.readAsDataURL(file)
})
const formatFileSize = (bytes = 0) => {
  const size = Number(bytes) || 0
  if (!size) return ''
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return Math.round(size / 1024) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}
const imageInfoFromFile = async (file, dataUrl) => new Promise((resolve) => {
  if (!file) return resolve({})
  const info = { filename: file.name || '', size: file.size || 0 }
  const image = new Image()
  image.onload = () => resolve({ ...info, width: image.naturalWidth || 0, height: image.naturalHeight || 0 })
  image.onerror = () => resolve(info)
  image.src = dataUrl
})
const imageMetaText = (image = {}) => [image.filename, image.width && image.height ? image.width + ' x ' + image.height + 'px' : '', image.size ? formatFileSize(image.size) : ''].filter(Boolean).join(' | ')
const parseSpecText = (value = '') => Object.fromEntries(String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
  const separator = line.indexOf(':')
  return separator === -1 ? [line, ''] : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
}).filter(([key]) => key))
const specTextFromObject = (value = {}) => Object.entries(value || {}).map(([key, entry]) => `${key}: ${Array.isArray(entry) ? entry.join(', ') : entry}`).join('\n')
const normalizeImageList = (images = []) => images.filter((image) => image?.url).map((image) => ({ url: image.url, alt: image.alt || '', filename: image.filename || '', width: Number(image.width) || 0, height: Number(image.height) || 0, size: Number(image.size) || 0 }))
const normalizeColorImageList = (images = []) => (Array.isArray(images) ? images : []).map((entry) => ({
  color: String(entry?.color || '').trim(),
  url: String(entry?.url || '').trim(),
  alt: String(entry?.alt || '').trim(),
  galleryImages: normalizeImageList(entry?.galleryImages || []).slice(0, 3),
})).filter((entry) => entry.color || entry.url || entry.galleryImages.length)
const vehicleImagesFromRecord = (item = {}) => normalizeImageList([item.imageUrl ? { url: item.imageUrl, alt: item.name || 'Vehicle image' } : null, ...(Array.isArray(item.galleryImages) ? item.galleryImages : [])])
const vehicleImagesFromColorImages = (colorImages = []) => {
  const entries = normalizeColorImageList(colorImages)
  const main = entries.find((entry) => entry.url)
  const galleryImages = entries.flatMap((entry) => entry.galleryImages.map((image) => ({ ...image, alt: image.alt || [entry.color, 'vehicle image'].filter(Boolean).join(' ') })))
  return { imageUrl: main?.url || '', galleryImages }
}

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
  return names.join(' / ')
}

const uniqueById = (rows = []) => {
  const seen = new Set()
  return rows.filter((item) => {
    const id = idOf(item._id)
    const key = id || `${item.group || ''}:${item.slug || ''}:${item.name || ''}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const uniqueMainCategories = (rows = []) => {
  const seen = new Set()
  return rows.filter((item) => {
    const key = String(item.name || item.slug || item._id || '').trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
const normalizeSlug = (value) => String(value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const extensionOfFile = (file) => file?.name?.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() || '.jpg'
const uploadLabelFor = (form = {}, field = {}, fallback = 'image', index = 0) => [form.name || form.title || fallback, index ? 'image ' + index : ''].filter(Boolean).join(' ') || field.label || fallback
const brandLogoExtensions = {
  'ashok-leyland': 'svg', audi: 'svg', bajaj: 'svg', bmw: 'svg', caterpillar: 'svg', euler: 'svg', hero: 'svg', honda: 'svg', hyundai: 'svg', jcb: 'svg', 'john-deere': 'svg', kia: 'svg', kinetic: 'svg', mahindra: 'svg', 'maruti-suzuki': 'svg', mg: 'svg', 'mg-motor': 'svg', renault: 'svg', skoda: 'svg', suzuki: 'svg', tata: 'svg', 'tata-motors': 'svg', toyota: 'svg', tvs: 'svg', ultraviolette: 'svg', volkswagen: 'svg', volvo: 'svg',
}
const brandLogoFromName = (item = {}) => {
  const slug = normalizeSlug(item.slug || item.name)
  return slug ? `/images/brands/admin/${slug}.${brandLogoExtensions[slug] || 'png'}` : ''
}
const categoryRootName = (item, categories) => {
  const byId = new Map(categories.map((entry) => [String(entry._id), entry]))
  let current = item
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
const itemMainCategoryName = (item, fieldName, categories = [], parentSlug = '') => {
  const categoryValue = valueAt(item, fieldName)
  const categoryId = idOf(categoryValue)
  const byId = new Map(categories.map((entry) => [idOf(entry._id), entry]))
  let category = categoryValue?.name ? categoryValue : byId.get(categoryId)
  if (!category) return categoryValue?.name || 'Unassigned Brands'
  if (!parentSlug) return category.name || 'Unassigned Brands'
  const requestedSlug = normalizeSlug(parentSlug)
  const root = categories.find((entry) => normalizeSlug(entry.slug || entry.name) === requestedSlug && !idOf(entry.parentId))
  if (!root) return category.name || 'Unassigned Brands'
  let current = category
  let parentId = idOf(current.parentId)
  let childUnderRoot = idOf(current._id) === idOf(root._id) ? null : current
  const visited = new Set()
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = byId.get(parentId)
    if (!parent) break
    if (idOf(parent._id) === idOf(root._id)) return childUnderRoot?.name || current.name || 'Unassigned Brands'
    childUnderRoot = parent
    current = parent
    parentId = idOf(parent.parentId)
  }
  return category.name || 'Unassigned Brands'
}
const displayValue = (value, field, item = {}) => {
  if (field?.status && comingSoonCategoryNames.has(item.name)) return 'Coming Soon'
  if (value === null || value === undefined || value === '') return '-'
  if (field?.type === 'checkbox') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? item.alt || item.url || JSON.stringify(item) : item).join(', ') || '-'
  if (typeof value === 'object') return value.name || value.title || JSON.stringify(value)
  if (field?.type === 'number' && field.name.toLowerCase().includes('price')) return `Rs ${Number(value).toLocaleString('en-IN')}`
  return String(value)
}
const tableCellText = (item, column, lookups) => {
  const value = valueAt(item, column.key)
  const displayed = column.format ? column.format(value, item, lookups) : displayValue(value, column, item)
  return String(displayed ?? '').trim()
}

const tableSortValue = (item, column, lookups) => {
  const value = valueAt(item, column.key)
  if (column.key === 'createdAt' || column.key === 'publishedAt' || column.type === 'date') {
    const date = new Date(value)
    return isValidDate(date) ? date.getTime() : 0
  }
  if (column.money || column.key.toLowerCase().includes('price') || column.key.toLowerCase().includes('order') || column.key.toLowerCase().includes('stock')) return Number(value) || 0
  return tableCellText(item, column, lookups).toLowerCase()
}

const compareTableRows = (a, b, column, direction, lookups) => {
  const valueA = tableSortValue(a, column, lookups)
  const valueB = tableSortValue(b, column, lookups)
  const result = typeof valueA === 'number' && typeof valueB === 'number' ? valueA - valueB : String(valueA).localeCompare(String(valueB), undefined, { numeric: true, sensitivity: 'base' })
  return direction === 'desc' ? -result : result
}


const activityRangeOptions = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime())
const compactDateLabel = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

const buildActivityChart = (items, range) => {
  const now = new Date()
  if (range === 'year') {
    const buckets = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1)
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('en-IN', { month: 'short' }), value: 0 }
    })
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))
    items.forEach((item) => {
      const date = new Date(item.createdAt)
      if (!isValidDate(date)) return
      const monthsBack = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
      if (monthsBack < 0 || monthsBack > 11) return
      bucketMap.get(`${date.getFullYear()}-${date.getMonth()}`).value += 1
    })
    return buckets
  }

  const days = range === 'month' ? 30 : 7
  const today = startOfDay(now)
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))
    return { key: date.toISOString().slice(0, 10), label: compactDateLabel(date), value: 0 }
  })
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  items.forEach((item) => {
    const date = new Date(item.createdAt)
    if (!isValidDate(date)) return
    const day = startOfDay(date)
    const diffDays = Math.floor((today - day) / 86400000)
    if (diffDays < 0 || diffDays >= days) return
    bucketMap.get(day.toISOString().slice(0, 10)).value += 1
  })
  return buckets
}

function formatActivityDuration(value) {
  const total = Math.max(0, Number(value) || 0)
  if (!total) return '0s'
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = Math.floor(total % 60)
  if (hours) return `${hours}h ${minutes}m`
  if (minutes) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function WebsiteActivityChart({ items }) {
  const [range, setRange] = useState('week')
  const buckets = useMemo(() => buildActivityChart(items, range), [items, range])
  const maxValue = Math.max(1, ...buckets.map((bucket) => bucket.value))
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayItems = items.filter((item) => (item.dateKey || String(item.createdAt || '').slice(0, 10)) === todayKey)
  const dailyUsers = new Set(todayItems.map((item) => item.userEmail || item.userName || item.sessionId).filter(Boolean)).size
  const totalClicks = items.reduce((sum, item) => sum + (Number(item.clickCount) || (item.event === 'click' ? 1 : 0)), 0)
  const totalDuration = items.reduce((sum, item) => sum + (Number(item.durationSeconds) || 0), 0)
  const uniquePages = new Set(items.filter((item) => isValidDate(new Date(item.createdAt))).map((item) => item.pagePath || item.pageTitle || item.target).filter(Boolean)).size
  const topBucket = buckets.reduce((best, bucket) => bucket.value > best.value ? bucket : best, buckets[0] || { label: '-', value: 0 })

  return (
    <section className='activity-chart-panel' aria-label='Website activity chart'>
      <header>
        <div>
          <span>Traffic chart</span>
          <h3>Website activity tracking</h3>
        </div>
        <div className='chart-range-tabs'>
          {activityRangeOptions.map((option) => <button type='button' className={range === option.key ? 'active' : ''} onClick={() => setRange(option.key)} key={option.key}>{option.label}</button>)}
        </div>
      </header>
      <div className='activity-chart-stats'>
        <div><span>Total events</span><strong>{total}</strong></div>
        <div><span>Today users</span><strong>{dailyUsers}</strong></div>
        <div><span>Time spent</span><strong>{formatActivityDuration(totalDuration)}</strong></div>
        <div><span>Clicks</span><strong>{totalClicks}</strong></div>
        <div><span>Pages</span><strong>{uniquePages}</strong></div>
        <div><span>Peak</span><strong>{topBucket.value}</strong><small>{topBucket.label}</small></div>
      </div>
      <div className={`activity-bar-chart ${range}`}>
        {buckets.map((bucket) => <div className='activity-bar-item' key={bucket.key} title={`${bucket.label}: ${bucket.value} events`}><div><i style={{ height: `${Math.max(6, (bucket.value / maxValue) * 100)}%` }} /></div><strong>{bucket.value}</strong><span>{bucket.label}</span></div>)}
      </div>
    </section>
  )
}
function BlogPagePreview({ form, editing, relatedPosts, onBack }) {
  const post = {
    ...(editing || {}),
    ...form,
    title: form.title || editing?.title || 'Blog preview',
    excerpt: form.excerpt || editing?.excerpt || 'Preview your blog content before publishing.',
    heroImage: form.imageUrl || editing?.imageUrl || defaultBlogHero,
    relatedPosts,
  }
  return <section className='admin-public-preview'><button className='admin-secondary' type='button' onClick={onBack}>Back to editor</button><BlogDetailPage data={post} slug={post.slug || 'preview'} heroImage={post.heroImage} /></section>
}

function productFromForm(form, editing, resource, lookups) {
  const meta = productPreviewMeta[resource] || productPreviewMeta.vehicles
  const category = (lookups.categories || []).find((item) => idOf(item._id) === idOf(form.category || form.categoryId))
  const specs = typeof form.specifications === 'string' ? parseSpecText(form.specifications) : form.specifications
  const derivedImages = vehicleImagesFromColorImages(form.colorImages)
  return {
    ...(editing || {}),
    ...form,
    _id: editing?._id || 'preview',
    slug: form.slug || normalizeSlug(form.name || editing?.name || 'preview'),
    name: form.name || editing?.name || `${meta.categoryLabel} preview`,
    imageUrl: derivedImages.imageUrl || form.imageUrl || editing?.imageUrl || '',
    galleryImages: derivedImages.galleryImages.length ? derivedImages.galleryImages : Array.isArray(form.galleryImages) ? form.galleryImages : editing?.galleryImages || [],
    color: splitList(form.color),
    features: splitList(form.features),
    vehicleTypes: splitList(form.vehicleTypes),
    compatibleVehicleTypes: splitList(form.compatibleVehicleTypes),
    brands: splitList(form.brands),
    specifications: specs,
    category: category || editing?.category || editing?.categoryId || { name: meta.categoryLabel },
    categoryId: category || editing?.categoryId || editing?.category || { name: meta.categoryLabel },
  }
}

function ProductFormPreview({ form, resource, lookups, editing, mode, onBack }) {
  const meta = productPreviewMeta[resource] || productPreviewMeta.vehicles
  const product = productFromForm(form, editing, resource, lookups)
  if (mode === 'page') return <section className='admin-public-preview'><button className='admin-secondary' type='button' onClick={onBack}>Back to editor</button><ProductDetailPage kind={meta.kind} data={product} /></section>
  return <section className='admin-public-preview compact-product-preview'><button className='admin-secondary' type='button' onClick={onBack}>Back to editor</button><article><img src={product.imageUrl || product.galleryImages?.[0]?.url || ''} alt={product.name} /><div><span>{meta.categoryLabel}</span><h2>{product.name}</h2><p>{textFromHtml(product.description || product.details || '').slice(0, 180)}</p><strong>{product.price ? `Rs ${Number(product.price).toLocaleString('en-IN')}` : 'Price on request'}</strong></div></article></section>
}

function Notice({ kind, children }) {
  if (!children) return null
  return <div className={`admin-notice ${kind}`}>{children}</div>
}

function RichToolIcon({ name }) {
  if (['bold', 'italic', 'underline'].includes(name)) {
    const label = name === 'bold' ? 'B' : name === 'italic' ? 'I' : 'U'
    return <span className={'rich-text-letter ' + name}>{label}</span>
  }
  const paths = {
    bullet: ['M8 7h12M8 12h12M8 17h12', 'M4 7h.01M4 12h.01M4 17h.01'],
    numbered: ['M10 7h10M10 12h10M10 17h10', 'M4 6h1v3M4 9h2', 'M4 12h2l-2 3h2', 'M4 17h2M6 17v2H4'],
    quote: ['M6 9h4v4H8v2H5v-5c0-2 1-4 4-5', 'M15 9h4v4h-2v2h-3v-5c0-2 1-4 4-5'],
    alignLeft: ['M4 6h15M4 11h10M4 16h15'],
    alignCenter: ['M5 6h14M8 11h8M5 16h14'],
    alignRight: ['M5 6h15M10 11h10M5 16h15'],
    link: ['M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1', 'M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1'],
    image: ['M4 5h16v14H4z', 'm4 11 3-3 4 4 2-2 3 3', 'M15 9h.01'],
    table: ['M4 5h16v14H4z', 'M4 11h16M10 5v14'],
    clear: ['m6 17 11-11', 'M8 7l9 9-3 3H9l-4-4 3-8Z'],
  }
  return <svg viewBox='0 0 24 24' aria-hidden='true'>{(paths[name] || paths.bold || []).map((path) => <path key={path} d={path} />)}</svg>
}

function Field({ field, value, form = {}, onChange, lookups, onUploadChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadDetails, setUploadDetails] = useState({})
  const richTextRef = useRef(null)
  const inputId = `resource-${field.name}`
  const options = field.lookup
    ? (lookups[field.lookup] || [])
      .filter((item) => item.status !== 'draft' && (!field.lookupGroup || item.group === field.lookupGroup))
      .filter((item) => {
        if (!field.lookupParentSlug || field.lookup !== 'categories') return true
        const requestedSlug = normalizeSlug(field.lookupParentSlug)
        const parent = (lookups.categories || []).find((entry) => normalizeSlug(entry.slug || entry.name) === requestedSlug && !idOf(entry.parentId))
        return parent ? idOf(item.parentId) === idOf(parent._id) : false
      })
      .filter((item) => !field.rootOnly || !idOf(item.parentId))
      .filter((item) => !field.leafOnly || !(lookups.categories || []).some((entry) => String(entry.parentId?._id || entry.parentId || '') === String(item._id)))
      .map((item) => {
        const parent = field.lookup === 'categories' && item.parentId ? (lookups.categories || []).find((entry) => entry._id === item.parentId) : null
        const label = field.treeOptions && field.lookup === 'categories' ? categoryPath(item, lookups.categories || []) : parent ? parent.name + ' / ' + item.name : item.name || item.title
        return { value: field.lookupValue ? item[field.lookupValue] : item._id, label }
      })
    : field.options || []

  if (field.type === 'specs') {
    const entries = (() => {
      const parsed = typeof value === 'string' ? parseSpecText(value) : (value || {})
      const rows = Object.entries(parsed).map(([label, entry]) => ({ label, value: Array.isArray(entry) ? entry.join(', ') : String(entry || '') }))
      const defaults = (field.defaultRows || []).filter((label) => !rows.some((row) => row.label.toLowerCase() === String(label).toLowerCase())).map((label) => ({ label, value: '' }))
      return rows.length || defaults.length ? [...rows, ...defaults] : [{ label: '', value: '' }]
    })()
    const commit = (rows) => onChange(field.name, rows.filter((row) => row.label.trim() || row.value.trim()).map((row) => `${row.label.trim()}: ${row.value.trim()}`).join('\n'))
    const updateRow = (index, key, nextValue) => commit(entries.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row))
    const addRow = () => commit([...entries, { label: '', value: '' }])
    const removeRow = (index) => commit(entries.length <= 1 ? [{ label: '', value: '' }] : entries.filter((_, rowIndex) => rowIndex !== index))
    return (<div className={'admin-field specs-editor-field ' + (field.wide ? 'wide' : '')}><label>{field.label}{field.required && <b> *</b>}</label><div className='specs-editor-list'>{entries.map((entry, index) => <div className='specs-editor-row' key={index}><input value={entry.label} placeholder='Label' onChange={(event) => updateRow(index, 'label', event.target.value)} /><input value={entry.value} placeholder='Value' onChange={(event) => updateRow(index, 'value', event.target.value)} /><button type='button' aria-label='Remove specification' onClick={() => removeRow(index)}>x</button></div>)}</div><button className='admin-secondary specs-add-button' type='button' onClick={addRow}><AdminIcon name='plus' /> Add specification</button>{field.hint && <small>{field.hint}</small>}</div>)
  }

  if (field.type === 'files') {
    const images = Array.isArray(value) ? value : []
    const maxFiles = Number(field.maxFiles) || Infinity
    const minFiles = Number(field.minFiles) || 0
    const remainingSlots = Math.max(0, maxFiles - images.length)
    const handleFiles = async (event) => {
      const selectedFiles = [...(event.target.files || [])]
      if (!selectedFiles.length) return
      if (remainingSlots <= 0) {
        setUploadError(`Only ${maxFiles} images are allowed.`)
        event.target.value = ''
        return
      }
      const files = selectedFiles.slice(0, remainingSlots)
      const invalid = files.find((file) => file.size > 2 * 1024 * 1024)
      if (invalid) {
        setUploadError(`${invalid.name} is larger than 2 MB.`)
        event.target.value = ''
        return
      }
      setUploadError(selectedFiles.length > remainingSlots ? `Only ${maxFiles} images are allowed, so extra files were skipped.` : '')
      setUploading(true)
      onUploadChange?.(1)
      try {
        const uploaded = []
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file)
          const imageNumber = images.length + uploaded.length + 1
          const alt = uploadLabelFor(form, field, 'Product image', imageNumber)
          const info = await imageInfoFromFile(file, dataUrl)
          const stored = await api.post('/storage', { filename: `${normalizeSlug(alt)}${extensionOfFile(file)}`, dataUrl, title: alt, alt, context: field.context || 'blog-content' })
          uploaded.push({ url: stored.url, alt: stored.metadata?.alt || alt, filename: stored.filename || info.filename, width: info.width || 0, height: info.height || 0, size: stored.length || info.size || 0 })
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
        {images.length > 0 && <div className='multi-image-preview'>{images.map((image, index) => <figure key={`${image.url}-${index}`}><img src={image.url} alt={image.alt || `Product image ${index + 1}`} /><button type='button' aria-label={`Remove image ${index + 1}`} onClick={() => onChange(field.name, images.filter((_, imageIndex) => imageIndex !== index))}>x</button><small className='image-file-meta'>{imageMetaText(image) || 'Image details'}</small><input aria-label={`Alt text for image ${index + 1}`} value={image.alt || ''} placeholder='Image alt text' onChange={(event) => onChange(field.name, images.map((entry, imageIndex) => imageIndex === index ? { ...entry, alt: event.target.value } : entry))} /></figure>)}</div>}
        <label className={`multi-file-picker ${remainingSlots === 0 ? 'disabled' : ''}`} htmlFor={inputId}><AdminIcon name='image' /><span><strong>{uploading ? 'Uploading images to MongoDB...' : remainingSlots === 0 ? 'Image limit reached' : field.pickLabel || 'Choose content images'}</strong><small>{Number.isFinite(maxFiles) ? `${images.length}/${maxFiles} images added` : 'Multiple PNG, JPG, WEBP or SVG'} - Max ${Number(field.maxFileSizeMb) || 2} MB each</small></span><input id={inputId} type='file' multiple accept={field.accept || 'image/*'} required={field.required && images.length < minFiles} disabled={uploading || remainingSlots === 0} onChange={handleFiles} /></label>
        {uploadError && <small className='upload-error'>{uploadError}</small>}
        {field.requirements?.length > 0 && <ul className='upload-requirements'>{field.requirements.map((item) => <li key={item}>{item}</li>)}</ul>}
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
          const alt = uploadLabelFor(form, field, field.label || 'Image')
          const info = await imageInfoFromFile(file, reader.result)
          const stored = await api.post('/storage', { filename: `${normalizeSlug(alt)}${extensionOfFile(file)}`, dataUrl: reader.result, title: alt, alt, context: field.name })
          setUploadDetails((current) => ({ ...current, [stored.url]: { filename: stored.filename || info.filename, width: info.width || 0, height: info.height || 0, size: stored.length || info.size || 0 } }))
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
          <span><strong>{uploading ? 'Uploading to MongoDB...' : value ? 'Replace image file' : 'Choose image file'}</strong><small>{value && imageMetaText(uploadDetails[value]) ? imageMetaText(uploadDetails[value]) : 'PNG, JPG, WEBP or SVG - Max 2 MB'}</small></span>
          <input id={inputId} type='file' accept={field.accept || 'image/*'} required={field.required && !value} disabled={uploading} onChange={handleFile} />
        </label>
        {uploadError && <small className='upload-error'>{uploadError}</small>}
        {field.hint && <small>{field.hint}</small>}
      </div>
    )
  }

  if (field.type === 'richtext') {
    const insert = (before, after, placeholder) => insertAroundSelection(richTextRef.current, value, before, after, placeholder, (next) => onChange(field.name, next))
    const applyStyle = (tag) => {
      if (!tag) return
      const placeholders = { p: 'Paragraph text', h2: 'Section heading', h3: 'Subheading', h4: 'Small heading' }
      insert(`<${tag}>`, `</${tag}>`, placeholders[tag] || 'Styled text')
    }
    const insertLink = () => {
      const url = window.prompt('Paste link URL')
      if (!url) return
      insert(`<a href="${url.trim()}">`, '</a>', 'link text')
    }
    const insertImage = () => {
      const url = window.prompt('Paste image URL')
      if (!url) return
      insert('', `<img src="${url.trim()}" alt="" />`, '')
    }
    const insertTable = () => insert('', '<table><tbody><tr><td>Label</td><td>Value</td></tr></tbody></table>', '')
    const tools = [
      { icon: 'bold', title: 'Bold', action: () => insert('<strong>', '</strong>', 'bold text') },
      { icon: 'italic', title: 'Italic', action: () => insert('<em>', '</em>', 'italic text') },
      { icon: 'underline', title: 'Underline', action: () => insert('<u>', '</u>', 'underlined text') },
      { icon: 'bullet', title: 'Bullet list', action: () => insert('<ul><li>', '</li></ul>', 'List point') },
      { icon: 'numbered', title: 'Numbered list', action: () => insert('<ol><li>', '</li></ol>', 'List point') },
      { icon: 'quote', title: 'Quote', action: () => insert('<blockquote>', '</blockquote>', 'Quote text') },
      { icon: 'alignLeft', title: 'Align left', action: () => insert('<p style="text-align:left">', '</p>', 'Left aligned text') },
      { icon: 'alignCenter', title: 'Align center', action: () => insert('<p style="text-align:center">', '</p>', 'Centered text') },
      { icon: 'alignRight', title: 'Align right', action: () => insert('<p style="text-align:right">', '</p>', 'Right aligned text') },
      { icon: 'link', title: 'Link', action: insertLink },
      { icon: 'image', title: 'Image', action: insertImage },
      { icon: 'table', title: 'Table', action: insertTable },
      { icon: 'clear', title: 'Clear formatting', action: () => onChange(field.name, textFromHtml(value)) },
    ]
    return (
      <div className={`admin-field rich-editor-field ${field.wide ? 'wide' : ''}`}>
        <label htmlFor={inputId}>{field.label}{field.required && <b> *</b>}</label>
        <div className='rich-editor-toolbar-shell' aria-label={field.label + ' rich text editor toolbar'}>
          <select className='rich-editor-style-select' defaultValue='' onChange={(event) => { applyStyle(event.target.value); event.target.value = '' }} aria-label='Style'>
            <option value=''>Style</option>
            <option value='p'>Paragraph</option>
            <option value='h2'>Heading</option>
            <option value='h3'>Subheading</option>
            <option value='h4'>Small heading</option>
          </select>
          <div className='rich-editor-toolbar'>
            {tools.map((tool) => <button className={`rich-tool-button rich-tool-${tool.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} type='button' key={tool.title} title={tool.title} aria-label={tool.title} onClick={tool.action}><RichToolIcon name={tool.icon} /></button>)}
          </div>
        </div>
        <textarea
          id={inputId}
          ref={richTextRef}
          rows={field.rows || 12}
          value={value ?? ''}
          placeholder={field.placeholder || ''}
          required={field.required}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        <div className='rich-editor-meta'><span>{textFromHtml(value).split(/\s+/).filter(Boolean).length} words</span><span>HTML supported</span></div>
        {field.hint && <small>{field.hint}</small>}
      </div>
    )
  }
  if (field.type === 'multitext') {
    const values = splitList(value)
    const [draft, setDraft] = useState('')
    const addValue = (nextValue) => {
      const clean = String(nextValue || '').trim()
      if (!clean || values.some((item) => item.toLowerCase() === clean.toLowerCase())) return
      onChange(field.name, [...values, clean].join(', '))
      setDraft('')
    }
    const removeValue = (removeIndex) => onChange(field.name, values.filter((_, index) => index !== removeIndex).join(', '))
    return (<div className={'admin-field multi-text-field ' + (field.wide ? 'wide' : '')}><label htmlFor={inputId}>{field.label}{field.required && <b> *</b>}</label><div className='multi-text-options'>{(field.options || []).map((option) => <button className={values.includes(option) ? 'active' : ''} type='button' key={option} onClick={() => values.includes(option) ? onChange(field.name, values.filter((item) => item !== option).join(', ')) : addValue(option)}>{option}</button>)}</div><div className='multi-text-entry'><input id={inputId} value={draft} placeholder={field.placeholder || 'Type custom value'} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addValue(draft) } }} /><button type='button' onClick={() => addValue(draft)}>Add</button></div>{values.length > 0 && <div className='multi-text-chips'>{values.map((item, index) => <span key={item}>{item}<button type='button' aria-label={'Remove ' + item} onClick={() => removeValue(index)}>x</button></span>)}</div>}{field.hint && <small>{field.hint}</small>}</div>)
  }

  if (field.type === 'colorImages') {
    const colors = splitList(form.color)
    const maxGallery = Number(field.maxGalleryImages) || 3
    const images = normalizeColorImageList(value)
    const entryFor = (color) => images.find((item) => item.color.toLowerCase() === color.toLowerCase()) || { color, url: '', alt: '', galleryImages: [] }
    const commitEntry = (nextEntry) => {
      const selected = new Set(colors.map((color) => color.toLowerCase()))
      const nextImages = images.filter((entry) => selected.has(entry.color.toLowerCase()) && entry.color.toLowerCase() !== nextEntry.color.toLowerCase())
      onChange(field.name, [...nextImages, nextEntry])
    }
    const uploadForColor = async (color, file, slot = 'main', galleryIndex = -1) => {
      if (!file) return
      if (file.size > 2 * 1024 * 1024) { setUploadError(file.name + ' is larger than 2 MB.'); return }
      setUploading(true)
      setUploadError('')
      onUploadChange?.(1)
      try {
        const label = slot === 'main' ? 'main image' : 'image ' + (galleryIndex + 1)
        const alt = [form.name || 'vehicle', color, label].filter(Boolean).join(' ')
        const dataUrl = await fileToDataUrl(file)
        const info = await imageInfoFromFile(file, dataUrl)
        const uploaded = await api.post('/storage', { filename: `${normalizeSlug(alt)}${extensionOfFile(file)}`, dataUrl, title: alt, alt, context: field.context || 'vehicle-colour-gallery' })
        const uploadMeta = { filename: uploaded.filename || info.filename, width: info.width || 0, height: info.height || 0, size: uploaded.length || info.size || 0 }
        const current = entryFor(color)
        const nextEntry = { ...current, color }
        if (slot === 'main') {
          nextEntry.url = uploaded.url
          nextEntry.alt = uploaded.metadata?.alt || alt
          Object.assign(nextEntry, uploadMeta)
        } else {
          const galleryImages = [...(current.galleryImages || [])]
          galleryImages[galleryIndex] = { url: uploaded.url, alt: uploaded.metadata?.alt || alt, ...uploadMeta }
          nextEntry.galleryImages = normalizeImageList(galleryImages).slice(0, maxGallery)
        }
        commitEntry(nextEntry)
      } catch (error) {
        setUploadError(error.message)
      } finally {
        setUploading(false)
        onUploadChange?.(-1)
      }
    }
    const removeGalleryImage = (color, galleryIndex) => {
      const current = entryFor(color)
      commitEntry({ ...current, galleryImages: (current.galleryImages || []).filter((_, index) => index !== galleryIndex) })
    }
    return (<div className={'admin-field color-image-field ' + (field.wide ? 'wide' : '')}><label>{field.label}{field.required && <b> *</b>}</label>{colors.length === 0 ? <div className='color-image-empty'>Select or type colours first.</div> : <div className='color-image-grid'>{colors.map((color) => { const entry = entryFor(color); return <figure key={color}><span>{color}</span><div className='color-image-main'>{entry.url ? <><img src={entry.url} alt={entry.alt || color} /><small className='image-file-meta'>{imageMetaText(entry) || 'Main image'}</small></> : <AdminIcon name='image' />}</div><label className='color-main-picker'>{entry.url ? 'Replace main image' : 'Add main image'}<input type='file' accept={field.accept || 'image/*'} disabled={uploading} onChange={(event) => { uploadForColor(color, event.target.files?.[0], 'main'); event.target.value = '' }} /></label><div className='color-gallery-slots'>{Array.from({ length: maxGallery }, (_, index) => { const image = entry.galleryImages?.[index]; return <div className='color-gallery-slot' key={index}><div>{image?.url ? <><img src={image.url} alt={image.alt || color + ' image ' + (index + 1)} /><small className='image-file-meta'>{imageMetaText(image) || 'Image ' + (index + 1)}</small></> : <AdminIcon name='image' />}</div><label>{image?.url ? 'Replace image ' + (index + 1) : 'Add image ' + (index + 1)}<input type='file' accept={field.accept || 'image/*'} disabled={uploading} onChange={(event) => { uploadForColor(color, event.target.files?.[0], 'gallery', index); event.target.value = '' }} /></label>{image?.url && <button className='color-gallery-remove' type='button' onClick={() => removeGalleryImage(color, index)}>Remove</button>}</div> })}</div></figure> })}</div>}{field.requirements && <ul className='upload-requirements'>{field.requirements.map((item) => <li key={item}>{item}</li>)}</ul>}{uploadError && <small className='upload-error'>{uploadError}</small>}{field.hint && <small>{field.hint}</small>}</div>)
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
  const [form, setForm] = useState(() => emptyFromFields(fields, config.defaultValues))
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [mainCategoryFilter, setMainCategoryFilter] = useState('all')
  const [extraFilters, setExtraFilters] = useState({})
  const [sortKey, setSortKey] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [columnFilterKey, setColumnFilterKey] = useState('all')
  const [columnFilterValue, setColumnFilterValue] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: '', message: '' })
  const [uploadingCount, setUploadingCount] = useState(0)
  const [previewingBlog, setPreviewingBlog] = useState(false)
  const [productPreviewMode, setProductPreviewMode] = useState('')
  const [trackingSetting, setTrackingSetting] = useState({ enabled: false, loading: false, startedAt: null, stoppedAt: null })
  const lastOpenTokenRef = useRef(openToken)
  const detailImage = viewing?.imageUrl || viewing?.logoUrl
  const isBlogForm = resource === 'blogs'
  const isProductForm = Boolean(config.productPreview && productPreviewMeta[resource])

  const lookupNames = useMemo(() => [...new Set([...fields.map((field) => field.lookup).filter(Boolean), ...((config.showMainCategories || config.subCategorySections || config.mainCategoryFilterField) ? ['categories'] : [])])], [config.showMainCategories, config.subCategorySections, config.mainCategoryFilterField, fields])

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
      setNotice({ kind: 'error', message: `${error.message}. Please check that the backend server is running.` })
    } finally {
      setLoading(false)
    }
  }, [lookupNames, resource])

  const loadTrackingSetting = useCallback(async () => {
    if (!config.trackingControl) return
    setTrackingSetting((current) => ({ ...current, loading: true }))
    try {
      const setting = await api.get('/website-activities/settings')
      setTrackingSetting({ enabled: Boolean(setting.enabled), loading: false, startedAt: setting.startedAt || null, stoppedAt: setting.stoppedAt || null })
    } catch {
      setTrackingSetting((current) => ({ ...current, loading: false }))
    }
  }, [config.trackingControl])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadTrackingSetting() }, [loadTrackingSetting])
  useEffect(() => {
    if (openToken > lastOpenTokenRef.current) {
      lastOpenTokenRef.current = openToken
      setEditing(null)
      setForm(emptyFromFields(fields, config.defaultValues))
      setIsFormOpen(true)
    }
  }, [openToken, fields, config.defaultValues])
  useEffect(() => { if (!isFormOpen) { setPreviewingBlog(false); setProductPreviewMode('') } }, [isFormOpen])

  const mainCategories = useMemo(() => {
    if (!config.showMainCategories && !config.subCategorySections && !config.mainCategoryFilterField) return []
    const sourceCategories = lookups.categories?.length ? lookups.categories : items
    let directRoots = sourceCategories.filter((item) => !(item.parentId?._id || item.parentId))
    if (config.mainCategoryParentSlug) {
      const requestedSlug = normalizeSlug(config.mainCategoryParentSlug)
      const parent = sourceCategories.find((item) => normalizeSlug(item.slug || item.name) === requestedSlug && !idOf(item.parentId))
      const parentId = idOf(parent?._id)
      directRoots = parentId ? sourceCategories.filter((item) => idOf(item.parentId) === parentId) : []
    }
    const rootsFromSubCategories = config.subCategorySections
      ? uniqueById(items)
        .filter((item) => item.parentId?._id || item.parentId)
        .map((item) => ({ name: categoryRootName(item, sourceCategories), group: 'Main', status: 'active' }))
      : []
    return uniqueMainCategories([...directRoots, ...rootsFromSubCategories])
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.name || '').localeCompare(String(b.name || '')))
  }, [config.showMainCategories, config.subCategorySections, config.mainCategoryFilterField, config.mainCategoryParentSlug, items, lookups.categories])
  const subCategoryStats = useMemo(() => {
    if (!config.subCategorySections) return {}
    const sourceCategories = uniqueById(lookups.categories?.length ? lookups.categories : items)
    const byId = new Map(sourceCategories.map((item) => [idOf(item._id), item]))
    const rootFor = (item) => categoryRootName(item, sourceCategories)
    return sourceCategories.reduce((stats, item) => {
      const parentId = idOf(item.parentId)
      if (!parentId) return stats
      const rootName = rootFor(item)
      const parent = byId.get(parentId)
      const parentHasParent = Boolean(parent && idOf(parent.parentId))
      const current = stats[rootName] || { parents: 0, subcategories: 0 }
      if (parentHasParent) current.subcategories += 1
      else current.parents += 1
      stats[rootName] = current
      return stats
    }, {})
  }, [config.subCategorySections, items, lookups.categories])
  const mainCategoryItemStats = useMemo(() => {
    if (!config.mainCategoryFilterField) return {}
    return uniqueById(items).reduce((stats, item) => {
      const name = itemMainCategoryName(item, config.mainCategoryFilterField, lookups.categories || [], config.mainCategoryParentSlug)
      stats[name] = (stats[name] || 0) + 1
      return stats
    }, {})
  }, [config.mainCategoryFilterField, items, lookups.categories]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return uniqueById(items).filter((item) => {
      if (config.filterGroup && item.group !== config.filterGroup) return false
      const parentId = item.parentId?._id || item.parentId
      if (config.categoryLevel === 'main' && parentId) return false
      if (config.fixedMainCategoryOnly && !fixedMainCategoryNames.has(String(item.name || item.group || ''))) return false
      if (config.categoryLevel === 'sub' && !parentId) return false
      if (config.categoryMode === 'vehicle-primary' && !config.primarySlugs.includes(item.slug)) return false
      if (config.categoryMode === 'vehicle-sub' && (item.slug === 'vehicles' || config.primarySlugs.includes(item.slug))) return false
      if (config.subCategorySections && mainCategoryFilter !== 'all' && categoryRootName(item, lookups.categories || items) !== mainCategoryFilter) return false
      if (config.mainCategoryFilterField && mainCategoryFilter !== 'all' && itemMainCategoryName(item, config.mainCategoryFilterField, lookups.categories || [], config.mainCategoryParentSlug) !== mainCategoryFilter) return false
      if (config.fixedValues && Object.entries(config.fixedValues).some(([key, expected]) => String(valueAt(item, key) ?? '') !== String(expected))) return false
      if (config.categoryFilter) {
        const categoryValue = valueAt(item, config.categoryFilter.field)
        const categoryId = categoryValue?._id || categoryValue
        const allowedCategoryIds = new Set([String(config.categoryFilter.id)])
        if (config.categoryFilter.includeDescendants) {
          let added = true
          while (added) {
            added = false
            ;(lookups.categories || []).forEach((category) => {
              const parentId = String(category.parentId?._id || category.parentId || '')
              const id = String(category._id || '')
              if (parentId && allowedCategoryIds.has(parentId) && id && !allowedCategoryIds.has(id)) {
                allowedCategoryIds.add(id)
                added = true
              }
            })
          }
        }
        if (!allowedCategoryIds.has(String(categoryId || ''))) return false
      }
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = !query || columns.some((column) => tableCellText(item, column, lookups).toLowerCase().includes(query))
      const selectedColumn = columns.find((column) => column.key === columnFilterKey)
      const matchesColumnFilter = !selectedColumn || columnFilterValue === 'all' || tableCellText(item, selectedColumn, lookups) === columnFilterValue
      const matchesExtra = (config.filters || []).every((filter) => {
        const selected = extraFilters[filter.key] || 'all'
        if (selected === 'all') return true
        const value = valueAt(item, filter.key)
        if (filter.type !== 'date') return String(value || '') === selected
        const date = new Date(value)
        const now = new Date()
        if (selected === 'today') return date.toDateString() === now.toDateString()
        const days = selected === '7days' ? 7 : selected === '365days' ? 365 : 30
        return date >= new Date(now.getTime() - days * 86400000)
      })
      return matchesStatus && matchesSearch && matchesColumnFilter && matchesExtra
    })
  }, [columnFilterKey, columnFilterValue, columns, config.categoryFilter, config.categoryLevel, config.categoryMode, config.filterGroup, config.filters, config.fixedMainCategoryOnly, config.fixedValues, config.primarySlugs, config.subCategorySections, config.mainCategoryFilterField, config.mainCategoryParentSlug, extraFilters, items, lookups, mainCategoryFilter, search, statusFilter])

  const sortableColumns = useMemo(() => columns.filter((column) => !column.image), [columns])
  const activeSortColumn = sortableColumns.find((column) => column.key === sortKey) || sortableColumns[0]
  const sortedItems = useMemo(() => {
    if (!activeSortColumn) return visibleItems
    return [...visibleItems].sort((a, b) => compareTableRows(a, b, activeSortColumn, sortDirection, lookups))
  }, [activeSortColumn, lookups, sortDirection, visibleItems])
  const columnFilterOptions = useMemo(() => {
    if (columnFilterKey === 'all') return []
    const column = columns.find((entry) => entry.key === columnFilterKey)
    if (!column) return []
    return [...new Set(uniqueById(items).map((item) => tableCellText(item, column, lookups)).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  }, [columnFilterKey, columns, items, lookups])
  const handleHeaderSort = (column) => {
    if (column.image) return
    if (sortKey === column.key) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortKey(column.key)
    setSortDirection('asc')
  }
  const clearTableFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setMainCategoryFilter('all')
    setExtraFilters({})
    setColumnFilterKey('all')
    setColumnFilterValue('all')
    setSortKey('')
    setSortDirection('asc')
  }
  const mainCategorySections = useMemo(() => {
    if (!config.mainCategorySections) return null
    const fixedOrder = ['Vehicles', 'Spare Parts', 'Services', 'Finance & Insurance', 'Tools & Calculators']
    const slugFor = (name) => name.toLowerCase().replace(/\s+/g, '-')
    const isProductCategory = (item) => fixedMainCategoryNames.has(String(item.name || item.group || '')) || fixedOrder.some((name) => String(item.slug || '').toLowerCase() === slugFor(name))
    const productItems = fixedOrder.map((name) => sortedItems.find((item) => item.name === name || String(item.slug || '').toLowerCase() === slugFor(name))).filter(Boolean)
    const otherItems = sortedItems.filter((item) => !isProductCategory(item))
    if (config.fixedMainCategoryOnly) return [
      { key: 'product', title: 'Product Main Categories', description: 'Vehicles, Spare Parts, Services, Finance & Insurance and Tools & Calculators', items: productItems },
    ]
    return [
      { key: 'product', title: 'Part 1 - Product Main Categories', description: 'Vehicles, Spare Parts, Services, Finance & Insurance and Tools & Calculators', items: productItems },
      { key: 'other', title: 'Part 2 - Other Main Categories', description: 'Remaining main website categories', items: otherItems },
    ]
  }, [config.fixedMainCategoryOnly, config.mainCategorySections, sortedItems])

  const subCategorySections = useMemo(() => {
    if (!config.subCategorySections) return null
    const priority = ['Vehicles', 'Spare Parts', 'Services', 'Finance & Insurance', 'Tools & Calculators']
    const groups = new Map()
    visibleItems.forEach((item) => {
      const title = categoryRootName(item, lookups.categories || items)
      if (!groups.has(title)) groups.set(title, [])
      groups.get(title).push(item)
    })
    return [...groups.entries()]
      .sort(([a], [b]) => {
        const indexA = priority.indexOf(a)
        const indexB = priority.indexOf(b)
        if (indexA !== -1 || indexB !== -1) return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
        return a.localeCompare(b)
      })
      .map(([title, sectionItems]) => ({ key: title, title, description: 'Main category', items: sectionItems }))
  }, [config.subCategorySections, items, lookups.categories, visibleItems])

  const groupedMainCategorySections = useMemo(() => {
    if (!config.groupedByMainCategory || !config.mainCategoryFilterField) return null
    const sections = mainCategories
      .map((category) => ({
        key: category._id || category.name,
        title: category.name,
        description: 'Top category',
        items: sortedItems.filter((item) => itemMainCategoryName(item, config.mainCategoryFilterField, lookups.categories || [], config.mainCategoryParentSlug) === category.name),
      }))
      .filter((section) => section.items.length)
    const unassignedItems = sortedItems.filter((item) => itemMainCategoryName(item, config.mainCategoryFilterField, lookups.categories || [], config.mainCategoryParentSlug) === 'Unassigned Brands')
    if (unassignedItems.length) sections.push({ key: 'unassigned-brands', title: 'Unassigned Brands', description: 'Needs top category', items: unassignedItems })
    return sections.length ? sections : null
  }, [config.groupedByMainCategory, config.mainCategoryFilterField, config.mainCategoryParentSlug, lookups.categories, mainCategories, sortedItems])

  const tableSections = mainCategorySections || subCategorySections || groupedMainCategorySections
  const canFilterMainCategories = Boolean(config.subCategorySections || config.mainCategoryFilterField)
  const renderTableRows = (rows) => rows.map((item) => (
    <tr key={item._id}>
      {columns.map((column) => {
        const value = valueAt(item, column.key)
        return (
          <td key={column.key}>
            {column.image ? (() => {
              const imageValue = value || (column.fallback === 'brandLogo' ? brandLogoFromName(item) : '')
              return imageValue ? <img className="table-image" src={imageValue} alt="" /> : <span className="table-image placeholder">{(item.name || item.title || '?')[0]}</span>
            })() : column.status ? (
              <span className={`status-chip ${value}`}>{value}</span>
            ) : column.boolean ? (
              <span className={value ? 'featured-yes' : 'muted'}>{value ? 'Yes' : 'No'}</span>
            ) : column.money ? (
              `Rs ${Number(value || 0).toLocaleString('en-IN')}`
            ) : (
              <span className={column.primary ? 'cell-primary' : ''}>{column.format ? column.format(value, item, lookups) : displayValue(value, column, item)}</span>
            )}
          </td>
        )
      })}
      <td className="actions-cell"><button type="button" onClick={() => setViewing(item)} aria-label="View"><AdminIcon name="eye" /></button>{!config.noEdit && !fixedMainCategoryNames.has(item.name) && <button type="button" onClick={() => openEdit(item)} aria-label="Edit"><AdminIcon name="edit" /></button>}{!config.noDelete && !fixedMainCategoryNames.has(item.name) && <button className="danger" type="button" onClick={() => handleDelete(item)} aria-label="Delete"><AdminIcon name="trash" /></button>}</td>
    </tr>
  ))
  const openCreate = () => {
    setEditing(null)
    setForm(emptyFromFields(fields, config.defaultValues))
    setNotice({ kind: '', message: '' })
    setPreviewingBlog(false)
    setIsFormOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm(Object.fromEntries(fields.map((field) => {
      let value = valueAt(item, field.name)
      if (field.lookup && value && typeof value === 'object') value = value._id
      if (field.name === 'tags' && Array.isArray(value)) value = value.join(', ')
      if (['features', 'vehicleTypes', 'compatibleVehicleTypes', 'brands'].includes(field.name) && Array.isArray(value)) value = value.join(', ')
      if (field.name === 'color' && Array.isArray(value)) value = value.join(', ')
      if (field.name === 'colorImages') value = normalizeColorImageList(value)
      if (field.name === 'sections' && value && typeof value === 'object') value = JSON.stringify(value, null, 2)
      if (field.name === 'specifications' && value && typeof value === 'object') value = specTextFromObject(value)
      if (field.name === 'details' && value && typeof value === 'object') value = value.intro || value.html || JSON.stringify(value, null, 2)
      return [field.name, value ?? (field.type === 'checkbox' ? false : '')]
    })))
    setNotice({ kind: '', message: '' })
    setPreviewingBlog(false)
    setIsFormOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice({ kind: '', message: '' })
    try {
      const payload = { ...config.defaultValues, ...config.fixedValues, ...Object.fromEntries(Object.entries(form).map(([key, value]) => {
        const field = fields.find((entry) => entry.name === key)
        if (field?.type === 'number') return [key, value === '' ? 0 : Number(value)]
        return [key, value]
      })) }
      if (Array.isArray(form.colorImages)) {
        payload.colorImages = normalizeColorImageList(form.colorImages)
        const derivedImages = vehicleImagesFromColorImages(payload.colorImages)
        payload.imageUrl = derivedImages.imageUrl || payload.imageUrl || ''
        payload.galleryImages = derivedImages.galleryImages.slice(0, 4)
        if (resource === 'vehicles' && !payload.imageUrl) throw new Error('Add at least one colour main image.')
      }
      delete payload.mainVehicleImages
      for (const field of fields) {
        const minFiles = Number(field.minFiles) || 0
        const filesValue = payload[field.name]
        if (field.type === 'files' && minFiles && (!Array.isArray(filesValue) || filesValue.length < minFiles)) throw new Error(`${field.label} needs at least ${minFiles} images.`)
      }
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

  const toggleWebsiteTracking = async () => {
    if (!config.trackingControl || trackingSetting.loading) return
    const nextEnabled = !trackingSetting.enabled
    setTrackingSetting((current) => ({ ...current, loading: true }))
    try {
      const setting = await api.post('/website-activities/settings', { enabled: nextEnabled })
      setTrackingSetting({ enabled: Boolean(setting.enabled), loading: false, startedAt: setting.startedAt || null, stoppedAt: setting.stoppedAt || null })
      setNotice({ kind: 'success', message: setting.enabled ? 'Website activity tracking started.' : 'Website activity tracking stopped.' })
      await load()
    } catch (error) {
      setTrackingSetting((current) => ({ ...current, loading: false }))
      setNotice({ kind: 'error', message: error.message })
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
      <Notice kind={notice.kind}>{notice.message}</Notice>

      {(config.showMainCategories || config.subCategorySections || config.mainCategoryFilterField) && mainCategories.length > 0 && (
        <div className='category-overview-strip'>
          {canFilterMainCategories && <button type='button' className={mainCategoryFilter === 'all' ? 'active' : ''} onClick={() => setMainCategoryFilter('all')}><span>View</span><strong>All Top Categories</strong><small>{config.mainCategoryFilterField ? `${uniqueById(items).length} brands` : `${uniqueById(items).filter((item) => item.parentId?._id || item.parentId).length} records`}</small></button>}
          {mainCategories.map((category) => {
            const stats = subCategoryStats[category.name] || { parents: 0, subcategories: 0 }
            const recordCount = mainCategoryItemStats[category.name] || 0
            return <button type='button' className={mainCategoryFilter === category.name ? 'active' : ''} key={category._id || category.name} onClick={() => canFilterMainCategories && setMainCategoryFilter(category.name)}><span>{category.group || 'Main'}</span><strong>{category.name}</strong><small>{config.mainCategoryFilterField ? `${recordCount} brands` : config.subCategorySections ? `Parents ${stats.parents} | Subcate ${stats.subcategories}` : category.status || 'active'}</small></button>
          })}
        </div>
      )}

      {!config.simple && <div className='manager-metrics'>
        <div><span>All records</span><strong>{visibleItems.length}</strong></div>
        <div><span>Live / active</span><strong>{visibleItems.filter((item) => ['active', 'published'].includes(item.status)).length}</strong></div>
        <div><span>Draft</span><strong>{visibleItems.filter((item) => item.status === 'draft').length}</strong></div>
        <div><span>Featured</span><strong>{visibleItems.filter((item) => item.featured).length}</strong></div>
      </div>}

      {config.trackingControl && <section className={`activity-tracking-control ${trackingSetting.enabled ? 'running' : ''}`}>
        <div>
          <span>Tracking status</span>
          <strong>{trackingSetting.enabled ? 'Running' : 'Stopped'}</strong>
          <small>{trackingSetting.enabled ? `Started ${trackingSetting.startedAt ? new Date(trackingSetting.startedAt).toLocaleString('en-IN') : 'now'}` : `Stopped ${trackingSetting.stoppedAt ? new Date(trackingSetting.stoppedAt).toLocaleString('en-IN') : 'until admin starts it'}`}</small>
        </div>
        <button className={trackingSetting.enabled ? 'admin-secondary' : 'admin-primary'} type='button' disabled={trackingSetting.loading} onClick={toggleWebsiteTracking}>{trackingSetting.loading ? 'Updating...' : trackingSetting.enabled ? 'Stop Tracking' : 'Start Tracking'}</button>
      </section>}

      {config.activityChart && <WebsiteActivityChart items={items} />}
<section className="data-panel">
        <div className="data-toolbar">
          <div className="search-box"><AdminIcon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} /></div>
          {canFilterMainCategories && mainCategories.length > 0 && <select className='toolbar-filter' value={mainCategoryFilter} onChange={(event) => setMainCategoryFilter(event.target.value)} aria-label='Filter by main category'><option value='all'>All top categories</option>{mainCategories.map((category) => <option value={category.name} key={category._id}>{category.name}</option>)}</select>}
          <select className='toolbar-filter' value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label='Filter by status'>
            <option value='all'>All statuses</option>
            {[...new Set(items.map((item) => item.status).filter(Boolean))].map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
          <select className='toolbar-filter' value={activeSortColumn?.key || ''} onChange={(event) => { setSortKey(event.target.value); setSortDirection('asc') }} aria-label='Sort by column'>
            {sortableColumns.map((column) => <option value={column.key} key={column.key}>Sort: {column.label}</option>)}
          </select>
          <button className='sort-direction-button' type='button' onClick={() => setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')}>{sortDirection === 'asc' ? 'A-Z / 0-9' : 'Z-A / 9-0'}</button>
          <select className='toolbar-filter' value={columnFilterKey} onChange={(event) => { setColumnFilterKey(event.target.value); setColumnFilterValue('all') }} aria-label='Filter column'>
            <option value='all'>Filter column</option>
            {sortableColumns.map((column) => <option value={column.key} key={column.key}>{column.label}</option>)}
          </select>
          {columnFilterKey !== 'all' && <select className='toolbar-filter' value={columnFilterValue} onChange={(event) => setColumnFilterValue(event.target.value)} aria-label='Filter value'>
            <option value='all'>All values</option>
            {columnFilterOptions.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>}
          <button className='clear-table-filters' type='button' onClick={clearTableFilters}>Clear</button>
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
          <div className="admin-empty"><span className="empty-symbol">+</span><h3>No {config.title.toLowerCase()} found</h3><p>{config.noCreate ? 'No activity has been recorded yet.' : `Add your first ${config.singular.toLowerCase()} to get started.`}</p></div>
        ) : (
          <div className="table-scroll">
            <table className="resource-table">
              <thead><tr>{columns.map((column) => <th key={column.key}><button className="table-sort-button" type="button" disabled={column.image} onClick={() => handleHeaderSort(column)}>{column.label}<span>{activeSortColumn?.key === column.key ? (sortDirection === 'asc' ? 'A-Z' : 'Z-A') : 'Sort'}</span></button></th>)}<th className="actions-cell">Actions</th></tr></thead>
              <tbody>
                {tableSections
                  ? tableSections.map((section) => (
                    <Fragment key={section.key}>
                      <tr className='table-section-row'><td colSpan={columns.length + 1}><strong>{section.title}</strong><span>{section.description} - {section.items.length} records</span></td></tr>
                      {section.items.length ? renderTableRows(section.items) : <tr className='table-empty-row'><td colSpan={columns.length + 1}>No records in this section</td></tr>}
                    </Fragment>
                  ))
                  : renderTableRows(sortedItems)}
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
              {fields.filter((field) => !['imageUrl', 'logoUrl', 'galleryImages'].includes(field.name)).map((field) => <div className={field.wide ? 'wide' : ''} key={field.name}><span>{field.label}</span><strong>{displayValue(valueAt(viewing, field.name), field, viewing)}</strong></div>)}
              {viewing.galleryImages?.length > 0 && <div className='wide'><span>{config.productPreview ? 'Product gallery images' : 'Article content images'}</span><div className='detail-gallery'>{viewing.galleryImages.map((image, index) => <img src={image.url} alt={image.alt || `${config.productPreview ? 'Product' : 'Article'} image ${index + 1}`} key={`${image.url}-${index}`} />)}</div></div>}
            </div>
            <footer><button className='admin-secondary' type='button' onClick={() => setViewing(null)}>Close</button>{!config.noEdit && !fixedMainCategoryNames.has(viewing.name) && <button className='admin-primary' type='button' onClick={() => { const item = viewing; setViewing(null); openEdit(item) }}><AdminIcon name='edit' /> Edit {config.singular}</button>}</footer>
          </section>
        </div>
      )}

      {isFormOpen && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsFormOpen(false)}>
          <section className={`admin-modal ${isBlogForm ? 'blog-editor-modal' : ''} ${isProductForm ? 'product-editor-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="resource-form-title">
            <header><div><p className="eyebrow">{editing ? 'Edit existing' : 'Create new'}</p><h2 id="resource-form-title">{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close"><AdminIcon name="close" /></button></header>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                {fields.map((field) => <Field key={field.name} field={field} value={form[field.name]} form={form} lookups={lookups} onUploadChange={(delta) => setUploadingCount((count) => Math.max(0, count + delta))} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />)}
              </div>
              <footer>{isBlogForm && <button className="admin-secondary" type="button" onClick={() => setPreviewingBlog(true)}><AdminIcon name="eye" /> Preview Blog</button>}{isProductForm && <button className="admin-secondary" type="button" onClick={() => setProductPreviewMode('card')}><AdminIcon name="eye" /> Card Preview</button>}{isProductForm && <button className="admin-secondary" type="button" onClick={() => setProductPreviewMode('page')}><AdminIcon name="eye" /> Single Page Preview</button>}<button className="admin-secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="admin-primary" type="submit" disabled={saving || uploadingCount > 0}>{uploadingCount > 0 ? 'Uploading image...' : saving ? 'Saving...' : editing ? `Update ${config.singular}` : `Create ${config.singular}`}</button></footer>
            </form>
          </section>
          {isBlogForm && previewingBlog && <BlogPagePreview form={form} editing={editing} relatedPosts={items} onBack={() => setPreviewingBlog(false)} />}
          {isProductForm && productPreviewMode && <ProductFormPreview form={form} resource={resource} lookups={lookups} editing={editing} mode={productPreviewMode} onBack={() => setProductPreviewMode('')} />}
        </div>
      )}
    </div>
  )
}
