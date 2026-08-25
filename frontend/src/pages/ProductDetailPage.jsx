import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MarketplaceShell } from './MarketplacePage.jsx'
import vehicleFallback from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import partFallback from '../assets/Images/Home/images/automobile-tyres-alloy-wheels-banner.png'
import serviceFallback from '../assets/Images/service-spare-parts/expert-car-service-workshop.jpg'
import './product-detail.css'

const configs = {
  vehicles: { label: 'Vehicle', backLabel: 'All Vehicles', backUrl: '/vehicles', source: 'vehicle', fallback: vehicleFallback, priceLabel: 'Starting price' },
  parts: { label: 'Spare Part', backLabel: 'All Spare Parts', backUrl: '/spare-parts', source: 'part', fallback: partFallback, priceLabel: 'Product price' },
  services: { label: 'Vehicle Service', backLabel: 'All Services', backUrl: '/services', source: 'service', fallback: serviceFallback, priceLabel: 'Service starts from' },
}

const money = (value) => Number(value) > 0 ? '₹' + Number(value).toLocaleString('en-IN') : 'Price on enquiry'
const categoryName = (value) => typeof value === 'string' ? value : value?.name || ''
const printable = (value) => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value) return value.name || ''
  return value
}
const present = (value) => value !== undefined && value !== null && value !== ''

function productFacts(kind, product) {
  if (kind === 'vehicles') return [
    ['Brand', product.brand?.name],
    ['Category', product.category?.name],
    ['Vehicle type', product.vehicleType],
    ['Variant', product.variant],
    ['Model year', product.modelYear],
    ['Condition', product.condition],
    ['Fuel type', product.fuelType],
    ['Transmission', product.transmission],
    ['Kilometres driven', product.condition === 'used' ? Number(product.mileage || 0).toLocaleString('en-IN') + ' km' : 'New vehicle'],
    ['Location', product.location],
    ['Colour', product.color],
    ['Seating / capacity', product.seatingCapacity],
  ]
  if (kind === 'parts') return [
    ['Part number', product.partNumber],
    ['Brand', product.brand],
    ['Category', product.categoryId?.name || product.category],
    ['Category group', product.categoryGroup],
    ['Stock available', product.stock],
    ['Compatible vehicles', product.compatibleVehicleTypes],
  ]
  return [
    ['Service category', product.category],
    ['Duration', product.duration],
    ['Available for', product.vehicleTypes],
  ]
}

export default function ProductDetailPage({ kind }) {
  const { identifier } = useParams()
  const config = configs[kind]
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.get('/public/products/' + kind + '/' + encodeURIComponent(identifier))
      .then((data) => { if (active) setProduct(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [identifier, kind])

  useEffect(() => {
    document.title = product ? product.name + ' | Bright Auto Hub' : config.label + ' | Bright Auto Hub'
    const description = product?.description || 'View complete product information and send an enquiry to Bright Auto Hub.'
    document.querySelector('meta[name=description]')?.setAttribute('content', description)
  }, [config.label, product])

  const facts = useMemo(() => product ? productFacts(kind, product).filter(([, value]) => present(value)) : [], [kind, product])
  const specifications = useMemo(() => {
    if (!product?.specifications || typeof product.specifications !== 'object' || Array.isArray(product.specifications)) return []
    return Object.entries(product.specifications).filter(([, value]) => present(value))
  }, [product])
  const features = kind === 'services' ? product?.features || [] : []
  const enquiryUrl = product ? '/contact?' + new URLSearchParams({
    subject: config.label + ' enquiry',
    item: product.name,
    source: config.source,
    category: categoryName(product.categoryId) || categoryName(product.category) || product.vehicleType || '',
    page: typeof window === 'undefined' ? '' : window.location.pathname,
  }).toString() : config.backUrl

  if (loading) return <MarketplaceShell><div className='product-detail-state'><span className='product-detail-loader'/><h1>Loading product...</h1></div></MarketplaceShell>
  if (error || !product) return <MarketplaceShell><div className='product-detail-state error'><small>PRODUCT UNAVAILABLE</small><h1>We could not find this product.</h1><p>{error}</p><Link to={config.backUrl}>Back to {config.backLabel}</Link></div></MarketplaceShell>

  const chips = kind === 'vehicles'
    ? [product.vehicleType, product.fuelType, product.transmission, product.condition]
    : kind === 'parts'
      ? [categoryName(product.categoryId) || product.category, product.brand, product.stock > 0 ? 'In stock' : 'Contact for stock']
      : [product.category, product.duration, ...(product.vehicleTypes || [])]

  return <MarketplaceShell>
    <main className='product-detail-page'>
      <nav className='market-wrap product-detail-wrap product-detail-breadcrumb' aria-label='Breadcrumb'>
        <Link to='/'>Home</Link><span>/</span><Link to={config.backUrl}>{config.backLabel}</Link><span>/</span><strong>{product.name}</strong>
      </nav>

      <section className='market-wrap product-detail-wrap product-detail-hero'>
        <div className='product-detail-visual'>
          <span>{product.featured ? 'FEATURED' : kind === 'parts' ? 'GENUINE PRODUCT' : 'VERIFIED LISTING'}</span>
          <img src={product.imageUrl || config.fallback} alt={product.name} />
        </div>
        <div className='product-detail-summary'>
          <p className='product-detail-kicker'>{config.label.toUpperCase()} · LIVE FROM ADMIN</p>
          <h1>{product.name}</h1>
          <div className='product-detail-chips'>{chips.filter(Boolean).map((chip) => <span key={chip}>{String(chip)}</span>)}</div>
          <p className='product-detail-description'>{product.description || 'Contact our automotive team for complete information, availability and expert assistance.'}</p>
          <div className='product-detail-price'>
            <small>{config.priceLabel}</small>
            <strong>{money(product.price)}</strong>
            {kind === 'parts' && product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}
          </div>
          <div className='product-detail-actions'>
            <Link className='product-detail-primary' to={enquiryUrl}>Enquire Now</Link>
            <Link className='product-detail-secondary' to={config.backUrl}>View More {config.backLabel}</Link>
          </div>
          <div className='product-detail-trust'><span>✓ Verified details</span><span>✓ Expert support</span><span>✓ Transparent enquiry</span></div>
        </div>
      </section>

      <section className='market-wrap product-detail-wrap product-detail-content'>
        <article>
          <p className='product-detail-kicker'>PRODUCT INFORMATION</p>
          <h2>Complete Details</h2>
          <div className='product-fact-grid'>{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{printable(value)}</strong></div>)}</div>
        </article>

        <aside>
          <p className='product-detail-kicker'>{features.length ? 'PACKAGE INCLUDES' : specifications.length ? 'SPECIFICATIONS' : 'WHY BRIGHT AUTO HUB'}</p>
          <h2>{features.length ? 'Service Features' : specifications.length ? 'Technical Specifications' : 'Expert Assistance'}</h2>
          {features.length
            ? <ul>{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
            : specifications.length
              ? <div className='product-spec-list'>{specifications.map(([label, value]) => <div key={label}><span>{label}</span><strong>{printable(value)}</strong></div>)}</div>
              : <ul><li>✓ MongoDB-powered live information</li><li>✓ Compatibility and availability guidance</li><li>✓ Direct support from our automotive team</li></ul>}
        </aside>
      </section>

      <section className='market-wrap product-detail-wrap product-detail-cta'>
        <div><small>NEED MORE INFORMATION?</small><h2>Ask about {product.name}.</h2><p>Send your requirement and our team will help with price, availability and the next steps.</p></div>
        <Link to={enquiryUrl}>Send Product Enquiry →</Link>
      </section>
    </main>
  </MarketplaceShell>
}
