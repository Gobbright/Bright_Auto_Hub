import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import '../style.css'
import PublicFooter from '../components/PublicFooter.jsx'
import bannerOne from '../assets/Images/Home/Banners/banner-1.png'
import bannerTwo from '../assets/Images/Home/Banners/banner-2.png'
import bannerThree from '../assets/Images/Home/Banners/banner-3.png'
import twoWheelers from '../assets/Images/Home/Banners/2 Wheelers.png'
import fourWheelers from '../assets/Images/Home/Banners/4 Wheelers.png'
import commercialVehicles from '../assets/Images/Home/Banners/Commercial Vehicles.png'
import farmVehicles from '../assets/Images/Home/Banners/Farm Vehicles.png'
import constructionVehicles from '../assets/Images/Home/Banners/Construction Vehicles.png'
import evVehicles from '../assets/Images/Home/Banners/EV Vehicles.png'
import brightAutoHubLogo from '../assets/Images/Home/Banners/Logo/Logo-1.png'
import twoWheelerIcon from '../assets/Images/Icons/bycicle.png'
import fourWheelerIcon from '../assets/Images/Icons/sedan.png'
import commercialVehicleIcon from '../assets/Images/Icons/truck (2).png'
import farmVehicleIcon from '../assets/Images/Icons/tractor.png'
import constructionVehicleIcon from '../assets/Images/Icons/excavator (1).png'
import evVehicleIcon from '../assets/Images/Icons/charging-station (1).png'
import serviceIcon from '../assets/Images/Icons/service.png'
import sparePartIcon from '../assets/Images/Icons/part.png'
import bikesCategory from '../assets/Images/Home/Vehicle Category/2_Wheelers.png'
import carsCategory from '../assets/Images/Home/Vehicle Category/4_Wheelers.png'
import commercialCategory from '../assets/Images/Home/Vehicle Category/Commercial_Vehicles.png'
import farmCategory from '../assets/Images/Home/Vehicle Category/Farm_Vehicles.png'
import constructionCategory from '../assets/Images/Home/Vehicle Category/Construction_Vehicles.png'
import evCategory from '../assets/Images/Home/Vehicle Category/EV_Vehicles.png'
import carSparePartsServiceBanner from '../assets/Images/Home/images/car-spare-parts-service-banner.png'
import commercialTrucksFleetBanner from '../assets/Images/Home/images/commercial-trucks-fleet-banner.png'
import familyCarsRainyRoadBanner from '../assets/Images/Home/images/family-cars-rainy-road-banner.png'
import electricSuvRainDrivingBanner from '../assets/Images/Home/images/electric-suv-rain-driving-banner.png'
import electricSuvCarsRoadBanner from '../assets/Images/Home/images/electric-suv-cars-road-banner.png'
import tataNexonEvWhite from '../assets/Images/Home/images/tata-nexon-ev-white.png'
import evCarsBanner from '../assets/Images/Home/images/Ev-cars-img.png'
import tataNexonGreySuv from '../assets/Images/Home/images/tata-nexon-grey-suv.png'
import hyundaiCretaBlackSuv from '../assets/Images/Home/images/hyundai-creta-black-suv.png'
import kiaSeltosWhiteSuv from '../assets/Images/Home/images/kia-seltos-white-suv.png'
import mahindraXuv700BlueSuv from '../assets/Images/Home/images/mahindra-xuv700-blue-suv.png'
import mgAstorWhiteSuv from '../assets/Images/Home/images/mg-astor-white-suv.png'
import automobileTyresAlloyWheelsBanner from '../assets/Images/Home/images/automobile-tyres-alloy-wheels-banner.png'
import commercialVehicleOverview from '../assets/Images/Vehicles/Commercial_Vehicles.png'
import electricVehicleOverview from '../assets/Images/Vehicles/EV_Vehicles.png'
import futureMobilitySportsCar from '../assets/Images/BLOG/future-mobility-white-sports-car-banner.png'
import commercialLogisticsFleet from '../assets/Images/BLOG/commercial-trucks-logistics-fleet.png'
import electricCarChargingStation from '../assets/Images/BLOG/electric-car-charging-station.png'
import tataSafariGreySuv from '../assets/Images/BLOG/tata-safari-grey-suv.png'
import motorcyclesLineup from '../assets/Images/BLOG/motorcycles-lineup-scenic-road.png'
import touringMotorcycles from '../assets/Images/blog details/touring-motorcycles-mountain-road.png'
import homeServiceWorkshop from '../assets/Images/Home/img-2/ChatGPT Image Aug 24, 2026, 11_31_25 AM.png'
import homePartsCareBanner from '../assets/Images/Home/img-2/ChatGPT Image Aug 24, 2026, 11_32_10 AM.png'
import marutiSuzukiLogo from '../assets/Images/Home/Brand Logos/maruti-suzuki.svg'
import hyundaiLogo from '../assets/Images/Home/Brand Logos/hyundai.svg'
import tataLogo from '../assets/Images/Home/Brand Logos/tata.svg'
import mahindraLogo from '../assets/Images/Home/Brand Logos/mahindra.svg'
import toyotaLogo from '../assets/Images/Home/Brand Logos/toyota.svg'
import hondaLogo from '../assets/Images/Home/Brand Logos/honda.svg'
import kiaLogo from '../assets/Images/Home/Brand Logos/kia.svg'
import bajajLogo from '../assets/Images/Home/Brand Logos/bajaj.svg'
import heroLogo from '../assets/Images/Home/Brand Logos/hero.svg'
import tvsLogo from '../assets/Images/Home/Brand Logos/tvs.svg'
import ashokLeylandLogo from '../assets/Images/Home/Brand Logos/ashok-leyland.svg'
import mgLogo from '../assets/Images/Home/Brand Logos/mg.svg'
import skodaLogo from '../assets/Images/Home/Brand Logos/skoda.svg'
import volkswagenLogo from '../assets/Images/Home/Brand Logos/volkswagen.svg'

const exploreVehicleCategories = [
  {name:'Bikes',model:'Sport Bikes & Scooters',copy:'Agile rides for city streets and open roads.',image:bikesCategory,to:'/vehicles/bikes',icon:'motorcycle'},
  {name:'Cars',model:'Cars & SUVs',copy:'Comfort, safety and style for every journey.',image:carsCategory,to:'/vehicles/cars',icon:'car'},
  {name:'Commercial Vehicles',model:'Trucks & Carriers',copy:'Dependable mobility that moves every business.',image:commercialCategory,to:'/vehicles/commercial-vehicles',icon:'truck'},
  {name:'Farm Vehicles',model:'Tractors & Equipment',copy:'Reliable machines built for productive farms.',image:farmCategory,to:'/vehicles/farm-vehicles',icon:'tractor'},
  {name:'Electric Vehicles',model:'Smart Electric Mobility',copy:'Cleaner, connected vehicles for tomorrow.',image:evCategory,to:'/vehicles/ev-vehicles',icon:'evcar'},
]

const brandDirectory = [
  {name:'Maruti Suzuki',mark:'MS',logo:marutiSuzukiLogo},
  {name:'Hyundai',mark:'H',logo:hyundaiLogo},
  {name:'Tata',mark:'T',logo:tataLogo},
  {name:'Mahindra',mark:'M',logo:mahindraLogo},
  {name:'Toyota',mark:'T',logo:toyotaLogo},
  {name:'Honda',mark:'H',logo:hondaLogo},
  {name:'Kia',mark:'KIA',logo:kiaLogo},
  {name:'Bajaj',mark:'B',logo:bajajLogo},
  {name:'Hero',mark:'H',logo:heroLogo},
  {name:'TVS',mark:'TVS',logo:tvsLogo},
  {name:'Ashok Leyland',mark:'AL',logo:ashokLeylandLogo},
  {name:'MG',mark:'MG',logo:mgLogo},
  {name:'Skoda',mark:'S',logo:skodaLogo},
  {name:'Volkswagen',mark:'VW',logo:volkswagenLogo},
]
const brands = brandDirectory.map(({name})=>name)
const homeEnquiryLink=(subject,item,source,category='')=>`/contact?${new URLSearchParams({subject,item,source,category,page:typeof window==='undefined'?'':window.location.pathname}).toString()}`

const fallbackConstructionProducts = [
  {name:'JCB 3DX',category:'Backhoe Loader',detail:'Versatile digging, trenching and loading performance for Indian worksites.',image:'/images/construction-vehicles/jcb-3dx.png',slug:'jcb'},
  {name:'Tata Hitachi EX200LC',category:'Hydraulic Excavator',detail:'Tracked earthmoving capability for excavation and infrastructure projects.',image:'/images/construction-vehicles/tata-hitachi-ex200lc.png',slug:'excavators'},
  {name:'Caterpillar 950 GC',category:'Wheel Loader',detail:'High-capacity material handling with dependable job-site productivity.',image:'/images/construction-vehicles/caterpillar-950-gc.png',slug:'wheel-loaders'},
  {name:'Liebherr LTM 1130-5.1',category:'Mobile Crane',detail:'Five-axle mobile lifting performance for demanding project requirements.',image:'/images/construction-vehicles/liebherr-ltm-1130-5-1.png',slug:'cranes'},
]

const constructionToneFor=(item={})=>{
  const identity=[item.color,item.brand?.name,item.name,item.category?.name,item.category].filter(Boolean).join(' ').toLowerCase()
  if(/komatsu|blue/.test(identity))return 'blue'
  if(/tata hitachi|sany|zoomlion|liebherr|tadano|schwing|mahindra|bull|red/.test(identity))return 'red'
  if(/hyundai|orange/.test(identity))return 'orange'
  if(/jcb|caterpillar|\bcat\b|case|ace|hamm|wirtgen|volvo|yellow/.test(identity))return 'yellow'
  return 'industrial'
}

// Slider sequence: Banner 1, Banner 2, Banner 3, followed by every segment banner.
const slides = [
  [bannerOne,'India’s complete automobile platform','Find Every Vehicle Solution in One Trusted Place','Compare new vehicles, discover genuine spare parts and connect with trusted service support across India.','Explore All Vehicles','Bright Auto Hub vehicle, spare parts and service platform in India','/vehicles'],
  [bannerTwo,'Smarter vehicle research starts here','Compare Vehicles with Clarity and Confidence','Research cars and bikes by price, specifications, features and ownership needs before choosing the right vehicle for your journey.','Compare Vehicles','Compare new cars, bikes and vehicle specifications on Bright Auto Hub','/compare'],
  [bannerThree,'Everything you need beyond the showroom','Make Vehicle Ownership Simple from Day One','Discover the right vehicle, find genuine spare parts and access expert service support through one dependable automobile platform.','Start Your Journey','Complete vehicle discovery, spare parts and service support in India','/search'],
  [twoWheelers,'Bikes and scooters in India','Find the Right Two-Wheeler for Every Ride','Compare commuter bikes, performance motorcycles, scooters and electric two-wheelers by price, mileage and features.','Explore Bikes & Scooters','New bikes, scooters and electric two-wheelers available in India','/vehicles/bikes'],
  [fourWheelers,'New cars and SUVs in India','Discover Cars Made for Indian Roads','Explore hatchbacks, sedans, SUVs, MPVs and premium cars with the space, safety and performance your family needs.','Explore New Cars','New hatchbacks, sedans, SUVs and family cars in India','/vehicles/cars'],
  [commercialVehicles,'Commercial mobility for growing businesses','Move Your Business Forward with the Right Vehicle','Discover trucks, mini trucks, pickups, buses and vans by payload, application, performance and ownership needs.','Explore Commercial Vehicles','Commercial trucks, pickups, buses and vans for Indian businesses','/vehicles/commercial-vehicles'],
  [farmVehicles,'Tractors and farm equipment','Power Productive Farming with Dependable Machines','Explore tractors and agricultural equipment engineered for reliable field performance, efficiency and everyday farm work.','Explore Farm Vehicles','Tractors and agricultural equipment for farming in India','/vehicles/farm-vehicles'],
  [constructionVehicles,'Construction equipment for demanding projects','Build Bigger with Powerful Machinery','Find backhoe loaders, excavators, wheel loaders and cranes built for productive infrastructure and construction work.','Explore Construction Vehicles','Construction vehicles and heavy equipment for projects in India','/vehicles/construction-vehicles'],
  [evVehicles,'Electric vehicles and clean mobility','Drive Smarter into an Electric Future','Compare electric cars, bikes, scooters and commercial EVs by driving range, charging time, price and key features.','Explore Electric Vehicles','Electric cars, bikes, scooters and commercial vehicles in India','/vehicles/ev-vehicles'],
]
const trendingVehicles = [
  {name:'Sport Bikes & Scooters',category:'Two Wheelers',price:'\u20B979,999',image:bikesCategory,rating:'4.8',group:'bikes',copy:'City-ready motorcycles and scooters for every daily ride.'},
  {name:'Premium Cars & SUVs',category:'Four Wheelers',price:'\u20B97.49L',image:carsCategory,rating:'4.7',group:'cars',copy:'Comfortable hatchbacks, sedans and SUVs for every journey.'},
  {name:'Commercial Truck Range',category:'Commercial Vehicles',price:'\u20B99.50L',image:commercialCategory,rating:'4.6',group:'commercial-vehicles',copy:'Reliable trucks and carriers built to move every business.'},
  {name:'Farm Tractor Series',category:'Farm Vehicles',price:'\u20B95.80L',image:farmCategory,rating:'4.8',group:'farm-vehicles',copy:'Dependable tractors and equipment made for productive farms.'},
  {name:'Heavy Construction Fleet',category:'Construction Vehicles',price:'\u20B918.00L',image:constructionCategory,rating:'4.7',group:'construction-vehicles',copy:'Powerful excavators and machines for demanding worksites.'},
  {name:'Electric Mobility Range',category:'Electric Vehicles',price:'\u20B91.20L',image:evCategory,rating:'4.9',group:'ev-vehicles',copy:'Cleaner electric mobility with smart everyday performance.'},
]
const fallbackCarProducts=[
  {name:'Tata Nexon',category:'Compact SUV',price:'Check Price',priceLabel:'Latest price & offers',image:tataNexonGreySuv,rating:'4.8',copy:'Compact SUV with confident performance and smart features',to:'/vehicles/cars'},
  {name:'Hyundai Creta',category:'Mid-size SUV',price:'Check Price',priceLabel:'Latest price & offers',image:hyundaiCretaBlackSuv,rating:'4.8',copy:'Comfortable family SUV with premium connected features',to:'/vehicles/cars'},
  {name:'Kia Seltos',category:'Premium SUV',price:'Check Price',priceLabel:'Latest price & offers',image:kiaSeltosWhiteSuv,rating:'4.7',copy:'Stylish SUV with refined comfort and everyday versatility',to:'/vehicles/cars'},
  {name:'Mahindra XUV700',category:'Seven-seat SUV',price:'Check Price',priceLabel:'Latest price & offers',image:mahindraXuv700BlueSuv,rating:'4.9',copy:'Spacious SUV designed for confident family journeys',to:'/vehicles/cars'},
  {name:'MG Astor',category:'Connected SUV',price:'Check Price',priceLabel:'Latest price & offers',image:mgAstorWhiteSuv,rating:'4.7',copy:'Feature-rich SUV with modern design and connected technology',to:'/vehicles/cars'},
  {name:'Tata Safari',category:'Full-size SUV',price:'Check Price',priceLabel:'Latest price & offers',image:tataSafariGreySuv,rating:'4.8',copy:'Premium three-row SUV built for comfortable road trips',to:'/vehicles/cars'},
]
const carCategorySlugs=new Set(['cars','car','hatchback','sedan','suv','muv','mpv','muv-mpv','luxury-cars','electric-cars'])
const slugValue=(value)=>String(value||'').trim().toLowerCase().replace(/\s+/g,'-')
const isCarVehicle=(item)=>{
  const groupSlug=slugValue(typeof item.group==='string'?item.group:item.group?.slug)
  const categorySlug=slugValue(item.category?.slug||item.category?.name||item.category)
  const parentSlug=slugValue(item.category?.parentId?.slug||item.category?.parent?.slug)
  const vehicleType=slugValue(item.vehicleType)
  const identity=[groupSlug,categorySlug,parentSlug,vehicleType].join(' ')
  return groupSlug==='cars'||parentSlug==='cars'||carCategorySlugs.has(categorySlug)||carCategorySlugs.has(vehicleType)||/(^|[- ])(car|cars|hatchback|sedan|suv|muv|mpv)([- ]|$)/.test(identity)
}
const carProductName=(item)=>{
  const brand=String(typeof item.brand==='string'?item.brand:item.brand?.name||'').trim()
  const model=String(item.name||item.model||'Car').trim()
  return brand&&!model.toLowerCase().includes(brand.toLowerCase())?`${brand} ${model}`:model
}
const toTransparentCarImage=(imageUrl='')=>{
  if(!imageUrl.startsWith('/images/catalog/vehicles/cars/'))return imageUrl
  return imageUrl
    .replace('/images/catalog/vehicles/cars/','/images/catalog/vehicles/cars-transparent/')
    .replace(/\.jpe?g$/i,'.png')
}
const fallbackBikeProducts=[
  {name:'City Scooter 125',category:'Scooter',price:'₹79,999',image:bikesCategory,rating:'4.8',copy:'125 cc · Petrol · Comfortable city mobility',to:'/vehicles/bikes/scooters'},
  {name:'Street Motorcycle Line-up',category:'Street Bikes',price:'₹1.10L',image:motorcyclesLineup,rating:'4.7',copy:'150–200 cc · Petrol · Everyday performance',to:'/vehicles/bikes/bikes',visual:'lifestyle'},
  {name:'Touring Motorcycle Range',category:'Touring Bikes',price:'₹1.50L',image:touringMotorcycles,rating:'4.8',copy:'Comfort-focused motorcycles for longer rides',to:'/vehicles/bikes/bikes',visual:'lifestyle'},
  {name:'Daily Commuter Scooter',category:'Commuter Scooter',price:'₹75,000',image:bikesCategory,rating:'4.6',copy:'Fuel efficient · Easy handling · Daily comfort',to:'/vehicles/bikes/scooters'},
  {name:'Performance Bike Line-up',category:'Sport Bikes',price:'₹1.35L',image:motorcyclesLineup,rating:'4.7',copy:'Responsive engines · Sporty road performance',to:'/vehicles/bikes/bikes',visual:'lifestyle'},
  {name:'Adventure Touring Range',category:'Adventure Bikes',price:'₹1.85L',image:touringMotorcycles,rating:'4.9',copy:'Tour-ready motorcycles for every open road',to:'/vehicles/bikes/bikes',visual:'lifestyle'},
]
const fallbackCommercialProducts=[
  {name:'City Mini Truck Range',category:'Mini Trucks',price:'₹6.50L',image:commercialCategory,rating:'4.7',copy:'Compact cargo vehicles for reliable city deliveries',to:'/vehicles/commercial-vehicles/mini-trucks'},
  {name:'Heavy Duty Truck Range',category:'Heavy Trucks',price:'₹18.00L',image:commercialVehicleOverview,rating:'4.8',copy:'High-capacity trucks built for demanding transport',to:'/vehicles/commercial-vehicles/trucks'},
  {name:'Logistics Truck Fleet',category:'Logistics Fleet',price:'₹14.50L',image:commercialLogisticsFleet,rating:'4.8',copy:'Efficient fleet solutions for regional logistics',to:'/vehicles/commercial-vehicles/trucks',visual:'lifestyle'},
  {name:'Pickup & Cargo Range',category:'Pickup Vehicles',price:'₹9.25L',image:commercialCategory,rating:'4.6',copy:'Versatile cargo mobility for growing businesses',to:'/vehicles/commercial-vehicles/pickup-vehicles'},
  {name:'Business Transport Fleet',category:'Fleet Vehicles',price:'₹12.80L',image:commercialTrucksFleetBanner,rating:'4.7',copy:'Dependable transport options for every enterprise',to:'/vehicles/commercial-vehicles',visual:'lifestyle'},
  {name:'Commercial Vehicle Line-up',category:'Business Mobility',price:'₹8.75L',image:commercialVehicleOverview,rating:'4.9',copy:'Explore trucks, carriers, vans and business vehicles',to:'/vehicles/commercial-vehicles'},
]
const fallbackElectricCarProducts=[
  {name:'Tata Nexon EV',category:'Electric SUV',price:'\u20B914.49L',image:tataNexonEvWhite,rating:'4.9',copy:'Smart electric SUV with confident everyday range',to:'/vehicles/ev-vehicles/electric-cars'},
  {name:'Electric SUV Range',category:'Electric SUV',price:'\u20B912.99L',image:electricSuvCarsRoadBanner,rating:'4.8',copy:'Spacious zero-emission SUVs for modern families',to:'/vehicles/ev-vehicles/electric-cars',visual:'lifestyle'},
  {name:'Long Range Electric Cars',category:'Long Range EV',price:'\u20B915.50L',image:electricCarChargingStation,rating:'4.8',copy:'Road-ready electric cars with convenient charging',to:'/vehicles/ev-vehicles/electric-cars',visual:'lifestyle'},
  {name:'City Electric Car Range',category:'City EV',price:'\u20B98.69L',image:evCategory,rating:'4.7',copy:'Compact, efficient electric mobility for city drives',to:'/vehicles/ev-vehicles/electric-cars'},
  {name:'Premium Electric Mobility',category:'Premium EV',price:'\u20B918.90L',image:electricSuvRainDrivingBanner,rating:'4.8',copy:'Refined electric performance with connected features',to:'/vehicles/ev-vehicles/electric-cars',visual:'lifestyle'},
  {name:'Family Electric SUV Line-up',category:'Family EV',price:'\u20B913.75L',image:electricVehicleOverview,rating:'4.9',copy:'Comfortable electric cars made for every journey',to:'/vehicles/ev-vehicles/electric-cars'},
]
const vehicles=trendingVehicles.map(({name,category,price,image,rating})=>[name,category,price,image,rating])
const megaMenus = {
  Vehicles:[
    ['Bikes','Bikes','Scooters','Electric Bikes','Electric Scooters'],
    ['Cars','Hatchback','Sedan','SUV','MUV / MPV','Luxury Cars','Electric Cars'],
    ['Electric Vehicles','Electric Bikes','Electric Scooters','Electric Cars','Electric 3 Wheelers','Electric Buses'],
    ['Commercial Vehicles','Trucks','Mini Trucks','Pickup Vehicles','Buses','Vans','3 Wheelers'],
    ['Farm & Construction','Tractors','Farm Equipment','JCB','Excavators','Cranes'],
  ],
  'Spare Parts':[
    ['By Vehicle','Two Wheeler Parts','Car Parts','Commercial Vehicle Parts','Truck Parts','Tractor Parts'],
    ['Popular Parts','Engine Parts','Brake Parts','Suspension Parts','Clutch Parts','Electrical Parts'],
    ['Essentials','Filters','Belts','Batteries','Tyres','Lubricants','Accessories'],
  ],
  Services:[
    ['Vehicle Service','Bike Service','Car Service','Truck Service','Tractor Service','JCB Service'],
    ['Repairs','Engine Repair','Brake Service','Clutch Service','Suspension Service','AC Service'],
    ['Maintenance','Battery Service','Wheel Alignment','Oil Change','Periodic Maintenance','Breakdown Assistance'],
  ],
  'Finance & Insurance':[
    ['Vehicle Finance','Vehicle Loan','Car Loan','Bike Loan','Commercial Vehicle Loan','Tractor Loan'],
    ['Insurance','Vehicle Insurance','Insurance Renewal'],
  ],
  More:[
    ['Finance','Vehicle Loan','Car Loan','Bike Loan','Vehicle Insurance'],
    ['Buy & Sell','Pre-Owned Vehicles','Sell Vehicle','Exchange','Get Exchange Value'],
    ['Find Near You','Vehicle Dealers','Spare Part Dealers','Service Centers'],
    ['Company','About Us','Advertise With Us','FAQ','Privacy Policy','Terms & Conditions'],
  ],
}
const vehicleMenuRoutes = {
  Bikes:'/vehicles/bikes/bikes',Scooters:'/vehicles/bikes/scooters','Electric Bikes':'/vehicles/bikes/electric-bikes','Electric Scooters':'/vehicles/bikes/electric-scooters',
  Hatchback:'/vehicles/cars/hatchback',Sedan:'/vehicles/cars/sedan',SUV:'/vehicles/cars/suv','MUV / MPV':'/vehicles/cars/muv-mpv','Luxury Cars':'/vehicles/cars/luxury-cars','Electric Cars':'/vehicles/ev-vehicles/electric-cars',
  'Electric 3 Wheelers':'/vehicles/ev-vehicles/electric-3-wheelers','Electric Buses':'/vehicles/ev-vehicles/electric-buses',
  Trucks:'/vehicles/commercial-vehicles/trucks','Mini Trucks':'/vehicles/commercial-vehicles/mini-trucks','Pickup Vehicles':'/vehicles/commercial-vehicles/pickup-vehicles',Buses:'/vehicles/commercial-vehicles/buses',Vans:'/vehicles/commercial-vehicles/vans','3 Wheelers':'/vehicles/commercial-vehicles/3-wheelers',
  Tractors:'/vehicles/farm-vehicles/tractors','Farm Equipment':'/vehicles/farm-vehicles/farm-equipment',JCB:'/vehicles/construction-vehicles/jcb',Excavators:'/vehicles/construction-vehicles/excavators',Cranes:'/vehicles/construction-vehicles/cranes',
}
const financeMenuRoutes = {
  'Vehicle Loan':'/finance-insurance/vehicle-loan','Car Loan':'/finance-insurance/car-loan','Bike Loan':'/finance-insurance/bike-loan',
  'Commercial Vehicle Loan':'/finance-insurance/commercial-vehicle-loan','Tractor Loan':'/finance-insurance/tractor-loan',
  'Vehicle Insurance':'/finance-insurance/vehicle-insurance','Insurance Renewal':'/finance-insurance/insurance-renewal',
}
export function Icon({name}) {
  const icons={
    search:<><circle cx='11' cy='11' r='7'/><path d='m20 20-4-4'/></>,
    mic:<><rect x='9' y='3' width='6' height='11' rx='3'/><path d='M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8'/></>,
    phone:<path d='M7 3 4 6c1 7 7 13 14 14l3-3-5-4-2 2c-3-1-5-3-6-6l2-2-4-4Z'/>,
    location:<><path d='M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z'/><circle cx='12' cy='10' r='2.5'/></>,
    car:<><path d='m4 13 2-6h12l2 6v6h-3v-2H7v2H4Z'/><path d='M2 13h20'/></>,
    tools:<><path d='m14 7 3-3a4 4 0 0 1-5 5L5 16l3 3 7-7a4 4 0 0 1 5-5l-3 3'/><path d='m4 4 5 5'/></>,
    parts:<><circle cx='12' cy='12' r='7'/><circle cx='12' cy='12' r='2'/><path d='M12 2v3M12 19v3M2 12h3M19 12h3'/></>,
    bolt:<path d='m13 2-8 12h6l-1 8 8-12h-6Z'/>,
    arrow:<><path d='M5 12h14M14 7l5 5-5 5'/></>,
    menu:<path d='M3 6h18M3 12h18M3 18h18'/>,
    close:<path d='m5 5 14 14M19 5 5 19'/>,
    shield:<><path d='M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z'/><path d='m9 12 2 2 4-5'/></>,
    tag:<><path d='M20 13 13 20 4 11V4h7l9 9Z'/><circle cx='8.5' cy='8.5' r='1.25'/><path d='m12 15 3-3'/></>,
    calendar:<><rect x='3' y='5' width='18' height='16' rx='3'/><path d='M7 3v4M17 3v4M3 10h18m-13 5 2 2 5-5'/></>,
    calculator:<><rect x='4' y='2.5' width='16' height='19' rx='2.5'/><path d='M7.5 6h9v3h-9zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01'/></>,
    motorcycle:<><circle cx='5.5' cy='17.5' r='3.5'/><circle cx='18.5' cy='17.5' r='3.5'/><path d='m5.5 17.5 4-7h4l5 7M9.5 10.5l3 7M8 14h7.5l-2-5H17M16 6h3M17.5 6l1 3M10 10.5 8 8H5.5'/><path d='M3.5 12.5 6 10h3'/></>,
    truck:<><path d='M3 7h11v10H3Z'/><path d='M14 11h4l3 3v3h-7Z'/><circle cx='7' cy='18' r='2'/><circle cx='18' cy='18' r='2'/><path d='M5 10h7'/></>,
    tractor:<><circle cx='7' cy='17' r='4'/><circle cx='18' cy='18' r='2.5'/><path d='M7 13h7l2 3M11 13V8h4l2 5M10 9H7M15 8V5h2'/></>,
    excavator:<><path d='M4 18h13M6 16h9l-1-5H8Z'/><path d='M10 11V7h4l2 4M15 8l3-4 3 2-4 8'/><circle cx='7' cy='19' r='1'/><circle cx='14' cy='19' r='1'/></>,
    evcar:<><path d='m4 14 2-6h12l2 6v5h-3v-2H7v2H4Z'/><path d='M2 14h20M13 9l-3 4h3l-2 3'/></>,
    usedcar:<><path d='m4 14 2-6h12l2 6v5h-3v-2H7v2H4Z'/><path d='M2 14h20'/><path d='M17 5a4 4 0 0 0-6-1M11 4v3H8'/></>,
    user:<><circle cx='12' cy='8' r='4'/><path d='M4 21a8 8 0 0 1 16 0'/></>,
    enquiry:<><path d='M4 5h16v12H8l-4 4Z'/><path d='M8 9h8M8 13h5'/></>,
    target:<><circle cx='12' cy='12' r='8'/><circle cx='12' cy='12' r='3'/><path d='M12 2V0M22 12h2M12 22v2M2 12H0'/></>,
    logout:<><path d='M10 5H5v14h5M14 8l4 4-4 4M18 12H9'/></>,
  }
  return <svg className='icon' viewBox='0 0 24 24'>{icons[name]||icons.arrow}</svg>
}

const storedJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

function LocationPicker() {
  const fallback = { label: 'All India', shortLabel: 'All India', type: 'all' }
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState(() => storedJson('selectedLocation', fallback))
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pickerRef = useRef(null)

  useEffect(() => {
    const close = (event) => { if (pickerRef.current && !pickerRef.current.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const save = (next) => {
    localStorage.setItem('selectedLocation', JSON.stringify(next))
    setLocation(next)
    setLoading(false)
    setResults([])
    window.dispatchEvent(new CustomEvent('location-change', { detail: next }))
    setOpen(false)
  }
  const search = async (event) => {
    event.preventDefault()
    if (query.trim().length < 2) { setError('Type at least 2 characters.'); return }
    setLoading(true); setError(''); setResults([])
    try { const data = await api.get('/public/locations/search?q=' + encodeURIComponent(query.trim())); setResults(data.results || []); if (!data.results?.length) setError('No matching location found.') }
    catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }
  const useLiveLocation = () => {
    if (!navigator.geolocation) { setError('Live location is not supported in this browser.'); return }
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try { const data = await api.get(`/public/locations/reverse?lat=${coords.latitude}&lon=${coords.longitude}`); save({ ...data.location, type: 'live' }) }
      catch (requestError) { setError(requestError.message); setLoading(false) }
    }, (geoError) => { setError(geoError.code === 1 ? 'Location permission was not allowed.' : 'Unable to detect your live location.'); setLoading(false) }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 })
  }

  return <div className='location-picker' ref={pickerRef}>
    <button className='utility-location-button' type='button' onClick={() => setOpen(!open)} aria-expanded={open}><Icon name='location'/><span>{location.shortLabel || location.label}</span><b aria-hidden='true'>⌄</b></button>
    {open && <div className='location-popover'>
      <div className='location-popover-heading'><strong>Choose your location</strong><small>Search anywhere in the world</small></div>
      <button className='live-location-button' type='button' onClick={useLiveLocation} disabled={loading}><Icon name='target'/>{loading ? 'Finding location...' : 'Use my live location'}</button>
      <form onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='City, state or country' aria-label='Search worldwide location'/><button type='submit' aria-label='Search location'><Icon name='search'/></button></form>
      <button className='all-india-location' type='button' onClick={() => save(fallback)}><Icon name='location'/><span><strong>All India</strong><small>Browse every available listing</small></span></button>
      {error && <p className='location-error' role='status'>{error}</p>}
      {results.length > 0 && <div className='location-results'>{results.map((item) => <button type='button' onClick={() => save({ ...item, type: 'search' })} key={item.id}><Icon name='location'/><span><strong>{item.shortLabel}</strong><small>{item.label}</small></span></button>)}</div>}
      <a className='location-attribution' href='https://www.openstreetmap.org/copyright' target='_blank' rel='noreferrer'>© OpenStreetMap contributors</a>
    </div>}
  </div>
}

function AccountMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(() => storedJson('publicUserProfile', null))
  const menuRef = useRef(null)
  useEffect(() => {
    const sync = () => setUser(storedJson('publicUserProfile', null))
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false) }
    window.addEventListener('public-user-change', sync)
    window.addEventListener('storage', sync)
    document.addEventListener('pointerdown', close)
    return () => { window.removeEventListener('public-user-change', sync); window.removeEventListener('storage', sync); document.removeEventListener('pointerdown', close) }
  }, [])
  const logout = () => { localStorage.removeItem('publicUserProfile'); setUser(null); setOpen(false); window.dispatchEvent(new CustomEvent('public-user-change')) }
  return <div className='account-menu' ref={menuRef}>
    <button className='account-menu-button' type='button' onClick={() => setOpen(!open)} aria-expanded={open}><Icon name='user'/><span>{user ? user.name.split(' ')[0] : 'Account'}</span><b aria-hidden='true'>⌄</b></button>
    {open && <div className='account-popover'>{user ? <><div><strong>{user.name}</strong><small>{user.email}</small></div><button type='button' onClick={logout}><Icon name='logout'/> Logout</button></> : <><Link to='/login' onClick={() => setOpen(false)}><Icon name='user'/> Login</Link><Link to='/register' onClick={() => setOpen(false)}><Icon name='enquiry'/> Register</Link></>}</div>}
  </div>
}

function HeaderSearch({onNavigate, mobile=false}) {
  const [query,setQuery]=useState('')
  const [listening,setListening]=useState(false)
  const [voiceStatus,setVoiceStatus]=useState('')
  const recognitionRef=useRef(null)
  const navigate=useNavigate()
  useEffect(()=>()=>recognitionRef.current?.abort(),[])
  const submit=(event)=>{
    event.preventDefault()
    const value=query.trim()
    navigate(value?`/search?q=${encodeURIComponent(value)}`:'/search')
    onNavigate?.()
  }
  const startVoice=()=>{
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SpeechRecognition){setVoiceStatus('Voice search is not supported in this browser.');return}
    recognitionRef.current?.abort()
    const recognition=new SpeechRecognition()
    recognitionRef.current=recognition
    recognition.lang='en-IN'
    recognition.interimResults=false
    recognition.maxAlternatives=1
    recognition.onstart=()=>{setListening(true);setVoiceStatus('Listening...')}
    recognition.onresult=(event)=>{const value=event.results[0][0].transcript;setQuery(value);setVoiceStatus(`Heard: ${value}`);navigate(`/search?q=${encodeURIComponent(value)}`);onNavigate?.()}
    recognition.onerror=()=>setVoiceStatus('Could not hear you. Please try again.')
    recognition.onend=()=>setListening(false)
    recognition.start()
  }
  return <form className={`header-search-form${mobile?' mobile-header-search':''}`} role='search' onSubmit={submit}>
    <button className='header-search-submit' type='submit' aria-label='Search'><Icon name='search'/></button>
    <input type='search' value={query} onChange={(event)=>{setQuery(event.target.value);setVoiceStatus('')}} placeholder='Search vehicles, parts...' aria-label='Search vehicles, spare parts and services'/>
    <button className={`voice-search-button${listening?' is-listening':''}`} type='button' onClick={startVoice} aria-label={listening?'Listening for voice search':'Start voice search'} title={voiceStatus||'Voice search'}><Icon name='mic'/></button>
    {voiceStatus&&<span className='search-voice-status' role='status'>{voiceStatus}</span>}
  </form>
}

export function Header() {
  const [mobileOpen,setMobileOpen]=useState(false)
  const [openMenu,setOpenMenu]=useState('')
  const [partMenu,setPartMenu]=useState([])
  const { pathname }=useLocation()
  useEffect(()=>{let live=true;api.get('/public/part-categories').then((groups)=>{if(live&&groups.length)setPartMenu(groups.map((group)=>[group.name,...(group.children||[]).map((item)=>item.name)]))}).catch(()=>{});return()=>{live=false}},[])
  useEffect(()=>{setMobileOpen(false);setOpenMenu('')},[pathname])
  useEffect(()=>{
    if(!mobileOpen)return undefined
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=(event)=>{if(event.key==='Escape'){setMobileOpen(false);setOpenMenu('')}}
    if(window.matchMedia('(max-width: 820px)').matches)document.body.style.overflow='hidden'
    document.addEventListener('keydown',closeOnEscape)
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',closeOnEscape)}
  },[mobileOpen])
  const toggleMobile=()=>setMobileOpen((current)=>{if(current)setOpenMenu('');return !current})
  const closeMobile=()=>{setMobileOpen(false);setOpenMenu('')}
  const nav=['Home','Vehicles','Spare Parts','Services','Finance & Insurance','Blog']
  const routes={Home:'/',Vehicles:'/vehicles','Spare Parts':'/spare-parts',Services:'/services','Finance & Insurance':'/finance-insurance',Blog:'/blog'}
  const vehicleNav=[
    [twoWheelerIcon,'Bikes','/vehicles/bikes'],
    [fourWheelerIcon,'Cars','/vehicles/cars'],
    [commercialVehicleIcon,'Commercial Vehicles','/vehicles/commercial-vehicles'],
    [farmVehicleIcon,'Farm Vehicles','/vehicles/farm-vehicles'],
    [constructionVehicleIcon,'Construction Vehicles','/vehicles/construction-vehicles'],
    [evVehicleIcon,'EV Vehicles','/vehicles/ev-vehicles'],
    ...(pathname==='/'?[[serviceIcon,'Services','/services'],[sparePartIcon,'Spare Parts','/spare-parts'],[null,'EMI Calculator','/calculators','calculator']]:[]),
  ]
  return <>
    <div className='utility-bar'>
      <div className='site-container utility-inner'>
        <span>India&apos;s Most Trusted Automobile Platform</span>
        <div className='utility-actions'>
          <LocationPicker/>
          <a href='tel:+919876543210'><Icon name='phone'/> +91 98765 43210</a>
          <AccountMenu/>
        </div>
      </div>
    </div>
    <header className='site-header'><div className='site-container header-inner'>
      <Link className='auto-logo' to='/' aria-label='Bright Auto Hub home'><img src={brightAutoHubLogo} alt='Bright Auto Hub'/></Link>
      <button className='mobile-toggle' type='button' aria-label={mobileOpen?'Close navigation':'Open navigation'} aria-controls='primary-navigation' aria-expanded={mobileOpen} onClick={toggleMobile}><Icon name={mobileOpen?'close':'menu'}/></button>
      {mobileOpen&&<button className='mobile-nav-scrim' type='button' aria-label='Close navigation' onClick={closeMobile}/>}
      <nav className={`main-nav ${mobileOpen?'is-open':''}`} id='primary-navigation' aria-label='Primary navigation'>{nav.map((item)=>{
        const menu=item==='Spare Parts'&&partMenu.length?partMenu:megaMenus[item]
        const href=routes[item]
        const isActive=href==='/'?pathname===href:pathname.startsWith(href)
        return <div className={`nav-entry${menu?' has-menu':''}${openMenu===item?' is-expanded':''}`} key={item} onMouseEnter={()=>menu&&setOpenMenu(item)} onMouseLeave={()=>menu&&setOpenMenu('')}>
          <div className='nav-entry-main'>
            <Link className={isActive?'active':''} to={href} onClick={closeMobile}>{item}</Link>
            {menu&&<button className='nav-dropdown-toggle' type='button' aria-label={`${openMenu===item?'Close':'Open'} ${item} menu`} aria-expanded={openMenu===item} onClick={()=>setOpenMenu(openMenu===item?'':item)}><span aria-hidden='true'>⌄</span></button>}
          </div>
          {menu&&openMenu===item&&<div className={`mega-menu ${item==='Spare Parts'?'spare-parts-menu':''} ${item==='Finance & Insurance'?'finance-menu':''}`}>
            <div className='mega-menu-intro'><span>{item} directory</span><strong>Explore every option in one place</strong></div>
            {menu.map(([heading,...links])=><div className='mega-menu-column' key={heading}><h3>{heading}</h3>{links.map((link)=><Link to={item==='Vehicles'?(vehicleMenuRoutes[link]||href):item==='Finance & Insurance'?(financeMenuRoutes[link]||href):href} onClick={closeMobile} key={link}>{link}</Link>)}</div>)}
          </div>}
        </div>
      })}<Link className={pathname.startsWith('/contact')?'active':''} to='/contact' onClick={closeMobile}>Contact Us</Link><div className='mobile-nav-actions'>
        <HeaderSearch mobile onNavigate={closeMobile}/>
        <Link className='mobile-enquiry-button' to={homeEnquiryLink('General enquiry','Automotive requirement','header')} onClick={closeMobile}><Icon name='enquiry'/> Enquire Now</Link>
        <div className='mobile-nav-utility'>
          <a className='mobile-phone-link' href='tel:+919876543210'><Icon name='phone'/><span>+91 98765 43210</span></a>
          <LocationPicker/>
          <AccountMenu/>
        </div>
      </div></nav>
      <div className='header-actions'><HeaderSearch/><Link className='red-button compact' to={homeEnquiryLink('General enquiry','Automotive requirement','header')}><Icon name='enquiry'/> Enquire Now</Link></div>
    </div></header>
    <nav className='vehicle-nav' aria-label='Vehicle categories'>
      <div className={`site-container vehicle-nav-inner ${pathname==='/'?'home-nav':''}`}>
        {vehicleNav.map(([icon,label,url,fallbackIcon])=>{
          const isActive=pathname===url||pathname.startsWith(url+'/')
          return <Link className={`${isActive?'active':''}${label==='EV Vehicles'?' ev-nav-item':''}`.trim()} to={url} key={label}>
            {icon?<img src={icon} alt='' aria-hidden='true'/>:<Icon name={fallbackIcon}/>}<span>{label}</span>
          </Link>
        })}
      </div>
    </nav>
  </>
}
function HeroSlider({ page }) {
  const [active,setActive]=useState(0)
  const [paused,setPaused]=useState(false)
  const homeSlides=page?[[(page.heroImage||bannerOne),(page.eyebrow||slides[0][1]),page.title,(page.description||slides[0][3]),(page.ctaLabel||slides[0][4]),page.title,(page.ctaUrl||page.ctaLink||slides[0][6])],...slides.slice(1)]:slides
  useEffect(()=>{if(paused)return;const timer=setInterval(()=>setActive((value)=>(value+1)%homeSlides.length),5000);return()=>clearInterval(timer)},[paused,homeSlides.length])
  const move=(step)=>setActive((value)=>(value+step+homeSlides.length)%homeSlides.length)
  return <section className='hero' aria-label='Featured automobile categories' aria-roledescription='carousel' onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)}>
    {homeSlides.map(([image,kicker,title,copy,cta,alt,to],index)=><article className={`hero-slide ${index===active?'active':''}`} aria-hidden={index!==active} aria-label={`${index+1} of ${homeSlides.length}: ${title}`} key={`${image}-${index}`}>
      <img className='hero-banner-image' src={image} alt={alt} loading={index===0?'eager':'lazy'} fetchPriority={index===0?'high':'auto'} decoding='async'/>
      <div className='hero-overlay'>
        <span className='hero-slide-count' aria-hidden='true'>{String(index+1).padStart(2,'0')} / {String(homeSlides.length).padStart(2,'0')}</span>
        <p className='red-kicker'>{kicker}</p>
        {index===0?<h1>{title}</h1>:<h2>{title}</h2>}
        <p className='hero-description'>{copy}</p>
        <div className='hero-actions'><Link className='red-button' to={to} aria-label={`${cta}: ${title}`}>{cta}</Link><Link className='hero-secondary-button' to={homeEnquiryLink('Service enquiry','Vehicle service requirement','service')}>Enquire for Service</Link></div>
      </div>
    </article>)}
    <button className='slide-arrow prev' type='button' onClick={()=>move(-1)} aria-label='Show previous banner'>&lsaquo;</button>
    <button className='slide-arrow next' type='button' onClick={()=>move(1)} aria-label='Show next banner'>&rsaquo;</button>
    <div className='slide-dots' aria-label='Choose a featured banner'>{homeSlides.map(([image,,title],index)=><button className={index===active?'active':''} type='button' aria-label={`Show banner ${index+1}: ${title}`} aria-current={index===active?'true':undefined} onClick={()=>setActive(index)} key={`${image}-${index}`}/>)}</div>
  </section>
}
function Finder() {
  const tabs=['New Vehicle','Spare Parts','Service']
  const [tab,setTab]=useState(tabs[0])
  const [filters,setFilters]=useState({})
  const navigate=useNavigate()
  const searchTypes={'New Vehicle':'vehicles','Spare Parts':'parts',Service:'services'}
  const fields={
    'New Vehicle':[
      {name:'brand',label:'Select Brand',placeholder:'All Brands',options:brands.slice(0,10)},
      {name:'model',label:'Select Model',placeholder:'All Models',options:['SUV','Sedan','Hatchback','Bike','Truck','Tractor','Excavator','Electric Car']},
      {name:'price',label:'Price Range',placeholder:'Any Price',options:[['under-5','Under ₹5 Lakh'],['5-20','₹5 – ₹20 Lakh'],['above-20','Above ₹20 Lakh']]},
      {name:'fuel',label:'Fuel Type',placeholder:'All Fuel Types',options:['Petrol','Diesel','Electric','Hybrid','CNG']},
    ],
    'Spare Parts':[
      {name:'vehicle',label:'Vehicle Type',placeholder:'All Vehicles',options:['Bikes','Cars','Commercial Vehicles','Farm Vehicles','Construction Vehicles','Electric Vehicles']},
      {name:'category',label:'Part Category',placeholder:'All Categories',options:['Engine Parts','Brake Parts','Filters','Batteries','Tyres','Lubricants','Accessories']},
      {name:'brand',label:'Part Brand',placeholder:'All Brands',options:['Bosch','Brembo','Castrol','MRF','Exide','Denso']},
      {name:'q',label:'Part Name',placeholder:'Enter part name...',type:'input'},
    ],
    Service:[
      {name:'vehicle',label:'Vehicle Type',placeholder:'All Vehicles',options:['Bikes','Cars','Commercial Vehicles','Farm Vehicles','Construction Vehicles','Electric Vehicles']},
      {name:'category',label:'Service Type',placeholder:'All Services',options:['General Service','Periodic Maintenance','Oil Change','Brake Service','AC Service','Engine Repair']},
      {name:'city',label:'City',placeholder:'All Locations',options:['All India','Chennai','Bengaluru','New Delhi','Mumbai']},
      {name:'brand',label:'Vehicle Brand',placeholder:'All Brands',options:brands.slice(0,10)},
    ],
  }
  const switchTab=(item)=>{setTab(item);setFilters({})}
  const submit=(event)=>{
    event.preventDefault()
    const params=new URLSearchParams({type:searchTypes[tab]})
    Object.entries(filters).forEach(([key,value])=>{if(value)params.set(key,value)})
    navigate('/search?'+params.toString())
  }
  return <section className='finder site-container' id='vehicles'>
    <div className='finder-tabs'>{tabs.map((item)=><button className={tab===item?'active':''} type='button' onClick={()=>switchTab(item)} key={item}>{item}</button>)}</div>
    <form className='finder-form' onSubmit={submit}>
      {fields[tab].map((field)=><label key={field.name}><span>{field.label}</span>{field.type==='input'
        ?<input name={field.name} value={filters[field.name]||''} onChange={(event)=>setFilters({...filters,[field.name]:event.target.value})} placeholder={field.placeholder}/>
        :<select name={field.name} value={filters[field.name]||''} onChange={(event)=>setFilters({...filters,[field.name]:event.target.value})}><option value=''>{field.placeholder}</option>{field.options.map((option)=>{const [value,label]=Array.isArray(option)?option:[option,option];return <option value={value} key={value}>{label}</option>})}</select>}</label>)}
      <button className='red-button finder-button' type='submit'><Icon name='search'/> Search</button>
    </form>
  </section>
}
function SectionHeading({eyebrow,title,link='View All',to='#vehicles',onPrevious,onNext}) {
  const hasControls=onPrevious&&onNext
  return <div className='public-section-heading'>
    <div>{eyebrow&&<p>{eyebrow}</p>}<h2>{title}</h2></div>
    <div className='public-section-heading-actions'>
      <Link to={to}>{link} <Icon name='arrow'/></Link>
      {hasControls&&<div className='product-heading-controls' aria-label={`${title} carousel controls`}>
        <button className='product-heading-control previous' type='button' aria-label={`Show previous ${title}`} onClick={onPrevious}><Icon name='arrow'/></button>
        <button className='product-heading-control next' type='button' aria-label={`Show more ${title}`} onClick={onNext}><Icon name='arrow'/></button>
      </div>}
    </div>
  </div>
}
function HomeVehicleCard({item,group,cardClassName='',imageClassName='',cta='Explore',to}) {
  const cardGroup=group||item.group
  const route=to||item.to||`/vehicles/${cardGroup}`
  return <article className={`trending-vehicle-card ${cardClassName} ${item.visual==='lifestyle'?'is-lifestyle':''}`.trim()} data-category={cardGroup}>
    <Link className={`trending-vehicle-image ${imageClassName}`.trim()} to={route} aria-label={`View ${item.name}`}>
      <span className='vehicle-category-pill'>{item.category}</span>
      <img src={item.image} alt={`${item.name} product`} loading='lazy'/>
    </Link>
    <div className='trending-vehicle-body'>
      <div className='trending-vehicle-heading'><div><p>{item.category}</p><h3>{item.name}</h3></div><span className='trending-rating'>★ {item.rating}</span></div>
      <p className='trending-vehicle-copy'>{item.copy}</p>
      <div className='trending-vehicle-footer'>
        <div><small>{item.priceLabel||'Starting from'}</small><strong>{item.price}</strong></div>
        <Link to={route}>{cta} <Icon name='arrow'/></Link>
      </div>
    </div>
  </article>
}
function BrandLogoCard({name,mark,logoUrl,isClone=false}) {
  const [logoFailed,setLogoFailed]=useState(false)
  return <a href='#vehicles' className='brand-logo-card' aria-label={isClone?undefined:`Explore ${name} vehicles`} tabIndex={isClone?-1:0}>
    {logoUrl&&!logoFailed?<img src={logoUrl} alt={`${name} vehicle brand logo`} loading='eager' decoding='async' onError={()=>setLogoFailed(true)}/>:<span className='brand-monogram' aria-hidden='true'>{mark}</span>}
    <strong>{name}</strong>
  </a>
}
function Home() {
  const [homeData,setHomeData]=useState({page:null,featuredBrands:[],featuredVehicles:[],featuredServices:[],featuredParts:[],latestBlogs:[]})
  const [allCarVehicles,setAllCarVehicles]=useState([])
  const [allConstructionVehicles,setAllConstructionVehicles]=useState([])
  const [exploreActive,setExploreActive]=useState(1)
  const [explorePaused,setExplorePaused]=useState(false)
  const exploreTrackRef=useRef(null)
  const carProductTrackRef=useRef(null)
  const trendingTrackRef=useRef(null)
  const commercialTrackRef=useRef(null)
  const constructionTrackRef=useRef(null)
  const electricTrackRef=useRef(null)
  const bikeTrackRef=useRef(null)
  useEffect(()=>{document.title='Bright Auto Hub | Vehicles, Parts and Service';document.querySelector('meta[name="description"]')?.setAttribute('content','Explore vehicles and send direct enquiries for vehicle services and genuine spare parts at Bright Auto Hub.')},[])
  useEffect(()=>{
    document.title=homeData.page?.seoTitle||'Bright Auto Hub | Cars, Bikes, EVs, Parts & Service'
    document.querySelector('meta[name=description]')?.setAttribute('content',homeData.page?.seoDescription||'Compare cars, bikes, electric and commercial vehicles in India. Explore genuine spare parts, trusted vehicle services and direct enquiries at Bright Auto Hub.')
  },[homeData.page])
  useEffect(()=>{let live=true;api.get('/home').then(data=>live&&setHomeData(data)).catch(()=>{});return()=>{live=false}},[])
  useEffect(()=>{let live=true;api.get('/public/vehicles?group=cars').then(data=>{if(live&&Array.isArray(data))setAllCarVehicles(data)}).catch(()=>{});return()=>{live=false}},[])
  useEffect(()=>{let live=true;api.get('/public/vehicles?group=construction-vehicles').then(data=>{if(live&&Array.isArray(data))setAllConstructionVehicles(data)}).catch(()=>{});return()=>{live=false}},[])
  useEffect(()=>{
    if(explorePaused)return undefined
    const timer=window.setInterval(()=>setExploreActive((current)=>(current+1)%exploreVehicleCategories.length),4200)
    return()=>window.clearInterval(timer)
  },[explorePaused])
  useEffect(()=>{
    const track=exploreTrackRef.current
    const activeCard=track?.children[exploreActive]
    if(!track||!activeCard)return
    const target=Math.max(0,activeCard.offsetLeft-(track.clientWidth-activeCard.clientWidth)/2)
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({left:target,behavior:reducedMotion?'auto':'smooth'})
  },[exploreActive])
  const changeExploreSlide=(direction)=>setExploreActive((current)=>(current+direction+exploreVehicleCategories.length)%exploreVehicleCategories.length)
  const scrollProductTrack=(trackRef,direction)=>{
    const track=trackRef.current
    if(!track)return
    const card=track.firstElementChild
    const gap=Number.parseFloat(window.getComputedStyle(track).columnGap)||16
    const distance=(card?.getBoundingClientRect().width||track.clientWidth*.8)+gap
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({left:direction*distance,behavior:reducedMotion?'auto':'smooth'})
  }
  const homeVehicles=homeData.featuredVehicles.length?homeData.featuredVehicles.map(item=>[item.name,item.category?.name||item.vehicleType,`₹${Number(item.price||0).toLocaleString('en-IN')}`,item.imageUrl||carsCategory,'New']):vehicles
  const eligibleCarVehicles=allCarVehicles.filter((item)=>item.condition!=='used'&&isCarVehicle(item))
  const uniqueCarVehicles=eligibleCarVehicles.filter((item,index,items)=>items.findIndex((candidate)=>carProductName(candidate).toLowerCase()===carProductName(item).toLowerCase())===index)
  const carImageByName=new Map(eligibleCarVehicles.filter((item)=>item.imageUrl).map((item)=>[carProductName(item).toLowerCase(),item.imageUrl]))
  const liveCarCards=uniqueCarVehicles.map((item)=>({
    id:item._id||item.slug||item.name,
    name:carProductName(item),
    category:item.category?.name||item.model||item.vehicleType||'Car',
    price:Number(item.price||0)>0?`₹${Number(item.price).toLocaleString('en-IN')}`:'Enquire Price',
    priceLabel:Number(item.price||0)>0?'Starting from':'Latest price & offers',
    image:toTransparentCarImage(item.imageUrl||carImageByName.get(carProductName(item).toLowerCase()))||carsCategory,
    rating:item.rating||'4.8',
    copy:[item.brand?.name,item.fuelType,item.transmission,item.modelYear].filter(Boolean).join(' · ')||'Verified car listing with expert purchase support.',
    to:'/vehicles/product/'+(item.slug||item._id),
  }))
  const availableCarFallbacks=fallbackCarProducts.filter((fallback)=>!liveCarCards.some((item)=>item.name.toLowerCase()===fallback.name.toLowerCase()))
  const carProducts=liveCarCards.length>=6?liveCarCards:[...liveCarCards,...availableCarFallbacks.slice(0,6-liveCarCards.length)]
  const uniqueConstructionVehicles=allConstructionVehicles.filter((item,index,items)=>item.condition!=='used'&&items.findIndex((candidate)=>candidate.condition!=='used'&&candidate.name.trim().toLowerCase()===item.name.trim().toLowerCase())===index)
  const liveConstructionCards=uniqueConstructionVehicles.map((item)=>({
    id:item._id||item.slug||item.name,
    name:item.name,
    category:item.category?.name||item.vehicleType||'Construction Vehicle',
    price:Number(item.price||0)>0?`₹${Number(item.price).toLocaleString('en-IN')}`:'Enquire Price',
    priceLabel:Number(item.price||0)>0?'Starting from':'Price & availability',
    image:item.imageUrl||constructionCategory,
    rating:item.rating||'4.8',
    copy:item.description||[item.brand?.name,item.fuelType,item.modelYear].filter(Boolean).join(' · ')||'Worksite-ready construction equipment with expert enquiry support.',
    to:'/vehicles/product/'+(item.slug||item._id),
    tone:constructionToneFor(item),
  }))
  const constructionProducts=liveConstructionCards.length?liveConstructionCards:fallbackConstructionProducts.map((item)=>({
    ...item,
    id:item.name,
    price:'Enquire Price',
    priceLabel:'Price & availability',
    copy:item.detail,
    to:`/vehicles/construction-vehicles/${item.slug}`,
    tone:constructionToneFor(item),
  }))
  const liveBikeProducts=homeData.featuredVehicles.filter((item)=>[item.group,item.vehicleType,item.category?.slug,item.category?.parentId?.slug,item.category?.name].filter(Boolean).some((value)=>/(bike|scooter|two.?wheeler)/i.test(String(value))))
  const liveBikeCards=liveBikeProducts.slice(0,6).map((item)=>({
    name:item.name,
    category:item.category?.name||item.vehicleType||'Bike',
    price:`₹${Number(item.price||0).toLocaleString('en-IN')}`,
    image:item.imageUrl||bikesCategory,
    rating:item.rating||'4.7',
    copy:[item.engineCapacity,item.fuelType,item.modelYear].filter(Boolean).join(' · ')||'Verified two-wheeler listing with expert enquiry support.',
    to:'/vehicles/product/'+(item.slug||item._id),
  }))
  const bikeProducts=[...liveBikeCards,...fallbackBikeProducts.filter((fallback)=>!liveBikeCards.some((item)=>item.name===fallback.name))].slice(0,6)
  const liveCommercialProducts=homeData.featuredVehicles.filter((item)=>[item.group,item.vehicleType,item.category?.slug,item.category?.parentId?.slug,item.category?.name].filter(Boolean).some((value)=>/(commercial|truck|pickup|cargo|bus|van|carrier)/i.test(String(value))))
  const liveCommercialCards=liveCommercialProducts.slice(0,6).map((item)=>({
    name:item.name,
    category:item.category?.name||item.vehicleType||'Commercial Vehicle',
    price:`₹${Number(item.price||0).toLocaleString('en-IN')}`,
    image:item.imageUrl||commercialCategory,
    rating:item.rating||'4.7',
    copy:[item.payloadCapacity,item.fuelType,item.modelYear].filter(Boolean).join(' · ')||'Verified commercial vehicle with expert business support.',
    to:'/vehicles/product/'+(item.slug||item._id),
  }))
  const commercialProducts=[...liveCommercialCards,...fallbackCommercialProducts.filter((fallback)=>!liveCommercialCards.some((item)=>item.name===fallback.name))].slice(0,6)
  const liveElectricCarProducts=homeData.featuredVehicles.filter((item)=>{
    const vehicleDetails=[item.group,item.vehicleType,item.fuelType,item.category?.slug,item.category?.parentId?.slug,item.category?.name].filter(Boolean).join(' ')
    return /(electric|\bev\b)/i.test(vehicleDetails)&&/(car|suv|sedan|hatchback|four.?wheeler)/i.test(vehicleDetails)
  })
  const liveElectricCarCards=liveElectricCarProducts.slice(0,6).map((item)=>({
    name:item.name,
    category:item.category?.name||item.vehicleType||'Electric Car',
    price:`\u20B9${Number(item.price||0).toLocaleString('en-IN')}`,
    image:item.imageUrl||tataNexonEvWhite,
    rating:item.rating||'4.8',
    copy:[item.drivingRange,item.batteryCapacity,item.modelYear].filter(Boolean).join(' · ')||'Verified electric car with expert purchase support.',
    to:'/vehicles/product/'+(item.slug||item._id),
  }))
  const electricCarProducts=[...liveElectricCarCards,...fallbackElectricCarProducts.filter((fallback)=>!liveElectricCarCards.some((item)=>item.name===fallback.name))].slice(0,6)
  const homeBrands=brandDirectory.map(item=>({...item,logoUrl:item.logo}))
  const quick=[
    ['car','Vehicle marketplace','Explore Vehicles','Discover vehicles across every segment.','Explore Now','/vehicles','vehicles'],
    ['tools','Expert vehicle care','Enquire Service','Connect with a trusted workshop service.','Enquire Now',homeEnquiryLink('Service enquiry','Vehicle service requirement','service'),'service'],
    ['parts','Genuine components','Find Spare Parts','Find the right genuine spare parts.','Enquire Parts','/spare-parts','parts'],
  ]
  const homeBlogs=homeData.latestBlogs.length?homeData.latestBlogs.map((item,index)=>[item.title,item.tags?.[0]||'Automotive',item.imageUrl||[familyCarsRainyRoadBanner,electricSuvRainDrivingBanner,carSparePartsServiceBanner,automobileTyresAlloyWheelsBanner][index%4],item.slug]):[
    ['Top 10 Fuel Efficient Cars in India','Buying Guide',familyCarsRainyRoadBanner,''],
    ['EV vs Petrol: Which Is Right for You?','EV Guide',electricSuvRainDrivingBanner,''],
    ['Essential Car Service and Spare Parts','Maintenance',carSparePartsServiceBanner,''],
    ['How to Choose the Right Tyres','Spare Parts',automobileTyresAlloyWheelsBanner,''],
  ]
  return <div className='public-home' id='top'><Header/><main><HeroSlider page={homeData.page}/><Finder/>
    <section
      className='content-section site-container explore-vehicle-slider'
      id='explore-vehicles'
      aria-labelledby='explore-vehicle-title'
      aria-roledescription='carousel'
      onMouseEnter={()=>setExplorePaused(true)}
      onMouseLeave={()=>setExplorePaused(false)}
      onFocusCapture={()=>setExplorePaused(true)}
      onBlurCapture={()=>setExplorePaused(false)}
    >
      <div className='explore-vehicle-stage'>
        <div className='explore-vehicle-intro'>
          <p className='explore-slide-number'>/ 02</p>
          <h2 id='explore-vehicle-title'>Explore <span>Vehicles</span></h2>
          <i className='explore-title-line' aria-hidden='true'/>
          <p className='explore-vehicle-copy'>From city streets to demanding work sites, find the perfect vehicle for every journey.</p>
          <Link className='explore-all-button' to='/vehicles'>Explore All <span><Icon name='arrow'/></span></Link>
        </div>
        <div className='explore-carousel-shell'>
          <div className='explore-category-track' ref={exploreTrackRef}>
            {exploreVehicleCategories.map((item,index)=>
              <article className={`explore-category-card ${index===exploreActive?'is-active':''}`} aria-current={index===exploreActive?'true':undefined} key={item.name}>
                <Link to={item.to} aria-label={`Explore ${item.name}`}>
                  <div className='explore-category-heading'><span><Icon name={item.icon}/></span><h3>{item.name}</h3><i/></div>
                  <div className='explore-category-image'><span aria-hidden='true'/><img src={item.image} alt={item.model} loading='lazy'/></div>
                  <div className='explore-card-footer'>
                    <div><p>{item.model}</p><small>{item.copy}</small></div>
                    <span className='explore-card-arrow'><Icon name='arrow'/></span>
                  </div>
                </Link>
              </article>
            )}
          </div>
          <button className='explore-control previous' type='button' aria-label='Previous vehicle category' onClick={()=>changeExploreSlide(-1)}><Icon name='arrow'/></button>
          <button className='explore-control next' type='button' aria-label='Next vehicle category' onClick={()=>changeExploreSlide(1)}><Icon name='arrow'/></button>
          <div className='explore-category-dots' aria-label='Choose vehicle category'>
            {exploreVehicleCategories.map((item,index)=><button className={index===exploreActive?'active':''} type='button' aria-label={`Show ${item.name}`} aria-pressed={index===exploreActive} onClick={()=>setExploreActive(index)} key={item.name}/>)}
          </div>
        </div>
      </div>
      <div className='explore-car-product-block' id='explore-car-products'>
        <SectionHeading eyebrow='Popular cars for every kind of journey' title='Explore All Cars' link='View All Cars' to='/vehicles/cars' onPrevious={()=>scrollProductTrack(carProductTrackRef,-1)} onNext={()=>scrollProductTrack(carProductTrackRef,1)}/>
        <div className='explore-car-product-shell'>
          <div className='trending-vehicle-grid explore-car-product-grid home-product-scroll-track' ref={carProductTrackRef}>
            {carProducts.map((item,index)=><HomeVehicleCard item={item} group='cars' cardClassName='explore-car-product-card' imageClassName='explore-car-product-image' key={item.id||`${item.name}-${index}`}/>)}
          </div>
        </div>
      </div>
    </section>
    <section className='journey-banner'>
      <div className='site-container journey-inner'>
        <img
          src={futureMobilitySportsCar}
          alt='White sports car driving through a futuristic road tunnel'
          decoding='async'
        />
        <div className='journey-copy'>
          <p className='journey-eyebrow'>One hub for every road</p>
          <h2>Every Journey.<br/>Every Vehicle. <span>One Platform.</span></h2>
          <p className='journey-description'>From everyday city rides to powerful business fleets, discover every vehicle solution in one trusted place.</p>
          <Link className='journey-cta' to='/vehicles'>Explore Every Vehicle <Icon name='arrow'/></Link>
        </div>
        <div className='journey-stat' aria-label='Six vehicle categories available'>
          <div className='journey-stat-icons' aria-hidden='true'>
            {[twoWheelerIcon,fourWheelerIcon,commercialVehicleIcon,farmVehicleIcon,constructionVehicleIcon,evVehicleIcon].map((icon,index)=><span key={icon}><img src={icon} alt=''/><i>{index+1}</i></span>)}
          </div>
          <div className='journey-stat-copy'><strong>6</strong><span>Vehicle<br/>categories</span></div>
        </div>
      </div>
    </section>
    <section className='content-section site-container trending-section' id='trending-vehicles'>
      <SectionHeading eyebrow='Most searched this week' title='Trending Vehicles' link='View All Vehicles' onPrevious={()=>scrollProductTrack(trendingTrackRef,-1)} onNext={()=>scrollProductTrack(trendingTrackRef,1)}/>
      <div className='vehicle-grid trending-vehicle-grid home-product-scroll-track' ref={trendingTrackRef}>{trendingVehicles.map((item)=>
        <HomeVehicleCard item={item} cta='Explore' cardClassName='vehicle-card' imageClassName='vehicle-image' key={item.name}/>
      )}</div>
    </section>
    <section className='home-service-showcase site-container' aria-labelledby='home-service-showcase-title'>
      <div className='service-confidence-bar'>
        <div className='service-confidence-intro'>
          <p className='service-confidence-eyebrow'>Why Choose</p>
          <h2 id='home-service-showcase-title'>Bright <span>Auto Hub?</span></h2>
          <p className='service-confidence-copy'>Bright Auto Hub brings vehicle discovery, expert guidance, genuine spare parts and dependable service support together in one trusted automotive platform.</p>
          <div className='service-confidence-actions'>
            <Link to='/vehicles'>Explore Vehicles <Icon name='arrow'/></Link>
            <Link to={homeEnquiryLink('Vehicle assistance','Help me choose the right vehicle or service','why-choose')}>Talk to an Expert</Link>
          </div>
        </div>
        <div className='service-confidence-story'>
          <small>ONE PLATFORM. EVERY JOURNEY.</small>
          <h3>Make every automotive decision with greater confidence.</h3>
          <p>Compare the right vehicle, connect with trusted specialists and continue with reliable after-sales care — without moving between multiple platforms.</p>
          <Link to={homeEnquiryLink('About Bright Auto Hub','Learn more about Bright Auto Hub services','why-choose')}>Discover Bright Auto Hub <Icon name='arrow'/></Link>
        </div>
      </div>
      <div className='commercial-product-block' id='commercial-products'>
        <SectionHeading eyebrow='Built to move every business forward' title='Commercial Vehicles' link='View All Commercial Vehicles' to='/vehicles/commercial-vehicles' onPrevious={()=>scrollProductTrack(commercialTrackRef,-1)} onNext={()=>scrollProductTrack(commercialTrackRef,1)}/>
        <div className='trending-vehicle-grid commercial-product-grid home-product-scroll-track' ref={commercialTrackRef}>{commercialProducts.map((item)=>
          <HomeVehicleCard item={item} group='commercial-vehicles' cardClassName='commercial-product-card' imageClassName='commercial-product-image' key={item.name}/>
        )}</div>
      </div>
      <div className='service-campaign-grid'>
        <article className='service-campaign-card service-booking-card'>
          <img src={homeServiceWorkshop} alt='Bright Auto Hub workshop technician servicing a white SUV' decoding='async'/>
          <div className='service-campaign-copy'>
            <p>Professional vehicle maintenance</p>
            <h2>Expert Service for<br/><span>Every Vehicle</span></h2>
            <ul><li>Multi-brand vehicle inspection</li><li>Skilled service technicians</li><li>Genuine parts and clear pricing</li></ul>
            <Link to={homeEnquiryLink('Vehicle service enquiry','Multi-brand vehicle maintenance and repair','service')}>Enquire Vehicle Service <Icon name='arrow'/></Link>
          </div>
        </article>
        <article className='service-campaign-card parts-care-card'>
          <img src={homePartsCareBanner} alt='Genuine vehicle tyres, engine oils, lubricants and spare parts' decoding='async'/>
          <div className='service-campaign-copy'>
            <p>Tyres, lubricants & components</p>
            <h2>Genuine Spare Parts<br/><span>for Safer Drives</span></h2>
            <ul><li>Quality tyres and alloy wheels</li><li>Trusted oils and lubricants</li><li>Essential service components</li></ul>
            <Link to={homeEnquiryLink('Spare parts enquiry','Tyres, lubricants and genuine vehicle spare parts','spare-parts')}>Find Spare Parts <Icon name='arrow'/></Link>
          </div>
        </article>
      </div>
    </section>
    <section className='content-section site-container construction-showcase' id='construction-showcase'><SectionHeading eyebrow='Explore powerful construction vehicles in India' title='Built for Bigger Projects' link='View All Construction Vehicles' to='/vehicles/construction-vehicles' onPrevious={()=>scrollProductTrack(constructionTrackRef,-1)} onNext={()=>scrollProductTrack(constructionTrackRef,1)}/><div className='ev-layout'><div className='trending-vehicle-grid construction-product-grid home-product-scroll-track' ref={constructionTrackRef}>
      {constructionProducts.map((item)=><HomeVehicleCard item={item} group='construction-vehicles' cardClassName={`construction-product-card tone-${item.tone}`} imageClassName='construction-product-image' key={item.id||item.name}/>)}
      </div>
      <aside className='electric-benefits construction-benefits construction-ad-card' aria-label='Advertisement space'>
        <small>ADVERTISEMENT</small>
        <span><Icon name='target'/></span>
        <h3>Place Your Ad Here</h3>
        <p>Reach vehicle buyers, fleet owners and businesses across India.</p>
        <Link className='outline-button' to={homeEnquiryLink('Advertisement enquiry','Home page construction catalogue advertisement','advertisement')}>For Advertisement Contact <Icon name='arrow'/></Link>
      </aside></div>
      <a className='construction-image-credit' href='/images/construction-vehicles/IMAGE-CREDITS.md' target='_blank' rel='noreferrer'>Construction vehicle image credits</a>
    </section>
    <section className='brand-showcase site-container' id='brands' aria-labelledby='top-brands-title'>
      <div className='brand-showcase-intro'>
        <p>Top <span>Brands</span></p>
        <h2 id='top-brands-title'>Explore vehicles from India&apos;s leading automobile brands</h2>
      </div>
      <div className='brand-marquee' aria-label='Popular vehicle brands'>
        <div className='brand-marquee-track'>
          {[0,1].map((groupIndex)=><div className='brand-marquee-group' aria-hidden={groupIndex===1} key={groupIndex}>
            {homeBrands.map(({name,mark,logoUrl})=><BrandLogoCard name={name} mark={mark} logoUrl={logoUrl} isClone={groupIndex===1} key={groupIndex+'-'+name}/>)}
          </div>)}
        </div>
      </div>
    </section>
    <section className='content-section site-container ev-car-product-showcase' id='electric-cars'>
      <SectionHeading eyebrow='Clean mobility for every journey' title='Electric Cars' link='View All Electric Cars' to='/vehicles/ev-vehicles/electric-cars' onPrevious={()=>scrollProductTrack(electricTrackRef,-1)} onNext={()=>scrollProductTrack(electricTrackRef,1)}/>
      <div className='trending-vehicle-grid ev-car-product-grid home-product-scroll-track' ref={electricTrackRef}>{electricCarProducts.map((item)=>
        <HomeVehicleCard item={item} group='ev-vehicles' cardClassName='ev-car-product-card' imageClassName='ev-car-product-image' key={item.name}/>
      )}</div>
    </section>
    <section className='home-care-promos ev-service-promo site-container' id='trusted-service-promo'>
      <article className='home-care-card service-card service-booking-banner'>
        <div className='service-booking-copy'>
          <p>EXPERT VEHICLE CARE</p>
          <h2>Book a Trusted Vehicle Service</h2>
          <span>Choose transparent service packages for every type of vehicle.</span>
          <div className='service-booking-benefits' aria-label='Vehicle service benefits'>
            <span><Icon name='shield'/> Verified workshops</span>
            <span><Icon name='tools'/> Skilled technicians</span>
            <span><Icon name='calendar'/> Easy scheduling</span>
          </div>
          <Link className='service-booking-cta' to='/services'><span>Explore Services</span><i><Icon name='arrow'/></i></Link>
        </div>
        <div className='service-booking-visual'>
          <img src={carSparePartsServiceBanner} alt='Professional vehicle service and maintenance' loading='lazy' decoding='async'/>
          <div className='service-booking-badge'><i><Icon name='shield'/></i><span><small>Complete care</small><strong>Multi-brand service</strong></span></div>
        </div>
      </article>
    </section>
    <section className='quick-access site-container' id='how-it-works'>
      <header className='quick-access-heading'><div><p>START YOUR JOURNEY</p><h2>Everything automotive, one smart starting point.</h2></div><span>Choose what you need and move forward with trusted support.</span></header>
      <div className='quick-grid'>
        {quick.map(([icon,eyebrow,title,copy,cta,url,tone],index)=><article className={`quick-card quick-card-${tone}`} key={title}>
          <div className='quick-card-top'><span className='quick-icon'><Icon name={icon}/></span><em>0{index+1}</em></div>
          <div className='quick-card-copy'><small>{eyebrow}</small><h3>{title}</h3><p>{copy}</p><Link to={url}>{cta} <span><Icon name='arrow'/></span></Link></div>
          <span className='quick-card-watermark' aria-hidden='true'><Icon name={icon}/></span>
        </article>)}
      </div>
    </section>
    <section className='content-section site-container bike-product-showcase' id='popular-bikes'>
      <SectionHeading eyebrow='Popular two wheelers for every ride' title='Bikes & Scooters' link='View All Bikes' to='/vehicles/bikes' onPrevious={()=>scrollProductTrack(bikeTrackRef,-1)} onNext={()=>scrollProductTrack(bikeTrackRef,1)}/>
      <div className='trending-vehicle-grid bike-product-grid home-product-scroll-track' ref={bikeTrackRef}>{bikeProducts.map((item)=>
        <HomeVehicleCard item={item} group='bikes' cardClassName='bike-product-card' imageClassName='bike-product-image' key={item.name}/>
      )}</div>
    </section>
    <section className='content-section site-container' id='business-vehicles-promo'>
      <article className='business-banner'>
        <div className='business-banner-copy'><p>Built for Business. Ready for Bharat.</p>
          <h2>Commercial vehicles that move every business forward.</h2>
          <span>Compare mini trucks, pickups, cargo carriers and heavy trucks built for Indian roads, reliable payloads and everyday business growth.</span>
          <Link to='/vehicles/commercial-vehicles'>Explore Commercial Vehicles <Icon name='arrow'/></Link>
        </div>
        <img className='business-banner-background' src={commercialTrucksFleetBanner} alt='Commercial trucks and business vehicle fleet on Indian roads' loading='lazy' decoding='async'/>
        <aside aria-label='Commercial vehicle advantages'>
          <span><Icon name='truck'/><b>Payload-ready range</b><small>Mini trucks to heavy carriers</small></span>
          <span><Icon name='shield'/><b>Trusted ownership</b><small>Finance and insurance assistance</small></span>
          <span><Icon name='tools'/><b>Business support</b><small>Service and parts guidance</small></span>
        </aside>
      </article>
    </section>
    <section className='content-section site-container' id='blog'><SectionHeading eyebrow='Expert insights, news and tips' title='Latest from Blog' link='View All Blogs'/><div className='blog-grid'>{homeBlogs.map(([title,tag,image,slug])=><article key={title}>
      <div><img src={image} alt={title}/><span>{tag}</span></div>
      <h3>{title}</h3><p>Helpful automobile insights from our experts.</p>
      <Link to={slug?`/blog/${slug}`:'/blog'}>Read Article <Icon name='arrow'/></Link>
    </article>)}</div></section>
    <section className='home-care-promos ev-highlight-promo site-container' id='home-care'>
      <article className='ev-highlight-banner'>
        <div className='ev-highlight-copy'>
          <p>ELECTRIC MOBILITY</p>
          <h2>Drive into a Cleaner Electric Future</h2>
          <span>Discover smart electric cars with practical driving range, connected technology and effortless everyday charging.</span>
          <div className='ev-banner-benefits' aria-label='Electric vehicle benefits'>
            <span><Icon name='bolt'/> Longer driving range</span>
            <span><Icon name='evcar'/> Zero tailpipe emissions</span>
            <span><Icon name='shield'/> Expert EV guidance</span>
          </div>
          <Link to='/vehicles/ev-vehicles/electric-cars'>Explore Electric Cars <Icon name='arrow'/></Link>
        </div>
        <div className='ev-highlight-visual'>
          <img src={evCarsBanner} alt='Electric cars for clean and sustainable mobility' loading='lazy' decoding='async'/>
          <div className='ev-highlight-badge'><Icon name='bolt'/><span><b>100% Electric</b><small>Ready for tomorrow</small></span></div>
        </div>
      </article>
    </section>
  </main>
  <section className='stats-strip site-container'>{[
    ['2M+','Happy Customers'],['1500+','Service Workshops'],['100K+','Spare Parts'],
    ['500+','Cars Covered'],['98%','Customer Satisfaction'],['24/7','Support Available'],
  ].map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
  <section className='final-cta' id='enquire'><div className='site-container'>
    <h2>Ready to Drive the Best Experience?</h2>
    <p>Join millions of satisfied customers who trust Bright Auto Hub.</p>
    <div><a className='red-button' href='#vehicles'>Explore Vehicles</a>
    <Link className='outline-button' to={homeEnquiryLink('Service enquiry','Vehicle service requirement','service')}>Enquire Service</Link></div>
  </div></section>
  <PublicFooter />
  </div>
}
export default Home
