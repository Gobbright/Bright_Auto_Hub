import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MarketplaceShell, VehicleCards } from './MarketplacePage.jsx'
import '../styles/pages/vehicle-category.css'
import { ui } from '../lib/uiClasses.js'
import { vehicleCategoryGroups } from '../lib/vehicleCategories.js'

const titleFromSlug=(slug='')=>slug.split('-').map(part=>part==='suv'?'SUV':part.charAt(0).toUpperCase()+part.slice(1)).join(' ')

export default function VehicleCategoryPage(){
  const {group,category}=useParams()
  const info=vehicleCategoryGroups[group]||vehicleCategoryGroups.cars
  const [vehicles,setVehicles]=useState([])
  const pageTitle=category?titleFromSlug(category):info.name
  const isEvPage=group==='ev-vehicles'||category==='electric-cars'||category?.startsWith('electric-')

  useEffect(()=>{
    let live=true
    const params=category?`group=${group}&category=${category}`:`group=${group}`
    api.get(`/public/vehicles?${params}`).then(items=>live&&setVehicles(items)).catch(()=>{})
    return()=>{live=false}
  },[group,category])

  useEffect(()=>{
    document.title=`${pageTitle} Vehicles | Bright Auto Hub`
    document.querySelector('meta[name=description]')?.setAttribute('content',category?`Explore ${pageTitle.toLowerCase()} specifications and send a direct vehicle enquiry.`:info.copy)
  },[category,info.copy,pageTitle])

  return <MarketplaceShell active='vehicles'>
    <main className={`vehicle-category-page ${ui.main} min-h-screen overflow-x-clip${isEvPage?' ev-category-page':''}`}>
      <nav className='market-wrap market-tabs category-route-tabs' aria-label={`${info.name} categories`}>
        <Link className={!category?'active':''} to={`/vehicles/${group}`}>All {info.name}</Link>
        {info.children.map(([name,slug])=><Link className={category===slug?'active':''} to={`/vehicles/${group}/${slug}`} key={slug}>{name}</Link>)}
      </nav>
      <section className='market-wrap vehicle-category-products'>
        <header className='vehicle-category-heading'>
          <small>VEHICLES · {info.name.toUpperCase()}</small>
          <h1>{category?`${pageTitle} Vehicles`:`All ${info.name}`}</h1>
          <p>{category?`Browse ${pageTitle.toLowerCase()} products, prices and specifications.`:info.copy} <strong>{vehicles.length} live listing{vehicles.length===1?'':'s'}.</strong></p>
        </header>
        {vehicles.length?<VehicleCards items={vehicles}/>:<div className='market-empty'>No published vehicles yet. Add a vehicle and assign “{pageTitle}” in Admin.</div>}
      </section>
    </main>
  </MarketplaceShell>
}
