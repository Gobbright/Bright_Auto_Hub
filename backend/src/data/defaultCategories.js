import { sparePartsTree } from './sparePartsCatalog.js'

export const defaultCategoryTree = [
  {
    name: 'Vehicles',
    children: [
      { name: 'Bikes', children: ['Bikes', 'Scooters', 'Electric Bikes', 'Electric Scooters'] },
      { name: 'Cars', children: ['Hatchback', 'Sedan', 'SUV', 'MUV / MPV', 'Luxury Cars', 'Electric Cars'] },
      {
        name: 'EV Vehicles',
        children: [
          'Electric Bikes', 'Electric Scooters', 'Electric Cars', 'Electric 3 Wheelers',
          'Electric Auto Rickshaws', 'Electric Commercial Vehicles', 'Electric Trucks',
          'Electric Buses', 'Electric Vans', 'Electric Utility Vehicles',
        ],
      },
      {
        name: 'Commercial Vehicles',
        children: ['Trucks', 'Mini Trucks', 'Pickup Vehicles', 'Buses', 'Vans', 'Tempo Travellers', '3 Wheelers'],
      },
      { name: 'Farm Vehicles', children: ['Tractors', 'Mini Tractors', 'Farm Equipment'] },
      {
        name: 'Construction Vehicles',
        children: ['JCB', 'Excavators', 'Backhoe Loaders', 'Wheel Loaders', 'Cranes', 'Construction Equipment'],
      },
    ],
  },
  {
    name: 'Pre-Owned Vehicles',
    children: ['Pre-Owned Cars', 'Pre-Owned Bikes', 'Pre-Owned Commercial Vehicles', 'Pre-Owned Trucks', 'Pre-Owned Tractors', 'Pre-Owned Construction Equipment'],
  },
  {
    name: 'Sell Vehicle',
    children: ['Sell Car', 'Sell Bike', 'Sell Commercial Vehicle', 'Sell Truck', 'Sell Tractor', 'Sell Construction Equipment'],
  },
  {
    name: 'Exchange',
    children: ['Exchange Car', 'Exchange Bike', 'Exchange Commercial Vehicle', 'Exchange Tractor', 'Exchange JCB', 'Get Exchange Value'],
  },
  {
    name: 'Compare',
    children: [
      'Compare Bikes', 'Compare Scooters', 'Compare Electric Bikes', 'Compare Cars', 'Compare Electric Cars',
      'Compare Commercial Vehicles', 'Compare Trucks', 'Compare Mini Trucks', 'Compare Pickup Vehicles',
      'Compare Buses', 'Compare 3 Wheelers', 'Compare Tractors', 'Compare Farm Equipment', 'Compare JCB',
      'Compare Construction Equipment',
    ],
  },
  {
    name: 'Spare Parts',
    description: 'Vehicle-specific genuine spare parts and fitment support.',
    icon: '/images/spare-parts-catalog/brake-system-spare-parts.jpg',
    children: sparePartsTree,
  },
  {
    name: 'Services',
    children: [
      'Bike Service', 'Car Service', 'Commercial Vehicle Service', 'Truck Service', 'Tractor Service', 'JCB Service',
      'General Service', 'Engine Repair', 'Brake Service', 'Clutch Service', 'Suspension Service', 'AC Service',
      'Electrical Repair', 'Battery Service', 'Wheel Alignment', 'Wheel Balancing', 'Oil Change',
      'Periodic Maintenance', 'Breakdown Assistance',
    ],
  },
  {
    name: 'Tools & Calculators',
    children: ['EMI Calculator', 'Vehicle Loan Calculator', 'Fuel Cost Calculator', 'Mileage Calculator', 'EV Running Cost Calculator', 'On-Road Price Calculator', 'Vehicle Valuation', 'Exchange Value Calculator'],
  },
  {
    name: 'Finance & Insurance',
    children: ['Vehicle Loan', 'Car Loan', 'Bike Loan', 'Commercial Vehicle Loan', 'Tractor Loan', 'Vehicle Insurance', 'Insurance Renewal'],
  },
  {
    name: 'Dealers & Locations',
    children: ['Find Vehicle Dealers', 'Find Spare Part Dealers', 'Find Service Centers', 'Find Nearby Locations'],
  },
]
