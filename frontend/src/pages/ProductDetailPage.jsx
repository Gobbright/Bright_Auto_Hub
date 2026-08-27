import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { addVehicleToCompare, MarketplaceShell } from './MarketplacePage.jsx'
import vehicleFallback from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import partFallback from '../assets/Images/Home/images/automobile-tyres-alloy-wheels-banner.png'
import serviceFallback from '../assets/Images/service-spare-parts/expert-car-service-workshop.jpg'
import './product-detail.css'

const configs = {
  vehicles: { label: 'Vehicle', backLabel: 'All Vehicles', backUrl: '/vehicles', source: 'vehicle', fallback: vehicleFallback, priceLabel: 'Latest price' },
  parts: { label: 'Spare Part', backLabel: 'All Spare Parts', backUrl: '/spare-parts', source: 'part', fallback: partFallback, priceLabel: 'Latest price' },
  services: { label: 'Vehicle Service', backLabel: 'All Services', backUrl: '/services', source: 'service', fallback: serviceFallback, priceLabel: 'Latest price' },
}

const priceOnEnquiry = 'Price on enquiry'
const listKeyForKind = { vehicles: 'vehicles', parts: 'parts', services: 'services' }
const siteSlugForKind = { vehicles: 'vehicles', parts: 'spare-parts', services: 'services' }
const categoryName = (value) => typeof value === 'string' ? value : value?.name || ''
const printable = (value) => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value) return value.name || ''
  return value
}
const present = (value) => value !== undefined && value !== null && value !== ''
const itemKey = (item = {}) => String(item._id || item.slug || item.name || '')
const itemCategoryLabel = (item = {}) => categoryName(item.categoryId) || categoryName(item.category) || item.categoryGroup || item.vehicleType || item.group || ''
const itemBrandLabel = (item = {}) => typeof item.brand === 'string' ? item.brand : item.brand?.name || ''
const productRoute = (kind, item = {}) => {
  const segment = kind === 'parts' ? 'spare-parts' : kind
  return `/${segment}/product/${item.slug || item._id}`
}
const enquiryRoute = (config, item = {}) => '/contact?' + new URLSearchParams({
  subject: config.label + ' enquiry',
  item: item.name || 'Product enquiry',
  source: config.source,
  category: itemCategoryLabel(item),
  page: typeof window === 'undefined' ? '' : window.location.pathname,
}).toString()
const relatedScore = (product, candidate) => {
  let score = 0
  const productCategory = itemCategoryLabel(product).toLowerCase()
  const candidateCategory = itemCategoryLabel(candidate).toLowerCase()
  const productParent = product?.category?.parentId?.slug || product?.categoryId?.parentId?.slug || ''
  const candidateParent = candidate?.category?.parentId?.slug || candidate?.categoryId?.parentId?.slug || ''
  if (productCategory && candidateCategory && productCategory === candidateCategory) score += 4
  if (productParent && candidateParent && productParent === candidateParent) score += 3
  if (product?.group && candidate?.group && product.group === candidate.group) score += 2
  if (itemBrandLabel(product) && itemBrandLabel(product) === itemBrandLabel(candidate)) score += 1
  if (candidate.featured) score += 1
  return score
}

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

const toList = (value) => Array.isArray(value) ? value.filter(Boolean).map(String) : present(value) ? [String(value)] : []
const detailObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const normalizeDetailCards = (cards) => Array.isArray(cards) ? cards.map((card) => ({
  title: String(card?.title || '').trim(),
  text: String(card?.text || card?.copy || '').trim(),
  points: toList(card?.points || card?.items),
})).filter((card) => card.title || card.text || card.points.length) : []

function defaultMoreDetails(kind, product, specifications, features) {
  const stored = detailObject(product?.details)
  const storedCards = normalizeDetailCards(stored.cards)
  const category = itemCategoryLabel(product) || configs[kind]?.label || 'Product'
  const brand = itemBrandLabel(product)
  const specificationMap = Object.fromEntries((specifications || []).map(([key, value]) => [String(key).toLowerCase(), printable(value)]))
  const vehicleContext = [brand, product?.vehicleType, category, product?.fuelType].filter(Boolean).join(' ')
  const evProduct = kind === 'vehicles' && /(electric|ev)/i.test(vehicleContext)
  const commercialProduct = kind === 'vehicles' && /(commercial|truck|pickup|bus|van|carrier)/i.test(vehicleContext)
  const serviceFeatures = toList(features)
  const compatible = toList(product?.compatibleVehicleTypes)
  const serviceVehicles = toList(product?.vehicleTypes)

  if (kind === 'parts') return {
    eyebrow: stored.eyebrow || 'SPARE PART DETAILS',
    title: stored.title || `${product.name} fitment and quality guide`,
    intro: stored.intro || `Review fitment, stock and installation guidance for ${product.name} before sending an enquiry.`,
    cards: storedCards.length ? storedCards : [
      { title: 'Fitment Check', text: 'Confirm the part number, vehicle model, production year and variant before purchase.', points: [`Part number: ${product.partNumber || 'Confirm with team'}`, `Compatible with: ${compatible.join(', ') || category}`, `Category: ${category}`] },
      { title: 'Quality And Warranty', text: 'Choose genuine-fit components with clear billing and warranty support wherever applicable.', points: ['Check packaging and batch details', 'Match old and new part before fitting', 'Ask for invoice and warranty terms'] },
      { title: 'Installation Advice', text: 'Some parts need professional fitment and post-installation testing for safe performance.', points: ['Use trained technicians', 'Inspect connected components', 'Test vehicle before regular use'] },
    ],
  }

  if (kind === 'services') return {
    eyebrow: stored.eyebrow || 'SERVICE DETAILS',
    title: stored.title || `${product.name} service workflow`,
    intro: stored.intro || `Know what is checked, how the job is handled and what support you get after the service.`,
    cards: storedCards.length ? storedCards : [
      { title: 'Inspection Flow', text: 'The service starts with a vehicle check, job-card confirmation and clear estimate.', points: ['Initial vehicle inspection', 'Issue diagnosis and estimate', `Duration: ${product.duration || 'Confirmed during booking'}`] },
      { title: 'Package Includes', text: 'Service inclusions are matched to the selected category and vehicle condition.', points: serviceFeatures.length ? serviceFeatures : ['Multi-point check', 'Fluid and wear inspection', 'Service guidance'] },
      { title: 'After-Service Support', text: 'Get practical next-step guidance for reliability, maintenance intervals and future repairs.', points: [`Available for: ${serviceVehicles.join(', ') || 'Cars, bikes and commercial vehicles'}`, 'Final quality check', 'Next maintenance reminder guidance'] },
    ],
  }

  return {
    eyebrow: stored.eyebrow || 'MORE VEHICLE DETAILS',
    title: stored.title || `${product.name} ownership highlights`,
    intro: stored.intro || `Use these extra checks to compare ${product.name} against your budget, daily route and long-term ownership needs.`,
    cards: storedCards.length ? storedCards : [
      { title: 'Best Use Case', text: evProduct ? 'Strong choice for lower running cost, quieter city driving and planned charging access.' : commercialProduct ? 'Built for business routes where payload, uptime and service support matter.' : 'Shortlist it by passenger comfort, usage pattern, fuel preference and service reach.', points: [`Segment: ${category}`, `Fuel: ${product.fuelType || specificationMap['fuel type'] || 'Confirm details'}`, `Year: ${product.modelYear || specificationMap['model year'] || 'Latest model'}`] },
      { title: evProduct ? 'EV Ownership Checks' : 'Running Cost Checks', text: evProduct ? 'Review driving range, charger access, battery warranty and service support before booking.' : 'Review mileage, service interval, tyres, brakes and insurance before you finalise.', points: evProduct ? ['Check real-world range needs', 'Confirm home or public charging plan', 'Ask about battery and charger warranty'] : ['Compare mileage and fuel type', 'Check service schedule and warranty', 'Review insurance and finance options'] },
      { title: 'Before You Enquire', text: 'Share your city, usage and budget so the team can respond with the most relevant next steps.', points: ['Ask for latest on-road estimate', 'Confirm variant and colour availability', 'Compare with similar models'] },
    ],
  }
}
export default function ProductDetailPage({ kind }) {
  const { identifier } = useParams()
  const config = configs[kind]
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const isEvProduct=kind==='vehicles'&&/(electric|\bev\b)/i.test([
    product?.group,product?.vehicleType,product?.fuelType,product?.category?.name,product?.category?.slug,
    product?.categoryId?.name,product?.categoryId?.slug,
  ].filter(Boolean).join(' '))

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

  useEffect(() => {
    if (!product) { setRelatedProducts([]); return undefined }
    let live = true
    const listKey = listKeyForKind[kind]
    api.get('/public/site/' + siteSlugForKind[kind])
      .then((data) => {
        if (!live) return
        const currentKey = itemKey(product)
        const related = (data?.[listKey] || [])
          .filter((item) => itemKey(item) !== currentKey)
          .map((item, index) => ({ item, index, score: relatedScore(product, item) }))
          .sort((a, b) => b.score - a.score || a.index - b.index)
          .slice(0, 4)
          .map(({ item }) => item)
        setRelatedProducts(related)
      })
      .catch(() => live && setRelatedProducts([]))
    return () => { live = false }
  }, [kind, product])

  const facts = useMemo(() => product ? productFacts(kind, product).filter(([, value]) => present(value)) : [], [kind, product])
  const specifications = useMemo(() => {
    if (!product?.specifications || typeof product.specifications !== 'object' || Array.isArray(product.specifications)) return []
    return Object.entries(product.specifications).filter(([, value]) => present(value))
  }, [product])
  const features = kind === 'services' ? product?.features || [] : []
  const moreDetails = useMemo(() => product ? defaultMoreDetails(kind, product, specifications, features) : null, [features, kind, product, specifications])
  const enquiryUrl = product ? '/contact?' + new URLSearchParams({
    subject: config.label + ' enquiry',
    item: product.name,
    source: config.source,
    category: categoryName(product.categoryId) || categoryName(product.category) || product.vehicleType || '',
    page: typeof window === 'undefined' ? '' : window.location.pathname,
  }).toString() : config.backUrl

  const shellActive = kind === 'parts' ? 'spare-parts' : kind
  if (loading) return <MarketplaceShell active={shellActive}><div className='product-detail-state'><span className='product-detail-loader'/><h1>Loading product...</h1></div></MarketplaceShell>
  if (error || !product) return <MarketplaceShell active={shellActive}><div className='product-detail-state error'><small>PRODUCT UNAVAILABLE</small><h1>We could not find this product.</h1><p>{error}</p><Link to={config.backUrl}>Back to {config.backLabel}</Link></div></MarketplaceShell>

  const chips = kind === 'vehicles'
    ? [product.vehicleType, product.fuelType, product.transmission, product.condition]
    : kind === 'parts'
      ? [categoryName(product.categoryId) || product.category, product.brand, product.stock > 0 ? 'In stock' : 'Contact for stock']
      : [product.category, product.duration, ...(product.vehicleTypes || [])]

  return <MarketplaceShell active={shellActive}>
    <main className={'product-detail-page'+(isEvProduct?' ev-product-detail-page':'')}>
      <nav className='market-wrap product-detail-wrap product-detail-breadcrumb' aria-label='Breadcrumb'>
        <Link to='/'>Home</Link><span>/</span><Link to={config.backUrl}>{config.backLabel}</Link><span>/</span><strong>{product.name}</strong>
      </nav>

      <section className='market-wrap product-detail-wrap product-detail-hero'>
        <div className='product-detail-visual'>
          <span>{product.featured ? 'FEATURED' : kind === 'parts' ? 'GENUINE PRODUCT' : 'VERIFIED LISTING'}</span>
          <img src={product.imageUrl || config.fallback} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = config.fallback }} />
        </div>
        <div className='product-detail-summary'>
          <p className='product-detail-kicker'>{config.label.toUpperCase()} · LIVE FROM ADMIN</p>
          <h1>{product.name}</h1>
          <div className='product-detail-chips'>{chips.filter(Boolean).map((chip) => <span key={chip}>{String(chip)}</span>)}</div>
          <p className='product-detail-description'>{product.description || 'Contact our automotive team for complete information, availability and expert assistance.'}</p>
          <div className='product-detail-price'>
            <small>{config.priceLabel}</small>
            <strong>{priceOnEnquiry}</strong>
          </div>
          <div className='product-detail-actions'>
            <Link className='product-detail-primary' to={enquiryUrl}>Enquire Now</Link>
            {kind === 'vehicles' && <Link className='product-detail-secondary' to='/compare' onClick={() => addVehicleToCompare(product)}>Compare Vehicle</Link>}
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

      {moreDetails && <section className='market-wrap product-detail-wrap product-more-details'>
        <div className='product-more-details-heading'>
          <small>{moreDetails.eyebrow}</small>
          <h2>{moreDetails.title}</h2>
          <p>{moreDetails.intro}</p>
        </div>
        <div className='product-more-details-grid'>
          {moreDetails.cards.map((card, index) => <article key={`${card.title || 'detail'}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {card.title && <h3>{card.title}</h3>}
            {card.text && <p>{card.text}</p>}
            {card.points.length > 0 && <ul>{card.points.map((point) => <li key={point}>{point}</li>)}</ul>}
          </article>)}
        </div>
      </section>}

      {relatedProducts.length > 0 && <section className='market-wrap product-detail-wrap product-related-section'>
        <div className='product-related-heading'><div><small>RELATED PRODUCTS</small><h2>More options you may like</h2></div><Link to={config.backUrl}>View all {config.backLabel}</Link></div>
        <div className='product-related-grid'>{relatedProducts.map((item) => {
          const route = productRoute(kind, item)
          return <article className='product-related-card' key={item._id || item.slug || item.name}>
            <Link className='product-related-media' to={route}><img src={item.imageUrl || config.fallback} alt={item.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = config.fallback }} /></Link>
            <div className='product-related-copy'><small>{itemCategoryLabel(item) || config.label}</small><h3>{item.name}</h3><p>{item.description || 'Ask our team for latest price, availability and fitment guidance.'}</p><strong>{priceOnEnquiry}</strong><div><Link to={route}>View</Link><Link to={enquiryRoute(config, item)}>Enquire</Link></div></div>
          </article>
        })}</div>
      </section>}

      <section className='market-wrap product-detail-wrap product-detail-cta'>
        <div className='product-detail-cta-copy'>
          <small>NEED MORE INFORMATION?</small>
          <h2>Ask about {product.name}.</h2>
          <p>Send your requirement and our team will help with price, availability and the next steps.</p>
          <div className='product-detail-cta-points'><span>Latest price guidance</span><span>Availability check</span><span>Expert callback</span></div>
        </div>
        <div className='product-detail-cta-action'>
          <Link to={enquiryUrl}>Send Product Enquiry</Link>
          <small>Quick response from our support team</small>
        </div>
      </section>
    </main>
  </MarketplaceShell>
}
