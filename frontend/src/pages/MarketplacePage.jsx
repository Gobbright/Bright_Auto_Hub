import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import PublicFooter from '../components/PublicFooter.jsx'
import { Header, Icon } from './Home.jsx'
import cars from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import bikes from '../assets/Images/Home/Vehicle Category/2_Wheelers.png'
import truck from '../assets/Images/Home/Vehicle Category/Commercial_Vehicles.png'
import tractor from '../assets/Images/Home/Vehicle Category/Farm_Vehicles.png'
import excavator from '../assets/Images/Home/Vehicle Category/Construction_Vehicles.png'
import ev from '../assets/Images/Home/Vehicle Category/EV_Vehicles.png'
import compareHero from '../assets/Images/compare vechicles/car-comparison-blue-red-vs-hero.png'
import compareOutline from '../assets/Images/compare vechicles/vehicle-comparison-outline-vs-banner.png'
import compareSpeed from '../assets/Images/compare vechicles/car-comparison-speed-light-banner.png'
import venueCompare from '../assets/Images/compare vechicles/hyundai-venue-black-suv.png'
import seltosCompare from '../assets/Images/compare vechicles/kia-seltos-red-suv.png'
import compareSupport from '../assets/Images/compare vechicles/vehicle-comparison-chat-support.png'
import compareSelector from '../assets/Images/compare vechicles/black-red-suv-comparison-selector.png'
import compareOffer from '../assets/Images/compare vechicles/vehicle-comparison-offer-discount.png'
import blackRedCompare from '../assets/Images/compare vechicles/black-red-suv-side-by-side.png'
import whiteBlackCompare from '../assets/Images/compare vechicles/white-black-suv-comparison.png'
import offRoadCompare from '../assets/Images/compare vechicles/off-road-suv-comparison.png'
import whiteGreyCompare from '../assets/Images/compare vechicles/white-grey-suv-comparison.png'
import compareDarkRoad from '../assets/Images/compare vechicles/car-comparison-dark-road-banner.png'
import whiteRedCompare from '../assets/Images/compare vechicles/white-red-car-comparison.png'
import calculatorHero from '../assets/Images/Home/images/vehicle-price-search-interface.png'
import contactHero from '../assets/Images/contact us/contact-us-white-sports-car-banner.png'
import contactSupport from '../assets/Images/contact us/automotive-customer-support-headset.png'
import advertisementImage from '../assets/Images/img-123.png'
import { PartsPage, ServicesPage } from './ServicePartsPages.jsx'
import './marketplace.css'
import './marketplace-extra.css'
import { ui } from '../lib/uiClasses.js'

const meta = {
  vehicles: ['Explore Vehicles','Find the right vehicle for every road and every ambition.'],
  compare: ['Compare Vehicles','Put features, performance and prices side by side.'],
  calculators: ['Vehicle Calculators','Plan your vehicle budget with simple, practical tools.'],
  'spare-parts': ['Genuine Spare Parts','Built for performance. Delivered with confidence.'],
  services: ['Expert Vehicle Service','Trusted care for every kind of vehicle.'],
  'used-cars': ['Great Cars. Better Prices.','Verified pre-owned cars with straightforward pricing.'],
  blog: ['Bright Auto Hub Journal','News, reviews and ownership advice for smarter journeys.'],
  contact: ["We're Here to Help You",'Questions or assistance? Our team is ready.'],
}
const vehicleGroups = [
  {name:'Bikes & Scooters',label:'Two Wheelers',slug:'bikes',image:bikes,copy:'City commuters, performance bikes, scooters and electric rides.',categorySlugs:['bikes','scooters','electric-bikes','electric-scooters']},
  {name:'Cars & SUVs',label:'Four Wheelers',slug:'cars',image:cars,copy:'Hatchbacks, sedans, SUVs, MPVs, luxury and family cars.',categorySlugs:['hatchback','sedan','suv','muv-mpv','luxury-cars','electric-cars']},
  {name:'Commercial Vehicles',label:'Business Mobility',slug:'commercial-vehicles',image:truck,copy:'Trucks, pickups, buses, vans and last-mile workhorses.',categorySlugs:['trucks','mini-trucks','pickup-vehicles','buses','vans','tempo-travellers','3-wheelers']},
  {name:'Farm Vehicles',label:'Agriculture',slug:'farm-vehicles',image:tractor,copy:'Tractors and dependable equipment for productive farms.',categorySlugs:['tractors','mini-tractors','farm-equipment']},
  {name:'Construction Vehicles',label:'Heavy Equipment',slug:'construction-vehicles',image:excavator,copy:'Powerful machines for construction and infrastructure.',categorySlugs:['jcb','excavators','backhoe-loaders','wheel-loaders','cranes','construction-equipment']},
  {name:'Electric Vehicles',label:'Clean Mobility',slug:'ev-vehicles',image:ev,copy:'Electric mobility across personal, public and commercial use.',categorySlugs:['electric-bikes','electric-scooters','electric-cars','electric-3-wheelers','electric-trucks','electric-buses','electric-vans']},
]
const fallbackCompareVehicles = [
  {_id:'compare-venue',name:'Hyundai Venue',fuelType:'Petrol',price:794000,imageUrl:venueCompare,modelYear:2026,specifications:{Mileage:'18 kmpl',Power:'118 bhp',Seats:'5'}},
  {_id:'compare-seltos',name:'Kia Seltos',fuelType:'Petrol',price:1119000,imageUrl:seltosCompare,modelYear:2026,specifications:{Mileage:'17 kmpl',Power:'158 bhp',Seats:'5'}},
]
const COMPARE_STORAGE_KEY = 'bright-auto-compare-vehicles'
export const readCompareVehicles = () => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) || '[]') || [] } catch { return [] }
}
export const addVehicleToCompare = (vehicle) => {
  if (typeof window === 'undefined' || !vehicle) return
  const current = readCompareVehicles().filter((item) => item._id !== vehicle._id && item.slug !== vehicle.slug)
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([vehicle, ...current].slice(0, 4)))
  window.dispatchEvent(new CustomEvent('compare-vehicles-change'))
}
export const removeVehicleFromCompare = (vehicle) => {
  if (typeof window === 'undefined' || !vehicle) return
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(readCompareVehicles().filter((item) => item._id !== vehicle._id && item.slug !== vehicle.slug)))
  window.dispatchEvent(new CustomEvent('compare-vehicles-change'))
}
const compareIdeas = [
  {image:compareSelector,alt:'Black and red SUVs in a vehicle comparison selector',title:'Compact SUV Showdown',copy:'Compare the essentials before you shortlist.'},
  {image:blackRedCompare,alt:'Black and red SUVs compared side by side',title:'Style vs Performance',copy:'See design, power and practical value together.'},
  {image:whiteBlackCompare,alt:'White and black SUVs in a side-by-side comparison',title:'Family SUV Comparison',copy:'Review space, comfort and everyday usability.'},
  {image:offRoadCompare,alt:'Off-road SUVs compared on rugged terrain',title:'Off-Road Capability',copy:'Check ground clearance, traction and durability.'},
  {image:whiteGreyCompare,alt:'White and grey SUVs shown for comparison',title:'Premium SUV Choices',copy:'Put features and ownership value side by side.'},
  {image:whiteRedCompare,alt:'White and red cars compared side by side',title:'Smart City Cars',copy:'Balance efficiency, convenience and budget.'},
]

function PublicAdvertisement(){
  return <aside className='market-wrap public-advertisement' aria-label='Advertisement space'>
    <img src={advertisementImage} alt='Advertise your automotive business with Bright Auto Hub' loading='lazy'/>
    <div><small>ADVERTISEMENT</small><h2>Place Your Ad Here</h2><p>Reach vehicle buyers, owners, workshops and automotive businesses across India.</p></div>
    <Link to='/contact?subject=Advertisement+enquiry&item=Website+advertisement&source=advertisement'>For Advertisement Contact <Icon name='arrow'/></Link>
  </aside>
}

export function MarketplaceShell({ children, active='' }) {
  return <div className={`market-page public-home ${ui.publicPage}`} id='top'><Header/>{children}{active!=='spare-parts'&&<PublicAdvertisement/>}<PublicFooter/></div>
}
const money=(value)=>Number(value)>0?`₹${Number(value).toLocaleString('en-IN')}`:'Price on enquiry'
const enquiryLink=(source,item,category='')=>{
  const subjects={vehicle:'Vehicle enquiry',part:'Spare parts enquiry',service:'Service enquiry'}
  return `/contact?${new URLSearchParams({subject:subjects[source]||'General enquiry',item,source,category,page:typeof window==='undefined'?'':window.location.pathname}).toString()}`
}

export function VehicleCards({ items, used=false }) {
  const list=items||[]
  return <div className='market-cards'>{list.map((item)=>{
    const mileage = used ? Number(item.mileage||0).toLocaleString('en-IN') + ' km' : 'Latest model'
    return <article className='market-card' key={item._id||item.name}><div><span>{used?'CERTIFIED':item.featured?'FEATURED':'VERIFIED'}</span><Link to={'/vehicles/product/'+(item.slug||item._id)}><img src={item.imageUrl||cars} alt={item.name}/></Link></div><Link className='market-card-title' to={'/vehicles/product/'+(item.slug||item._id)}><h3>{item.name}</h3></Link><p>{item.modelYear||new Date().getFullYear()} · {item.fuelType||'Petrol'} · {mileage}</p><strong>{money(item.price||0)}</strong><Link className='product-view-link' to={'/vehicles/product/'+(item.slug||item._id)}>View Details</Link><div className='flex gap-2'><Link className='enquiry-button flex-1' to={enquiryLink('vehicle',item.name,item.category?.name||item.vehicleType||'')}>Enquire Now</Link>{!used&&<Link className='compare-button inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-600 transition hover:border-[#e5091a] hover:text-[#e5091a]' to='/compare' onClick={()=>addVehicleToCompare(item)}>Compare</Link>}</div></article>
  })}</div>
}

function VehiclesPage({ data, used=false }) {
  const [query,setQuery]=useState('')
  const liveVehicles=(data.vehicles||[]).filter(v=>used?v.condition==='used':v.condition!=='used')
  const source=liveVehicles
  const filtered=source.filter(v=>v.name.toLowerCase().includes(query.toLowerCase()))
  const productsFor=(group)=>{
    const matches=filtered.filter(item=>item.group===group.slug||item.category?.parentId?.slug===group.slug||(!item.category?.parentId&&group.categorySlugs.includes(item.category?.slug)))
    return matches
  }
  if(used)return <><Hero page={data.page}/><section className='market-wrap market-search'><div className='filter-row'><input aria-label='Search used cars' value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search used cars...'/><select aria-label='Filter used cars by brand'><option>All Brands</option></select><select aria-label='Filter used cars by fuel type'><option>All Fuel Types</option></select><button type='button'>Search Used Cars</button></div></section><Stats/><section className='market-wrap section-space'><Heading title='Popular Used Cars' text={`${filtered.length} options ready to explore`}/><VehicleCards items={filtered} used/></section><Promo title='Every car checked. Every document verified.'/></>
  return <><Hero page={data.page}/><section className='market-wrap market-search'><div className='filter-row'><input aria-label='Search every vehicle' value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search every vehicle...'/><select aria-label='Filter vehicles by brand'><option>All Brands</option></select><select aria-label='Filter vehicles by fuel type'><option>All Fuel Types</option></select><button type='button'>Explore Vehicles</button></div></section><Stats/><section className='market-wrap section-space vehicle-catalog'><Heading title='Explore Every Category' text='Choose from every major vehicle segment in one place.'/><div className='vehicle-group-grid'>{vehicleGroups.map(group=><Link className='vehicle-group-card' to={`/vehicles/${group.slug}`} key={group.slug}><div><small>{group.label}</small><h3>{group.name}</h3><p>{group.copy}</p><span>Explore category →</span></div><img src={group.image} alt={group.name}/></Link>)}</div>{vehicleGroups.map(group=>{const products=productsFor(group);return <section className='vehicle-product-section' id={`catalog-${group.slug}`} key={group.slug}><Heading title={group.name} text={`${products.length} vehicles available`}/>{products.length?<VehicleCards items={products}/>:<div className='market-empty'>No vehicles match this search in {group.name}.</div>}</section>})}</section><Promo title='Need help choosing the right vehicle?'/></>
}

function ComparePage({ data }) {
  const saved = readCompareVehicles()
  const incoming = data.vehicles || []
  const merged = [...saved, ...incoming, ...fallbackCompareVehicles].filter((item, index, all) => all.findIndex((candidate) => candidate._id === item._id || candidate.slug === item.slug || candidate.name === item.name) === index)
  const list = merged.length >= 2 ? merged : [...merged, ...fallbackCompareVehicles]
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)
  const one = list[a % list.length]
  const two = list[b % list.length]
  const compareRows = ['Price', 'Fuel type', 'Model year', 'Mileage', 'Power', 'Seats', 'Range', 'Transmission']
  const valueFor = (vehicle, key) => {
    if (key === 'Price') return money(vehicle.price)
    if (key === 'Fuel type') return vehicle.fuelType || vehicle.specifications?.['Fuel Type'] || '—'
    if (key === 'Model year') return vehicle.modelYear || vehicle.specifications?.['Model Year'] || '—'
    return vehicle.specifications?.[key] || vehicle[key.toLowerCase()] || '—'
  }
  useEffect(() => {
    if (one && two) localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([one, two]))
  }, [one, two])
  const addSuggestion = (vehicle) => {
    addVehicleToCompare(vehicle)
    setB(list.findIndex((item) => item._id === vehicle._id || item.slug === vehicle.slug))
  }
  const suggestions = incoming.filter((vehicle) => vehicle._id !== one?._id && vehicle._id !== two?._id).slice(0, 8)
  const pageTitle = data.page?.title || 'Compare Vehicles'
  return <main className='compare-page min-h-screen overflow-hidden bg-[#f6f8fb] text-[#17202a]'>
    <section className='relative overflow-hidden border-b border-slate-200 bg-white'><div className='absolute right-[-80px] top-[-130px] size-[420px] rounded-full border-[70px] border-red-50' /><div className='market-wrap relative grid items-center gap-8 py-[clamp(42px,7vw,92px)] lg:grid-cols-[1fr_430px]'><div><p className='mb-3 text-[10px] font-black tracking-[.18em] text-[#e5091a]'>COMPARE BEFORE YOU DECIDE</p><h1 className='max-w-[720px] text-[clamp(40px,5.5vw,76px)] font-bold leading-[.96] tracking-[-.065em]'>Compare vehicles with clarity.</h1><p className='mt-5 max-w-[650px] text-[clamp(14px,1.2vw,18px)] leading-7 text-slate-500'>Put price, performance, comfort and ownership details side by side before you shortlist your next vehicle.</p><div className='mt-6 flex flex-wrap gap-2 text-[10px] font-bold text-slate-600'><span className='rounded-full bg-red-50 px-3 py-2 text-[#d7081b]'>✓ Live catalogue data</span><span className='rounded-full bg-slate-100 px-3 py-2'>✓ Clear specifications</span><span className='rounded-full bg-slate-100 px-3 py-2'>✓ Expert support</span></div></div><img className='h-[260px] w-full rounded-[24px] object-cover shadow-[0_18px_45px_rgba(28,42,60,.15)] lg:h-[315px]' src={compareHero} alt='Vehicles ready for side-by-side comparison' /></div></section>

    <section className='market-wrap relative z-10 -mt-8'><div className='rounded-[24px] border border-slate-200 bg-white p-[clamp(20px,3vw,34px)] shadow-[0_18px_50px_rgba(26,39,56,.10)]'><div className='mb-6 flex flex-wrap items-center justify-between gap-3'><div><small className='text-[10px] font-black tracking-[.16em] text-[#e5091a]'>YOUR COMPARISON</small><h2 className='mb-0 mt-1 text-[clamp(24px,3vw,36px)] font-bold tracking-[-.05em]'>Side-by-side shortlist</h2></div><button className='rounded-lg border border-slate-200 px-4 py-2 text-[10px] font-bold text-slate-600 transition hover:border-[#e5091a] hover:text-[#e5091a]' type='button' onClick={()=>{localStorage.removeItem(COMPARE_STORAGE_KEY);window.location.reload()}}>Clear selection</button></div><div className='grid items-stretch gap-4 lg:grid-cols-[1fr_70px_1fr]'><CompareSlot label='Vehicle 1' vehicle={one} list={list} value={a} onChange={setA} onRemove={()=>{removeVehicleFromCompare(one);window.location.reload()}} /><div className='flex items-center justify-center'><button className='grid size-12 place-items-center rounded-full bg-[#e5091a] text-sm font-black text-white shadow-lg transition hover:rotate-180' type='button' onClick={()=>{setA(b);setB(a)}} aria-label='Swap compared vehicles'>VS</button></div><CompareSlot label='Vehicle 2' vehicle={two} list={list} value={b} onChange={setB} onRemove={()=>{removeVehicleFromCompare(two);window.location.reload()}} /></div></div></section>

    <section className='market-wrap py-[clamp(42px,6vw,78px)]'><div className='mb-5 flex items-end justify-between gap-4'><div><p className='mb-1 text-[10px] font-black tracking-[.16em] text-[#e5091a]'>THE DETAILS THAT MATTER</p><h2 className='mb-0 text-[clamp(27px,3vw,40px)] font-bold tracking-[-.055em]'>Compare specifications</h2></div><span className='text-xs text-slate-500'>Scroll horizontally on mobile</span></div><div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm'><table className='min-w-[680px] w-full border-collapse text-left'><thead><tr className='bg-[#f7f9fb]'><th className='w-[28%] border-b border-slate-200 px-5 py-4 text-[10px] font-black uppercase tracking-[.12em] text-slate-500'>Specification</th><th className='border-b border-slate-200 px-5 py-4'><div className='text-sm font-bold'>{one.name}</div><small className='font-normal text-slate-500'>{one.fuelType || 'Vehicle'}</small></th><th className='border-b border-slate-200 px-5 py-4'><div className='text-sm font-bold'>{two.name}</div><small className='font-normal text-slate-500'>{two.fuelType || 'Vehicle'}</small></th></tr></thead><tbody>{compareRows.map((key, index)=><tr className={index % 2 ? 'bg-[#fbfcfd]' : ''} key={key}><th className='border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-500'>{key}</th><td className='border-b border-slate-100 px-5 py-4 text-sm font-bold text-[#1d2a3a]'>{valueFor(one, key)}</td><td className='border-b border-slate-100 px-5 py-4 text-sm font-bold text-[#1d2a3a]'>{valueFor(two, key)}</td></tr>)}</tbody></table></div></section>

    {suggestions.length > 0 && <section className='border-y border-slate-200 bg-white py-[clamp(40px,6vw,72px)]'><div className='market-wrap'><div className='mb-5 flex items-end justify-between gap-4'><div><p className='mb-1 text-[10px] font-black tracking-[.16em] text-[#e5091a]'>BUILD YOUR SHORTLIST</p><h2 className='mb-0 text-[clamp(27px,3vw,38px)] font-bold tracking-[-.05em]'>You may also compare</h2></div><Link className='text-[11px] font-bold text-[#e5091a]' to='/vehicles'>Explore all vehicles →</Link></div><div className='flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]'>{suggestions.map((vehicle) => <article className='min-w-[255px] flex-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm' key={vehicle._id || vehicle.name}><div className='h-[145px] overflow-hidden rounded-xl bg-[#f5f7f9]'><img className='h-full w-full object-contain' src={vehicle.imageUrl || cars} alt={vehicle.name} /></div><h3 className='mb-1 mt-3 text-sm font-bold'>{vehicle.name}</h3><p className='m-0 text-[11px] text-slate-500'>{vehicle.fuelType || 'Vehicle'} · {money(vehicle.price)}</p><button className='mt-3 w-full rounded-lg border border-[#e5091a] py-2 text-[10px] font-bold text-[#e5091a] transition hover:bg-[#e5091a] hover:text-white' type='button' onClick={()=>addSuggestion(vehicle)}>Add to compare</button></article>)}</div></div></section>}

    <section className='market-wrap py-[clamp(42px,6vw,78px)]'><div className='grid gap-4 md:grid-cols-3'>{[['Pick your priorities','Price, fuel type, space or performance—start with what matters to you.'],['Review the full picture','Use specifications and ownership context together before you shortlist.'],['Ask when you need clarity','Our team can help with availability, fitment and next steps.']].map(([title,copy],index)=><article className='rounded-2xl border border-slate-200 bg-white p-5' key={title}><span className='text-2xl font-black text-[#e5091a]'>0{index+1}</span><h3 className='mb-1 mt-3 text-base font-bold'>{title}</h3><p className='m-0 text-xs leading-5 text-slate-500'>{copy}</p></article>)}</div></section>
    <section className='market-wrap mb-[clamp(40px,6vw,84px)] flex items-center justify-between gap-6 rounded-[24px] bg-[#e5091a] p-[clamp(25px,4vw,48px)] text-white max-md:flex-col max-md:items-start'><div><small className='text-[9px] font-black tracking-[.16em] text-red-100'>NEED A SECOND OPINION?</small><h2 className='mb-2 mt-2 max-w-[650px] text-[clamp(26px,3vw,40px)] font-bold leading-tight'>Let an automotive expert help you decide.</h2><p className='m-0 text-xs text-red-100'>Share your shortlist and we will guide you through the next step.</p></div><Link className='shrink-0 rounded-lg bg-white px-5 py-3 text-[11px] font-extrabold text-[#d7081b] transition hover:bg-red-50 max-md:w-full max-md:text-center' to={enquiryLink('vehicle','Vehicle comparison support')}>Ask an expert →</Link></section>
  </main>
}

function CompareSlot({ label, vehicle, list, value, onChange, onRemove }) {
  return <article className='relative overflow-hidden rounded-2xl border border-slate-200 bg-[#fbfcfd] p-4'><button className='absolute right-3 top-3 grid size-7 place-items-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 transition hover:border-red-200 hover:text-[#e5091a]' type='button' onClick={onRemove} aria-label={'Remove ' + label}>×</button><small className='text-[9px] font-black tracking-[.14em] text-[#e5091a]'>{label}</small><div className='mt-3 flex gap-4'><div className='grid h-[130px] w-[42%] shrink-0 place-items-center overflow-hidden rounded-xl bg-white'><img className='h-full w-full object-contain' src={vehicle.imageUrl || cars} alt={vehicle.name} /></div><div className='min-w-0 flex-1'><h3 className='pr-7 text-lg font-bold leading-tight'>{vehicle.name}</h3><strong className='mt-2 block text-xl text-[#e5091a]'>{money(vehicle.price)}</strong><p className='mt-1 text-[11px] text-slate-500'>{vehicle.modelYear || 'Latest model'} · {vehicle.fuelType || 'Vehicle'}</p></div></div><select className='mt-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#e5091a]' aria-label={'Select ' + label} value={value} onChange={(event)=>onChange(Number(event.target.value))}>{list.map((item, index)=><option value={index} key={item._id || item.name}>{item.name}</option>)}</select></article>
}

function CalculatorsPage({data}){
  const [price,setPrice]=useState(1000000)
  const [downPayment,setDownPayment]=useState(200000)
  const [rate,setRate]=useState(9)
  const [years,setYears]=useState(5)
  const [distance,setDistance]=useState(1000)
  const [mileage,setMileage]=useState(15)
  const [fuelPrice,setFuelPrice]=useState(105)
  const principal=Math.max(0,price-downPayment)
  const months=Math.max(1,years*12)
  const monthlyRate=rate/1200
  const emi=monthlyRate?principal*monthlyRate*Math.pow(1+monthlyRate,months)/(Math.pow(1+monthlyRate,months)-1):principal/months
  const fuelCost=mileage>0?(distance/mileage)*fuelPrice:0
  const page={...data.page,heroImage:data.page.heroImage||calculatorHero}
  const numberValue=(setter)=>(event)=>setter(Math.max(0,Number(event.target.value)||0))
  return <><Hero page={page}/>
    <section className='market-wrap section-space calculator-section'>
      <Heading title='Plan Before You Enquire' text='Estimate monthly finance and running costs with clear, instant calculations.'/>
      <div className='calculator-grid'>
        <article className='calculator-card'>
          <div className='calculator-card-heading'><span><Icon name='calculator'/></span><div><small>FINANCE TOOL</small><h2>Vehicle EMI Calculator</h2></div></div>
          <div className='calculator-fields'>
            <label>Vehicle price<input type='number' min='0' value={price} onChange={numberValue(setPrice)}/></label>
            <label>Down payment<input type='number' min='0' value={downPayment} onChange={numberValue(setDownPayment)}/></label>
            <label>Interest rate (%)<input type='number' min='0' step='0.1' value={rate} onChange={numberValue(setRate)}/></label>
            <label>Loan term (years)<input type='number' min='1' max='10' value={years} onChange={numberValue(setYears)}/></label>
          </div>
          <div className='calculator-result'><small>ESTIMATED MONTHLY EMI</small><strong>{money(Math.round(emi))}</strong><p>Loan amount: {money(principal)} for {months} months</p></div>
          <Link className='enquiry-button' to={enquiryLink('vehicle','Vehicle finance guidance')}>Ask About Vehicle Finance</Link>
        </article>
        <article className='calculator-card'>
          <div className='calculator-card-heading'><span><Icon name='car'/></span><div><small>RUNNING COST TOOL</small><h2>Monthly Fuel Cost</h2></div></div>
          <div className='calculator-fields'>
            <label>Monthly distance (km)<input type='number' min='0' value={distance} onChange={numberValue(setDistance)}/></label>
            <label>Vehicle mileage (km/l)<input type='number' min='1' step='0.1' value={mileage} onChange={numberValue(setMileage)}/></label>
            <label>Fuel price per litre<input type='number' min='0' step='0.1' value={fuelPrice} onChange={numberValue(setFuelPrice)}/></label>
          </div>
          <div className='calculator-result'><small>ESTIMATED MONTHLY FUEL COST</small><strong>{money(Math.round(fuelCost))}</strong><p>Approx. {mileage>0?Math.round(distance/mileage):0} litres per month</p></div>
          <Link className='enquiry-button' to={enquiryLink('vehicle','Fuel-efficient vehicle guidance')}>Find an Efficient Vehicle</Link>
        </article>
      </div>
    </section>
    <Promo title='Need help matching your budget to the right vehicle?'/>
  </>
}

function ContactPage({data}){
  const [params]=useSearchParams()
  const enquiryItem=params.get('item')||''
  const enquirySubject=params.get('subject')||'General enquiry'
  const enquirySource=params.get('source')||'contact'
  const enquiryCategory=params.get('category')||''
  const sourcePage=params.get('page')||'/contact'
  const sourcePageTitle=sourcePage==='/'?'Home':sourcePage.split('/').filter(Boolean).map(part=>part.replace(/-/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase())).join(' / ')||'Contact'
  const stored=(key)=>{try{return JSON.parse(localStorage.getItem(key))||null}catch{return null}}
  const [profile,setProfile]=useState(()=>stored('publicUserProfile'))
  const [selectedLocation,setSelectedLocation]=useState(()=>stored('selectedLocation')||{label:'All India',shortLabel:'All India'})
  const initialForm=()=>({name:profile?.name||'',email:profile?.email||'',phone:profile?.phone||'',subject:enquirySubject,message:enquiryItem?`I would like more information about ${enquiryItem}.`:''})
  const [form,setForm]=useState(initialForm),[notice,setNotice]=useState('')
  useEffect(()=>{setForm(current=>({...current,subject:enquirySubject,message:enquiryItem?`I would like more information about ${enquiryItem}.`:current.message}))},[enquiryItem,enquirySubject])
  useEffect(()=>{const syncUser=()=>setProfile(stored('publicUserProfile'));const syncLocation=()=>setSelectedLocation(stored('selectedLocation')||{label:'All India',shortLabel:'All India'});window.addEventListener('public-user-change',syncUser);window.addEventListener('location-change',syncLocation);return()=>{window.removeEventListener('public-user-change',syncUser);window.removeEventListener('location-change',syncLocation)}},[])
  const submit=async e=>{e.preventDefault();setNotice('');try{const context=[enquiryItem&&`Item: ${enquiryItem}`,enquiryCategory&&`Category: ${enquiryCategory}`,`Source: ${enquirySource}`,`Page: ${sourcePage}`,`Location: ${selectedLocation.label}`,profile?.email&&`Account: ${profile.email}`].filter(Boolean).join('\n');const r=await api.post('/public/enquiries',{...form,source:enquirySource,itemName:enquiryItem,category:enquiryCategory,enquiryType:enquirySource,pageUrl:window.location.origin+sourcePage,pageTitle:sourcePageTitle,location:selectedLocation.label,coordinates:{lat:selectedLocation.lat,lon:selectedLocation.lon},accountId:profile?.id,accountEmail:profile?.email,context});setNotice(r.message);setForm(current=>({...current,message:''}))}catch(err){setNotice(err.message)}}
  const page={...data.page,heroImage:data.page.heroImage||contactHero}
  return <><Hero page={page}/><section className='market-wrap contact-layout'><form onSubmit={submit}><Heading title={enquiryItem?'Complete Your Enquiry':'Send Us an Enquiry'} text={enquiryItem?`You are enquiring about ${enquiryItem}.`:'We normally reply within 30 minutes.'}/>{enquiryItem&&<div className='enquiry-context-card'><small>AUTOMATIC ENQUIRY DETAILS</small><strong>{enquiryItem}</strong>{enquiryCategory&&<span>{enquiryCategory}</span>}<p><Icon name='location'/> {selectedLocation.shortLabel||selectedLocation.label} <b>·</b> Source: {sourcePage}</p></div>}{['name','email','phone'].map(x=><input aria-label={x[0].toUpperCase()+x.slice(1)} autoComplete={x==='name'?'name':x==='email'?'email':'tel'} type={x==='email'?'email':x==='phone'?'tel':'text'} required={x!=='phone'} placeholder={x[0].toUpperCase()+x.slice(1)} value={form[x]} onChange={e=>setForm({...form,[x]:e.target.value})} key={x}/>)}<select aria-label='Enquiry subject' value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}><option>General enquiry</option><option>Vehicle enquiry</option><option>Service enquiry</option><option>Spare parts enquiry</option><option>Offer enquiry</option></select><textarea aria-label='Enquiry message' required rows='6' placeholder='Tell us what you need...' value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><button type='submit'><Icon name='enquiry'/> Submit Enquiry</button>{notice&&<p className='form-notice' role='status' aria-live='polite'>{notice}</p>}</form><aside><img className='contact-support-image' src={contactSupport} alt='Bright Auto Hub automotive customer support'/><Heading title='Get in Touch' text='Real people. Reliable answers.'/><h3>Call us</h3><a href='tel:+919876543210'>+91 98765 43210</a><h3>Email us</h3><a href='mailto:support@brightautohub.com'>support@brightautohub.com</a><h3>Selected location</h3><p>{selectedLocation.label}</p><hr/><h3>Hours</h3><p>Monday – Sunday · 24/7 support</p></aside></section></>
}

function Hero({page,dark=false}){return <section className={`market-hero ${dark?'dark':''}`}><div className='market-wrap'><p>BRIGHT AUTO HUB</p><h1>{page.title}</h1><span>{page.description}</span><div><b>✓ Verified listings</b><b>✓ Best price promise</b><b>✓ Expert support</b></div></div><img src={page.heroImage||cars} alt={`${page.title} - Bright Auto Hub`}/></section>}
export function Heading({title,text}){return <div className='market-heading'><div><h2>{title}</h2><p>{text}</p></div><a href='#top' aria-label='Back to top'>Back to top ↑</a></div>}
function Stats(){return <section className='market-wrap market-stats'>{[['2M+','Happy customers'],['1,500+','Trusted workshops'],['100K+','Genuine parts'],['24/7','Expert support']].map(([a,b])=><div key={b}><strong>{a}</strong><span>{b}</span></div>)}</section>}
function Promo({title}){return <section className='market-wrap market-promo'><div><p>EXPERT ASSISTANCE</p><h2>{title}</h2></div><Link to={enquiryLink('general',title)}>Talk to an Expert →</Link></section>}

export default function MarketplacePage({kind}) {
  const [data,setData]=useState(null)
  const fallback=useMemo(()=>({page:{slug:kind,title:meta[kind][0],description:meta[kind][1]},vehicles:[],brands:[],parts:[],services:[],blogs:[],partCategories:[]}),[kind])
  useEffect(()=>{const [title,description]=meta[kind];document.title=`${title} | Bright Auto Hub`;document.querySelector('meta[name="description"]')?.setAttribute('content',description)},[kind])
  useEffect(()=>{let live=true;api.get(`/public/site/${kind}`).then(x=>live&&setData(x)).catch(()=>live&&setData(fallback));return()=>{live=false}},[kind,fallback])
  if(!data)return <MarketplaceShell active={kind}><div className='market-loading'>Loading Bright Auto Hub...</div></MarketplaceShell>
  const body=kind==='vehicles'?<VehiclesPage data={data}/>:kind==='used-cars'?<VehiclesPage data={data} used/>:kind==='compare'?<ComparePage data={data}/>:kind==='calculators'?<CalculatorsPage data={data}/>:kind==='spare-parts'?<PartsPage data={data}/>:kind==='services'?<ServicesPage data={data}/>:kind==='blog'?<ReferenceBlogPage data={data}/>:<ContactPage data={data}/>
  return <MarketplaceShell active={kind}>{body}</MarketplaceShell>
}

function EditorialBlogPage({data}) {
  const [page,setPage]=useState(1)
  const live=data.blogs||[]
  const posts=live.filter((post)=>post.slug&&post.imageUrl)
  const pageSize=20
  const pageCount=Math.max(1,Math.ceil(posts.length/pageSize))
  const currentPage=Math.min(page,pageCount)
  const latest=posts.slice((currentPage-1)*pageSize,currentPage*pageSize)
  const tag=(post)=>post?.tags?.[0]||post?.tag||'AUTOMOTIVE'
  const changePage=(nextPage)=>{setPage(nextPage);requestAnimationFrame(()=>document.getElementById('latest-stories')?.scrollIntoView({behavior:'smooth',block:'start'}))}
  return <>
    <nav className='market-wrap blog-topic-strip' aria-label='Blog topics'>
      <strong>Explore topics</strong>{['Buying Guides','Reviews','Electric Vehicles','Maintenance','Ownership','Commercial'].map(topic=><a href='#latest-stories' key={topic}>{topic}</a>)}
    </nav>
    <section className='market-wrap blog-latest-section' id='latest-stories'>
      <header className='blog-section-heading'><div><small>THE LATEST</small><h2>Ideas, advice and inspiration</h2><p>Practical automotive knowledge for every kind of journey.</p></div><span>{String(latest.length).padStart(2,'0')} ARTICLES</span></header>
      <div className='blog-latest-layout'><div className='blog-editorial-grid'>{latest.map((post)=><article key={post._id||post.slug}>
        <Link className='blog-card-media' to={`/blog/${post.slug}`}><img src={post.imageUrl} alt={post.imageAlt||post.title} loading='lazy'/><span>{tag(post)}</span></Link>
        <div className='blog-card-copy'><small>BRIGHT AUTO HUB · {post.readingTime||5} MIN READ</small><h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className='blog-read-link' to={`/blog/${post.slug}`}>Read article <Icon name='arrow'/></Link></div>
      </article>)}</div><aside className='blog-image-ad' aria-label='Blog advertisement'><img src={advertisementImage} alt='Automotive advertisement on Bright Auto Hub' loading='lazy'/><div><small>ADVERTISEMENT</small><h3>Place Your Ad Here</h3><p>Connect your brand with people researching their next vehicle journey.</p><Link to='/contact?subject=Advertisement+enquiry&item=Blog+sidebar+advertisement&source=advertisement'>Advertise with us <Icon name='arrow'/></Link></div></aside></div>
      <nav className='blog-pagination' aria-label='Blog pagination'><button type='button' disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}>Previous</button><div>{Array.from({length:pageCount},(_,index)=>index+1).map(number=><button className={number===currentPage?'active':''} type='button' aria-current={number===currentPage?'page':undefined} onClick={()=>changePage(number)} key={number}>{number}</button>)}</div><button type='button' disabled={currentPage===pageCount} onClick={()=>changePage(currentPage+1)}>Next</button></nav>
    </section>
  </>
}

function ReferenceBlogPage({data}){
  const [activeTopic,setActiveTopic]=useState('All')
  const [page,setPage]=useState(1)
  const [email,setEmail]=useState('')
  const [subscribed,setSubscribed]=useState(false)
  const live=data.blogs||[]
  const posts=live.filter((post)=>post.slug&&post.imageUrl)
  const topics=[
    ['All','grid',/.*/i],['News','blog',/(news|launch)/i],['Reviews','car',/review/i],['Buying Guide','search',/(buying|guide|shortlist)/i],
    ['Maintenance','tools',/(maintenance|service|engine|oil)/i],['Tips & Advice','shield',/(tips|advice|safety|ownership|driving|road.trip)/i],
    ['EV & Green','bolt',/(electric|\bev\b|green|mobility|charging)/i],['Industry Trends','truck',/(industry|commercial|fleet|future)/i],['Technology','calculator',/(technology|connected|infotainment|tech)/i],
  ]
  const searchable=(post)=>[post.tags?.[0],post.tag,post.title,post.excerpt].filter(Boolean).join(' ')
  const activeMatcher=topics.find(([label])=>label===activeTopic)?.[2]||/.*/i
  const filtered=activeTopic==='All'?posts:posts.filter(post=>activeMatcher.test(searchable(post)))
  const pageSize=20
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize))
  const currentPage=Math.min(page,pageCount)
  const pagePosts=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize)
  const featured=posts.slice(0,3)
  const tag=(post)=>post?.tags?.[0]||post?.tag||'AUTOMOTIVE'
  const dateLabel=(post,index)=>{const value=post.publishedAt||post.createdAt;if(value){const date=new Date(value);if(!Number.isNaN(date.getTime()))return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(date)}return `${Math.max(1,26-index)} Aug, 2026`}
  const selectTopic=(topic)=>{setActiveTopic(topic);setPage(1)}
  const changePage=(nextPage)=>{setPage(nextPage);requestAnimationFrame(()=>document.getElementById('blog-stories')?.scrollIntoView({behavior:'smooth',block:'start'}))}
  const subscribe=(event)=>{event.preventDefault();if(email.trim())setSubscribed(true)}
  const heroImage=data.page?.heroImage||posts[0]?.imageUrl||cars
  return <main className='editorial-blog-page'>
    <section className='blog-reference-hero'>
      <div className='market-wrap blog-reference-hero-copy'><nav aria-label='Breadcrumb'><Link to='/'>Home</Link><span>/</span><strong>Blog</strong></nav><h1>Blog</h1><p>Stay updated with the latest automotive news, expert reviews, maintenance tips, buying guides and industry insights.</p></div>
      <img src={heroImage} alt='Bright Auto Hub automotive Blog' decoding='async'/>
    </section>
    <nav className='market-wrap blog-filter-pills' aria-label='Filter Blog articles'>{topics.map(([label,icon])=><button className={activeTopic===label?'active':''} type='button' aria-pressed={activeTopic===label} onClick={()=>selectTopic(label)} key={label}><Icon name={icon}/><span>{label}</span></button>)}<button className='blog-view-all' type='button' onClick={()=>selectTopic('All')}>View All Categories <Icon name='arrow'/></button></nav>
    <section className='market-wrap blog-reference-layout' id='blog-stories'>
      <div className='blog-reference-main'>
        {pagePosts.length?<div className='blog-reference-grid'>{pagePosts.map((post,index)=><article className='blog-reference-card' key={post._id||post.slug}>
          <Link className='blog-reference-media' to={`/blog/${post.slug}`}><img src={post.imageUrl} alt={post.imageAlt||post.title} loading='lazy'/></Link>
          <div className='blog-reference-card-copy'><small>{tag(post)}</small><h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><span><Icon name='calendar'/>{dateLabel(post,index)} <b>·</b> {post.readingTime||5} min read</span></div>
        </article>)}</div>:<div className='market-empty'>No articles found in this category.</div>}
        <nav className='blog-reference-pagination' aria-label='Blog pagination'><button type='button' disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}>Previous</button><div>{Array.from({length:pageCount},(_,index)=>index+1).map(number=><button className={number===currentPage?'active':''} type='button' aria-current={number===currentPage?'page':undefined} onClick={()=>changePage(number)} key={number}>{number}</button>)}</div><button type='button' disabled={currentPage===pageCount} onClick={()=>changePage(currentPage+1)}>Next <Icon name='arrow'/></button></nav>
      </div>
      <aside className='blog-reference-sidebar'>
        <section className='blog-sidebar-panel blog-featured-panel'><h2>Featured</h2>{featured.map((post,index)=><Link to={`/blog/${post.slug}`} key={post.slug||post._id}><img src={post.imageUrl} alt='' loading='lazy'/><div><small>{dateLabel(post,index)}</small><strong>{post.title}</strong></div></Link>)}</section>
        <section className='blog-sidebar-panel blog-category-panel'><h2>Categories</h2>{topics.map(([label,icon,matcher])=><button className={activeTopic===label?'active':''} type='button' onClick={()=>selectTopic(label)} key={label}><span><Icon name={icon}/>{label}</span><b>{label==='All'?posts.length:posts.filter(post=>matcher.test(searchable(post))).length}</b></button>)}</section>
        <section className='blog-newsletter-panel'><span>✉</span><h2>Stay Updated</h2><p>Get the latest automotive news and updates straight to your inbox.</p><form onSubmit={subscribe}><input type='email' value={email} onChange={event=>{setEmail(event.target.value);setSubscribed(false)}} placeholder='Enter your email' aria-label='Email for Blog updates' required/><button type='submit'>Subscribe</button></form>{subscribed&&<small role='status'>Thanks! You are on the update list.</small>}</section>
        <section className='blog-sidebar-ad' aria-label='Advertisement'><img src={advertisementImage} alt='Automotive advertisement on Bright Auto Hub' loading='lazy'/><div><small>ADVERTISEMENT</small><h3>Place Your Ad Here</h3><Link to='/contact?subject=Advertisement+enquiry&item=Blog+sidebar+advertisement&source=advertisement'>Advertise with us <Icon name='arrow'/></Link></div></section>
      </aside>
    </section>
  </main>
}
