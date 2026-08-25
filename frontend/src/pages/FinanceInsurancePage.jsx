import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Icon } from './Home.jsx'
import { MarketplaceShell } from './MarketplacePage.jsx'
import financeHeroImage from '../assets/Images/finance-insurance/vehicle-finance-insurance-suv-hero.png'
import './finance-insurance.css'

const options = [
  { slug: 'vehicle-loan', name: 'Vehicle Loan', icon: 'calculator', type: 'loan', copy: 'Flexible funding for the vehicle that fits your journey.' },
  { slug: 'car-loan', name: 'Car Loan', icon: 'car', type: 'loan', copy: 'Finance support for new and pre-owned passenger cars.' },
  { slug: 'bike-loan', name: 'Bike Loan', icon: 'motorcycle', type: 'loan', copy: 'Simple two-wheeler finance with guided assistance.' },
  { slug: 'commercial-vehicle-loan', name: 'Commercial Vehicle Loan', icon: 'truck', type: 'loan', copy: 'Funding assistance for trucks, pickups, buses and vans.' },
  { slug: 'tractor-loan', name: 'Tractor Loan', icon: 'tractor', type: 'loan', copy: 'Practical finance guidance for tractors and farm vehicles.' },
  { slug: 'vehicle-insurance', name: 'Vehicle Insurance', icon: 'shield', type: 'insurance', copy: 'Request the right coverage for your vehicle and usage.' },
  { slug: 'insurance-renewal', name: 'Insurance Renewal', icon: 'calendar', type: 'insurance', copy: 'Renew an existing policy with timely expert assistance.' },
]

const stored = (key) => { try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null } }
const emptyForm = (service) => {
  const profile = stored('publicUserProfile')
  const location = stored('selectedLocation')
  return { name: profile?.name || '', email: profile?.email || '', phone: profile?.phone || '', city: location?.shortLabel || '', service, vehicle: '', amount: '', employment: '', registration: '', insurer: '', expiry: '', notes: '' }
}

export default function FinanceInsurancePage() {
  const { service: serviceSlug } = useParams()
  const navigate = useNavigate()
  const selected = useMemo(() => options.find((item) => item.slug === serviceSlug) || options[0], [serviceSlug])
  const [form, setForm] = useState(() => emptyForm(selected.name))
  const [notice, setNotice] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm((current) => ({ ...current, service: selected.name }))
    setNotice({ type: '', message: '' })
    document.title = `${selected.name} | Bright Auto Hub`
    document.querySelector('meta[name=description]')?.setAttribute('content', `Submit a ${selected.name.toLowerCase()} enquiry and get guided vehicle finance or insurance assistance from Bright Auto Hub.`)
  }, [selected])

  useEffect(() => {
    if (!serviceSlug) return undefined
    const frame = window.requestAnimationFrame(() => document.getElementById('finance-request')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [serviceSlug])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice({ type: '', message: '' })
    const details = selected.type === 'insurance'
      ? [`Service: ${form.service}`, `Vehicle: ${form.vehicle}`, `Registration: ${form.registration || 'Not provided'}`, `Current insurer: ${form.insurer || 'Not provided'}`, `Policy expiry: ${form.expiry || 'Not provided'}`, `City: ${form.city}`, `Notes: ${form.notes || 'None'}`]
      : [`Service: ${form.service}`, `Vehicle / model: ${form.vehicle}`, `Required amount: ${form.amount || 'Not provided'}`, `Employment: ${form.employment || 'Not provided'}`, `City: ${form.city}`, `Notes: ${form.notes || 'None'}`]
    try {
      const response = await api.post('/public/enquiries', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `${form.service} enquiry`,
        message: details.join('\n'),
        source: 'finance-insurance',
        itemName: form.service,
        enquiryType: selected.type,
        pageUrl: window.location.href,
        pageTitle: window.location.pathname,
        location: stored('selectedLocation')?.label || form.city,
        coordinates: { lat: stored('selectedLocation')?.lat, lon: stored('selectedLocation')?.lon },
        accountId: stored('publicUserProfile')?.id,
        accountEmail: stored('publicUserProfile')?.email,
        context: details.join('\n'),
      })
      setNotice({ type: 'success', message: response.message || 'Your request was submitted successfully.' })
      setForm(emptyForm(selected.name))
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return <MarketplaceShell>
    <main className='finance-page'>
      <section className='finance-hero'>
        <img className='finance-hero-image' src={financeHeroImage} alt='Premium white SUV representing secure vehicle finance and insurance'/>
        <div className='market-wrap finance-hero-inner'>
          <div className='finance-hero-content'>
            <p>SMART FINANCE · RELIABLE PROTECTION</p>
            <h1>Finance Your Drive.<br/><span>Protect Every Mile.</span></h1>
            <p className='finance-hero-copy'>One trusted place to request vehicle loans, compare your next step and get guided insurance support.</p>
            <div className='finance-hero-actions'><a href='#finance-request'>Start Your Request <Icon name='arrow'/></a><Link to='/calculators'>Try EMI Calculator <Icon name='calculator'/></Link></div>
            <div className='finance-hero-pills'><span><Icon name='shield'/> Secure enquiry</span><span><Icon name='car'/> Every vehicle type</span><span><Icon name='phone'/> Expert callback</span></div>
          </div>
        </div>
      </section>

      <section className='market-wrap finance-assurance-strip' aria-label='Finance and insurance benefits'>
        {[['calculator','7','Finance & insurance services'],['shield','100%','Secure enquiry handling'],['phone','1:1','Expert callback support']].map(([icon,value,label])=><article key={label}><span><Icon name={icon}/></span><div><strong>{value}</strong><p>{label}</p></div></article>)}
      </section>

      <section className='market-wrap finance-services' aria-labelledby='finance-services-title'>
        <div className='finance-heading'><p>CHOOSE A SERVICE</p><h2 id='finance-services-title'>Finance and insurance for every vehicle.</h2><span>Select a category to open the relevant request form.</span></div>
        <div className='finance-service-grid'>
          {options.map((item) => <Link className={item.slug === selected.slug ? 'active' : ''} to={`/finance-insurance/${item.slug}`} key={item.slug} aria-current={item.slug === selected.slug ? 'page' : undefined}>
            <span><Icon name={item.icon}/></span><div><small>{item.type === 'loan' ? 'FINANCE' : 'INSURANCE'}</small><h3>{item.name}</h3><p>{item.copy}</p><b>Start request <Icon name='arrow'/></b></div>
          </Link>)}
        </div>
      </section>

      <section className='market-wrap finance-process'>
        <div className='finance-process-heading'><p>SIMPLE. CLEAR. GUIDED.</p><h2>Three steps to the right support.</h2><span>No confusing checkout or instant commitment—just a clear enquiry handled by our automotive support team.</span></div>
        <div className='finance-process-grid'>
          {[['01','Choose your need','Select the right loan, insurance or renewal category.','calculator'],['02','Share key details','Tell us about your vehicle, city and requirement.','car'],['03','Get expert guidance','Receive a callback explaining availability and next steps.','phone']].map(([number,title,copy,icon])=><article key={number}><b>{number}</b><span><Icon name={icon}/></span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className='market-wrap finance-request-layout' id='finance-request'>
        <aside>
          <p>YOUR SELECTION</p><span><Icon name={selected.icon}/></span><small>{selected.type === 'loan' ? 'FINANCE REQUEST' : 'INSURANCE REQUEST'}</small><h2>{selected.name}</h2><p>{selected.copy}</p>
          <ul><li>Simple online request</li><li>Expert callback support</li><li>No hidden commitment</li><li>Secure enquiry handling</li></ul>
        </aside>
        <form className='finance-form' onSubmit={submit}>
          <div className='finance-form-heading'><p>REQUEST A CALLBACK</p><h2>Tell us what you need.</h2><span>Our team will contact you to explain the available next steps.</span></div>
          <div className='finance-form-grid'>
            <label><span>Full name *</span><input value={form.name} onChange={update('name')} autoComplete='name' required placeholder='Enter your full name'/></label>
            <label><span>Mobile number *</span><input value={form.phone} onChange={update('phone')} autoComplete='tel' inputMode='tel' required placeholder='+91 98765 43210'/></label>
            <label><span>Email address *</span><input value={form.email} onChange={update('email')} autoComplete='email' type='email' required placeholder='you@example.com'/></label>
            <label><span>City *</span><input value={form.city} onChange={update('city')} autoComplete='address-level2' required placeholder='Your city'/></label>
            <label className='wide'><span>Required service *</span><select value={form.service} onChange={(event) => {
              const choice = options.find((item) => item.name === event.target.value)
              if (choice) navigate(`/finance-insurance/${choice.slug}`)
            }}>{options.map((item) => <option value={item.name} key={item.slug}>{item.name}</option>)}</select></label>
            <label className='wide'><span>{selected.type === 'insurance' ? 'Vehicle make and model *' : 'Vehicle / model you plan to buy *'}</span><input value={form.vehicle} onChange={update('vehicle')} required placeholder='Example: Tata Nexon 2026'/></label>
            {selected.type === 'insurance' ? <>
              <label><span>Registration number</span><input value={form.registration} onChange={update('registration')} placeholder='TN 01 AB 1234'/></label>
              <label><span>Current insurer</span><input value={form.insurer} onChange={update('insurer')} placeholder='Insurance company'/></label>
              <label className='wide'><span>Current policy expiry</span><input value={form.expiry} onChange={update('expiry')} type='date'/></label>
            </> : <>
              <label><span>Required loan amount</span><input value={form.amount} onChange={update('amount')} inputMode='numeric' placeholder='Example: ₹8,00,000'/></label>
              <label><span>Employment type</span><select value={form.employment} onChange={update('employment')}><option value=''>Select employment</option><option>Salaried</option><option>Self-employed</option><option>Business owner</option><option>Agriculture</option></select></label>
            </>}
            <label className='wide'><span>Additional details</span><textarea value={form.notes} onChange={update('notes')} rows='4' placeholder='Preferred callback time or any specific requirement'/></label>
          </div>
          <label className='finance-consent'><input type='checkbox' required/><span>I agree to be contacted about this finance or insurance request.</span></label>
          <button type='submit' disabled={submitting}>{submitting ? 'Submitting Request...' : `Submit ${selected.name} Request`} <Icon name='arrow'/></button>
          {notice.message && <p className={`finance-notice ${notice.type}`} role='status' aria-live='polite'>{notice.message}</p>}
        </form>
      </section>
    </main>
  </MarketplaceShell>
}
