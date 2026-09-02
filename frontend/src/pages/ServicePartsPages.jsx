import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import serviceHero from '../assets/Images/service-spare-parts/expert-car-service-workshop.jpg'
import serviceCenter from '../assets/Images/service-spare-parts/certified-vehicle-service-center.jpg'
import diagnosticsImage from '../assets/Images/service-spare-parts/automotive-engine-diagnostics.jpg'
import maintenanceImage from '../assets/Images/service-spare-parts/preventive-car-maintenance.jpg'
import brakeImage from '../assets/Images/service-spare-parts/genuine-brake-system-parts.jpg'
import doorstepImage from '../assets/Images/service-spare-parts/automotive-spare-parts-gallery.jpg'
import partsHero from '../assets/Images/Home/images/car-spare-parts-service-banner.png'
import tyreImage from '../assets/Images/Home/images/automobile-tyres-alloy-wheels-banner.png'
import engineImage from '../assets/Images/BLOG/professional-car-engine-service.png'
import oilImage from '../assets/Images/BLOG/car-engine-oil-change.png'
import oilCloseup from '../assets/Images/blog details/engine-oil-change-closeup.png'
import roadTyres from '../assets/Images/blog details/car-tyres-highway-safety.png'
import cars from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import marutiSuzukiLogo from '../assets/Images/Home/Brand Logos/maruti-suzuki.svg'
import hyundaiLogo from '../assets/Images/Home/Brand Logos/hyundai.svg'
import tataLogo from '../assets/Images/Home/Brand Logos/tata.svg'
import mahindraLogo from '../assets/Images/Home/Brand Logos/mahindra.svg'
import kiaLogo from '../assets/Images/Home/Brand Logos/kia.svg'
import hondaLogo from '../assets/Images/Home/Brand Logos/honda.svg'
import toyotaLogo from '../assets/Images/Home/Brand Logos/toyota.svg'
import mgLogo from '../assets/Images/Home/Brand Logos/mg.svg'
import skodaLogo from '../assets/Images/Home/Brand Logos/skoda.svg'
import volkswagenLogo from '../assets/Images/Home/Brand Logos/volkswagen.svg'
import bajajLogo from '../assets/Images/Home/Brand Logos/bajaj.svg'
import tvsLogo from '../assets/Images/Home/Brand Logos/tvs.svg'
import ashokLeylandLogo from '../assets/Images/Home/Brand Logos/ashok-leyland.svg'
import '../styles/pages/service-parts.css'
import '../styles/pages/service-parts-extra.css'
import { ui } from '../lib/uiClasses.js'

const priceOnEnquiry='Price on enquiry'
const enquiryLink=(source,item,category='')=>'/contact?'+new URLSearchParams({
  subject:source==='service'?'Service enquiry':'Spare parts enquiry',item,source,category,page:typeof window==='undefined'?'':window.location.pathname,
}).toString()
const categoryName=(category)=>typeof category==='string'?category:category?.name||'Automotive'
const slugify=(value='')=>String(value).trim().toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const compactList=(items)=>items.map(item=>String(item||'').trim()).filter(Boolean)
const partBrandByKeyword=[[/brake|disc|rotor|lining/i,'Brembo'],[/filter|air filter|fuel filter|cabin/i,'MANN-FILTER'],[/clutch|belt/i,'LuK'],[/shock|suspension|strut|control arm/i,'KYB'],[/bearing|hub|roller/i,'SKF'],[/lamp|headlight|tail|sensor/i,'Hella'],[/spark|plug/i,'NGK'],[/battery|charger|charging|controller|converter|motor/i,'DENSO'],[/tyre|tire/i,'MRF'],[/oil|lubricant/i,'Castrol'],[/hydraulic|loader|excavator|tractor|pump/i,'Bosch']]
const inferredPartBrand=(name)=>partBrandByKeyword.find(([matcher])=>matcher.test(name))?.[1]||'Bosch'
const partBrandName=(item)=>{
  const brand=cleanBrandName(item?.brand)
  return brand&&!/^bright genuine$/i.test(brand)?brand:inferredPartBrand(item?.name||'')
}
const partGroupName=(item,groups=[],activeCategory='')=>{
  const existing=typeof item?.categoryGroup==='object'?item.categoryGroup?.name:item?.categoryGroup
  if(existing)return existing
  const itemCategory=categoryName(item?.category).toLowerCase()
  const matched=groups.find(group=>(group.children||[]).some(child=>child.name?.toLowerCase()===itemCategory))
  return matched?.name||activeCategory||''
}
const partImageCandidates=(item,index,groups,activeCategory)=>{
  const nameSlug=slugify(item?.name)
  const categorySlug=slugify(categoryName(item?.category))
  const groupSlug=slugify(partGroupName(item,groups,activeCategory))
  const base=groupSlug&&categorySlug&&nameSlug?`/images/catalog/spare-parts/${groupSlug}/${categorySlug}/${nameSlug}`:''
  const cutout=base?base.replace('/spare-parts/','/spare-parts-cutout/')+'.png':''
  return compactList([cutout,base&&base+'.jpg',base&&base+'.webp',base&&base+'.png',item?.imageUrl,partProductVisuals[index%partProductVisuals.length]])
}
function PartProductImage({item,index,groups,activeCategory}){
  const candidates=useMemo(()=>partImageCandidates(item,index,groups,activeCategory),[activeCategory,groups,index,item])
  const [sourceIndex,setSourceIndex]=useState(0)
  useEffect(()=>setSourceIndex(0),[candidates.join('|')])
  const source=candidates[Math.min(sourceIndex,candidates.length-1)]
  return <img src={source} alt={item.name+' spare part product'} loading='lazy' decoding='async' onError={()=>setSourceIndex(current=>Math.min(current+1,candidates.length-1))}/>
}

const iconPaths={
  service:'M12 2v4m0 12v4M4.9 4.9l2.9 2.9m8.4 8.4 2.9 2.9M2 12h4m12 0h4M4.9 19.1l2.9-2.9m8.4-8.4 2.9-2.9M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  calendar:'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm2-2v4m10-4v4M3 9h18m-13 4h3m2 0h3m-8 4h3',
  shield:'M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Zm-3 9 2 2 4-4',
  car:'m4 14 2-6h12l2 6v5h-3v-2H7v2H4v-5Zm2 0h12M7 11h10',
  tools:'m14 6 4-4 4 4-4 4m-2-2-8 8m-2-2-4 4 4 4 4-4',
  location:'M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  support:'M4 13v-2a8 8 0 0 1 16 0v2m-16 0h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a2 2 0 0 1-2 2h-4',
  part:'M9 3h6l1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2 1-4Zm3 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  check:'M5 12l4 4L19 6'
}
function PageIcon({name='service'}){return <svg viewBox='0 0 24 24' aria-hidden='true'><path d={iconPaths[name]||iconPaths.service}/></svg>}
function SectionHeading({title,copy,action='View all',to='/contact'}){
  return <div className={`sp-section-heading flex items-end justify-between gap-5 ${ui.container}`}><div><h2>{title}</h2>{copy&&<p>{copy}</p>}</div><Link className='inline-flex items-center gap-2 font-semibold text-[#e5091a]' to={to}>{action} <span>-&gt;</span></Link></div>
}

const serviceImagePaths={
  general:'/images/services/general-service.jpg',
  workshop:'/images/services/periodic-maintenance.jpg',
  oil:'/images/services/oil-change.jpg',
  brake:'/images/services/brake-service-detail.jpg',
  ac:'/images/services/ac-service.jpg',
  wheel:'/images/services/wheel-alignment.jpg',
  wheelBalance:'/images/services/wheel-balancing.jpg',
  diagnostics:'/images/services/electrical-repair.jpg',
  battery:'/images/services/battery-service.jpg',
  engine:'/images/services/engine-repair.jpg',
  clutch:'/images/services/clutch-service.jpg',
  suspension:'/images/services/suspension-service.jpg',
  breakdown:'/images/services/breakdown-assistance.jpg',
  dentPaint:'/images/services/dent-paint.jpg',
  doorstep:'/images/services/doorstep-care.jpg',
  premium:'/images/services/engine-repair.jpg',
}
const serviceVisuals=Object.values(serviceImagePaths)
const serviceCategories=[
  ['General Service','Complete vehicle check-up','service',serviceImagePaths.general],
  ['Periodic Maintenance','Keep your car in top shape','calendar',serviceImagePaths.workshop],
  ['Oil Change','Quality oil and filters','part',serviceImagePaths.oil],
  ['Brake Service','Braking inspection and repair','shield',serviceImagePaths.brake],
  ['AC Service','Cooling and gas refill','service',serviceImagePaths.ac],
  ['Wheel Alignment','Perfect steering control','car',serviceImagePaths.wheel],
  ['Wheel Balancing','Smooth and safe driving','car',serviceImagePaths.wheelBalance],
  ['Electrical Repair','Wiring and electrical fixes','tools',serviceImagePaths.diagnostics],
  ['Battery Service','Battery checks and replacement','part',serviceImagePaths.battery],
  ['Engine Repair','Engine diagnosis and repair','tools',serviceImagePaths.engine],
  ['Clutch Service','Clutch check and replacement','service',serviceImagePaths.clutch],
  ['Suspension Service','Suspension repair and tuning','car',serviceImagePaths.suspension],
  ['Breakdown Assistance','24/7 roadside support','support',serviceImagePaths.breakdown],
  ['Dent & Paint','Body repair and painting','tools',serviceImagePaths.dentPaint],
  ['Doorstep Care','Service at your location','location',serviceImagePaths.doorstep],
]
const serviceSeoContent={
  'General Service':{image:serviceImagePaths.general,summary:'Complete vehicle service for daily reliability.',description:'Book general vehicle service with inspection, fluid checks, safety review and expert maintenance support for cars, bikes and commercial vehicles.',features:['Multi-point inspection','Fluid and filter check','Transparent service estimate']},
  'Periodic Maintenance':{image:serviceImagePaths.workshop,summary:'Scheduled maintenance for long-term vehicle health.',description:'Periodic vehicle maintenance helps improve mileage, reduce breakdown risk and keep your car, bike or fleet vehicle ready for regular use.',features:['Service schedule guidance','Preventive maintenance checks','Wear-and-tear report']},
  'Oil Change':{image:serviceImagePaths.general,summary:'Engine oil and filter care for smoother running.',description:'Engine oil change service with quality oil, filter inspection and lubrication checks to protect performance, fuel efficiency and engine life.',features:['Oil grade recommendation','Filter condition check','Engine health review']},
  'Brake Service':{image:serviceImagePaths.brake,summary:'Brake inspection and repair for safer stopping.',description:'Professional brake service covering brake pads, discs, fluid, noise checks and stopping performance for safer city and highway driving.',features:['Brake pad inspection','Disc and fluid check','Road-safety test']},
  'AC Service':{image:serviceImagePaths.workshop,summary:'Cooling performance and cabin comfort service.',description:'Vehicle AC service with cooling inspection, filter cleaning, gas refill guidance and leak checks for reliable comfort in every season.',features:['Cooling performance test','Cabin filter cleaning','Leak and gas-level check']},
  'Wheel Alignment':{image:serviceImagePaths.wheel,summary:'Alignment correction for stable steering control.',description:'Wheel alignment service corrects steering pull, uneven tyre wear and handling issues to improve driving comfort and tyre life.',features:['Computerized alignment','Steering pull correction','Tyre wear inspection']},
  'Wheel Balancing':{image:serviceImagePaths.wheel,summary:'Balanced wheels for smoother, safer driving.',description:'Wheel balancing reduces vibration, protects suspension components and delivers smoother driving at city and highway speeds.',features:['Vibration diagnosis','Precision wheel balancing','Tyre rotation guidance']},
  'Electrical Repair':{image:serviceImagePaths.diagnostics,summary:'Electrical diagnosis for wiring and components.',description:'Auto electrical repair for lights, wiring, sensors, dashboard alerts and charging systems with trained diagnostic support.',features:['Wiring inspection','Sensor fault diagnosis','Lighting and fuse checks']},
  'Battery Service':{image:serviceImagePaths.diagnostics,summary:'Battery check, charging test and replacement help.',description:'Battery service includes health testing, terminal inspection, charging-system checks and replacement support for reliable starts.',features:['Battery health test','Alternator check','Replacement guidance']},
  'Engine Repair':{image:serviceImagePaths.premium,summary:'Engine diagnosis and repair support.',description:'Engine repair service for warning lights, overheating, noise, power loss and performance issues with expert inspection and repair planning.',features:['Engine diagnostics','Performance inspection','Repair estimate support']},
  'Clutch Service':{image:serviceImagePaths.premium,summary:'Clutch inspection and replacement guidance.',description:'Clutch service helps fix slipping, hard pedal feel, gear shifting trouble and wear issues for smooth power delivery.',features:['Clutch wear check','Gear-shift diagnosis','Replacement estimate']},
  'Suspension Service':{image:serviceImagePaths.wheel,summary:'Suspension repair for ride comfort and control.',description:'Suspension service covers shocks, struts, noise, steering stability and ride comfort checks for safer handling.',features:['Shock absorber check','Underbody noise diagnosis','Ride comfort review']},
  'Breakdown Assistance':{image:serviceImagePaths.general,summary:'Roadside help when your vehicle stops.',description:'Breakdown assistance connects you with emergency vehicle support for starting trouble, tyre issues, towing guidance and roadside checks.',features:['Emergency support','Towing coordination','On-road diagnosis']},
  'Dent & Paint':{image:serviceImagePaths.workshop,summary:'Body repair and paint restoration support.',description:'Dent and paint service helps restore body panels, scratches and paint finish with workshop support and clear repair estimates.',features:['Panel damage review','Paint match guidance','Bodywork estimate']},
  'Doorstep Care':{image:serviceImagePaths.premium,summary:'Vehicle care arranged at your location.',description:'Doorstep vehicle service support brings convenient inspection, pickup, drop and basic maintenance coordination closer to your home or office.',features:['Pickup and drop support','At-location inspection','Convenient booking']},
}
Object.assign(serviceSeoContent,{
  'General Service':{...serviceSeoContent['General Service'],image:serviceImagePaths.general},
  'Periodic Maintenance':{...serviceSeoContent['Periodic Maintenance'],image:serviceImagePaths.workshop},
  'Oil Change':{...serviceSeoContent['Oil Change'],image:serviceImagePaths.oil},
  'Brake Service':{...serviceSeoContent['Brake Service'],image:serviceImagePaths.brake},
  'AC Service':{...serviceSeoContent['AC Service'],image:serviceImagePaths.ac},
  'Wheel Alignment':{...serviceSeoContent['Wheel Alignment'],image:serviceImagePaths.wheel},
  'Wheel Balancing':{...serviceSeoContent['Wheel Balancing'],image:serviceImagePaths.wheelBalance},
  'Electrical Repair':{...serviceSeoContent['Electrical Repair'],image:serviceImagePaths.diagnostics},
  'Battery Service':{...serviceSeoContent['Battery Service'],image:serviceImagePaths.battery},
  'Engine Repair':{...serviceSeoContent['Engine Repair'],image:serviceImagePaths.engine},
  'Clutch Service':{...serviceSeoContent['Clutch Service'],image:serviceImagePaths.clutch},
  'Suspension Service':{...serviceSeoContent['Suspension Service'],image:serviceImagePaths.suspension},
  'Breakdown Assistance':{...serviceSeoContent['Breakdown Assistance'],image:serviceImagePaths.breakdown},
  'Dent & Paint':{...serviceSeoContent['Dent & Paint'],image:serviceImagePaths.dentPaint},
  'Doorstep Care':{...serviceSeoContent['Doorstep Care'],image:serviceImagePaths.doorstep},
})
const serviceKeywordProfiles=[[/brake/i,'Brake Service'],[/oil|lubric/i,'Oil Change'],[/align|balanc|tyre|tire|wheel/i,'Wheel Alignment'],[/battery|electric|wiring|sensor/i,'Electrical Repair'],[/engine|diagnos/i,'Engine Repair'],[/clutch/i,'Clutch Service'],[/suspension|shock/i,'Suspension Service'],[/breakdown|roadside|tow/i,'Breakdown Assistance'],[/dent|paint|body/i,'Dent & Paint'],[/doorstep|pickup/i,'Doorstep Care'],[/ac|cooling/i,'AC Service'],[/periodic|maintenance/i,'Periodic Maintenance']]
const serviceProfile=(item,index=0)=>{
  const name=typeof item==='string'?item:item?.name||''
  const group=typeof item==='string'?'':categoryName(item?.category)
  const matchText=[name,group].join(' ')
  const matched=serviceKeywordProfiles.find(([matcher])=>matcher.test(matchText))?.[1]
  const profile=serviceSeoContent[name]||serviceSeoContent[group]||serviceSeoContent[matched]||serviceSeoContent['General Service']
  return {...profile,image:(typeof item==='object'&&item?.imageUrl)||profile.image||serviceVisuals[index%serviceVisuals.length]}
}
const serviceFeatures=(item,profile)=>{
  const raw=Array.isArray(item?.features)?item.features:String(item?.features||'').split(',')
  const features=raw.map(feature=>String(feature).trim()).filter(Boolean).slice(0,3)
  return features.length?features:profile.features
}
const servicePackages=[
  {name:'Basic Service',price:1499,copy:'Essential checks for dependable daily driving',features:['Multi-point vehicle check','Engine oil and fluid inspection','Tyre and battery check','Exterior wash']},
  {name:'Standard Service',price:2999,copy:'Complete scheduled care for smoother driving',popular:true,features:['Everything in Basic','Brake and AC inspection','Wheel alignment check','Service report']},
  {name:'Premium Service',price:4999,copy:'Thorough maintenance for long-term performance',features:['Everything in Standard','100-point inspection','Engine diagnostics','Interior and exterior care']},
  {name:'Doorstep Service',price:999,copy:'Convenient basic care at your home or office',features:['At-location basic inspection','Oil and fluid check','Battery and tyre check','Pickup and drop coordination']},
]
const serviceCenters=[
  {name:'Speedy Care Auto Hub',place:'Gurugram, Haryana',image:serviceCenter},
  {name:'AutoPrime Service Station',place:'Noida, Uttar Pradesh',image:diagnosticsImage},
  {name:'PitStop Car Care',place:'New Delhi',image:engineImage},
  {name:'DriveWell Service Center',place:'Bengaluru, Karnataka',image:maintenanceImage},
]
const serviceTips=[
  {title:'5 Signs Your Car Needs a Service',image:engineImage},
  {title:'How Regular Servicing Saves Money',image:diagnosticsImage},
  {title:'Monsoon Car Care Tips',image:roadTyres},
]
const serviceFaqs=['How do I request a service?','Do you use genuine parts?','Is pickup and drop available?','How long does a service take?','What is included in the package?','Do you provide service warranty?']
const serviceBrandLogos={
  'maruti suzuki':marutiSuzukiLogo,
  hyundai:hyundaiLogo,
  tata:tataLogo,
  mahindra:mahindraLogo,
  kia:kiaLogo,
  honda:hondaLogo,
  toyota:toyotaLogo,
  mg:mgLogo,
  skoda:skodaLogo,
  volkswagen:volkswagenLogo,
  bajaj:bajajLogo,
  tvs:tvsLogo,
  'ashok leyland':ashokLeylandLogo,
}
const serviceBrandLogo=(brand)=>serviceBrandLogos[cleanBrandName(brand).toLowerCase().replace(/&/g,'and').replace(/\s+/g,' ')]
const defaultServiceBrands=['Maruti Suzuki','Hyundai','Tata','Mahindra','Kia','Honda','Toyota','MG','Skoda','Volkswagen','Bajaj','TVS','Ashok Leyland']
const defaultPartBrands=['BOSCH','MANN FILTER','EXIDE','brembo','DENSO','NGK','Valeo','LuK','Castrol','MRF']
const cleanBrandName=(value)=>String(typeof value==='string'?value:value?.name||'').trim()
const uniqueBrandList=(values,fallback)=>{
  const seen=new Set()
  const brands=[]
  for(const value of values.flatMap(item=>Array.isArray(item)?item:[item])){
    const name=cleanBrandName(value)
    const key=name.toLowerCase()
    if(name&&!seen.has(key)){seen.add(key);brands.push(name)}
  }
  return brands
}
const serviceBrandList=(items)=>uniqueBrandList(items.flatMap(item=>item?.brands||[]),defaultServiceBrands)
const partBrandList=(items)=>uniqueBrandList(items.map(partBrandName),defaultPartBrands)
const partCategories=[
  {name:'Engine Parts',count:'1200+ Parts',image:engineImage},{name:'Brake Parts',count:'850+ Parts',image:brakeImage},
  {name:'Suspension Parts',count:'650+ Parts',image:serviceCenter},{name:'Clutch Parts',count:'500+ Parts',image:diagnosticsImage},
  {name:'Electrical Parts',count:'1500+ Parts',image:maintenanceImage},{name:'Body Parts',count:'900+ Parts',image:partsHero},
  {name:'Filters',count:'1000+ Parts',image:oilCloseup},{name:'Belts',count:'400+ Parts',image:engineImage},
  {name:'Batteries',count:'200+ Parts',image:diagnosticsImage},{name:'Tyres',count:'700+ Parts',image:tyreImage},
  {name:'Lubricants',count:'300+ Parts',image:oilImage},{name:'Accessories',count:'800+ Parts',image:cars},
]
const partProductVisuals=[oilCloseup,brakeImage,diagnosticsImage,engineImage,tyreImage,oilImage]
const sparePartPages=[
  {slug:'two-wheeler-parts',name:'Two Wheeler Parts',title:'Two Wheeler Spare Parts',description:'Explore genuine bike and scooter spare parts with model-specific fitment support for safer, smoother everyday rides.'},
  {slug:'car-parts',name:'Car Parts',title:'Car Spare Parts',description:'Find genuine car components for maintenance, repair and replacement across popular hatchbacks, sedans, SUVs and MPVs.'},
  {slug:'commercial-vehicle-parts',name:'Commercial Vehicle Parts',title:'Commercial Vehicle Spare Parts',description:'Source dependable parts for trucks, pickups, buses, vans and other commercial vehicles with expert compatibility guidance.'},
  {slug:'construction-equipment-parts',name:'Construction Equipment Parts',title:'Construction Equipment Spare Parts',description:'Discover durable replacement components for excavators, loaders, cranes and heavy construction equipment.'},
  {slug:'ev-vehicle-parts',name:'EV Vehicle Parts',title:'Electric Vehicle Spare Parts',description:'Browse electric vehicle parts for EV cars, bikes, scooters and commercial mobility with fitment and technical assistance.'},
  {slug:'farm-vehicle-parts',name:'Farm Vehicle Parts',title:'Farm Vehicle Spare Parts',description:'Find reliable tractor and farm equipment parts designed to support productivity, uptime and demanding field work.'},
]

export function ServicesPage({data}){
  const { categorySlug='' }=useParams()
  const [searchParams]=useSearchParams()
  const queryCategory=searchParams.get('category')||''
  const activeSlug=categorySlug||slugify(queryCategory)
  const serviceCategoryCards=(data.serviceCategories||[]).map((item,index)=>{const profile=serviceProfile(item.name,index);return [item.name,item.description||profile.summary,'service',item.icon||profile.image]})
  const activeServiceCategory=activeSlug?serviceCategoryCards.find(([name])=>slugify(name)===activeSlug||name.toLowerCase()===queryCategory.toLowerCase()):null
  const activeCategoryName=activeServiceCategory?.[0]||''
  const activeProfile=activeServiceCategory?serviceProfile(activeCategoryName):null
  const liveItems=data.services||[]
  const serviceSource=liveItems
  const displayServices=activeSlug?serviceSource.filter(item=>{
    const profile=serviceProfile(item)
    const values=[item.name,categoryName(item.category),profile.summary,profile.description].filter(Boolean).map(slugify)
    return values.some(value=>value===activeSlug||value.includes(activeSlug)||activeSlug.includes(value))
  }):serviceSource
  const serviceBrands=serviceBrandList(liveItems)
  const pageTitle=activeCategoryName?`${activeCategoryName} Services`:'Expert Vehicle Service'
  const pageDescription=activeProfile?.description||'Complete care for your bike, car, commercial, tractor and construction vehicles, all under one roof.'

  useEffect(()=>{
    if(!activeCategoryName)return
    document.title=`${activeCategoryName} Services | Bright Auto Hub`
    document.querySelector('meta[name="description"]')?.setAttribute('content',pageDescription)
  },[activeCategoryName,pageDescription])

  return <main className='service-reference-page min-h-screen overflow-x-clip bg-white text-[#151c27]'>


    <section className='market-wrap sp-section'>
      <SectionHeading title={activeCategoryName?'More Service Categories':'Browse Services by Category'} copy='Choose a dedicated service page for routine maintenance, specialist repairs and roadside support.' action='View all services' to='/services'/>
      <div className='service-category-grid'>{serviceCategoryCards.map(([name,copy,icon,image],index)=>{const profile=serviceProfile(name,index);const slug=slugify(name);return <Link className={activeSlug===slug?'active':''} to={`/services/${slug}`} key={name}><img src={image||profile.image} alt={name+' vehicle service workshop'} loading='lazy'/><span><PageIcon name={icon}/></span><div><h3>{name}</h3><p>{profile.summary||copy}</p><small>{profile.features[0]}</small></div></Link>})}</div>
    </section>

    {activeServiceCategory&&<section className='market-wrap sp-section compact-section service-category-detail'>
      <div><small>SELECTED SERVICE</small><h2>{activeCategoryName}</h2><p>{activeProfile.description}</p></div>
      <ul>{activeProfile.features.map(feature=><li key={feature}><PageIcon name='check'/><span>{feature}</span></li>)}</ul>
    </section>}

    <section className='market-wrap sp-section'>
      <SectionHeading title='Service Packages' copy='Choose the right level of vehicle care with clear starting prices. Final pricing depends on your vehicle and the work required.' action='Compare with an expert' to={enquiryLink('service','Service package comparison')}/>
      <div className='service-package-grid'>{servicePackages.map(item=><article className={item.popular?'popular':''} key={item.name}>{item.popular&&<b>POPULAR</b>}<h3>{item.name}</h3><p>{item.copy}</p><strong>From Rs {Number(item.price).toLocaleString('en-IN')}<small> onwards</small></strong><ul>{item.features.map(feature=><li key={feature}><PageIcon name='check'/><span>{feature}</span></li>)}</ul><Link to={enquiryLink('service',item.name)}>Enquire Now</Link></article>)}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='Brands We Service' copy='Experienced care for all major Indian and global vehicle brands.' action='Ask about your brand' to={enquiryLink('service','Brand service availability')}/>
      <div className='sp-brand-row service-brand-logo-row'>{serviceBrands.map(brand=>{const logo=serviceBrandLogo(brand);return <span className='sp-brand-logo-card' title={brand} key={brand}>{logo?<img src={logo} alt={brand+' service brand logo'} loading='lazy'/>:<b>{cleanBrandName(brand).slice(0,2).toUpperCase()}</b>}</span>})}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='How It Works' copy='Send your service request in five simple steps.' action='Start now' to={enquiryLink('service','New service request')}/>
      <div className='sp-process-row'>{[['car','Select Vehicle'],['service','Choose Service'],['calendar','Pick a Slot'],['shield','Confirm Request'],['tools','Get Service']].map(([icon,label],index)=><article key={label}><span><PageIcon name={icon}/></span><div><small>STEP 0{index+1}</small><h3>{label}</h3></div></article>)}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='Why Choose Bright Auto Hub' copy='Reliable people, quality parts and transparent updates.' action='Talk to support' to={enquiryLink('service','Service support')}/>
      <div className='sp-benefit-row'>{[['tools','Trained Technicians'],['part','Genuine Parts'],['shield','Transparent Pricing'],['support','Live Tracking'],['car','Pickup & Drop']].map(([icon,label])=><article key={label}><span><PageIcon name={icon}/></span><h3>{label}</h3><p>Professional support with clear communication.</p></article>)}</div>
    </section>

    <section className='market-wrap sp-section'>
      <SectionHeading title='Featured Service Centers' copy='Trusted workshops ready to care for your vehicle.' action='Find a workshop' to={enquiryLink('service','Nearby workshop')}/>
      <div className='service-center-grid'>{serviceCenters.map(center=><article key={center.name}><img src={center.image} alt={center.name+' automotive workshop'}/><div><small>4.8 - VERIFIED</small><h3>{center.name}</h3><p>{center.place}</p><span>General Service - AC Service</span><Link to={enquiryLink('service',center.name)}>Request Service</Link></div></article>)}</div>
    </section>

    <section className='market-wrap sp-roadside-banner'><div><small>24/7 ROADSIDE ASSISTANCE</small><h2>Breakdown? We&apos;ve Got Your Back.</h2><p>Quick response and reliable support wherever your journey takes you.</p></div><a href='tel:+919876543210'>Call +91 98765 43210</a><img src={doorstepImage} alt='Roadside vehicle assistance support'/></section>

    <section className='market-wrap sp-section'>
      <SectionHeading title={activeCategoryName?`${activeCategoryName} Services`:'All Vehicle Services'} copy={displayServices.length?`${displayServices.length} service option${displayServices.length===1?'':'s'} ready for enquiry.`:'No services found in this category yet.'} action='Send an enquiry' to={enquiryLink('service',activeCategoryName||'Vehicle service requirement')}/>
      <div className='service-live-grid'>{displayServices.length?displayServices.map((item,index)=>{const profile=serviceProfile(item,index);const features=serviceFeatures(item,profile);const target=item.slug||item._id&&!String(item._id).startsWith('fallback-')?'/services/product/'+(item.slug||item._id):enquiryLink('service',item.name,activeCategoryName||categoryName(item.category));const priceTarget=enquiryLink('service',item.name,activeCategoryName||categoryName(item.category));return <article key={item._id||item.name}><Link className='service-live-image' to={target}><span className='service-live-badge'>SERVICE</span><img src={profile.image} alt={item.name+' service, repair and maintenance'} loading='lazy' onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src=serviceVisuals[index%serviceVisuals.length]}}/></Link><div className='service-live-copy'><small>{activeCategoryName||categoryName(item.category)}</small><h3>{item.name}</h3><p>{item.description||profile.description}</p><ul className='service-seo-points'>{features.map(feature=><li key={feature}>{feature}</li>)}</ul><footer><strong>{priceOnEnquiry}</strong><Link to={priceTarget}>Enquire Now</Link></footer></div></article>}):<div className='market-empty'>No services found in this category yet.</div>}</div>
    </section>

    <section className='market-wrap service-editorial-row'>
      <article className='service-review'><small>CUSTOMER STORY</small><h2>&quot;Clear updates and excellent doorstep support.&quot;</h2><p>The enquiry was answered quickly and the workshop handled everything professionally.</p><strong>- Rohit Sharma, New Delhi</strong></article>
      <div><SectionHeading title='Service Tips & Advice' action='Read our blog' to='/blog'/><div className='service-tip-grid'>{serviceTips.map(tip=><Link to='/blog' key={tip.title}><img src={tip.image} alt={tip.title}/><h3>{tip.title}</h3><small>5 min read -&gt;</small></Link>)}</div></div>
    </section>

    <section className='market-wrap sp-section sp-faq'><SectionHeading title='Frequently Asked Questions' copy='Quick answers before you send your enquiry.' action='Contact support' to='/contact'/><div>{serviceFaqs.map(item=><details key={item}><summary>{item}<span>+</span></summary><p>Send us your vehicle details and preferred service. Our team will confirm availability, pricing and the next steps.</p></details>)}</div></section>
    <section className='market-wrap sp-final-cta'><div><small>READY FOR RELIABLE VEHICLE CARE?</small><h2>Give Your Vehicle the Care It Deserves.</h2><p>Tell us what your vehicle needs and our service team will contact you.</p><Link to={enquiryLink('service','Service appointment')}>Request Service Now</Link></div><img src={cars} alt='Vehicle ready for professional service'/></section>
  </main>
}
export function PartsPage({data}){
  const {categorySlug=''}=useParams()
  const [searchParams]=useSearchParams()
  const legacyCategory=searchParams.get('category')||''
  const selectedPage=sparePartPages.find(page=>page.slug===categorySlug||page.name.toLowerCase()===legacyCategory.toLowerCase())
  const activeCategory=selectedPage?.name||legacyCategory
  const liveItems=data.parts||[]
  const products=liveItems
  const categoryGroups=data.partCategories||[]
  const matchingGroups=activeCategory?categoryGroups.filter(group=>group.name?.toLowerCase()===activeCategory.toLowerCase()):categoryGroups
  const visibleCategoryGroups=matchingGroups.length?matchingGroups:categoryGroups
  const selectedGroup=categoryGroups.find(group=>group.name?.toLowerCase()===activeCategory.toLowerCase())
  const selectedChildIds=new Set((selectedGroup?.children||[]).map(item=>String(item._id)))
  const selectedChildNames=new Set((selectedGroup?.children||[]).map(item=>item.name?.toLowerCase()))
  const visibleProducts=activeCategory?products.filter(item=>{
    const categoryId=typeof item.categoryId==='object'?item.categoryId?._id:item.categoryId
    const groupName=typeof item.categoryGroup==='object'?item.categoryGroup?.name:item.categoryGroup
    const parentName=typeof item.category?.parentId==='object'?item.category?.parentId?.name:''
    if(groupName)return groupName.toLowerCase()===activeCategory.toLowerCase()
    if(parentName)return parentName.toLowerCase()===activeCategory.toLowerCase()
    if(categoryId)return selectedChildIds.has(String(categoryId))
    return selectedChildNames.has(categoryName(item.category).toLowerCase())
  }):products
  const productsInCategory=(category)=>products.filter(item=>{
    const itemCategoryId=typeof item.categoryId==='object'?item.categoryId?._id:item.categoryId
    return String(itemCategoryId)===String(category._id)||(!itemCategoryId&&categoryName(item.category)===category.name)
  }).length
  const partBrands=partBrandList(visibleProducts)
  const pageTitle=selectedPage?.title||'Genuine Spare Parts for Every Vehicle'
  const pageDescription=selectedPage?.description||'Browse genuine spare parts for two wheelers, cars, commercial vehicles, construction equipment, electric vehicles and farm vehicles.'

  useEffect(()=>{
    document.title=`${pageTitle} | Bright Auto Hub`
    let description=document.querySelector('meta[name="description"]')
    if(!description){
      description=document.createElement('meta')
      description.setAttribute('name','description')
      document.head.appendChild(description)
    }
    description.setAttribute('content',pageDescription)
  },[pageTitle,pageDescription])

  return <main className='parts-reference-page min-h-screen overflow-x-clip bg-white text-[#151c27]'>

    <section className='market-wrap sp-section'>
      <SectionHeading title={selectedPage?`${selectedPage.name} Categories`:'Browse Every Spare Parts Category'} copy={selectedPage?`Browse every available ${selectedPage.name.toLowerCase()} category.`:'Database-driven parts for two wheelers, cars, commercial, construction, EV and farm vehicles.'} action='Ask for any category' to={enquiryLink('part',selectedPage?.title||'Spare part category',activeCategory)}/>
      <div className='parts-hierarchy'>{visibleCategoryGroups.map(group=><article className='parts-category-group' key={group._id||group.name}>
        <header><img src={group.icon||brakeImage} alt=''/><div><small>VEHICLE PARTS DIRECTORY</small><h2>{group.name}</h2><p>{group.description}</p></div><strong>{group.children?.length||0} Categories</strong></header>
        <div className='parts-category-grid'>{(group.children||[]).map(item=><Link to={'/spare-parts?category='+encodeURIComponent(item.name)} key={item._id||item.name}><img src={item.icon||brakeImage} alt={item.name+' product category'}/><h3>{item.name}</h3><p>{item.description}</p><small>{productsInCategory(item)} Product{productsInCategory(item)===1?'':'s'} Open</small></Link>)}</div>
      </article>)}</div>
    </section>

    <section className='market-wrap sp-section parts-catalogue-section'>
      <SectionHeading title={selectedPage?`All ${selectedPage.name}`:'All Spare Parts'} copy={`${visibleProducts.length} active products available in this catalogue.`} action='Enquire for any part' to={enquiryLink('part',selectedPage?.title||'Spare parts catalogue',activeCategory)}/>
      {visibleProducts.length?<div className='parts-product-grid'>{visibleProducts.map((item,index)=>{
        const hasDetail=(item.slug||item._id)&&!String(item._id||'').startsWith('fallback-')
        const target=hasDetail?'/spare-parts/product/'+(item.slug||item._id):enquiryLink('part',item.name,activeCategory)
        const groupLabel=typeof item.categoryGroup==='object'?item.categoryGroup?.name:item.categoryGroup
        return <article className='parts-product-card' key={item._id||item.name}><Link className='parts-product-media' to={target}><span>GENUINE</span><PartProductImage item={item} index={index} groups={categoryGroups} activeCategory={activeCategory}/></Link><div className='parts-product-copy'><div className='parts-product-meta'><small>{groupLabel||categoryName(item.category)}</small><b>{partBrandName(item)}</b></div><h3>{item.name}</h3><p>{categoryName(item.category)} - Fitment check available</p><div className='parts-product-specs'>{item.partNumber&&<span>{item.partNumber}</span>}<span>{Number(item.stock||0)>0?'In stock':'Check stock'}</span></div><footer><span className='parts-price-label'>{priceOnEnquiry}</span><Link className='parts-price-enquiry' to={enquiryLink('part',item.name,groupLabel||activeCategory)}>Enquire Now</Link></footer></div></article>
      })}</div>:<div className='market-empty'>No products are available in this category yet. Send an enquiry and our parts team will help you.</div>}
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='Shop by Top Brands' copy='Tell us your preferred brand or ask for a compatible alternative.' action='Brand enquiry' to={enquiryLink('part','Preferred spare part brand',activeCategory)}/>
      <div className='sp-brand-row parts-brands'>{partBrands.map(brand=><span key={brand}>{brand}</span>)}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <div className='sp-benefit-row parts-benefits'>{[['shield','100% Genuine Parts'],['part','Best Price Guidance'],['calendar','Easy Returns Support'],['car','Fast Delivery Support'],['support','Expert Fitment Help']].map(([icon,label])=><article key={label}><span><PageIcon name={icon}/></span><h3>{label}</h3><p>Clear assistance from enquiry to delivery.</p></article>)}</div>
    </section>
  </main>
}
