import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from './Home.jsx'
import { MarketplaceShell } from './MarketplacePage.jsx'
import financeHeroImage from '../assets/Images/finance-insurance/vehicle-finance-insurance-suv-hero.png'
import '../styles/pages/finance-insurance.css'
import { cx, ui } from '../lib/uiClasses.js'

const options = [
  {
    slug: 'vehicle-loan', name: 'Vehicle Loan', icon: 'calculator', type: 'loan', copy: 'Flexible funding for the vehicle that fits your journey.',
    intro: 'Get practical guidance for two-wheelers, cars, commercial vehicles, farm vehicles and construction equipment loans.',
    highlights: ['New and used vehicle support', 'Budget and EMI guidance', 'Document checklist before callback'],
    documents: ['Identity proof', 'Address proof', 'Income proof or bank statement', 'Vehicle quotation or listing details'],
    bestFor: 'Buyers who want clear finance options before choosing the final vehicle.',
  },
  {
    slug: 'car-loan', name: 'Car Loan', icon: 'car', type: 'loan', copy: 'Finance support for new and pre-owned passenger cars.',
    intro: 'Share your preferred car, budget and city. The team will help you understand the next finance steps.',
    highlights: ['New car finance', 'Used car finance', 'Down-payment and EMI discussion'],
    documents: ['PAN or identity proof', 'Address proof', 'Salary slip or business proof', 'Car model or listing details'],
    bestFor: 'Families and individual buyers comparing hatchbacks, sedans, SUVs or premium cars.',
  },
  {
    slug: 'bike-loan', name: 'Bike Loan', icon: 'motorcycle', type: 'loan', copy: 'Simple two-wheeler finance with guided assistance.',
    intro: 'Request loan guidance for commuter bikes, scooters, premium motorcycles and electric two-wheelers.',
    highlights: ['Bike and scooter finance', 'Fast callback support', 'Simple eligibility discussion'],
    documents: ['Identity proof', 'Address proof', 'Income or bank proof', 'Bike model details'],
    bestFor: 'Daily commuters, students, professionals and small business riders.',
  },
  {
    slug: 'commercial-vehicle-loan', name: 'Commercial Vehicle Loan', icon: 'truck', type: 'loan', copy: 'Funding assistance for trucks, pickups, buses and vans.',
    intro: 'Get guided support for business vehicle finance, fleet additions and income-generating mobility.',
    highlights: ['Truck and pickup finance', 'Fleet requirement support', 'Business-use guidance'],
    documents: ['KYC documents', 'Business proof', 'Bank statement', 'Vehicle quotation or usage details'],
    bestFor: 'Transport owners, small businesses and fleet operators.',
  },
  {
    slug: 'tractor-loan', name: 'Tractor Loan', icon: 'tractor', type: 'loan', copy: 'Practical finance guidance for tractors and farm vehicles.',
    intro: 'Request farm vehicle finance support for tractors, mini tractors and farm equipment.',
    highlights: ['Farm-use finance support', 'Seasonal requirement discussion', 'Tractor and equipment guidance'],
    documents: ['Identity proof', 'Address proof', 'Land or income document if available', 'Vehicle or equipment details'],
    bestFor: 'Farmers, agri businesses and rural vehicle buyers.',
  },
  {
    slug: 'vehicle-insurance', name: 'Vehicle Insurance', icon: 'shield', type: 'insurance', copy: 'Request the right coverage for your vehicle and usage.',
    intro: 'Share your vehicle details and coverage requirement to get a clear insurance callback.',
    highlights: ['New policy guidance', 'Coverage comparison support', 'Own damage and third-party discussion'],
    documents: ['Registration number', 'Previous policy if available', 'Vehicle details', 'Owner contact details'],
    bestFor: 'Vehicle owners who want suitable coverage before purchase or renewal.',
  },
  {
    slug: 'insurance-renewal', name: 'Insurance Renewal', icon: 'calendar', type: 'insurance', copy: 'Renew an existing policy with timely expert assistance.',
    intro: 'Avoid last-minute confusion. Share your current policy and expiry details for renewal support.',
    highlights: ['Expiry reminder support', 'Renewal options discussion', 'Claim and add-on guidance'],
    documents: ['Current policy copy', 'Registration number', 'Claim history if any', 'Owner contact details'],
    bestFor: 'Owners renewing car, bike, commercial, farm or construction vehicle insurance.',
  },
]

const detailGuides = {
  loan: {
    eyebrow: 'FINANCE DETAIL GUIDE',
    overview: (name) => `${name} support from Bright Auto Hub helps you understand the right vehicle, budget, documents and callback path before you make a commitment. Share your requirement and our team will guide the next steps clearly.`,
    quickFacts: ['Loan support for new and used vehicle needs', 'EMI and down-payment discussion during callback', 'Suitable for personal, business and earning-use vehicles'],
    sections: [
      { icon: 'calculator', title: 'Budget Planning', copy: 'Understand a comfortable vehicle budget before final selection.', items: ['Discuss expected loan amount', 'Compare down-payment comfort', 'Plan EMI range before callback'] },
      { icon: 'check', title: 'Document Readiness', copy: 'Know what to keep ready so the request moves smoothly.', items: ['KYC and address proof guidance', 'Income or business proof checklist', 'Vehicle quotation or listing details'] },
      { icon: 'phone', title: 'Guided Callback', copy: 'Your enquiry reaches the admin inbox with the selected service attached.', items: ['Team sees the selected finance service', 'Vehicle details are captured clearly', 'Next step is explained by phone'] },
    ],
    timeline: ['Choose the vehicle category and service', 'Share name, city, phone and vehicle details', 'Keep basic KYC and income proof ready', 'Get a callback with the suitable next step'],
    faq: (name) => [
      { question: `Can I request ${name} before finalizing a vehicle?`, answer: 'Yes. You can send the request with your planned vehicle model or category, then update details during the callback.' },
      { question: 'Can used vehicles be included?', answer: 'Yes. Add the used vehicle listing, expected price or model details in the request so the team can guide properly.' },
      { question: 'Does submitting the request confirm approval?', answer: 'No. It only creates an enquiry. Approval, eligibility and documents are handled after the callback.' },
    ],
  },
  insurance: {
    eyebrow: 'INSURANCE DETAIL GUIDE',
    overview: (name) => `${name} support helps you request coverage guidance, renewal help or policy comparison without confusion. Share your vehicle details and the team will call back with the next step.`,
    quickFacts: ['Coverage guidance for cars, bikes and commercial vehicles', 'Renewal and new policy request support', 'Registration and previous policy details help speed up the callback'],
    sections: [
      { icon: 'shield', title: 'Coverage Guidance', copy: 'Get help choosing the right type of vehicle insurance support.', items: ['Own damage and third-party discussion', 'Add-on requirement support', 'New policy or renewal guidance'] },
      { icon: 'calendar', title: 'Renewal Readiness', copy: 'Keep expiry details visible and avoid last-minute confusion.', items: ['Capture current policy expiry', 'Share current insurer if available', 'Mention claim history when needed'] },
      { icon: 'phone', title: 'Expert Callback', copy: 'The request is sent with service and vehicle context already attached.', items: ['Admin receives selected requirement', 'Vehicle details stay connected', 'Team follows up with next steps'] },
    ],
    timeline: ['Choose insurance or renewal service', 'Share registration, model and expiry details', 'Mention current insurer or claim notes if available', 'Get a callback for coverage guidance'],
    faq: (name) => [
      { question: `What details are useful for ${name}?`, answer: 'Vehicle model, registration number, city, previous policy and expiry date are the most useful details.' },
      { question: 'Can I request help without the previous policy copy?', answer: 'Yes. Submit the request with available details and mention what is missing in the notes.' },
      { question: 'Will the team contact me after I submit?', answer: 'Yes. The enquiry is saved in the admin inbox and the team can follow up using your contact details.' },
    ],
  },
}

const financeEnquiryUrl = (item, extra = {}) => '/contact?' + new URLSearchParams({
  subject: `${item.name} enquiry`,
  item: item.name,
  source: 'finance-insurance',
  category: item.type,
  page: typeof window === 'undefined' ? `/finance-insurance/${item.slug}` : window.location.pathname,
  ...extra,
}).toString()

const getDetail = (item) => {
  const guide = detailGuides[item.type]
  return {
    ...guide,
    overview: guide.overview(item.name),
    quickFacts: [item.bestFor, ...guide.quickFacts],
    sections: [
      { icon: item.icon, title: `${item.name} Support`, copy: item.intro, items: item.highlights },
      ...guide.sections,
    ],
    faqs: guide.faq(item.name),
  }
}

export default function FinanceInsurancePage() {
  const { service: serviceSlug } = useParams()
  const selected = useMemo(() => options.find((item) => item.slug === serviceSlug) || options[0], [serviceSlug])
  const isDetailPage = Boolean(serviceSlug)
  const detail = useMemo(() => getDetail(selected), [selected])
  const visibleServices = useMemo(() => isDetailPage ? options.filter((item) => item.slug !== selected.slug) : options, [isDetailPage, selected])

  useEffect(() => {
    document.title = `${selected.name} | Bright Auto Hub`
    document.querySelector('meta[name=description]')?.setAttribute('content', `Submit a ${selected.name.toLowerCase()} enquiry and get guided vehicle finance or insurance assistance from Bright Auto Hub.`)
  }, [selected])

  useEffect(() => {
    if (!serviceSlug) return undefined
    const frame = window.requestAnimationFrame(() => document.getElementById('finance-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [serviceSlug])

  return <MarketplaceShell>
    <main className={`finance-page ${ui.main} min-h-screen overflow-x-clip bg-[#f6f7f9]`}>
      <section className='finance-hero relative isolate overflow-hidden bg-[#07101d] text-white'>
        <img className='finance-hero-image absolute inset-0 h-full w-full object-cover' src={financeHeroImage} alt='Premium white SUV representing secure vehicle finance and insurance'/>
        <div className='market-wrap finance-hero-inner relative z-[2] flex min-h-[clamp(430px,32vw,560px)] items-center py-[52px] max-md:py-[46px]'>
          <div className='finance-hero-content w-[min(48%,680px)] max-md:w-4/5 max-[520px]:w-full'>
            <p className='text-[10px] font-black tracking-[.16em] text-[#ff5260]'>SMART FINANCE - RELIABLE PROTECTION</p>
            <h1 className='text-[clamp(40px,4vw,68px)] leading-[.96] tracking-[-.055em]'>{isDetailPage ? selected.name : 'Finance Your Drive.'}<br/><span className='text-[#ff3344]'>{isDetailPage ? 'Details & Request.' : 'Protect Every Mile.'}</span></h1>
            <p className='finance-hero-copy my-5 max-w-[580px] text-[clamp(13px,1vw,16px)] text-[#d2d8e1]'>{isDetailPage ? detail.overview : 'One trusted place to request vehicle loans, compare your next step and get guided insurance support.'}</p>
            <div className='finance-hero-actions flex flex-wrap gap-3'><Link className={ui.primaryButton} to={financeEnquiryUrl(selected)}>Send Request <Icon name='arrow'/></Link><Link className='inline-flex min-h-[48px] items-center gap-2 rounded-[9px] border border-white/30 bg-slate-950/60 px-[20px] font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white' to={isDetailPage ? '/finance-insurance' : '/calculators'}>{isDetailPage ? 'All Finance Options' : 'Try EMI Calculator'} <Icon name={isDetailPage ? 'arrow' : 'calculator'}/></Link></div>
            <div className='finance-hero-pills mt-6 flex flex-wrap gap-2.5'><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='shield'/> Secure enquiry</span><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='car'/> Every vehicle type</span><span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 text-[10px] font-semibold backdrop-blur-md'><Icon name='phone'/> Expert callback</span></div>
          </div>
        </div>
      </section>

      <section className='market-wrap finance-assurance-strip relative z-[4] -mt-[38px] grid grid-cols-3 overflow-hidden rounded-[17px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(19,30,46,.12)] max-md:grid-cols-1' aria-label='Finance and insurance benefits'>
        {[['calculator','7','Finance & insurance services'],['shield','100%','Secure enquiry handling'],['phone','1:1','Expert callback support']].map(([icon,value,label])=><article className='flex min-h-[88px] items-center gap-3.5 border-r border-slate-200 px-6 py-4 last:border-0 max-md:min-h-[70px] max-md:border-r-0 max-md:border-b' key={label}><span className='grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#fff0f2] text-[#e5091a]'><Icon name={icon}/></span><div><strong className='block text-[21px] leading-none'>{value}</strong><p className='mt-1.5 text-[10px] text-slate-500'>{label}</p></div></article>)}
      </section>

      {isDetailPage && <section className='market-wrap finance-detail-page' id='finance-details'>
        <div className='finance-detail-kicker'><Link to='/finance-insurance'>All finance options</Link><span>{selected.type === 'loan' ? 'Loan support' : 'Insurance support'}</span></div>
        <div className='finance-detail-hero-card'>
          <div className='finance-detail-main'>
            <small>{detail.eyebrow}</small>
            <h2>{selected.name}</h2>
            <p>{detail.overview}</p>
            <div className='finance-detail-actions'><Link to={financeEnquiryUrl(selected)}>Send Request</Link></div>
          </div>
          <aside className='finance-detail-summary'>
            <span><Icon name={selected.icon}/></span>
            <h3>Quick Snapshot</h3>
            <ul>{detail.quickFacts.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </div>
        <div className='finance-detail-content'>
          {detail.sections.map((section) => <article className='finance-detail-section' key={section.title}>
            <span><Icon name={section.icon}/></span>
            <div><h3>{section.title}</h3><p>{section.copy}</p><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </article>)}
          <aside className='finance-document-card'>
            <small>DOCUMENT CHECKLIST</small>
            <h3>Keep these ready</h3>
            <ul>{selected.documents.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </div>
        <div className='finance-detail-roadmap'>
          <div><small>HOW IT WORKS</small><h3>Request flow for {selected.name}</h3><p>Use the quick request modal for a fast callback. Add vehicle, document or timing details in the message field when needed.</p></div>
          <ol>{detail.timeline.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, '0')}</b><span>{step}</span></li>)}</ol>
        </div>
        <div className='finance-detail-faq'>
          <div><small>FAQ</small><h3>Common questions</h3></div>
          <div>{detail.faqs.map((item) => <article key={item.question}><h4>{item.question}</h4><p>{item.answer}</p></article>)}</div>
        </div>
      </section>}

      <section className={cx('market-wrap finance-services', isDetailPage ? 'finance-related-services' : 'pt-[clamp(78px,7vw,112px)]')} aria-labelledby='finance-services-title'>
        <div className='finance-heading max-w-[820px]'><p className='text-[10px] font-black tracking-[.14em] text-[#e5091a]'>{isDetailPage ? 'RELATED SERVICES' : 'CHOOSE A SERVICE'}</p><h2 className='max-w-[760px]' id='finance-services-title'>{isDetailPage ? 'Explore more finance and insurance options.' : 'Finance and insurance for every vehicle.'}</h2><span className='text-sm text-slate-500'>{isDetailPage ? 'Switch to another service detail page, or send a request directly.' : 'Open details first, or send a request directly from any service card.'}</span></div>
        <div className='finance-service-grid grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-[520px]:grid-cols-1'>
          {visibleServices.map((item) => <article className={cx('finance-service-card relative min-h-[230px] overflow-hidden rounded-[20px] border border-slate-200 bg-white p-[23px] shadow-[0_8px_28px_rgba(22,32,47,.045)] transition duration-300', item.slug === selected.slug && isDetailPage && 'active border-[#e5091a] bg-gradient-to-br from-white to-[#fff1f3]')} key={item.slug} aria-current={item.slug === selected.slug && isDetailPage ? 'page' : undefined}>
            <span className='finance-card-icon'><Icon name={item.icon}/></span><div><small>{item.type === 'loan' ? 'FINANCE' : 'INSURANCE'}</small><h3>{item.name}</h3><p>{item.copy}</p></div>
            <div className='finance-card-actions'><Link className='finance-more-link' to={`/finance-insurance/${item.slug}`}>More Details</Link><Link className='finance-request-link' to={financeEnquiryUrl(item)}>Send Request</Link></div>
          </article>)}
        </div>
      </section>

      <section className='market-wrap finance-process pb-[clamp(58px,7vw,100px)]'>
        <div className='finance-process-heading grid grid-cols-[minmax(250px,.8fr)_minmax(320px,1.2fr)] items-end gap-6 max-md:grid-cols-1'><p className='col-span-full text-[11px] font-black tracking-[.13em] text-[#e5091a] max-md:col-auto'>SIMPLE. CLEAR. GUIDED.</p><h2>Three steps to the right support.</h2><span className='text-[13px] leading-7 text-slate-500'>No confusing checkout or instant commitment, just a clear enquiry handled by our automotive support team.</span></div>
        <div className='finance-process-grid grid grid-cols-3 gap-4 max-md:grid-cols-1'>
          {[['01','Choose your need','Select the right loan, insurance or renewal category.','calculator'],['02','Share key details','Tell us about your vehicle, city and requirement.','car'],['03','Get expert guidance','Receive a callback explaining availability and next steps.','phone']].map(([number,title,copy,icon])=><article className='relative min-h-[220px] overflow-hidden rounded-[20px] border border-slate-200 bg-[#111925] p-7 text-white' key={number}><b className='absolute right-5 top-4 text-[54px] leading-none text-white/15'>{number}</b><span className='grid size-[50px] place-items-center rounded-[15px] bg-white/10 text-[#ff4654]'><Icon name={icon}/></span><h3 className='mb-2 mt-6 text-lg'>{title}</h3><p className='m-0 max-w-[310px] text-xs leading-6 text-slate-400'>{copy}</p></article>)}
        </div>
      </section>

    </main>
  </MarketplaceShell>
}