import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MarketplaceShell, VehicleCards } from './MarketplacePage.jsx'
import './vehicle-category.css'

const groups={
  bikes:{name:'Bikes',copy:'Bikes, scooters and electric two-wheelers for every rider.',children:[['Bikes','bikes'],['Scooters','scooters'],['Electric Bikes','electric-bikes'],['Electric Scooters','electric-scooters']]},
  cars:{name:'Cars',copy:'Hatchbacks, sedans, SUVs, luxury and electric cars.',children:[['Hatchback','hatchback'],['Sedan','sedan'],['SUV','suv'],['MUV / MPV','muv-mpv'],['Luxury Cars','luxury-cars'],['Electric Cars','electric-cars']]},
  'commercial-vehicles':{name:'Commercial Vehicles',copy:'Trucks, pickups, buses, vans and three-wheelers.',children:[['Trucks','trucks'],['Mini Trucks','mini-trucks'],['Pickup Vehicles','pickup-vehicles'],['Buses','buses'],['Vans','vans'],['Tempo Travellers','tempo-travellers'],['3 Wheelers','3-wheelers']]},
  'farm-vehicles':{name:'Farm Vehicles',copy:'Tractors and farm equipment built for productive work.',children:[['Tractors','tractors'],['Mini Tractors','mini-tractors'],['Farm Equipment','farm-equipment']]},
  'construction-vehicles':{name:'Construction Vehicles',copy:'Heavy machines for construction and infrastructure.',children:[['JCB','jcb'],['Excavators','excavators'],['Backhoe Loaders','backhoe-loaders'],['Wheel Loaders','wheel-loaders'],['Cranes','cranes'],['Construction Equipment','construction-equipment']]},
  'ev-vehicles':{name:'EV Vehicles',copy:'Clean electric mobility across every major segment.',children:[['Electric Bikes','electric-bikes'],['Electric Scooters','electric-scooters'],['Electric Cars','electric-cars'],['Electric 3 Wheelers','electric-3-wheelers'],['Electric Trucks','electric-trucks'],['Electric Buses','electric-buses'],['Electric Vans','electric-vans']]},
}

const titleFromSlug=(slug='')=>slug.split('-').map(part=>part==='suv'?'SUV':part.charAt(0).toUpperCase()+part.slice(1)).join(' ')

export default function VehicleCategoryPage(){
  const {group,category}=useParams()
  const info=groups[group]||groups.cars
  const [vehicles,setVehicles]=useState([])
  const pageTitle=category?titleFromSlug(category):info.name

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
    <main className='vehicle-category-page'>
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
