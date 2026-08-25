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
import { blogStories } from '../data/visualContent.js'
import { PartsPage, ServicesPage } from './ServicePartsPages.jsx'
import './marketplace.css'
import './marketplace-extra.css'

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
const compareIdeas = [
  {image:compareSelector,alt:'Black and red SUVs in a vehicle comparison selector',title:'Compact SUV Showdown',copy:'Compare the essentials before you shortlist.'},
  {image:blackRedCompare,alt:'Black and red SUVs compared side by side',title:'Style vs Performance',copy:'See design, power and practical value together.'},
  {image:whiteBlackCompare,alt:'White and black SUVs in a side-by-side comparison',title:'Family SUV Comparison',copy:'Review space, comfort and everyday usability.'},
  {image:offRoadCompare,alt:'Off-road SUVs compared on rugged terrain',title:'Off-Road Capability',copy:'Check ground clearance, traction and durability.'},
  {image:whiteGreyCompare,alt:'White and grey SUVs shown for comparison',title:'Premium SUV Choices',copy:'Put features and ownership value side by side.'},
  {image:whiteRedCompare,alt:'White and red cars compared side by side',title:'Smart City Cars',copy:'Balance efficiency, convenience and budget.'},
]

export function MarketplaceShell({ children }) {
  return <div className='market-page public-home' id='top'><Header/>{children}<PublicFooter/></div>
}
const money=(value)=>Number(value)>0?`₹${Number(value).toLocaleString('en-IN')}`:'Price on enquiry'
const enquiryLink=(source,item,category='')=>{
  const subjects={vehicle:'Vehicle enquiry',part:'Spare parts enquiry',service:'Service enquiry'}
  return `/contact?${new URLSearchParams({subject:subjects[source]||'General enquiry',item,source,category,page:typeof window==='undefined'?'':window.location.pathname}).toString()}`
}

export function VehicleCards({ items, used=false }) {
  const list=items||[]
  return <div className='market-cards'>{list.map((item)=><article className='market-card' key={item._id||item.name}><div><span>{used?'CERTIFIED':item.featured?'FEATURED':'VERIFIED'}</span><Link to={'/vehicles/product/'+(item.slug||item._id)}><img src={item.imageUrl||cars} alt={item.name}/></Link></div><Link className='market-card-title' to={'/vehicles/product/'+(item.slug||item._id)}><h3>{item.name}</h3></Link><p>{item.modelYear||new Date().getFullYear()} · {item.fuelType||'Petrol'} · {used?`${Number(item.mileage||0).toLocaleString('en-IN')} km`:'Latest model'}</p><strong>{money(item.price||0)}</strong><Link className='product-view-link' to={'/vehicles/product/'+(item.slug||item._id)}>View Details</Link><Link className='enquiry-button' to={enquiryLink('vehicle',item.name,item.category?.name||item.vehicleType||'')}>Enquire Now</Link></article>)}</div>
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
  const liveVehicles=data.vehicles||[]
  const list=liveVehicles.length>=2?liveVehicles:fallbackCompareVehicles
  const [a,setA]=useState(0),[b,setB]=useState(1)
  const page={...data.page,heroImage:data.page.heroImage||compareHero}
  const one=list[a%list.length],two=list[b%list.length]
  return <><Hero page={page} dark/><section className='market-wrap compare-picker'><CompareCar car={one}/><b>VS</b><CompareCar car={two}/></section><section className='market-wrap compare-banner-row'>{[[compareOutline,'Outlined cars facing a comparison symbol','Quick visual comparison'],[compareSpeed,'Car silhouettes with red and blue speed lights','Performance at a glance'],[compareDarkRoad,'Dark car on a road with red tail lights','Decide with confidence']].map(([image,alt,title])=><article key={title}><img src={image} alt={alt}/><strong>{title}</strong></article>)}</section><section className='market-wrap section-space'><div className='compare-selects'><select aria-label='Select first vehicle to compare' value={a} onChange={e=>setA(+e.target.value)}>{list.map((x,i)=><option value={i} key={x._id}>{x.name}</option>)}</select><select aria-label='Select second vehicle to compare' value={b} onChange={e=>setB(+e.target.value)}>{list.map((x,i)=><option value={i} key={x._id}>{x.name}</option>)}</select></div><Heading title='Detailed Comparison' text='Everything important, in one clear view.'/><table className='compare-table'><tbody>{['Price','Fuel Type','Model Year','Mileage','Power','Seats'].map(key=><tr key={key}><th>{key}</th><td>{key==='Price'?money(one.price):one.specifications?.[key]||one.fuelType||'—'}</td><td>{key==='Price'?money(two.price):two.specifications?.[key]||two.fuelType||'—'}</td></tr>)}</tbody></table></section><section className='market-wrap section-space compare-model-spotlight'><Heading title='Popular Models to Compare' text='Start with two of the most searched compact SUVs.'/><div><article><img src={venueCompare} alt='Black Hyundai Venue compact SUV'/><h3>Hyundai Venue</h3><p>Compact dimensions, connected features and city-friendly performance.</p></article><article><img src={seltosCompare} alt='Red Kia Seltos compact SUV'/><h3>Kia Seltos</h3><p>Strong road presence, a feature-rich cabin and versatile powertrains.</p></article></div></section><section className='market-wrap section-space'><Heading title='Popular Comparison Ideas' text='Explore the factors that matter for your driving needs.'/><div className='compare-idea-grid'>{compareIdeas.map(item=><article key={item.title}><img src={item.image} alt={item.alt} loading='lazy'/><div><h3>{item.title}</h3><p>{item.copy}</p><Link to={enquiryLink('vehicle',item.title)}>Ask an Expert →</Link></div></article>)}</div></section><section className='market-wrap compare-help-grid'><article><img src={compareSupport} alt='Automotive comparison chat support'/><div><small>EXPERT SUPPORT</small><h2>Need help understanding the differences?</h2><Link className='enquiry-button' to={enquiryLink('vehicle','Vehicle comparison support')}>Start an Enquiry</Link></div></article><article><img src={compareOffer} alt='Vehicle comparison offer and discount graphic'/><div><small>BEST VALUE</small><h2>Ask about current vehicle offers.</h2><Link className='enquiry-button' to={enquiryLink('vehicle','Current vehicle offers')}>Enquire About Offers</Link></div></article></section><Promo title='Still unsure? Let our experts help you decide.' /></>
}
function CompareCar({car}){return <article><img src={car.imageUrl||cars} alt={car.name}/><h2>{car.name}</h2><strong>{money(car.price)}</strong></article>}

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

function BlogPage({data}){const live=data.blogs||[];const posts=blogStories.map((story,index)=>live[index]?{...story,...live[index],imageUrl:story.image,alt:story.alt}:{...story,imageUrl:story.image}).concat(live.slice(blogStories.length).map((post,index)=>({...post,imageUrl:post.imageUrl||blogStories[index%blogStories.length].image,alt:post.title})));const page={...data.page,heroImage:data.page.heroImage||blogStories[0].image};return <><Hero page={page}/><section className='market-wrap section-space'><Heading title='Latest Stories' text={`${live.length} published articles plus our automotive guides.`}/><div className='blog-market-grid'>{posts.map(x=><article key={x._id||x.slug}><img src={x.imageUrl} alt={x.alt||x.title} loading='lazy'/><small>{x.tags?.[0]||x.tag||'AUTOMOTIVE'}</small><h2>{x.title}</h2><p>{x.excerpt}</p><Link to={`/blog/${x.slug}`}>Read article →</Link></article>)}</div></section></>}

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
  if(!data)return <MarketplaceShell><div className='market-loading'>Loading Bright Auto Hub...</div></MarketplaceShell>
  const body=kind==='vehicles'?<VehiclesPage data={data}/>:kind==='used-cars'?<VehiclesPage data={data} used/>:kind==='compare'?<ComparePage data={data}/>:kind==='calculators'?<CalculatorsPage data={data}/>:kind==='spare-parts'?<PartsPage data={data}/>:kind==='services'?<ServicesPage data={data}/>:kind==='blog'?<EditorialBlogPage data={data}/>:<ContactPage data={data}/>
  return <MarketplaceShell active={kind}>{body}</MarketplaceShell>
}

function EditorialBlogPage({data}) {
  const live=data.blogs||[]
  const posts=blogStories.map((story,index)=>live[index]?{...story,...live[index],imageUrl:live[index].imageUrl||story.image,alt:live[index].alt||story.alt}:{...story,imageUrl:story.image}).concat(live.slice(blogStories.length).map((post,index)=>({...post,imageUrl:post.imageUrl||blogStories[index%blogStories.length].image,alt:post.title})))
  const featured=posts[0]
  const latest=posts.slice(1)
  const tag=(post)=>post?.tags?.[0]||post?.tag||'AUTOMOTIVE'
  return <>
    <section className='blog-index-hero'>
      <div className='market-wrap blog-index-intro'>
        <div className='blog-index-copy'><p>BRIGHT AUTO HUB JOURNAL</p><h1>Auto stories,<br/><span>made simple.</span></h1><p>Useful guides, honest advice and the latest updates for every kind of vehicle owner.</p></div>
        {featured&&<Link className='blog-simple-feature' to={`/blog/${featured.slug}`}>
          <img src={featured.imageUrl} alt={featured.alt||featured.title}/>
          <div><span>FEATURED / {tag(featured)}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><strong>Read story <Icon name='arrow'/></strong></div>
        </Link>}
      </div>
    </section>
    <nav className='market-wrap blog-topic-strip' aria-label='Blog topics'>
      <strong>Explore topics</strong>{['Buying Guides','Reviews','Electric Vehicles','Maintenance','Ownership','Commercial'].map(topic=><a href='#latest-stories' key={topic}>{topic}</a>)}
    </nav>
    <section className='market-wrap blog-latest-section' id='latest-stories'>
      <header className='blog-section-heading'><div><small>THE LATEST</small><h2>Ideas, advice and inspiration</h2><p>Practical automotive knowledge for every kind of journey.</p></div><span>{String(latest.length).padStart(2,'0')} ARTICLES</span></header>
      <div className='blog-editorial-grid'>{latest.map((post,index)=><article className={index===0?'blog-wide-card':''} key={post._id||post.slug}>
        <Link className='blog-card-media' to={`/blog/${post.slug}`}><img src={post.imageUrl} alt={post.alt||post.title} loading='lazy'/><span>{tag(post)}</span></Link>
        <div className='blog-card-copy'><small>BRIGHT AUTO HUB · 5 MIN READ</small><h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><Link className='blog-read-link' to={`/blog/${post.slug}`}>Read article <Icon name='arrow'/></Link></div>
      </article>)}</div>
    </section>
    <section className='market-wrap blog-expert-banner'>
      <div><small>FROM READING TO THE RIGHT DECISION</small><h2>Need advice tailored to your vehicle?</h2><p>Tell our automobile experts what you are comparing, maintaining or planning.</p></div>
      <Link to={enquiryLink('blog','Automotive expert guidance')}>Ask an Automotive Expert <Icon name='arrow'/></Link>
    </section>
  </>
}
