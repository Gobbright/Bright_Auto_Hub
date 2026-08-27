import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { Icon } from './Home.jsx'
import { MarketplaceShell } from './MarketplacePage.jsx'
import financeHeroImage from '../assets/Images/finance-insurance/vehicle-finance-insurance-suv-hero.png'
import './finance-insurance.css'
import { cx, ui } from '../lib/uiClasses.js'

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
    <main className={`finance-page ${ui.main} min-h-screen overflow-x-clip bg-[#f6f7f9]`}>
      <section className='finance-hero relative isolate overflow-hidden bg-[#07101d] text-white'>
        <img className='finance-hero-image absolute inset-0 h-full w-full object-cover' src={financeHeroImage} alt='Premium white SUV representing secure vehicle finance and insurance'/>
        <div className='market-wrap finance-hero-inner relative z-[2] flex min-h-[clamp(430px,32vw,560px)] items-center py-[52px] max-md:py-[46px]'>
          <div className='finance-hero-content w-[min(48%,680px)] max-md:w-4/5 max-[520px]:w-full'>
            <p className='text-[10px] font-black tracking-[.16em] text-[#ff5260]'>SMART FINANCE · RELIABLE PROTECTION</p>
            <h1 className='text-[clamp(40px,4vw,68px)] leading-[.96] tracking-[-.055em]'>Finance Your Drive.<br/><span className='text-[#ff3344]'>Protect Every Mile.</span></h1>
            <p className='finance-hero-copy my-5 max-w-[580px] text-[clamp(13px,1vw,16px)] text-[#d2d8e1]'>One trusted place to request vehicle loans, compare your next step and get guided insurance support.</p>
            <div className='finance-hero-actions flex flex-wrap gap-3'><a className={ui.primaryButton} href='#finance-request'>Start Your Request <Icon name='arrow'/></a><Link className='inline-flex min-h-[48px] items-center gap-2 rounded-[9px] border border-white/30 bg-slate-950/60 px-[20px] font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white' to='/calculators'>Try EMI Calculator <Icon name='calculator'/></Link></div>
            <div className='finance-hero-pills mt-6 flex flex-wrap gap-2.5'><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='shield'/> Secure enquiry</span><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='car'/> Every vehicle type</span><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='phone'/> Expert callback</span></div>
          </div>
        </div>
      </section>

      <section className='market-wrap finance-assurance-strip relative z-[4] -mt-[38px] grid grid-cols-3 overflow-hidden rounded-[17px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(19,30,46,.12)] max-md:grid-cols-1' aria-label='Finance and insurance benefits'>
        {[['calculator','7','Finance & insurance services'],['shield','100%','Secure enquiry handling'],['phone','1:1','Expert callback support']].map(([icon,value,label])=><article className='flex min-h-[88px] items-center gap-3.5 border-r border-slate-200 px-6 py-4 last:border-0 max-md:min-h-[70px] max-md:border-r-0 max-md:border-b' key={label}><span className='grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#fff0f2] text-[#e5091a]'><Icon name={icon}/></span><div><strong className='block text-[21px] leading-none'>{value}</strong><p className='mt-1.5 text-[10px] text-slate-500'>{label}</p></div></article>)}
      </section>

      <section className='market-wrap finance-services pt-[clamp(78px,7vw,112px)]' aria-labelledby='finance-services-title'>
        <div className='finance-heading max-w-[820px]'><p className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>CHOOSE A SERVICE</p><h2 className='max-w-[760px]' id='finance-services-title'>Finance and insurance for every vehicle.</h2><span className='text-sm text-slate-500'>Select a category to open the relevant request form.</span></div>
        <div className='finance-service-grid grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-[520px]:grid-cols-1'>
          {options.map((item) => <Link className={cx('relative min-h-[205px] overflow-hidden rounded-[20px] border border-slate-200 bg-white p-[23px] shadow-[0_8px_28px_rgba(22,32,47,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#e5091a] hover:shadow-lg', item.slug === selected.slug && 'active border-[#e5091a] bg-gradient-to-br from-white to-[#fff1f3]')} to={`/finance-insurance/${item.slug}`} key={item.slug} aria-current={item.slug === selected.slug ? 'page' : undefined}>
            <span><Icon name={item.icon}/></span><div><small>{item.type === 'loan' ? 'FINANCE' : 'INSURANCE'}</small><h3>{item.name}</h3><p>{item.copy}</p><b>Start request <Icon name='arrow'/></b></div>
          </Link>)}
        </div>
      </section>

      <section className='market-wrap finance-process pb-[clamp(58px,7vw,100px)]'>
        <div className='finance-process-heading grid grid-cols-[minmax(250px,.8fr)_minmax(320px,1.2fr)] items-end gap-6 max-md:grid-cols-1'><p className='col-span-full text-[11px] font-black tracking-[.13em] text-[#e5091a] max-md:col-auto'>SIMPLE. CLEAR. GUIDED.</p><h2>Three steps to the right support.</h2><span className='text-[13px] leading-7 text-slate-500'>No confusing checkout or instant commitment—just a clear enquiry handled by our automotive support team.</span></div>
        <div className='finance-process-grid grid grid-cols-3 gap-4 max-md:grid-cols-1'>
          {[['01','Choose your need','Select the right loan, insurance or renewal category.','calculator'],['02','Share key details','Tell us about your vehicle, city and requirement.','car'],['03','Get expert guidance','Receive a callback explaining availability and next steps.','phone']].map(([number,title,copy,icon])=><article className='relative min-h-[220px] overflow-hidden rounded-[20px] border border-slate-200 bg-[#111925] p-7 text-white' key={number}><b className='absolute right-5 top-4 text-[54px] leading-none text-white/15'>{number}</b><span className='grid size-[50px] place-items-center rounded-[15px] bg-white/10 text-[#ff4654]'><Icon name={icon}/></span><h3 className='mb-2 mt-6 text-lg'>{title}</h3><p className='m-0 max-w-[310px] text-xs leading-6 text-slate-400'>{copy}</p></article>)}
        </div>
      </section>

      <section className='market-wrap finance-request-layout grid scroll-mt-28 grid-cols-[.72fr_1.28fr] gap-6 py-[clamp(55px,7vw,100px)] max-lg:grid-cols-1' id='finance-request'>
        <aside className='rounded-[22px] border border-white/10 bg-gradient-to-br from-[#0d1521] via-[#202b3b] to-[#40151c] p-[clamp(28px,4vw,48px)] text-white shadow-xl'>
          <p>YOUR SELECTION</p><span><Icon name={selected.icon}/></span><small>{selected.type === 'loan' ? 'FINANCE REQUEST' : 'INSURANCE REQUEST'}</small><h2>{selected.name}</h2><p>{selected.copy}</p>
          <ul><li>Simple online request</li><li>Expert callback support</li><li>No hidden commitment</li><li>Secure enquiry handling</li></ul>
        </aside>
        <form className='finance-form rounded-[22px] border border-slate-200 bg-white p-[clamp(25px,4vw,45px)] shadow-[0_18px_55px_rgba(21,32,47,.07)]' onSubmit={submit}>
          <div className='finance-form-heading'><p>REQUEST A CALLBACK</p><h2>Tell us what you need.</h2><span>Our team will contact you to explain the available next steps.</span></div>
          <div className='finance-form-grid grid grid-cols-2 gap-4 max-sm:grid-cols-1 [&_input]:h-12 [&_input]:w-full [&_input]:rounded-[9px] [&_input]:border [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:px-3 [&_input]:text-[#1e2630] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[#e5091a] [&_input]:focus:bg-white [&_input]:focus:ring-4 [&_input]:focus:ring-red-600/10 [&_select]:h-12 [&_select]:w-full [&_select]:rounded-[9px] [&_select]:border [&_select]:border-slate-200 [&_select]:bg-slate-50 [&_select]:px-3 [&_select]:text-[#1e2630] [&_select]:outline-none [&_textarea]:w-full [&_textarea]:rounded-[9px] [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:p-3 [&_textarea]:text-[#1e2630] [&_textarea]:outline-none [&_label]:grid [&_label]:gap-2 [&_label>span]:text-xs [&_label>span]:font-semibold [&_.wide]:col-span-full max-sm:[&_.wide]:col-auto'>
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
          <button className={cx(ui.primaryButton, 'mt-5 w-full disabled:cursor-wait disabled:opacity-60')} type='submit' disabled={submitting}>{submitting ? 'Submitting Request...' : `Submit ${selected.name} Request`} <Icon name='arrow'/></button>
          {notice.message && <p className={`finance-notice ${notice.type}`} role='status' aria-live='polite'>{notice.message}</p>}
        </form>
      </section>
    </main>
  </MarketplaceShell>
}
