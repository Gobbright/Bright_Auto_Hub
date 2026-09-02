import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MarketplaceShell } from './MarketplacePage.jsx'
import { Icon } from './Home.jsx'
import carsImage from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import brakeImage from '../assets/Images/service-spare-parts/genuine-brake-system-parts.jpg'
import oilImage from '../assets/Images/BLOG/car-engine-oil-change.png'
import tyreImage from '../assets/Images/Home/images/automobile-tyres-alloy-wheels-banner.png'
import '../styles/pages/search-page.css'

const allowedTypes=['vehicles','parts','services']
const filterKeys=['q','brand','model','price','fuel','vehicle','category','city']
const typeMeta={
  vehicles:{label:'New Vehicles',eyebrow:'FIND YOUR NEXT VEHICLE',title:'Search New Vehicles',copy:'Filter new vehicles by brand, model, budget and fuel type.'},
  parts:{label:'Spare Parts',eyebrow:'FIND THE RIGHT COMPONENT',title:'Search Spare Parts',copy:'Find genuine parts by vehicle, category, brand or keyword.'},
  services:{label:'Services',eyebrow:'TRUSTED VEHICLE CARE',title:'Search Vehicle Services',copy:'Choose the service you need for your vehicle and location.'},
}
const valueOf=(value)=>typeof value==='string'?value:value?.name||''
const searchable=(values)=>values.filter(Boolean).join(' ').toLowerCase()
const unique=(values)=>[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b))
const priceOnEnquiry='Price on enquiry'
const contactLink=(source,item)=>'/contact?'+new URLSearchParams({
  subject:source==='vehicle'?'Vehicle enquiry':source==='service'?'Service enquiry':'Spare parts enquiry',item,source,
  page:typeof window==='undefined'?'':window.location.pathname,
}).toString()
const matchesPrice=(value,range)=>{
  const price=Number(value||0)
  if(!range)return true
  if(range==='under-5')return price<500000
  if(range==='5-20')return price>=500000&&price<=2000000
  return price>2000000
}

function SelectFilter({label,name,value,onChange,options,allLabel}){
  return <label><span>{label}</span><select name={name} value={value} onChange={onChange}><option value=''>{allLabel}</option>{options.map(option=><option value={option} key={option}>{option}</option>)}</select></label>
}

export default function SearchPage(){
  const [params,setParams]=useSearchParams()
  const type=allowedTypes.includes(params.get('type'))?params.get('type'):'vehicles'
  const [data,setData]=useState({vehicles:[],parts:[],services:[],brands:[]})
  const [loading,setLoading]=useState(true)
  const [filters,setFilters]=useState(()=>Object.fromEntries(filterKeys.map(key=>[key,params.get(key)||''])))
  useEffect(()=>{setFilters(Object.fromEntries(filterKeys.map(key=>[key,params.get(key)||''])))},[params])

  useEffect(()=>{
    setFilters(Object.fromEntries(filterKeys.map(key=>[key,params.get(key)||''])))
  },[params])
  useEffect(()=>{
    let live=true
    api.get('/public/site/vehicles').then(result=>{if(live)setData(result)}).catch(()=>{}).finally(()=>{if(live)setLoading(false)})
    return()=>{live=false}
  },[])
  useEffect(()=>{
    const meta=typeMeta[type]
    document.title=`${meta.title} | Bright Auto Hub`
    document.querySelector('meta[name=description]')?.setAttribute('content',meta.copy)
  },[type])

  const sources=useMemo(()=>({
    vehicles:(data.vehicles||[]).filter(item=>item.condition!=='used'),
    parts:data.parts||[],
    services:data.services||[],
  }),[data])
  const brandOptions=useMemo(()=>unique([
    ...(data.brands||[]).map(item=>item.name),
    ...sources.vehicles.map(item=>valueOf(item.brand)),
    ...sources.parts.map(item=>valueOf(item.brand)),
  ]),[data.brands,sources])
  const modelOptions=useMemo(()=>unique(sources.vehicles.map(item=>item.model||valueOf(item.category))),[sources])
  const partCategories=useMemo(()=>unique(sources.parts.map(item=>valueOf(item.categoryId)||valueOf(item.category))),[sources])
  const serviceCategories=useMemo(()=>unique(sources.services.map(item=>valueOf(item.category))),[sources])
  const vehicleTypes=useMemo(()=>unique([
    ...sources.parts.map(item=>item.vehicleType),
    ...sources.services.map(item=>item.vehicleType),
  ]),[sources])
  const cities=useMemo(()=>unique(sources.services.map(item=>item.city)),[sources])

  const results=useMemo(()=>{
    const query=filters.q.trim().toLowerCase()
    return sources[type].filter(item=>{
      const category=valueOf(item.categoryId)||valueOf(item.category)
      const brand=valueOf(item.brand)
      const vehicle=item.vehicleType||item.vehicleCategory||''
      const haystack=searchable([item.name,item.description,brand,item.model,item.fuelType,category,vehicle,item.city])
      if(query&&!haystack.includes(query))return false
      if(type==='vehicles'){
        if(filters.brand&&brand!==filters.brand)return false
        if(filters.model&&!searchable([item.name,item.model,category]).includes(filters.model.toLowerCase()))return false
        if(filters.fuel&&String(item.fuelType||'').toLowerCase()!==filters.fuel.toLowerCase())return false
        if(!matchesPrice(item.price,filters.price))return false
      }
      if(type==='parts'){
        if(filters.vehicle&&vehicle!==filters.vehicle)return false
        if(filters.category&&category!==filters.category)return false
        if(filters.brand&&brand!==filters.brand)return false
      }
      if(type==='services'){
        if(filters.vehicle&&vehicle!==filters.vehicle)return false
        if(filters.category&&category!==filters.category)return false
        if(filters.city&&item.city&&item.city!==filters.city&&item.city!=='All India')return false
      }
      return true
    })
  },[filters,sources,type])

  const update=(event)=>setFilters(current=>({...current,[event.target.name]:event.target.value}))
  const submit=(event)=>{
    event.preventDefault()
    const next=new URLSearchParams({type})
    filterKeys.forEach(key=>{if(filters[key])next.set(key,filters[key])})
    setParams(next)
  }
  const changeType=(nextType)=>setParams({type:nextType})
  const clearFilters=()=>setParams({type})

  return <MarketplaceShell active={type==='vehicles'?'vehicles':type==='parts'?'spare-parts':'services'}>
    <main className='search-results-page'>
      <section className='search-hero'>
        <div className='market-wrap'>
          <p>{typeMeta[type].eyebrow}</p><h1>{typeMeta[type].title}</h1><span>{typeMeta[type].copy}</span>
          <div><b>✓ Live catalogue results</b><b>✓ Clear filters</b><b>✓ Direct enquiry support</b></div>
        </div>
      </section>
      <nav className='market-wrap search-type-tabs' aria-label='Search categories'>
        {allowedTypes.map(item=><button className={type===item?'active':''} type='button' onClick={()=>changeType(item)} key={item}><Icon name={item==='vehicles'?'car':item==='parts'?'parts':'tools'}/>{typeMeta[item].label}</button>)}
      </nav>
      <section className='market-wrap search-workspace'>
        <aside className='search-filter-panel'>
          <div><small>REFINE RESULTS</small><h2>Search filters</h2><p>Choose one or more filters to narrow the catalogue.</p></div>
          <form onSubmit={submit}>
            <label className='search-keyword'><span>Keyword</span><input name='q' value={filters.q} onChange={update} placeholder={type==='vehicles'?'Search vehicle name...':type==='parts'?'Search part name or number...':'Search service name...'}/></label>
            {type==='vehicles'&&<>
              <SelectFilter label='Brand' name='brand' value={filters.brand} onChange={update} options={brandOptions} allLabel='All Brands'/>
              <SelectFilter label='Model / Segment' name='model' value={filters.model} onChange={update} options={modelOptions} allLabel='All Models'/>
              <label className='search-special-select'><span>Budget</span><select name='price' value={filters.price} onChange={update}><option value=''>Any Price</option><option value='under-5'>Under ₹5 Lakh</option><option value='5-20'>₹5 – ₹20 Lakh</option><option value='above-20'>Above ₹20 Lakh</option></select></label>
              <SelectFilter label='Fuel Type' name='fuel' value={filters.fuel} onChange={update} options={['Petrol','Diesel','Electric','Hybrid','CNG']} allLabel='All Fuel Types'/>
            </>}
            {type==='parts'&&<>
              <SelectFilter label='Vehicle Type' name='vehicle' value={filters.vehicle} onChange={update} options={vehicleTypes} allLabel='All Vehicles'/>
              <SelectFilter label='Part Category' name='category' value={filters.category} onChange={update} options={partCategories} allLabel='All Categories'/>
              <SelectFilter label='Brand' name='brand' value={filters.brand} onChange={update} options={brandOptions} allLabel='All Brands'/>
            </>}
            {type==='services'&&<>
              <SelectFilter label='Vehicle Type' name='vehicle' value={filters.vehicle} onChange={update} options={vehicleTypes} allLabel='All Vehicles'/>
              <SelectFilter label='Service Type' name='category' value={filters.category} onChange={update} options={serviceCategories} allLabel='All Services'/>
              <SelectFilter label='City' name='city' value={filters.city} onChange={update} options={cities} allLabel='All Locations'/>
            </>}
            <button className='search-submit' type='submit'><Icon name='search'/> Apply Filters</button>
            <button className='search-clear' type='button' onClick={clearFilters}>Clear all filters</button>
          </form>
        </aside>
        <div className='search-results'>
          <header><div><small>{typeMeta[type].label.toUpperCase()}</small><h2>{loading?'Loading results...':`${results.length} result${results.length===1?'':'s'} found`}</h2></div><span>{filters.q?`Matching “${filters.q}”`:'Showing admin catalogue results'}</span></header>
          {!loading&&results.length===0&&<div className='search-empty'><span><Icon name='search'/></span><h3>No exact matches found</h3><p>Try removing one filter or search with a broader keyword.</p><button type='button' onClick={clearFilters}>View all {typeMeta[type].label}</button></div>}
          <div className={`search-card-grid search-${type}-grid`}>
            {results.map((item,index)=><SearchCard item={item} type={type} index={index} key={item._id||item.slug||item.name}/>)}
          </div>
        </div>
      </section>
    </main>
  </MarketplaceShell>
}

function SearchCard({item,type,index}){
  const category=valueOf(item.categoryId)||valueOf(item.category)||item.vehicleType||typeMeta[type].label
  const brand=valueOf(item.brand)
  const images=[carsImage,brakeImage,oilImage,tyreImage]
  const image=item.imageUrl||images[index%images.length]
  const path=type==='vehicles'
    ?`/vehicles/product/${item.slug||item._id}`
    :type==='parts'
      ?`/spare-parts/product/${item.slug||item._id}`
      :`/services/product/${item.slug||item._id}`
  return <article className='search-result-card'>
    {type!=='services'?<Link className='search-result-media' to={path}><span>{type==='vehicles'?'VERIFIED':'GENUINE'}</span><img src={image} alt={item.name}/></Link>:<div className='search-service-icon'><Icon name='tools'/><small>TRUSTED SERVICE</small></div>}
    <div className='search-result-copy'>
      <small>{[brand,category].filter(Boolean).join(' · ')}</small>
      <h3><Link to={path}>{item.name}</Link></h3>
      <p>{type==='vehicles'?[item.modelYear||new Date().getFullYear(),item.fuelType||'Multiple options',item.model||category].join(' · '):item.description||(type==='parts'?'Fitment verification and expert support available.':'Professional care from trained service partners.')}</p>
      <div><strong>{priceOnEnquiry}</strong><Link to={contactLink(type==='vehicles'?'vehicle':type==='parts'?'part':'service',item.name)}>Enquire Now <Icon name='arrow'/></Link></div>
    </div>
  </article>
}
