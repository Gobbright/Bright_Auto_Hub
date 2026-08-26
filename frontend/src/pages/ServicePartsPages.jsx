import { useEffect } from 'react'
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
import './service-parts.css'
import './service-parts-extra.css'
import { ui } from '../lib/uiClasses.js'

const money=(value)=>Number(value)>0?'₹'+Number(value).toLocaleString('en-IN'):'Request quote'
const enquiryLink=(source,item,category='')=>'/contact?'+new URLSearchParams({
  subject:source==='service'?'Service enquiry':'Spare parts enquiry',item,source,category,page:typeof window==='undefined'?'':window.location.pathname,
}).toString()
const categoryName=(category)=>typeof category==='string'?category:category?.name||'Automotive'

const iconPaths={
  service:'M12 2v4m0 12v4M4.9 4.9l2.9 2.9m8.4 8.4 2.9 2.9M2 12h4m12 0h4M4.9 19.1l2.9-2.9m8.4-8.4 2.9-2.9M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  calendar:'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm2-2v4m10-4v4M3 9h18m-13 4h3m2 0h3m-8 4h3',
  shield:'M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Zm-3 9 2 2 4-4',
  car:'m4 14 2-6h12l2 6v5h-3v-2H7v2H4v-5Zm2 0h12M7 11h10',
  tools:'m14 6 4-4 4 4-4 4m-2-2-8 8m-2-2-4 4 4 4 4-4',
  location:'M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  support:'M4 13v-2a8 8 0 0 1 16 0v2m-16 0h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a2 2 0 0 1-2 2h-4',
  part:'M9 3h6l1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2 1-4Zm3 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
}
function PageIcon({name='service'}){return <svg viewBox='0 0 24 24' aria-hidden='true'><path d={iconPaths[name]||iconPaths.service}/></svg>}
function SectionHeading({title,copy,action='View all',to='/contact'}){
  return <div className={`sp-section-heading flex items-end justify-between gap-5 ${ui.container}`}><div><h2>{title}</h2>{copy&&<p>{copy}</p>}</div><Link className='inline-flex items-center gap-2 font-semibold text-[#e5091a]' to={to}>{action} <span>→</span></Link></div>
}

const serviceCategories=[
  ['General Service','Complete vehicle check-up','service'],['Periodic Maintenance','Keep your car in top shape','calendar'],
  ['Oil Change','Quality oil and filters','part'],['Brake Service','Braking inspection and repair','shield'],
  ['AC Service','Cooling and gas refill','service'],['Wheel Alignment','Perfect steering control','car'],
  ['Wheel Balancing','Smooth and safe driving','car'],['Electrical Repair','Wiring and electrical fixes','tools'],
  ['Battery Service','Battery checks and replacement','part'],['Engine Repair','Engine diagnosis and repair','tools'],
  ['Clutch Service','Clutch check and replacement','service'],['Suspension Service','Suspension repair and tuning','car'],
  ['Breakdown Assistance','24/7 roadside support','support'],['Dent & Paint','Body repair and painting','tools'],
  ['Doorstep Care','Service at your location','location'],
]
const servicePackages=[
  {name:'Basic Service',price:1499,copy:'Essential care for your vehicle',features:['General check-up','Engine oil inspection','Top-up fluids','Car wash']},
  {name:'Standard Service',price:2999,copy:'Complete care for smooth driving',popular:true,features:['Everything in Basic','Brake inspection','AC check & cleaning','Wheel alignment']},
  {name:'Premium Service',price:4999,copy:'Advanced care for peak performance',features:['Everything in Standard','100-point inspection','Engine tune-up','Interior treatment']},
  {name:'Doorstep Service',price:999,copy:'Professional care at your location',features:['Pickup & drop','Basic check-up','Oil change support','Doorstep convenience']},
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
const partCategories=[
  {name:'Engine Parts',count:'1200+ Parts',image:engineImage},{name:'Brake Parts',count:'850+ Parts',image:brakeImage},
  {name:'Suspension Parts',count:'650+ Parts',image:serviceCenter},{name:'Clutch Parts',count:'500+ Parts',image:diagnosticsImage},
  {name:'Electrical Parts',count:'1500+ Parts',image:maintenanceImage},{name:'Body Parts',count:'900+ Parts',image:partsHero},
  {name:'Filters',count:'1000+ Parts',image:oilCloseup},{name:'Belts',count:'400+ Parts',image:engineImage},
  {name:'Batteries',count:'200+ Parts',image:diagnosticsImage},{name:'Tyres',count:'700+ Parts',image:tyreImage},
  {name:'Lubricants',count:'300+ Parts',image:oilImage},{name:'Accessories',count:'800+ Parts',image:cars},
]
const fallbackParts=[
  {name:'Premium Oil Filter',category:'Filters',price:320,imageUrl:oilCloseup},
  {name:'Front Brake Pad Set',category:'Brake Parts',price:1250,imageUrl:brakeImage},
  {name:'Long-Life Car Battery',category:'Electrical Parts',price:4850,imageUrl:diagnosticsImage},
  {name:'Iridium Spark Plug Set',category:'Engine Parts',price:680,imageUrl:engineImage},
  {name:'Performance Tyre Pair',category:'Tyres',price:8450,imageUrl:tyreImage},
  {name:'Synthetic Engine Oil',category:'Lubricants',price:2450,imageUrl:oilImage},
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
  const [searchParams]=useSearchParams()
  const activeCategory=searchParams.get('category')||''
  const visibleServiceCategories=activeCategory?serviceCategories.filter(([name])=>name.toLowerCase()===activeCategory.toLowerCase()):serviceCategories
  const liveItems=data.services||[]
  const displayServices=liveItems.length?liveItems:serviceCategories.slice(0,9).map(([name,description],index)=>({_id:'fallback-service-'+index,name,description,category:'Vehicle Care',price:[899,1499,1199,999][index%4]}))
  return <main className='service-reference-page min-h-screen overflow-x-clip bg-white text-[#151c27]'>
    <section className='sp-hero service-page-hero'>
      <div className='sp-hero-copy'>
        <p className='sp-breadcrumb'>Home <span>›</span> Services</p><small>COMPLETE VEHICLE CARE</small>
        <h1>Expert Vehicle Service.<em>Trusted Care.</em></h1>
        <p>Complete care for your bike, car, commercial, tractor and construction vehicles—all under one roof.</p>
        <div className='sp-trust-pills'>{['Verified Workshops','Genuine Parts','Doorstep Pickup','Transparent Pricing'].map((item,index)=><span key={item}><PageIcon name={['shield','part','car','service'][index]}/>{item}</span>)}</div>
      </div>
      <img src={serviceHero} alt='Expert mechanic servicing a vehicle engine in a workshop'/>
    </section>

    <section className='market-wrap sp-finder service-booking-panel'>
      <div className='service-type-tabs'>{[['car','Car Service'],['service','Bike Service'],['car','Commercial Service'],['tools','Tractor Service'],['part','Construction Service']].map(([icon,label],index)=><button className={index===0?'active':''} type='button' key={label}><PageIcon name={icon}/>{label}</button>)}</div>
      <div className='sp-filter-grid five-fields'>
        {['Select Brand','Select Model','Select City','Select Service'].map(label=><label key={label}><span>{label}</span><select aria-label={label}><option>{label}</option></select></label>)}
        <label><span>Preferred Date</span><input aria-label='Preferred service date' type='date'/></label>
        <Link to={enquiryLink('service','Vehicle service booking')}>Request Service</Link>
      </div>
    </section>

    <section className='market-wrap sp-stat-row'>{[['car','2500+','Service Centers'],['support','25L+','Happy Customers'],['service','40L+','Vehicles Serviced'],['location','1200+','Cities Covered'],['calendar','24/7','Support Available']].map(([icon,value,label])=><div key={label}><span><PageIcon name={icon}/></span><strong>{value}</strong><small>{label}</small></div>)}</section>

    <section className='market-wrap sp-section'>
      <SectionHeading title='Browse Services by Category' copy='Everything your vehicle needs, from routine maintenance to specialist repairs.' action='Enquire for a service' to={enquiryLink('service','Service category guidance')}/>
      <div className='service-category-grid'>{visibleServiceCategories.map(([name,copy,icon])=><Link to={enquiryLink('service',name)} key={name}><span><PageIcon name={icon}/></span><div><h3>{name}</h3><p>{copy}</p></div></Link>)}</div>
    </section>

    <section className='market-wrap sp-section'>
      <SectionHeading title='Service Packages' copy='Clear starting prices and flexible packages for every vehicle.' action='Compare with an expert' to={enquiryLink('service','Service package comparison')}/>
      <div className='service-package-grid'>{servicePackages.map(item=><article className={item.popular?'popular':''} key={item.name}>{item.popular&&<b>POPULAR</b>}<h3>{item.name}</h3><p>{item.copy}</p><strong>{money(item.price)}<small> onwards</small></strong><ul>{item.features.map(feature=><li key={feature}>✓ {feature}</li>)}</ul><Link to={enquiryLink('service',item.name)}>Request Package</Link></article>)}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='Brands We Service' copy='Experienced care for all major Indian and global vehicle brands.' action='Ask about your brand' to={enquiryLink('service','Brand service availability')}/>
      <div className='sp-brand-row'>{['MARUTI SUZUKI','HYUNDAI','TATA','Mahindra','KIA','HONDA','TOYOTA','MG','ŠKODA'].map(brand=><span key={brand}>{brand}</span>)}</div>
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
      <div className='service-center-grid'>{serviceCenters.map(center=><article key={center.name}><img src={center.image} alt={center.name+' automotive workshop'}/><div><small>★ 4.8 · VERIFIED</small><h3>{center.name}</h3><p>{center.place}</p><span>General Service · AC Service</span><Link to={enquiryLink('service',center.name)}>Request Service</Link></div></article>)}</div>
    </section>

    <section className='market-wrap sp-roadside-banner'><div><small>24/7 ROADSIDE ASSISTANCE</small><h2>Breakdown? We&apos;ve Got Your Back.</h2><p>Quick response and reliable support wherever your journey takes you.</p></div><a href='tel:+919876543210'>Call +91 98765 43210</a><img src={doorstepImage} alt='Roadside vehicle assistance support'/></section>

    <section className='market-wrap sp-section'>
      <SectionHeading title='All Vehicle Services' copy={liveItems.length+' live services from the admin catalogue.'} action='Send an enquiry' to={enquiryLink('service','Vehicle service requirement')}/>
      <div className='service-live-grid'>{displayServices.map(item=><article key={item._id||item.name}><span><PageIcon name='service'/></span><small>{categoryName(item.category)}</small><h3>{item.name}</h3><p>{item.description||'Professional vehicle care from trained service partners.'}</p><strong>From {money(item.price||999)}</strong><Link to={item.slug||item._id&&!String(item._id).startsWith('fallback-')?'/services/product/'+(item.slug||item._id):enquiryLink('service',item.name)}>View Service</Link></article>)}</div>
    </section>

    <section className='market-wrap service-editorial-row'>
      <article className='service-review'><small>CUSTOMER STORY</small><h2>“Clear updates and excellent doorstep support.”</h2><p>The enquiry was answered quickly and the workshop handled everything professionally.</p><strong>— Rohit Sharma, New Delhi</strong></article>
      <div><SectionHeading title='Service Tips & Advice' action='Read our blog' to='/blog'/><div className='service-tip-grid'>{serviceTips.map(tip=><Link to='/blog' key={tip.title}><img src={tip.image} alt={tip.title}/><h3>{tip.title}</h3><small>5 min read →</small></Link>)}</div></div>
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
  const products=liveItems.length?liveItems:fallbackParts
  const categoryGroups=data.partCategories?.length?data.partCategories:[{_id:'popular-parts',name:'Popular Parts',description:'Common service and replacement parts.',icon:brakeImage,children:partCategories.map((item,index)=>({...item,_id:'fallback-category-'+index,icon:item.image,description:item.count}))}]
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
    <section className='market-wrap parts-page-intro'>
      <p className='parts-page-breadcrumb'><Link to='/'>Home</Link><span>/</span><Link to='/spare-parts'>Spare Parts</Link>{selectedPage&&<><span>/</span><b>{selectedPage.name}</b></>}</p>
      <small>GENUINE COMPONENTS</small>
      <h1>{pageTitle}</h1>
      <p>{pageDescription}</p>
    </section>

    <section className='market-wrap sp-finder parts-finder-panel'>
      <h2>{selectedPage?`Find ${selectedPage.name} for Your Vehicle`:'Find Parts for Your Vehicle'}</h2>
      <div className='sp-filter-grid four-fields'>
        {['Select Vehicle Type','Select Brand','Select Model','Select Variant'].map(label=><label key={label}><span>{label}</span><select aria-label={label}><option>{label}</option></select></label>)}
        <Link to={enquiryLink('part',selectedPage?.title||'Vehicle-specific spare parts',activeCategory)}>Enquire Parts</Link>
      </div>
      <p>Popular searches: <span>Oil Filter</span><span>Brake Pads</span><span>Headlight</span><span>Battery</span><span>Clutch Plate</span></p>
    </section>

    <section className='market-wrap sp-section'>
      <SectionHeading title={selectedPage?`${selectedPage.name} Categories`:'Browse Every Spare Parts Category'} copy={selectedPage?`Browse every available ${selectedPage.name.toLowerCase()} category.`:'Database-driven parts for two wheelers, cars, commercial, construction, EV and farm vehicles.'} action='Ask for any category' to={enquiryLink('part',selectedPage?.title||'Spare part category',activeCategory)}/>
      <div className='parts-hierarchy'>{visibleCategoryGroups.map(group=><article className='parts-category-group' key={group._id||group.name}>
        <header><img src={group.icon||brakeImage} alt=''/><div><small>VEHICLE PARTS DIRECTORY</small><h2>{group.name}</h2><p>{group.description}</p></div><strong>{group.children?.length||0} Categories</strong></header>
        <div className='parts-category-grid'>{(group.children||[]).map(item=><Link to={enquiryLink('part',item.name,group.name)} key={item._id||item.name}><img src={item.icon||brakeImage} alt={item.name+' product category'}/><h3>{item.name}</h3><p>{item.description}</p><small>{productsInCategory(item)} Product{productsInCategory(item)===1?'':'s'} &rarr;</small></Link>)}</div>
      </article>)}</div>
    </section>

    <section className='market-wrap sp-section parts-catalogue-section'>
      <SectionHeading title={selectedPage?`All ${selectedPage.name}`:'All Spare Parts'} copy={`${visibleProducts.length} active products available in this catalogue.`} action='Enquire for any part' to={enquiryLink('part',selectedPage?.title||'Spare parts catalogue',activeCategory)}/>
      {visibleProducts.length?<div className='parts-product-grid'>{visibleProducts.map((item,index)=>{
        const hasDetail=(item.slug||item._id)&&!String(item._id||'').startsWith('fallback-')
        const target=hasDetail?'/spare-parts/product/'+(item.slug||item._id):enquiryLink('part',item.name,activeCategory)
        const groupLabel=typeof item.categoryGroup==='object'?item.categoryGroup?.name:item.categoryGroup
        return <article key={item._id||item.name}><div><span>GENUINE</span><Link to={target}><img src={item.imageUrl||partProductVisuals[index%partProductVisuals.length]} alt={item.name} onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src=partProductVisuals[index%partProductVisuals.length]}}/></Link></div><small>{groupLabel||categoryName(item.category)}</small><h3>{item.name}</h3><strong>{money(item.price||0)}</strong><p>{categoryName(item.category)} &middot; Fitment check available</p><Link to={target}>View Product</Link></article>
      })}</div>:<div className='market-empty'>No products are available in this category yet. Send an enquiry and our parts team will help you.</div>}
    </section>

    <section className='market-wrap sp-section compact-section'>
      <SectionHeading title='Shop by Top Brands' copy='Tell us your preferred brand or ask for a compatible alternative.' action='Brand enquiry' to={enquiryLink('part','Preferred spare part brand',activeCategory)}/>
      <div className='sp-brand-row parts-brands'>{['BOSCH','MANN FILTER','EXIDE','brembo','DENSO','NGK','Valeo','LuK','Castrol','MRF'].map(brand=><span key={brand}>{brand}</span>)}</div>
    </section>

    <section className='market-wrap sp-section compact-section'>
      <div className='sp-benefit-row parts-benefits'>{[['shield','100% Genuine Parts'],['part','Best Price Guidance'],['calendar','Easy Returns Support'],['car','Fast Delivery Support'],['support','Expert Fitment Help']].map(([icon,label])=><article key={label}><span><PageIcon name={icon}/></span><h3>{label}</h3><p>Clear assistance from enquiry to delivery.</p></article>)}</div>
    </section>
  </main>
}
