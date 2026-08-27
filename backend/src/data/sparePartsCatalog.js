const imageRoot = '/images/spare-parts-catalog'

const images = {
  motorcycle: `${imageRoot}/motorcycle-engine-parts.jpg`,
  scooter: `${imageRoot}/scooter-performance-parts.jpg`,
  workshop: `${imageRoot}/automotive-workshop-parts.jpg`,
  diagnostics: `${imageRoot}/vehicle-engine-diagnostics-parts.jpg`,
  brake: `${imageRoot}/brake-system-spare-parts.jpg`,
  maintenance: `${imageRoot}/preventive-maintenance-parts.jpg`,
  center: `${imageRoot}/vehicle-service-center-parts.jpg`,
  roadside: `${imageRoot}/automotive-roadside-parts.jpg`,
  wheel: `${imageRoot}/car-alloy-wheel-parts.jpg`,
  tyre: `${imageRoot}/vehicle-tyre-replacement-parts.jpg`,
  evPlug: `${imageRoot}/ev-charging-connector-parts.jpg`,
  evCar: `${imageRoot}/electric-car-charging-parts.jpg`,
  tractor: `${imageRoot}/tractor-wheel-spare-parts.jpg`,
  loader: `${imageRoot}/construction-loader-spare-parts.jpg`,
}

const group = (name, description, icon, children) => ({
  name,
  description,
  icon,
  children: children.map(([childName, childDescription, childIcon]) => ({
    name: childName,
    description: childDescription,
    icon: childIcon,
  })),
})

export const sparePartsTree = [
  group('Two Wheeler Parts', 'Parts for motorcycles, scooters and electric two wheelers.', images.motorcycle, [
    ['Bike Parts', 'Engine, transmission and everyday motorcycle replacement parts.', images.motorcycle],
    ['Scooter Parts', 'CVT, body and service parts for petrol scooters.', images.scooter],
    ['Electric Bike Parts', 'Motor, controller and battery parts for electric bikes.', images.evPlug],
    ['Electric Scooter Parts', 'Electrical and mechanical parts for electric scooters.', images.evCar],
  ]),
  group('Car Parts', 'Genuine-fit parts for every major passenger car segment.', images.wheel, [
    ['Hatchback Parts', 'Compact car filters, brakes, lamps and service components.', images.maintenance],
    ['Sedan Parts', 'Comfort, braking and powertrain components for sedans.', images.brake],
    ['SUV Parts', 'Heavy-duty suspension, tyre and drivetrain components for SUVs.', images.tyre],
    ['MUV / MPV Parts', 'Reliable people-mover clutch, brake and cabin components.', images.center],
    ['Luxury Car Parts', 'Premium electronic, lighting and performance components.', images.diagnostics],
    ['Electric Car Parts', 'Charging, battery and electric drivetrain components.', images.evCar],
  ]),
  group('Commercial Vehicle Parts', 'Dependable parts for goods and passenger transport vehicles.', images.workshop, [
    ['Truck Parts', 'Heavy-duty engine, brake and filtration parts for trucks.', images.workshop],
    ['Mini Truck Parts', 'Drivetrain and maintenance parts for compact cargo vehicles.', images.diagnostics],
    ['Pickup Vehicle Parts', 'Suspension, body and utility parts for pickup vehicles.', images.tyre],
    ['Bus Parts', 'Braking, lighting and cabin parts for buses.', images.brake],
    ['Van Parts', 'Door, engine and service components for vans.', images.center],
    ['Tempo Traveller Parts', 'Touring van wheel, brake and comfort components.', images.roadside],
    ['3 Wheeler Parts', 'Powertrain and service parts for three wheelers.', images.scooter],
  ]),
  group('Construction Equipment Parts', 'Worksite-ready components for heavy construction machinery.', images.loader, [
    ['JCB / Backhoe Loader Parts', 'Hydraulic and digging components for backhoe loaders.', images.loader],
    ['Excavator Parts', 'Bucket, track and hydraulic replacement components.', images.workshop],
    ['Crane Parts', 'Lifting, cable and pulley components for cranes.', images.diagnostics],
    ['Road Roller Parts', 'Vibration, drum and steering parts for road rollers.', images.tyre],
    ['Concrete Mixer Parts', 'Drum, gear and drive components for concrete mixers.', images.maintenance],
    ['Loader Parts', 'Hydraulic, bucket and drivetrain components for loaders.', images.loader],
  ]),
  group('EV Vehicle Parts', 'High-voltage and electric drivetrain parts across EV segments.', images.evPlug, [
    ['Electric Bike Parts', 'Battery, controller and motor parts for electric bikes.', images.motorcycle],
    ['Electric Scooter Parts', 'Hub motor, brake and charging parts for e-scooters.', images.scooter],
    ['Electric Car Parts', 'Battery, charging and power electronics for electric cars.', images.evCar],
    ['Electric 3 Wheeler Parts', 'Controller and drivetrain parts for electric three wheelers.', images.evPlug],
    ['Electric Commercial Vehicle Parts', 'Heavy-duty EV charging and power conversion parts.', images.diagnostics],
    ['EV Charging Parts', 'Connectors, cables and charging station components.', images.evPlug],
  ]),
  group('Farm Vehicle Parts', 'Durable parts for tractors and agricultural machinery.', images.tractor, [
    ['Tractor Parts', 'Hydraulic, engine and transmission components for tractors.', images.tractor],
    ['Mini Tractor Parts', 'Compact tractor filters, clutch and service parts.', images.maintenance],
    ['Power Tiller Parts', 'Tines, belts and drive components for power tillers.', images.workshop],
    ['Harvester Parts', 'Cutting, threshing and drive components for harvesters.', images.loader],
    ['Farm Implement Parts', 'PTO and linkage components for farm implements.', images.diagnostics],
    ['Agricultural Trailer Parts', 'Hub, axle and braking parts for agricultural trailers.', images.tyre],
  ]),
]

const products = {
  'Bike Parts': ['Performance Bike Chain and Sprocket Kit', 2899],
  'Scooter Parts': ['Scooter CVT Drive Belt Kit', 1450],
  'Electric Bike Parts': ['Electric Bike Motor Controller Kit', 4850],
  'Electric Scooter Parts': ['Electric Scooter Hub Motor Service Kit', 6250],
  'Hatchback Parts': ['Hatchback Cabin Filter Set', 780],
  'Sedan Parts': ['Sedan Premium Brake Pad Set', 2450],
  'SUV Parts': ['SUV Heavy Duty Suspension Kit', 8950],
  'MUV / MPV Parts': ['MUV MPV Clutch Assembly Kit', 6750],
  'Luxury Car Parts': ['Luxury Car LED Headlight Module', 12450],
  'Electric Car Parts': ['Electric Car Charging Port Assembly', 18900],
  'Truck Parts': ['Heavy Duty Truck Air Filter', 3650],
  'Mini Truck Parts': ['Mini Truck Clutch Plate Kit', 4250],
  'Pickup Vehicle Parts': ['Pickup Vehicle Shock Absorber', 5890],
  'Bus Parts': ['Bus Brake Lining Set', 4650],
  'Van Parts': ['Van Sliding Door Roller Kit', 2250],
  'Tempo Traveller Parts': ['Tempo Traveller Wheel Bearing', 3150],
  '3 Wheeler Parts': ['Three Wheeler Drive Shaft Kit', 3850],
  'JCB / Backhoe Loader Parts': ['Backhoe Loader Hydraulic Seal Kit', 7250],
  'Excavator Parts': ['Excavator Bucket Tooth Set', 9850],
  'Crane Parts': ['Crane Wire Rope Pulley Kit', 11450],
  'Road Roller Parts': ['Road Roller Vibration Bearing', 8450],
  'Concrete Mixer Parts': ['Concrete Mixer Drum Gear', 6350],
  'Loader Parts': ['Wheel Loader Hydraulic Filter', 4550],
  'Electric 3 Wheeler Parts': ['Electric Three Wheeler Controller', 8950],
  'Electric Commercial Vehicle Parts': ['Commercial EV DC Converter', 24500],
  'EV Charging Parts': ['Type 2 EV Charging Connector', 16500],
  'Tractor Parts': ['Tractor Hydraulic Pump', 7850],
  'Mini Tractor Parts': ['Mini Tractor Fuel Filter Kit', 1250],
  'Power Tiller Parts': ['Power Tiller Tine Blade Set', 3250],
  'Harvester Parts': ['Harvester Cutter Bar Blade', 6850],
  'Farm Implement Parts': ['Farm Implement PTO Shaft', 9450],
  'Agricultural Trailer Parts': ['Agricultural Trailer Hub Assembly', 5250],
}

const sparePartBrandByKeyword = [
  [/brake|disc|rotor|lining/i, 'Brembo'],
  [/filter|air filter|fuel filter|cabin/i, 'MANN-FILTER'],
  [/clutch|belt/i, 'LuK'],
  [/shock|suspension|strut|control arm/i, 'KYB'],
  [/bearing|hub|roller/i, 'SKF'],
  [/lamp|headlight|tail|sensor/i, 'Hella'],
  [/spark|plug/i, 'NGK'],
  [/battery|charger|charging|controller|converter|motor/i, 'DENSO'],
  [/tyre|tire/i, 'MRF'],
  [/oil|lubricant/i, 'Castrol'],
  [/hydraulic|loader|excavator|tractor|pump/i, 'Bosch'],
]
const sparePartBrandFor = (name) => sparePartBrandByKeyword.find(([matcher]) => matcher.test(name))?.[1] || 'Bosch'
export const sparePartSeeds = sparePartsTree.flatMap((parent, parentIndex) =>
  parent.children.map((category, childIndex) => {
    const [name, price] = products[category.name]
    return {
      name,
      category: category.name,
      categoryGroup: parent.name,
      partNumber: `BAH-${String(parentIndex + 1).padStart(2, '0')}-${String(childIndex + 1).padStart(2, '0')}`,
      brand: sparePartBrandFor(name),
      price,
      originalPrice: Math.round(price * 1.16),
      stock: 12 + ((parentIndex * 7 + childIndex * 5) % 29),
      compatibleVehicleTypes: [parent.name.replace(' Parts', '')],
      imageUrl: category.icon,
      description: category.description,
      status: 'active',
      featured: childIndex === 0,
    }
  }),
)

export const sparePartsImageRoot = imageRoot
